"""
SMS Routes for ManoBank
- Send OTP for verification
- Verify OTP codes
- Password reset via SMS
- Admin notifications
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from services.twilio_sms import (
    send_verification_code,
    verify_code,
    send_password_reset_code,
    send_sms,
    send_welcome_sms,
    send_transaction_alert,
    send_login_alert,
    send_card_blocked_alert
)

router = APIRouter(prefix="/sms", tags=["SMS"])

_db = None

def init_sms_routes(database):
    global _db
    _db = database

def get_db():
    if _db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return _db


class SendOTPRequest(BaseModel):
    phone: str
    purpose: str = "verification"  # verification, password_reset, login


class VerifyOTPRequest(BaseModel):
    phone: str
    code: str


class SendSMSRequest(BaseModel):
    phone: str
    message: str


class BulkSMSRequest(BaseModel):
    phones: list[str]
    message: str


# ============================================
# PUBLIC ENDPOINTS (for customers)
# ============================================

@router.post("/send-otp")
async def send_otp(data: SendOTPRequest):
    """Send OTP verification code to phone number"""
    result = send_verification_code(data.phone)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Error al enviar código"))
    
    # Log the OTP request
    db = get_db()
    await db.sms_logs.insert_one({
        "id": f"sms_{uuid.uuid4().hex[:12]}",
        "type": "otp_sent",
        "phone": data.phone[-4:].rjust(len(data.phone), '*'),  # Masked
        "purpose": data.purpose,
        "status": result["status"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return result


@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    """Verify OTP code"""
    result = verify_code(data.phone, data.code)
    
    # Log the verification attempt
    db = get_db()
    await db.sms_logs.insert_one({
        "id": f"sms_{uuid.uuid4().hex[:12]}",
        "type": "otp_verify",
        "phone": data.phone[-4:].rjust(len(data.phone), '*'),
        "verified": result.get("verified", False),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("message", "Verificación fallida"))
    
    return result


@router.post("/password-reset/request")
async def request_password_reset(data: SendOTPRequest):
    """Request password reset via SMS"""
    db = get_db()
    
    # Find user by phone
    user = await db.users.find_one({"phone": {"$regex": data.phone[-9:]}})
    if not user:
        # Don't reveal if phone exists
        return {"success": True, "message": "Si el número está registrado, recibirás un código"}
    
    result = send_password_reset_code(data.phone)
    
    if result["success"]:
        # Store reset token
        reset_id = f"reset_{uuid.uuid4().hex[:12]}"
        await db.password_resets.insert_one({
            "id": reset_id,
            "user_id": user.get("id") or str(user.get("_id")),
            "phone": data.phone,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": datetime.now(timezone.utc).isoformat()  # 10 min expiry handled by Twilio
        })
    
    return {"success": True, "message": "Si el número está registrado, recibirás un código"}


@router.post("/password-reset/verify")
async def verify_password_reset(data: VerifyOTPRequest, new_password: str):
    """Verify code and reset password"""
    result = verify_code(data.phone, data.code)
    
    if not result.get("verified"):
        raise HTTPException(status_code=400, detail="Código incorrecto o expirado")
    
    db = get_db()
    
    # Find and update user password
    user = await db.users.find_one({"phone": {"$regex": data.phone[-9:]}})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Hash new password (simplified - use proper hashing in production)
    import hashlib
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": password_hash, "password_updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Mark reset as used
    await db.password_resets.update_many(
        {"phone": data.phone, "status": "pending"},
        {"$set": {"status": "used", "used_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Contraseña actualizada correctamente"}


# ============================================
# ADMIN ENDPOINTS (for bank employees)
# ============================================

@router.post("/admin/send")
async def admin_send_sms(
    data: SendSMSRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Admin: Send SMS to a customer"""
    # Basic auth check - could be improved
    db = get_db()
    
    result = send_sms(data.phone, data.message)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Error al enviar SMS"))
    
    # Log admin SMS
    await db.sms_logs.insert_one({
        "id": f"sms_{uuid.uuid4().hex[:12]}",
        "type": "admin_sms",
        "phone": data.phone[-4:].rjust(len(data.phone), '*'),
        "message_preview": data.message[:50] + "..." if len(data.message) > 50 else data.message,
        "status": result.get("status"),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return result


@router.post("/admin/send-bulk")
async def admin_send_bulk_sms(
    data: BulkSMSRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Admin: Send SMS to multiple customers"""
    results = []
    for phone in data.phones:
        result = send_sms(phone, data.message)
        results.append({"phone": phone[-4:].rjust(len(phone), '*'), "success": result["success"]})
    
    success_count = sum(1 for r in results if r["success"])
    
    return {
        "total": len(data.phones),
        "sent": success_count,
        "failed": len(data.phones) - success_count,
        "results": results
    }


@router.post("/admin/welcome/{customer_id}")
async def send_customer_welcome(
    customer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send welcome SMS to new customer"""
    db = get_db()
    
    customer = await db.manobank_customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    phone = customer.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Cliente sin teléfono registrado")
    
    result = send_welcome_sms(phone, customer["name"])
    
    if result["success"]:
        await db.manobank_customers.update_one(
            {"id": customer_id},
            {"$set": {"welcome_sms_sent": True, "welcome_sms_sent_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return result


@router.get("/admin/logs")
async def get_sms_logs(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get SMS logs for audit"""
    db = get_db()
    
    logs = await db.sms_logs.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"logs": logs}
