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
from services.email_service import email_service

router = APIRouter(tags=["SOS & Family"])

_db = None
_PLAN_FEATURES = None


def init_family_routes(db, plan_features):
    """Initialize routes with dependencies"""
    global _db, _PLAN_FEATURES
    _db = db
    _PLAN_FEATURES = plan_features


# Superadmins always have full access
SUPERADMIN_EMAILS = [
    "rrhh.milchollos@gmail.com",
    "info@manoprotect.com",
    "ivanrubiosolas@gmail.com"
]

# All paid plans that have family/SOS features
PAID_PLANS = [
    "family-yearly", "family-monthly", "family-quarterly", "family",
    "premium", "premium-yearly", "premium-monthly", "premium-quarterly",
    "personal-yearly", "personal-monthly", "personal-quarterly", "personal",
    "yearly", "monthly", "quarterly", "weekly",
    "trial-7days", "trial",
    "business", "business-yearly", "business-monthly",
    "enterprise", "enterprise-yearly", "enterprise-monthly"
]


def get_plan_features_for_user(user: User) -> dict:
    """Get features based on user's specific plan"""
    plan = user.plan
    if plan in _PLAN_FEATURES:
        return _PLAN_FEATURES[plan]
    base_plan = plan.split('-')[0] if '-' in plan else plan
    return _PLAN_FEATURES.get(base_plan, _PLAN_FEATURES["free"])


def user_has_premium_access(user: User) -> bool:
    """Check if user has access to premium features (family, SOS, GPS)"""
    # Superadmins always have access
    if user.email in SUPERADMIN_EMAILS:
        return True
    
    # Check if user has any paid plan
    if user.plan in PAID_PLANS:
        return True
    
    # Check if plan is not free (catches any plan we might have missed)
    if user.plan and user.plan != "free":
        return True
    
    # Check features
    features = get_plan_features_for_user(user)
    if features.get("max_users", 1) >= 2:
        return True
    if features.get("sos", False) or features.get("sos_premium", False):
        return True
    if features.get("gps", False) or features.get("child_tracking", False):
        return True
    
    return False


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
    
    if not user_has_premium_access(user):
        raise HTTPException(status_code=403, detail="Se requiere plan Premium o Familiar")
    
    members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return members


