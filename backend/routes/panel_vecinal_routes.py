"""
ManoProtect - Panel Vecinal Premium Routes
EXCLUSIVE: Only for vecinal-anual plan subscribers (annual, per family_id)
The most expensive plan. Real-time neighborhood security panel.
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/panel-vecinal", tags=["Panel Vecinal Premium"])

_db = None

def init_panel_vecinal(db):
    global _db
    _db = db


PLAN_ID = "vecinal-anual"
PLAN_PRICE = 499.99
PLAN_NAME = "Escudo Vecinal Premium"


async def validate_vecinal_subscription(request: Request, session_token: Optional[str] = Cookie(None)):
    """Validate that the user has an active vecinal-anual subscription via family_id"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Debes iniciar sesion para acceder al Panel Vecinal")

    family_id = getattr(user, 'family_id', None) or user.user_id

    sub = await _db.subscriptions.find_one({
        "$or": [
            {"family_id": family_id, "plan_type": PLAN_ID, "status": "active"},
            {"user_id": user.user_id, "plan_type": PLAN_ID, "status": "active"},
        ]
    }, {"_id": 0})

    if not sub:
        raise HTTPException(
            status_code=403,
            detail="Acceso exclusivo para suscriptores del Plan Escudo Vecinal Premium (anual). Contrata tu plan en /panel-vecinal."
        )

    return user, family_id, sub


class VecinalAlert(BaseModel):
    type: str = Field(..., description="okupacion, robo_vivienda, robo_local, intrusion, vandalismo, sospechoso, emergencia")
    title: str
    description: str
    latitude: float
    longitude: float
    urgency: str = Field(default="alta", description="media, alta, critica")
    address: str = ""


class NeighborJoin(BaseModel):
    neighborhood_name: str
    latitude: float
    longitude: float
    address: str = ""


# ============================================
# PUBLIC: Plan info + subscription check
# ============================================

@router.get("/plan-info")
async def get_plan_info():
    """Get plan info - public endpoint"""
    return {
        "plan_id": PLAN_ID,
        "name": PLAN_NAME,
        "price": PLAN_PRICE,
        "period": "ano",
        "price_monthly_equivalent": round(PLAN_PRICE / 12, 2),
        "annual_only": True,
        "per_family": True,
        "features": [
            "Panel Vecinal en tiempo real 24/7",
            "Alertas instantaneas a todos los vecinos",
            "Mapa de incidencias del barrio en vivo",
            "Alertas de okupacion y robos",
            "Red de vigilancia vecinal coordinada",
            "Historial completo de incidencias (1 ano)",
            "Estadisticas de seguridad del barrio",
            "Contacto directo con vecinos protectores",
            "Alarma completa para vivienda incluida",
            "Dispositivo Sentinel SOS incluido",
            "Prioridad maxima en alertas policiales",
            "Soporte prioritario 24/7",
        ],
        "comparison": {
            "vs_alarma_essential": {"saving": "Incluye alarma + comunidad por menos", "value": "Todo en uno"},
            "vs_securitas": {"note": "Securitas Direct NO ofrece seguridad comunitaria"},
            "vs_prosegur": {"note": "Prosegur NO conecta a los vecinos entre si"},
        },
    }


