"""
ManoProtect - Firebase Push Notifications Service
Sends real-time alarm alerts to clients via FCM
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, messaging
import os

router = APIRouter(prefix="/notifications", tags=["Push Notifications"])

_db = None
_firebase_initialized = False

def init_notifications(db):
    global _db, _firebase_initialized
    _db = db
    sa_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-service-account.json')
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            print("Firebase Admin SDK initialized")
        except Exception as e:
            print(f"Firebase init error: {e}")


class TokenRequest(BaseModel):
    token: str
    user_id: str

class NotificationRequest(BaseModel):
    user_id: Optional[str] = None
    title: str
    body: str
    data: Optional[dict] = None
    topic: Optional[str] = None


# ============ TOKEN MANAGEMENT ============

@router.post("/register-token")
async def register_fcm_token(req: TokenRequest):
    if not req.token or not req.user_id:
        raise HTTPException(400, "Token y user_id requeridos")

    now = datetime.now(timezone.utc).isoformat()
    await _db.fcm_tokens.update_one(
        {"user_id": req.user_id, "token": req.token},
        {"$set": {"updated_at": now}, "$setOnInsert": {"created_at": now, "user_id": req.user_id, "token": req.token, "active": True}},
        upsert=True,
    )
    # Subscribe to user-specific topic
    try:
        messaging.subscribe_to_topic([req.token], f"user_{req.user_id}")
        messaging.subscribe_to_topic([req.token], "all_clients")
    except Exception:
        pass

    return {"status": "ok"}


@router.delete("/unregister-token")
async def unregister_fcm_token(req: TokenRequest):
    await _db.fcm_tokens.update_one(
        {"user_id": req.user_id, "token": req.token},
        {"$set": {"active": False}}
    )
    try:
        messaging.unsubscribe_from_topic([req.token], f"user_{req.user_id}")
        messaging.unsubscribe_from_topic([req.token], "all_clients")
    except Exception:
        pass
    return {"status": "ok"}


# ============ SEND NOTIFICATIONS ============

@router.post("/send")
async def send_notification(req: NotificationRequest):
    if not _firebase_initialized:
        raise HTTPException(500, "Firebase no inicializado")

    results = []

    # Send to topic
    if req.topic:
        try:
            msg = messaging.Message(
                notification=messaging.Notification(title=req.title, body=req.body),
                data=req.data or {},
                topic=req.topic,
            )
            resp = messaging.send(msg)
            results.append({"topic": req.topic, "message_id": resp})
        except Exception as e:
            results.append({"topic": req.topic, "error": str(e)})

    # Send to specific user's devices
    if req.user_id:
        tokens_cursor = _db.fcm_tokens.find({"user_id": req.user_id, "active": True}, {"_id": 0})
        tokens = [t["token"] async for t in tokens_cursor]

        if tokens:
            try:
                msg = messaging.MulticastMessage(
                    notification=messaging.Notification(title=req.title, body=req.body),
                    data=req.data or {},
                    tokens=tokens,
                )
                batch = messaging.send_each_for_multicast(msg)
                results.append({"user_id": req.user_id, "success": batch.success_count, "failure": batch.failure_count})

                # Deactivate invalid tokens
                for i, resp in enumerate(batch.responses):
                    if not resp.success and resp.exception and 'UNREGISTERED' in str(resp.exception):
                        await _db.fcm_tokens.update_one({"token": tokens[i]}, {"$set": {"active": False}})
            except Exception as e:
                results.append({"user_id": req.user_id, "error": str(e)})

    # Log notification
    await _db.notification_log.insert_one({
        "user_id": req.user_id,
        "topic": req.topic,
        "title": req.title,
        "body": req.body,
        "results": results,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"sent": True, "results": results}


# ============ ALARM ALERT (Called by CRA system) ============

async def send_alarm_alert(user_id: str, alert_type: str, message: str, db=None):
    """Called internally when CRA detects an alarm event"""
    target_db = db or _db
    if not _firebase_initialized or not target_db:
        return

    severity_titles = {
        "intrusion": "ALERTA: Intrusion detectada",
        "fire": "ALERTA: Detector de humo activado",
        "panic": "ALERTA: Boton de panico activado",
        "tamper": "Aviso: Manipulacion de sensor",
        "low_battery": "Aviso: Bateria baja en sensor",
        "arm": "Sistema armado",
        "disarm": "Sistema desarmado",
    }

    title = severity_titles.get(alert_type, "Alerta ManoProtect")

    tokens_cursor = target_db.fcm_tokens.find({"user_id": user_id, "active": True}, {"_id": 0})
    tokens = [t["token"] async for t in tokens_cursor]

    if not tokens:
        return

    is_critical = alert_type in ("intrusion", "fire", "panic")

    try:
        msg = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=message,
            ),
            android=messaging.AndroidConfig(
                priority="high" if is_critical else "normal",
                notification=messaging.AndroidNotification(
                    channel_id="alarm_alerts" if is_critical else "general",
                    sound="alarm" if is_critical else "default",
                    priority="max" if is_critical else "default",
                ),
            ),
            webpush=messaging.WebpushConfig(
                headers={"Urgency": "high" if is_critical else "normal"},
                notification=messaging.WebpushNotification(
                    icon="/icons/icon-192x192.png",
                    badge="/icons/icon-72x72.png",
                    vibrate=[200, 100, 200, 100, 200] if is_critical else [200],
                    require_interaction=is_critical,
                ),
            ),
            data={
                "type": alert_type,
                "user_id": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "critical": str(is_critical).lower(),
            },
            tokens=tokens,
        )
        messaging.send_each_for_multicast(msg)
    except Exception as e:
        print(f"FCM send error: {e}")


@router.get("/status")
async def notification_status():
    return {"firebase_initialized": _firebase_initialized, "service": "active"}
