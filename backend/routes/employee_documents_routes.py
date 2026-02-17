"""
ManoProtect - Employee Documents Management API
Sistema de gestión de documentos de empleados
"""
from fastapi import APIRouter, HTTPException, Request, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import base64
import io

router = APIRouter(prefix="/enterprise/documents", tags=["Employee Documents"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Employee Documents DB initialized: {db is not None}")

# ============================================
# UTILITY FUNCTIONS
# ============================================

def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

async def get_current_employee(request: Request):
    """Get current logged in employee from session"""
    token = request.cookies.get("enterprise_session")
    if not token:
        token = request.headers.get("X-Session-Token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": token},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee

def is_admin(employee: dict) -> bool:
    """Check if employee is admin or super_admin"""
    return employee.get("role") in ["super_admin", "admin", "ceo"]

async def create_notification(employee_id: str, type: str, title: str, message: str, reference_type: str = None, reference_id: str = None):
    """Create a notification for an employee"""
    notification = {
        "notification_id": generate_id("notif_"),
        "employee_id": employee_id,
        "type": type,
        "title": title,
        "message": message,
        "is_read": False,
        "reference_type": reference_type,
        "reference_id": reference_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.employee_notifications.insert_one(notification)
    return notification

# ============================================
# ENDPOINTS
# ============================================

@router.get("")
async def get_documents(
    request: Request,
    employee_id: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = Query(50, le=100),
    skip: int = 0
):
    """Get documents - employees see their own visible docs, admins see all"""
    current_employee = await get_current_employee(request)
    
    query = {}
    
    # Non-admins can only see their own visible documents
    if not is_admin(current_employee):
        query["employee_id"] = current_employee["employee_id"]
        query["is_visible_to_employee"] = True
    elif employee_id:
        query["employee_id"] = employee_id
    
    if type:
        query["type"] = type
    
    cursor = db.employee_documents.find(query, {"_id": 0, "file_data": 0}).sort("created_at", -1).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    total = await db.employee_documents.count_documents(query)
    
    return {
        "documents": documents,
        "total": total
    }

@router.get("/{document_id}")
async def get_document_detail(document_id: str, request: Request):
    """Get document detail"""
    current_employee = await get_current_employee(request)
    
    doc = await db.employee_documents.find_one(
        {"document_id": document_id},
        {"_id": 0, "file_data": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Non-admins can only see their own visible documents
    if not is_admin(current_employee):
        if doc["employee_id"] != current_employee["employee_id"] or not doc.get("is_visible_to_employee", True):
            raise HTTPException(status_code=403, detail="No autorizado")
    
    return doc

@router.get("/{document_id}/download")
async def download_document(document_id: str, request: Request):
    """Download document file"""
    current_employee = await get_current_employee(request)
    
    doc = await db.employee_documents.find_one({"document_id": document_id})
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Non-admins can only download their own visible documents
    if not is_admin(current_employee):
        if doc["employee_id"] != current_employee["employee_id"] or not doc.get("is_visible_to_employee", True):
            raise HTTPException(status_code=403, detail="No autorizado")
    
    # Check if file data exists
    file_data = doc.get("file_data")
    if not file_data:
        raise HTTPException(status_code=404, detail="Archivo no disponible")
    
    # Decode base64 and return file
    try:
        file_bytes = base64.b64decode(file_data)
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=doc.get("mime_type", "application/octet-stream"),
            headers={
                "Content-Disposition": f"attachment; filename={doc.get('file_name', 'documento')}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar archivo: {str(e)}")

@router.post("")
async def upload_document(
    request: Request,
    employee_id: str = Form(...),
    type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    is_visible_to_employee: bool = Form(True),
    file: UploadFile = File(...)
):
    """Upload a document (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden subir documentos")
    
    # Check if employee exists
    target_employee = await db.enterprise_employees.find_one(
        {"employee_id": employee_id},
        {"_id": 0, "name": 1, "email": 1}
    )
    if not target_employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Read and encode file
    file_content = await file.read()
    file_base64 = base64.b64encode(file_content).decode()
    
    # Determine mime type
    extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    mime_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'txt': 'text/plain'
    }
    mime_type = mime_types.get(extension, 'application/octet-stream')
    
    # Create document record
    doc = {
        "document_id": generate_id("doc_"),
        "employee_id": employee_id,
        "type": type,
        "title": title,
        "description": description,
        "file_name": file.filename,
        "file_size": len(file_content),
        "mime_type": mime_type,
        "file_data": file_base64,
        "uploaded_by": current_employee["employee_id"],
        "is_visible_to_employee": is_visible_to_employee,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.employee_documents.insert_one(doc)
    
    # Create notification if visible to employee
    if is_visible_to_employee:
        await create_notification(
            employee_id=employee_id,
            type="document_uploaded",
            title="Nuevo documento disponible",
            message=f"Se ha subido un nuevo documento: {title}",
            reference_type="document",
            reference_id=doc["document_id"]
        )
    
    # Return without file_data
    doc.pop("file_data", None)
    doc.pop("_id", None)
    
    return {
        "success": True,
        "document_id": doc["document_id"],
        "document": doc
    }

@router.patch("/{document_id}")
async def update_document(
    document_id: str,
    request: Request,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_visible_to_employee: Optional[bool] = Form(None)
):
    """Update document metadata (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden editar documentos")
    
    doc = await db.employee_documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if title is not None:
        update["title"] = title
    if description is not None:
        update["description"] = description
    if is_visible_to_employee is not None:
        update["is_visible_to_employee"] = is_visible_to_employee
    
    await db.employee_documents.update_one(
        {"document_id": document_id},
        {"$set": update}
    )
    
    return {"success": True, "message": "Documento actualizado"}

@router.delete("/{document_id}")
async def delete_document(document_id: str, request: Request):
    """Delete a document (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar documentos")
    
    result = await db.employee_documents.delete_one({"document_id": document_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    return {"success": True, "message": "Documento eliminado"}