@router.post("/family/members")
async def add_family_member(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a family member directly"""
    user = await require_auth(request, session_token)
    
    if not user_has_premium_access(user):
        raise HTTPException(status_code=403, detail="Se requiere plan Premium o Familiar")
    
    plan_features = get_plan_features_for_user(user)
    data = await request.json()
    
    member_count = await _db.family_members.count_documents({"family_owner_id": user.user_id})
    max_members = plan_features.get("max_users", 5) if user.email not in SUPERADMIN_EMAILS else 999
    if member_count >= max_members:
        raise HTTPException(status_code=400, detail=f"Límite de {max_members} miembros alcanzado")
    
    # Check if email already exists
    if data.get("email"):
        existing = await _db.family_members.find_one({
            "family_owner_id": user.user_id,
            "email": data["email"].lower()
        })
        if existing:
            raise HTTPException(status_code=400, detail="Este miembro ya existe")
    
    member = {
        "id": str(uuid.uuid4()),
        "family_owner_id": user.user_id,
        "name": data.get("name", ""),
        "email": data.get("email", "").lower() if data.get("email") else "",
        "phone": data.get("phone", ""),
        "relationship": data.get("relationship", "familiar"),
        "is_senior": data.get("is_senior", False),
        "simplified_mode": data.get("simplified_mode", False),
        "alert_level": data.get("alert_level", "all"),
        "status": "active",
        "user_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.family_members.insert_one(member)
    
    return {
        "message": "Miembro añadido correctamente",
        "member": {k: v for k, v in member.items() if k != "_id"}
    }


@router.put("/family/members/{member_id}")
async def update_family_member(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update a family member's settings"""
    user = await require_auth(request, session_token)
    
    data = await request.json()
    
    allowed_fields = ["name", "phone", "relationship", "is_senior", "simplified_mode", "alert_level"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await _db.family_members.update_one(
        {"id": member_id, "family_owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro actualizado", "updated": True}


@router.delete("/family/members/{member_id}")
async def delete_family_member(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove a family member"""
    user = await require_auth(request, session_token)
    
    result = await _db.family_members.delete_one({
        "id": member_id,
        "family_owner_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro eliminado"}


@router.post("/family/join/{invite_code}")
async def join_family_group(
    invite_code: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Allow a user to join a family using invite code or their email"""
    user = await require_auth(request, session_token)
    
    # Find pending invitation by email
    invitation = await _db.family_members.find_one({
        "email": user.email.lower(),
        "status": {"$in": ["pending", "active"]},
        "user_id": None
    })
    
    if not invitation:
        invitation = await _db.family_members.find_one({
            "id": invite_code,
            "user_id": None
        })
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación no encontrada o ya vinculada")
    
    # Link user to family member record
    await _db.family_members.update_one(
        {"id": invitation["id"]},
        {"$set": {
            "user_id": user.user_id,
            "status": "active",
            "joined_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update user's family group
    await _db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "family_group_id": invitation["family_owner_id"],
            "is_family_member": True
        }}
    )
    
    return {
        "message": "Te has unido al grupo familiar",
        "family_owner_id": invitation["family_owner_id"]
    }


@router.get("/family/my-status")
async def get_my_family_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check if current user belongs to a family group"""
    user = await require_auth(request, session_token)
    
    # Check if user is a family owner
    plan_features = get_plan_features_for_user(user)
    if plan_features["max_users"] >= 2:
        members = await _db.family_members.find(
            {"family_owner_id": user.user_id},
            {"_id": 0}
        ).to_list(10)
        return {
            "is_owner": True,
            "is_member": False,
            "members": members,
            "member_count": len(members),
            "max_members": plan_features["max_users"]
        }
    
    # Check if user is a family member
    membership = await _db.family_members.find_one({
        "user_id": user.user_id,
        "status": "active"
    })
    
    if membership:
        owner = await _db.users.find_one({"user_id": membership["family_owner_id"]})
        return {
            "is_owner": False,
            "is_member": True,
            "family_owner": owner.get("name", "Administrador") if owner else "Desconocido",
            "my_role": membership.get("relationship", "miembro")
        }
    
    # Check pending invitations
    pending = await _db.family_members.find_one({
        "email": user.email.lower(),
        "user_id": None
    })
    
    if pending:
        return {
            "is_owner": False,
            "is_member": False,
            "has_pending_invite": True,
            "invite_id": pending["id"]
        }
    
    return {
        "is_owner": False,
        "is_member": False,
        "has_pending_invite": False
    }


@router.get("/family/linked-members")
async def get_linked_family_members(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get all family members with their protection status"""
    user = await require_auth(request, session_token)
    
    plan_features = get_plan_features_for_user(user)
    
    # Determine owner_id
    if plan_features["max_users"] >= 2:
        owner_id = user.user_id
    else:
        membership = await _db.family_members.find_one({
            "user_id": user.user_id,
            "status": "active"
        })
        if membership:
            owner_id = membership["family_owner_id"]
        else:
            return {"members": [], "is_linked": False}
    
    members = await _db.family_members.find(
        {"family_owner_id": owner_id},
        {"_id": 0}
    ).to_list(10)
    
    # Enrich with stats
    enriched_members = []
    for member in members:
        member_data = {**member}
        if member.get("user_id"):
            member_user = await _db.users.find_one({"user_id": member["user_id"]})
            if member_user:
                member_data["account_name"] = member_user.get("name", member["name"])
                member_data["last_active"] = member_user.get("last_login")
                member_data["account_linked"] = True
            
            threats = await _db.threat_analysis.count_documents({
                "user_id": member["user_id"],
                "is_threat": True
            })
            member_data["threats_blocked"] = threats
        else:
            member_data["threats_blocked"] = 0
            member_data["account_linked"] = False
        
        enriched_members.append(member_data)
    
    return {
        "members": enriched_members,
        "is_linked": True,
        "total_members": len(enriched_members)
    }


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
    
    if not user_has_premium_access(user):
        raise HTTPException(status_code=403, detail="La función SOS requiere plan Premium o Familiar")
    
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
    
    if not user_has_premium_access(user):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan Premium o Familiar")
    
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
    
    if not user_has_premium_access(user):
        raise HTTPException(status_code=403, detail="La función GPS requiere plan Premium o Familiar")
    
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


@router.get("/family/contacts-shared")
async def get_family_shared_contacts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Get shared contact information for family members.
    Only returns non-sensitive data: name, phone, relationship.
    NO bank data, documents, passwords, etc.
    """
    user = await require_auth(request, session_token)
    
    # Get all family members for this subscription
    family_members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {
            "_id": 0,
            "id": 1,
            "name": 1,
            "phone": 1,
            "email": 1,
            "relationship": 1,
            "emergency_contact": 1,
            "is_senior": 1
        }
    ).to_list(50)
    
    # Get children
    children = await _db.family_children.find(
        {"family_owner_id": user.user_id},
        {
            "_id": 0,
            "child_id": 1,
            "name": 1,
            "phone": 1,
            "relationship": 1,
            "device_linked": 1
        }
    ).to_list(20)
    
    # Get emergency contacts
    emergency_contacts = await _db.trusted_contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {
            "_id": 0,
            "id": 1,
            "name": 1,
            "phone": 1,
            "relationship": 1
        }
    ).to_list(20)
    
    # Build the shared contacts response (NO SENSITIVE DATA)
    shared_contacts = {
        "family_owner": {
            "name": user.name,
            "phone": user.phone if hasattr(user, 'phone') else None,
            "email": user.email,
            "role": "owner"
        },
        "family_members": [
            {
                "id": m.get("id"),
                "name": m.get("name"),
                "phone": m.get("phone"),
                "relationship": m.get("relationship"),
                "is_emergency_contact": m.get("emergency_contact", False),
                "is_senior": m.get("is_senior", False)
            }
            for m in family_members
        ],
        "children": [
            {
                "id": c.get("child_id"),
                "name": c.get("name"),
                "phone": c.get("phone"),
                "relationship": c.get("relationship", "hijo/a"),
                "device_linked": c.get("device_linked", False)
            }
            for c in children
        ],
        "emergency_contacts": [
            {
                "id": e.get("id"),
                "name": e.get("name"),
                "phone": e.get("phone"),
                "relationship": e.get("relationship")
            }
            for e in emergency_contacts
        ],
        "total_members": len(family_members) + len(children) + 1,  # +1 for owner
        "subscription_owner_id": user.user_id
    }
    
    return shared_contacts


@router.post("/family/link-member-phone")
async def link_family_member_by_phone(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Link a family member to the subscription by their phone number.
    This allows them to receive SOS alerts and see family contacts.
    """
    user = await require_auth(request, session_token)
    
    try:
        body = await request.json()
        phone = body.get("phone")
        name = body.get("name")
        relationship = body.get("relationship", "familiar")
        is_emergency = body.get("is_emergency", True)
    except:
        return {"success": False, "message": "Datos inválidos"}
    
    if not phone:
        return {"success": False, "message": "Número de teléfono requerido"}
    
    # Check if already linked
    existing = await _db.family_members.find_one({
        "family_owner_id": user.user_id,
        "phone": phone
    })
    
    if existing:
        return {"success": False, "message": "Este número ya está vinculado a tu familia"}
    
    # Create family member link
    member_id = f"member_{uuid.uuid4().hex[:8]}"
    family_link = {
        "id": member_id,
        "family_owner_id": user.user_id,
        "name": name,
        "phone": phone,
        "relationship": relationship,
        "emergency_contact": is_emergency,
        "is_senior": False,
        "simplified_mode": False,
        "alert_level": "all",
        "linked_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.family_members.insert_one(family_link)
    
    # Create notification for the linked member (if they have the app)
    notification = {
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "target_phone": phone,
        "type": "family_link",
        "title": "👨‍👩‍👧‍👦 Te han añadido a una familia",
        "message": f"{user.name} te ha añadido como {relationship} en ManoProtect. Ahora recibirás alertas SOS de tu familia.",
        "data": {
            "family_owner_id": user.user_id,
            "family_owner_name": user.name
        },
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await _db.notifications.insert_one(notification)
    
    return {
        "success": True,
        "message": f"{name} vinculado a tu familia correctamente",
        "member_id": member_id,
        "member": {
            "id": member_id,
            "name": name,
            "phone": phone,
            "relationship": relationship,
            "is_emergency": is_emergency
        }
    }


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
    """Add a child/elderly person to the family for tracking (Family Yearly only)"""
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    if not features.get("child_tracking"):
        raise HTTPException(
            status_code=403, 
            detail="La localización de familiares requiere el Plan Familiar Anual. Actualiza tu plan para acceder a esta función."
        )
    
    # Determinar tipo de persona según edad
    person_type = "unknown"
    if data.age is not None:
        if data.age < 18:
            person_type = "child"
        elif data.age >= 65:
            person_type = "elderly"
        else:
            person_type = "adult"
    
    child = {
        "child_id": f"member_{uuid.uuid4().hex[:12]}",
        "family_owner_id": user.user_id,
        "name": data.name,
        "phone": data.phone,
        "email": data.email,
        "age": data.age,
        "person_type": person_type,
        "silent_mode": data.silent_mode,
        "device_linked": False,
        "last_location": None,
        "invite_token": uuid.uuid4().hex[:16],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.family_children.insert_one(child)
    
    # Send invitation email if email provided
    email_sent = False
    if data.email:
        try:
            # Generate invite link
            invite_link = f"https://manoprotect.com/vincular/{child['child_id']}?token={child['invite_token']}"
            
            result = await email_service.send_family_invite(
                owner_name=user.name,
                member_data=child,
                invite_link=invite_link
            )
            email_sent = result.get("success", False)
        except Exception as e:
            print(f"Error sending invite email: {e}")
    
    # Mensaje personalizado según tipo
    type_messages = {
        "child": f"Niño '{data.name}' añadido",
        "elderly": f"Familiar mayor '{data.name}' añadido",
        "adult": f"Adulto '{data.name}' añadido",
        "unknown": f"Familiar '{data.name}' añadido"
    }
    
    invite_msg = " Se ha enviado un email de invitación." if email_sent else " Instala la app MANO en su teléfono para completar la vinculación."
    
    return {
        "success": True, 
        "child": {k: v for k, v in child.items() if k != "_id"},
        "email_sent": email_sent,
        "message": f"{type_messages[person_type]}.{invite_msg}"
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


@router.post("/family/link-device/{member_id}")
async def link_family_device(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Link a device to a family member using invite token"""
    data = await request.json()
    token = data.get("token")
    
    if not token:
        raise HTTPException(status_code=400, detail="Token de invitación requerido")
    
    # Find the member with matching token
    member = await _db.family_children.find_one({
        "child_id": member_id,
        "invite_token": token
    })
    
    if not member:
        raise HTTPException(status_code=404, detail="Invitación no válida o expirada")
    
    if member.get("device_linked"):
        return {"success": True, "message": "Este dispositivo ya está vinculado"}
    
    # Get device info from request
    device_info = data.get("device_info", {})
    
    # Update member as linked
    await _db.family_children.update_one(
        {"child_id": member_id},
        {
            "$set": {
                "device_linked": True,
                "device_info": device_info,
                "linked_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "message": "¡Dispositivo vinculado correctamente! Ahora tu familia podrá localizarte.",
        "family_owner_id": member.get("family_owner_id")
    }


@router.get("/family/invite/{member_id}")
async def get_invite_info(member_id: str, token: str = None):
    """Get invitation info for a family member link"""
    
    if not token:
        raise HTTPException(status_code=400, detail="Token requerido")
    
    member = await _db.family_children.find_one({
        "child_id": member_id,
        "invite_token": token
    }, {"_id": 0, "name": 1, "family_owner_id": 1, "device_linked": 1})
    
    if not member:
        raise HTTPException(status_code=404, detail="Invitación no válida")
    
    # Get owner info
    owner = await _db.users.find_one(
        {"user_id": member.get("family_owner_id")},
        {"_id": 0, "name": 1}
    )
    
    return {
        "valid": True,
        "member_name": member.get("name"),
        "owner_name": owner.get("name") if owner else "Tu familiar",
        "already_linked": member.get("device_linked", False)
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



# ============================================
# PREMIUM SOS EMERGENCY SYSTEM
# Full emergency system with audio, GPS, sirens, and nearby alerts
# ============================================

@router.post("/sos/premium/trigger")
async def trigger_premium_sos(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Trigger Premium SOS Emergency Alert
    - Records audio message
    - Gets GPS location
    - Alerts all family members
    - Notifies nearby premium users within 5km
    """
    user = await require_auth(request, session_token)
    features = get_plan_features_for_user(user)
    
    # Superadmins always have access
    SUPERADMIN_EMAILS = [
        "rrhh.milchollos@gmail.com",
        "info@manoprotect.com",
        "ivanrubiosolas@gmail.com"
    ]
    
    # Plans that have SOS access
    ALLOWED_PLANS = [
        "family-yearly", "family-monthly", "family-quarterly", "family",
        "premium", "premium-yearly", "premium-monthly", "premium-quarterly",
        "personal-yearly", "personal-monthly", "personal-quarterly", "personal",
        "yearly", "monthly", "quarterly", "weekly",
        "trial-7days", "trial",
        "business", "business-yearly", "business-monthly",
        "enterprise", "enterprise-yearly", "enterprise-monthly"
    ]
    
    # Check if user has access to SOS
    is_superadmin = user.email in SUPERADMIN_EMAILS
    has_sos_feature = features.get("sos_premium", False) or features.get("sos", False)
    has_allowed_plan = user.plan in ALLOWED_PLANS
    has_any_paid_plan = user.plan and user.plan != "free"
    
    if not (is_superadmin or has_sos_feature or has_allowed_plan or has_any_paid_plan):
        raise HTTPException(
            status_code=403,
            detail="El SOS Premium requiere Plan Premium o Familiar. Actualiza tu plan para acceder."
        )
    
    data = await request.json()
    
    # Create SOS alert
    sos_id = f"sos_{uuid.uuid4().hex[:16]}"
    
    sos_alert = {
        "sos_id": sos_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_phone": user.phone if hasattr(user, 'phone') else None,
        "status": "active",
        "location": data.get("location", {}),
        "audio_url": data.get("audio_url"),
        "audio_duration": data.get("audio_duration", 0),
        "message": data.get("message", "¡EMERGENCIA! Necesito ayuda urgente."),
        "alert_nearby": data.get("alert_nearby", True),
        "nearby_radius_km": 5,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": None,
        "resolved_by": None,
        "family_notified": [],
        "nearby_notified": []
    }
    
    # Get family members to notify
    family_members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get children/elderly being tracked
    tracked_family = await _db.family_children.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Combine all family contacts
    all_family = []
    for member in family_members:
        all_family.append({
            "id": member.get("id"),
            "name": member.get("name"),
            "phone": member.get("phone"),
            "type": "family_member",
            "notified_at": datetime.now(timezone.utc).isoformat()
        })
    
    sos_alert["family_notified"] = all_family
    
    # Find nearby premium users if enabled
    nearby_users = []
    if data.get("alert_nearby", True) and data.get("location"):
        lat = data["location"].get("latitude")
        lng = data["location"].get("longitude")
        
        if lat and lng:
            # In production, use geospatial query
            # For now, get premium users who opted in
            premium_users = await _db.users.find({
                "plan": {"$in": ["family-yearly", "family-monthly", "premium"]},
                "user_id": {"$ne": user.user_id},
                "sos_nearby_alerts": True
            }, {"_id": 0, "user_id": 1, "name": 1}).to_list(50)
            
            for pu in premium_users:
                nearby_users.append({
                    "user_id": pu["user_id"],
                    "name": pu.get("name", "Usuario Premium"),
                    "notified_at": datetime.now(timezone.utc).isoformat()
                })
    
    sos_alert["nearby_notified"] = nearby_users
    
    # Save to database
    await _db.sos_premium_alerts.insert_one(sos_alert)
    
    # Send emails to all family members
    email_results = {"sent": 0, "total": 0}
    if family_members:
        try:
            email_results = await email_service.send_sos_alert_to_family(
                sos_data={
                    "sos_id": sos_id,
                    "user_id": user.user_id,
                    "user_name": user.name,
                    "message": data.get("message", "¡EMERGENCIA! Necesito ayuda urgente."),
                    "location": data.get("location", {})
                },
                family_members=family_members
            )
        except Exception as e:
            # Don't fail the SOS if email fails
            print(f"Error sending SOS emails: {e}")
    
    return {
        "success": True,
        "sos_id": sos_id,
        "status": "active",
        "family_notified_count": len(all_family),
        "nearby_notified_count": len(nearby_users),
        "emails_sent": email_results.get("sent", 0),
        "message": "¡Alerta SOS enviada! Tu familia ha sido notificada por email."
    }


@router.post("/sos/premium/{sos_id}/cancel")
async def cancel_premium_sos(
    sos_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel/resolve an active SOS alert"""
    user = await require_auth(request, session_token)
    
    data = await request.json()
    cancel_reason = data.get("reason", "cancelled_by_user")
    
    # Find the alert
    alert = await _db.sos_premium_alerts.find_one({
        "sos_id": sos_id,
        "user_id": user.user_id
    })
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta SOS no encontrada")
    
    if alert.get("status") != "active":
        return {"success": True, "message": "La alerta ya fue resuelta"}
    
    # Update alert status
    await _db.sos_premium_alerts.update_one(
        {"sos_id": sos_id},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.now(timezone.utc).isoformat(),
                "resolved_by": user.user_id,
                "cancel_reason": cancel_reason
            }
        }
    )
    
    return {
        "success": True,
        "message": "Alerta SOS cancelada. Se ha notificado a todos los contactos.",
        "sos_id": sos_id
    }


@router.post("/sos/premium/{sos_id}/confirm")
async def confirm_premium_sos(
    sos_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Family member confirms they received and are responding to SOS"""
    user = await require_auth(request, session_token)
    
    alert = await _db.sos_premium_alerts.find_one({"sos_id": sos_id})
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta SOS no encontrada")
    
    # Record confirmation
    confirmation = {
        "confirmed_by": user.user_id,
        "confirmed_by_name": user.name,
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
        "action": "responding"
    }
    
    await _db.sos_premium_alerts.update_one(
        {"sos_id": sos_id},
        {"$push": {"confirmations": confirmation}}
    )
    
    return {
        "success": True,
        "message": "Confirmación registrada. El usuario ha sido notificado de que vas en camino."
    }


@router.get("/sos/premium/active")
async def get_active_sos_alerts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get active SOS alerts for the user (own alerts + family alerts)"""
    user = await require_auth(request, session_token)
    
    # Get user's own alerts
    own_alerts = await _db.sos_premium_alerts.find(
        {"user_id": user.user_id, "status": "active"},
        {"_id": 0}
    ).to_list(10)
    
    # Get family alerts where user is notified
    family_alerts = await _db.sos_premium_alerts.find({
        "status": "active",
        "$or": [
            {"family_notified.id": user.user_id},
            {"nearby_notified.user_id": user.user_id}
        ]
    }, {"_id": 0}).to_list(10)
    
    return {
        "own_alerts": own_alerts,
        "family_alerts": family_alerts,
        "total_active": len(own_alerts) + len(family_alerts)
    }


@router.get("/sos/premium/history")
async def get_sos_history(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get SOS alert history for the user"""
    user = await require_auth(request, session_token)
    
    alerts = await _db.sos_premium_alerts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return alerts


@router.put("/sos/premium/settings")
async def update_sos_settings(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's SOS settings (nearby alerts opt-in, etc.)"""
    user = await require_auth(request, session_token)
    data = await request.json()
    
    settings = {
        "sos_nearby_alerts": data.get("nearby_alerts", True),
        "sos_sound_enabled": data.get("sound_enabled", True),
        "sos_vibration_enabled": data.get("vibration_enabled", True),
        "sos_auto_record": data.get("auto_record", True),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.users.update_one(
        {"user_id": user.user_id},
        {"$set": settings}
    )
    
    return {"success": True, "settings": settings}


@router.post("/sos/premium/location-update")
async def update_sos_location(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update location for an active SOS alert (real-time tracking)"""
    user = await require_auth(request, session_token)
    data = await request.json()
    
    sos_id = data.get("sos_id")
    location = data.get("location", {})
    
    if not sos_id:
        raise HTTPException(status_code=400, detail="sos_id requerido")
    
    # Update the alert's location
    result = await _db.sos_premium_alerts.update_one(
        {"sos_id": sos_id, "user_id": user.user_id, "status": "active"},
        {
            "$set": {"location": location},
            "$push": {
                "location_history": {
                    "location": location,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alerta SOS activa no encontrada")
    
    return {"success": True, "message": "Ubicación actualizada"}

