"""
ManoProtect - Geofencing Service
Safe zones with entry/exit alerts
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict
import math
import uuid

# Earth's radius in meters
EARTH_RADIUS = 6371000

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in meters
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return EARTH_RADIUS * c


def is_inside_zone(
    latitude: float, 
    longitude: float, 
    zone_lat: float, 
    zone_lon: float, 
    radius_meters: float
) -> bool:
    """Check if a point is inside a circular zone"""
    distance = calculate_distance(latitude, longitude, zone_lat, zone_lon)
    return distance <= radius_meters


async def check_geofence_alerts(
    db,
    user_id: str,
    latitude: float,
    longitude: float,
    previous_location: Optional[Dict] = None
) -> List[Dict]:
    """
    Check if user has entered or exited any safe zones
    Returns list of alerts to send
    """
    alerts = []
    
    # Get all active safe zones for this user
    zones = await db.safe_zones.find({
        "user_id": user_id,
        "active": True
    }, {"_id": 0}).to_list(50)
    
    for zone in zones:
        zone_lat = zone.get("latitude")
        zone_lon = zone.get("longitude")
        radius = zone.get("radius", 100)
        zone_name = zone.get("name", "Zona")
        zone_id = zone.get("zone_id")
        
        # Check current position
        is_inside_now = is_inside_zone(latitude, longitude, zone_lat, zone_lon, radius)
        
        # Check previous position if available
        was_inside = None
        if previous_location:
            prev_lat = previous_location.get("latitude")
            prev_lon = previous_location.get("longitude")
            if prev_lat and prev_lon:
                was_inside = is_inside_zone(prev_lat, prev_lon, zone_lat, zone_lon, radius)
        
        # Determine if we need to send an alert
        alert_type = None
        
        if was_inside is not None:
            if was_inside and not is_inside_now:
                # User LEFT the zone
                if zone.get("alert_on_exit", True):
                    alert_type = "exit"
            elif not was_inside and is_inside_now:
                # User ENTERED the zone
                if zone.get("alert_on_entry", True):
                    alert_type = "entry"
        
        if alert_type:
            alerts.append({
                "zone_id": zone_id,
                "zone_name": zone_name,
                "alert_type": alert_type,
                "latitude": latitude,
                "longitude": longitude,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    return alerts


async def create_safe_zone(
    db,
    user_id: str,
    name: str,
    latitude: float,
    longitude: float,
    radius: float = 100,
    zone_type: str = "custom",
    alert_on_entry: bool = True,
    alert_on_exit: bool = True,
    address: str = ""
) -> Dict:
    """Create a new safe zone"""
    zone_id = f"zone_{uuid.uuid4().hex[:12]}"
    
    zone = {
        "zone_id": zone_id,
        "user_id": user_id,
        "name": name,
        "zone_type": zone_type,  # home, work, school, custom
        "latitude": latitude,
        "longitude": longitude,
        "radius": min(max(radius, 50), 500),  # Clamp between 50-500m
        "address": address,
        "alert_on_entry": alert_on_entry,
        "alert_on_exit": alert_on_exit,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.safe_zones.insert_one(zone)
    
    return {"zone_id": zone_id, **zone}


async def get_user_zones(db, user_id: str) -> List[Dict]:
    """Get all safe zones for a user"""
    zones = await db.safe_zones.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(50)
    return zones


async def update_safe_zone(db, zone_id: str, user_id: str, updates: Dict) -> bool:
    """Update a safe zone"""
    # Only allow updating certain fields
    allowed_fields = ["name", "radius", "alert_on_entry", "alert_on_exit", "active", "address"]
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if "radius" in safe_updates:
        safe_updates["radius"] = min(max(safe_updates["radius"], 50), 500)
    
    result = await db.safe_zones.update_one(
        {"zone_id": zone_id, "user_id": user_id},
        {"$set": safe_updates}
    )
    
    return result.modified_count > 0


async def delete_safe_zone(db, zone_id: str, user_id: str) -> bool:
    """Delete a safe zone"""
    result = await db.safe_zones.delete_one(
        {"zone_id": zone_id, "user_id": user_id}
    )
    return result.deleted_count > 0


# Zone type icons for frontend
ZONE_TYPES = {
    "home": {"icon": "🏠", "name": "Casa", "color": "#22C55E"},
    "work": {"icon": "💼", "name": "Trabajo", "color": "#3B82F6"},
    "school": {"icon": "🏫", "name": "Colegio", "color": "#F59E0B"},
    "custom": {"icon": "📍", "name": "Personalizada", "color": "#8B5CF6"}
}
