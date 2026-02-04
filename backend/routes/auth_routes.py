"""
MANO - Authentication Routes
User registration, login, logout, and session management
With enhanced security features for ManoProtect
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import httpx

from models.all_schemas import User, UserRegister, UserLogin, SessionData
from core.auth import (
    hash_password, verify_password, generate_session_token,
    get_current_user
)
from services.security_service import (
    validate_password_strength,
    hash_password_secure,
    verify_password_secure,
    record_login_attempt,
    is_account_locked,
    get_failed_attempts,
    clear_failed_attempts,
    create_otp_session,
    verify_otp,
    log_security_event,
    SecurityEventTypes,
    generate_secure_session_token,
    create_secure_session,
    invalidate_all_user_sessions,
    is_suspicious_login,
    MAX_LOGIN_ATTEMPTS
)

router = APIRouter(tags=["Authentication"])

# Database reference - set during initialization
_db = None
_sms_configured = False


def init_auth_routes(db, sms_client=None):
    """Initialize routes with database connection"""
    global _db, _sms_configured
    _db = db
    # Check if Infobip is configured
    try:
        from services.infobip_sms import is_configured
        _sms_configured = is_configured()
    except:
        _sms_configured = False


def get_client_info(request: Request) -> tuple:
    """Extract client IP and user agent from request"""
    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    if "," in ip:
        ip = ip.split(",")[0].strip()
    user_agent = request.headers.get("User-Agent", "unknown")
    return ip, user_agent


# ============================================
# ENHANCED REGISTRATION WITH SECURITY
# ============================================

@router.post("/auth/register")
async def register_user(data: UserRegister, request: Request, response: Response):
    """Register new user with email/password - Enhanced security"""
    ip_address, user_agent = get_client_info(request)
    
    # Validate password strength
    password_check = validate_password_strength(data.password)
    if not password_check.is_valid:
        raise HTTPException(
            status_code=400, 
            detail={
                "message": "La contraseña no cumple los requisitos de seguridad",
                "feedback": password_check.feedback,
                "score": password_check.score
            }
        )
    
    existing = await _db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Use secure password hashing
    user = User(
        email=data.email,
        name=data.name,
        auth_provider="email",
        password_hash=hash_password_secure(data.password)
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['security_settings'] = {
        "two_factor_enabled": False,
        "login_notifications": True,
        "trusted_devices": []
    }
    await _db.users.insert_one(user_doc)
    
    # Create secure session
    session = await create_secure_session(user.user_id, ip_address, user_agent)
    
    # Log security event
    await log_security_event(
        SecurityEventTypes.SESSION_CREATED,
        user.user_id,
        user.email,
        ip_address,
        user_agent,
        {"registration": True}
    )
    
    response.set_cookie(
        key="session_token",
        value=session["session_token"],
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=24 * 60 * 60  # 24 hours for new registrations
    )
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "plan": user.plan
    }


# ============================================
# ENHANCED LOGIN WITH SECURITY
# ============================================

class SecureLoginRequest(BaseModel):
    email: str
    password: str
    remember_device: bool = False
    otp_code: Optional[str] = None

@router.post("/auth/login")
async def login_user(data: UserLogin, request: Request, response: Response):
    """Login with email/password - Enhanced with rate limiting and 2FA"""
    ip_address, user_agent = get_client_info(request)
    
    # Check if account is locked
    is_locked, minutes_remaining = await is_account_locked(data.email)
    if is_locked:
        await log_security_event(
            SecurityEventTypes.LOGIN_BLOCKED,
            None,
            data.email,
            ip_address,
            user_agent,
            {"reason": "account_locked", "minutes_remaining": minutes_remaining},
            severity="warning"
        )
        raise HTTPException(
            status_code=429, 
            detail=f"Cuenta bloqueada temporalmente. Intente de nuevo en {minutes_remaining} minutos."
        )
    
    user = await _db.users.find_one({"email": data.email}, {"_id": 0})
    
    # Debug logging
    if user:
        ph = user.get("password_hash") or ""
        print(f"[DEBUG AUTH] User found, password_hash length={len(ph)}, has_dollar={'$' in ph}")
    
    if not user or not user.get("password_hash"):
        # Record failed attempt
        await record_login_attempt(data.email, ip_address, user_agent, False, "user_not_found")
        
        # Check if should lock account
        failed_count = await get_failed_attempts(data.email)
        remaining = MAX_LOGIN_ATTEMPTS - failed_count
        
        if remaining <= 0:
            await log_security_event(
                SecurityEventTypes.ACCOUNT_LOCKED,
                None,
                data.email,
                ip_address,
                user_agent,
                {"reason": "max_attempts_reached"},
                severity="critical"
            )
        
        raise HTTPException(
            status_code=401, 
            detail=f"Credenciales inválidas. {max(0, remaining)} intentos restantes."
        )
    
    # Verify password (support both old and new hash formats)
    password_valid = verify_password_secure(data.password, user["password_hash"])
    
    if not password_valid:
        # Record failed attempt
        await record_login_attempt(data.email, ip_address, user_agent, False, "wrong_password")
        
        failed_count = await get_failed_attempts(data.email)
        remaining = MAX_LOGIN_ATTEMPTS - failed_count
        
        await log_security_event(
            SecurityEventTypes.LOGIN_FAILED,
            user.get("user_id"),
            data.email,
            ip_address,
            user_agent,
            {"attempts_remaining": remaining},
            severity="warning"
        )
        
        if remaining <= 0:
            await log_security_event(
                SecurityEventTypes.ACCOUNT_LOCKED,
                user.get("user_id"),
                data.email,
                ip_address,
                user_agent,
                {"reason": "max_attempts_reached"},
                severity="critical"
            )
        
        raise HTTPException(
            status_code=401, 
            detail=f"Credenciales inválidas. {max(0, remaining)} intentos restantes."
        )
    
    # Check for suspicious activity
    is_suspicious, suspicious_reason = await is_suspicious_login(
        user["user_id"], ip_address, user_agent
    )
    
    # Clear failed attempts on successful login
    await clear_failed_attempts(data.email)
    
    # Record successful login
    await record_login_attempt(data.email, ip_address, user_agent, True)
    
    # Create secure session
    session = await create_secure_session(
        user["user_id"], 
        ip_address, 
        user_agent,
        remember_device=getattr(data, 'remember_device', False)
    )
    
    # Log successful login
    await log_security_event(
        SecurityEventTypes.LOGIN_SUCCESS,
        user["user_id"],
        data.email,
        ip_address,
        user_agent,
        {"suspicious": is_suspicious, "suspicious_reason": suspicious_reason}
    )
    
    response.set_cookie(
        key="session_token",
        value=session["session_token"],
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=30 * 24 * 60 * 60 if getattr(data, 'remember_device', False) else 24 * 60 * 60
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "user"),
        "plan": user.get("plan", "free"),
        "picture": user.get("picture"),
        "security_alert": suspicious_reason if is_suspicious else None
    }


# ============================================
# 2FA ENDPOINTS
# ============================================

@router.post("/auth/2fa/send-code")
async def send_2fa_code(request: Request):
    """Send 2FA verification code via SMS"""
    body = await request.json()
    user_id = body.get("user_id")
    phone = body.get("phone")
    
    if not user_id or not phone:
        raise HTTPException(status_code=400, detail="user_id y phone son requeridos")
    
    ip_address, user_agent = get_client_info(request)
    
    # Get user
    user = await _db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Create OTP session
    otp_data = await create_otp_session(user_id, user["email"], phone, "login")
    
    # Send SMS via Twilio if available
    if _twilio_client:
        try:
            from services.twilio_sms import send_sms
            message = f"ManoProtect - Tu código de verificación es: {otp_data['otp_code']}. Válido por {otp_data['expires_in_minutes']} minutos. No lo compartas con nadie."
            await send_sms(phone, message)
        except Exception as e:
            print(f"Error sending SMS: {e}")
    
    await log_security_event(
        SecurityEventTypes.OTP_SENT,
        user_id,
        user["email"],
        ip_address,
        user_agent,
        {"phone_masked": phone[:3] + "****" + phone[-3:]}
    )
    
    return {
        "message": "Código enviado",
        "expires_in_minutes": otp_data["expires_in_minutes"],
        # Only for testing - remove in production
        "debug_code": otp_data["otp_code"] if not _twilio_client else None
    }


@router.post("/auth/2fa/verify")
async def verify_2fa_code(request: Request):
    """Verify 2FA code"""
    body = await request.json()
    user_id = body.get("user_id")
    otp_code = body.get("otp_code")
    
    if not user_id or not otp_code:
        raise HTTPException(status_code=400, detail="user_id y otp_code son requeridos")
    
    ip_address, user_agent = get_client_info(request)
    
    success, message = await verify_otp(user_id, otp_code, "login")
    
    user = await _db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    if success:
        await log_security_event(
            SecurityEventTypes.OTP_VERIFIED,
            user_id,
            user["email"] if user else None,
            ip_address,
            user_agent
        )
        return {"success": True, "message": message}
    else:
        await log_security_event(
            SecurityEventTypes.OTP_FAILED,
            user_id,
            user["email"] if user else None,
            ip_address,
            user_agent,
            {"reason": message},
            severity="warning"
        )
        raise HTTPException(status_code=400, detail=message)


# ============================================
# PASSWORD VALIDATION ENDPOINT
# ============================================

@router.post("/auth/validate-password")
async def validate_password_endpoint(request: Request):
    """Validate password strength before registration"""
    body = await request.json()
    password = body.get("password", "")
    
    result = validate_password_strength(password)
    
    return {
        "is_valid": result.is_valid,
        "score": result.score,
        "feedback": result.feedback,
        "strength": "weak" if result.score < 40 else "medium" if result.score < 70 else "strong"
    }


# ============================================
# SECURITY SETTINGS ENDPOINTS
# ============================================

@router.get("/auth/security-settings")
async def get_security_settings(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's security settings"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    user_doc = await _db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    
    security_settings = user_doc.get("security_settings", {
        "two_factor_enabled": False,
        "login_notifications": True,
        "trusted_devices": []
    })
    
    # Get recent login activity
    recent_logins = await _db.security_login_attempts.find(
        {"email": user.email, "success": True},
        {"_id": 0}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    return {
        "security_settings": security_settings,
        "recent_logins": recent_logins
    }


@router.post("/auth/change-password")
async def change_password(request: Request, session_token: Optional[str] = Cookie(None)):
    """Change user password with security validation"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    body = await request.json()
    current_password = body.get("current_password")
    new_password = body.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Contraseñas requeridas")
    
    ip_address, user_agent = get_client_info(request)
    
    # Verify current password
    user_doc = await _db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    if not verify_password_secure(current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
    
    # Validate new password
    password_check = validate_password_strength(new_password)
    if not password_check.is_valid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "La nueva contraseña no cumple los requisitos",
                "feedback": password_check.feedback
            }
        )
    
    # Update password
    new_hash = hash_password_secure(new_password)
    await _db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Invalidate all other sessions
    await invalidate_all_user_sessions(user.user_id, except_token=session_token)
    
    # Log event
    await log_security_event(
        SecurityEventTypes.PASSWORD_CHANGE,
        user.user_id,
        user.email,
        ip_address,
        user_agent
    )
    
    return {"message": "Contraseña actualizada correctamente. Todas las demás sesiones han sido cerradas."}


