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

# Import models from centralized schema file
from models.all_schemas import (
    User, UserRegister, UserLogin, UserUpdate, SessionData,
    InvestorRequest, InvestorRegisterRequest,
    ThreatAnalysis, AnalyzeRequest, FalsePositiveReport, ShareRequest, CommunityAlert,
    TrustedContact, TrustedContactCreate,
    SOSAlert, SOSRequest, SOSAlertRequest, LocationUpdate,
    CheckoutRequest, PaymentTransaction,
    FamilyMember, FamilyMemberCreate, FamilyAlert, ChildMember, LocationRequest,
    NotificationSubscription, Notification, SubscriptionRequest, NotificationPreferences, PushSubscription,
    APIKey, APIKeyCreate,
    WhatsAppMessage, WhatsAppAlert,
    EmailPreferencesUpdate
    # BankAlert, BankAccountConnect, TransactionAnalyze - RESERVED for ManoBank.es
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Initialize WebSocket manager
from services.websocket_manager import sio, init_websocket, get_socketio_app
init_websocket(db)

# Mount Socket.IO at /ws
socket_app = get_socketio_app()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

# ============================================
# SUPERADMIN CONFIGURATION (passwords from env)
# ============================================
SUPERADMIN_ACCOUNTS = [
    {"email": "info@manoprotect.com", "name": "ManoProtect Admin", "password": os.environ.get('SUPERADMIN_PASSWORD_1')},
    {"email": "rrhh.milchollos@gmail.com", "name": "ManoProtect RRHH", "password": os.environ.get('SUPERADMIN_PASSWORD_2')},
    {"email": "ivanrubiosolas@gmail.com", "name": "Ivan Rubio Cano", "password": None},  # None = don't change password if exists
]

# Initialize auth module with database
from core.auth import (
    init_auth, hash_password, verify_password, generate_session_token,
    get_current_user, require_auth, require_admin, require_investor
)
init_auth(db)

# ============================================
# CONFIGURATION
# ============================================

# Fixed subscription pricing packages (amounts in EUR) - SINCRONIZADO CON FRONTEND
SUBSCRIPTION_PACKAGES = {
    # Planes individuales Premium (hasta 2 usuarios)
    "weekly": {"amount": 9.99, "name": "Premium Semanal", "period": "semana", "max_users": 2},
    "monthly": {"amount": 29.99, "name": "Premium Mensual", "period": "mes", "max_users": 2},
    "quarterly": {"amount": 74.99, "name": "Premium Trimestral", "period": "3 meses", "max_users": 2},
    "yearly": {"amount": 249.99, "name": "Premium Anual", "period": "año", "max_users": 2},
    # Alias para compatibilidad con planes personales
    "personal": {"amount": 29.99, "name": "Personal", "period": "mes", "max_users": 2},
    "personal-monthly": {"amount": 29.99, "name": "Personal Mensual", "period": "mes", "max_users": 2},
    "personal-quarterly": {"amount": 74.99, "name": "Personal Trimestral", "period": "3 meses", "max_users": 2},
    "personal-yearly": {"amount": 249.99, "name": "Personal Anual", "period": "año", "max_users": 2},
    # Planes familiares (hasta 5 usuarios + GPS + SOS)
    "family-monthly": {"amount": 49.99, "name": "Familiar Mensual", "period": "mes", "max_users": 5, "gps": False, "sos": True},
    "family-quarterly": {"amount": 129.99, "name": "Familiar Trimestral", "period": "3 meses", "max_users": 5, "gps": True, "sos": True},
    "family-yearly": {"amount": 399.99, "name": "Familiar Anual", "period": "año", "max_users": 5, "gps": True, "sos": True, "child_tracking": True},
    # Planes business
    "business": {"amount": 49.99, "name": "Business", "period": "mes", "max_users": 25},
    "business-monthly": {"amount": 49.99, "name": "Business Mensual", "period": "mes", "max_users": 25},
    "business-yearly": {"amount": 479.99, "name": "Business Anual", "period": "año", "max_users": 25},
    # Plan enterprise
    "enterprise": {"amount": 199.99, "name": "Enterprise", "period": "mes", "max_users": -1},
    "enterprise-monthly": {"amount": 199.99, "name": "Enterprise Mensual", "period": "mes", "max_users": -1},
    "enterprise-yearly": {"amount": 1999.99, "name": "Enterprise Anual", "period": "año", "max_users": -1},
}

# Plan features - detailed by billing period for family plans
PLAN_FEATURES = {
    "free": {"max_users": 1, "gps": False, "sos": False, "ai_analysis": False, "child_tracking": False, "location_history": False},
    # Planes individuales Premium
    "weekly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "monthly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "quarterly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "yearly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-monthly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-quarterly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-yearly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    # Family plans with tiered features
    "family": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-monthly": {"max_users": 5, "gps": False, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-quarterly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-yearly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": True, "location_history": True, "silent_mode": True},
    # Business and Enterprise
    "business": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "business-monthly": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "business-yearly": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "enterprise": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
    "enterprise-monthly": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
    "enterprise-yearly": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
}

# Import and initialize modular routes
from routes.auth_routes import router as auth_router, init_auth_routes
from services.security_service import init_security_service
init_security_service(db)

# Initialize Infobip SMS
infobip_configured = False
try:
    from services.infobip_sms import is_configured
    infobip_configured = is_configured()
    if infobip_configured:
        print("✅ Infobip SMS initialized")
    else:
        print("⚠️ Infobip SMS not configured (add INFOBIP_API_KEY to .env)")
