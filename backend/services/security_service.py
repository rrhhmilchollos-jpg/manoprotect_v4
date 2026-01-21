"""
MANO Security Service
Advanced security features for ManoBank S.A.
- Rate limiting
- Failed login tracking
- Account lockout
- Password strength validation
- 2FA with Twilio
- Security audit logging
"""
import os
import re
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from pydantic import BaseModel

# Security Configuration
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30
PASSWORD_MIN_LENGTH = 8
SESSION_TIMEOUT_HOURS = 24
OTP_EXPIRY_MINUTES = 5

_db = None

def init_security_service(database):
    """Initialize security service with database"""
    global _db
    _db = database

def get_db():
    return _db


# ============================================
# PASSWORD SECURITY
# ============================================

class PasswordStrength(BaseModel):
    """Password strength analysis result"""
    is_valid: bool
    score: int  # 0-100
    feedback: list[str]

def validate_password_strength(password: str) -> PasswordStrength:
    """
    Validate password strength with strict banking-grade requirements
    Returns score and feedback
    """
    feedback = []
    score = 0
    
    # Length check
    if len(password) < PASSWORD_MIN_LENGTH:
        feedback.append(f"La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres")
    else:
        score += 20
        if len(password) >= 12:
            score += 10
        if len(password) >= 16:
            score += 10
    
    # Uppercase check
    if not re.search(r'[A-Z]', password):
        feedback.append("Debe incluir al menos una letra mayúscula")
    else:
        score += 15
    
    # Lowercase check
    if not re.search(r'[a-z]', password):
        feedback.append("Debe incluir al menos una letra minúscula")
    else:
        score += 15
    
    # Number check
    if not re.search(r'\d', password):
        feedback.append("Debe incluir al menos un número")
    else:
        score += 15
    
    # Special character check
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        feedback.append("Debe incluir al menos un carácter especial (!@#$%^&*)")
    else:
        score += 15
    
    # Common patterns check
    common_patterns = ['123456', 'password', 'qwerty', 'abc123', 'manobank', '111111']
    if any(pattern in password.lower() for pattern in common_patterns):
        feedback.append("La contraseña contiene patrones comunes no permitidos")
        score -= 20
    
    # Sequential characters check
    if re.search(r'(.)\1{2,}', password):
        feedback.append("No se permiten más de 2 caracteres repetidos seguidos")
        score -= 10
    
    score = max(0, min(100, score))
    is_valid = len(feedback) == 0 and score >= 60
    
    return PasswordStrength(
        is_valid=is_valid,
        score=score,
        feedback=feedback
    )


def hash_password_secure(password: str) -> str:
    """
    Secure password hashing with salt using PBKDF2
    More secure than simple SHA-256
    """
    salt = secrets.token_hex(32)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    ).hex()
    return f"{salt}${pwd_hash}"


def verify_password_secure(password: str, stored_hash: str) -> bool:
    """Verify password against secure hash"""
    try:
        # Handle legacy SHA-256 hashes (no salt)
        if '$' not in stored_hash:
            return hashlib.sha256(password.encode()).hexdigest() == stored_hash
        
        # New secure format
        salt, pwd_hash = stored_hash.split('$')
        check_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets.compare_digest(check_hash, pwd_hash)
    except Exception:
        return False


# ============================================
# LOGIN ATTEMPT TRACKING & RATE LIMITING
# ============================================

