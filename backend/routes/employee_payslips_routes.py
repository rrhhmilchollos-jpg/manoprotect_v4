"""
ManoProtect - Employee Payslips Management API
Sistema de gestión de nóminas con subida y descarga de PDFs
"""
from fastapi import APIRouter, HTTPException, Request, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import base64
import io

router = APIRouter(prefix="/enterprise/payslips", tags=["Employee Payslips"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Employee Payslips DB initialized: {db is not None}")

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
async def get_payslips(
    request: Request,
    employee_id: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = Query(50, le=100),
    skip: int = 0
):
    """Get payslips - employees see their own, admins see all"""
    current_employee = await get_current_employee(request)
    
    query = {}
    
    # Non-admins can only see their own payslips
    if not is_admin(current_employee):
        query["employee_id"] = current_employee["employee_id"]
    elif employee_id:
        query["employee_id"] = employee_id
    
    if year:
        query["year"] = year
    
    cursor = db.payslips.find(query, {"_id": 0, "file_data": 0}).sort([("year", -1), ("month", -1)]).skip(skip).limit(limit)
    payslips = await cursor.to_list(length=limit)
    
    total = await db.payslips.count_documents(query)
    
    return {
        "payslips": payslips,
        "total": total
    }

@router.get("/{payslip_id}")
async def get_payslip_detail(payslip_id: str, request: Request):
    """Get payslip detail"""
    current_employee = await get_current_employee(request)
    
    payslip = await db.payslips.find_one(
        {"payslip_id": payslip_id},
        {"_id": 0, "file_data": 0}
    )
    
    if not payslip:
        raise HTTPException(status_code=404, detail="Nómina no encontrada")
    
    # Non-admins can only see their own
    if not is_admin(current_employee) and payslip["employee_id"] != current_employee["employee_id"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    return payslip

@router.get("/{payslip_id}/download")
async def download_payslip(payslip_id: str, request: Request):
    """Download payslip PDF"""
    current_employee = await get_current_employee(request)
    
    payslip = await db.payslips.find_one({"payslip_id": payslip_id})
    
    if not payslip:
        raise HTTPException(status_code=404, detail="Nómina no encontrada")
    
    # Non-admins can only download their own
    if not is_admin(current_employee) and payslip["employee_id"] != current_employee["employee_id"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Check if file data exists
    file_data = payslip.get("file_data")
    if not file_data:
        raise HTTPException(status_code=404, detail="Archivo no disponible")
    
    # Update download stats
    await db.payslips.update_one(
        {"payslip_id": payslip_id},
        {
            "$set": {"downloaded_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"download_count": 1}
        }
    )
    
    # Decode base64 and return file
    try:
        file_bytes = base64.b64decode(file_data)
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={payslip.get('file_name', 'nomina.pdf')}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar archivo: {str(e)}")

@router.post("")
async def upload_payslip(
    request: Request,
    employee_id: str = Form(...),
    year: int = Form(...),
    month: int = Form(...),
    gross_salary: float = Form(None),
    net_salary: float = Form(None),
    deductions: float = Form(None),
    file: UploadFile = File(...)
):
    """Upload a payslip PDF (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden subir nóminas")
    
    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    
    # Check if employee exists
    target_employee = await db.enterprise_employees.find_one(
        {"employee_id": employee_id},
        {"_id": 0, "name": 1, "email": 1}
    )
    if not target_employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Check for duplicate
    existing = await db.payslips.find_one({
        "employee_id": employee_id,
        "year": year,
        "month": month
    })
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe una nómina para {employee_id} en {month}/{year}"
        )
    
    # Read and encode file
    file_content = await file.read()
    file_base64 = base64.b64encode(file_content).decode()
    
    # Create payslip record
    payslip = {
        "payslip_id": generate_id("pay_"),
        "employee_id": employee_id,
        "employee_name": target_employee.get("name", ""),
        "year": year,
        "month": month,
        "period": f"{year}-{month:02d}",
        "gross_salary": gross_salary,
        "net_salary": net_salary,
        "deductions": deductions,
        "file_name": file.filename,
        "file_size": len(file_content),
        "file_data": file_base64,
        "uploaded_by": current_employee["employee_id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "download_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payslips.insert_one(payslip)
    
    # Create notification for employee
    month_names = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    await create_notification(
        employee_id=employee_id,
        type="new_payslip",
        title="Nueva nómina disponible",
        message=f"Tu nómina de {month_names[month]} {year} está disponible para descargar",
        reference_type="payslip",
        reference_id=payslip["payslip_id"]
    )
    
    # Return without file_data
    payslip.pop("file_data", None)
    payslip.pop("_id", None)
    
    return {
        "success": True,
        "payslip_id": payslip["payslip_id"],
        "payslip": payslip
    }

@router.post("/bulk-upload")
async def bulk_upload_payslips(
    request: Request,
    year: int = Form(...),
    month: int = Form(...),
    files: List[UploadFile] = File(...)
):
    """Bulk upload payslips (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden subir nóminas")
    
    results = {
        "success": True,
        "uploaded": 0,
        "failed": 0,
        "errors": []
    }
    
    for file in files:
        try:
            if not file.filename.lower().endswith('.pdf'):
                results["failed"] += 1
                results["errors"].append(f"{file.filename}: No es un PDF")
                continue
            
            # Try to extract employee_id from filename
            # Expected format: employee_id_period.pdf or email_period.pdf
            filename_parts = file.filename.replace('.pdf', '').split('_')
            employee_identifier = filename_parts[0] if filename_parts else None
            
            if not employee_identifier:
                results["failed"] += 1
                results["errors"].append(f"{file.filename}: No se pudo determinar el empleado")
                continue
            
            # Find employee by id or email
            target_employee = await db.enterprise_employees.find_one({
                "$or": [
                    {"employee_id": employee_identifier},
                    {"email": employee_identifier}
                ]
            })
            
            if not target_employee:
                results["failed"] += 1
                results["errors"].append(f"{file.filename}: Empleado no encontrado")
                continue
            
            # Check for duplicate
            existing = await db.payslips.find_one({
                "employee_id": target_employee["employee_id"],
                "year": year,
                "month": month
            })
            if existing:
                results["failed"] += 1
                results["errors"].append(f"{file.filename}: Ya existe nómina para este periodo")
                continue
            
            # Read and store
            file_content = await file.read()
            file_base64 = base64.b64encode(file_content).decode()
            
            payslip = {
                "payslip_id": generate_id("pay_"),
                "employee_id": target_employee["employee_id"],
                "employee_name": target_employee.get("name", ""),
                "year": year,
                "month": month,
                "period": f"{year}-{month:02d}",
                "file_name": file.filename,
                "file_size": len(file_content),
                "file_data": file_base64,
                "uploaded_by": current_employee["employee_id"],
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "download_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.payslips.insert_one(payslip)
            
            # Create notification
            month_names = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            await create_notification(
                employee_id=target_employee["employee_id"],
                type="new_payslip",
                title="Nueva nómina disponible",
                message=f"Tu nómina de {month_names[month]} {year} está disponible",
                reference_type="payslip",
                reference_id=payslip["payslip_id"]
            )
            
            results["uploaded"] += 1
            
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"{file.filename}: {str(e)}")
    
    return results

@router.delete("/{payslip_id}")
async def delete_payslip(payslip_id: str, request: Request):
    """Delete a payslip (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar nóminas")
    
    result = await db.payslips.delete_one({"payslip_id": payslip_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nómina no encontrada")
    
    return {"success": True, "message": "Nómina eliminada"}
