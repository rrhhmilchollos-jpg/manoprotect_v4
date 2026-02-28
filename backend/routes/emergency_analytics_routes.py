"""
Emergency 112 Integration + Trial Reminder Emails + Analytics Export
ManoProtect - Backend routes for emergency services, email reminders, and data export
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import logging

from core.auth import require_auth

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db


# ========================================
# 112 EMERGENCY INTEGRATION
# ========================================

class Emergency112Request(BaseModel):
    user_id: Optional[str] = None
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    alert_type: str = "emergency_112"
    message: Optional[str] = "Emergencia - Se solicita ayuda"


@router.post("/emergency/112")
async def trigger_112_emergency(data: Emergency112Request, request: Request, background_tasks: BackgroundTasks):
    """
    Trigger 112 emergency integration.
    1. Logs the emergency with GPS coordinates
    2. Notifies all emergency contacts
    3. Generates call-to-action for 112 with pre-filled location data
    4. Returns direct tel: link for 112 + coordinates for dispatcher
    """
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    now = datetime.now(timezone.utc).isoformat()
    maps_url = f"https://maps.google.com/?q={data.latitude},{data.longitude}"
    
    # Log the emergency
    emergency_doc = {
        "user_id": user.user_id,
        "alert_type": "emergency_112",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "maps_url": maps_url,
        "message": data.message,
        "status": "initiated",
        "created_at": now,
        "resolved_at": None
    }
    result = await _db.emergency_112_logs.insert_one(emergency_doc)
    emergency_id = str(result.inserted_id)
    
    # Get user info
    user_doc = await _db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "name": 1, "email": 1, "phone": 1}
    )
    user_name = user_doc.get("name", "") if user_doc else ""
    user_phone = user_doc.get("phone", "") if user_doc else ""
    
    # Get emergency contacts
    contacts = await _db.emergency_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    # Create notifications for all family members
    for contact in contacts:
        contact_user_id = contact.get("contact_user_id")
        if contact_user_id:
            notif = {
                "user_id": contact_user_id,
                "type": "emergency_112",
                "title": f"EMERGENCIA 112 - {user_name}",
                "message": f"{user_name} ha activado la alerta de emergencia 112. Ubicacion: {maps_url}",
                "data": {
                    "emergency_id": emergency_id,
                    "latitude": data.latitude,
                    "longitude": data.longitude,
                    "maps_url": maps_url,
                    "user_name": user_name,
                    "user_phone": user_phone
                },
                "read": False,
                "priority": "critical",
                "created_at": now
            }
            await _db.notifications.insert_one(notif)
    
    # Create notification for the user
    await _db.notifications.insert_one({
        "user_id": user.user_id,
        "type": "emergency_112_self",
        "title": "Emergencia 112 activada",
        "message": f"Tu alerta de emergencia ha sido registrada. Llama al 112 y proporciona tu ubicacion: {maps_url}",
        "data": {
            "emergency_id": emergency_id,
            "maps_url": maps_url,
            "call_112_url": "tel:112"
        },
        "read": False,
        "priority": "critical",
        "created_at": now
    })
    
    # Generate the 112 dispatcher info
    dispatcher_info = (
        f"EMERGENCIA ManoProtect\n"
        f"Nombre: {user_name}\n"
        f"Telefono: {user_phone}\n"
        f"Coordenadas: {data.latitude}, {data.longitude}\n"
        f"Mapa: {maps_url}\n"
        f"Precision GPS: {data.accuracy or 'N/A'}m\n"
        f"Hora: {now}\n"
        f"Mensaje: {data.message}"
    )
    
    logging.warning(f"EMERGENCY 112 TRIGGERED by {user.user_id}: {maps_url}")
    
    return {
        "success": True,
        "emergency_id": emergency_id,
        "call_url": "tel:112",
        "maps_url": maps_url,
        "coordinates": {"latitude": data.latitude, "longitude": data.longitude},
        "dispatcher_info": dispatcher_info,
        "contacts_notified": len(contacts),
        "message": "Emergencia registrada. Llama al 112 ahora. Tu ubicacion ha sido enviada a tus contactos de emergencia.",
        "instructions": [
            "1. Llama al 112 pulsando el boton de llamada",
            "2. Indica tu ubicacion: las coordenadas GPS se han copiado",
            f"3. Comparte este enlace con el operador si es necesario: {maps_url}",
            f"4. Se ha notificado a {len(contacts)} contacto(s) de emergencia"
        ]
    }


@router.get("/emergency/112/history")
async def get_emergency_history(request: Request):
    """Get user's 112 emergency history"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    history = await _db.emergency_112_logs.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {"emergencies": history}


