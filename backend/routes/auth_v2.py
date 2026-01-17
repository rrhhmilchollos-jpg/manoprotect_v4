"""
MANO - Authentication Routes (Modular Version)
Handles user registration, login, logout, and session management
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone, timedelta
import httpx
import hashlib
import uuid

# Create router
router = APIRouter(tags=["Authentication"])


# ============================================
# MODELS
# ============================================

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionRequest(BaseModel):
    session_id: str


# ============================================
# HELPER FUNCTIONS  
# ============================================

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def generate_session_token() -> str:
    """Generate a secure session token"""
    return f"session_{uuid.uuid4().hex}"


# ============================================
# ROUTES
# ============================================

def create_auth_routes(db, User, SessionData):
    """Factory function to create auth routes with dependencies"""
    
    @router.post("/auth/register")
    async def register_user(data: UserRegister, response: Response):
        """Register new user with email/password"""
        existing = await db.users.find_one({"email": data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        user = User(
            email=data.email,
            name=data.name,
            auth_provider="email",
            password_hash=hash_password(data.password)
        )
        
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.users.insert_one(user_doc)
        
        # Create session
        session_token = generate_session_token()
        session = SessionData(
            user_id=user.user_id,
            session_token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        
        session_doc = session.model_dump()
        session_doc['expires_at'] = session_doc['expires_at'].isoformat()
        session_doc['created_at'] = session_doc['created_at'].isoformat()
        await db.user_sessions.insert_one(session_doc)
        
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
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "plan": user.plan
        }

    @router.post("/auth/login")
    async def login_user(data: UserLogin, response: Response):
        """Login with email/password"""
        user = await db.users.find_one({"email": data.email}, {"_id": 0})
        
        if not user or not user.get("password_hash"):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        if not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        # Check if user is active
        if user.get("is_active") == False:
            raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta con soporte.")
        
        # Create session
        session_token = generate_session_token()
        session = SessionData(
            user_id=user["user_id"],
            session_token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        
        session_doc = session.model_dump()
        session_doc['expires_at'] = session_doc['expires_at'].isoformat()
        session_doc['created_at'] = session_doc['created_at'].isoformat()
        await db.user_sessions.insert_one(session_doc)
        
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
    async def process_google_session(data: GoogleSessionRequest, response: Response):
        """Process Google OAuth session from Emergent Auth"""
        try:
            async with httpx.AsyncClient() as client:
                result = await client.get(
                    f"https://auth.emergentagent.com/session/{data.session_id}"
                )
                
                if result.status_code != 200:
                    raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
                
                google_data = result.json()
        except httpx.RequestError:
            raise HTTPException(status_code=500, detail="Error conectando con servicio de autenticación")
        
        email = google_data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="No se pudo obtener el email")
        
        # Find or create user
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            # Update existing user with Google info
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "picture": google_data.get("picture"),
                    "name": google_data.get("name", existing_user.get("name")),
                    "auth_provider": "google"
                }}
            )
            user_id = existing_user["user_id"]
            role = existing_user.get("role", "user")
            plan = existing_user.get("plan", "free")
            name = google_data.get("name", existing_user.get("name"))
        else:
            # Create new user
            user = User(
                email=email,
                name=google_data.get("name", email.split("@")[0]),
                picture=google_data.get("picture"),
                auth_provider="google"
            )
            
            user_doc = user.model_dump()
            user_doc['created_at'] = user_doc['created_at'].isoformat()
            await db.users.insert_one(user_doc)
            
            user_id = user.user_id
            role = user.role
            plan = user.plan
            name = user.name
        
        # Create session
        session_token = generate_session_token()
        session = SessionData(
            user_id=user_id,
            session_token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        
        session_doc = session.model_dump()
        session_doc['expires_at'] = session_doc['expires_at'].isoformat()
        session_doc['created_at'] = session_doc['created_at'].isoformat()
        await db.user_sessions.insert_one(session_doc)
        
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
            "role": role,
            "plan": plan,
            "picture": google_data.get("picture")
        }

    return router
