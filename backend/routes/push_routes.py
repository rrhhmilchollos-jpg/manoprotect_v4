"""
Push Notifications Routes - ManoProtect
Web Push notifications for SOS alerts and family tracking
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import json
import os

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

# VAPID keys for Web Push (generate your own for production)
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_EMAIL = os.environ.get("VAPID_EMAIL", "soporte@manoprotect.com")

def init_db(db):
    global _db
    _db = db

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict  # {p256dh: str, auth: str}

class NotificationPayload(BaseModel):
    title: str
    body: str
    icon: Optional[str] = "/manoprotect_icon_512x512.png"
    badge: Optional[str] = "/manoprotect_icon_512x512.png"
    tag: Optional[str] = None
    data: Optional[dict] = None
    actions: Optional[List[dict]] = None

@router.get("/push/vapid-key")
async def get_vapid_public_key():
    """Get VAPID public key for client subscription"""
    return {"publicKey": VAPID_PUBLIC_KEY}

@router.post("/push/subscribe")
async def subscribe_to_push(subscription: PushSubscription, user: User = Depends(get_current_user)):
    """Subscribe user to push notifications"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    sub_data = {
        "user_id": user.user_id,
        "endpoint": subscription.endpoint,
        "keys": subscription.keys,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "user_agent": "",
        "last_used": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if subscription already exists
    existing = await _db.push_subscriptions.find_one({
        "user_id": user.user_id,
        "endpoint": subscription.endpoint
    })
    
    if existing:
        await _db.push_subscriptions.update_one(
            {"user_id": user.user_id, "endpoint": subscription.endpoint},
            {"$set": {"is_active": True, "last_used": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await _db.push_subscriptions.insert_one(sub_data)
    
    return {"message": "Suscripción a notificaciones activada"}

@router.post("/push/unsubscribe")
async def unsubscribe_from_push(subscription: PushSubscription, user: User = Depends(get_current_user)):
    """Unsubscribe user from push notifications"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    await _db.push_subscriptions.update_one(
        {"user_id": user.user_id, "endpoint": subscription.endpoint},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Suscripción a notificaciones desactivada"}

@router.get("/push/status")
async def get_push_status(user: User = Depends(get_current_user)):
    """Get user's push notification status"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    subscriptions = await _db.push_subscriptions.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    ).to_list(length=10)
    
    return {
        "subscribed": len(subscriptions) > 0,
        "subscription_count": len(subscriptions)
    }

async def send_push_notification(user_id: str, notification: dict):
    """
    Send push notification to a user
    This function is called internally when SOS is activated
    """
    try:
        from pywebpush import webpush, WebPushException
        
        subscriptions = await _db.push_subscriptions.find(
            {"user_id": user_id, "is_active": True}
        ).to_list(length=10)
        
        sent_count = 0
        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": sub["endpoint"],
                        "keys": sub["keys"]
                    },
                    data=json.dumps(notification),
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": f"mailto:{VAPID_EMAIL}"}
                )
                sent_count += 1
            except WebPushException as e:
                # Subscription expired or invalid
                if e.response and e.response.status_code in [404, 410]:
                    await _db.push_subscriptions.update_one(
                        {"endpoint": sub["endpoint"]},
                        {"$set": {"is_active": False}}
                    )
            except Exception as e:
                print(f"Error sending push: {e}")
        
        return sent_count
    except ImportError:
        print("pywebpush not installed")
        return 0

async def notify_family_sos(sos_user_id: str, sos_user_name: str, location: dict = None):
    """
    Notify all family members when SOS is activated
    """
    # Get family members of the user
    family_links = await _db.family_links.find(
        {"$or": [{"user_id": sos_user_id}, {"linked_user_id": sos_user_id}]}
    ).to_list(length=100)
    
    # Get emergency contacts
    emergency_contacts = await _db.emergency_contacts.find(
        {"user_id": sos_user_id}
    ).to_list(length=20)
    
    # Collect all user IDs to notify
    notify_user_ids = set()
    for link in family_links:
        if link.get("user_id") != sos_user_id:
            notify_user_ids.add(link["user_id"])
        if link.get("linked_user_id") != sos_user_id:
            notify_user_ids.add(link["linked_user_id"])
    
    # Build notification
    notification = {
        "title": "🚨 ¡ALERTA SOS!",
        "body": f"{sos_user_name} ha activado una alerta de emergencia",
        "icon": "/manoprotect_icon_512x512.png",
        "badge": "/manoprotect_icon_512x512.png",
        "tag": f"sos-{sos_user_id}",
        "requireInteraction": True,
        "vibrate": [200, 100, 200, 100, 200],
        "data": {
            "type": "sos_alert",
            "user_id": sos_user_id,
            "user_name": sos_user_name,
            "location": location,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "url": f"/sos-emergency?alert={sos_user_id}"
        },
        "actions": [
            {"action": "view", "title": "Ver ubicación"},
            {"action": "call", "title": "Llamar"}
        ]
    }
    
    # Send to all family members
    total_sent = 0
    for user_id in notify_user_ids:
        count = await send_push_notification(user_id, notification)
        total_sent += count
    
    # Log notification
    await _db.notification_logs.insert_one({
        "type": "sos_push",
        "sos_user_id": sos_user_id,
        "notified_users": list(notify_user_ids),
        "total_sent": total_sent,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return total_sent

# Admin endpoints
@router.get("/admin/push/stats")
async def get_push_stats(user: User = Depends(get_current_user)):
    """Admin: Get push notification statistics"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    total_subscriptions = await _db.push_subscriptions.count_documents({"is_active": True})
    total_users = len(await _db.push_subscriptions.distinct("user_id", {"is_active": True}))
    
    # Recent notifications
    recent_logs = await _db.notification_logs.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(length=20)
    
    return {
        "total_active_subscriptions": total_subscriptions,
        "total_users_subscribed": total_users,
        "recent_notifications": recent_logs
    }

@router.post("/admin/push/test")
async def send_test_notification(user: User = Depends(get_current_user)):
    """Admin: Send test notification to yourself"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    notification = {
        "title": "🔔 Notificación de prueba",
        "body": "Las notificaciones push están funcionando correctamente",
        "icon": "/manoprotect_icon_512x512.png",
        "tag": "test",
        "data": {"type": "test"}
    }
    
    count = await send_push_notification(user.user_id, notification)
    
    return {"message": f"Notificación enviada a {count} dispositivos"}
