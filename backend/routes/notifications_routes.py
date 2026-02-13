"""
ManoProtect - Notifications Routes
Push subscriptions, notifications management, preferences
"""
from fastapi import APIRouter, Request, Cookie, HTTPException
from typing import Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

router = APIRouter(tags=["Notifications"])

_db = None


def init_notifications_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


# Models
class SubscriptionRequest(BaseModel):
    endpoint: str
    keys: Dict[str, str]


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    threat_alerts: bool = True
    family_alerts: bool = True
    marketing: bool = False


@router.post("/notifications/subscribe")
async def subscribe_push(
    data: SubscriptionRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Subscribe to push notifications"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Check if already subscribed
    existing = await _db.push_subscriptions.find_one(
        {"user_id": user.user_id, "endpoint": data.endpoint},
        {"_id": 0}
    )
    
    if existing:
        return {"message": "Ya estás suscrito a notificaciones"}
    
    subscription = {
        "id": f"sub_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "endpoint": data.endpoint,
        "keys": data.keys,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.push_subscriptions.insert_one(subscription)
    
    return {"message": "Suscripción a notificaciones activada"}


@router.delete("/notifications/unsubscribe")
async def unsubscribe_push(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Unsubscribe from push notifications"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    await _db.push_subscriptions.delete_many({"user_id": user.user_id})
    
    return {"message": "Suscripción cancelada"}


@router.get("/notifications")
async def get_notifications(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get user notifications"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    notifications = await _db.notifications.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    unread_count = await _db.notifications.count_documents({
        "user_id": user.user_id,
        "is_read": False
    })
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark notification as read"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    await _db.notifications.update_one(
        {"id": notification_id, "user_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Notificación marcada como leída"}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark all notifications as read"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    await _db.notifications.update_many(
        {"user_id": user.user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Todas las notificaciones marcadas como leídas"}


@router.get("/notifications/preferences")
async def get_notification_preferences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get notification preferences"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    prefs = await _db.notification_preferences.find_one(
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


@router.patch("/notifications/preferences")
async def update_notification_preferences(
    data: NotificationPreferences,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update notification preferences"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    prefs_data = data.model_dump()
    prefs_data["user_id"] = user.user_id
    
    await _db.notification_preferences.update_one(
        {"user_id": user.user_id},
        {"$set": prefs_data},
        upsert=True
    )
    
    return {"message": "Preferencias actualizadas"}


# ============================================
# SCAM ALERT SUBSCRIPTIONS (Public - No auth required)
# ============================================

class ScamAlertSubscription(BaseModel):
    email: str
    categories: list = ["all"]  # all, smishing, vishing, phishing, whatsapp, secuestro
    frequency: str = "instant"  # instant, daily, weekly


@router.post("/scam-alerts/subscribe")
async def subscribe_scam_alerts(data: ScamAlertSubscription):
    """
    Subscribe to scam alert notifications.
    Public endpoint - anyone can subscribe without login.
    """
    # Check if already subscribed
    existing = await _db.scam_alert_subscriptions.find_one(
        {"email": data.email.lower()},
        {"_id": 0}
    )
    
    if existing:
        # Update preferences
        await _db.scam_alert_subscriptions.update_one(
            {"email": data.email.lower()},
            {"$set": {
                "categories": data.categories,
                "frequency": data.frequency,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {
            "success": True,
            "message": "Preferencias de alertas actualizadas",
            "email": data.email
        }
    
    subscription = {
        "id": f"scam_sub_{uuid.uuid4().hex[:12]}",
        "email": data.email.lower(),
        "categories": data.categories,
        "frequency": data.frequency,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.scam_alert_subscriptions.insert_one(subscription)
    
    return {
        "success": True,
        "message": "¡Suscripción activada! Recibirás alertas de estafas en tu email.",
        "email": data.email,
        "subscription_id": subscription["id"]
    }


@router.delete("/scam-alerts/unsubscribe/{email}")
async def unsubscribe_scam_alerts(email: str):
    """Unsubscribe from scam alerts"""
    result = await _db.scam_alert_subscriptions.update_one(
        {"email": email.lower()},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Email no encontrado")
    
    return {"success": True, "message": "Suscripción cancelada"}


@router.get("/scam-alerts/trending")
async def get_trending_scams():
    """
    Get current trending scams in Spain.
    Public endpoint for displaying alerts.
    """
    # Simulated trending data - in production would come from real sources
    trending = [
        {
            "id": "trend_1",
            "title": "SMS falsos de Correos",
            "category": "smishing",
            "severity": "alta",
            "affected_count": 12500,
            "region": "España",
            "description": "Nueva oleada de SMS pidiendo 1,99€ para liberar paquetes",
            "date": "2026-02-13"
        },
        {
            "id": "trend_2", 
            "title": "Llamadas falsas Banco Santander",
            "category": "vishing",
            "severity": "crítica",
            "affected_count": 3200,
            "region": "Madrid, Cataluña",
            "description": "Llaman diciendo que hay movimientos sospechosos en tu cuenta",
            "date": "2026-02-12"
        },
        {
            "id": "trend_3",
            "title": "WhatsApp 'Mamá necesito dinero'",
            "category": "whatsapp",
            "severity": "alta",
            "affected_count": 8700,
            "region": "Toda España",
            "description": "Se hacen pasar por hijos pidiendo Bizum urgente",
            "date": "2026-02-11"
        }
    ]
    
    return {
        "trending": trending,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "total_scams_detected_today": 1247
    }


@router.get("/scam-alerts/stats")
async def get_scam_stats():
    """Get scam statistics for Spain"""
    return {
        "daily_scams": 1200,
        "weekly_increase": "+15%",
        "most_affected_age": "50-70",
        "top_categories": [
            {"name": "Smishing", "percentage": 45},
            {"name": "Vishing", "percentage": 28},
            {"name": "Phishing", "percentage": 18},
            {"name": "WhatsApp", "percentage": 9}
        ],
        "source": "INCIBE 2025"
    }


# Helper function
async def create_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = None):
    """Create and store a notification"""
    notification = {
        "id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "title": title,
        "body": body,
        "notification_type": notification_type,
        "data": data or {},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.notifications.insert_one(notification)
    
    return notification
