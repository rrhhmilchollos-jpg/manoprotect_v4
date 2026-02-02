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
    BankAlert, BankAccountConnect, TransactionAnalyze,
    EmailPreferencesUpdate
)

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
# SUPERADMIN CONFIGURATION (passwords from env)
# ============================================
SUPERADMIN_ACCOUNTS = [
    {"email": "info@manoprotect.com", "name": "ManoProtect Admin", "password": os.environ.get('SUPERADMIN_PASSWORD_1', '19862210Des')},
    {"email": "rrhh.milchollos@gmail.com", "name": "ManoProtect RRHH", "password": os.environ.get('SUPERADMIN_PASSWORD_2', '19862210Des')},
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

# Initialize Twilio for SMS 2FA
twilio_client = None
try:
    from twilio.rest import Client as TwilioClient
    twilio_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    twilio_token = os.environ.get('TWILIO_AUTH_TOKEN')
    if twilio_sid and twilio_token:
        twilio_client = TwilioClient(twilio_sid, twilio_token)
        print("✅ Twilio SMS initialized")
except Exception as e:
    print(f"⚠️ Twilio not available: {e}")

init_auth_routes(db, twilio_client)

from routes.investor_routes import router as investor_router, init_investor_routes
init_investor_routes(db)

from routes.threat_routes import router as threat_router, init_threat_routes
from emergentintegrations.llm.chat import LlmChat, UserMessage
init_threat_routes(db, EMERGENT_LLM_KEY, LlmChat, UserMessage)

from routes.profile_contacts_routes import router as profile_contacts_router, init_profile_routes
init_profile_routes(db)

from routes.family_sos_routes import router as family_sos_router, init_family_routes
init_family_routes(db, PLAN_FEATURES)

# Payment Routes (Stripe)
from routes.payments_routes import router as payments_router
from routes.admin_routes import router as admin_router, init_db as init_admin_routes
from routes.health_routes import router as health_router, init_db as init_health_routes
from routes.audio_routes import router as audio_router, init_db as init_audio_routes
from routes.device_routes import router as device_router, init_db as init_device_routes

# Banking and Compliance services - RESERVED for ManoBank.es
# from services.compliance_service import init_compliance_service
# from routes.compliance_routes import router as compliance_router, init_compliance_routes
# init_compliance_service(db)
# init_compliance_routes(db, require_admin)
# from routes.banking_core_routes import router as banking_core_router, init_banking_core_routes
# init_banking_core_routes(db, require_admin)

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
# ENTERPRISE DASHBOARD ROUTES
# ============================================

@api_router.get("/enterprise/dashboard")
async def get_enterprise_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get enterprise dashboard with advanced metrics"""
    user = await require_auth(request, session_token)
    
    # Optimized: Use aggregation pipeline to calculate metrics in DB
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Aggregation for total counts and risk distribution
    stats_pipeline = [
        {"$match": {"user_id": user.user_id}},
        {"$group": {
            "_id": None,
            "total_threats": {"$sum": 1},
            "threats_blocked": {"$sum": {"$cond": [{"$eq": ["$is_threat", True]}, 1, 0]}},
            "critical": {"$sum": {"$cond": [{"$eq": ["$risk_level", "critical"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}},
            "medium": {"$sum": {"$cond": [{"$eq": ["$risk_level", "medium"]}, 1, 0]}},
            "low": {"$sum": {"$cond": [{"$eq": ["$risk_level", "low"]}, 1, 0]}}
        }}
    ]
    stats_result = await db.threat_analysis.aggregate(stats_pipeline).to_list(1)
    
    if stats_result:
        stats = stats_result[0]
        total_threats = stats.get("total_threats", 0)
        threats_blocked = stats.get("threats_blocked", 0)
        risk_counts = {
            "critical": stats.get("critical", 0),
            "high": stats.get("high", 0),
            "medium": stats.get("medium", 0),
            "low": stats.get("low", 0)
        }
    else:
        total_threats = 0
        threats_blocked = 0
        risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    # Aggregation for threat types (limited to recent 100 for performance)
    threat_types_pipeline = [
        {"$match": {"user_id": user.user_id}},
        {"$unwind": "$threat_types"},
        {"$group": {"_id": "$threat_types", "count": {"$sum": 1}}},
        {"$limit": 20}
    ]
    threat_types_result = await db.threat_analysis.aggregate(threat_types_pipeline).to_list(20)
    threat_types_count = {item["_id"]: item["count"] for item in threat_types_result}
    
    # Aggregation for daily trends (last 30 days only)
    daily_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }}
    ]
    daily_result = await db.threat_analysis.aggregate(daily_pipeline).to_list(30)
    daily_threats = {item["_id"]: item["count"] for item in daily_result if item["_id"]}
    
    # Calculate money saved (estimated €500 per blocked threat)
    money_saved = threats_blocked * 500
    
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
    
    # Get recent alerts for display (optimized with limit)
    recent_alerts = await db.threat_analysis.find(
        {"user_id": user.user_id, "is_threat": True}, 
        {"_id": 0, "content": 1, "risk_level": 1, "threat_types": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
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
        "recent_alerts": recent_alerts
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
    
    # Optimized: Use aggregation with date filter directly in MongoDB
    stats_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": start_date}}},
        {"$group": {
            "_id": None,
            "total_threats": {"$sum": 1},
            "blocked": {"$sum": {"$cond": [{"$eq": ["$is_threat", True]}, 1, 0]}},
            "critical": {"$sum": {"$cond": [{"$eq": ["$risk_level", "critical"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}},
            "medium": {"$sum": {"$cond": [{"$eq": ["$risk_level", "medium"]}, 1, 0]}},
            "low": {"$sum": {"$cond": [{"$eq": ["$risk_level", "low"]}, 1, 0]}}
        }}
    ]
    stats_result = await db.threat_analysis.aggregate(stats_pipeline).to_list(1)
    
    if stats_result:
        stats = stats_result[0]
        total_threats = stats.get("total_threats", 0)
        blocked = stats.get("blocked", 0)
        by_risk = {
            "critical": stats.get("critical", 0),
            "high": stats.get("high", 0),
            "medium": stats.get("medium", 0),
            "low": stats.get("low", 0)
        }
    else:
        total_threats = 0
        blocked = 0
        by_risk = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    # Aggregation for threat types
    types_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": start_date}}},
        {"$unwind": "$threat_types"},
        {"$group": {"_id": "$threat_types", "count": {"$sum": 1}}},
        {"$limit": 20}
    ]
    types_result = await db.threat_analysis.aggregate(types_pipeline).to_list(20)
    by_type = {item["_id"]: item["count"] for item in types_result}
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat(),
        "total_threats": total_threats,
        "blocked": blocked,
        "by_type": by_type,
        "by_risk": by_risk,
        "generated_at": now.isoformat()
    }

# ============================================
# FAMILY ADMIN ROUTES
# ============================================

@api_router.get("/family/dashboard")
async def get_family_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family protection dashboard"""
    user = await require_auth(request, session_token)
    
    # Check if user has family plan or enterprise plan (both have family features)
    has_family_features = user.plan and (user.plan.startswith("family") or user.plan in ["enterprise", "business"])
    
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
        "has_family_plan": has_family_features,
        "user_plan": user.plan
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
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        # Try with 'id' field
        user = await db.users.find_one({"id": user_id})
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

@api_router.post("/admin/users/{user_id}/cancel-subscription")
async def cancel_user_subscription(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel user subscription - downgrade to free plan (admin only)"""
    admin = await require_admin(request, session_token)
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        user = await db.users.find_one({"id": user_id})
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
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        user = await db.users.find_one({"id": user_id})
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
# WEB PUSH NOTIFICATIONS
# ============================================

from pywebpush import webpush, WebPushException
import json

# Generate VAPID keys (in production, store these securely)
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'cMCW8hLpP7Zl4l2n3Vh6_qJmJgwJJA-2VR-SqVGKlzE')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BNbxGYNMhEIi4d00Zc4Y-nLcQ6x8_V9P2z8gYJJ6zyZa0R0vWxyXlB8Gx9LzY8hFJhY0Q3c6BXGz0PjZkL8Jbyo')
VAPID_CLAIMS = {"sub": "mailto:alerts@mano-protect.com"}

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
OWNER_DOWNLOAD_KEY = os.environ.get("OWNER_DOWNLOAD_KEY", "mano2025investor")

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
# BANK INTEGRATION (Placeholder)
# ============================================

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

# Payment routes (Stripe)
api_router.include_router(payments_router)
print("✅ Payment routes loaded")

# Admin routes for user management
init_admin_routes(db)
api_router.include_router(admin_router)
print("✅ Admin routes loaded")

# Health profile routes
init_health_routes(db)
api_router.include_router(health_router)
print("✅ Health profile routes loaded")

# Audio storage routes
init_audio_routes(db)
api_router.include_router(audio_router)
print("✅ Audio storage routes loaded")

try:
    from routes.banking_routes import router as banking_router
    api_router.include_router(banking_router)
    print("✅ Banking routes loaded")
except ImportError as e:
    print(f"⚠️ Banking routes not loaded: {e}")

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

# Fraud API routes (shared with ManoBank)
try:
    from routes.fraud_routes import router as fraud_router, init_fraud_routes
    init_fraud_routes(db)
    api_router.include_router(fraud_router)
    print("✅ Fraud API routes loaded (ManoBank integration)")
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

app.include_router(api_router)
app.include_router(public_router)

# Configure CORS - read from environment for deployment flexibility
cors_origins_env = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_env == '*':
    allowed_origins = ['*']
else:
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(',')]

# Add localhost origins for development
dev_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8001",
    "http://localhost:8002",
]
for origin in dev_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
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
