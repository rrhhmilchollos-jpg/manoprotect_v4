"""
ManoBank Backend Server - Independent Banking System
Conectado con ManoProtect para servicios de antifraude
"""

from fastapi import FastAPI, HTTPException, Request, Depends, Cookie, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from decimal import Decimal
import os
import uuid
import hashlib
import secrets
import httpx
import random
import string
import io

# PDF generation
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

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
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.accounts.create_index("iban", unique=True)
    await db.transfers.create_index("transfer_id")
    
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

def generate_iban() -> str:
    """Generate Spanish IBAN"""
    # ES + 2 check digits + 4 bank code + 4 branch + 2 check + 10 account
    bank_code = "0182"  # ManoBank code
    branch = "0001"
    account = ''.join(random.choices(string.digits, k=10))
    
    # Simplified check digit calculation
    check_digits = str(random.randint(10, 99))
    local_check = str(random.randint(10, 99))
    
    return f"ES{check_digits} {bank_code} {branch} {local_check} {account}"

def generate_bic() -> str:
    """Generate BIC code"""
    return "MABORESESXXX"

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

class TransferRequest(BaseModel):
    from_account_id: str
    destination_iban: str
    destination_name: str
    amount: float
    concept: Optional[str] = ""

class AccountCreate(BaseModel):
    account_type: str = "corriente"  # corriente, ahorro, nomina

# ============================================
# MANOPROTECT ANTIFRAUDE INTEGRATION
# ============================================

async def check_fraud_manoprotect(data: dict) -> dict:
    """Consulta la API de ManoProtect para verificar fraude"""
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
    """Reporta actividad sospechosa a ManoProtect"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                f"{MANOPROTECT_API}/fraud/report",
                json=activity
            )
    except Exception as e:
        print(f"Error reportando a ManoProtect: {e}")

async def get_fraud_alerts(user_id: str) -> List[dict]:
    """Obtiene alertas de fraude de ManoProtect"""
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
# SESSION MANAGEMENT
# ============================================

async def get_current_user(session_token: Optional[str] = Cookie(None)):
    """Get current user from session"""
    if not session_token:
        return None
    
    session = await db.sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    if datetime.fromisoformat(session["expires_at"]) < datetime.now(timezone.utc):
        await db.sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False}}
        )
        return None
    
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return user

async def require_auth(session_token: Optional[str] = Cookie(None)):
    """Require authentication"""
    user = await get_current_user(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user

# ============================================
# AUTH ROUTES
# ============================================

@app.post("/api/auth/login")
async def login(data: UserLogin, response: Response):
    """Login de clientes ManoBank"""
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        await report_suspicious_activity({
            "type": "failed_login",
            "email": data.email,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Cuenta desactivada")
    
    # Verificar fraude
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
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=86400
    )
    
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
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Verificar DNI
    existing_dni = await db.users.find_one({"dni": data.dni.upper()})
    if existing_dni:
        raise HTTPException(status_code=400, detail="El DNI ya está registrado")
    
    # Verificar fraude
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
        "dni": data.dni.upper(),
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "is_active": True,
        "kyc_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    # Crear cuenta principal automáticamente
    account = await create_account_for_user(user_id, data.name, "corriente")
    
    return {
        "message": "Registro exitoso. Se ha creado tu cuenta bancaria.",
        "user_id": user_id,
        "account": {
            "iban": account["iban"],
            "bic": account["bic"]
        }
    }

@app.get("/api/auth/me")
async def get_me(session_token: Optional[str] = Cookie(None)):
    """Get current user info"""
    user = await get_current_user(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return user

@app.post("/api/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout"""
    if session_token:
        await db.sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False}}
        )
    
    response.delete_cookie("session_token")
    return {"message": "Sesión cerrada"}

# ============================================
# ACCOUNT MANAGEMENT
# ============================================

