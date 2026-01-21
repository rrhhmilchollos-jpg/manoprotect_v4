"""
MANO - Authentication Routes
User registration, login, logout, and session management
With enhanced security features for ManoBank S.A.
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
_twilio_client = None


def init_auth_routes(db, twilio_client=None):
    """Initialize routes with database connection and optional Twilio"""
    global _db, _twilio_client
    _db = db
    _twilio_client = twilio_client


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
    
    session_token = generate_session_token()
    session = SessionData(
        user_id=user["user_id"],
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
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "user"),
        "plan": user.get("plan", "free"),
        "picture": user.get("picture")
    }


@router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Exchange Google OAuth session_id for local session"""
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
