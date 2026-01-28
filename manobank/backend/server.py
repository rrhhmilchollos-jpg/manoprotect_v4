"""
ManoBank Backend Server - Independent Banking System
Conectado con ManoProtect para servicios de antifraude
"""

from fastapi import FastAPI, HTTPException, Request, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
import os
import uuid
import hashlib
import secrets
import httpx

# Database connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "manobank")
MANOPROTECT_API = os.environ.get("MANOPROTECT_API_URL", "http://localhost:8001/api")

db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"✅ ManoBank conectado a MongoDB: {DB_NAME}")
    yield
    client.close()

app = FastAPI(
    title="ManoBank API",
    description="Sistema Bancario Digital - Entidad regulada por el Banco de España",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "https://manobank.es",
        "https://www.manobank.es",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return db

# ============================================
# SECURITY UTILITIES
# ============================================

def hash_password(password: str) -> str:
    """Hash password with PBKDF2"""
    salt = secrets.token_hex(32)
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hash_obj.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hash_value = stored_hash.split('$')
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return hash_obj.hex() == hash_value
    except:
        return False

def generate_session_token() -> str:
    """Generate secure session token"""
    return f"mb_{secrets.token_urlsafe(48)}"

# ============================================
# MODELS
# ============================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    dni: str
    phone: str
    password: str

class EmployeeLogin(BaseModel):
    email: EmailStr
    password: str

# ============================================
# MANOPROTECT ANTIFRAUDE INTEGRATION
# ============================================

async def check_fraud_manoprotect(data: dict) -> dict:
    """
    Consulta la API de ManoProtect para verificar fraude
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{MANOPROTECT_API}/fraud/check",
                json=data
            )
            if response.status_code == 200:
                return response.json()
            return {"is_fraud": False, "risk_score": 0, "reason": "API no disponible"}
    except Exception as e:
        print(f"Error consultando ManoProtect: {e}")
        return {"is_fraud": False, "risk_score": 0, "reason": "Error de conexión"}

async def report_suspicious_activity(activity: dict):
    """
    Reporta actividad sospechosa a ManoProtect
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{MANOPROTECT_API}/fraud/report",
                json=activity
            )
    except Exception as e:
        print(f"Error reportando a ManoProtect: {e}")

async def get_fraud_alerts(user_id: str) -> List[dict]:
    """
    Obtiene alertas de fraude de ManoProtect para un usuario
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{MANOPROTECT_API}/fraud/alerts/{user_id}"
            )
            if response.status_code == 200:
                return response.json().get("alerts", [])
            return []
    except Exception as e:
        print(f"Error obteniendo alertas: {e}")
        return []

# ============================================
# AUTH ROUTES
# ============================================

@app.post("/api/auth/login")
async def login(data: UserLogin):
    """Login de clientes ManoBank"""
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        # Reportar intento fallido a ManoProtect
        await report_suspicious_activity({
            "type": "failed_login",
            "email": data.email,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Cuenta desactivada")
    
    # Verificar fraude con ManoProtect
    fraud_check = await check_fraud_manoprotect({
        "type": "login",
        "email": data.email,
        "user_id": user.get("user_id")
    })
    
    # Crear sesión
    session_token = generate_session_token()
    session = {
        "session_token": session_token,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
        "is_active": True
    }
    await db.sessions.insert_one(session)
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "session_token": session_token,
        "fraud_alert": fraud_check.get("reason") if fraud_check.get("risk_score", 0) > 50 else None
    }

@app.post("/api/auth/register")
async def register(data: UserRegister):
    """Registro de nuevos clientes"""
    # Verificar si existe
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Verificar DNI con ManoProtect
    fraud_check = await check_fraud_manoprotect({
        "type": "registration",
        "dni": data.dni,
        "email": data.email,
        "phone": data.phone
    })
    
    if fraud_check.get("is_fraud"):
        raise HTTPException(status_code=403, detail="Registro bloqueado por seguridad")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    new_user = {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "dni": data.dni,
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "is_active": True,
        "kyc_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    return {"message": "Registro exitoso", "user_id": user_id}

# ============================================
# EMPLOYEE ROUTES
# ============================================

@app.post("/api/banco/login")
async def employee_login(data: EmployeeLogin):
    """Login de empleados ManoBank"""
    employee = await db.employees.find_one(
        {"email": data.email.lower(), "is_active": True},
        {"_id": 0}
    )
    
    if not employee:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not verify_password(data.password, employee.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    session_token = generate_session_token()
    session = {
        "session_token": session_token,
        "employee_id": employee["employee_id"],
        "role": employee["role"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat(),
        "is_active": True
    }
    await db.employee_sessions.insert_one(session)
    
    return {
        "employee_id": employee["employee_id"],
        "email": employee["email"],
        "name": employee["name"],
        "role": employee["role"],
        "session_token": session_token
    }

@app.get("/api/banco/dashboard")
async def employee_dashboard(session_token: Optional[str] = Cookie(None)):
    """Dashboard de empleados"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.employee_sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    employee = await db.employees.find_one(
        {"employee_id": session["employee_id"]},
        {"_id": 0}
    )
    
    # Stats
    total_customers = await db.users.count_documents({})
    total_accounts = await db.accounts.count_documents({})
    pending_kyc = await db.users.count_documents({"kyc_status": "pending"})
    
    # Obtener alertas de fraude de ManoProtect
    fraud_alerts = await get_fraud_alerts("bank_system")
    
    return {
        "employee": employee,
        "stats": {
            "total_customers": total_customers,
            "total_accounts": total_accounts,
            "pending_kyc": pending_kyc,
            "fraud_alerts": len(fraud_alerts)
        },
        "recent_fraud_alerts": fraud_alerts[:5]
    }

