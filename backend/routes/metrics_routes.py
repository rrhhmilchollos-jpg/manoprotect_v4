"""
ManoProtect - Metrics Routes
Dashboard metrics, API keys management
"""
from fastapi import APIRouter, Request, Cookie, HTTPException
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import uuid
import secrets

router = APIRouter(tags=["Metrics"])

_db = None


def init_metrics_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


class APIKeyCreate(BaseModel):
    name: str
    permissions: list = ["read"]


@router.get("/metrics/dashboard")
async def get_dashboard_metrics(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get dashboard metrics for current user"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Get threat stats
    total_threats = await _db.threats.count_documents({"user_id": user.user_id})
    blocked_threats = await _db.threats.count_documents({"user_id": user.user_id, "is_threat": True})
    
    # Get recent activity (last 24h)
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_threats = await _db.threats.count_documents({
        "user_id": user.user_id,
        "created_at": {"$gte": yesterday.isoformat()}
    })
    
    # Get family stats
    family_count = await _db.family_children.count_documents({"user_id": user.user_id})
    geofence_count = await _db.geofences.count_documents({"user_id": user.user_id})
    
    # Get SOS alerts
    sos_alerts = await _db.sos_alerts.count_documents({"user_id": user.user_id})
    
    return {
        "threats": {
            "total": total_threats,
            "blocked": blocked_threats,
            "recent_24h": recent_threats
        },
        "family": {
            "members": family_count,
            "geofences": geofence_count
        },
        "sos": {
            "total_alerts": sos_alerts
        },
        "plan": user.plan,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.post("/api-keys")
async def create_api_key(
    data: APIKeyCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a new API key"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Generate secure key
    key_value = f"mp_{secrets.token_urlsafe(32)}"
    
    api_key = {
        "key_id": f"key_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": data.name,
        "key_prefix": key_value[:12],  # Store prefix for display
        "key_hash": secrets.token_hex(32),  # Would hash the key in production
        "permissions": data.permissions,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_used": None,
        "is_active": True
    }
    
    await _db.api_keys.insert_one(api_key)
    
    return {
        "success": True,
        "key_id": api_key["key_id"],
        "key": key_value,  # Only shown once
        "message": "Guarda esta clave. No se mostrará de nuevo."
    }


@router.get("/api-keys")
async def list_api_keys(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List user's API keys"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    keys = await _db.api_keys.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0, "key_hash": 0}
    ).to_list(50)
    
    return {"api_keys": keys}


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Revoke an API key"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    result = await _db.api_keys.update_one(
        {"key_id": key_id, "user_id": user.user_id},
        {"$set": {"is_active": False, "revoked_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="API key no encontrada")
    
    return {"success": True, "message": "API key revocada"}
