"""
ManoProtect - Escudo Vecinal / Community Shield Routes
Real-time neighborhood security network - NO other alarm company has this.
"""
from fastapi import APIRouter, Request, Cookie, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/community-shield", tags=["Community Shield"])

_db = None

def init_community_shield(db):
    global _db
    _db = db


class IncidentReport(BaseModel):
    type: str = Field(..., description="robo, vandalismo, sospechoso, ruido, emergencia, otro")
    title: str
    description: str
    latitude: float
    longitude: float
    severity: str = Field(default="media", description="baja, media, alta, critica")
    anonymous: bool = False


class IncidentConfirm(BaseModel):
    confirmed: bool = True


class NeighborAlert(BaseModel):
    message: str
    latitude: float
    longitude: float
    radius_km: float = 1.0


INCIDENT_TYPES = {
    "robo": {"icon": "theft", "color": "#EF4444", "label": "Robo/Hurto"},
    "vandalismo": {"icon": "vandalism", "color": "#F97316", "label": "Vandalismo"},
    "sospechoso": {"icon": "suspicious", "color": "#EAB308", "label": "Persona sospechosa"},
    "ruido": {"icon": "noise", "color": "#8B5CF6", "label": "Ruido/Molestias"},
    "emergencia": {"icon": "emergency", "color": "#DC2626", "label": "Emergencia"},
    "accidente": {"icon": "accident", "color": "#0EA5E9", "label": "Accidente"},
    "otro": {"icon": "other", "color": "#6B7280", "label": "Otro"},
}


@router.post("/incidents")
async def report_incident(data: IncidentReport, request: Request, session_token: Optional[str] = Cookie(None)):
    """Report a new neighborhood incident"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    user_name = user.name if user else "Vecino anónimo"

    if data.type not in INCIDENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo inválido. Tipos: {list(INCIDENT_TYPES.keys())}")

    incident_id = str(uuid.uuid4())[:12]
    now = datetime.now(timezone.utc)

    incident = {
        "incident_id": incident_id,
        "type": data.type,
        "type_meta": INCIDENT_TYPES[data.type],
        "title": data.title,
        "description": data.description,
        "location": {
            "type": "Point",
            "coordinates": [data.longitude, data.latitude]
        },
        "latitude": data.latitude,
        "longitude": data.longitude,
        "severity": data.severity,
        "reporter_id": user_id if not data.anonymous else "anonymous",
        "reporter_name": user_name if not data.anonymous else "Vecino anónimo",
        "anonymous": data.anonymous,
        "status": "active",
        "confirmations": 1,
        "confirmed_by": [user_id],
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=24)).isoformat(),
    }

    await _db.community_incidents.insert_one(incident)

    return {
        "incident_id": incident_id,
        "message": "Incidencia reportada. Tus vecinos han sido alertados.",
        "type_meta": INCIDENT_TYPES[data.type],
    }


@router.get("/incidents")
async def get_nearby_incidents(
    lat: float = 0,
    lng: float = 0,
    radius_km: float = 5.0,
    limit: int = 50,
):
    """Get active incidents near a location. Public endpoint for map display."""
    now = datetime.now(timezone.utc)
    twenty_four_hours_ago = (now - timedelta(hours=24)).isoformat()

    query = {
        "status": {"$in": ["active", "confirmed"]},
        "created_at": {"$gte": twenty_four_hours_ago},
    }

    incidents = await _db.community_incidents.find(
        query, {"_id": 0, "confirmed_by": 0, "reporter_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)

    return {
        "incidents": incidents,
        "total": len(incidents),
        "radius_km": radius_km,
        "center": {"lat": lat, "lng": lng},
    }


@router.patch("/incidents/{incident_id}/confirm")
async def confirm_incident(
    incident_id: str,
    data: IncidentConfirm,
    request: Request,
    session_token: Optional[str] = Cookie(None),
):
    """Confirm or deny a reported incident"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"

    incident = await _db.community_incidents.find_one(
        {"incident_id": incident_id}, {"_id": 0}
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")

    if user_id in incident.get("confirmed_by", []):
        raise HTTPException(status_code=400, detail="Ya has confirmado esta incidencia")

    update = {
        "$inc": {"confirmations": 1 if data.confirmed else -1},
        "$push": {"confirmed_by": user_id},
    }

    new_confirmations = incident.get("confirmations", 0) + (1 if data.confirmed else -1)
    if new_confirmations >= 3:
        update["$set"] = {"status": "confirmed"}

    await _db.community_incidents.update_one(
        {"incident_id": incident_id}, update
    )

    return {
        "message": "Confirmación registrada",
        "confirmations": new_confirmations,
        "status": "confirmed" if new_confirmations >= 3 else "active",
    }


@router.get("/stats")
async def get_community_stats(lat: float = 0, lng: float = 0):
    """Get community security stats for a neighborhood"""
    now = datetime.now(timezone.utc)
    seven_days = (now - timedelta(days=7)).isoformat()
    thirty_days = (now - timedelta(days=30)).isoformat()

    week_count = await _db.community_incidents.count_documents(
        {"created_at": {"$gte": seven_days}}
    )
    month_count = await _db.community_incidents.count_documents(
        {"created_at": {"$gte": thirty_days}}
    )

    type_pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    type_stats = await _db.community_incidents.aggregate(type_pipeline).to_list(20)

    severity_pipeline = [
        {"$match": {"created_at": {"$gte": thirty_days}}},
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
    ]
    severity_stats = await _db.community_incidents.aggregate(severity_pipeline).to_list(10)

    total_users = await _db.users.count_documents({})

    return {
        "incidents_last_7_days": week_count,
        "incidents_last_30_days": month_count,
        "by_type": {s["_id"]: s["count"] for s in type_stats if s["_id"]},
        "by_severity": {s["_id"]: s["count"] for s in severity_stats if s["_id"]},
        "active_protectors": total_users,
        "incident_types": INCIDENT_TYPES,
    }


@router.get("/heatmap")
async def get_incident_heatmap():
    """Get incident coordinates for heatmap display"""
    now = datetime.now(timezone.utc)
    thirty_days = (now - timedelta(days=30)).isoformat()

    incidents = await _db.community_incidents.find(
        {"created_at": {"$gte": thirty_days}},
        {"_id": 0, "latitude": 1, "longitude": 1, "type": 1, "severity": 1},
    ).to_list(500)

    return {"points": incidents}


@router.patch("/incidents/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
):
    """Mark an incident as resolved"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)

    result = await _db.community_incidents.update_one(
        {"incident_id": incident_id},
        {"$set": {
            "status": "resolved",
            "resolved_at": datetime.now(timezone.utc).isoformat(),
            "resolved_by": user.user_id if user else "unknown",
        }},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")

    return {"message": "Incidencia marcada como resuelta"}