# ============================================
# CUSTOMER ROUTES
# ============================================

@app.get("/api/manobank/dashboard")
async def customer_dashboard(session_token: Optional[str] = Cookie(None)):
    """Dashboard de clientes"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    accounts = await db.accounts.find(
        {"user_id": session["user_id"]},
        {"_id": 0}
    ).to_list(10)
    
    # Verificar alertas de fraude
    fraud_alerts = await get_fraud_alerts(session["user_id"])
    
    return {
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "kyc_status": user.get("kyc_status")
        },
        "accounts": accounts,
        "fraud_alerts": fraud_alerts
    }

@app.get("/api/manobank/accounts")
async def get_accounts(session_token: Optional[str] = Cookie(None)):
    """Obtener cuentas del cliente"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    accounts = await db.accounts.find(
        {"user_id": session["user_id"]},
        {"_id": 0}
    ).to_list(10)
    
    return {"accounts": accounts}

@app.post("/api/manobank/transfer")
async def make_transfer(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Realizar transferencia con verificación antifraude"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    body = await request.json()
    
    # Verificar fraude con ManoProtect antes de procesar
    fraud_check = await check_fraud_manoprotect({
        "type": "transfer",
        "user_id": session["user_id"],
        "amount": body.get("amount"),
        "destination_iban": body.get("destination_iban"),
        "destination_name": body.get("destination_name")
    })
    
    if fraud_check.get("is_fraud") or fraud_check.get("risk_score", 0) > 80:
        # Bloquear transferencia sospechosa
        await report_suspicious_activity({
            "type": "blocked_transfer",
            "user_id": session["user_id"],
            "amount": body.get("amount"),
            "destination": body.get("destination_iban"),
            "reason": fraud_check.get("reason"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(
            status_code=403, 
            detail="Transferencia bloqueada por seguridad. Contacta con soporte."
        )
    
    # Procesar transferencia (lógica simplificada)
    transfer_id = f"tr_{uuid.uuid4().hex[:12]}"
    
    transfer = {
        "transfer_id": transfer_id,
        "user_id": session["user_id"],
        "from_account": body.get("from_account"),
        "destination_iban": body.get("destination_iban"),
        "destination_name": body.get("destination_name"),
        "amount": body.get("amount"),
        "concept": body.get("concept"),
        "status": "completed" if fraud_check.get("risk_score", 0) < 50 else "pending_review",
        "fraud_score": fraud_check.get("risk_score", 0),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transfers.insert_one(transfer)
    
    return {
        "message": "Transferencia procesada",
        "transfer_id": transfer_id,
        "status": transfer["status"],
        "warning": "Esta transferencia está siendo revisada" if transfer["status"] == "pending_review" else None
    }

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ManoBank API",
        "version": "1.0.0",
        "manoprotect_integration": True
    }

# ============================================
# ROOT
# ============================================

@app.get("/")
async def root():
    return {
        "message": "ManoBank API - Sistema Bancario Digital",
        "docs": "/docs",
        "health": "/api/health"
    }
