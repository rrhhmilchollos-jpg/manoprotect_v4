"""
MANO - Investor Routes
Handles investor registration, approval, and document access
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone

from core.config import db, require_admin, require_investor
from models.schemas import InvestorRequest, InvestorRegisterRequest

router = APIRouter(tags=["Investors"])


@router.post("/investors/register")
async def register_investor(data: InvestorRegisterRequest):
    """Register new investor request"""
    existing = await db.investor_requests.find_one({"cif": data.cif})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una solicitud con este CIF")
    
    investor = InvestorRequest(
        cif=data.cif,
        company_name=data.company_name,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        position=data.position,
        reason=data.reason
    )
    
    investor_doc = investor.model_dump()
    investor_doc['created_at'] = investor_doc['created_at'].isoformat()
    await db.investor_requests.insert_one(investor_doc)
    
    return {
        "message": "Solicitud enviada correctamente",
        "request_id": investor.request_id,
        "status": "pending"
    }


@router.get("/investors/status/{cif}")
async def check_investor_status(cif: str):
    """Check investor request status by CIF"""
    request = await db.investor_requests.find_one({"cif": cif.upper()}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="No se encontró solicitud con ese CIF")
    
    return {
        "cif": request["cif"],
        "company_name": request["company_name"],
        "status": request["status"],
        "created_at": request["created_at"]
    }


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
    
    requests = await db.investor_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return requests


@router.post("/admin/investors/{request_id}/approve")
async def approve_investor(
    request_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Approve investor request and create investor account"""
    admin = await require_admin(request, session_token)
    
    inv_request = await db.investor_requests.find_one({"request_id": request_id})
    if not inv_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if inv_request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue procesada")
    
    existing_user = await db.users.find_one({"email": inv_request["contact_email"]})
    
    if existing_user:
        await db.users.update_one(
            {"email": inv_request["contact_email"]},
            {"$set": {"role": "investor"}}
        )
        user_id = existing_user["user_id"]
    else:
        from models.schemas import User
        import uuid
        temp_password = f"temp_{uuid.uuid4().hex[:8]}"
        from core.config import hash_password
        
        new_user = User(
            email=inv_request["contact_email"],
            name=inv_request["contact_name"],
            role="investor",
            password_hash=hash_password(temp_password)
        )
        user_doc = new_user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.users.insert_one(user_doc)
        user_id = new_user.user_id
    
    await db.investor_requests.update_one(
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
        "request_id": request_id,
        "user_id": user_id
    }


@router.post("/admin/investors/{request_id}/reject")
async def reject_investor(
    request_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Reject investor request"""
    admin = await require_admin(request, session_token)
    
    inv_request = await db.investor_requests.find_one({"request_id": request_id})
    if not inv_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    await db.investor_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": "rejected",
            "reviewed_by": admin.user_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Solicitud rechazada", "request_id": request_id}


@router.get("/investor/documents")
async def list_investor_documents(request: Request, session_token: Optional[str] = Cookie(None)):
    """List available documents for investors"""
    await require_investor(request, session_token)
    
    documents = [
        {"id": "app-store-text", "title": "Texto App Store", "pages": "5 páginas"},
        {"id": "dossier-comercial", "title": "Dossier Comercial", "pages": "25 páginas"},
        {"id": "roadmap-tecnico", "title": "Roadmap Técnico", "pages": "30 páginas"},
        {"id": "presentacion-inversores", "title": "Presentación Inversores", "pages": "40 slides"},
        {"id": "modelo-financiero", "title": "Modelo Financiero", "pages": "35 páginas"},
        {"id": "business-plan", "title": "Plan de Negocio Completo", "pages": "120 páginas"},
    ]
    
    return documents