# ============================================
# PASSWORD RECOVERY
# ============================================

@router.post("/auth/forgot-password")
async def forgot_password(request: Request):
    """Send password recovery email"""
    body = await request.json()
    email = body.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")
    
    ip_address, user_agent = get_client_info(request)
    
    # Check if user exists
    user = await _db.users.find_one({"email": email}, {"_id": 0})
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña"}
    
    # Generate recovery token
    import secrets
    import hashlib
    
    recovery_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(recovery_token.encode()).hexdigest()
    


class DeleteAccountRequest(BaseModel):
    email: str
    reason: Optional[str] = None

@router.post("/auth/delete-account-request")
async def request_account_deletion(data: DeleteAccountRequest, request: Request):
    """Request account deletion - stores the request and schedules deletion"""
    ip_address, user_agent = get_client_info(request)
    
    # Verify user exists
    user = await _db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Create deletion request
    deletion_request = {
        "request_id": f"del_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{user['user_id']}",
        "user_id": user["user_id"],
        "email": data.email,
        "reason": data.reason,
        "requested_at": datetime.now(timezone.utc),
        "scheduled_deletion": datetime.now(timezone.utc) + timedelta(days=30),
        "status": "pending",
        "ip_address": ip_address,
        "user_agent": user_agent
    }
    
    await _db.deletion_requests.insert_one(deletion_request)
    
    # Log the security event
    await log_security_event(
        SecurityEventTypes.ACCOUNT_DELETION_REQUESTED,
        user["user_id"],
        data.email,
        ip_address,
        user_agent,
        {"reason": data.reason}
    )
    
    return {
        "message": "Solicitud de eliminación recibida",
        "scheduled_deletion": deletion_request["scheduled_deletion"].isoformat(),
        "request_id": deletion_request["request_id"]
    }

    # Store recovery request
    recovery_doc = {
        "email": email,
        "user_id": user.get("user_id"),
        "token_hash": token_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "used": False
    }
    
    await _db.password_recovery.insert_one(recovery_doc)
    
    # Log security event
    await log_security_event(
        SecurityEventTypes.PASSWORD_RESET_REQUEST,
        user.get("user_id"),
        email,
        ip_address,
        user_agent
    )
    
    # TODO: Send email with recovery link
    # For now, return the token for testing
    recovery_link = f"https://manoprotect.es/recuperar-password?token={recovery_token}"
    
    return {
        "message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
        "debug_link": recovery_link,  # Remove in production
        "debug_token": recovery_token  # Remove in production
    }


