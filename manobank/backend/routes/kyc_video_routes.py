"""
KYC Video Verification Routes
Handles the complete KYC verification flow with browser-based video calls
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid

from core.auth import require_auth
from services.zoom_video_sdk import (
    create_kyc_session,
    generate_agent_token,
    is_zoom_configured,
    get_zoom_config_status
)

router = APIRouter(prefix="/kyc", tags=["KYC Video Verification"])

_db = None

def init_kyc_routes(database):
    global _db
    _db = database

def get_db():
    return _db


# ============================================
# PYDANTIC MODELS
# ============================================

class CustomerKYCRequest(BaseModel):
    """Request model for customer initiating KYC"""
    request_id: str  # Account opening request ID
    customer_name: str
    customer_dni: str
    customer_phone: str


class AgentJoinRequest(BaseModel):
    """Request model for agent joining KYC session"""
    session_id: str


class KYCVerificationResult(BaseModel):
    """Model for completing KYC verification"""
    session_id: str
    verification_status: str  # approved, rejected, pending_documents
    identity_verified: bool
    document_type: str  # DNI, Pasaporte, NIE
    document_number: str
    document_matches_data: bool
    face_matches_document: bool
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None


# ============================================
# CUSTOMER ENDPOINTS (Public - for account request flow)
# ============================================

@router.get("/config-status")
async def get_config_status():
    """Check if Zoom Video SDK is configured"""
    return get_zoom_config_status()


@router.post("/customer/initiate")
async def customer_initiate_kyc(data: CustomerKYCRequest):
    """
    Customer initiates KYC video verification session
    Called after customer fills account opening form
    """
    db = get_db()
    
    # Check Zoom is configured
    if not is_zoom_configured():
        raise HTTPException(
            status_code=503,
            detail="El sistema de videoverificación no está configurado. Por favor, contacte con el banco."
        )
    
    # Verify request exists
    acc_request = await db.manobank_account_requests.find_one({"id": data.request_id})
    if not acc_request:
        raise HTTPException(status_code=404, detail="Solicitud de cuenta no encontrada")
    
    # Check if KYC session already exists for this request
    existing_session = await db.kyc_video_sessions.find_one({
        "request_id": data.request_id,
        "status": {"$nin": ["completed", "failed", "expired"]}
    })
    
    if existing_session:
        # Return existing session
        return {
            "session_id": existing_session["session_id"],
            "session_name": existing_session["session_name"],
            "customer_token": existing_session["customer_token"],
            "status": existing_session["status"],
            "message": "Sesión de verificación existente recuperada"
        }
    
    # Create new KYC session
    customer_id = f"cust_temp_{data.request_id}"
    session_data = create_kyc_session(
        customer_id=customer_id,
        customer_name=data.customer_name,
        request_id=data.request_id
    )
    
    # Store session in database
    kyc_session = {
        "id": session_data["session_id"],
        "session_id": session_data["session_id"],
        "session_name": session_data["session_name"],
        "request_id": data.request_id,
        "customer_id": customer_id,
        "customer_name": data.customer_name,
        "customer_dni": data.customer_dni,
        "customer_phone": data.customer_phone,
        "customer_token": session_data["customer_token"],
        "status": "waiting_customer",  # waiting_customer -> customer_joined -> agent_joined -> in_progress -> completed/failed
        "created_at": datetime.now(timezone.utc).isoformat(),
        "customer_joined_at": None,
        "agent_joined_at": None,
        "started_at": None,
        "ended_at": None,
        "verification_result": None,
        "agent_id": None,
        "agent_name": None
    }
    
    await db.kyc_video_sessions.insert_one(kyc_session)
    
    # Update account request status
    await db.manobank_account_requests.update_one(
        {"id": data.request_id},
        {"$set": {
            "status": "kyc_video_pending",
            "kyc_session_id": session_data["session_id"],
            "kyc_session_created_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "session_id": session_data["session_id"],
        "session_name": session_data["session_name"],
        "customer_token": session_data["customer_token"],
        "status": "waiting_customer",
        "message": "Sesión de videoverificación creada. Por favor, acepte los permisos de cámara y micrófono."
    }


@router.post("/customer/joined/{session_id}")
async def customer_joined_session(session_id: str):
    """Mark that customer has joined the video session"""
    db = get_db()
    
    result = await db.kyc_video_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": "customer_joined",
            "customer_joined_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return {"message": "Esperando a un agente del banco..."}


@router.get("/customer/session-status/{session_id}")
async def get_customer_session_status(session_id: str):
    """Get session status for customer (polling endpoint)"""
    db = get_db()
    
    session = await db.kyc_video_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0, "customer_token": 0}  # Don't expose token again
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    return {
        "status": session.get("status"),
        "agent_joined": session.get("status") in ["agent_joined", "in_progress"],
        "agent_name": session.get("agent_name"),
        "verification_result": session.get("verification_result")
    }


# ============================================
# AGENT/EMPLOYEE ENDPOINTS (Authenticated)
# ============================================

async def require_bank_employee(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require user to be a bank employee"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    employee = await db.manobank_employees.find_one(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    )
    
    if not employee:
        if getattr(user, "role", "") == "superadmin":
            return user, {"role": "director", "is_superadmin": True, "name": user.name}
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo empleados del banco.")
    
    return user, employee


@router.get("/agent/pending-sessions")
async def get_pending_kyc_sessions(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all pending KYC sessions waiting for agent"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get sessions where customer has joined and waiting for agent
    sessions = await db.kyc_video_sessions.find(
        {"status": {"$in": ["waiting_customer", "customer_joined"]}},
        {"_id": 0, "customer_token": 0}  # Don't expose customer tokens
    ).sort("created_at", -1).to_list(50)
    
    return {"pending_sessions": sessions}


@router.post("/agent/join")
async def agent_join_kyc_session(
    data: AgentJoinRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Agent joins a KYC video session"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Check Zoom is configured
    if not is_zoom_configured():
        raise HTTPException(
            status_code=503,
            detail="El sistema de videoverificación no está configurado."
        )
    
    # Get session
    session = await db.kyc_video_sessions.find_one({"session_id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    if session.get("status") in ["completed", "failed", "expired"]:
        raise HTTPException(status_code=400, detail="Esta sesión ya ha finalizado")
    
    # Generate agent token
    agent_token = generate_agent_token(
        session_name=session["session_name"],
        agent_id=user.user_id,
        agent_name=employee.get("name", user.name)
    )
    
    # Update session
    await db.kyc_video_sessions.update_one(
        {"session_id": data.session_id},
        {"$set": {
            "status": "agent_joined",
            "agent_id": user.user_id,
            "agent_name": employee.get("name", user.name),
            "agent_joined_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Get customer data for verification
    acc_request = await db.manobank_account_requests.find_one(
        {"id": session["request_id"]},
        {"_id": 0}
    )
    
    return {
        "session_id": data.session_id,
        "session_name": session["session_name"],
        "agent_token": agent_token,
        "customer_data": {
            "name": session.get("customer_name"),
            "dni": session.get("customer_dni"),
            "phone": session.get("customer_phone"),
            "request_data": acc_request
        },
        "message": "Conectando a la videollamada..."
    }


@router.post("/agent/start-verification/{session_id}")
async def start_verification(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark verification as in progress"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    result = await db.kyc_video_sessions.update_one(
        {"session_id": session_id, "agent_id": user.user_id},
        {"$set": {
            "status": "in_progress",
            "started_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sesión no encontrada o no autorizado")
    
    return {"message": "Verificación en progreso"}


@router.post("/agent/complete-verification")
async def complete_kyc_verification(
    data: KYCVerificationResult,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Complete KYC verification and record result"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get session
    session = await db.kyc_video_sessions.find_one({"session_id": data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Check for existing customer with same DNI (fraud prevention)
    existing_customer = await db.manobank_customers.find_one({
        "dni": data.document_number,
        "status": {"$in": ["active", "blocked"]}
    })
    
    fraud_check = {
        "existing_customer_found": existing_customer is not None,
        "existing_customer_id": existing_customer["id"] if existing_customer else None,
        "existing_customer_status": existing_customer.get("status") if existing_customer else None
    }
    
    # Prepare verification result
    verification_result = {
        "status": data.verification_status,
        "identity_verified": data.identity_verified,
        "document_type": data.document_type,
        "document_number": data.document_number,
        "document_matches_data": data.document_matches_data,
        "face_matches_document": data.face_matches_document,
        "notes": data.notes,
        "rejection_reason": data.rejection_reason,
        "fraud_check": fraud_check,
        "verified_by": user.user_id,
        "verified_by_name": employee.get("name", user.name),
        "verified_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Determine final status
    final_status = "completed" if data.verification_status == "approved" else "failed"
    if fraud_check["existing_customer_found"]:
        final_status = "failed"
        verification_result["rejection_reason"] = f"Cliente ya existe en el sistema (ID: {fraud_check['existing_customer_id']})"
        verification_result["status"] = "rejected"
    
    # Update session
    await db.kyc_video_sessions.update_one(
        {"session_id": data.session_id},
        {"$set": {
            "status": final_status,
            "verification_result": verification_result,
            "ended_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update account request based on result
    request_update = {
        "kyc_verified": verification_result["status"] == "approved",
        "kyc_verification_result": verification_result,
        "kyc_completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    if verification_result["status"] == "approved":
        request_update["status"] = "kyc_verified"
    else:
        request_update["status"] = "kyc_rejected"
        request_update["rejection_reason"] = verification_result.get("rejection_reason", "Verificación KYC rechazada")
    
    await db.manobank_account_requests.update_one(
        {"id": session["request_id"]},
        {"$set": request_update}
    )
    
    return {
        "message": "Verificación completada",
        "result": verification_result,
        "fraud_alert": fraud_check["existing_customer_found"],
        "session_status": final_status
    }


@router.post("/agent/end-session/{session_id}")
async def agent_end_session(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    reason: str = "agent_ended"
):
    """Agent ends the video session (disconnect call)"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    session = await db.kyc_video_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # If verification wasn't completed, mark as failed
    if session.get("status") != "completed":
        await db.kyc_video_sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "failed",
                "end_reason": reason,
                "ended_at": datetime.now(timezone.utc).isoformat(),
                "ended_by": user.user_id
            }}
        )
    
    return {"message": "Sesión finalizada"}


@router.get("/agent/session/{session_id}")
async def get_session_details(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get full session details for agent"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    session = await db.kyc_video_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Get account request data
    acc_request = await db.manobank_account_requests.find_one(
        {"id": session["request_id"]},
        {"_id": 0}
    )
    
    return {
        "session": session,
        "account_request": acc_request
    }
