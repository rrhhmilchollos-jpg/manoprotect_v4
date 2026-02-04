"""
ManoProtect - Geofencing / Safe Zones Routes
CRUD endpoints for geofences + entry/exit detection
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid
import math

router = APIRouter(tags=["Geofencing"])

_db = None

# Plans that have geofencing access
GEOFENCE_PLANS = [
    "family-yearly", "family-monthly", "family-quarterly", "family",
    "premium", "premium-yearly", "premium-monthly"
]

# Superadmins always have access
SUPERADMIN_EMAILS = [
    "rrhh.milchollos@gmail.com",
    "info@manoprotect.com",
    "ivanrubiosolas@gmail.com"
]

# Preset zone types
PRESET_ZONES = {
    "home": {"name": "Casa", "icon": "🏠", "default_radius": 150},
    "work": {"name": "Trabajo", "icon": "💼", "default_radius": 200},
    "school": {"name": "Colegio", "icon": "🏫", "default_radius": 150},
    "custom": {"name": "Personalizada", "icon": "📍", "default_radius": 200}
}


def init_geofence_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


# ============================================
# PYDANTIC MODELS
# ============================================

class GeofenceCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius: int = 200  # 50-500 meters
    zone_type: str = "custom"  # home, work, school, custom
    alert_on_entry: bool = True
    alert_on_exit: bool = True
    notify_sms: bool = True
    notify_push: bool = True
    member_ids: List[str] = []  # Family members to track in this zone
    address: Optional[str] = None


class GeofenceUpdate(BaseModel):
    name: Optional[str] = None
    radius: Optional[int] = None
    alert_on_entry: Optional[bool] = None
    alert_on_exit: Optional[bool] = None
    notify_sms: Optional[bool] = None
    notify_push: Optional[bool] = None
    member_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


class LocationCheck(BaseModel):
    latitude: float
    longitude: float
    member_id: Optional[str] = None


# ============================================
# HELPER FUNCTIONS
# ============================================

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points in meters using Haversine formula
    """
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def is_inside_geofence(lat: float, lon: float, fence_lat: float, fence_lon: float, radius: int) -> bool:
    """Check if a point is inside a geofence"""
    distance = haversine_distance(lat, lon, fence_lat, fence_lon)
    return distance <= radius


async def check_user_geofence_access(user) -> dict:
    """Check if user has access to geofencing feature"""
    # Superadmins always have full access
    if user.email in SUPERADMIN_EMAILS:
        return {"has_access": True, "max_zones": 999, "is_premium": True}
    
    # Check if user has family plan
    if user.plan in GEOFENCE_PLANS:
        return {"has_access": True, "max_zones": 999, "is_premium": True}
    
    # Free users get 1 zone
    return {"has_access": True, "max_zones": 1, "is_premium": False}


# ============================================
# CRUD ENDPOINTS
# ============================================

@router.get("/geofences")
async def get_geofences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all geofences for the current user"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    access = await check_user_geofence_access(user)
    
    geofences = await _db.geofences.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "geofences": geofences,
        "total": len(geofences),
        "max_zones": access["max_zones"],
        "is_premium": access["is_premium"],
        "preset_zones": PRESET_ZONES
    }