@router.post("/auth/reset-password")
async def reset_password(request: Request):
    """Reset password using recovery token"""
    body = await request.json()
    token = body.get("token")
    new_password = body.get("new_password")
    
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token y nueva contraseña requeridos")
    
    import hashlib
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    # Find recovery request
    recovery = await _db.password_recovery.find_one({
        "token_hash": token_hash,
        "used": False
    })
    
    if not recovery:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    # Check expiry
    expires_at = datetime.fromisoformat(recovery["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="El token ha expirado. Solicita uno nuevo.")
    
    # Validate new password
    password_check = validate_password_strength(new_password)
    if not password_check.is_valid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "La contraseña no cumple los requisitos",
                "feedback": password_check.feedback
            }
        )
    
    # Update password
    new_hash = hash_password_secure(new_password)
    await _db.users.update_one(
        {"user_id": recovery["user_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Mark token as used
    await _db.password_recovery.update_one(
        {"token_hash": token_hash},
        {"$set": {"used": True}}
    )
    
    # Invalidate all sessions
    await invalidate_all_user_sessions(recovery["user_id"])
    
    ip_address, user_agent = get_client_info(request)
    await log_security_event(
        SecurityEventTypes.PASSWORD_CHANGE,
        recovery["user_id"],
        recovery["email"],
        ip_address,
        user_agent,
        {"method": "recovery"}
    )
    
    return {"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}


@router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Exchange Google OAuth session_id for local session"""
    ip_address, user_agent = get_client_info(request)
    
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requerido")
    
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Sesión de Google inválida")
    
    google_data = auth_response.json()
    email = google_data.get("email")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    existing_user = await _db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        await _db.users.update_one(
            {"email": email},
            {"$set": {
                "name": name,
                "picture": picture,
                "auth_provider": "google"
            }}
        )
        user_id = existing_user["user_id"]
        role = existing_user.get("role", "user")
        plan = existing_user.get("plan", "free")
    else:
        user = User(
            email=email,
            name=name,
            picture=picture,
            auth_provider="google"
        )
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await _db.users.insert_one(user_doc)
        user_id = user.user_id
        role = user.role
        plan = user.plan
    
    session_token = generate_session_token()
    session = SessionData(
        user_id=user_id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_doc = session.model_dump()
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await _db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": role,
        "plan": plan,
        "session_token": session_token
    }


@router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current authenticated user"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "role": user.role,
        "plan": user.plan,
        "phone": user.phone,
        "dark_mode": user.dark_mode,
        "notifications_enabled": user.notifications_enabled,
        "auto_block": user.auto_block
    }


@router.patch("/auth/profile")
async def update_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Update user profile data"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    body = await request.json()
    
    # Fields that can be updated
    allowed_fields = ["name", "phone", "dark_mode", "notifications_enabled"]
    update_data = {}
    
    for field in allowed_fields:
        if field in body:
            update_data[field] = body[field]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    # Update user
    await _db.users.update_one(
        {"user_id": user.user_id},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await _db.users.find_one({"user_id": user.user_id}, {"_id": 0, "password_hash": 0})
    
    return {
        "message": "Perfil actualizado correctamente",
        "user": {
            "user_id": updated_user.get("user_id"),
            "email": updated_user.get("email"),
            "name": updated_user.get("name"),
            "phone": updated_user.get("phone"),
            "dark_mode": updated_user.get("dark_mode"),
            "notifications_enabled": updated_user.get("notifications_enabled")
        }
    }


@router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout - clear session"""
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        await _db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Sesión cerrada correctamente"}
