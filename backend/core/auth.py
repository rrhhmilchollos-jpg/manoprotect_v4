"""
MANO - Core Authentication Helpers
Shared authentication functions for all routes
"""
from fastapi import HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone
import hashlib
import uuid

from models.all_schemas import User


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def generate_session_token() -> str:
    """Generate a secure session token"""
    return f"session_{uuid.uuid4().hex}"


async def get_current_user(db, request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        return None
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)


async def require_auth(db, request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(db, request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user


async def require_admin(db, request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require superadmin role"""
    user = await require_auth(db, request, session_token)
    if user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere rol de superadmin")
    return user


async def require_investor(db, request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require investor role"""
    user = await require_auth(db, request, session_token)
    if user.role not in ["investor", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere acceso de inversor aprobado")
    return user
