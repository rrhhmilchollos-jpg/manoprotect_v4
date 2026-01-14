"""
MANO - Core Configuration and Database
Central configuration for the entire application
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

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
    "family-yearly": {"amount": 399.99, "name": "Familiar Anual", "period": "año"}
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
