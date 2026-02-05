"""
ManoProtect - Core Routes
Basic endpoints: health, plans, knowledge base, community alerts
"""
from fastapi import APIRouter
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(tags=["Core"])

_db = None

# Plan definitions
PLAN_FEATURES = {
    "free": {
        "name": "Gratuito",
        "price": 0,
        "max_contacts": 2,
        "max_family_members": 0,
        "max_geofences": 1,
        "features": ["Detección básica de amenazas", "2 contactos de emergencia", "1 zona segura"]
    },
    "family-monthly": {
        "name": "Familiar Mensual",
        "price": 4.99,
        "billing": "monthly",
        "max_contacts": 10,
        "max_family_members": 5,
        "max_geofences": 999,
        "features": ["Hasta 5 familiares", "Zonas seguras ilimitadas", "GPS en tiempo real", "Alertas SMS + Push", "Sin anuncios"]
    },
    "family-yearly": {
        "name": "Familiar Anual",
        "price": 49.99,
        "billing": "yearly",
        "max_contacts": 10,
        "max_family_members": 5,
        "max_geofences": 999,
        "features": ["Ahorra 2 meses", "Hasta 5 familiares", "Zonas seguras ilimitadas", "GPS en tiempo real", "Alertas SMS + Push", "Sin anuncios", "Soporte prioritario"]
    }
}

KNOWLEDGE_BASE = [
    {
        "id": "phishing",
        "title": "¿Qué es el Phishing?",
        "content": "El phishing es un tipo de estafa donde los atacantes se hacen pasar por entidades legítimas para robar información personal.",
        "category": "amenazas"
    },
    {
        "id": "smishing",
        "title": "¿Qué es el Smishing?",
        "content": "El smishing es phishing a través de SMS. Los estafadores envían mensajes de texto fraudulentos para engañarte.",
        "category": "amenazas"
    },
    {
        "id": "vishing",
        "title": "¿Qué es el Vishing?",
        "content": "El vishing es phishing por voz (llamadas telefónicas). Los estafadores llaman haciéndose pasar por bancos u otras entidades.",
        "category": "amenazas"
    },
    {
        "id": "sos",
        "title": "¿Cómo funciona el botón SOS?",
        "content": "El botón SOS envía tu ubicación GPS exacta a tus contactos de emergencia mediante SMS y notificación push.",
        "category": "funciones"
    }
]


def init_core_routes(db, plan_features=None):
    """Initialize routes with database"""
    global _db, PLAN_FEATURES
    _db = db
    if plan_features:
        PLAN_FEATURES.update(plan_features)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ManoProtect API",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/community-alerts")
async def get_community_alerts(limit: int = 20):
    """Get community security alerts"""
    if _db is None:
        return {"alerts": [], "message": "Database not initialized"}
    
    alerts = await _db.community_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"alerts": alerts}


@router.get("/knowledge-base")
async def get_knowledge_base():
    """Get security knowledge base articles"""
    return {
        "articles": KNOWLEDGE_BASE,
        "total": len(KNOWLEDGE_BASE)
    }


@router.get("/plans")
async def get_available_plans():
    """Get available subscription plans"""
    personal_plans = []
    family_plans = []
    business_plans = []
    
    for plan_id, plan in PLAN_FEATURES.items():
        plan_data = {
            "id": plan_id,
            "name": plan.get("name", plan_id),
            "price": plan.get("price", 0),
            "billing": plan.get("billing", "monthly"),
            "features": plan.get("features", []),
            "max_contacts": plan.get("max_contacts", 2),
            "max_family_members": plan.get("max_family_members", 0),
            "max_geofences": plan.get("max_geofences", 1)
        }
        
        if "family" in plan_id:
            family_plans.append(plan_data)
        elif "business" in plan_id or "enterprise" in plan_id:
            business_plans.append(plan_data)
        else:
            personal_plans.append(plan_data)
    
    return {
        "personal_plans": personal_plans,
        "family_plans": family_plans,
        "business_plans": business_plans,
        "currency": "EUR",
        "discounts": {
            "quarterly": 17,
            "yearly": 31
        },
        "billing_options": ["weekly", "monthly", "quarterly", "yearly"]
    }