except Exception as e:
    print(f"⚠️ Infobip not available: {e}")

init_auth_routes(db, None)  # SMS handled separately via Infobip

from routes.investor_routes import router as investor_router, init_investor_routes
init_investor_routes(db)

from routes.threat_routes import router as threat_router, init_threat_routes
from emergentintegrations.llm.chat import LlmChat, UserMessage
init_threat_routes(db, EMERGENT_LLM_KEY, LlmChat, UserMessage)

from routes.profile_contacts_routes import router as profile_contacts_router, init_profile_routes
init_profile_routes(db)

from routes.family_sos_routes import router as family_sos_router, init_family_routes
init_family_routes(db, PLAN_FEATURES)

# Family Management Routes
from routes.family_routes import router as family_router, init_db as init_family_db
init_family_db(db)

# Smart Family Locator Routes
from routes.smart_locator import router as smart_locator_router, init_db as init_smart_locator_db
init_smart_locator_db(db)

# Anti-Deepfake Shield Routes
from routes.deepfake_shield import router as deepfake_shield_router, init_db as init_deepfake_db
init_deepfake_db(db)

# Investor CRM Routes
from routes.investor_crm import router as investor_crm_router, init_db as init_investor_crm_db
init_investor_crm_db(db)

# Geofencing Routes
from routes.geofence_routes import router as geofence_router, init_geofence_routes
init_geofence_routes(db)

# Core Routes (health, plans, knowledge base)
from routes.core_routes import router as core_router, init_core_routes
init_core_routes(db, PLAN_FEATURES)

# Notifications Routes
from routes.notifications_routes import router as notifications_router, init_notifications_routes
init_notifications_routes(db)

# Metrics Routes
from routes.metrics_routes import router as metrics_router, init_metrics_routes
init_metrics_routes(db)

# Chat Routes (AI Support)
from routes.chat_routes import router as chat_router, init_chat_routes
init_chat_routes(db)

# Employee Portal Routes (Messaging & Presence)
from routes.employee_portal_routes import router as employee_portal_router, init_employee_routes
init_employee_routes(db)

# Enterprise Routes (Dashboard & Reports)
from routes.enterprise_routes import router as enterprise_router, init_enterprise_routes
init_enterprise_routes(db)

# ManoProtect Shield Routes (DNA Digital, Trust Seal, Voice AI, etc.)
from routes.shield import router as shield_router, set_database as init_shield_routes
init_shield_routes(db)

# Real-Time Scam Detection Routes (LIVE data)
from routes.realtime_scam import router as realtime_router, set_database as init_realtime_routes
init_realtime_routes(db)

# AI Voice Shield Routes
from routes.voice_shield import router as voice_shield_router, set_database as init_voice_shield
init_voice_shield(db)

# Payment Routes (Stripe)
from routes.payments_routes import router as payments_router
from routes.admin_routes import router as admin_routes, init_db as init_admin_routes
from routes.health_routes import router as health_router, init_db as init_health_routes
from routes.audio_routes import router as audio_router, init_db as init_audio_routes
from routes.device_routes import router as device_router, init_db as init_device_routes
from routes.push_routes import router as push_router, init_db as init_push_routes

# Demo Videos Routes (Sora 2 AI video generation)
from routes.demo_videos import router as demo_videos_router

# Banking and Compliance services - RESERVED for ManoBank.es
# from services.compliance_service import init_compliance_service
# from routes.compliance_routes import router as compliance_router, init_compliance_routes
# init_compliance_service(db)
# init_compliance_routes(db, require_admin)
# from routes.banking_core_routes import router as banking_core_router, init_banking_core_routes
# init_banking_core_routes(db, require_admin)

# ============================================
# ROOT HEALTH CHECK (for Kubernetes probes)
# ============================================

@app.get("/health")
async def root_health_check():
    """Root health check endpoint for Kubernetes liveness/readiness probes"""
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": str(e)}
        )

# ============================================
# HEALTH CHECK ENDPOINT (for production monitoring)
# ============================================

@api_router.get("/health")
async def health_check():
    """Health check endpoint for production monitoring"""
    try:
        # Test database connection
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "manoprotect-api",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ============================================
# PUBLIC USER STATISTICS (No auth required)
# ============================================

@api_router.get("/public/users-count")
async def get_public_users_count():
    """Get public count of registered users - No authentication required"""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"status": {"$ne": "inactive"}})
    
    # Get users registered in last 24 hours
    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    new_users_24h = await db.users.count_documents({"created_at": {"$gte": day_ago}})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_24h": new_users_24h,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@api_router.get("/public/active-users")