async def create_account_for_user(user_id: str, holder_name: str, account_type: str = "corriente"):
    """Create a new bank account for user"""
    account_id = f"acc_{uuid.uuid4().hex[:12]}"
    iban = generate_iban()
    
    account = {
        "account_id": account_id,
        "user_id": user_id,
        "holder_name": holder_name,
        "iban": iban,
        "bic": generate_bic(),
        "account_type": account_type,
        "balance": 0.0,
        "available_balance": 0.0,
        "currency": "EUR",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.accounts.insert_one(account)
    return account

@app.get("/api/accounts")
async def get_accounts(session_token: Optional[str] = Cookie(None)):
    """Get user's accounts"""
    user = await require_auth(session_token)
    
    accounts = await db.accounts.find(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    ).to_list(10)
    
    return {"accounts": accounts}

@app.post("/api/accounts")
async def create_account(data: AccountCreate, session_token: Optional[str] = Cookie(None)):
    """Create new account"""
    user = await require_auth(session_token)
    
    # Check max accounts
    count = await db.accounts.count_documents({"user_id": user["user_id"]})
    if count >= 5:
        raise HTTPException(status_code=400, detail="Máximo 5 cuentas por usuario")
    
    account = await create_account_for_user(user["user_id"], user["name"], data.account_type)
    
    # Remove _id
    account.pop("_id", None)
    
    return {"message": "Cuenta creada", "account": account}

@app.get("/api/accounts/{account_id}")
async def get_account_detail(account_id: str, session_token: Optional[str] = Cookie(None)):
    """Get account details"""
    user = await require_auth(session_token)
    
    account = await db.accounts.find_one(
        {"account_id": account_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    # Get recent transactions
    transactions = await db.transactions.find(
        {"$or": [{"from_account": account_id}, {"to_account": account_id}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {"account": account, "transactions": transactions}

@app.get("/api/accounts/{account_id}/certificate")
async def download_certificate(account_id: str, session_token: Optional[str] = Cookie(None)):
    """Download account ownership certificate (PDF)"""
    user = await require_auth(session_token)
    
    account = await db.accounts.find_one(
        {"account_id": account_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    if not HAS_REPORTLAB:
        raise HTTPException(status_code=500, detail="Generación de PDF no disponible")
    
    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, alignment=1)
    
    elements = []
    
    # Header
    elements.append(Paragraph("CERTIFICADO DE TITULARIDAD", title_style))
    elements.append(Spacer(1, 1*cm))
    
    # Body
    cert_text = f"""
    <b>ManoBank S.A.</b>, entidad de crédito inscrita en el Registro de Entidades del Banco de España,
    <br/><br/>
    <b>CERTIFICA:</b>
    <br/><br/>
    Que <b>{account['holder_name']}</b>, con DNI <b>{user.get('dni', 'N/A')}</b>, es titular de la siguiente cuenta:
    <br/><br/>
    <b>IBAN:</b> {account['iban']}<br/>
    <b>BIC/SWIFT:</b> {account['bic']}<br/>
    <b>Tipo de cuenta:</b> Cuenta {account['account_type'].capitalize()}<br/>
    <b>Moneda:</b> {account['currency']}<br/>
    <b>Fecha de apertura:</b> {account['created_at'][:10]}<br/>
    <br/><br/>
    Y para que así conste, se expide el presente certificado en Madrid, 
    a {datetime.now().strftime('%d de %B de %Y')}.
    <br/><br/><br/>
    <i>Documento generado electrónicamente - ManoBank S.A.</i>
    """
    
    elements.append(Paragraph(cert_text, styles['Normal']))
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=certificado_{account_id}.pdf"}
    )

# ============================================
# TRANSFERS
# ============================================

@app.post("/api/transfers")
async def create_transfer(data: TransferRequest, session_token: Optional[str] = Cookie(None)):
    """Create a new transfer with fraud verification"""
    user = await require_auth(session_token)
    
    # Get source account
    from_account = await db.accounts.find_one(
        {"account_id": data.from_account_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not from_account:
        raise HTTPException(status_code=404, detail="Cuenta origen no encontrada")
    
    if from_account["available_balance"] < data.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="El importe debe ser positivo")
    
    if data.amount > 50000:
        raise HTTPException(status_code=400, detail="Importe máximo por transferencia: 50.000€")
    
    # Verificar fraude con ManoProtect
    fraud_check = await check_fraud_manoprotect({
        "type": "transfer",
        "user_id": user["user_id"],
        "amount": data.amount,
        "destination_iban": data.destination_iban,
        "destination_name": data.destination_name
    })
    
    if fraud_check.get("is_fraud") or fraud_check.get("risk_score", 0) > 80:
        await report_suspicious_activity({
            "type": "blocked_transfer",
            "user_id": user["user_id"],
            "amount": data.amount,
            "destination": data.destination_iban,
            "reason": fraud_check.get("reason"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        raise HTTPException(
            status_code=403, 
            detail="Transferencia bloqueada por seguridad. Contacta con soporte."
        )
    
    transfer_id = f"tr_{uuid.uuid4().hex[:12]}"
    
    # Determine status based on risk
    status = "completed" if fraud_check.get("risk_score", 0) < 50 else "pending_review"
    
    transfer = {
        "transfer_id": transfer_id,
        "user_id": user["user_id"],
        "from_account": data.from_account_id,
        "from_iban": from_account["iban"],
        "destination_iban": data.destination_iban.replace(" ", "").upper(),
        "destination_name": data.destination_name,
        "amount": data.amount,
        "concept": data.concept or "Transferencia",
        "status": status,
        "fraud_score": fraud_check.get("risk_score", 0),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transfers.insert_one(transfer)
    
    # Update balance if completed
    if status == "completed":
        await db.accounts.update_one(
            {"account_id": data.from_account_id},
            {
                "$inc": {"balance": -data.amount, "available_balance": -data.amount}
            }
        )
        
        # Record transaction
        transaction = {
            "transaction_id": f"tx_{uuid.uuid4().hex[:12]}",
            "transfer_id": transfer_id,
            "from_account": data.from_account_id,
            "type": "transfer_out",
            "amount": -data.amount,
            "balance_after": from_account["balance"] - data.amount,
            "description": f"Transferencia a {data.destination_name}",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(transaction)
    
    transfer.pop("_id", None)
    
    return {
        "message": "Transferencia procesada",
        "transfer": transfer,
        "warning": "Esta transferencia está siendo revisada" if status == "pending_review" else None
    }

@app.get("/api/transfers")
async def get_transfers(session_token: Optional[str] = Cookie(None)):
    """Get user's transfers"""
    user = await require_auth(session_token)
    
    transfers = await db.transfers.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return {"transfers": transfers}

# ============================================
# TRANSACTIONS
# ============================================

@app.get("/api/transactions")
async def get_transactions(
    account_id: Optional[str] = None,
    limit: int = 20,
    session_token: Optional[str] = Cookie(None)
):
    """Get transactions"""
    user = await require_auth(session_token)
    
    # Get user's accounts
    user_accounts = await db.accounts.find(
        {"user_id": user["user_id"]},
        {"account_id": 1}
    ).to_list(10)
    
    account_ids = [a["account_id"] for a in user_accounts]
    
    query = {"$or": [{"from_account": {"$in": account_ids}}, {"to_account": {"$in": account_ids}}]}
    
    if account_id:
        query = {"$or": [{"from_account": account_id}, {"to_account": account_id}]}
    
    transactions = await db.transactions.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"transactions": transactions}

# ============================================
# EMPLOYEE PORTAL
# ============================================

@app.post("/api/banco/login")
async def employee_login(data: EmployeeLogin, response: Response):
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
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=28800
    )
    
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
        {"_id": 0, "password_hash": 0}
    )
    
    # Stats
    total_customers = await db.users.count_documents({})
    total_accounts = await db.accounts.count_documents({"status": "active"})
    pending_kyc = await db.users.count_documents({"kyc_status": "pending"})
    total_balance = 0
    
    # Calculate total deposits
    async for acc in db.accounts.find({"status": "active"}):
        total_balance += acc.get("balance", 0)
    
    # Get fraud alerts from ManoProtect
    fraud_alerts = await get_fraud_alerts("bank_system")
    
    # Pending transfers
    pending_transfers = await db.transfers.count_documents({"status": "pending_review"})
    
    return {
        "employee": employee,
        "stats": {
            "total_customers": total_customers,
            "total_accounts": total_accounts,
            "pending_kyc": pending_kyc,
            "total_deposits": total_balance,
            "pending_transfers": pending_transfers,
            "fraud_alerts": len(fraud_alerts)
        },
        "recent_fraud_alerts": fraud_alerts[:5]
    }

@app.get("/api/banco/customers")
async def get_customers(session_token: Optional[str] = Cookie(None)):
    """Get all customers (employees only)"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.employee_sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    customers = await db.users.find(
        {},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    return {"customers": customers}

@app.get("/api/banco/transfers/pending")
async def get_pending_transfers(session_token: Optional[str] = Cookie(None)):
    """Get pending transfers for review"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.employee_sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    transfers = await db.transfers.find(
        {"status": "pending_review"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"transfers": transfers}

@app.post("/api/banco/transfers/{transfer_id}/approve")
async def approve_transfer(transfer_id: str, session_token: Optional[str] = Cookie(None)):
    """Approve a pending transfer"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.employee_sessions.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    transfer = await db.transfers.find_one({"transfer_id": transfer_id})
    if not transfer:
        raise HTTPException(status_code=404, detail="Transferencia no encontrada")
    
    if transfer["status"] != "pending_review":
        raise HTTPException(status_code=400, detail="Esta transferencia ya fue procesada")
    
    # Update transfer status
    await db.transfers.update_one(
        {"transfer_id": transfer_id},
        {
            "$set": {
                "status": "completed",
                "approved_by": session["employee_id"],
                "approved_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Update balance
    await db.accounts.update_one(
        {"account_id": transfer["from_account"]},
        {"$inc": {"balance": -transfer["amount"], "available_balance": -transfer["amount"]}}
    )
    
    return {"message": "Transferencia aprobada"}

# ============================================
# DASHBOARD (CUSTOMER)
# ============================================

@app.get("/api/manobank/dashboard")
async def customer_dashboard(session_token: Optional[str] = Cookie(None)):
    """Dashboard de clientes"""
    user = await require_auth(session_token)
    
    accounts = await db.accounts.find(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    ).to_list(10)
    
    # Recent transactions
    account_ids = [a["account_id"] for a in accounts]
    transactions = await db.transactions.find(
        {"$or": [{"from_account": {"$in": account_ids}}, {"to_account": {"$in": account_ids}}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Fraud alerts
    fraud_alerts = await get_fraud_alerts(user["user_id"])
    
    # Calculate total balance
    total_balance = sum(a.get("balance", 0) for a in accounts)
    
    return {
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "kyc_status": user.get("kyc_status")
        },
        "accounts": accounts,
        "transactions": transactions,
        "fraud_alerts": fraud_alerts,
        "total_balance": total_balance
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
        "manoprotect_integration": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/")
async def root():
    return {
        "message": "ManoBank API - Sistema Bancario Digital",
        "docs": "/docs",
        "health": "/api/health"
    }
