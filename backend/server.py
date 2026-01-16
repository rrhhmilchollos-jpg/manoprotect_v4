from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Depends
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import csv
import io
import httpx
import hashlib
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'mano-secure-jwt-secret-2025')

# ============================================
# MODELS
# ============================================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    auth_provider: str = "email"  # "email" or "google"
    password_hash: Optional[str] = None
    plan: str = "free"  # "free", "personal", "family", "business", "enterprise"
    role: str = "user"  # "user", "premium", "superadmin"
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    is_active: bool = True  # Para dar de baja usuarios
    dark_mode: bool = False
    notifications_enabled: bool = True
    auto_block: bool = False
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    auto_block: Optional[bool] = None

class SessionData(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Investor Models
class InvestorRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str = Field(default_factory=lambda: f"inv_{uuid.uuid4().hex[:12]}")
    cif: str
    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str  # Cargo
    reason: str  # Motivo de interés
    status: str = "pending"  # "pending", "approved", "rejected"
    user_id: Optional[str] = None  # Linked user after approval
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestorRegisterRequest(BaseModel):
    cif: str
    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str
    reason: str
    
    @field_validator('cif')
    @classmethod
    def validate_cif(cls, v):
        # Spanish CIF validation (basic format)
        cif_pattern = r'^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$'
        if not re.match(cif_pattern, v.upper()):
            raise ValueError('CIF inválido. Formato esperado: letra + 7 dígitos + letra/dígito')
        return v.upper()

class ThreatAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    content_type: str
    risk_level: str
    is_threat: bool
    threat_types: List[str]
    recommendation: str
    analysis: str
    reported_false_positive: bool = False
    shared_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyzeRequest(BaseModel):
    content: str
    content_type: str

class TrustedContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    relationship: str
    is_emergency: bool = False
    receive_alerts: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrustedContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str
    is_emergency: Optional[bool] = False
    receive_alerts: Optional[bool] = True

class SOSAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location: Optional[str] = None
    message: Optional[str] = None
    contacts_notified: List[str] = []
    status: str = "sent"  # "sent", "acknowledged", "resolved"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SOSRequest(BaseModel):
    location: Optional[str] = None
    message: Optional[str] = None

class CommunityAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    threat_type: str
    description: str
    affected_users: int = 0
    severity: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    plan_type: str
    origin_url: str

class FalsePositiveReport(BaseModel):
    threat_id: str
    reason: str
    additional_info: Optional[str] = None

class ShareRequest(BaseModel):
    threat_id: str
    share_type: str  # "whatsapp", "email", "link"
    recipient: Optional[str] = None

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    email: str
    plan_type: str
    amount: float
    currency: str = "eur"
    status: str = "pending"
    payment_status: str = "initiated"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Fixed subscription pricing packages (amounts in EUR)
SUBSCRIPTION_PACKAGES = {
    # Planes básicos (hasta 2 usuarios)
    "personal-monthly": {"amount": 9.99, "name": "Personal Mensual", "period": "mes", "max_users": 2},
    "personal-quarterly": {"amount": 24.99, "name": "Personal Trimestral", "period": "3 meses", "max_users": 2},
    "personal-yearly": {"amount": 89.99, "name": "Personal Anual", "period": "año", "max_users": 2},
    # Planes familiares (hasta 5 usuarios + GPS + SOS)
    "family-monthly": {"amount": 19.99, "name": "Familiar Mensual", "period": "mes", "max_users": 5, "gps": True, "sos": True},
    "family-quarterly": {"amount": 49.99, "name": "Familiar Trimestral", "period": "3 meses", "max_users": 5, "gps": True, "sos": True},
    "family-yearly": {"amount": 179.99, "name": "Familiar Anual", "period": "año", "max_users": 5, "gps": True, "sos": True},
    # Planes business
    "business-monthly": {"amount": 49.99, "name": "Business Mensual", "period": "mes", "max_users": 25},
    "business-yearly": {"amount": 479.99, "name": "Business Anual", "period": "año", "max_users": 25},
    # Plan enterprise
    "enterprise-monthly": {"amount": 199.99, "name": "Enterprise Mensual", "period": "mes", "max_users": -1},
    "enterprise-yearly": {"amount": 1999.99, "name": "Enterprise Anual", "period": "año", "max_users": -1},
}

# Plan features - detailed by billing period for family plans
PLAN_FEATURES = {
    "free": {"max_users": 1, "gps": False, "sos": False, "ai_analysis": False, "child_tracking": False, "location_history": False},
    "personal": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    # Family plans with tiered features
    "family": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-monthly": {"max_users": 5, "gps": False, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-quarterly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-yearly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": True, "location_history": True, "silent_mode": True},
    "business": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "enterprise": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
}

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
    if user.role not in ["investor", "admin"]:
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere acceso de inversor aprobado")
    return user

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@api_router.post("/auth/register")
async def register_user(data: UserRegister, response: Response):
    """Register new user with email/password"""
    # Check if email exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Create user
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
    
    # Set cookie
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

@api_router.post("/auth/login")
async def login_user(data: UserLogin, response: Response):
    """Login with email/password"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
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
    
    # Set cookie
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

@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Exchange Google OAuth session_id for local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requerido")
    
    # Fetch user data from Emergent Auth
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
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        # Update existing user
        await db.users.update_one(
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
        # Create new user
        user = User(
            email=email,
            name=name,
            picture=picture,
            auth_provider="google"
        )
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.users.insert_one(user_doc)
        user_id = user.user_id
        role = user.role
        plan = user.plan
    
    # Create local session
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
    
    # Set cookie
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

@api_router.get("/auth/me")
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

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout - clear session"""
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Sesión cerrada correctamente"}

# ============================================
# INVESTOR REGISTRATION ROUTES
# ============================================

@api_router.post("/investors/register")
async def register_investor(data: InvestorRegisterRequest):
    """Register investor request - requires manual approval"""
    # Check if CIF already registered
    existing = await db.investor_requests.find_one({"cif": data.cif.upper()}, {"_id": 0})
    if existing:
        if existing.get("status") == "approved":
            raise HTTPException(status_code=400, detail="Este CIF ya está registrado y aprobado")
        elif existing.get("status") == "pending":
            raise HTTPException(status_code=400, detail="Ya existe una solicitud pendiente para este CIF")
    
    # Create investor request
    investor_request = InvestorRequest(
        cif=data.cif,
        company_name=data.company_name,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        position=data.position,
        reason=data.reason
    )
    
    doc = investor_request.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.investor_requests.insert_one(doc)
    
    return {
        "message": "Solicitud de acceso de inversor recibida",
        "request_id": investor_request.request_id,
        "status": "pending",
        "info": "Recibirá un email cuando su solicitud sea revisada (máximo 48 horas laborables)"
    }

@api_router.get("/investors/status/{cif}")
async def check_investor_status(cif: str):
    """Check investor request status by CIF"""
    request = await db.investor_requests.find_one({"cif": cif.upper()}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="No se encontró solicitud con este CIF")
    
    return {
        "cif": request["cif"],
        "company_name": request["company_name"],
        "status": request["status"],
        "created_at": request["created_at"]
    }

# Admin routes for investor management
@api_router.get("/admin/investors")
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