async def get_public_active_users():
    """Get list of active users with basic info - Privacy protected"""
    users = await db.users.find(
        {"status": {"$ne": "inactive"}},
        {
            "_id": 0,
            "password_hash": 0,
            "session_token": 0
        }
    ).sort("created_at", -1).limit(100).to_list(100)
    
    # Return users with masked info for privacy
    sanitized_users = []
    for u in users:
        email = u.get("email", "")
        masked_email = email[:3] + "***@***" if email else "***"
        sanitized_users.append({
            "user_id": u.get("user_id", ""),
            "name": u.get("name", "Usuario"),
            "email_masked": masked_email,
            "role": u.get("role", "user"),
            "plan": u.get("plan", "free"),
            "status": u.get("status", "active"),
            "member_since": u.get("created_at"),
            "avatar_initial": u.get("name", "U")[0].upper() if u.get("name") else "U"
        })
    
    return {
        "users": sanitized_users,
        "total": len(sanitized_users),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


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
    """Get all available subscription plans with features - SINCRONIZADO CON FRONTEND"""
    # Planes individuales Premium
    individual_plans = [
        {
            "id": "free",
            "name": "Básico",
            "price": 0,
            "period": "mes",
            "max_users": 1,
            "features": [
                "10 análisis por mes",
                "Alertas básicas",
                "Historial 7 días",
                "Base de conocimiento",
                "Soporte por email"
            ],
            "limitations": ["Sin bloqueo automático", "Sin modo familiar", "Sin exportación"]
        },
        {
            "id": "weekly",
            "name": "Premium Semanal",
            "price": 9.99,
            "period": "semana",
            "max_users": 2,
            "badge": "Prueba",
            "features": [
                "Protección hasta 2 familiares",
                "Análisis ilimitados",
                "Bloqueo automático IA",
                "Historial completo",
                "Exportación de datos",
                "Soporte prioritario"
            ]
        },
        {
            "id": "monthly",
            "name": "Premium Mensual",
            "price": 29.99,
            "period": "mes",
            "max_users": 2,
            "badge": "Popular",
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Semanal",
                "Protección 24/7",
                "Análisis avanzado IA",
                "Reportes personalizados"
            ]
        },
        {
            "id": "quarterly",
            "name": "Premium Trimestral",
            "price": 74.99,
            "originalPrice": 89.97,
            "period": "3 meses",
            "max_users": 2,
            "badge": "Ahorro 17%",
            "savings": 15,
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Mensual",
                "Equivale a €25/mes",
                "Sin interrupciones"
            ]
        },
        {
            "id": "yearly",
            "name": "Premium Anual",
            "price": 249.99,
            "originalPrice": 359.88,
            "period": "año",
            "max_users": 2,
            "badge": "Mejor Valor - 31% OFF",
            "popular": True,
            "savings": 109.89,
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Mensual",
                "Equivale a €20.83/mes",
                "2 meses GRATIS",
                "Garantía satisfacción 15 días"
            ]
        }
    ]
    
    # Planes familiares
    family_plans = [
        {
            "id": "family-monthly",
            "name": "Familiar Mensual",
            "price": 49.99,
            "period": "mes",
            "max_users": 5,
            "features": [
                "Hasta 5 miembros familia",
                "Todo Premium incluido",
                "Modo Familiar Senior",
                "🆘 Botón SOS de Emergencia",
                "Panel administración familiar"
            ],
            "limitations": ["Sin localización GPS", "Sin tracking de niños"]
        },
        {
            "id": "family-quarterly",
            "name": "Familiar Trimestral",
            "price": 129.99,
            "originalPrice": 149.97,
            "period": "3 meses",
            "max_users": 5,
            "badge": "Ahorro 13%",
            "savings": 19.98,
            "features": [
                "Todo Familiar Mensual",
                "🆘 Botón SOS + GPS incluido",
                "📍 Localización bajo demanda",
                "Equivale a €43.33/mes"
            ],
            "limitations": ["Sin tracking continuo de niños"]
        },
        {
            "id": "family-yearly",
            "name": "Familiar Anual",
            "price": 399.99,
            "originalPrice": 599.88,
            "period": "año",
            "max_users": 5,
            "badge": "⭐ MÁS COMPLETO - 33% OFF",
            "popular": True,
            "savings": 199.89,
            "features": [
                "TODO de planes inferiores",
                "🆘 Botón SOS + GPS completo",
                "👶 LOCALIZAR NIÑOS por teléfono",
                "📍 Tracking bajo demanda",
                "📊 Historial de ubicaciones",
                "🔕 Modo silencioso opcional",
                "Equivale a €33.33/mes",
                "Garantía satisfacción 15 días"
            ]
        }
    ]
    
    # Planes Business y Enterprise
    business_plans = [
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
            ]
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
            ]
        }
    ]
    
    return {
        "individual_plans": individual_plans,
        "family_plans": family_plans,
        "business_plans": business_plans,
        "currency": "EUR",
        "billing_options": ["weekly", "monthly", "quarterly", "yearly"],
        "discounts": {
            "quarterly": 17,
            "yearly": 31
        }
    }

# ============================================
# STRIPE PAYMENT ROUTES
# ============================================

# Company information for invoices
COMPANY_INFO = {
    "name": "STARTBOOKING SL",
    "cif": "B19427723",
    "country": "ES"
}

