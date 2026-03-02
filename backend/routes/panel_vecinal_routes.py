"""
ManoProtect - Panel Vecinal Premium Routes
INDEPENDENT & OPTIONAL plan - NOT tied to any other product/plan.
Annual only, per family_id, unlimited families can join.
Includes referral system: bring a neighbor, get 1 month free.
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid, secrets

router = APIRouter(prefix="/panel-vecinal", tags=["Panel Vecinal Premium"])

_db = None

def init_panel_vecinal(db):
    global _db
    _db = db


PLAN_ID = "vecinal-anual"
PLAN_PRICE = 299.99
PLAN_NAME = "Escudo Vecinal Premium"


async def validate_vecinal_subscription(request: Request, session_token: Optional[str] = Cookie(None)):
    """Validate active vecinal-anual subscription via family_id. This plan is INDEPENDENT."""
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
            detail="Plan Escudo Vecinal Premium requerido. Es un plan independiente — no necesitas ningun otro producto de ManoProtect."
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


class ReferralCreate(BaseModel):
    neighbor_email: str
    neighbor_name: str = ""
    message: str = ""


ALERT_TYPES = {
    "okupacion": {"label": "Posible okupacion", "color": "#DC2626", "priority": 10},
    "robo_vivienda": {"label": "Robo en vivienda", "color": "#EF4444", "priority": 9},
    "robo_local": {"label": "Robo en local/comercio", "color": "#F97316", "priority": 8},
    "intrusion": {"label": "Intrusion detectada", "color": "#EF4444", "priority": 9},
    "vandalismo": {"label": "Vandalismo", "color": "#F59E0B", "priority": 6},
    "sospechoso": {"label": "Actividad sospechosa", "color": "#EAB308", "priority": 5},
    "emergencia": {"label": "Emergencia vecinal", "color": "#DC2626", "priority": 10},
}


# ============================================
# PUBLIC ENDPOINTS
# ============================================

@router.get("/plan-info")
async def get_plan_info():
    """Get plan info - public. The plan is INDEPENDENT and OPTIONAL."""
    return {
        "plan_id": PLAN_ID,
        "name": PLAN_NAME,
        "price": PLAN_PRICE,
        "period": "ano",
        "price_monthly_equivalent": round(PLAN_PRICE / 12, 2),
        "annual_only": True,
        "per_family": True,
        "unlimited_families": True,
        "standalone": True,
        "requires_other_plan": False,
        "description": "Plan independiente y opcional. No necesitas contratar ningun otro producto de ManoProtect. Cualquier grupo de vecinos puede unirse.",
        "features": [
            "Panel Vecinal en tiempo real 24/7",
            "Alertas instantaneas a todos los vecinos del barrio",
            "Alertas de okupacion, robos e intrusiones",
            "Red de vigilancia vecinal coordinada",
            "Mapa de incidencias del barrio en vivo",
            "Historial completo de incidencias (1 ano)",
            "Estadisticas de seguridad del barrio",
            "Contacto directo con vecinos protectores",
            "Sistema de referidos: trae un vecino, 1 mes gratis",
            "Prioridad maxima en alertas",
            "Soporte prioritario 24/7",
            "Sin permanencia — cancela cuando quieras",
        ],
        "referral_bonus": "1 mes gratis por cada vecino que contrate el plan",
        "comparison": {
            "vs_securitas": "Securitas Direct NO ofrece seguridad comunitaria ni conecta vecinos",
            "vs_prosegur": "Prosegur NO tiene panel vecinal ni alertas entre vecinos",
            "manoprotect": "UNICA empresa con proteccion vecinal coordinada en tiempo real",
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
        referral_code = sub.get("referral_code", "")
        referrals_count = await _db.vecinal_referrals.count_documents({"referrer_family_id": family_id, "status": "completed"})
        return {
            "has_access": True,
            "family_id": family_id,
            "plan": PLAN_NAME,
            "standalone": True,
            "expires_at": sub.get("expires_at"),
            "referral_code": referral_code,
            "referrals_completed": referrals_count,
            "free_months_earned": referrals_count,
        }

    return {"has_access": False, "reason": "no_subscription", "plan_required": PLAN_ID, "standalone": True}


# ============================================
# REFERRAL SYSTEM
# ============================================

@router.post("/referrals/invite")
async def create_referral(data: ReferralCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Invite a neighbor. If they subscribe, you get 1 month free. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    referral_code = sub.get("referral_code") or f"VEC-{secrets.token_urlsafe(6).upper()}"

    # Update subscription with referral code if not set
    if not sub.get("referral_code"):
        await _db.subscriptions.update_one(
            {"user_id": user.user_id, "plan_type": PLAN_ID},
            {"$set": {"referral_code": referral_code}},
        )

    referral = {
        "referral_id": f"ref_{uuid.uuid4().hex[:10]}",
        "referrer_id": user.user_id,
        "referrer_family_id": family_id,
        "referrer_name": user.name,
        "referral_code": referral_code,
        "neighbor_email": data.neighbor_email,
        "neighbor_name": data.neighbor_name,
        "message": data.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await _db.vecinal_referrals.insert_one(referral)

    return {
        "referral_code": referral_code,
        "message": f"Invitacion enviada a {data.neighbor_email}. Cuando contrate el plan, recibiras 1 mes gratis.",
        "share_url": f"https://manoprotect.com/panel-vecinal?ref={referral_code}",
    }


@router.get("/referrals")
async def get_my_referrals(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get referral stats. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    referrals = await _db.vecinal_referrals.find(
        {"referrer_family_id": family_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)

    completed = sum(1 for r in referrals if r.get("status") == "completed")
    pending = sum(1 for r in referrals if r.get("status") == "pending")

    return {
        "referrals": referrals,
        "total": len(referrals),
        "completed": completed,
        "pending": pending,
        "free_months_earned": completed,
        "referral_code": sub.get("referral_code", ""),
    }


# ============================================
# PROTECTED: Panel Vecinal (requires subscription)
# ============================================

@router.post("/alerts")
async def send_vecinal_alert(data: VecinalAlert, request: Request, session_token: Optional[str] = Cookie(None)):
    """Send alert to ALL neighbors. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    if data.type not in ALERT_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Tipos: {list(ALERT_TYPES.keys())}")

    alert_id = f"va_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    alert = {
        "alert_id": alert_id,
        "type": data.type,
        "type_meta": ALERT_TYPES[data.type],
        "title": data.title,
        "description": data.description,
        "address": data.address,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "urgency": data.urgency,
        "reporter_id": user.user_id,
        "reporter_name": user.name,
        "family_id": family_id,
        "status": "active",
        "confirmed_by": [user.user_id],
        "confirmations": 1,
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=48)).isoformat(),
        "is_premium_alert": True,
    }

    await _db.vecinal_alerts.insert_one(alert)

    # Also mirror to community_incidents for public map visibility
    await _db.community_incidents.insert_one({
        "incident_id": alert_id,
        "type": data.type if data.type in ["vandalismo", "sospechoso", "emergencia"] else "emergencia",
        "type_meta": ALERT_TYPES[data.type],
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

    # Send push notifications asynchronously for critical alerts
    try:
        from services.push_notification_service import notify_vecinal_alert
        import asyncio
        asyncio.create_task(notify_vecinal_alert(data.type, data.title, data.description, data.urgency))
    except Exception:
        pass

    return {
        "alert_id": alert_id,
        "message": "Alerta enviada a todos los vecinos del barrio",
        "type_meta": ALERT_TYPES[data.type],
        "urgency": data.urgency,
    }


@router.get("/alerts")
async def get_vecinal_alerts(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get all active alerts (48h). PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    cutoff = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()

    alerts = await _db.vecinal_alerts.find(
        {"created_at": {"$gte": cutoff}, "status": {"$in": ["active", "confirmed"]}},
        {"_id": 0, "seen_by": 0}
    ).sort("created_at", -1).limit(100).to_list(100)

    return {"alerts": alerts, "total": len(alerts), "family_id": family_id}


@router.get("/dashboard")
async def get_vecinal_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Full dashboard stats. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()

    alerts_week = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": week_ago}})
    alerts_month = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": month_ago}})

    type_pipeline = [
        {"$match": {"created_at": {"$gte": month_ago}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    type_stats = await _db.vecinal_alerts.aggregate(type_pipeline).to_list(20)

    active_families = await _db.subscriptions.count_documents({"plan_type": PLAN_ID, "status": "active"})

    recent = await _db.vecinal_alerts.find(
        {"status": {"$in": ["active", "confirmed"]}},
        {"_id": 0, "seen_by": 0}
    ).sort("created_at", -1).limit(10).to_list(10)

    my_referrals = await _db.vecinal_referrals.count_documents({"referrer_family_id": family_id, "status": "completed"})

    return {
        "family_id": family_id,
        "alerts_this_week": alerts_week,
        "alerts_this_month": alerts_month,
        "by_type": {s["_id"]: s["count"] for s in type_stats if s["_id"]},
        "active_families": active_families,
        "recent_alerts": recent,
        "security_level": "alto" if alerts_week < 3 else "medio" if alerts_week < 8 else "bajo",
        "plan": PLAN_NAME,
        "referrals_completed": my_referrals,
        "free_months_earned": my_referrals,
    }


@router.patch("/alerts/{alert_id}/confirm")
async def confirm_vecinal_alert(alert_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Confirm alert. PREMIUM ONLY."""
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
    """Resolve alert. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    await _db.vecinal_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {"status": "resolved", "resolved_at": datetime.now(timezone.utc).isoformat(), "resolved_by": user.user_id}},
    )
    return {"message": "Alerta resuelta"}


@router.get("/neighbors")
async def get_neighbor_families(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get neighbor families in the network. PREMIUM ONLY."""
    user, family_id, sub = await validate_vecinal_subscription(request, session_token)

    families = await _db.subscriptions.find(
        {"plan_type": PLAN_ID, "status": "active"},
        {"_id": 0, "family_id": 1, "user_name": 1, "created_at": 1}
    ).limit(100).to_list(100)

    return {"families": families, "total": len(families)}
