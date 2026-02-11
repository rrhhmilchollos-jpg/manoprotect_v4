"""
ManoProtect - Smart Family Locator
Advanced location tracking with behavioral zones and AI-powered alerts
"""
from fastapi import APIRouter, HTTPException, Request
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import random
import math

from core.auth import require_auth

router = APIRouter(prefix="/smart-locator", tags=["Smart Family Locator"])
_db = None

def init_db(db):
    global _db
    _db = db


# Models
class GeoPoint(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None


class SafeZone(BaseModel):
    id: Optional[str] = None
    name: str
    center: GeoPoint
    radius: float  # meters
    zone_type: str = "safe"  # safe, school, work, restricted
    schedule: Optional[dict] = None  # { "days": [1,2,3,4,5], "start": "08:00", "end": "14:00" }
    alerts_enabled: bool = True
    created_at: Optional[datetime] = None


class LocationUpdate(BaseModel):
    member_id: str
    location: GeoPoint
    battery_level: Optional[int] = None
    is_moving: Optional[bool] = False
    speed: Optional[float] = None  # km/h


class BehaviorAlert(BaseModel):
    alert_type: str  # zone_exit, zone_entry, unusual_movement, low_battery, sos
    severity: str  # low, medium, high, critical
    message: str
    member_id: str
    member_name: str
    location: Optional[GeoPoint] = None
    zone_name: Optional[str] = None
    timestamp: datetime


# Helper functions
def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in meters using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def is_point_in_zone(point: GeoPoint, zone: dict) -> bool:
    """Check if a point is inside a zone"""
    distance = calculate_distance(
        point.lat, point.lng,
        zone["center"]["lat"], zone["center"]["lng"]
    )
    return distance <= zone["radius"]


def check_schedule(zone: dict) -> bool:
    """Check if current time is within zone's active schedule"""
    schedule = zone.get("schedule")
    if not schedule:
        return True
    
    now = datetime.now(timezone.utc)
    current_day = now.weekday() + 1  # 1=Monday, 7=Sunday
    current_time = now.strftime("%H:%M")
    
    if current_day not in schedule.get("days", [1,2,3,4,5,6,7]):
        return False
    
    start = schedule.get("start", "00:00")
    end = schedule.get("end", "23:59")
    
    return start <= current_time <= end


# Routes
@router.get("/members")
async def get_family_members_locations(request: Request):
    """Get all family members with their last known locations"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    members = await _db.family_children.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    # Enrich with location data
    for member in members:
        location = await _db.member_locations.find_one(
            {"member_id": member["child_id"]},
            {"_id": 0},
            sort=[("timestamp", -1)]
        )
        if location:
            member["last_location"] = location
            member["location_age_minutes"] = (datetime.now(timezone.utc) - location.get("timestamp", datetime.now(timezone.utc))).total_seconds() / 60
        
        # Get zone status
        zones = await _db.safe_zones.find(
            {"family_owner_id": user.user_id},
            {"_id": 0}
        ).to_list(50)
        
        if location:
            point = GeoPoint(lat=location["lat"], lng=location["lng"])
            member["current_zones"] = [z["name"] for z in zones if is_point_in_zone(point, z)]
            member["is_in_safe_zone"] = len(member["current_zones"]) > 0
    
    return {
        "members": members,
        "total_count": len(members),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.post("/location/update")
async def update_member_location(data: LocationUpdate, request: Request):
    """Update a family member's location"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    # Verify member belongs to this family
    member = await _db.family_children.find_one({
        "child_id": data.member_id,
        "family_owner_id": user.user_id
    })
    
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    # Store location
    location_doc = {
        "member_id": data.member_id,
        "family_owner_id": user.user_id,
        "lat": data.location.lat,
        "lng": data.location.lng,
        "accuracy": data.location.accuracy,
        "battery_level": data.battery_level,
        "is_moving": data.is_moving,
        "speed": data.speed,
        "timestamp": datetime.now(timezone.utc)
    }
    
    await _db.member_locations.insert_one(location_doc)
    
    # Check zone violations
    alerts = []
    zones = await _db.safe_zones.find(
        {"family_owner_id": user.user_id, "alerts_enabled": True},
        {"_id": 0}
    ).to_list(50)
    
    for zone in zones:
        if not check_schedule(zone):
            continue
            
        in_zone = is_point_in_zone(data.location, zone)
        zone_type = zone.get("zone_type", "safe")
        
        # Get previous location to detect transitions
        prev_location = await _db.member_locations.find_one(
            {"member_id": data.member_id},
            {"_id": 0},
            sort=[("timestamp", -1)],
            skip=1
        )
        
        was_in_zone = False
        if prev_location:
            prev_point = GeoPoint(lat=prev_location["lat"], lng=prev_location["lng"])
            was_in_zone = is_point_in_zone(prev_point, zone)
        
        # Generate alerts for zone transitions
        if zone_type == "safe":
            if was_in_zone and not in_zone:
                alerts.append({
                    "alert_type": "zone_exit",
                    "severity": "high",
                    "message": f"{member['name']} ha salido de la zona segura '{zone['name']}'",
                    "member_id": data.member_id,
                    "member_name": member["name"],
                    "zone_name": zone["name"],
                    "location": {"lat": data.location.lat, "lng": data.location.lng},
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        elif zone_type == "restricted":
            if not was_in_zone and in_zone:
                alerts.append({
                    "alert_type": "zone_entry",
                    "severity": "critical",
                    "message": f"ALERTA: {member['name']} ha entrado en zona restringida '{zone['name']}'",
                    "member_id": data.member_id,
                    "member_name": member["name"],
                    "zone_name": zone["name"],
                    "location": {"lat": data.location.lat, "lng": data.location.lng},
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
    
    # Check battery level
    if data.battery_level and data.battery_level < 15:
        alerts.append({
            "alert_type": "low_battery",
            "severity": "medium",
            "message": f"Bateria baja ({data.battery_level}%) en el dispositivo de {member['name']}",
            "member_id": data.member_id,
            "member_name": member["name"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    # Store alerts
    for alert in alerts:
        alert["family_owner_id"] = user.user_id
        alert["is_read"] = False
        await _db.location_alerts.insert_one(alert)
    
    return {
        "success": True,
        "alerts_generated": len(alerts),
        "alerts": alerts
    }


@router.get("/zones")
async def get_safe_zones(request: Request):
    """Get all safe zones for the family"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    zones = await _db.safe_zones.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(50)
    
    return {
        "zones": zones,
        "total_count": len(zones)
    }


@router.post("/zones")
async def create_safe_zone(zone: SafeZone, request: Request):
    """Create a new safe zone"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    import uuid
    zone_doc = {
        "zone_id": str(uuid.uuid4()),
        "family_owner_id": user.user_id,
        "name": zone.name,
        "center": {"lat": zone.center.lat, "lng": zone.center.lng},
        "radius": zone.radius,
        "zone_type": zone.zone_type,
        "schedule": zone.schedule,
        "alerts_enabled": zone.alerts_enabled,
        "created_at": datetime.now(timezone.utc)
    }
    
    await _db.safe_zones.insert_one(zone_doc)
    del zone_doc["_id"]
    
    return {
        "success": True,
        "zone": zone_doc
    }


@router.delete("/zones/{zone_id}")
async def delete_safe_zone(zone_id: str, request: Request):
    """Delete a safe zone"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    result = await _db.safe_zones.delete_one({
        "zone_id": zone_id,
        "family_owner_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zona no encontrada")
    
    return {"success": True, "deleted": True}


@router.get("/alerts")
async def get_location_alerts(request: Request, limit: int = 50):
    """Get location-based alerts"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    alerts = await _db.location_alerts.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    unread_count = await _db.location_alerts.count_documents({
        "family_owner_id": user.user_id,
        "is_read": False
    })
    
    return {
        "alerts": alerts,
        "unread_count": unread_count,
        "total_count": len(alerts)
    }


@router.post("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, request: Request):
    """Mark an alert as read"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    await _db.location_alerts.update_one(
        {"_id": alert_id, "family_owner_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    return {"success": True}


@router.get("/history/{member_id}")
async def get_location_history(
    member_id: str, 
    request: Request,
    days: int = 7
):
    """Get location history for a family member"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    # Verify member belongs to this family
    member = await _db.family_children.find_one({
        "child_id": member_id,
        "family_owner_id": user.user_id
    })
    
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    locations = await _db.member_locations.find(
        {
            "member_id": member_id,
            "timestamp": {"$gte": since}
        },
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    return {
        "member_id": member_id,
        "member_name": member["name"],
        "locations": locations,
        "total_points": len(locations),
        "period_days": days
    }


@router.post("/sos")
async def trigger_sos(request: Request, location: Optional[GeoPoint] = None):
    """Trigger SOS alert with location"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    alert = {
        "alert_type": "sos",
        "severity": "critical",
        "message": f"SOS EMERGENCIA de {user.full_name or user.email}",
        "member_id": user.user_id,
        "member_name": user.full_name or user.email,
        "family_owner_id": user.user_id,
        "location": {"lat": location.lat, "lng": location.lng} if location else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_read": False
    }
    
    await _db.location_alerts.insert_one(alert)
    
    # Also notify all family admins
    family_links = await _db.family_children.find(
        {"child_id": user.user_id},
        {"family_owner_id": 1}
    ).to_list(10)
    
    for link in family_links:
        admin_alert = alert.copy()
        admin_alert["family_owner_id"] = link["family_owner_id"]
        await _db.location_alerts.insert_one(admin_alert)
    
    return {
        "success": True,
        "message": "Alerta SOS enviada a todos los contactos de emergencia",
        "alert": alert
    }


@router.get("/stats")
async def get_locator_stats(request: Request):
    """Get Smart Locator statistics"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    members_count = await _db.family_children.count_documents({"family_owner_id": user.user_id})
    zones_count = await _db.safe_zones.count_documents({"family_owner_id": user.user_id})
    alerts_count = await _db.location_alerts.count_documents({"family_owner_id": user.user_id})
    locations_today = await _db.member_locations.count_documents({
        "family_owner_id": user.user_id,
        "timestamp": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)}
    })
    
    return {
        "members_tracked": members_count,
        "safe_zones": zones_count,
        "total_alerts": alerts_count,
        "locations_today": locations_today,
        "status": "ACTIVE"
    }
