"""
ManoProtect - Push Notification Service
Sends Web Push notifications to subscribed premium users on critical vecinal alerts.
Uses the pywebpush library with VAPID keys.
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_db = None
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_CLAIMS = {"sub": "mailto:info@manoprotectt.com"}


def init_push_service(db):
    global _db
    _db = db


async def send_push_to_all_premium(title: str, body: str, url: str = "/panel-vecinal", urgency: str = "high"):
    """Send a push notification to ALL users who have active push subscriptions."""
    if not _db:
        logger.warning("Push service DB not initialized")
        return 0

    subs = await _db.push_subscriptions.find({}, {"_id": 0}).to_list(500)
    if not subs:
        return 0

    sent = 0
    try:
        from pywebpush import webpush, WebPushException
        import json

        payload = json.dumps({
            "title": title,
            "body": body,
            "url": url,
            "icon": "/manoprotect_logo.png",
            "badge": "/manoprotect_logo.png",
            "tag": "vecinal-alert",
            "requireInteraction": True,
        })

        for sub in subs:
            sub_info = sub.get("subscription")
            if not sub_info:
                continue
            try:
                if VAPID_PRIVATE_KEY:
                    webpush(
                        subscription_info=sub_info,
                        data=payload,
                        vapid_private_key=VAPID_PRIVATE_KEY,
                        vapid_claims=VAPID_CLAIMS,
                    )
                sent += 1
            except WebPushException as e:
                if "410" in str(e) or "404" in str(e):
                    await _db.push_subscriptions.delete_one({"subscription.endpoint": sub_info.get("endpoint")})
                logger.debug(f"Push send failed for one sub: {e}")
            except Exception as e:
                logger.debug(f"Push error: {e}")
    except ImportError:
        logger.warning("pywebpush not installed, push notifications disabled")
    except Exception as e:
        logger.error(f"Push service error: {e}")

    return sent


async def notify_vecinal_alert(alert_type: str, title: str, description: str, urgency: str = "alta"):
    """Convenience wrapper for vecinal alerts."""
    type_labels = {
        "okupacion": "ALERTA OKUPACION",
        "robo_vivienda": "ROBO EN VIVIENDA",
        "robo_local": "ROBO EN LOCAL",
        "intrusion": "INTRUSION DETECTADA",
        "vandalismo": "VANDALISMO",
        "sospechoso": "ACTIVIDAD SOSPECHOSA",
        "emergencia": "EMERGENCIA VECINAL",
    }
    prefix = type_labels.get(alert_type, "ALERTA VECINAL")
    push_title = f"[{prefix}] {title}"
    push_body = description[:120] if description else "Se ha reportado una incidencia en tu barrio."
    
    return await send_push_to_all_premium(
        title=push_title,
        body=push_body,
        url="/panel-vecinal",
        urgency=urgency,
    )