@router.post("/geofences")
async def create_geofence(
    data: GeofenceCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a new geofence / safe zone"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    access = await check_user_geofence_access(user)
    
    # Check zone limit for free users
    current_count = await _db.geofences.count_documents({"user_id": user.user_id})
    if current_count >= access["max_zones"]:
        if not access["is_premium"]:
            raise HTTPException(
                status_code=403,
                detail=f"Plan gratuito limitado a {access['max_zones']} zona. Actualiza al Plan Familiar para zonas ilimitadas."
            )
    
    # Validate radius (50-500 meters)
    radius = max(50, min(500, data.radius))
    
    # Get preset info
    preset = PRESET_ZONES.get(data.zone_type, PRESET_ZONES["custom"])
    
    geofence = {
        "geofence_id": f"geo_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": data.name,
        "zone_type": data.zone_type,
        "icon": preset["icon"],
        "latitude": data.latitude,
        "longitude": data.longitude,
        "radius": radius,
        "address": data.address,
        "alert_on_entry": data.alert_on_entry,
        "alert_on_exit": data.alert_on_exit,
        "notify_sms": data.notify_sms,
        "notify_push": data.notify_push,
        "member_ids": data.member_ids,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.geofences.insert_one(geofence)
    
    return {
        "success": True,
        "message": f"Zona segura '{data.name}' creada correctamente",
        "geofence": {k: v for k, v in geofence.items() if k != "_id"}
    }


# ============================================
# EVENTS & MEMBER STATES (must be before /{geofence_id})
# ============================================

@router.get("/geofences/events")
async def get_geofence_events(
    request: Request,
    days: int = 7,
    session_token: Optional[str] = Cookie(None)
):
    """Get all geofence events for the user"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Get user's geofences
    geofences = await _db.geofences.find(
        {"user_id": user.user_id},
        {"_id": 0, "geofence_id": 1}
    ).to_list(100)
    
    geofence_ids = [g["geofence_id"] for g in geofences]
    
    if not geofence_ids:
        return {"events": [], "total": 0}
    
    # Get events
    events = await _db.geofence_events.find(
        {"geofence_id": {"$in": geofence_ids}},
        {"_id": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    return {
        "events": events,
        "total": len(events)
    }


@router.get("/geofences/member-states")
async def get_member_states(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current state of all tracked members in all geofences"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Get user's geofences
    geofences = await _db.geofences.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    
    for fence in geofences:
        states = await _db.geofence_member_states.find(
            {"geofence_id": fence["geofence_id"]},
            {"_id": 0}
        ).to_list(50)
        
        # Enrich with member names
        enriched_states = []
        for state in states:
            member = await _db.family_children.find_one(
                {"child_id": state["member_id"]},
                {"_id": 0, "name": 1}
            )
            if not member:
                member = await _db.family_members.find_one(
                    {"id": state["member_id"]},
                    {"_id": 0, "name": 1}
                )
            
            enriched_states.append({
                **state,
                "member_name": member.get("name", "Desconocido") if member else "Desconocido"
            })
        
        result.append({
            "geofence": fence,
            "member_states": enriched_states
        })
    
    return {"zones": result}


# ============================================
# SINGLE GEOFENCE CRUD (parameterized routes)
# ============================================

@router.get("/geofences/{geofence_id}")
async def get_geofence(
    geofence_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get details of a specific geofence"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    geofence = await _db.geofences.find_one(
        {"geofence_id": geofence_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not geofence:
        raise HTTPException(status_code=404, detail="Zona segura no encontrada")
    
    # Get recent events for this geofence
    events = await _db.geofence_events.find(
        {"geofence_id": geofence_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "geofence": geofence,
        "recent_events": events
    }


@router.put("/geofences/{geofence_id}")
async def update_geofence(
    geofence_id: str,
    data: GeofenceUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update a geofence"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if "radius" in update_data:
        update_data["radius"] = max(50, min(500, update_data["radius"]))
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await _db.geofences.update_one(
        {"geofence_id": geofence_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Zona segura no encontrada")
    
    return {"success": True, "message": "Zona segura actualizada"}


@router.delete("/geofences/{geofence_id}")
async def delete_geofence(
    geofence_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete a geofence"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    result = await _db.geofences.delete_one(
        {"geofence_id": geofence_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zona segura no encontrada")
    
    # Also delete related events
    await _db.geofence_events.delete_many({"geofence_id": geofence_id})
    
    return {"success": True, "message": "Zona segura eliminada"}


# ============================================
# LOCATION CHECKING & ALERTS
# ============================================

@router.post("/geofences/check-location")
async def check_location_against_geofences(
    data: LocationCheck,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Check if a location crosses any geofence boundaries.
    This endpoint is called when a device updates its location.
    Returns any entry/exit events that should trigger notifications.
    """
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    member_id = data.member_id or user.user_id
    
    # Get all active geofences for this user
    geofences = await _db.geofences.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    ).to_list(100)
    
    if not geofences:
        return {"events": [], "message": "No hay zonas seguras configuradas"}
    
    events = []
    
    for fence in geofences:
        # Skip if this member is not being tracked in this zone
        if fence.get("member_ids") and member_id not in fence["member_ids"]:
            continue
        
        # Check if inside geofence
        is_inside = is_inside_geofence(
            data.latitude, data.longitude,
            fence["latitude"], fence["longitude"],
            fence["radius"]
        )
        
        # Get last known state for this member in this geofence
        last_state = await _db.geofence_member_states.find_one(
            {"geofence_id": fence["geofence_id"], "member_id": member_id},
            {"_id": 0}
        )
        
        was_inside = last_state.get("is_inside", None) if last_state else None
        
        # Detect entry/exit events
        event_type = None
        if was_inside is None:
            # First time - just record state, no event
            pass
        elif not was_inside and is_inside:
            # Entry event
            if fence.get("alert_on_entry", True):
                event_type = "entry"
        elif was_inside and not is_inside:
            # Exit event
            if fence.get("alert_on_exit", True):
                event_type = "exit"
        
        # Update member state
        await _db.geofence_member_states.update_one(
            {"geofence_id": fence["geofence_id"], "member_id": member_id},
            {
                "$set": {
                    "geofence_id": fence["geofence_id"],
                    "member_id": member_id,
                    "is_inside": is_inside,
                    "last_latitude": data.latitude,
                    "last_longitude": data.longitude,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        # Create event if needed
        if event_type:
            event = {
                "event_id": f"evt_{uuid.uuid4().hex[:12]}",
                "geofence_id": fence["geofence_id"],
                "geofence_name": fence["name"],
                "zone_type": fence.get("zone_type", "custom"),
                "icon": fence.get("icon", "📍"),
                "member_id": member_id,
                "event_type": event_type,
                "latitude": data.latitude,
                "longitude": data.longitude,
                "notify_sms": fence.get("notify_sms", True),
                "notify_push": fence.get("notify_push", True),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await _db.geofence_events.insert_one(event)
            events.append({k: v for k, v in event.items() if k != "_id"})
            
            # Trigger notifications
            await trigger_geofence_notifications(user, fence, event, member_id)
    
    return {
        "events": events,
        "total_zones_checked": len(geofences),
        "location": {"latitude": data.latitude, "longitude": data.longitude}
    }


async def trigger_geofence_notifications(user, geofence, event, member_id):
    """
    Send notifications when a geofence boundary is crossed
    """
    # Get member info
    member = await _db.family_children.find_one(
        {"child_id": member_id},
        {"_id": 0, "name": 1, "phone": 1}
    )
    
    if not member:
        member = await _db.family_members.find_one(
            {"id": member_id},
            {"_id": 0, "name": 1, "phone": 1}
        )
    
    member_name = member.get("name", "Familiar") if member else "Familiar"
    
    # Build notification message
    if event["event_type"] == "entry":
        title = f"📍 {member_name} ha llegado"
        body = f"{member_name} ha entrado en la zona '{geofence['name']}'"
    else:
        title = f"⚠️ {member_name} ha salido"
        body = f"{member_name} ha salido de la zona '{geofence['name']}'"
    
    # Create in-app notification
    notification = {
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "type": "geofence_alert",
        "title": title,
        "message": body,
        "data": {
            "event_id": event["event_id"],
            "geofence_id": geofence["geofence_id"],
            "member_id": member_id,
            "event_type": event["event_type"],
            "latitude": event["latitude"],
            "longitude": event["longitude"]
        },
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await _db.notifications.insert_one(notification)
    
    # Send FCM push notification
    if geofence.get("notify_push", True):
        try:
            from services.emergency_notifications import send_fcm_high_priority
            
            fcm_token = await _db.push_subscriptions.find_one(
                {"user_id": user.user_id},
                {"_id": 0, "fcm_token": 1}
            )
            
            if fcm_token and fcm_token.get("fcm_token"):
                await send_fcm_high_priority(
                    fcm_tokens=[fcm_token["fcm_token"]],
                    title=title,
                    body=body,
                    data={
                        "type": "geofence_alert",
                        "event_type": event["event_type"],
                        "geofence_name": geofence["name"],
                        "member_name": member_name
                    }
                )
        except Exception as e:
            print(f"FCM geofence notification error: {e}")
    
    # Send SMS notification
    if geofence.get("notify_sms", True) and user.phone:
        try:
            from services.infobip_sms import send_sms
            
            sms_message = f"ManoProtect: {body}"
            await send_sms(
                phone_number=user.phone if hasattr(user, 'phone') else None,
                message=sms_message
            )
        except Exception as e:
            print(f"SMS geofence notification error: {e}")