@api_router.post("/admin/investors/{request_id}/approve")
async def approve_investor(
    request_id: str,
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """Approve investor request and create account (admin only)"""
    admin = await require_admin(request, session_token)
    
    inv_request = await db.investor_requests.find_one({"request_id": request_id}, {"_id": 0})
    if not inv_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if inv_request["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"La solicitud ya está {inv_request['status']}")
    
    # Check if user with this email exists
    existing_user = await db.users.find_one({"email": inv_request["contact_email"]}, {"_id": 0})
    
    if existing_user:
        # Update existing user to investor role
        await db.users.update_one(
            {"email": inv_request["contact_email"]},
            {"$set": {"role": "investor"}}
        )
        user_id = existing_user["user_id"]
    else:
        # Create new investor user
        temp_password = f"MANO_{uuid.uuid4().hex[:8]}"
        user = User(
            email=inv_request["contact_email"],
            name=inv_request["contact_name"],
            auth_provider="email",
            password_hash=hash_password(temp_password),
            role="investor",
            phone=inv_request["contact_phone"]
        )
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.users.insert_one(user_doc)
        user_id = user.user_id
    
    # Update investor request
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
        "user_id": user_id,
        "email": inv_request["contact_email"]
    }

@api_router.post("/admin/investors/{request_id}/reject")
async def reject_investor(
    request_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Reject investor request (admin only)"""
    admin = await require_admin(request, session_token)
    
    inv_request = await db.investor_requests.find_one({"request_id": request_id}, {"_id": 0})
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
    
    return {"message": "Solicitud rechazada"}

# ============================================
# PROTECTED INVESTOR DOCUMENTS
# ============================================

@api_router.get("/investor/documents")
async def list_investor_documents(request: Request, session_token: Optional[str] = Cookie(None)):
    """List available documents for investors"""
    await require_investor(request, session_token)
    
    return {
        "documents": [
            {"id": "business-plan", "title": "Plan de Negocio 2025-2028", "pages": "15 páginas", "format": "PDF", "size": "54 KB"},
            {"id": "financial-model", "title": "Modelo Financiero Detallado", "pages": "8 páginas", "format": "PDF", "size": "42 KB"},
            {"id": "pitch-deck", "title": "Presentación para Inversores", "pages": "15 slides", "format": "PDF", "size": "39 KB"},
            {"id": "terms", "title": "Términos de Inversión", "pages": "5 páginas", "format": "PDF", "size": "37 KB"},
            {"id": "enterprise-plan", "title": "Plan Enterprise para Bancos", "pages": "12 páginas", "format": "PDF", "size": "48 KB"}
        ]
    }

@api_router.get("/investor/download/{doc_type}")
async def download_investor_document(
    doc_type: str,
    request: Request,
    format: str = "pdf",
    session_token: Optional[str] = Cookie(None)
):
    """Download document (investor only) - supports PDF and MD formats"""
    user = await require_investor(request, session_token)
    
    # PDF files mapping
    pdf_map = {
        "business-plan": "/app/docs/pdf/PLAN_DE_NEGOCIO.pdf",
        "financial-model": "/app/docs/pdf/MODELO_FINANCIERO.pdf",
        "pitch-deck": "/app/docs/pdf/PRESENTACION_INVERSORES.pdf",
        "terms": "/app/docs/pdf/TERMINOS_INVERSION.pdf",
        "enterprise-plan": "/app/docs/pdf/MANO_ENTERPRISE_BUSINESS_PLAN.pdf"
    }
    
    # Markdown files mapping (fallback)
    md_map = {
        "business-plan": "/app/docs/PLAN_DE_NEGOCIO.md",
        "financial-model": "/app/docs/MODELO_FINANCIERO.md",
        "pitch-deck": "/app/docs/PRESENTACION_INVERSORES.md",
        "terms": "/app/docs/TERMINOS_INVERSION.md",
        "enterprise-plan": "/app/docs/MANO_Enterprise_Business_Plan.md"
    }
    
    # Choose format
    if format.lower() == "pdf":
        file_path = pdf_map.get(doc_type)
        media_type = "application/pdf"
        ext = "pdf"
    else:
        file_path = md_map.get(doc_type)
        media_type = "text/markdown"
        ext = "md"
    
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Log download
    await db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": doc_type,
        "format": format,
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Read file (binary for PDF, text for MD)
    if format.lower() == "pdf":
        with open(file_path, 'rb') as f:
            content = f.read()
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    
    filename = f"MANO_{doc_type.replace('-', '_')}_CONFIDENCIAL_2025.{ext}"
    
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@api_router.get("/investor/download-all")
async def download_all_investor_documents(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Download all investor documents as ZIP (investor only)"""
    user = await require_investor(request, session_token)
    
    zip_path = "/app/MANO_Documentos_Inversores.zip"
    if not Path(zip_path).exists():
        raise HTTPException(status_code=404, detail="Archivo ZIP no encontrado")
    
    # Log download
    await db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": "all-documents-zip",
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    with open(zip_path, 'rb') as f:
        content = f.read()
    
    return Response(
        content=content,
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="MANO_Documentos_Inversores_CONFIDENCIAL.zip"'
        }
    )

# ============================================
# USER PROFILE ROUTES
# ============================================

@api_router.get("/profile")
async def get_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user profile"""
    user = await require_auth(request, session_token)
    
    # Get threat stats
    total_analyzed = await db.threats.count_documents({"user_id": user.user_id})
    threats_blocked = await db.threats.count_documents({"user_id": user.user_id, "is_threat": True})
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "phone": user.phone,
        "plan": user.plan,
        "role": user.role,
        "dark_mode": user.dark_mode,
        "notifications_enabled": user.notifications_enabled,
        "auto_block": user.auto_block,
        "stats": {
            "total_analyzed": total_analyzed,
            "threats_blocked": threats_blocked
        }
    }

@api_router.patch("/profile")
async def update_profile(
    data: UserUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user profile"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_data}
        )
    
    return {"message": "Perfil actualizado correctamente"}

# ============================================
# THREAT ANALYSIS ROUTES
# ============================================

async def analyze_threat(content: str, content_type: str) -> dict:
    """Analyze content for threats using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"fraud-analysis-{uuid.uuid4()}",
            system_message="""Eres un experto en detección de fraudes y amenazas digitales.
Analiza el contenido proporcionado y determina si es una amenaza potencial.
Identifica: phishing, smishing, vishing, estafas, suplantación de identidad.
Responde en formato JSON con:
{
  "is_threat": boolean,
  "risk_level": "low"|"medium"|"high"|"critical",
  "threat_types": [lista de tipos de amenaza detectados],
  "recommendation": "recomendación clara en español",
  "analysis": "análisis detallado en español"
}"""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"Tipo de contenido: {content_type}\n\nContenido a analizar:\n{content}"
        )
        
        response = await chat.send_message(user_message)
        
        import json
        result = json.loads(response)
        return result
    except Exception as e:
        logging.error(f"Error in threat analysis: {e}")
        return {
            "is_threat": False,
            "risk_level": "low",
            "threat_types": [],
            "recommendation": "No se pudo analizar el contenido",
            "analysis": f"Error en el análisis: {str(e)}"
        }

@api_router.get("/")
async def root():
    return {"message": "MANO API - Protección contra fraudes"}