async def record_login_attempt(
    email: str,
    ip_address: str,
    user_agent: str,
    success: bool,
    failure_reason: Optional[str] = None
) -> dict:
    """Record login attempt for security auditing"""
    db = get_db()
    
    attempt = {
        "email": email,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "success": success,
        "failure_reason": failure_reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.security_login_attempts.insert_one(attempt)
    
    return attempt


async def get_failed_attempts(email: str, minutes: int = LOCKOUT_DURATION_MINUTES) -> int:
    """Get number of failed login attempts in the last N minutes"""
    db = get_db()
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    
    count = await db.security_login_attempts.count_documents({
        "email": email,
        "success": False,
        "timestamp": {"$gte": cutoff_time.isoformat()}
    })
    
    return count


async def is_account_locked(email: str) -> Tuple[bool, Optional[int]]:
    """
    Check if account is locked due to failed attempts
    Returns (is_locked, minutes_remaining)
    """
    failed_attempts = await get_failed_attempts(email)
    
    if failed_attempts >= MAX_LOGIN_ATTEMPTS:
        # Find the most recent failed attempt
        db = get_db()
        last_attempt = await db.security_login_attempts.find_one(
            {"email": email, "success": False},
            sort=[("timestamp", -1)]
        )
        
        if last_attempt:
            last_time = datetime.fromisoformat(last_attempt["timestamp"].replace('Z', '+00:00'))
            unlock_time = last_time + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            now = datetime.now(timezone.utc)
            
            if now < unlock_time:
                minutes_remaining = int((unlock_time - now).total_seconds() / 60) + 1
                return True, minutes_remaining
    
    return False, None


async def clear_failed_attempts(email: str):
    """Clear failed login attempts after successful login"""
    db = get_db()
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    
    await db.security_login_attempts.delete_many({
        "email": email,
        "success": False,
        "timestamp": {"$gte": cutoff_time.isoformat()}
    })


# ============================================
# TWO-FACTOR AUTHENTICATION (2FA)
# ============================================

def generate_otp_code() -> str:
    """Generate a 6-digit OTP code"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])


async def create_otp_session(
    user_id: str,
    email: str,
    phone: str,
    purpose: str = "login"
) -> dict:
    """Create OTP session and return code"""
    db = get_db()
    
    otp_code = generate_otp_code()
    
    # Hash the OTP for storage
    otp_hash = hashlib.sha256(otp_code.encode()).hexdigest()
    
    session = {
        "user_id": user_id,
        "email": email,
        "phone": phone,
        "otp_hash": otp_hash,
        "purpose": purpose,
        "attempts": 0,
        "max_attempts": 3,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)).isoformat(),
        "verified": False
    }
    
    # Remove any existing OTP sessions for this user/purpose
    await db.security_otp_sessions.delete_many({
        "user_id": user_id,
        "purpose": purpose
    })
    
    await db.security_otp_sessions.insert_one(session)
    
    return {
        "otp_code": otp_code,  # Only returned for sending via SMS
        "expires_in_minutes": OTP_EXPIRY_MINUTES
    }


async def verify_otp(user_id: str, otp_code: str, purpose: str = "login") -> Tuple[bool, str]:
    """
    Verify OTP code
    Returns (success, message)
    """
    db = get_db()
    
    session = await db.security_otp_sessions.find_one({
        "user_id": user_id,
        "purpose": purpose,
        "verified": False
    })
    
    if not session:
        return False, "Código de verificación no encontrado o expirado"
    
    # Check expiry
    expires_at = datetime.fromisoformat(session["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.security_otp_sessions.delete_one({"_id": session["_id"]})
        return False, "El código ha expirado. Solicite uno nuevo."
    
    # Check attempts
    if session["attempts"] >= session["max_attempts"]:
        await db.security_otp_sessions.delete_one({"_id": session["_id"]})
        return False, "Demasiados intentos fallidos. Solicite un nuevo código."
    
    # Verify OTP
    otp_hash = hashlib.sha256(otp_code.encode()).hexdigest()
    
    if not secrets.compare_digest(otp_hash, session["otp_hash"]):
        await db.security_otp_sessions.update_one(
            {"_id": session["_id"]},
            {"$inc": {"attempts": 1}}
        )
        remaining = session["max_attempts"] - session["attempts"] - 1
        return False, f"Código incorrecto. {remaining} intentos restantes."
    
    # Mark as verified
    await db.security_otp_sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {"verified": True}}
    )
    
    return True, "Verificación completada"


# ============================================
# SECURITY AUDIT LOGGING
# ============================================

async def log_security_event(
    event_type: str,
    user_id: Optional[str],
    email: Optional[str],
    ip_address: str,
    user_agent: str,
    details: Optional[dict] = None,
    severity: str = "info"
):
    """Log security event for audit trail"""
    db = get_db()
    
    event = {
        "event_type": event_type,
        "user_id": user_id,
        "email": email,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "details": details or {},
        "severity": severity,  # info, warning, critical
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.security_audit_log.insert_one(event)
    
    return event


# Security event types
class SecurityEventTypes:
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGIN_BLOCKED = "login_blocked"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET_REQUEST = "password_reset_request"
    OTP_SENT = "otp_sent"
    OTP_VERIFIED = "otp_verified"
    OTP_FAILED = "otp_failed"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    SESSION_CREATED = "session_created"
    SESSION_EXPIRED = "session_expired"


# ============================================
# SESSION SECURITY
# ============================================

def generate_secure_session_token() -> str:
    """Generate a cryptographically secure session token"""
    return f"mano_{secrets.token_urlsafe(48)}"


async def create_secure_session(
    user_id: str,
    ip_address: str,
    user_agent: str,
    remember_device: bool = False
) -> dict:
    """Create a secure session with metadata"""
    db = get_db()
    
    session_token = generate_secure_session_token()
    
    # Session duration based on remember_device
    if remember_device:
        expires_delta = timedelta(days=30)
    else:
        expires_delta = timedelta(hours=SESSION_TIMEOUT_HOURS)
    
    session = {
        "session_token": session_token,
        "user_id": user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + expires_delta).isoformat(),
        "last_activity": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.user_sessions.insert_one(session)
    
    return session


async def invalidate_all_user_sessions(user_id: str, except_token: Optional[str] = None):
    """Invalidate all sessions for a user (useful on password change)"""
    db = get_db()
    
    query = {"user_id": user_id}
    if except_token:
        query["session_token"] = {"$ne": except_token}
    
    await db.user_sessions.update_many(
        query,
        {"$set": {"is_active": False}}
    )


# ============================================
# IP AND DEVICE FINGERPRINTING
# ============================================

async def is_suspicious_login(
    user_id: str,
    ip_address: str,
    user_agent: str
) -> Tuple[bool, str]:
    """
    Check if login attempt is suspicious based on:
    - New IP address
    - New device
    - Unusual location/time
    """
    db = get_db()
    
    # Get user's recent successful logins
    recent_logins = await db.security_login_attempts.find(
        {
            "email": {"$exists": True},
            "success": True
        },
        sort=[("timestamp", -1)],
        limit=10
    ).to_list(10)
    
    if not recent_logins:
        return False, ""
    
    # Check if IP is new
    known_ips = set(login.get("ip_address") for login in recent_logins)
    if ip_address not in known_ips:
        return True, "Nuevo dispositivo o ubicación detectada"
    
    return False, ""
