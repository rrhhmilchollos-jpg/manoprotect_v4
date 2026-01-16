"""
MANO - Core Database and Authentication
Shared configuration for all routes
"""
from fastapi import HTTPException, Request, Cookie
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
import os
import uuid

# Load environment
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'mano-secure-jwt-secret-2025')

# Import models
from models.all_schemas import User


def generate_session_token() -> str:
    """Generate a secure session token"""
    return f"session_{uuid.uuid4().hex}"


async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[User]:
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


async def require_auth(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user


async def require_admin(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require superadmin role"""
    user = await require_auth(request, session_token)
    if user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere rol de superadmin")
    return user


async def require_investor(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    """Require investor role"""
    user = await require_auth(request, session_token)
    if user.role not in ["investor", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere acceso de inversor aprobado")
    return user
