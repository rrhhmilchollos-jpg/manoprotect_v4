"""
MANO - SOS, Family, and Child Tracking Routes
Emergency alerts, family management, and child location tracking
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid

from models.all_schemas import (
    SOSAlert, SOSRequest, SOSAlertRequest, LocationUpdate,
    ChildMember, User
)
from core.auth import require_auth

router = APIRouter(tags=["SOS & Family"])

_db = None
_PLAN_FEATURES = None


def init_family_routes(db, plan_features):
    """Initialize routes with dependencies"""
    global _db, _PLAN_FEATURES
    _db = db
    _PLAN_FEATURES = plan_features


def get_plan_features_for_user(user: User) -> dict:
    """Get features based on user's specific plan"""
    plan = user.plan
    if plan in _PLAN_FEATURES:
        return _PLAN_FEATURES[plan]
    base_plan = plan.split('-')[0] if '-' in plan else plan
    return _PLAN_FEATURES.get(base_plan, _PLAN_FEATURES["free"])


# ============================================
# SOS / FAMILY MODE ROUTES
# ============================================

@router.post("/sos", response_model=SOSAlert)
async def trigger_sos(
    data: SOSRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Trigger SOS alert to emergency contacts"""
    user = await require_auth(request, session_token)
    
    contacts = await _db.contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(10)
    
    contact_ids = [c["id"] for c in contacts]
    
    sos_obj = SOSAlert(
        user_id=user.user_id,
        location=data.location,
        message=data.message or "¡Necesito ayuda! Posible situación de fraude o estafa.",
        contacts_notified=contact_ids
    )
    
    doc = sos_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await _db.sos_alerts.insert_one(doc)
    
    return sos_obj


@router.get("/family/members")
async def get_family_members(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family members (for family plans)"""
    user = await require_auth(request, session_token)
    
    plan_features = _PLAN_FEATURES.get(user.plan.split('-')[0], _PLAN_FEATURES["free"])
    if plan_features["max_users"] < 2:
        raise HTTPException(status_code=403, detail="Se requiere plan familiar o superior")
    
    members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return members


# ============================================
# SOS & GPS ROUTES (Family Plan)
# ============================================

@router.post("/sos/alert")
async def send_sos_alert(
    data: SOSAlertRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send SOS alert with GPS location (family plan only)"""
    user = await require_auth(request, session_token)
    
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = _PLAN_FEATURES.get(plan_key, _PLAN_FEATURES["free"])
    
    if not plan_features.get("sos"):
        raise HTTPException(status_code=403, detail="La función SOS requiere plan familiar o superior")
    
    alert_id = f"sos_{uuid.uuid4().hex[:12]}"
    sos_alert = {
        "alert_id": alert_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "location": {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "accuracy": data.accuracy,
            "google_maps_url": f"https://maps.google.com/?q={data.latitude},{data.longitude}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "message": data.message,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.sos_alerts.insert_one(sos_alert)
    
    family_members = await _db.family_members.find(
        {"family_owner_id": user.user_id, "emergency_contact": True},
        {"_id": 0}
    ).to_list(10)
    
    trusted_contacts = await _db.trusted_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    notifications_sent = []
    all_contacts = family_members + trusted_contacts
    
    for contact in all_contacts:
        notification = {
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": contact.get("user_id") or contact.get("contact_id"),
            "type": "sos_alert",
            "title": "🆘 ALERTA SOS",
            "message": f"{user.name} ha enviado una alerta de emergencia: {data.message}",
            "data": {
                "alert_id": alert_id,
                "sender_name": user.name,
                "location": sos_alert["location"]
            },
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await _db.notifications.insert_one(notification)
        notifications_sent.append(contact.get("name") or contact.get("email"))
    
    return {
        "success": True,
        "alert_id": alert_id,
        "message": "Alerta SOS enviada correctamente",
        "location": sos_alert["location"],
        "contacts_notified": len(notifications_sent),
        "contacts": notifications_sent
    }


@router.post("/location/update")
async def update_location(
    data: LocationUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's current location (for family tracking)"""
    user = await require_auth(request, session_token)
    
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = _PLAN_FEATURES.get(plan_key, _PLAN_FEATURES["free"])
    
    if not plan_features.get("gps"):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan familiar o superior")
    
    location_data = {
        "user_id": user.user_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "battery_level": data.battery_level,
        "google_maps_url": f"https://maps.google.com/?q={data.latitude},{data.longitude}",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.user_locations.update_one(
        {"user_id": user.user_id},
        {"$set": location_data},
        upsert=True
    )
    
    return {"success": True, "message": "Ubicación actualizada"}


@router.get("/location/family")
async def get_family_locations(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get locations of all family members (family plan owner only)"""
    user = await require_auth(request, session_token)
    
    plan_key = user.plan.split('-')[0] if '-' in user.plan else user.plan
    plan_features = _PLAN_FEATURES.get(plan_key, _PLAN_FEATURES["free"])
    
    if not plan_features.get("gps"):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan familiar o superior")
    
    family_members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    locations = []
    for member in family_members:
        member_location = await _db.user_locations.find_one(
            {"user_id": member.get("user_id")},
            {"_id": 0}
        )
        if member_location:
            locations.append({
                "member_id": member.get("member_id"),
                "name": member.get("name"),
                "relationship": member.get("relationship"),
                "location": member_location
            })
    
    return {
        "family_owner": user.name,
        "members_count": len(family_members),
        "locations": locations
    }


@router.get("/sos/history")
async def get_sos_history(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get SOS alert history"""
    user = await require_auth(request, session_token)
    
    alerts = await _db.sos_alerts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return {"alerts": alerts}


@router.post("/sos/family-emergency")
async def send_family_emergency_sos(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    latitude: float = 0,
    longitude: float = 0,
    accuracy: float = 0,
    message: str = "",
    include_children: bool = True
):
    """Send emergency SOS to ALL family members with precise GPS location"""
    user = await require_auth(request, session_token)
    
    # Parse request body
    try:
        body = await request.json()
        latitude = body.get("latitude", latitude)
        longitude = body.get("longitude", longitude)
        accuracy = body.get("accuracy", accuracy)
        message = body.get("message", message) or "🆘 ¡EMERGENCIA FAMILIAR! Necesito ayuda urgente."
        include_children = body.get("include_children", include_children)
    except:
        pass
    
    alert_id = f"family_sos_{uuid.uuid4().hex[:12]}"
    google_maps_url = f"https://maps.google.com/?q={latitude},{longitude}"
    
    sos_alert = {
        "alert_id": alert_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "user_name": user.name,
        "type": "family_emergency",
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "accuracy": accuracy,
            "google_maps_url": google_maps_url,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "message": message,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.sos_alerts.insert_one(sos_alert)
    
    # Get all family members
    family_members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    # Get emergency contacts
    emergency_contacts = await _db.contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(20)
    
    # Get trusted contacts
    trusted_contacts = await _db.trusted_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    # Get children if included
    children_contacts = []
    if include_children:
        children = await _db.family_children.find(
            {"family_owner_id": user.user_id, "device_linked": True},
            {"_id": 0}
        ).to_list(10)
        children_contacts = children
    
    # Combine all contacts
    all_contacts = family_members + emergency_contacts + trusted_contacts + children_contacts
    notifications_sent = []
    
    # Send notification to each contact
    for contact in all_contacts:
        contact_name = contact.get("name", contact.get("email", "Familiar"))
        notification = {
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": contact.get("user_id") or contact.get("contact_id") or contact.get("child_id"),
            "target_phone": contact.get("phone"),
            "target_email": contact.get("email"),
            "type": "family_emergency_sos",
            "priority": "critical",
            "title": "🆘 ¡EMERGENCIA FAMILIAR!",
            "message": f"{user.name} necesita ayuda urgente. Ubicación: {google_maps_url}",
            "data": {
                "alert_id": alert_id,
                "sender_name": user.name,
                "sender_phone": user.phone if hasattr(user, 'phone') else None,
                "location": sos_alert["location"],
                "google_maps_url": google_maps_url
            },
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await _db.notifications.insert_one(notification)
        notifications_sent.append(contact_name)
    
    return {
        "success": True,
        "alert_id": alert_id,
        "message": "🆘 Alerta de emergencia familiar enviada",
        "location": sos_alert["location"],
        "google_maps_url": google_maps_url,
        "contacts_notified": len(notifications_sent),
        "contacts": notifications_sent
    }


@router.post("/sos/cancel/{alert_id}")
async def cancel_sos_alert(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel an active SOS alert"""
    user = await require_auth(request, session_token)
    
    result = await _db.sos_alerts.update_one(
        {"alert_id": alert_id, "user_id": user.user_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return {"success": True, "message": "Alerta cancelada"}


@router.post("/contacts/trusted")
async def add_trusted_contact(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    name: str = "",
    phone: str = "",
    email: str = "",
    relationship: str = ""
):
    """Add a trusted contact for SOS alerts"""
    user = await require_auth(request, session_token)
    
    contact = {
        "contact_id": f"contact_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": name,
        "phone": phone,
        "email": email,
        "relationship": relationship,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.trusted_contacts.insert_one(contact)
    
    return {"success": True, "contact": contact}


@router.get("/contacts/trusted")
async def get_trusted_contacts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's trusted contacts"""
    user = await require_auth(request, session_token)
    
    contacts = await _db.trusted_contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    return contacts


# ============================================
# CHILD TRACKING ROUTES (Family Yearly Plan Only)
# ============================================

@router.post("/family/children/add")
async def add_child_member(
    data: ChildMember,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a child to the family for tracking (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        raise HTTPException(
            status_code=403, 
            detail="La localización de niños requiere el Plan Familiar Anual. Actualiza tu plan para acceder a esta función."
        )
    
    child = {
        "child_id": f"child_{uuid.uuid4().hex[:12]}",
        "family_owner_id": user.user_id,
        "name": data.name,
        "phone": data.phone,
        "is_child": True,
        "silent_mode": data.silent_mode,
        "device_linked": False,
        "last_location": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.family_children.insert_one(child)
    
    return {
        "success": True, 
        "child": {k: v for k, v in child.items() if k != "_id"},
        "message": f"Niño '{data.name}' añadido. Instala la app MANO en su teléfono para completar la vinculación."
    }


@router.get("/family/children")
async def get_family_children(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all children in the family"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        return {
            "children": [],
            "feature_available": False,
            "upgrade_message": "Actualiza al Plan Familiar Anual para localizar a tus hijos"
        }
    
    children = await _db.family_children.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return {
        "children": children,
        "feature_available": True
    }


@router.post("/family/children/{child_id}/locate")
async def locate_child(
    child_id: str,
    request: Request,
    silent: bool = False,
    session_token: Optional[str] = Cookie(None)
):
    """Request location of a child (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        raise HTTPException(
            status_code=403, 
            detail="La localización de niños requiere el Plan Familiar Anual"
        )
    
    child = await _db.family_children.find_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not child:
        raise HTTPException(status_code=404, detail="Niño no encontrado en tu familia")
    
    use_silent = silent if silent is not None else child.get("silent_mode", False)
    
    location_request = {
        "request_id": f"locreq_{uuid.uuid4().hex[:12]}",
        "child_id": child_id,
        "requester_id": user.user_id,
        "requester_name": user.name,
        "silent_mode": use_silent,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.location_requests.insert_one(location_request)
    
    if not use_silent:
        notification = {
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "target_phone": child.get("phone"),
            "type": "location_request",
            "title": "📍 Solicitud de ubicación",
            "message": f"{user.name} ha solicitado ver tu ubicación",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await _db.notifications.insert_one(notification)
    
    return {
        "success": True,
        "request_id": location_request["request_id"],
        "child_name": child.get("name"),
        "silent_mode": use_silent,
        "message": "Solicitud de ubicación enviada" if not use_silent else "Solicitud de ubicación enviada (modo silencioso)",
        "note": "La ubicación aparecerá cuando el dispositivo del niño responda"
    }


@router.post("/family/children/{child_id}/update-location")
async def update_child_location(
    child_id: str,
    latitude: float,
    longitude: float,
    accuracy: float = 0,
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Update child's location (called from child's device)"""
    location_data = {
        "latitude": latitude,
        "longitude": longitude,
        "accuracy": accuracy,
        "google_maps_url": f"https://maps.google.com/?q={latitude},{longitude}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.family_children.update_one(
        {"child_id": child_id},
        {"$set": {"last_location": location_data, "device_linked": True}}
    )
    
    history_entry = {
        "history_id": f"hist_{uuid.uuid4().hex[:12]}",
        "child_id": child_id,
        "location": location_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await _db.location_history.insert_one(history_entry)
    
    await _db.location_requests.update_many(
        {"child_id": child_id, "status": "pending"},
        {"$set": {"status": "completed", "location": location_data}}
    )
    
    return {"success": True}


@router.get("/family/children/{child_id}/history")
async def get_child_location_history(
    child_id: str,
    request: Request,
    days: int = 7,
    session_token: Optional[str] = Cookie(None)
):
    """Get location history of a child (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("location_history"):
        raise HTTPException(
            status_code=403, 
            detail="El historial de ubicaciones requiere el Plan Familiar Anual"
        )
    
    child = await _db.family_children.find_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not child:
        raise HTTPException(status_code=404, detail="Niño no encontrado en tu familia")
    
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    history = await _db.location_history.find(
        {"child_id": child_id, "created_at": {"$gte": from_date}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "child": child,
        "history": history,
        "days_requested": days
    }


@router.patch("/family/children/{child_id}/settings")
async def update_child_settings(
    child_id: str,
    request: Request,
    silent_mode: Optional[bool] = None,
    name: Optional[str] = None,
    session_token: Optional[str] = Cookie(None)
):
    """Update child tracking settings"""
    user = await require_auth(request, session_token)
    
    update_data = {}
    if silent_mode is not None:
        update_data["silent_mode"] = silent_mode
    if name:
        update_data["name"] = name
    
    if not update_data:
        return {"success": True, "message": "No hay cambios"}
    
    result = await _db.family_children.update_one(
        {"child_id": child_id, "family_owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Niño no encontrado")
    
    return {
        "success": True, 
        "message": "Configuración actualizada",
        "silent_mode": silent_mode
    }


@router.delete("/family/children/{child_id}")
async def remove_child(
    child_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove a child from the family"""
    user = await require_auth(request, session_token)
    
    result = await _db.family_children.delete_one(
        {"child_id": child_id, "family_owner_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Niño no encontrado")
    
    await _db.location_history.delete_many({"child_id": child_id})
    
    return {"success": True, "message": "Niño eliminado del seguimiento familiar"}
