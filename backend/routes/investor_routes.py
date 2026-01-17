"""
MANO - Investor Routes
Investor registration, approval, and document access
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from typing import Optional
from datetime import datetime, timezone
from pathlib import Path
import uuid

from models.all_schemas import User, InvestorRequest, InvestorRegisterRequest
from core.auth import require_admin, require_investor, hash_password

router = APIRouter(tags=["Investors"])

# Database reference
_db = None


def init_investor_routes(db):
    """Initialize routes with database connection"""
    global _db
    _db = db


# ============================================
# PUBLIC INVESTOR REGISTRATION
# ============================================

@router.post("/investors/register")
async def register_investor(data: InvestorRegisterRequest):
    """Register investor request - requires manual approval"""
    existing = await _db.investor_requests.find_one({"cif": data.cif.upper()}, {"_id": 0})
    if existing:
        if existing.get("status") == "approved":
            raise HTTPException(status_code=400, detail="Este CIF ya está registrado y aprobado")
        elif existing.get("status") == "pending":
            raise HTTPException(status_code=400, detail="Ya existe una solicitud pendiente para este CIF")
    
    investor_request = InvestorRequest(
        cif=data.cif,
        company_name=data.company_name,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        position=data.position,
        reason=data.reason
    )
    
    doc = investor_request.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await _db.investor_requests.insert_one(doc)
    
    return {
        "message": "Solicitud de acceso de inversor recibida",
        "request_id": investor_request.request_id,
        "status": "pending",
        "info": "Recibirá un email cuando su solicitud sea revisada (máximo 48 horas laborables)"
    }


@router.get("/investors/status/{cif}")
async def check_investor_status(cif: str):
    """Check investor request status by CIF"""
    request = await _db.investor_requests.find_one({"cif": cif.upper()}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="No se encontró solicitud con este CIF")
    
    return {
        "cif": request["cif"],
        "company_name": request["company_name"],
        "status": request["status"],
        "created_at": request["created_at"]
    }


# ============================================
# ADMIN INVESTOR MANAGEMENT
# ============================================

@router.get("/admin/investors")
async def list_investor_requests(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """List all investor requests (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if status:
        query["status"] = status
    
    requests = await _db.investor_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return requests


@router.post("/admin/investors/{request_id}/approve")
async def approve_investor(
    request_id: str,
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """Approve investor request and create account (admin only)"""
    admin = await require_admin(request, session_token)
    
    inv_request = await _db.investor_requests.find_one({"request_id": request_id}, {"_id": 0})
    if not inv_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if inv_request["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"La solicitud ya está {inv_request['status']}")
    
    existing_user = await _db.users.find_one({"email": inv_request["contact_email"]}, {"_id": 0})
    
    if existing_user:
        await _db.users.update_one(
            {"email": inv_request["contact_email"]},
            {"$set": {"role": "investor"}}
        )
        user_id = existing_user["user_id"]
    else:
        temp_password = f"MANO_{uuid.uuid4().hex[:8]}"
        user = User(
            email=inv_request["contact_email"],
            name=inv_request["contact_name"],
            auth_provider="email",
            password_hash=hash_password(temp_password),
            role="investor",
            phone=inv_request["contact_phone"]
        )
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await _db.users.insert_one(user_doc)
        user_id = user.user_id
    
    await _db.investor_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": "approved",
            "user_id": user_id,
            "reviewed_by": admin.user_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Inversor aprobado correctamente",
        "user_id": user_id,
        "email": inv_request["contact_email"]
    }


@router.post("/admin/investors/{request_id}/reject")
async def reject_investor(
    request_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Reject investor request (admin only)"""
    admin = await require_admin(request, session_token)
    
    inv_request = await _db.investor_requests.find_one({"request_id": request_id}, {"_id": 0})
    if not inv_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    await _db.investor_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": "rejected",
            "reviewed_by": admin.user_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Solicitud rechazada"}


# ============================================
# INVESTOR DOCUMENTS
# ============================================

@router.get("/investor/documents")
async def list_investor_documents(request: Request, session_token: Optional[str] = Cookie(None)):
    """List available documents for investors"""
    await require_investor(request, session_token)
    
    return {
        "documents": [
            {"id": "business-plan", "title": "Plan de Negocio 2025-2028", "pages": "15 páginas", "format": "PDF", "size": "54 KB"},
            {"id": "financial-model", "title": "Modelo Financiero Detallado", "pages": "8 páginas", "format": "PDF", "size": "42 KB"},
            {"id": "pitch-deck", "title": "Presentación para Inversores", "pages": "15 slides", "format": "PDF", "size": "39 KB"},
            {"id": "terms", "title": "Términos de Inversión", "pages": "5 páginas", "format": "PDF", "size": "37 KB"},
            {"id": "enterprise-plan", "title": "Plan Enterprise para Bancos", "pages": "12 páginas", "format": "PDF", "size": "48 KB"}
        ]
    }


@router.get("/investor/download/{doc_type}")
async def download_investor_document(
    doc_type: str,
    request: Request,
    format: str = "pdf",
    session_token: Optional[str] = Cookie(None)
):
    """Download document (investor only) - supports PDF and MD formats"""
    user = await require_investor(request, session_token)
    
    pdf_map = {
        "business-plan": "/app/docs/pdf/PLAN_DE_NEGOCIO.pdf",
        "financial-model": "/app/docs/pdf/MODELO_FINANCIERO.pdf",
        "pitch-deck": "/app/docs/pdf/PRESENTACION_INVERSORES.pdf",
        "terms": "/app/docs/pdf/TERMINOS_INVERSION.pdf",
        "enterprise-plan": "/app/docs/pdf/MANO_ENTERPRISE_BUSINESS_PLAN.pdf"
    }
    
    md_map = {
        "business-plan": "/app/docs/PLAN_DE_NEGOCIO.md",
        "financial-model": "/app/docs/MODELO_FINANCIERO.md",
        "pitch-deck": "/app/docs/PRESENTACION_INVERSORES.md",
        "terms": "/app/docs/TERMINOS_INVERSION.md",
        "enterprise-plan": "/app/docs/MANO_Enterprise_Business_Plan.md"
    }
    
    if format.lower() == "pdf":
        file_path = pdf_map.get(doc_type)
        media_type = "application/pdf"
        ext = "pdf"
    else:
        file_path = md_map.get(doc_type)
        media_type = "text/markdown"
        ext = "md"
    
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    await _db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": doc_type,
        "format": format,
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    if format.lower() == "pdf":
        with open(file_path, 'rb') as f:
            content = f.read()
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    
    filename = f"MANO_{doc_type.replace('-', '_')}_CONFIDENCIAL_2025.{ext}"
    
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/investor/download-all")
async def download_all_investor_documents(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Download all investor documents as ZIP (investor only)"""
    user = await require_investor(request, session_token)
    
    zip_path = "/app/MANO_Documentos_Inversores.zip"
    if not Path(zip_path).exists():
        raise HTTPException(status_code=404, detail="Archivo ZIP no encontrado")
    
    await _db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": "all-documents-zip",
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    with open(zip_path, 'rb') as f:
        content = f.read()
    
    return Response(
        content=content,
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="MANO_Documentos_Inversores_CONFIDENCIAL.zip"'
        }
    )
