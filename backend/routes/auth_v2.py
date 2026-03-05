"""
MANO - Authentication Routes (Modular Version)
Handles user registration, login, logout, session management, 
password recovery, and familia_id grouping
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt
import uuid
import random
import string

# Create router
router = APIRouter(tags=["Authentication"])


# ============================================
# MODELS
# ============================================

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: Optional[str] = None
    familia_id: Optional[str] = None  # Join existing family
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contrasena debe tener al menos 8 caracteres')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    email: EmailStr
    code: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contrasena debe tener al menos 8 caracteres')
        return v


class GoogleSessionRequest(BaseModel):
    session_id: str


# ============================================
# HELPER FUNCTIONS  
# ============================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password - supports bcrypt and legacy sha256"""
    import hashlib
    if hashed.startswith('$2b$') or hashed.startswith('$2a$'):
        return bcrypt.checkpw(password.encode(), hashed.encode())
    return hashlib.sha256(password.encode()).hexdigest() == hashed


def generate_session_token() -> str:
    """Generate a secure session token"""
    return f"session_{uuid.uuid4().hex}"


def generate_recovery_code() -> str:
    """Generate a 6-digit recovery code"""
    return ''.join(random.choices(string.digits, k=6))


# ============================================
# ROUTES
# ============================================

def create_auth_routes(db, User, SessionData):
    """Factory function to create auth routes with dependencies"""
    
    @router.post("/auth/register")
    async def register_user(data: UserRegister, response: Response):
        """Register new user with email/password + familia_id"""
        existing = await db.users.find_one({"email": data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="El email ya esta registrado")
        
        # Create or join familia
        familia_id = data.familia_id
        familia_role = "member"
        
        if familia_id:
            # Joining existing family
            familia = await db.families.find_one({"familia_id": familia_id}, {"_id": 0})
            if not familia:
                raise HTTPException(status_code=404, detail="Familia no encontrada")
        else:
            # Create new family - registrant is titular
            familia_id = f"fam_{uuid.uuid4().hex[:10]}"
            familia_role = "titular"
            await db.families.insert_one({
                "familia_id": familia_id,
                "titular_email": data.email,
                "titular_name": data.name,
                "members": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        
        user = User(
            email=data.email,
            name=data.name,
            auth_provider="email",
            password_hash=hash_password(data.password)
        )
        
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        user_doc['familia_id'] = familia_id
        user_doc['familia_role'] = familia_role
        user_doc['phone'] = data.phone or ""
        await db.users.insert_one(user_doc)
        
        # Add to family members list if joining
        if familia_role == "member":
            await db.families.update_one(
                {"familia_id": familia_id},
                {"$push": {"members": {"email": data.email, "name": data.name, "role": "member", "added_at": datetime.now(timezone.utc).isoformat()}}}
            )
        
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
            "plan": user.plan,
            "familia_id": familia_id,
            "familia_role": familia_role,
        }

    @router.post("/auth/login")
    async def login_user(data: UserLogin, response: Response):
        """Login with email/password"""
        user = await db.users.find_one({"email": data.email}, {"_id": 0})
        
        if not user or not user.get("password_hash"):
            raise HTTPException(status_code=401, detail="Credenciales invalidas")
        
        if not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Credenciales invalidas")
        
        # Auto-migrate sha256 to bcrypt on successful login
        if not user["password_hash"].startswith('$2b$'):
            new_hash = hash_password(data.password)
            await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"password_hash": new_hash}})
        
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
