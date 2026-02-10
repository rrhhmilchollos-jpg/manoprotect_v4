"""
ManoProtect - Metrics Routes
Real-time metrics stream (SSE), dashboard metrics, API keys management
"""
from fastapi import APIRouter, Request, Cookie, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import uuid
import secrets
import asyncio
import json

router = APIRouter(tags=["Metrics"])

_db = None


def init_metrics_routes(db):
    global _db
    _db = db


class APIKeyCreate(BaseModel):
    name: str
    permissions: list = ["read"]


# ============================================
# REAL-TIME METRICS STREAM (SSE)
# ============================================

@router.get("/metrics/stream")
async def stream_metrics(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Stream real-time metrics via Server-Sent Events"""
    from core.auth import get_current_user
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break

            total_threats = await _db.threats.count_documents({"user_id": user_id})
            blocked = await _db.threats.count_documents({"user_id": user_id, "is_threat": True})

            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            recent = await _db.threats.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": one_hour_ago.isoformat()}
            })

            global_threats_today = await _db.threats.count_documents({
                "created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()}
            })

            metrics = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user_metrics": {
                    "total_analyzed": total_threats,
                    "threats_blocked": blocked,
                    "recent_hour": recent,
                    "protection_rate": round((blocked / total_threats * 100) if total_threats > 0 else 100, 1)
                },
                "global_metrics": {
                    "threats_today": global_threats_today,
                    "active_users": await _db.user_sessions.count_documents({}),
                    "system_status": "operational"
                }
            }

            yield f"data: {json.dumps(metrics)}\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# ============================================
# DASHBOARD METRICS
# ============================================

@router.get("/metrics/dashboard")
async def get_dashboard_metrics(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get dashboard metrics for current user"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)

    total_threats = await _db.threats.count_documents({"user_id": user.user_id})
    blocked_threats = await _db.threats.count_documents({"user_id": user.user_id, "is_threat": True})

    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_threats = await _db.threats.count_documents({
        "user_id": user.user_id,
        "created_at": {"$gte": yesterday.isoformat()}
    })

    family_count = await _db.family_children.count_documents({"user_id": user.user_id})
    geofence_count = await _db.geofences.count_documents({"user_id": user.user_id})
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


# ============================================
# API KEYS MANAGEMENT
# ============================================

@router.post("/api-keys")
async def create_api_key(
    data: APIKeyCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a new API key"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)

    existing_count = await _db.api_keys.count_documents({"user_id": user.user_id, "is_active": True})
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="Limite de 5 API keys alcanzado")

    key_value = f"mp_{secrets.token_urlsafe(32)}"
    key_id = f"key_{uuid.uuid4().hex[:12]}"

    api_key = {
        "id": key_id,
        "user_id": user.user_id,
        "name": data.name,
        "key": key_value,
        "key_prefix": key_value[:12],
        "permissions": data.permissions,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_used": None,
        "is_active": True
    }

    await _db.api_keys.insert_one(api_key)

    return {
        "id": key_id,
        "key": key_value,
        "name": data.name,
        "permissions": data.permissions,
        "message": "Guarda esta clave. No se mostrara de nuevo."
    }


@router.get("/api-keys")
async def list_api_keys(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List user's API keys (returns array)"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)

    keys = await _db.api_keys.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0, "key": 0}
    ).to_list(50)

    return keys


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Revoke an API key"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)

    result = await _db.api_keys.delete_one({
        "id": key_id,
        "user_id": user.user_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="API key no encontrada")

    return {"message": "API key revocada"}