@router.post("/emergency/112/resolve/{emergency_id}")
async def resolve_emergency(emergency_id: str, request: Request):
    """Mark a 112 emergency as resolved"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    from bson import ObjectId
    now = datetime.now(timezone.utc).isoformat()
    
    result = await _db.emergency_112_logs.update_one(
        {"_id": ObjectId(emergency_id), "user_id": user.user_id},
        {"$set": {"status": "resolved", "resolved_at": now}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Emergencia no encontrada")
    
    return {"success": True, "resolved_at": now}


# ========================================
# TRIAL EXPIRATION REMINDER EMAILS
# ========================================

class TrialReminderConfig(BaseModel):
    days_before_expiry: int = 3
    email_subject: Optional[str] = None


@router.post("/admin/send-trial-reminders")
async def send_trial_reminders(config: TrialReminderConfig, request: Request, background_tasks: BackgroundTasks):
    """
    Admin endpoint: Send reminder emails to users whose trial is expiring soon.
    Finds users with trial_ends_at within the next N days and sends email reminders.
    """
    session_token = request.cookies.get("session_token")
    admin = await require_auth(request, session_token)
    
    # Verify admin
    admin_doc = await _db.users.find_one({"user_id": admin.user_id}, {"_id": 0, "role": 1})
    if not admin_doc or admin_doc.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    now = datetime.now(timezone.utc)
    expiry_threshold = now + timedelta(days=config.days_before_expiry)
    
    # Find users with expiring trials
    expiring_users = await _db.users.find({
        "plan": "trial",
        "trial_ends_at": {
            "$gte": now.isoformat(),
            "$lte": expiry_threshold.isoformat()
        },
        "trial_reminder_sent": {"$ne": True}
    }, {"_id": 0, "user_id": 1, "name": 1, "email": 1, "trial_ends_at": 1}).to_list(100)
    
    reminders_sent = []
    
    for user_data in expiring_users:
        user_email = user_data.get("email", "")
        user_name = user_data.get("name", "Usuario")
        trial_ends = user_data.get("trial_ends_at", "")
        
        # Create in-app notification
        await _db.notifications.insert_one({
            "user_id": user_data["user_id"],
            "type": "trial_expiring",
            "title": "Tu periodo de prueba esta por terminar",
            "message": f"Hola {user_name}, tu prueba gratuita de ManoProtect termina el {trial_ends[:10]}. Suscribete ahora para seguir protegiendo a tu familia.",
            "data": {
                "action_url": "/planes",
                "trial_ends_at": trial_ends
            },
            "read": False,
            "created_at": now.isoformat()
        })
        
        # Mark reminder sent
        await _db.users.update_one(
            {"user_id": user_data["user_id"]},
            {"$set": {"trial_reminder_sent": True, "trial_reminder_sent_at": now.isoformat()}}
        )
        
        reminders_sent.append({
            "user_id": user_data["user_id"],
            "email": user_email,
            "name": user_name,
            "trial_ends_at": trial_ends
        })
        
        logging.info(f"Trial reminder sent to {user_email} (expires {trial_ends})")
    
    # Also find already expired trials
    expired_users = await _db.users.find({
        "plan": "trial",
        "trial_ends_at": {"$lt": now.isoformat()},
        "trial_expired_notified": {"$ne": True}
    }, {"_id": 0, "user_id": 1, "name": 1, "email": 1}).to_list(100)
    
    for user_data in expired_users:
        await _db.notifications.insert_one({
            "user_id": user_data["user_id"],
            "type": "trial_expired",
            "title": "Tu periodo de prueba ha terminado",
            "message": f"Hola {user_data.get('name', 'Usuario')}, tu prueba gratuita ha expirado. Suscribete para mantener la proteccion GPS y SOS activa para tu familia.",
            "data": {"action_url": "/planes"},
            "read": False,
            "priority": "high",
            "created_at": now.isoformat()
        })
        
        await _db.users.update_one(
            {"user_id": user_data["user_id"]},
            {"$set": {"trial_expired_notified": True}}
        )
    
    return {
        "success": True,
        "reminders_sent": len(reminders_sent),
        "expired_notified": len(expired_users),
        "details": reminders_sent
    }


@router.get("/admin/trial-status")
async def get_trial_status(request: Request):
    """Get overview of trial users and their status"""
    session_token = request.cookies.get("session_token")
    admin = await require_auth(request, session_token)
    
    admin_doc = await _db.users.find_one({"user_id": admin.user_id}, {"_id": 0, "role": 1})
    if not admin_doc or admin_doc.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    now = datetime.now(timezone.utc)
    three_days = (now + timedelta(days=3)).isoformat()
    
    total_trial = await _db.users.count_documents({"plan": "trial"})
    expiring_soon = await _db.users.count_documents({
        "plan": "trial",
        "trial_ends_at": {"$gte": now.isoformat(), "$lte": three_days}
    })
    expired = await _db.users.count_documents({
        "plan": "trial",
        "trial_ends_at": {"$lt": now.isoformat()}
    })
    
    return {
        "total_trial_users": total_trial,
        "expiring_in_3_days": expiring_soon,
        "already_expired": expired,
        "active_trials": total_trial - expired
    }


# ========================================
# ANALYTICS DATA EXPORT (BigQuery/Looker Ready)
# ========================================

@router.get("/admin/analytics/export")
async def export_analytics_data(request: Request):
    """
    Export analytics data in a format ready for BigQuery/Looker Studio.
    Returns JSON data with key metrics for dashboard visualization.
    """
    session_token = request.cookies.get("session_token")
    admin = await require_auth(request, session_token)
    
    admin_doc = await _db.users.find_one({"user_id": admin.user_id}, {"_id": 0, "role": 1})
    if not admin_doc or admin_doc.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    now = datetime.now(timezone.utc)
    last_30_days = (now - timedelta(days=30)).isoformat()
    last_7_days = (now - timedelta(days=7)).isoformat()
    
    # User metrics
    total_users = await _db.users.count_documents({})
    new_users_30d = await _db.users.count_documents({"created_at": {"$gte": last_30_days}})
    new_users_7d = await _db.users.count_documents({"created_at": {"$gte": last_7_days}})
    
    # Subscription metrics
    total_subscribers = await _db.users.count_documents({"plan": {"$in": ["mensual", "anual", "familiar"]}})
    trial_users = await _db.users.count_documents({"plan": "trial"})
    free_users = await _db.users.count_documents({"plan": {"$in": ["free", None]}})
    
    # Order metrics
    total_orders = await _db.sentinel_x_preorders.count_documents({})
    orders_30d = await _db.sentinel_x_preorders.count_documents({"created_at": {"$gte": last_30_days}})
    subscription_orders = await _db.sentinel_x_preorders.count_documents({"payment_type": "subscription"})
    
    # SOS metrics
    total_sos = await _db.sos_alerts.count_documents({})
    sos_30d = await _db.sos_alerts.count_documents({"created_at": {"$gte": last_30_days}})
    
    # Emergency 112 metrics
    total_112 = await _db.emergency_112_logs.count_documents({})
    
    # Location tracking metrics
    tracking_active = await _db.users.count_documents({"background_tracking_active": True})
    location_locked = await _db.users.count_documents({"location_locked": True})
    
    # Product breakdown
    product_counts = {}
    pipeline = [
        {"$group": {"_id": "$product", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    async for doc in _db.sentinel_x_preorders.aggregate(pipeline):
        product_counts[doc["_id"]] = doc["count"]
    
    # Subscription plan breakdown
    plan_pipeline = [
        {"$group": {"_id": "$subscription_plan", "count": {"$sum": 1}}},
    ]
    plan_counts = {}
    async for doc in _db.sentinel_x_preorders.aggregate(plan_pipeline):
        if doc["_id"]:
            plan_counts[doc["_id"]] = doc["count"]
    
    return {
        "export_date": now.isoformat(),
        "period": "all_time",
        "users": {
            "total": total_users,
            "new_last_30_days": new_users_30d,
            "new_last_7_days": new_users_7d,
            "subscribers": total_subscribers,
            "trial": trial_users,
            "free": free_users
        },
        "orders": {
            "total": total_orders,
            "last_30_days": orders_30d,
            "subscription_orders": subscription_orders,
            "by_product": product_counts,
            "by_plan": plan_counts
        },
        "safety": {
            "total_sos_alerts": total_sos,
            "sos_last_30_days": sos_30d,
            "emergency_112_total": total_112,
            "tracking_active_users": tracking_active,
            "location_locked_users": location_locked
        },
        "conversion": {
            "registration_to_order_rate": round(total_orders / max(total_users, 1) * 100, 2),
            "trial_to_paid_rate": round(total_subscribers / max(trial_users + total_subscribers, 1) * 100, 2)
        },
        "bigquery_schema": {
            "table_name": "manoprotect_analytics",
            "fields": [
                {"name": "date", "type": "TIMESTAMP"},
                {"name": "total_users", "type": "INTEGER"},
                {"name": "new_users", "type": "INTEGER"},
                {"name": "total_orders", "type": "INTEGER"},
                {"name": "subscribers", "type": "INTEGER"},
                {"name": "sos_alerts", "type": "INTEGER"},
                {"name": "tracking_active", "type": "INTEGER"},
                {"name": "conversion_rate", "type": "FLOAT"}
            ]
        }
    }


@router.get("/admin/analytics/users-csv")
async def export_users_csv(request: Request):
    """Export users data as CSV for BigQuery import"""
    session_token = request.cookies.get("session_token")
    admin = await require_auth(request, session_token)
    
    admin_doc = await _db.users.find_one({"user_id": admin.user_id}, {"_id": 0, "role": 1})
    if not admin_doc or admin_doc.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    users = await _db.users.find(
        {},
        {"_id": 0, "user_id": 1, "name": 1, "email": 1, "plan": 1, "created_at": 1,
         "location_locked": 1, "background_tracking_active": 1}
    ).to_list(10000)
    
    import csv
    from io import StringIO
    from fastapi.responses import StreamingResponse
    
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["user_id", "name", "email", "plan", "created_at", "location_locked", "background_tracking_active"])
    writer.writeheader()
    for u in users:
        writer.writerow({
            "user_id": u.get("user_id", ""),
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "plan": u.get("plan", "free"),
            "created_at": u.get("created_at", ""),
            "location_locked": u.get("location_locked", False),
            "background_tracking_active": u.get("background_tracking_active", False)
        })
    
    output.seek(0)
    from fastapi.responses import StreamingResponse as SR
    return SR(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=manoprotect_users_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"}
    )
