from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Depends
from fastapi.responses import JSONResponse
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
    plan: str = "free"
    role: str = "user"  # "user", "admin", "investor"
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
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
    
    @field_validator('cif')
    @classmethod
    def validate_cif(cls, v):
        # Spanish CIF validation (basic format)
        cif_pattern = r'^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$'
        if not re.match(cif_pattern, v.upper()):
            raise ValueError('CIF inválido. Formato esperado: letra + 7 dígitos + letra/dígito')
        return v.upper()

class InvestorRegisterRequest(BaseModel):
    cif: str
    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str
    reason: str

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
    "weekly": {"amount": 9.99, "name": "Premium Semanal", "period": "semana"},
    "monthly": {"amount": 29.99, "name": "Premium Mensual", "period": "mes"},
    "quarterly": {"amount": 74.99, "name": "Premium Trimestral", "period": "3 meses"},
    "yearly": {"amount": 249.99, "name": "Premium Anual", "period": "año"},
    "family-monthly": {"amount": 49.99, "name": "Familiar Mensual", "period": "mes"},
    "family-quarterly": {"amount": 129.99, "name": "Familiar Trimestral", "period": "3 meses"},
    "family-yearly": {"amount": 399.99, "name": "Familiar Anual", "period": "año"}
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
    """Require admin role"""
    user = await require_auth(request, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado - Se requiere rol de administrador")
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
            {"id": "business-plan", "title": "Plan de Negocio Completo", "pages": "120 páginas"},
            {"id": "financial-model", "title": "Modelo Financiero Detallado", "pages": "25 páginas"},
            {"id": "pitch-deck", "title": "Pitch Deck Inversores", "pages": "11 slides"},
            {"id": "dossier-b2b", "title": "Dossier Comercial B2B", "pages": "47 páginas"}
        ]
    }

@api_router.get("/investor/download/{doc_type}")
async def download_investor_document(
    doc_type: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Download document (investor only)"""
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
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = f"MANO_{doc_type.replace('-', '_')}_CONFIDENCIAL_2025.md"
    
    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
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
    
    if not user.plan.startswith("family"):
        raise HTTPException(status_code=403, detail="Se requiere plan familiar")
    
    members = await db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return members

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
# APP SETUP
# ============================================

app.include_router(api_router)

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