@router.get("/check-access")
async def check_access(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check if user has vecinal premium access"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)

    if not user:
        return {"has_access": False, "reason": "not_logged_in"}

    family_id = getattr(user, 'family_id', None) or user.user_id

    sub = await _db.subscriptions.find_one({
        "$or": [
            {"family_id": family_id, "plan_type": PLAN_ID, "status": "active"},
            {"user_id": user.user_id, "plan_type": PLAN_ID, "status": "active"},
        ]
    }, {"_id": 0})

    if sub:
        return {
            "has_access": True,
            "family_id": family_id,
            "plan": PLAN_NAME,
            "expires_at": sub.get("expires_at"),
            "neighborhood": sub.get("neighborhood"),
        }

    return {"has_access": False, "reason": "no_subscription", "plan_required": PLAN_ID}


# ============================================
# PROTECTED: Panel Vecinal (requires active subscription)
# ============================================

@router.post("/alerts")
async def send_vecinal_alert(data: VecinalAlert, request: Request, session_token: Optional[str] = Cookie(None)):
    """Send a real-time alert to ALL neighbors in the network. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    valid_types = ["okupacion", "robo_vivienda", "robo_local", "intrusion", "vandalismo", "sospechoso", "emergencia"]
    if data.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Tipos: {valid_types}")

    alert_id = f"va_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    type_labels = {
        "okupacion": {"label": "Posible okupacion", "icon": "home-alert", "color": "#DC2626", "priority": 10},
        "robo_vivienda": {"label": "Robo en vivienda", "icon": "home-lock", "color": "#EF4444", "priority": 9},
        "robo_local": {"label": "Robo en local/comercio", "icon": "store", "color": "#F97316", "priority": 8},
        "intrusion": {"label": "Intrusion detectada", "icon": "alert", "color": "#EF4444", "priority": 9},
        "vandalismo": {"label": "Vandalismo", "icon": "hammer", "color": "#F59E0B", "priority": 6},
        "sospechoso": {"label": "Actividad sospechosa", "icon": "eye", "color": "#EAB308", "priority": 5},
        "emergencia": {"label": "Emergencia vecinal", "icon": "siren", "color": "#DC2626", "priority": 10},
    }

    alert = {
        "alert_id": alert_id,
        "type": data.type,
        "type_meta": type_labels.get(data.type, type_labels["sospechoso"]),
        "title": data.title,
        "description": data.description,
        "address": data.address,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "urgency": data.urgency,
        "reporter_id": user.user_id,
        "reporter_name": user.name,
        "family_id": family_id,
        "neighborhood": sub.get("neighborhood", ""),
        "status": "active",
        "seen_by": [],
        "confirmed_by": [user.user_id],
        "confirmations": 1,
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=48)).isoformat(),
        "is_premium_alert": True,
    }

    await _db.vecinal_alerts.insert_one(alert)

    # Also copy to community_incidents for public visibility
    await _db.community_incidents.insert_one({
        "incident_id": alert_id,
        "type": data.type if data.type in ["vandalismo", "sospechoso", "emergencia"] else "emergencia",
        "type_meta": alert["type_meta"],
        "title": f"[ALERTA VECINAL] {data.title}",
        "description": data.description,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "severity": "critica" if data.urgency == "critica" else "alta",
        "reporter_id": user.user_id,
        "reporter_name": user.name,
        "anonymous": False,
        "status": "confirmed",
        "confirmations": 1,
        "confirmed_by": [user.user_id],
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=48)).isoformat(),
        "is_premium_alert": True,
    })

    return {
        "alert_id": alert_id,
        "message": "Alerta enviada a todos los vecinos del barrio",
        "type_meta": alert["type_meta"],
        "urgency": data.urgency,
    }


@router.get("/alerts")
async def get_vecinal_alerts(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get all active alerts in the neighborhood. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    now = datetime.now(timezone.utc)
    forty_eight_hours = (now - timedelta(hours=48)).isoformat()

    alerts = await _db.vecinal_alerts.find(
        {"created_at": {"$gte": forty_eight_hours}, "status": {"$in": ["active", "confirmed"]}},
        {"_id": 0, "seen_by": 0}
    ).sort("created_at", -1).limit(100).to_list(100)

    return {"alerts": alerts, "total": len(alerts), "family_id": family_id}


@router.get("/dashboard")
async def get_vecinal_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get full dashboard stats for the neighborhood. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()

    alerts_week = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": week_ago}})
    alerts_month = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": month_ago}})

    # Type breakdown
    type_pipeline = [
        {"$match": {"created_at": {"$gte": month_ago}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    type_stats = await _db.vecinal_alerts.aggregate(type_pipeline).to_list(20)

    # Active subscribers in neighborhood
    neighborhood = sub.get("neighborhood", "")
    active_families = await _db.subscriptions.count_documents({
        "plan_type": PLAN_ID,
        "status": "active",
    })

    # Recent alerts
    recent = await _db.vecinal_alerts.find(
        {"status": {"$in": ["active", "confirmed"]}},
        {"_id": 0, "seen_by": 0}
    ).sort("created_at", -1).limit(10).to_list(10)

    return {
        "family_id": family_id,
        "neighborhood": neighborhood,
        "alerts_this_week": alerts_week,
        "alerts_this_month": alerts_month,
        "by_type": {s["_id"]: s["count"] for s in type_stats if s["_id"]},
        "active_families": active_families,
        "recent_alerts": recent,
        "security_level": "alto" if alerts_week < 3 else "medio" if alerts_week < 8 else "bajo",
        "plan": PLAN_NAME,
    }


@router.patch("/alerts/{alert_id}/confirm")
async def confirm_vecinal_alert(alert_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Confirm an alert (I see it too). PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    alert = await _db.vecinal_alerts.find_one({"alert_id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    if user.user_id in alert.get("confirmed_by", []):
        return {"message": "Ya confirmaste esta alerta", "confirmations": alert.get("confirmations", 0)}

    await _db.vecinal_alerts.update_one(
        {"alert_id": alert_id},
        {"$inc": {"confirmations": 1}, "$push": {"confirmed_by": user.user_id}},
    )

    return {"message": "Alerta confirmada", "confirmations": alert.get("confirmations", 0) + 1}


@router.patch("/alerts/{alert_id}/resolve")
async def resolve_vecinal_alert(alert_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Mark alert as resolved. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    await _db.vecinal_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {"status": "resolved", "resolved_at": datetime.now(timezone.utc).isoformat(), "resolved_by": user.user_id}},
    )
    return {"message": "Alerta resuelta"}


@router.get("/neighbors")
async def get_neighbor_families(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get list of neighbor families in the network. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    families = await _db.subscriptions.find(
        {"plan_type": PLAN_ID, "status": "active"},
        {"_id": 0, "family_id": 1, "neighborhood": 1, "user_name": 1, "created_at": 1}
    ).limit(50).to_list(50)

    return {"families": families, "total": len(families)}
