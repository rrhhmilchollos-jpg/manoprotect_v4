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
