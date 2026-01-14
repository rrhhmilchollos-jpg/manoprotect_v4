"""
MANO - Core Configuration and Database
Central configuration for the entire application
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from fastapi import Request, HTTPException, Cookie
from typing import Optional
import os
import uuid
import hashlib

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Database
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'mano-secure-jwt-secret-2025')

# VAPID Keys for Web Push
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'local-dev-private-key')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BNbxGYNMhEIi4d00Zc4Y-nLcQ6x8_V9qKJHxXgJWGnc6NJZ7YfZKMKbHJ8xLPTkMVWKPEfL6B9wN9vGxXKQHXxE')
VAPID_CLAIMS_EMAIL = os.environ.get('VAPID_CLAIMS_EMAIL', 'mailto:admin@mano-security.com')

# WhatsApp Business API
WHATSAPP_API_KEY = os.environ.get('WHATSAPP_API_KEY')
WHATSAPP_PHONE_ID = os.environ.get('WHATSAPP_PHONE_ID')

# Subscription packages
SUBSCRIPTION_PACKAGES = {
    "weekly": {"amount": 9.99, "name": "Premium Semanal", "period": "semana"},
    "monthly": {"amount": 29.99, "name": "Premium Mensual", "period": "mes"},
    "quarterly": {"amount": 74.99, "name": "Premium Trimestral", "period": "3 meses"},
    "yearly": {"amount": 249.99, "name": "Premium Anual", "period": "año"},
    "family-monthly": {"amount": 49.99, "name": "Familiar Mensual", "period": "mes"},
    "family-quarterly": {"amount": 129.99, "name": "Familiar Trimestral", "period": "3 meses"},
    "family-yearly": {"amount": 399.99, "name": "Familiar Anual", "period": "año"},
    "personal": {"amount": 9.99, "name": "Personal", "period": "mes"},
    "family": {"amount": 19.99, "name": "Familiar", "period": "mes"},
    "business": {"amount": 49.99, "name": "Business", "period": "mes"},
    "enterprise": {"amount": 199.99, "name": "Enterprise", "period": "mes"}
}

# Risk scoring weights for ML
RISK_WEIGHTS = {
    "phishing": 0.9,
    "smishing": 0.85,
    "vishing": 0.8,
    "bank_fraud": 0.95,
    "identity_theft": 0.95,
    "social_engineering": 0.75,
    "malware": 0.9,
    "scam": 0.7,
    "spam": 0.3
}

# Threat patterns for ML detection
THREAT_PATTERNS = {
    "urgent_action": ["urgente", "inmediato", "ahora", "rápido", "última oportunidad"],
    "financial": ["banco", "cuenta", "transferencia", "tarjeta", "crédito", "dinero", "pago"],
    "personal_data": ["contraseña", "pin", "dni", "clave", "verificar identidad", "datos personales"],
    "suspicious_links": ["bit.ly", "tinyurl", "goo.gl", "cutt.ly", "rb.gy"],
    "impersonation": ["somos tu banco", "departamento de seguridad", "servicio técnico", "hacienda"],
    "prize_scam": ["ganador", "premio", "sorteo", "lotería", "herencia"],
    "threat": ["bloquear", "suspender", "cancelar", "demanda", "policía", "tribunal"]
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


async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user from session token (cookie or header)"""
    from models.schemas import User
    
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    session = await db.sessions.find_one({"session_token": token})
    if not session:
        return None
    
    from datetime import datetime, timezone
    if datetime.now(timezone.utc) > session.get("expires_at", datetime.now(timezone.utc)):
        await db.sessions.delete_one({"session_token": token})
        return None
    
    user_data = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_data:
        return None
    
    return User(**user_data)


async def require_auth(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require authenticated user"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Autenticación requerida")
    return user


async def require_admin(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require admin role"""
    user = await require_auth(request, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user


async def require_investor(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require investor role"""
    user = await require_auth(request, session_token)
    if user.role not in ["investor", "admin"]:
        raise HTTPException(status_code=403, detail="Se requiere rol de inversor")
    return user
