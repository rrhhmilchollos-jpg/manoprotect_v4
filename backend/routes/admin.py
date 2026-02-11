"""
MANO - Admin Routes
Administrative endpoints for managing users, investors, payments, and subscriptions
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone

from core.config import db, require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/public/users-count")
async def get_public_users_count():
    """Get public count of registered users (no auth required)"""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"status": {"$ne": "inactive"}})
    
    # Get users registered in last 24 hours
    from datetime import timedelta
    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    new_users_24h = await db.users.count_documents({"created_at": {"$gte": day_ago}})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_24h": new_users_24h,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/public/active-users")
async def get_public_active_users():
    """Get list of active users with basic info (for public display)"""
    users = await db.users.find(
        {"status": {"$ne": "inactive"}},
        {
            "_id": 0,
            "password_hash": 0,
            "email": 0,  # Hide email for privacy
            "phone": 0
        }
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # Mask sensitive info
    sanitized_users = []
    for u in users:
        sanitized_users.append({
            "name": u.get("name", "Usuario"),
            "role": u.get("role", "user"),
            "plan": u.get("plan", "free"),
            "member_since": u.get("created_at"),
            "avatar_initial": u.get("name", "U")[0].upper() if u.get("name") else "U"
        })
    
    return {
        "users": sanitized_users,
        "total": len(sanitized_users),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/dashboard")
async def get_admin_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get admin dashboard stats"""
    await require_admin(request, session_token)
    
    total_users = await db.users.count_documents({})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    pending_investors = await db.investor_requests.count_documents({"status": "pending"})
    approved_investors = await db.investor_requests.count_documents({"status": "approved"})
    
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payment_transactions.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "stats": {
            "total_users": total_users,
            "premium_users": premium_users,
            "free_users": total_users - premium_users,
            "pending_investors": pending_investors,
            "approved_investors": approved_investors,
            "total_revenue": total_revenue
        }
    }


@router.get("/users")
async def get_admin_users(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None
):
    """Get all users (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user role (admin only)"""
    await require_admin(request, session_token)
    
    if role not in ["user", "investor", "admin"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": f"Rol actualizado a {role}"}


@router.patch("/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    plan: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user subscription plan (admin only) - Manual premium activation"""
    await require_admin(request, session_token)
    
    valid_plans = ["free", "personal", "family", "business", "enterprise"]
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Plan inválido. Planes válidos: {', '.join(valid_plans)}")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    update_data = {
        "plan": plan,
        "subscription_status": "active" if plan != "free" else None,
        "plan_updated_at": datetime.now(timezone.utc).isoformat(),
        "plan_updated_by": "admin_manual"
    }
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    await db.admin_logs.insert_one({
        "action": "plan_change",
        "user_id": user_id,
        "old_plan": old_plan,
        "new_plan": plan,
        "changed_by": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": f"Plan actualizado de '{old_plan}' a '{plan}'",
        "user_id": user_id,
        "new_plan": plan
    }


@router.get("/subscriptions")
async def get_admin_subscriptions(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all premium subscriptions with details (admin only)"""
    await require_admin(request, session_token)
    
    premium_users = await db.users.find(
        {"plan": {"$ne": "free"}},
        {"_id": 0, "password_hash": 0}
    ).to_list(500)
    
    stats = {
        "total_premium": len(premium_users),
        "by_plan": {},
        "recent_upgrades": []
    }
    
    for user in premium_users:
        plan = user.get("plan", "unknown")
        stats["by_plan"][plan] = stats["by_plan"].get(plan, 0) + 1
    
    recent_logs = await db.admin_logs.find(
        {"action": "plan_change"},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "subscribers": premium_users,
        "stats": stats,
        "recent_changes": recent_logs
    }


@router.get("/payments")
async def get_admin_payments(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Get all payments (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if status:
        query["payment_status"] = status
    
    payments = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    return payments


@router.get("/document-downloads")
async def get_document_downloads(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get document download history (admin only)"""
    await require_admin(request, session_token)
    
    downloads = await db.document_downloads.find({}, {"_id": 0}).sort("downloaded_at", -1).limit(100).to_list(100)
    
    return downloads