@api_router.post("/analyze", response_model=ThreatAnalysis)
async def analyze_content(
    data: AnalyzeRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze content for potential threats"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    analysis_result = await analyze_threat(data.content, data.content_type)
    
    threat_obj = ThreatAnalysis(
        user_id=user_id,
        content=data.content,
        content_type=data.content_type,
        risk_level=analysis_result["risk_level"],
        is_threat=analysis_result["is_threat"],
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result["recommendation"],
        analysis=analysis_result["analysis"]
    )
    
    doc = threat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.threats.insert_one(doc)
    
    # Create community alert for high severity threats
    if threat_obj.is_threat and threat_obj.risk_level in ["critical", "high"]:
        community_alert = CommunityAlert(
            threat_type=", ".join(threat_obj.threat_types[:2]) if threat_obj.threat_types else "Amenaza detectada",
            description=threat_obj.recommendation[:100],
            severity=threat_obj.risk_level,
            affected_users=1
        )
        alert_doc = community_alert.model_dump()
        alert_doc['created_at'] = alert_doc['created_at'].isoformat()
        await db.community_alerts.insert_one(alert_doc)
    
    return threat_obj

@api_router.get("/threats")
async def get_threats(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get user's threat history"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    threats = await db.threats.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return threats

@api_router.post("/threats/{threat_id}/share")
async def share_threat(
    threat_id: str,
    data: ShareRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Share a threat alert"""
    user = await require_auth(request, session_token)
    
    threat = await db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    # Update share count
    await db.threats.update_one(
        {"id": threat_id},
        {"$inc": {"shared_count": 1}}
    )
    
    # Generate share content
    share_text = f"⚠️ ALERTA DE SEGURIDAD - {threat.get('threat_types', ['Amenaza'])[0] if threat.get('threat_types') else 'Amenaza detectada'}\n\n{threat.get('recommendation', 'Posible amenaza detectada')}\n\nProtégete con MANO: mano-protect.com"
    
    if data.share_type == "whatsapp":
        share_url = f"https://wa.me/?text={share_text}"
    elif data.share_type == "email":
        share_url = f"mailto:{data.recipient or ''}?subject=Alerta de seguridad MANO&body={share_text}"
    else:
        share_url = None
    
    return {
        "message": "Compartido correctamente",
        "share_url": share_url,
        "share_text": share_text
    }

@api_router.post("/threats/{threat_id}/report")
async def report_false_positive(
    threat_id: str,
    data: FalsePositiveReport,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Report a threat as false positive"""
    user = await require_auth(request, session_token)
    
    threat = await db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    # Update threat
    await db.threats.update_one(
        {"id": threat_id},
        {"$set": {"reported_false_positive": True}}
    )
    
    # Log report
    await db.false_positive_reports.insert_one({
        "threat_id": threat_id,
        "user_id": user.user_id,
        "reason": data.reason,
        "additional_info": data.additional_info,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Reporte de falso positivo registrado. Gracias por ayudarnos a mejorar."}

@api_router.get("/export/threats")
async def export_threats(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    format: str = "csv"
):
    """Export threat history"""
    user = await require_auth(request, session_token)
    
    threats = await db.threats.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    if format == "csv":
        if not threats:
            return {"data": "", "format": "csv", "filename": "mano_threats_export.csv"}
        
        output = io.StringIO()
        fieldnames = ["id", "content_type", "risk_level", "is_threat", "recommendation", "created_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(threats)
        
        return {
            "data": output.getvalue(),
            "format": "csv",
            "filename": f"mano_threats_{user.user_id}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    else:
        return {
            "data": threats,
            "format": "json",
            "filename": f"mano_threats_{user.user_id}_{datetime.now().strftime('%Y%m%d')}.json"
        }

@api_router.get("/stats")
async def get_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user statistics"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    total = await db.threats.count_documents({"user_id": user_id})
    threats_blocked = await db.threats.count_documents({"user_id": user_id, "is_threat": True})
    
    critical = await db.threats.count_documents({"user_id": user_id, "risk_level": "critical"})
    high = await db.threats.count_documents({"user_id": user_id, "risk_level": "high"})
    medium = await db.threats.count_documents({"user_id": user_id, "risk_level": "medium"})
    low = await db.threats.count_documents({"user_id": user_id, "risk_level": "low"})
    
    return {
        "total_analyzed": total,
        "threats_blocked": threats_blocked,
        "protection_rate": round((threats_blocked / total * 100) if total > 0 else 100, 1),
        "risk_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        }
    }

# ============================================
# CONTACTS ROUTES
# ============================================

@api_router.post("/contacts", response_model=TrustedContact)
async def create_contact(
    contact: TrustedContactCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create trusted contact"""
    user = await require_auth(request, session_token)
    
    contact_obj = TrustedContact(
        user_id=user.user_id,
        name=contact.name,
        phone=contact.phone,
        relationship=contact.relationship,
        is_emergency=contact.is_emergency,
        receive_alerts=contact.receive_alerts
    )
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    
    return contact_obj

@api_router.get("/contacts")
async def get_contacts(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's trusted contacts"""
    user = await require_auth(request, session_token)
    
    contacts = await db.contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    return contacts

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete trusted contact"""
    user = await require_auth(request, session_token)
    
    result = await db.contacts.delete_one({
        "id": contact_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    return {"message": "Contacto eliminado"}

@api_router.patch("/contacts/{contact_id}")
async def update_contact(
    contact_id: str,
    data: TrustedContactCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update trusted contact"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    result = await db.contacts.update_one(
        {"id": contact_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    return {"message": "Contacto actualizado"}

# ============================================
# SOS / FAMILY MODE ROUTES
# ============================================

@api_router.post("/sos", response_model=SOSAlert)
async def trigger_sos(
    data: SOSRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Trigger SOS alert to emergency contacts"""
    user = await require_auth(request, session_token)
    
    # Get emergency contacts
    contacts = await db.contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(10)
    
    contact_ids = [c["id"] for c in contacts]
    
    sos_obj = SOSAlert(
        user_id=user.user_id,
        location=data.location,
        message=data.message or "¡Necesito ayuda! Posible situación de fraude o estafa.",
        contacts_notified=contact_ids
    )
    
    doc = sos_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sos_alerts.insert_one(doc)
    
    return sos_obj

@api_router.get("/sos/history")
async def get_sos_history(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get SOS alert history"""
    user = await require_auth(request, session_token)
    
    alerts = await db.sos_alerts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return alerts

@api_router.get("/family/members")
async def get_family_members(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family members (for family plans)"""
    user = await require_auth(request, session_token)
    
    # Allow family and enterprise plans
    plan_features = PLAN_FEATURES.get(user.plan.split('-')[0], PLAN_FEATURES["free"])
    if plan_features["max_users"] < 2:
        raise HTTPException(status_code=403, detail="Se requiere plan familiar o superior")
    
    members = await db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return members

# ============================================
# SOS & GPS ROUTES (Family Plan)
# ============================================

class SOSAlertRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    message: Optional[str] = "¡Necesito ayuda!"

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    battery_level: Optional[int] = None

@api_router.post("/sos/alert")
async def send_sos_alert(
    data: SOSAlertRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send SOS alert with GPS location (family plan only)"""
    user = await require_auth(request, session_token)
    
    # Check if user has SOS feature
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = PLAN_FEATURES.get(plan_key, PLAN_FEATURES["free"])
    
    if not plan_features.get("sos"):
        raise HTTPException(status_code=403, detail="La función SOS requiere plan familiar o superior")
    
    # Create SOS alert
    alert_id = f"sos_{uuid.uuid4().hex[:12]}"
    sos_alert = {
        "alert_id": alert_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "location": {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "accuracy": data.accuracy,
            "google_maps_url": f"https://maps.google.com/?q={data.latitude},{data.longitude}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "message": data.message,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.sos_alerts.insert_one(sos_alert)
    
    # Get family contacts to notify
    family_members = await db.family_members.find(
        {"family_owner_id": user.user_id, "emergency_contact": True},
        {"_id": 0}
    ).to_list(10)
    
    # Get trusted contacts
    trusted_contacts = await db.trusted_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Create notifications for all contacts
    notifications_sent = []
    all_contacts = family_members + trusted_contacts
    
    for contact in all_contacts:
        notification = {
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": contact.get("user_id") or contact.get("contact_id"),
            "type": "sos_alert",
            "title": "🆘 ALERTA SOS",
            "message": f"{user.name} ha enviado una alerta de emergencia: {data.message}",
            "data": {
                "alert_id": alert_id,
                "sender_name": user.name,
                "location": sos_alert["location"]
            },
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
        notifications_sent.append(contact.get("name") or contact.get("email"))
    
    return {
        "success": True,
        "alert_id": alert_id,
        "message": "Alerta SOS enviada correctamente",
        "location": sos_alert["location"],
        "contacts_notified": len(notifications_sent),
        "contacts": notifications_sent
    }

@api_router.post("/location/update")
async def update_location(
    data: LocationUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's current location (for family tracking)"""
    user = await require_auth(request, session_token)
    
    # Check if user has GPS feature
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = PLAN_FEATURES.get(plan_key, PLAN_FEATURES["free"])
    
    if not plan_features.get("gps"):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan familiar o superior")
    
    # Update location
    location_data = {
        "user_id": user.user_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "battery_level": data.battery_level,
        "google_maps_url": f"https://maps.google.com/?q={data.latitude},{data.longitude}",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_locations.update_one(
        {"user_id": user.user_id},
        {"$set": location_data},
        upsert=True
    )
    
    return {"success": True, "message": "Ubicación actualizada"}

@api_router.get("/location/family")
async def get_family_locations(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get locations of all family members (family plan owner only)"""
    user = await require_auth(request, session_token)
    
    # Check if user has GPS feature
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = PLAN_FEATURES.get(plan_key, PLAN_FEATURES["free"])
    
    if not plan_features.get("gps"):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan familiar o superior")
    
    # Get family members
    family_members = await db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get locations for each member
    locations = []
    for member in family_members:
        member_location = await db.user_locations.find_one(
            {"user_id": member.get("user_id")},
            {"_id": 0}
        )
        if member_location:
            locations.append({
                "member_id": member.get("member_id"),
                "name": member.get("name"),
                "relationship": member.get("relationship"),
                "location": member_location
            })
    
    return {
        "family_owner": user.name,
        "members_count": len(family_members),
        "locations": locations
    }

@api_router.get("/sos/history")
async def get_sos_history(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get SOS alert history"""
    user = await require_auth(request, session_token)
    
    alerts = await db.sos_alerts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return alerts

@api_router.post("/sos/cancel/{alert_id}")
async def cancel_sos_alert(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel an active SOS alert"""
    user = await require_auth(request, session_token)
    
    result = await db.sos_alerts.update_one(
        {"alert_id": alert_id, "user_id": user.user_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return {"success": True, "message": "Alerta cancelada"}

@api_router.post("/contacts/trusted")
async def add_trusted_contact(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    name: str = "",
    phone: str = "",
    email: str = "",
    relationship: str = ""
):
    """Add a trusted contact for SOS alerts"""
    user = await require_auth(request, session_token)
    
    contact = {
        "contact_id": f"contact_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": name,
        "phone": phone,
        "email": email,
        "relationship": relationship,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.trusted_contacts.insert_one(contact)
    
    return {"success": True, "contact": contact}

@api_router.get("/contacts/trusted")
async def get_trusted_contacts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's trusted contacts"""
    user = await require_auth(request, session_token)
    
    contacts = await db.trusted_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    return contacts

# ============================================
# CHILD TRACKING ROUTES (Family Yearly Plan Only)
# ============================================

class ChildMember(BaseModel):
    name: str
    phone: str
    is_child: bool = True
    silent_mode: bool = False  # If True, child won't be notified when tracked

class LocationRequest(BaseModel):
    child_id: str
    silent: Optional[bool] = None  # Override silent_mode for this request

def get_plan_features_for_user(user: User) -> dict:
    """Get features based on user's specific plan"""
    plan = user.plan
    # Check for specific plan like family-yearly
    if plan in PLAN_FEATURES:
        return PLAN_FEATURES[plan]
    # Fallback to base plan type
    base_plan = plan.split('-')[0] if '-' in plan else plan
    return PLAN_FEATURES.get(base_plan, PLAN_FEATURES["free"])

@api_router.post("/family/children/add")
async def add_child_member(
    data: ChildMember,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a child to the family for tracking (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        raise HTTPException(
            status_code=403, 
            detail="La localización de niños requiere el Plan Familiar Anual. Actualiza tu plan para acceder a esta función."
        )
    
    child = {
        "child_id": f"child_{uuid.uuid4().hex[:12]}",
        "family_owner_id": user.user_id,
        "name": data.name,
        "phone": data.phone,
        "is_child": True,
        "silent_mode": data.silent_mode,
        "device_linked": False,
        "last_location": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.family_children.insert_one(child)
    
    return {
        "success": True, 
        "child": {k: v for k, v in child.items() if k != "_id"},
        "message": f"Niño '{data.name}' añadido. Instala la app MANO en su teléfono para completar la vinculación."
    }

@api_router.get("/family/children")
async def get_family_children(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all children in the family"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        return {
            "children": [],
            "feature_available": False,
            "upgrade_message": "Actualiza al Plan Familiar Anual para localizar a tus hijos"
        }
    
    children = await db.family_children.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return {
        "children": children,
        "feature_available": True
    }

@api_router.post("/family/children/{child_id}/locate")
async def locate_child(
    child_id: str,
    request: Request,
    silent: bool = False,
    session_token: Optional[str] = Cookie(None)
):
    """Request location of a child (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        raise HTTPException(
            status_code=403, 
            detail="La localización de niños requiere el Plan Familiar Anual"
        )
    
    # Find child
    child = await db.family_children.find_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not child:
        raise HTTPException(status_code=404, detail="Niño no encontrado en tu familia")
    
    # Determine if notification should be sent
    use_silent = silent if silent is not None else child.get("silent_mode", False)
    
    # Create location request
    location_request = {
        "request_id": f"locreq_{uuid.uuid4().hex[:12]}",
        "child_id": child_id,
        "requester_id": user.user_id,
        "requester_name": user.name,
        "silent_mode": use_silent,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.location_requests.insert_one(location_request)
    
    # If not silent, create notification for child's device
    if not use_silent:
        notification = {
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "target_phone": child.get("phone"),
            "type": "location_request",
            "title": "📍 Solicitud de ubicación",
            "message": f"{user.name} ha solicitado ver tu ubicación",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
    
    # In a real app, this would send a push notification to the child's device
    # For now, we simulate getting the location
    
    return {
        "success": True,
        "request_id": location_request["request_id"],
        "child_name": child.get("name"),
        "silent_mode": use_silent,
        "message": "Solicitud de ubicación enviada" if not use_silent else "Solicitud de ubicación enviada (modo silencioso)",
        "note": "La ubicación aparecerá cuando el dispositivo del niño responda"
    }

@api_router.post("/family/children/{child_id}/update-location")
async def update_child_location(
    child_id: str,
    latitude: float,
    longitude: float,
    accuracy: float = 0,
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Update child's location (called from child's device)"""
    # This endpoint would be called by the child's app
    
    # Update child's last location
    location_data = {
        "latitude": latitude,
        "longitude": longitude,
        "accuracy": accuracy,
        "google_maps_url": f"https://maps.google.com/?q={latitude},{longitude}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.family_children.update_one(
        {"child_id": child_id},
        {"$set": {"last_location": location_data, "device_linked": True}}
    )
    
    # Add to location history
    history_entry = {
        "history_id": f"hist_{uuid.uuid4().hex[:12]}",
        "child_id": child_id,
        "location": location_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.location_history.insert_one(history_entry)
    
    # Mark any pending requests as completed
    await db.location_requests.update_many(
        {"child_id": child_id, "status": "pending"},
        {"$set": {"status": "completed", "location": location_data}}
    )
    
    return {"success": True}

@api_router.get("/family/children/{child_id}/history")
async def get_child_location_history(
    child_id: str,
    request: Request,
    days: int = 7,
    session_token: Optional[str] = Cookie(None)
):
    """Get location history of a child (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("location_history"):
        raise HTTPException(
            status_code=403, 
            detail="El historial de ubicaciones requiere el Plan Familiar Anual"
        )
    
    # Verify child belongs to user
    child = await db.family_children.find_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not child:
        raise HTTPException(status_code=404, detail="Niño no encontrado en tu familia")
    
    # Get history from the last N days
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    history = await db.location_history.find(
        {"child_id": child_id, "created_at": {"$gte": from_date}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "child": child,
        "history": history,
        "days_requested": days
    }

@api_router.patch("/family/children/{child_id}/settings")
async def update_child_settings(
    child_id: str,
    request: Request,
    silent_mode: Optional[bool] = None,
    name: Optional[str] = None,
    session_token: Optional[str] = Cookie(None)
):
    """Update child tracking settings"""
    user = await require_auth(request, session_token)
    
    update_data = {}
    if silent_mode is not None:
        update_data["silent_mode"] = silent_mode
    if name:
        update_data["name"] = name
    
    if not update_data:
        return {"success": True, "message": "No hay cambios"}
    
    result = await db.family_children.update_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Niño no encontrado")
    
    return {
        "success": True, 
        "message": "Configuración actualizada",
        "silent_mode": silent_mode
    }

@api_router.delete("/family/children/{child_id}")
async def remove_child(
    child_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove a child from the family"""
    user = await require_auth(request, session_token)
    
    result = await db.family_children.delete_one(
        {"child_id": child_id, "family_owner_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Niño no encontrado")
    
    # Also delete their location history
    await db.location_history.delete_many({"child_id": child_id})
    
    return {"success": True, "message": "Niño eliminado del seguimiento familiar"}

# ============================================
# COMMUNITY ROUTES
# ============================================

@api_router.get("/community-alerts")
async def get_community_alerts(limit: int = 20):
    """Get recent community alerts"""
    alerts = await db.community_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return alerts

@api_router.get("/knowledge-base")
async def get_knowledge_base():
    """Get knowledge base about threats"""
    return {
        "threat_types": [
            {
                "id": "phishing",
                "name": "Phishing",
                "description": "Correos electrónicos fraudulentos que intentan robar información personal o credenciales.",
                "indicators": ["Enlaces sospechosos", "Urgencia artificial", "Errores ortográficos", "Remitente desconocido"],
                "prevention": "Verifica siempre el remitente, no hagas clic en enlaces sospechosos, contacta directamente a la empresa."
            },
            {
                "id": "smishing",
                "name": "Smishing",
                "description": "Mensajes SMS fraudulentos que buscan engañarte para revelar información o hacer clic en enlaces maliciosos.",
                "indicators": ["Premios falsos", "Enlaces acortados", "Solicitudes urgentes", "Números desconocidos"],
                "prevention": "No respondas a SMS de números desconocidos, no hagas clic en enlaces, verifica con la entidad oficial."
            },
            {
                "id": "vishing",
                "name": "Vishing",
                "description": "Llamadas telefónicas fraudulentas que se hacen pasar por entidades legítimas para obtener información.",
                "indicators": ["Presión para actuar rápido", "Solicitud de datos sensibles", "Números ocultos", "Amenazas"],
                "prevention": "Cuelga y llama tú al número oficial, nunca des información por teléfono, desconfía de la urgencia."
            },
            {
                "id": "identity-theft",
                "name": "Suplantación de Identidad",
                "description": "Cuando alguien se hace pasar por una persona u organización legítima para engañarte.",
                "indicators": ["Perfiles falsos", "Solicitudes inusuales", "Cambios en servicios", "Transacciones no autorizadas"],
                "prevention": "Verifica la identidad por canales oficiales, usa autenticación de dos factores, monitorea tus cuentas."
            }
        ]
    }

@api_router.get("/plans")
async def get_available_plans():
    """Get all available subscription plans with features"""
    plans = [
        {
            "id": "free",
            "name": "Gratis",
            "price": 0,
            "period": "mes",
            "max_users": 1,
            "features": [
                "Análisis básico de amenazas",
                "Alertas limitadas (5/día)",
                "Protección para 1 usuario"
            ],
            "limitations": ["Sin IA avanzada", "Sin GPS", "Sin SOS"]
        },
        {
            "id": "personal",
            "name": "Personal",
            "price": 9.99,
            "period": "mes",
            "max_users": 2,
            "features": [
                "Análisis ilimitado con IA",
                "Alertas en tiempo real",
                "Protección para hasta 2 usuarios",
                "Soporte prioritario"
            ],
            "popular": False
        },
        {
            "id": "family",
            "name": "Familiar",
            "price": 19.99,
            "period": "mes",
            "max_users": 5,
            "features": [
                "Todo de Personal",
                "Protección para hasta 5 usuarios",
                "📍 GPS y ubicación en tiempo real",
                "🆘 Botón SOS de emergencia",
                "👴 Modo simplificado para mayores",
                "Panel de control familiar"
            ],
            "popular": True
        },
        {
            "id": "business",
            "name": "Business",
            "price": 49.99,
            "period": "mes",
            "max_users": 25,
            "features": [
                "Protección para hasta 25 empleados",
                "Dashboard empresarial",
                "Reportes de amenazas",
                "API básica de integración",
                "Soporte dedicado"
            ],
            "popular": False
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price": 199.99,
            "period": "mes",
            "max_users": -1,
            "features": [
                "Usuarios ilimitados",
                "Todo incluido",
                "API completa",
                "GPS y SOS",
                "Soporte 24/7",
                "Personalización completa",
                "Account manager dedicado"
            ],
            "popular": False
        }
    ]
    
    return {
        "plans": plans,
        "currency": "EUR",
        "billing_options": ["monthly", "quarterly", "yearly"],
        "discounts": {
            "quarterly": 15,
            "yearly": 30
        }
    }

# ============================================
# STRIPE PAYMENT ROUTES
# ============================================

@api_router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout session"""
    user = await get_current_user(http_request, session_token)
    user_id = user.user_id if user else "anonymous"
    user_email = user.email if user else "anonymous@mano.com"
    
    try:
        package = SUBSCRIPTION_PACKAGES.get(data.plan_type)
        if not package:
            raise HTTPException(status_code=400, detail="Plan de suscripción no válido")
        
        success_url = f"{data.origin_url}/pricing?session_id={{CHECKOUT_SESSION_ID}}&success=true"
        cancel_url = f"{data.origin_url}/pricing?canceled=true"
        
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        checkout_request = CheckoutSessionRequest(
            amount=package["amount"],
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "email": user_email,
                "plan_type": data.plan_type,
                "plan_name": package["name"]
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        transaction = PaymentTransaction(
            session_id=session.session_id,
            user_id=user_id,
            email=user_email,
            plan_type=data.plan_type,
            amount=package["amount"],
            currency="eur",
            status="pending",
            payment_status="initiated",
            metadata={"plan_name": package["name"], "plan_period": package["period"]}
        )
        
        tx_doc = transaction.model_dump()
        tx_doc['created_at'] = tx_doc['created_at'].isoformat()
        tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
        await db.payment_transactions.insert_one(tx_doc)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al crear sesión de pago: {str(e)}")

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Get checkout session status"""
    try:
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        existing_tx = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if existing_tx and existing_tx.get('payment_status') == 'paid':
            return {
                "status": status.status,
                "payment_status": "paid",
                "amount_total": status.amount_total,
                "currency": status.currency,
                "already_processed": True
            }
        
        new_status = "completed" if status.payment_status == "paid" else status.status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": new_status,
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if status.payment_status == "paid" and existing_tx:
            await db.users.update_one(
                {"user_id": existing_tx.get("user_id")},
                {"$set": {
                    "plan": existing_tx.get("plan_type"),
                    "subscription_status": "active",
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "metadata": status.metadata
        }
    
    except Exception as e:
        logging.error(f"Checkout status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(
            payload,
            request.headers.get("Stripe-Signature")
        )
        
        if webhook_response.session_id:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": webhook_response.event_type,
                    "payment_status": webhook_response.payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            if webhook_response.payment_status == "paid":
                tx = await db.payment_transactions.find_one(
                    {"session_id": webhook_response.session_id},
                    {"_id": 0}
                )
                if tx:
                    await db.users.update_one(
                        {"user_id": tx.get("user_id")},
                        {"$set": {
                            "plan": tx.get("plan_type"),
                            "subscription_status": "active"
                        }},
                        upsert=True
                    )
        
        return {"status": "success", "event_type": webhook_response.event_type}
    
    except Exception as e:
        logging.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# ADMIN ROUTES
# ============================================

@api_router.post("/admin/create-admin")
async def create_admin_user(email: str, name: str, password: str):
    """Create admin user (use once, then remove or protect)"""
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        await db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
        return {"message": "Usuario actualizado a admin"}
    
    user = User(
        email=email,
        name=name,
        auth_provider="email",
        password_hash=hash_password(password),
        role="admin"
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    return {"message": "Admin creado", "user_id": user.user_id}

# ============================================
# ENTERPRISE DASHBOARD ROUTES
# ============================================

class EnterpriseDepartment(BaseModel):
    name: str
    employee_count: int = 0
    threats_blocked: int = 0
    risk_score: float = 0.0

@api_router.get("/enterprise/dashboard")
async def get_enterprise_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get enterprise dashboard with advanced metrics"""
    user = await require_auth(request, session_token)
    
    # Get all threat analyses for the organization
    threats = await db.threat_analysis.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    # Calculate metrics
    total_threats = len(threats)
    threats_blocked = len([t for t in threats if t.get("is_threat")])
    
    # Risk distribution
    risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for t in threats:
        level = t.get("risk_level", "low")
        if level in risk_counts:
            risk_counts[level] += 1
    
    # Threat types distribution
    threat_types_count = {}
    for t in threats:
        for tt in t.get("threat_types", []):
            threat_types_count[tt] = threat_types_count.get(tt, 0) + 1
    
    # Calculate money saved (estimated €500 per blocked threat)
    money_saved = threats_blocked * 500
    
    # Time-based analysis (last 30 days)
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    daily_threats = {}
    for t in threats:
        created = t.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created.replace('Z', '+00:00'))
            except:
                continue
        if created and created > thirty_days_ago:
            day_key = created.strftime("%Y-%m-%d")
            daily_threats[day_key] = daily_threats.get(day_key, 0) + 1
    
    # Generate last 30 days trend
    trend_data = []
    for i in range(30):
        day = (now - timedelta(days=29-i)).strftime("%Y-%m-%d")
        trend_data.append({
            "date": day,
            "threats": daily_threats.get(day, 0)
        })
    
    # Simulated departments (in production, this would come from org structure)
    departments = [
        {"name": "Dirección", "employee_count": 5, "threats_blocked": int(threats_blocked * 0.1), "risk_score": 2.3},
        {"name": "Finanzas", "employee_count": 12, "threats_blocked": int(threats_blocked * 0.35), "risk_score": 4.7},
        {"name": "Comercial", "employee_count": 25, "threats_blocked": int(threats_blocked * 0.3), "risk_score": 3.8},
        {"name": "IT", "employee_count": 8, "threats_blocked": int(threats_blocked * 0.15), "risk_score": 2.1},
        {"name": "RRHH", "employee_count": 6, "threats_blocked": int(threats_blocked * 0.1), "risk_score": 3.2}
    ]
    
    return {
        "summary": {
            "total_analyzed": total_threats,
            "threats_blocked": threats_blocked,
            "protection_rate": round((threats_blocked / total_threats * 100) if total_threats > 0 else 100, 1),
            "money_saved": money_saved,
            "active_employees": sum(d["employee_count"] for d in departments)
        },
        "risk_distribution": risk_counts,
        "threat_types": threat_types_count,
        "trend_data": trend_data,
        "departments": departments,
        "recent_alerts": threats[:10] if threats else []
    }

@api_router.get("/enterprise/reports")
async def get_enterprise_reports(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    period: str = "month"
):
    """Get enterprise reports for specified period"""
    user = await require_auth(request, session_token)
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=365)
    
    # Get threat analyses in period
    threats = await db.threat_analysis.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    period_threats = []
    by_type = {}
    by_risk = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    for t in threats:
        created = t.get("created_at")
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created.replace('Z', '+00:00'))
            except:
                continue
        if created and created > start_date:
            period_threats.append(t)
            # Count by type
            for tt in t.get("threat_types", []):
                by_type[tt] = by_type.get(tt, 0) + 1
            # Count by risk
            risk = t.get("risk_level", "low")
            if risk in by_risk:
                by_risk[risk] += 1
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat(),
        "total_threats": len(period_threats),
        "blocked": len([t for t in period_threats if t.get("is_threat")]),
        "by_type": by_type,
        "by_risk": by_risk,
        "generated_at": now.isoformat()
    }

# ============================================
# FAMILY ADMIN ROUTES
# ============================================

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"member_{uuid.uuid4().hex[:8]}")
    family_owner_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str  # "hijo", "hija", "padre", "madre", "abuelo", "abuela", etc.
    is_senior: bool = False
    simplified_mode: bool = False
    alert_level: str = "all"  # "all", "high", "critical"
    threats_count: int = 0
    last_activity: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FamilyMemberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str
    is_senior: Optional[bool] = False
    simplified_mode: Optional[bool] = False
    alert_level: Optional[str] = "all"

class FamilyAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"falert_{uuid.uuid4().hex[:8]}")
    family_owner_id: str
    member_id: str
    member_name: str
    alert_type: str  # "threat_detected", "sos_triggered", "suspicious_activity"
    severity: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/family/dashboard")
async def get_family_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family protection dashboard"""
    user = await require_auth(request, session_token)
    
    # Check if user has family plan
    if not user.plan or not user.plan.startswith("family"):
        # Allow access but show upgrade prompt
        pass
    
    # Get family members
    members = await db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get family alerts
    alerts = await db.family_alerts.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Calculate stats
    total_threats = sum(m.get("threats_count", 0) for m in members)
    senior_members = len([m for m in members if m.get("is_senior")])
    unread_alerts = len([a for a in alerts if not a.get("is_read")])
    
    return {
        "members": members,
        "alerts": alerts,
        "stats": {
            "total_members": len(members),
            "senior_members": senior_members,
            "total_threats_blocked": total_threats,
            "unread_alerts": unread_alerts,
            "protection_active": True
        },
        "has_family_plan": user.plan and user.plan.startswith("family")
    }

@api_router.post("/family/members")
async def add_family_member(
    data: FamilyMemberCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a family member to protection"""
    user = await require_auth(request, session_token)
    
    # Check member limit (5 for family plan)
    existing_count = await db.family_members.count_documents({"family_owner_id": user.user_id})
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros familiares alcanzado")
    
    member = FamilyMember(
        family_owner_id=user.user_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        relationship=data.relationship,
        is_senior=data.is_senior,
        simplified_mode=data.simplified_mode or data.is_senior,
        alert_level=data.alert_level
    )
    
    doc = member.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_activity'):
        doc['last_activity'] = doc['last_activity'].isoformat()
    await db.family_members.insert_one(doc)
    
    return {"message": "Miembro familiar añadido", "member_id": member.id}

@api_router.patch("/family/members/{member_id}")
async def update_family_member(
    member_id: str,
    data: FamilyMemberCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update family member settings"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    result = await db.family_members.update_one(
        {"id": member_id, "family_owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro actualizado"}

@api_router.delete("/family/members/{member_id}")
async def remove_family_member(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove family member from protection"""
    user = await require_auth(request, session_token)
    
    result = await db.family_members.delete_one({
        "id": member_id,
        "family_owner_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro eliminado"}

@api_router.get("/family/members/{member_id}/activity")
async def get_member_activity(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get activity history for a family member"""
    user = await require_auth(request, session_token)
    
    member = await db.family_members.find_one(
        {"id": member_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    # Get member's threats (simulated - in production would be linked to member's account)
    alerts = await db.family_alerts.find(
        {"member_id": member_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return {
        "member": member,
        "activity": alerts,
        "stats": {
            "total_alerts": len(alerts),
            "threats_blocked": member.get("threats_count", 0)
        }
    }

@api_router.post("/family/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark family alert as read"""
    user = await require_auth(request, session_token)
    
    await db.family_alerts.update_one(
        {"id": alert_id, "family_owner_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Alerta marcada como leída"}

# ============================================
# NOTIFICATIONS ROUTES
# ============================================

class NotificationSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"sub_{uuid.uuid4().hex[:8]}")
    user_id: str
    endpoint: str
    keys: Dict[str, str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"notif_{uuid.uuid4().hex[:8]}")
    user_id: str
    title: str
    body: str
    notification_type: str  # "threat", "sos", "family", "system"
    data: Dict = {}
    is_read: bool = False
    is_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionRequest(BaseModel):
    endpoint: str
    keys: Dict[str, str]

class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    threat_alerts: bool = True
    family_alerts: bool = True
    marketing: bool = False

@api_router.post("/notifications/subscribe")
async def subscribe_push(
    data: SubscriptionRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Subscribe to push notifications"""
    user = await require_auth(request, session_token)
    
    # Check if already subscribed
    existing = await db.push_subscriptions.find_one(
        {"user_id": user.user_id, "endpoint": data.endpoint}
    )
    
    if existing:
        return {"message": "Ya estás suscrito a notificaciones"}
    
    subscription = NotificationSubscription(
        user_id=user.user_id,
        endpoint=data.endpoint,
        keys=data.keys
    )
    
    doc = subscription.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.push_subscriptions.insert_one(doc)
    
    return {"message": "Suscripción a notificaciones activada"}

@api_router.delete("/notifications/unsubscribe")
async def unsubscribe_push(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Unsubscribe from push notifications"""
    user = await require_auth(request, session_token)
    
    await db.push_subscriptions.delete_many({"user_id": user.user_id})
    
    return {"message": "Suscripción cancelada"}

@api_router.get("/notifications")
async def get_notifications(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get user notifications"""
    user = await require_auth(request, session_token)
    
    notifications = await db.notifications.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    unread_count = await db.notifications.count_documents({
        "user_id": user.user_id,
        "is_read": False
    })
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark notification as read"""
    user = await require_auth(request, session_token)
    
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Notificación marcada como leída"}

@api_router.post("/notifications/read-all")
async def mark_all_notifications_read(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark all notifications as read"""
    user = await require_auth(request, session_token)
    
    await db.notifications.update_many(
        {"user_id": user.user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Todas las notificaciones marcadas como leídas"}

@api_router.get("/notifications/preferences")
async def get_notification_preferences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get notification preferences"""
    user = await require_auth(request, session_token)
    
    prefs = await db.notification_preferences.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not prefs:
        prefs = {
            "email_notifications": True,
            "push_notifications": True,
            "threat_alerts": True,
            "family_alerts": True,
            "marketing": False
        }
    
    return prefs

@api_router.patch("/notifications/preferences")
async def update_notification_preferences(
    data: NotificationPreferences,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update notification preferences"""
    user = await require_auth(request, session_token)
    
    prefs_data = data.model_dump()
    prefs_data["user_id"] = user.user_id
    
    await db.notification_preferences.update_one(
        {"user_id": user.user_id},
        {"$set": prefs_data},
        upsert=True
    )
    
    return {"message": "Preferencias actualizadas"}

# Helper function to create notification
async def create_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    """Create and store a notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    
    doc = notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    
    return notification

# ============================================
# PDF GENERATION ROUTES
# ============================================

@api_router.get("/investor/download-pdf/{doc_type}")
async def download_investor_pdf(
    doc_type: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Download document as HTML (styled for printing/PDF conversion) - investor only"""
    import markdown2
    
    user = await require_investor(request, session_token)
    
    doc_map = {
        "business-plan": "/app/memory/plan-de-negocio-completo.md",
        "financial-model": "/app/memory/financial-model.md",
        "pitch-deck": "/app/memory/pitch-deck-inversores.md",
        "dossier-b2b": "/app/memory/dossier-comercial-b2b.md"
    }
    
    file_path = doc_map.get(doc_type)
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Log download
    await db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": doc_type,
        "format": "pdf",
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Read markdown
    with open(file_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(md_content, extras=["tables", "fenced-code-blocks", "header-ids"])
    
    # Create styled HTML document (can be printed to PDF from browser)
    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MANO - {doc_type.replace('-', ' ').title()}</title>
    <style>
        @media print {{
            body {{ margin: 2cm; }}
            .no-print {{ display: none; }}
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        h1 {{
            color: #4338ca;
            font-size: 28pt;
            border-bottom: 3px solid #4338ca;
            padding-bottom: 15px;
            margin-top: 40px;
        }}
        h2 {{
            color: #4338ca;
            font-size: 20pt;
            margin-top: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }}
        h3 {{
            color: #374151;
            font-size: 16pt;
            margin-top: 25px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid #d1d5db;
            padding: 10px 15px;
            text-align: left;
        }}
        th {{
            background-color: #f3f4f6;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9fafb;
        }}
        code {{
            background-color: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11pt;
        }}
        pre {{
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }}
        blockquote {{
            border-left: 4px solid #4338ca;
            padding-left: 20px;
            margin: 20px 0;
            color: #4b5563;
            font-style: italic;
        }}
        ul, ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 8px 0;
        }}
        .header {{
            text-align: center;
            margin-bottom: 50px;
            padding: 30px;
            background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
            color: white;
            border-radius: 12px;
        }}
        .header h1 {{
            color: white;
            border: none;
            margin: 0 0 10px 0;
            font-size: 32pt;
        }}
        .header p {{
            margin: 0;
            font-size: 14pt;
            opacity: 0.9;
        }}
        .confidential {{
            text-align: center;
            color: #dc2626;
            font-weight: bold;
            margin: 30px 0;
            padding: 15px;
            border: 2px solid #dc2626;
            border-radius: 8px;
            background-color: #fef2f2;
        }}
        .print-btn {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4338ca;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14pt;
            box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
        }}
        .print-btn:hover {{
            background: #3730a3;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>MANO</h1>
        <p>Plataforma Integral de Protección contra Fraudes</p>
    </div>
    <div class="confidential">
        ⚠️ DOCUMENTO CONFIDENCIAL - Solo para inversores autorizados
    </div>
    {html_content}
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 10pt;">
        MANO © 2025 - Documento generado el {datetime.now().strftime('%d/%m/%Y')} - Confidencial
    </div>
    <button class="print-btn no-print" onclick="window.print()">Imprimir / Guardar PDF</button>
</body>
</html>"""
    
    filename = f"MANO_{doc_type.replace('-', '_')}_CONFIDENCIAL_2025.html"
    
    return Response(
        content=full_html,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

# ============================================
# ADMIN PANEL ROUTES (Enhanced)
# ============================================

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get admin dashboard overview"""
    await require_admin(request, session_token)
    
    # Get counts
    total_users = await db.users.count_documents({})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    pending_investors = await db.investor_requests.count_documents({"status": "pending"})
    approved_investors = await db.investor_requests.count_documents({"status": "approved"})
    
    # Get recent activity
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_threats = await db.threats.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Revenue (from successful payments)
    payments = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(p.get("amount", 0) for p in payments)
    
    return {
        "stats": {
            "total_users": total_users,
            "premium_users": premium_users,
            "free_users": total_users - premium_users,
            "pending_investors": pending_investors,
            "approved_investors": approved_investors,
            "total_revenue": total_revenue
        },
        "recent_users": recent_users,
        "recent_threats": recent_threats[:5]
    }

@api_router.get("/admin/users")
async def get_admin_users(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None
):
    """Get all users (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

# Email del único superadmin permitido (desde variable de entorno)
SUPERADMIN_EMAIL = os.environ.get("SUPERADMIN_EMAIL", "rrhh.milchollos@gmail.com")

@api_router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user role (superadmin only)"""
    await require_admin(request, session_token)
    
    if role not in ["user", "premium", "superadmin"]:
        raise HTTPException(status_code=400, detail="Rol inválido. Roles válidos: user, premium, superadmin")
    
    # Only allow superadmin role for the designated email
    if role == "superadmin":
        target_user = await db.users.find_one({"user_id": user_id})
        if target_user and target_user.get("email") != SUPERADMIN_EMAIL:
            raise HTTPException(
                status_code=403, 
                detail=f"Solo {SUPERADMIN_EMAIL} puede tener el rol de superadmin"
            )
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": f"Rol actualizado a {role}"}

@api_router.patch("/admin/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    plan: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user subscription plan (admin only) - Manual premium activation"""
    await require_admin(request, session_token)
    
    valid_plans = ["free", "personal", "family", "business", "enterprise"]
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Plan inválido. Planes válidos: {', '.join(valid_plans)}")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    # Update user plan
    update_data = {
        "plan": plan,
        "subscription_status": "active" if plan != "free" else None,
        "plan_updated_at": datetime.now(timezone.utc).isoformat(),
        "plan_updated_by": "admin_manual"
    }
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Log the plan change
    await db.admin_logs.insert_one({
        "action": "plan_change",
        "user_id": user_id,
        "old_plan": old_plan,
        "new_plan": plan,
        "changed_by": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": f"Plan actualizado de '{old_plan}' a '{plan}'",
        "user_id": user_id,
        "new_plan": plan
    }

@api_router.get("/admin/subscriptions")
async def get_admin_subscriptions(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all premium subscriptions with details (admin only)"""
    await require_admin(request, session_token)
    
    # Get all premium users
    premium_users = await db.users.find(
        {"plan": {"$ne": "free"}},
        {"_id": 0, "password_hash": 0}
    ).to_list(500)
    
    # Get subscription stats
    stats = {
        "total_premium": len(premium_users),
        "by_plan": {},
        "recent_upgrades": []
    }
    
    for user in premium_users:
        plan = user.get("plan", "unknown")
        stats["by_plan"][plan] = stats["by_plan"].get(plan, 0) + 1
    
    # Get recent plan changes
    recent_logs = await db.admin_logs.find(
        {"action": "plan_change"},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "subscribers": premium_users,
        "stats": stats,
        "recent_changes": recent_logs
    }


@api_router.patch("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Activate or deactivate a user (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Can't deactivate yourself
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Can't deactivate other superadmins
    if user.get("role") == "superadmin" and not is_active:
        raise HTTPException(status_code=400, detail="No puedes desactivar a otro superadmin")
    
    # Update user status
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_active": is_active}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "action": "user_status_change",
        "user_id": user_id,
        "is_active": is_active,
        "changed_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    status_text = "activado" if is_active else "dado de baja"
    return {
        "message": f"Usuario {status_text} correctamente",
        "user_id": user_id,
        "is_active": is_active
    }

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Permanently delete a user (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Can't delete yourself
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Can't delete other superadmins
    if user.get("role") == "superadmin":
        raise HTTPException(status_code=400, detail="No puedes eliminar a un superadmin")
    
    # Delete user and related data
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "action": "user_deleted",
        "user_id": user_id,
        "user_email": user.get("email"),
        "deleted_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": "Usuario eliminado permanentemente",
        "user_id": user_id
    }

@api_router.get("/admin/stats")
async def get_admin_stats(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get platform statistics (superadmin only)"""
    await require_admin(request, session_token)
    
    # User stats
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": {"$ne": False}})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    
    # Role distribution
    user_count = await db.users.count_documents({"role": "user"})
    premium_count = await db.users.count_documents({"role": "premium"})
    superadmin_count = await db.users.count_documents({"role": "superadmin"})
    
    # Plan distribution
    plan_stats = {}
    for plan in ["free", "personal", "family", "business", "enterprise"]:
        plan_stats[plan] = await db.users.count_documents({"plan": plan})
    
    # Recent activity
    recent_logins = await db.user_sessions.count_documents({
        "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()}
    })
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "premium": premium_users
        },
        "roles": {
            "user": user_count,
            "premium": premium_count,
            "superadmin": superadmin_count
        },
        "plans": plan_stats,
        "activity": {
            "logins_last_7_days": recent_logins
        }
    }


@api_router.get("/admin/payments")
async def get_admin_payments(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Get all payments (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if status:
        query["payment_status"] = status
    
    payments = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    return payments

@api_router.get("/admin/document-downloads")
async def get_document_downloads(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get document download history (admin only)"""
    await require_admin(request, session_token)
    
    downloads = await db.document_downloads.find({}, {"_id": 0}).sort("downloaded_at", -1).limit(100).to_list(100)
    
    return downloads

# ============================================
# WEB PUSH NOTIFICATIONS
# ============================================

from pywebpush import webpush, WebPushException
import json

# Generate VAPID keys (in production, store these securely)
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'cMCW8hLpP7Zl4l2n3Vh6_qJmJgwJJA-2VR-SqVGKlzE')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BNbxGYNMhEIi4d00Zc4Y-nLcQ6x8_V9P2z8gYJJ6zyZa0R0vWxyXlB8Gx9LzY8hFJhY0Q3c6BXGz0PjZkL8Jbyo')
VAPID_CLAIMS = {"sub": "mailto:alerts@mano-protect.com"}

class PushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]

@api_router.get("/push/vapid-public-key")
async def get_vapid_public_key():
    """Get VAPID public key for push subscription"""
    return {"public_key": VAPID_PUBLIC_KEY}

@api_router.post("/push/subscribe")
async def subscribe_to_push(
    subscription: PushSubscription,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Subscribe to web push notifications"""
    user = await require_auth(request, session_token)
    
    # Store subscription
    sub_doc = {
        "user_id": user.user_id,
        "endpoint": subscription.endpoint,
        "keys": subscription.keys,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Upsert to avoid duplicates
    await db.push_subscriptions.update_one(
        {"user_id": user.user_id, "endpoint": subscription.endpoint},
        {"$set": sub_doc},
        upsert=True
    )
    
    return {"message": "Suscripción activada", "success": True}

@api_router.delete("/push/unsubscribe")
async def unsubscribe_from_push(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Unsubscribe from push notifications"""
    user = await require_auth(request, session_token)
    
    await db.push_subscriptions.delete_many({"user_id": user.user_id})
    
    return {"message": "Suscripción cancelada"}

async def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """Send push notification to user"""
    subscriptions = await db.push_subscriptions.find(
        {"user_id": user_id}
    ).to_list(10)
    
    for sub in subscriptions:
        try:
            payload = json.dumps({
                "title": title,
                "body": body,
                "icon": "/logo192.png",
                "badge": "/logo192.png",
                "data": data or {},
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            webpush(
                subscription_info={
                    "endpoint": sub["endpoint"],
                    "keys": sub["keys"]
                },
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except WebPushException as e:
            logging.error(f"Push notification failed: {e}")
            # Remove invalid subscription
            if e.response and e.response.status_code in [404, 410]:
                await db.push_subscriptions.delete_one({"_id": sub["_id"]})

@api_router.post("/push/test")
async def test_push_notification(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send test push notification"""
    user = await require_auth(request, session_token)
    
    await send_push_notification(
        user.user_id,
        "🛡️ MANO - Notificación de Prueba",
        "¡Las notificaciones push están funcionando correctamente!",
        {"type": "test", "url": "/dashboard"}
    )
    
    return {"message": "Notificación de prueba enviada"}

# ============================================
# WHATSAPP INTEGRATION
# ============================================

class WhatsAppMessage(BaseModel):
    phone_number: str
    message: str

class WhatsAppAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"wa_{uuid.uuid4().hex[:8]}")
    user_id: str
    phone_number: str
    message_type: str  # "threat_alert", "sos", "family_alert", "reminder"
    message: str
    status: str = "pending"  # "pending", "sent", "delivered", "failed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# WhatsApp API configuration (using official Cloud API)
WHATSAPP_API_URL = os.environ.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v17.0')
WHATSAPP_PHONE_ID = os.environ.get('WHATSAPP_PHONE_ID', '')
WHATSAPP_ACCESS_TOKEN = os.environ.get('WHATSAPP_ACCESS_TOKEN', '')

@api_router.post("/whatsapp/send")
async def send_whatsapp_message(
    data: WhatsAppMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send WhatsApp message (requires WhatsApp Business API credentials)"""
    user = await require_auth(request, session_token)
    
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_ID:
        # Log message for later sending when configured
        alert = WhatsAppAlert(
            user_id=user.user_id,
            phone_number=data.phone_number,
            message_type="manual",
            message=data.message,
            status="pending"
        )
        doc = alert.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.whatsapp_queue.insert_one(doc)
        
        return {
            "success": False,
            "message": "WhatsApp API no configurada. Mensaje en cola.",
            "queue_id": alert.id
        }
    
    # Send via WhatsApp Cloud API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_ID}/messages",
                headers={
                    "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                },
                json={
                    "messaging_product": "whatsapp",
                    "to": data.phone_number,
                    "type": "text",
                    "text": {"body": data.message}
                }
            )
            
            if response.status_code == 200:
                return {"success": True, "message": "Mensaje enviado"}
            else:
                return {"success": False, "error": response.text}
    except Exception as e:
        logging.error(f"WhatsApp send error: {e}")
        return {"success": False, "error": str(e)}

@api_router.post("/whatsapp/alert")
async def send_whatsapp_alert(
    threat_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send threat alert via WhatsApp to emergency contacts"""
    user = await require_auth(request, session_token)
    
    # Get threat details
    threat = await db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    # Get emergency contacts
    contacts = await db.contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(10)
    
    if not contacts:
        return {"success": False, "message": "No hay contactos de emergencia configurados"}
    
    # Build alert message
    alert_message = f"""🚨 *ALERTA DE SEGURIDAD MANO*

Se ha detectado una amenaza de nivel *{threat.get('risk_level', 'desconocido').upper()}*

Tipos: {', '.join(threat.get('threat_types', ['No especificado']))}

Recomendación: {threat.get('recommendation', 'Mantén precaución')}

_Este mensaje fue enviado automáticamente por MANO._
"""
    
    # Queue messages for each contact
    sent_count = 0
    for contact in contacts:
        if contact.get('phone'):
            alert = WhatsAppAlert(
                user_id=user.user_id,
                phone_number=contact['phone'],
                message_type="threat_alert",
                message=alert_message,
                status="pending"
            )
            doc = alert.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.whatsapp_queue.insert_one(doc)
            sent_count += 1
    
    return {
        "success": True,
        "message": f"Alertas en cola para {sent_count} contactos",
        "contacts_notified": sent_count
    }

@api_router.get("/whatsapp/queue")
async def get_whatsapp_queue(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get pending WhatsApp messages"""
    user = await require_auth(request, session_token)
    
    messages = await db.whatsapp_queue.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return messages

# ============================================
# REAL-TIME METRICS (Server-Sent Events)
# ============================================

from starlette.responses import StreamingResponse
import asyncio

@api_router.get("/metrics/stream")
async def stream_metrics(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Stream real-time metrics via Server-Sent Events"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    async def event_generator():
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break
            
            # Get real-time metrics
            total_threats = await db.threats.count_documents({"user_id": user_id})
            blocked = await db.threats.count_documents({"user_id": user_id, "is_threat": True})
            
            # Get recent threats (last hour)
            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            recent = await db.threats.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": one_hour_ago.isoformat()}
            })
            
            # Get global stats
            global_threats_today = await db.threats.count_documents({
                "created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()}
            })
            
            metrics = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user_metrics": {
                    "total_analyzed": total_threats,
                    "threats_blocked": blocked,
                    "recent_hour": recent,
                    "protection_rate": round((blocked / total_threats * 100) if total_threats > 0 else 100, 1)
                },
                "global_metrics": {
                    "threats_today": global_threats_today,
                    "active_users": await db.user_sessions.count_documents({}),
                    "system_status": "operational"
                }
            }
            
            yield f"data: {json.dumps(metrics)}\n\n"
            
            await asyncio.sleep(5)  # Update every 5 seconds
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@api_router.get("/metrics/dashboard")
async def get_dashboard_metrics(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get comprehensive dashboard metrics"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # User metrics
    user_threats = await db.threats.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Time-based analysis
    hourly_data = {}
    daily_data = {}
    
    for threat in user_threats:
        created = threat.get("created_at")
        if isinstance(created, str):
            created = datetime.fromisoformat(created.replace('Z', '+00:00'))
        
        if created:
            hour_key = created.strftime("%Y-%m-%d %H:00")
            day_key = created.strftime("%Y-%m-%d")
            
            hourly_data[hour_key] = hourly_data.get(hour_key, 0) + 1
            daily_data[day_key] = daily_data.get(day_key, 0) + 1
    
    # Threat type distribution
    threat_types = {}
    for threat in user_threats:
        for tt in threat.get("threat_types", []):
            threat_types[tt] = threat_types.get(tt, 0) + 1
    
    # Risk level distribution
    risk_levels = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for threat in user_threats:
        level = threat.get("risk_level", "low")
        if level in risk_levels:
            risk_levels[level] += 1
    
    return {
        "summary": {
            "total_analyzed": len(user_threats),
            "threats_blocked": len([t for t in user_threats if t.get("is_threat")]),
            "today": len([t for t in user_threats if t.get("created_at", "") >= today.isoformat()]),
            "this_week": len([t for t in user_threats if t.get("created_at", "") >= week_ago.isoformat()]),
            "this_month": len([t for t in user_threats if t.get("created_at", "") >= month_ago.isoformat()])
        },
        "threat_types": threat_types,
        "risk_levels": risk_levels,
        "hourly_trend": [{"hour": k, "count": v} for k, v in sorted(hourly_data.items())[-24:]],
        "daily_trend": [{"date": k, "count": v} for k, v in sorted(daily_data.items())[-30:]],
        "last_updated": now.isoformat()
    }

# ============================================
# PUBLIC API FOR PARTNERS
# ============================================

class APIKey(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"key_{uuid.uuid4().hex}")
    user_id: str
    key: str = Field(default_factory=lambda: f"mano_pk_{uuid.uuid4().hex}")
    name: str
    permissions: List[str] = ["read:threats", "write:analyze"]
    rate_limit: int = 1000  # requests per day
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class APIKeyCreate(BaseModel):
    name: str
    permissions: Optional[List[str]] = ["read:threats", "write:analyze"]

async def validate_api_key(api_key: str) -> Optional[dict]:
    """Validate API key and return key info"""
    key_doc = await db.api_keys.find_one({"key": api_key, "is_active": True}, {"_id": 0})
    return key_doc

@api_router.post("/api-keys")
async def create_api_key(
    data: APIKeyCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new API key for partner integration"""
    user = await require_auth(request, session_token)
    
    # Check existing keys limit
    existing_count = await db.api_keys.count_documents({"user_id": user.user_id})
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 API keys alcanzado")
    
    api_key = APIKey(
        user_id=user.user_id,
        name=data.name,
        permissions=data.permissions
    )
    
    doc = api_key.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.api_keys.insert_one(doc)
    
    return {
        "id": api_key.id,
        "key": api_key.key,
        "name": api_key.name,
        "permissions": api_key.permissions,
        "message": "Guarda esta clave, no se mostrará de nuevo"
    }

@api_router.get("/api-keys")
async def list_api_keys(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List user's API keys"""
    user = await require_auth(request, session_token)
    
    keys = await db.api_keys.find(
        {"user_id": user.user_id},
        {"_id": 0, "key": 0}  # Don't return actual key
    ).to_list(10)
    
    return keys

@api_router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Revoke API key"""
    user = await require_auth(request, session_token)
    
    result = await db.api_keys.delete_one({
        "id": key_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="API key no encontrada")
    
    return {"message": "API key revocada"}

# Public API endpoints (authenticated via API key)
public_router = APIRouter(prefix="/api/v1", tags=["public-api"])

# Simple access key for downloading documents (owner access)
OWNER_DOWNLOAD_KEY = "mano2025investor"

@public_router.get("/documents/download-zip")
async def public_download_documents(key: str = ""):
    """Download all investor documents with access key"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    zip_path = "/app/MANO_Documentos_Inversores.zip"
    if not Path(zip_path).exists():
        raise HTTPException(status_code=404, detail="Archivo ZIP no encontrado")
    
    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename="MANO_Documentos_Inversores_CONFIDENCIAL.zip"
    )

@public_router.get("/documents/download-pdf/{doc_name}")
async def public_download_single_pdf(doc_name: str, key: str = ""):
    """Download a single PDF document with access key"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    # Map of allowed document names
    allowed_docs = {
        "plan-negocio": "PLAN_DE_NEGOCIO.pdf",
        "presentacion": "PRESENTACION_INVERSORES.pdf",
        "modelo-financiero": "MODELO_FINANCIERO.pdf",
        "terminos": "TERMINOS_INVERSION.pdf",
        "enterprise": "MANO_ENTERPRISE_BUSINESS_PLAN.pdf"
    }
    
    if doc_name not in allowed_docs:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    pdf_path = f"/app/docs/pdf/{allowed_docs[doc_name]}"
    if not Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado")
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"MANO_{doc_name}_CONFIDENCIAL.pdf"
    )

async def get_api_key_user(request: Request) -> dict:
    """Get user from API key in header"""
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key requerida")
    
    key_doc = await validate_api_key(api_key)
    if not key_doc:
        raise HTTPException(status_code=401, detail="API key inválida")
    
    return key_doc

@public_router.get("/analyze/status")
async def public_api_status(request: Request):
    """Check API status (no auth required)"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/analyze",
            "/api/v1/threats",
            "/api/v1/stats"
        ]
    }

@public_router.post("/analyze")
async def public_analyze(
    data: AnalyzeRequest,
    request: Request
):
    """Analyze content for threats via public API"""
    key_info = await get_api_key_user(request)
    
    if "write:analyze" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    # Rate limiting check
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    usage_key = f"{key_info['id']}_{today}"
    
    usage = await db.api_usage.find_one({"key": usage_key})
    if usage and usage.get("count", 0) >= key_info.get("rate_limit", 1000):
        raise HTTPException(status_code=429, detail="Límite de rate alcanzado")
    
    # Increment usage
    await db.api_usage.update_one(
        {"key": usage_key},
        {"$inc": {"count": 1}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    # Analyze
    analysis_result = await analyze_threat(data.content, data.content_type)
    
    # Store result
    threat_obj = ThreatAnalysis(
        user_id=key_info["user_id"],
        content=data.content,
        content_type=data.content_type,
        risk_level=analysis_result["risk_level"],
        is_threat=analysis_result["is_threat"],
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result["recommendation"],
        analysis=analysis_result["analysis"]
    )
    
    doc = threat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['source'] = 'api'
    doc['api_key_id'] = key_info['id']
    await db.threats.insert_one(doc)
    
    return {
        "id": threat_obj.id,
        "is_threat": threat_obj.is_threat,
        "risk_level": threat_obj.risk_level,
        "threat_types": threat_obj.threat_types,
        "recommendation": threat_obj.recommendation
    }

@public_router.get("/threats")
async def public_get_threats(
    request: Request,
    limit: int = 50,
    offset: int = 0
):
    """Get threats via public API"""
    key_info = await get_api_key_user(request)
    
    if "read:threats" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    threats = await db.threats.find(
        {"user_id": key_info["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(offset).limit(min(limit, 100)).to_list(100)
    
    total = await db.threats.count_documents({"user_id": key_info["user_id"]})
    
    return {
        "data": threats,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@public_router.get("/stats")
async def public_get_stats(request: Request):
    """Get statistics via public API"""
    key_info = await get_api_key_user(request)
    
    if "read:threats" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    user_id = key_info["user_id"]
    
    total = await db.threats.count_documents({"user_id": user_id})
    blocked = await db.threats.count_documents({"user_id": user_id, "is_threat": True})
    
    return {
        "total_analyzed": total,
        "threats_blocked": blocked,
        "protection_rate": round((blocked / total * 100) if total > 0 else 100, 1)
    }

# ============================================
# BANK INTEGRATION (Placeholder)
# ============================================

class BankAlert(BaseModel):
    transaction_id: str
    amount: float
    currency: str = "EUR"
    merchant: str
    timestamp: str
    suspicious_indicators: List[str] = []

@api_router.post("/bank/verify-transaction")
async def verify_bank_transaction(
    data: BankAlert,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Verify bank transaction for fraud indicators"""
    user = await require_auth(request, session_token)
    
    # Analyze transaction
    risk_score = 0.0
    risk_factors = []
    
    # High amount
    if data.amount > 1000:
        risk_score += 0.2
        risk_factors.append("Transacción de alto valor")
    
    # Suspicious indicators
    if data.suspicious_indicators:
        risk_score += len(data.suspicious_indicators) * 0.15
        risk_factors.extend(data.suspicious_indicators)
    
    # Unknown merchant
    known_merchants = await db.trusted_merchants.find(
        {"user_id": user.user_id}
    ).to_list(100)
    if not any(m.get("name") == data.merchant for m in known_merchants):
        risk_score += 0.1
        risk_factors.append("Comercio no reconocido")
    
    risk_level = "low"
    if risk_score > 0.7:
        risk_level = "critical"
    elif risk_score > 0.5:
        risk_level = "high"
    elif risk_score > 0.3:
        risk_level = "medium"
    
    # Log verification
    verification = {
        "user_id": user.user_id,
        "transaction_id": data.transaction_id,
        "amount": data.amount,
        "merchant": data.merchant,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "verified_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bank_verifications.insert_one(verification)
    
    # Alert if high risk
    if risk_level in ["high", "critical"]:
        await create_notification(
            user.user_id,
            "⚠️ Alerta de Transacción Sospechosa",
            f"Transacción de €{data.amount} en {data.merchant} marcada como {risk_level}",
            "bank",
            {"transaction_id": data.transaction_id, "risk_level": risk_level}
        )
    
    return {
        "transaction_id": data.transaction_id,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendation": "Bloquear transacción" if risk_level in ["high", "critical"] else "Aprobar con precaución" if risk_level == "medium" else "Aprobar"
    }

@api_router.get("/bank/verifications")
async def get_bank_verifications(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get bank verification history"""
    user = await require_auth(request, session_token)
    
    verifications = await db.bank_verifications.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("verified_at", -1).limit(limit).to_list(limit)
    
    return verifications

@api_router.post("/bank/trusted-merchants")
async def add_trusted_merchant(
    name: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add trusted merchant"""
    user = await require_auth(request, session_token)
    
    await db.trusted_merchants.update_one(
        {"user_id": user.user_id, "name": name},
        {"$set": {
            "user_id": user.user_id,
            "name": name,
            "added_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": f"Comercio '{name}' añadido a la lista de confianza"}

# ============================================
# BANKING INTEGRATION - FULL IMPLEMENTATION
# ============================================

# Import banking service
import sys
sys.path.insert(0, str(ROOT_DIR))
from services.banking_service import banking_service
from services.threat_analyzer import threat_analyzer as ta_service
from services.fraud_detection import fraud_service

class BankAccountConnect(BaseModel):
    bank_name: str
    account_type: str = "checking"

class TransactionAnalyze(BaseModel):
    amount: float
    description: str
    merchant: Optional[str] = None
    account_id: Optional[str] = None

@api_router.get("/banking/accounts")
async def get_bank_accounts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all connected bank accounts"""
    user = await require_auth(request, session_token)
    accounts = await banking_service.get_accounts(user.user_id)
    return {"accounts": accounts}

@api_router.post("/banking/connect")
async def connect_bank_account(
    data: BankAccountConnect,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Connect a new bank account (simulated)"""
    user = await require_auth(request, session_token)
    result = await banking_service.connect_bank_account(
        user.user_id, 
        data.bank_name, 
        data.account_type
    )
    return result

@api_router.get("/banking/transactions")
async def get_bank_transactions(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    account_id: Optional[str] = None,
    days: int = 30,
    suspicious_only: bool = False
):
    """Get transaction history"""
    user = await require_auth(request, session_token)
    transactions = await banking_service.get_transactions(
        user.user_id,
        account_id=account_id,
        days=days,
        suspicious_only=suspicious_only
    )
    return {"transactions": transactions}

@api_router.post("/banking/analyze-transaction")
async def analyze_bank_transaction(
    data: TransactionAnalyze,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze a transaction for fraud using ML"""
    user = await require_auth(request, session_token)
    result = await banking_service.analyze_transaction(
        user.user_id,
        data.amount,
        data.description,
        data.merchant,
        data.account_id
    )
    return result

@api_router.post("/banking/transactions/{transaction_id}/block")
async def block_transaction(
    transaction_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Block a suspicious transaction"""
    user = await require_auth(request, session_token)
    result = await banking_service.block_transaction(user.user_id, transaction_id)
    return result

@api_router.post("/banking/transactions/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Approve a flagged transaction"""
    user = await require_auth(request, session_token)
    result = await banking_service.approve_transaction(user.user_id, transaction_id)
    return result

@api_router.get("/banking/summary")
async def get_banking_summary(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get banking summary with all accounts and stats"""
    user = await require_auth(request, session_token)
    summary = await banking_service.get_account_summary(user.user_id)
    return summary

@api_router.get("/banking/supported-banks")
async def get_supported_banks():
    """Get list of supported banks"""
    return {"banks": banking_service.supported_banks}

# ============================================
# ML FRAUD DETECTION ROUTES
# ============================================

@api_router.get("/ml/risk-summary")
async def get_risk_summary(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's fraud risk summary"""
    user = await require_auth(request, session_token)
    summary = await fraud_service.get_user_risk_summary(user.user_id)
    return summary

@api_router.post("/ml/analyze-text")
async def ml_analyze_text(
    data: AnalyzeRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze text using ML + LLM hybrid approach"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    result = await ta_service.analyze_content(
        data.content, 
        data.content_type,
        user_id
    )
    
    # Save analysis
    if user:
        await ta_service.save_analysis(user_id, data.content, data.content_type, result)
    
    return result

@api_router.get("/ml/behavior-profile")
async def get_behavior_profile(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's behavior profile for ML"""
    user = await require_auth(request, session_token)
    profile = await fraud_service._get_user_profile(user.user_id)
    
    if not profile:
        return {
            "message": "No hay suficientes datos para generar un perfil",
            "profile": None
        }
    
    return {
        "profile": {
            "avg_transaction_amount": profile.get("avg_transaction_amount", 0),
            "transaction_count": profile.get("transaction_count", 0),
            "typical_merchants": profile.get("typical_merchants", []),
            "typical_hours": profile.get("typical_hours", []),
            "updated_at": profile.get("updated_at")
        }
    }

# ============================================
# REWARDS AND GAMIFICATION ROUTES
# ============================================

from services.rewards_service import rewards_service
from services.email_service import email_service

@api_router.get("/rewards")
async def get_user_rewards(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's rewards, points, badges, and level"""
    user = await require_auth(request, session_token)
    rewards = await rewards_service.get_user_rewards(user.user_id)
    return rewards

@api_router.post("/rewards/claim-daily")
async def claim_daily_reward(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Claim daily login reward and update streak"""
    user = await require_auth(request, session_token)
    
    # Update streak
    streak_result = await rewards_service.update_streak(user.user_id)
    
    # Award daily login points
    points_result = await rewards_service.award_points(user.user_id, 'daily_login')
    
    return {
        "success": True,
        "daily_points": points_result.get('points_earned', 0),
        "streak_days": streak_result.get('streak_days', 1),
        "streak_bonus": streak_result.get('bonus_points', 0),
        "total_points": points_result.get('total_points', 0),
        "level": points_result.get('level', {})
    }

@api_router.get("/rewards/leaderboard")
async def get_leaderboard(
    period: str = "weekly",
    limit: int = 10
):
    """Get leaderboard for specified period"""
    if period not in ['weekly', 'monthly', 'all_time']:
        period = 'weekly'
    
    leaderboard = await rewards_service.get_leaderboard(period, min(limit, 50))
    return {"period": period, "leaderboard": leaderboard}

@api_router.get("/rewards/badges")
async def get_all_badges():
    """Get all available badges"""
    return {"badges": list(rewards_service.badges.values())}

@api_router.post("/rewards/action/{action}")
async def reward_action(
    action: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Award points for a specific action"""
    user = await require_auth(request, session_token)
    
    if action not in rewards_service.point_actions:
        raise HTTPException(status_code=400, detail="Acción no válida")
    
    result = await rewards_service.award_points(user.user_id, action)
    return result

# ============================================
# EMAIL NOTIFICATION ROUTES
# ============================================

@api_router.get("/email/queue")
async def get_email_queue(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get pending emails (admin only)"""
    user = await require_auth(request, session_token)
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    emails = await email_service.get_email_queue()
    return {"emails": emails, "sendgrid_configured": email_service.is_configured}

@api_router.post("/email/test")
async def send_test_email(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send a test email to the current user"""
    user = await require_auth(request, session_token)
    
    result = await email_service.send_daily_summary(
        user.user_id,
        user.email,
        {
            "analyzed_today": 5,
            "threats_blocked": 2,
            "safe_items": 3,
            "points_earned": 25,
            "protection_rate": 98.5
        }
    )
    
    return result

@api_router.get("/email/preferences")
async def get_email_preferences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's email notification preferences"""
    user = await require_auth(request, session_token)
    
    prefs = await db.email_preferences.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not prefs:
        new_prefs = {
            "user_id": user.user_id,
            "threat_alerts": True,
            "transaction_alerts": True,
            "daily_summary": True,
            "weekly_summary": False,
            "reward_notifications": True,
            "family_alerts": True,
            "marketing": False
        }
        await db.email_preferences.insert_one(new_prefs.copy())
        prefs = new_prefs
    
    return prefs

class EmailPreferencesUpdate(BaseModel):
    threat_alerts: Optional[bool] = None
    transaction_alerts: Optional[bool] = None
    daily_summary: Optional[bool] = None
    weekly_summary: Optional[bool] = None
    reward_notifications: Optional[bool] = None
    family_alerts: Optional[bool] = None
    marketing: Optional[bool] = None

@api_router.patch("/email/preferences")
async def update_email_preferences(
    data: EmailPreferencesUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's email notification preferences"""
    user = await require_auth(request, session_token)
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if update_data:
        await db.email_preferences.update_one(
            {"user_id": user.user_id},
            {"$set": update_data},
            upsert=True
        )
    
    return {"success": True, "message": "Preferencias actualizadas"}

# ============================================
# APP SETUP
# ============================================

app.include_router(api_router)
app.include_router(public_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