@api_router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout session with product description and company info"""
    user = await get_current_user(http_request, session_token)
    user_id = user.user_id if user else "anonymous"
    user_email = user.email if user else "anonymous@mano.com"
    
    try:
        package = SUBSCRIPTION_PACKAGES.get(data.plan_type)
        if not package:
            raise HTTPException(status_code=400, detail="Plan de suscripción no válido")
        
        # Build product description for checkout
        product_description = f"ManoProtect {package['name']} - Protección contra fraudes y estafas digitales"
        if package.get("max_users", 1) > 1:
            product_description += f" (hasta {package['max_users']} usuarios)"
        product_description += f". Período: {package['period']}."
        
        # Redirigir a página de éxito personalizada
        success_url = f"{data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
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
                "plan_name": package["name"],
                "product_description": product_description,
                "company_name": COMPANY_INFO["name"],
                "company_cif": COMPANY_INFO["cif"],
                "billing_period": package["period"]
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
            metadata={
                "plan_name": package["name"], 
                "plan_period": package["period"],
                "product_description": product_description,
                "company": COMPANY_INFO["name"],
                "cif": COMPANY_INFO["cif"]
            }
        )
        
        tx_doc = transaction.model_dump()
        tx_doc['created_at'] = tx_doc['created_at'].isoformat()
        tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
        await db.payment_transactions.insert_one(tx_doc)
        
        return {
            "checkout_url": session.url, 
            "session_id": session.session_id,
            "product": {
                "name": package["name"],
                "description": product_description,
                "amount": package["amount"],
                "currency": "EUR",
                "period": package["period"]
            },
            "company": COMPANY_INFO
        }
    
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
# ENTERPRISE DASHBOARD ROUTES - MOVED TO routes/enterprise_routes.py
# ============================================

# ============================================
# FAMILY ROUTES - Using routes/family_routes.py
# (Legacy routes moved to modular router)
# ============================================

# ============================================
# NOTIFICATIONS - Using routes/notifications_routes.py
# (Legacy routes removed - all notification functionality in modular router)
# Helper function kept for internal use
# ============================================

# Helper function to create notification (used internally by other modules)
async def create_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    """Create and store a notification"""
    from models.all_schemas import Notification
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
    
    # Revenue (optimized aggregation - calculates sum directly in DB)
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payment_transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
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


@api_router.get("/admin/services-status")
async def get_services_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check status of all external services (Infobip, Firebase, Stripe)"""
    await require_admin(request, session_token)
    
    services = {
        "infobip": {"status": "unknown", "message": "", "configured": False},
        "firebase": {"status": "unknown", "message": "", "configured": False},
        "stripe": {"status": "unknown", "message": "", "configured": False},
        "mongodb": {"status": "ok", "message": "Conectado", "configured": True}
    }
    
    # Check Infobip
    infobip_key = os.environ.get('INFOBIP_API_KEY')
    infobip_url = os.environ.get('INFOBIP_BASE_URL')
    
    if infobip_key and infobip_url:
        services["infobip"]["configured"] = True
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{infobip_url}/account/1/balance",
                    headers={"Authorization": f"App {infobip_key}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    services["infobip"]["status"] = "ok"
                    services["infobip"]["message"] = f"Activo - Saldo: {data.get('balance', 'N/A')} {data.get('currency', '')}"
                else:
                    services["infobip"]["status"] = "error"
                    services["infobip"]["message"] = f"Error HTTP {response.status_code}"
        except Exception as e:
            services["infobip"]["status"] = "error"
            services["infobip"]["message"] = f"Error: {str(e)}"
    else:
        services["infobip"]["message"] = "Credenciales no configuradas en .env (INFOBIP_API_KEY, INFOBIP_BASE_URL)"
    
    # Check Firebase
    firebase_cred_path = os.path.join(os.path.dirname(__file__), 'firebase-admin-sdk.json')
    if os.path.exists(firebase_cred_path):
        services["firebase"]["configured"] = True
        try:
            import firebase_admin
            from firebase_admin import credentials
            # Check if already initialized
            try:
                firebase_admin.get_app()
                services["firebase"]["status"] = "ok"
                services["firebase"]["message"] = "Firebase Admin SDK inicializado"
            except ValueError:
                # Not initialized, try to initialize
                cred = credentials.Certificate(firebase_cred_path)
                firebase_admin.initialize_app(cred)
                services["firebase"]["status"] = "ok"
                services["firebase"]["message"] = "Firebase Admin SDK inicializado correctamente"
        except Exception as e:
            services["firebase"]["status"] = "error"
            services["firebase"]["message"] = f"Error: {str(e)}"
    else:
        services["firebase"]["message"] = "Archivo firebase-admin-sdk.json no encontrado"
    
    # Check Stripe
    stripe_key = os.environ.get('STRIPE_API_KEY')
    if stripe_key:
        services["stripe"]["configured"] = True
        try:
            import stripe
            stripe.api_key = stripe_key
            # Quick test - get account info
            account = stripe.Account.retrieve()
            services["stripe"]["status"] = "ok"
            services["stripe"]["message"] = f"Conectado - {account.get('business_profile', {}).get('name', 'Cuenta activa')}"
        except Exception as e:
            services["stripe"]["status"] = "error"
            services["stripe"]["message"] = f"Error: {str(e)}"
    else:
        services["stripe"]["message"] = "STRIPE_API_KEY no configurada"
    
    # Overall status
    all_ok = all(s["status"] == "ok" for s in services.values())
    any_error = any(s["status"] == "error" for s in services.values())
    
    return {
        "overall_status": "ok" if all_ok else ("error" if any_error else "warning"),
        "services": services,
        "timestamp": datetime.now(timezone.utc).isoformat()
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
        target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
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
    
    valid_plans = [
        "free", 
        "personal", "personal-monthly", "personal-quarterly", "personal-yearly",
        "family", "family-monthly", "family-quarterly", "family-yearly",
        "business", "business-monthly", "business-yearly",
        "enterprise", "enterprise-monthly", "enterprise-yearly"
    ]
    
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Plan inválido. Planes válidos: {', '.join(valid_plans)}")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        # Try with 'id' field
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    # Determine subscription status and expiry based on plan
    now = datetime.now(timezone.utc)
    if plan == "free":
        subscription_status = None
        subscription_expiry = None
    else:
        subscription_status = "active"
        # Set expiry based on plan period
        if "yearly" in plan:
            subscription_expiry = (now + timedelta(days=365)).isoformat()
        elif "quarterly" in plan:
            subscription_expiry = (now + timedelta(days=90)).isoformat()
        else:  # monthly
            subscription_expiry = (now + timedelta(days=30)).isoformat()
    
    # Update user plan
    update_data = {
        "plan": plan,
        "subscription_status": subscription_status,
        "subscription_expiry": subscription_expiry,
        "plan_updated_at": now.isoformat(),
        "plan_updated_by": "admin_manual",
        "is_active": True
    }
    
    # Update using the correct ID field
    query = {"user_id": user_id} if "user_id" in user else {"id": user_id}
    result = await db.users.update_one(query, {"$set": update_data})
    
    # Log the plan change
    await db.admin_logs.insert_one({
        "action": "plan_change",
        "user_id": user_id,
        "user_email": user.get("email"),
        "old_plan": old_plan,
        "new_plan": plan,
        "changed_by": "admin",
        "subscription_expiry": subscription_expiry,
        "created_at": now.isoformat()
    })
    
    return {
        "success": True,
        "message": f"Plan actualizado de '{old_plan}' a '{plan}'",
        "user_id": user_id,
        "old_plan": old_plan,
        "new_plan": plan,
        "subscription_status": subscription_status,
        "subscription_expiry": subscription_expiry
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
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
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

@api_router.post("/admin/users/{user_id}/cancel-subscription")
async def cancel_user_subscription(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel user subscription - downgrade to free plan (admin only)"""
    admin = await require_admin(request, session_token)
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    # Update to free plan
    query = {"user_id": user_id} if "user_id" in user else {"id": user_id}
    await db.users.update_one(query, {"$set": {
        "plan": "free",
        "subscription_status": "cancelled",
        "subscription_cancelled_at": datetime.now(timezone.utc).isoformat(),
        "subscription_cancelled_by": admin.user_id
    }})
    
    # Log the cancellation
    await db.admin_logs.insert_one({
        "action": "subscription_cancelled",
        "user_id": user_id,
        "user_email": user.get("email"),
        "old_plan": old_plan,
        "cancelled_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": f"Suscripción cancelada. Usuario degradado de '{old_plan}' a 'free'",
        "user_id": user_id
    }

@api_router.get("/admin/users/{user_id}/details")
async def get_user_details(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get detailed user information including family members (admin only)"""
    await require_admin(request, session_token)
    
    # Get user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get family members if family plan
    family_members = []
    if user.get("plan", "").startswith("family"):
        family_members = await db.family_members.find(
            {"owner_id": user_id},
            {"_id": 0}
        ).to_list(10)
    
    # Get children for tracking
    children = await db.family_children.find(
        {"family_owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get activity log
    activity = await db.admin_logs.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Get subscription history
    sub_history = await db.admin_logs.find(
        {"user_id": user_id, "action": {"$in": ["plan_change", "subscription_cancelled"]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "user": user,
        "family_members": family_members,
        "children_tracking": children,
        "activity": activity,
        "subscription_history": sub_history,
        "badge": SUBSCRIPTION_BADGES.get(user.get("plan", "free"), SUBSCRIPTION_BADGES["free"])
    }

@api_router.get("/admin/users/{user_id}/family-members")
async def get_user_family_members(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get family members for a user (admin only)"""
    await require_admin(request, session_token)
    
    # Get user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get family members
    family_members = await db.family_members.find(
        {"owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get children for tracking
    children = await db.family_children.find(
        {"family_owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    return {
        "user_email": user.get("email"),
        "user_plan": user.get("plan"),
        "family_members": family_members,
        "children_tracking": children,
        "max_members": 5 if user.get("plan", "").startswith("family") else 2
    }

@api_router.post("/admin/users/{user_id}/add-family-member")
async def admin_add_family_member(
    user_id: str,
    name: str,
    email: str,
    relationship: str = "familiar",
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Add family member to a user (admin only)"""
    await require_admin(request, session_token)
    
    # Verify user exists and has family plan
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user.get("plan", "").startswith("family"):
        raise HTTPException(status_code=400, detail="El usuario no tiene plan familiar")
    
    # Check member limit
    existing_members = await db.family_members.count_documents({"owner_id": user_id})
    if existing_members >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros alcanzado")
    
    # Add member
    member = {
        "member_id": f"member_{uuid.uuid4().hex[:12]}",
        "owner_id": user_id,
        "name": name,
        "email": email,
        "relationship": relationship,
        "added_at": datetime.now(timezone.utc).isoformat(),
        "added_by": "admin"
    }
    
    await db.family_members.insert_one(member)
    
    return {
        "success": True,
        "message": f"Miembro '{name}' añadido",
        "member": {k: v for k, v in member.items() if k != "_id"}
    }

@api_router.delete("/admin/users/{user_id}/family-member/{member_id}")
async def admin_remove_family_member(
    user_id: str,
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove family member from a user (admin only)"""
    await require_admin(request, session_token)
    
    result = await db.family_members.delete_one({
        "member_id": member_id,
        "owner_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"success": True, "message": "Miembro eliminado"}

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

@api_router.delete("/admin/users/cleanup/test-users")
async def delete_test_users(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete all test users (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Find test users
    test_patterns = ["test_", "demo@", "test@", "testuser@", "admin@mano"]
    deleted_count = 0
    deleted_emails = []
    
    async for user in db.users.find():
        email = user.get("email", "")
        user_id = user.get("user_id", user.get("id", ""))
        
        # Skip superadmins
        if user.get("role") == "superadmin":
            continue
            
        # Check if it's a test user
        is_test = any(pattern in email.lower() for pattern in test_patterns)
        if is_test:
            await db.users.delete_one({"_id": user["_id"]})
            await db.user_sessions.delete_many({"user_id": user_id})
            deleted_emails.append(email)
            deleted_count += 1
    
    return {
        "message": f"Eliminados {deleted_count} usuarios de test",
        "deleted_count": deleted_count,
        "deleted_emails": deleted_emails
    }

# Subscription badge system
SUBSCRIPTION_BADGES = {
    "free": {"name": "Bronce", "icon": "🥉", "color": "#CD7F32", "level": 1},
    "personal": {"name": "Plata", "icon": "🥈", "color": "#C0C0C0", "level": 2},
    "personal-monthly": {"name": "Plata", "icon": "🥈", "color": "#C0C0C0", "level": 2},
    "personal-quarterly": {"name": "Oro", "icon": "🥇", "color": "#FFD700", "level": 3},
    "personal-yearly": {"name": "Oro", "icon": "🥇", "color": "#FFD700", "level": 3},
    "family": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-monthly": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-quarterly": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-yearly": {"name": "Diamante", "icon": "💠", "color": "#B9F2FF", "level": 5},
    "business": {"name": "Diamante", "icon": "💠", "color": "#B9F2FF", "level": 5},
    "enterprise": {"name": "Élite", "icon": "👑", "color": "#9400D3", "level": 6},
}

@api_router.get("/user/badge")
async def get_user_badge(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's subscription badge"""
    user = await require_auth(request, session_token)
    plan = user.plan or "free"
    
    badge = SUBSCRIPTION_BADGES.get(plan, SUBSCRIPTION_BADGES["free"])
    
    return {
        "plan": plan,
        "badge": badge,
        "next_level": get_next_badge_level(plan)
    }

def get_next_badge_level(current_plan: str) -> dict:
    """Get next badge level for upgrade suggestion"""
    current = SUBSCRIPTION_BADGES.get(current_plan, SUBSCRIPTION_BADGES["free"])
    current_level = current["level"]
    
    upgrade_path = {
        1: {"plan": "personal", "badge": SUBSCRIPTION_BADGES["personal"]},
        2: {"plan": "personal-yearly", "badge": SUBSCRIPTION_BADGES["personal-yearly"]},
        3: {"plan": "family-monthly", "badge": SUBSCRIPTION_BADGES["family-monthly"]},
        4: {"plan": "family-yearly", "badge": SUBSCRIPTION_BADGES["family-yearly"]},
        5: {"plan": "enterprise", "badge": SUBSCRIPTION_BADGES["enterprise"]},
        6: None  # Already at max
    }
    
    return upgrade_path.get(current_level)

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
# PUSH NOTIFICATIONS - Using routes/push_routes.py
# (Legacy code removed - all push functionality in modular router)
# ============================================

# ============================================
# WHATSAPP INTEGRATION
# ============================================

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
# AI SUPPORT CHAT ROUTES
# ============================================

from pydantic import BaseModel as PydanticBaseModel

class ChatMessage(PydanticBaseModel):
    message: str
    session_id: Optional[str] = None

@api_router.post("/chat/message")
async def send_chat_message(
    data: ChatMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send a message to the AI support assistant"""
    from services.ai_support import get_ai_response
    
    # Get user if authenticated (optional for chat)
    user = await get_current_user(request, session_token)
    
    # Use user_id as session if authenticated, otherwise use provided or generate
    session_id = data.session_id
    if not session_id:
        if user:
            session_id = user.user_id
        else:
            session_id = f"anon_{uuid.uuid4().hex[:8]}"
    
    # Get AI response
    result = await get_ai_response(
        user_message=data.message,
        session_id=session_id,
        db=db
    )
    
    return {
        "success": True,
        "response": result["response"],
        "session_id": result["session_id"],
        "escalate_to_human": result.get("escalate_to_human", False)
    }


@api_router.get("/chat/quick-responses")
async def get_quick_responses():
    """Get quick response options for the chat widget"""
    from services.ai_support import get_quick_responses
    return {"responses": get_quick_responses()}


@api_router.delete("/chat/session/{session_id}")
async def clear_chat_session(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Clear chat history for a session"""
    from services.ai_support import clear_session
    clear_session(session_id)
    return {"success": True, "message": "Sesión limpiada"}


# ============================================
# PUBLIC API FOR PARTNERS (metrics & api-keys are in metrics_routes.py)
# ============================================

async def validate_api_key(api_key: str) -> Optional[dict]:
    """Validate API key and return key info"""
    key_doc = await db.api_keys.find_one({"key": api_key, "is_active": True}, {"_id": 0})
    return key_doc

# Public API endpoints (authenticated via API key)
public_router = APIRouter(prefix="/api/v1", tags=["public-api"])

# Simple access key for downloading documents (owner access)
OWNER_DOWNLOAD_KEY = os.environ.get("OWNER_DOWNLOAD_KEY")

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

# Download endpoints for deployable packages
@public_router.get("/downloads/{package_name}")
async def download_package(package_name: str, key: str = ""):
    """Download deployment packages"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    packages = {
        "web": "/app/downloads/MANO_Web_IONOS.zip",
        "mobile": "/app/downloads/MANO_Mobile_App.zip",
        "backend": "/app/downloads/MANO_Backend_Server.zip",
        "docs": "/app/downloads/MANO_Documentos_Inversores.zip",
        "todo": "/app/downloads/MANO_Completo_Todo.zip"
    }
    
    if package_name not in packages:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    file_path = packages[package_name]
    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    filenames = {
        "web": "MANO_Web_IONOS.zip",
        "mobile": "MANO_Mobile_App_PlayStore.zip",
        "backend": "MANO_Backend_Server.zip",
        "docs": "MANO_Documentos_Inversores.zip",
        "todo": "MANO_Completo_Todo.zip"
    }
    
    return FileResponse(
        path=file_path,
        media_type="application/zip",
        filename=filenames[package_name]
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
# BANKING INTEGRATION - RESERVED FOR MANOBANK.ES
# ============================================
# Banking features will be available when ManoBank.es is launched
# All banking endpoints (/bank/*) are disabled for ManoProtect

# ============================================
# MANOPROTECT ML FRAUD DETECTION
# ============================================

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

# Import and include modular routes BEFORE registering api_router
# Auth routes (already initialized at the top)
api_router.include_router(auth_router)
print("✅ Auth routes loaded")

# Investor routes
api_router.include_router(investor_router)
print("✅ Investor routes loaded")

# Threat routes
api_router.include_router(threat_router)
print("✅ Threat routes loaded")

# Profile & Contacts routes
api_router.include_router(profile_contacts_router)
print("✅ Profile & Contacts routes loaded")

# Family & SOS routes
api_router.include_router(family_sos_router)
print("✅ Family & SOS routes loaded")

# Family Management routes
api_router.include_router(family_router)
print("✅ Family Management routes loaded")

# Geofencing routes
api_router.include_router(geofence_router)
print("✅ Geofencing routes loaded")

# Core routes (health, plans, knowledge)
api_router.include_router(core_router)
print("✅ Core routes loaded")

# Notifications routes
api_router.include_router(notifications_router)
print("✅ Notifications routes loaded")

# Metrics routes
api_router.include_router(metrics_router)
print("✅ Metrics routes loaded")

# Chat routes (AI Support)
api_router.include_router(chat_router)
print("✅ Chat routes loaded")

# Employee Portal routes (Messaging & Presence)
api_router.include_router(employee_portal_router)
print("✅ Employee Portal routes loaded")

# Enterprise routes (Dashboard & Reports)
api_router.include_router(enterprise_router)
print("✅ Enterprise routes loaded")

# ManoProtect Shield routes (DNA Digital, Trust Seal, Voice AI, etc.)
api_router.include_router(shield_router)
print("✅ ManoProtect Shield routes loaded")

# Real-Time Scam Detection routes (LIVE data)
api_router.include_router(realtime_router)
print("✅ Real-Time Scam Detection routes loaded (LIVE)")

# AI Voice Shield routes
api_router.include_router(voice_shield_router)
print("✅ AI Voice Shield routes loaded")

# Smart Family Locator routes
api_router.include_router(smart_locator_router)
print("✅ Smart Family Locator routes loaded")

# Anti-Deepfake Shield routes
api_router.include_router(deepfake_shield_router)
print("✅ Anti-Deepfake Shield routes loaded")

# Investor CRM routes
api_router.include_router(investor_crm_router)

# Demo Videos (Sora 2 AI video generation)
api_router.include_router(demo_videos_router)
print("✅ Investor CRM routes loaded")

# Payment routes (Stripe)
api_router.include_router(payments_router)
print("✅ Payment routes loaded")

# Admin routes for user management
init_admin_routes(db)
api_router.include_router(admin_routes)
print("✅ Admin routes loaded")

# Health profile routes
init_health_routes(db)
api_router.include_router(health_router)
print("✅ Health profile routes loaded")

# Audio storage routes
init_audio_routes(db)
api_router.include_router(audio_router)
print("✅ Audio storage routes loaded")

# Device management routes
init_device_routes(db)
api_router.include_router(device_router)
print("✅ Device management routes loaded")

# Push notification routes
init_push_routes(db)
api_router.include_router(push_router)
print("✅ Push notification routes loaded")

# SOS Test routes (for development/testing)
try:
    from routes.sos_test_routes import router as sos_test_router
    api_router.include_router(sos_test_router)
    print("✅ SOS Test routes loaded")
except ImportError as e:
    print(f"⚠️ SOS Test routes not loaded: {e}")

# Banking routes - RESERVED for ManoBank.es
# try:
#     from routes.banking_routes import router as banking_router
#     api_router.include_router(banking_router)
#     print("✅ Banking routes loaded")
# except ImportError as e:
#     print(f"⚠️ Banking routes not loaded: {e}")

# ManoBank routes RESERVED - Will be loaded when ManoBank.es domain is ready
# try:
#     from routes.manobank_routes import router as manobank_router, init_manobank_routes
#     init_manobank_routes(db)
#     api_router.include_router(manobank_router)
#     print("✅ ManoBank routes loaded")
# except ImportError as e:
#     print(f"⚠️ ManoBank routes not loaded: {e}")
#
# try:
#     from routes.manobank_admin_routes import router as manobank_admin_router, init_manobank_admin_routes
#     init_manobank_admin_routes(db)
#     api_router.include_router(manobank_admin_router)
#     print("✅ ManoBank Admin routes loaded")
# except ImportError as e:
#     print(f"⚠️ ManoBank Admin routes not loaded: {e}")

try:
    from routes.email_routes import router as email_router, alerts_router, init_email_routes
    init_email_routes(db)
    api_router.include_router(email_router)
    api_router.include_router(alerts_router)
    print("✅ Email routes loaded")
    print("✅ Alert subscription routes loaded")
except ImportError as e:
    print(f"⚠️ Email routes not loaded: {e}")

try:
    from routes.whatsapp_routes import router as whatsapp_router
    api_router.include_router(whatsapp_router)
    print("✅ WhatsApp routes loaded")
except ImportError as e:
    print(f"⚠️ WhatsApp routes not loaded: {e}")

# Fraud API routes - Public scam verification
try:
    from routes.fraud_routes import router as fraud_router, init_fraud_routes
    init_fraud_routes(db)
    api_router.include_router(fraud_router)
    print("✅ Fraud API routes loaded")
except ImportError as e:
    print(f"⚠️ Fraud routes not loaded: {e}")

# SMS routes - RESERVED for ManoBank.es
# try:
#     from routes.sms_routes import router as sms_router, init_sms_routes
#     init_sms_routes(db)
#     api_router.include_router(sms_router)
#     print("✅ SMS/Twilio routes loaded")
# except ImportError as e:
#     print(f"⚠️ SMS routes not loaded: {e}")

# KYC Video Verification routes - RESERVED for ManoBank.es
# try:
#     from routes.kyc_video_routes import router as kyc_router, init_kyc_routes
#     init_kyc_routes(db)
#     api_router.include_router(kyc_router)
#     print("✅ KYC Video Verification routes loaded")
# except ImportError as e:
#     print(f"⚠️ KYC routes not loaded: {e}")

# Compliance & Banking Core routes - RESERVED for ManoBank.es
# api_router.include_router(compliance_router)
# print("✅ Compliance routes loaded")
# api_router.include_router(banking_core_router)
# print("✅ Banking Core routes loaded (Ledger, AML, KYC, Reporting)")

# Account deletion request routes (required by Google Play)
try:
    from routes.account_routes import router as account_router, init_account_routes
    init_account_routes(db)
    api_router.include_router(account_router)
    print("✅ Account deletion routes loaded")
except ImportError as e:
    print(f"⚠️ Account routes not loaded: {e}")

# Security Intelligence routes
try:
    from routes.security_routes import router as security_router, init_security_routes
    init_security_routes(db)
    api_router.include_router(security_router)
    print("✅ Security Intelligence routes loaded")
except ImportError as e:
    print(f"⚠️ Security routes not loaded: {e}")

app.include_router(api_router)
app.include_router(public_router)

# Mount Socket.IO for real-time WebSocket communication
app.mount('/ws', socket_app)
print("✅ WebSocket server mounted at /ws")

# Configure CORS - read from environment for deployment flexibility
# IMPORTANT: When using credentials, we cannot use wildcard '*' for origins
cors_origins_env = os.environ.get('CORS_ORIGINS', '')

# Define allowed origins explicitly (wildcard '*' not compatible with credentials)
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:8001",
    "http://localhost:8002",
    "https://manoprotect.com",
    "https://www.manoprotect.com",
    "https://digital-guard-1.emergent.host",
]

# Add any additional origins from environment
if cors_origins_env and cors_origins_env != '*':
    for origin in cors_origins_env.split(','):
        origin = origin.strip()
        if origin and origin != '*' and origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================
# STARTUP: Initialize Superadmins
# ============================================
@app.on_event("startup")
async def initialize_superadmins():
    """Create or update superadmin accounts on server startup"""
    import bcrypt
    
    print("🔐 Initializing superadmin accounts...")
    
    for admin in SUPERADMIN_ACCOUNTS:
        try:
            existing = await db.users.find_one({"email": admin["email"]})
            
            if existing:
                # Update existing user to superadmin and unblock
                update_data = {
                    "role": "superadmin",
                    "is_superadmin": True,
                    "plan": "enterprise",
                    "subscription_status": "active",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                # Update password if specified
                if admin.get("password"):
                    update_data["password_hash"] = bcrypt.hashpw(
                        admin["password"].encode(), 
                        bcrypt.gensalt()
                    ).decode()
                
                await db.users.update_one(
                    {"email": admin["email"]},
                    {"$set": update_data}
                )
                
                # Remove any login blocks
                await db.security_login_attempts.delete_many({"email": admin["email"]})
                
                print(f"  ✅ Updated: {admin['email']} (superadmin, unblocked)")
            else:
                # Create new superadmin
                if not admin.get("password"):
                    print(f"  ⚠️ Skipped: {admin['email']} (no password, user doesn't exist)")
                    continue
                    
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                password_hash = bcrypt.hashpw(admin["password"].encode(), bcrypt.gensalt()).decode()
                
                user_doc = {
                    "user_id": user_id,
                    "email": admin["email"],
                    "name": admin["name"],
                    "password_hash": password_hash,
                    "plan": "enterprise",
                    "role": "superadmin",
                    "is_superadmin": True,
                    "subscription_status": "active",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.users.insert_one(user_doc)
                print(f"  ✅ Created: {admin['email']} (superadmin)")
                
        except Exception as e:
            print(f"  ❌ Error with {admin['email']}: {e}")
    
    print("🔐 Superadmin initialization complete!")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
