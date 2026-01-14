"""
MANO - Notifications Routes
Push notifications and real-time alerts
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime, timezone
import asyncio
import json

from core.config import db, require_auth, require_admin, VAPID_PUBLIC_KEY

router = APIRouter(tags=["Notifications"])


@router.get("/push/vapid-public-key")
async def get_vapid_key():
    """Get VAPID public key for push subscriptions"""
    return {"public_key": VAPID_PUBLIC_KEY}


@router.post("/push/subscribe")
async def subscribe_to_push(request: Request, session_token: Optional[str] = Cookie(None)):
    """Subscribe to push notifications"""
    user = await require_auth(request, session_token)
    body = await request.json()
    
    subscription = body.get("subscription")
    if not subscription:
        raise HTTPException(status_code=400, detail="subscription es requerido")
    
    await db.push_subscriptions.update_one(
        {"user_id": user.user_id},
        {
            "$set": {
                "subscription": subscription,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"message": "Suscripción guardada"}


@router.delete("/push/unsubscribe")
async def unsubscribe_from_push(request: Request, session_token: Optional[str] = Cookie(None)):
    """Unsubscribe from push notifications"""
    user = await require_auth(request, session_token)
    
    await db.push_subscriptions.delete_one({"user_id": user.user_id})
    
    return {"message": "Suscripción eliminada"}


@router.get("/metrics/stream")
async def stream_metrics():
    """Server-Sent Events stream for real-time metrics"""
    async def event_generator():
        while True:
            total_analyzed = await db.threat_analysis.count_documents({})
            threats_blocked = await db.threat_analysis.count_documents({"is_threat": True})
            active_users = await db.users.count_documents({"subscription_status": "active"})
            
            from datetime import timedelta
            one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            recent_threats = await db.threat_analysis.count_documents({
                "created_at": {"$gte": one_hour_ago.isoformat()}
            })
            
            data = {
                "total_analyzed": total_analyzed,
                "threats_blocked": threats_blocked,
                "protection_rate": round((threats_blocked / max(total_analyzed, 1)) * 100, 1),
                "active_users": active_users,
                "recent_threats": recent_threats,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            yield f"data: {json.dumps(data)}\n\n"
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


@router.get("/metrics/dashboard")
async def get_metrics_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get dashboard metrics (admin)"""
    await require_admin(request, session_token)
    
    total_users = await db.users.count_documents({})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    total_threats = await db.threat_analysis.count_documents({})
    blocked_threats = await db.threat_analysis.count_documents({"is_threat": True})
    
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue = await db.payment_transactions.aggregate(pipeline).to_list(1)
    
    return {
        "users": {
            "total": total_users,
            "premium": premium_users,
            "free": total_users - premium_users
        },
        "threats": {
            "total_analyzed": total_threats,
            "blocked": blocked_threats,
            "protection_rate": round((blocked_threats / max(total_threats, 1)) * 100, 1)
        },
        "revenue": {
            "total": revenue[0]["total"] if revenue else 0
        }
    }
