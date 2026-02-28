"""
ManoProtect CEO Dashboard API Routes
Full admin control: users, memberships, purchases, refunds, metrics, stock
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from datetime import datetime, timezone
from typing import Optional

ceo_router = APIRouter(prefix="/ceo", tags=["CEO Dashboard"])

def init_ceo_routes(db, require_admin_fn):
    """Initialize CEO dashboard routes with database connection"""

    PROMO_CONFIG = {
        "basic_stock_total": 50,
        "promo_200_discount_pct": 20,
        "promo_200_total": 200,
    }

    @ceo_router.get("/stats")
    async def get_dashboard_stats(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_users = await db["users"].count_documents({})
        users_today = await db["users"].count_documents({"created_at": {"$gte": today_start.isoformat()}})
        users_month = await db["users"].count_documents({"created_at": {"$gte": month_start.isoformat()}})
        active_subs = await db["subscriptions"].count_documents({"status": "active"})
        monthly_subs = await db["subscriptions"].count_documents({"status": "active", "plan_type": "monthly"})
        yearly_subs = await db["subscriptions"].count_documents({"status": "active", "plan_type": "yearly"})
        total_orders = await db["orders"].count_documents({})
        pending_orders = await db["orders"].count_documents({"status": "pending"})
        total_refunds = await db["refunds"].count_documents({})
        pending_refunds = await db["refunds"].count_documents({"status": "pending"})
        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        basic_remaining = max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed)
        promo_users = await db["subscriptions"].count_documents({"promo_200": True})
        promo_remaining = max(0, PROMO_CONFIG["promo_200_total"] - promo_users)
        contact_msgs = await db["contact_messages"].count_documents({})
        unread_msgs = await db["contact_messages"].count_documents({"status": "new"})
        mrr = (monthly_subs * 9.99) + ((yearly_subs * 99.99) / 12)

        return {
            "users": {"total": total_users, "today": users_today, "this_month": users_month},
            "subscriptions": {"active": active_subs, "monthly": monthly_subs, "yearly": yearly_subs},
            "orders": {"total": total_orders, "pending": pending_orders},
            "refunds": {"total": total_refunds, "pending": pending_refunds},
            "promo": {"basic_stock_remaining": basic_remaining, "basic_stock_total": PROMO_CONFIG["basic_stock_total"], "promo_200_remaining": promo_remaining, "promo_200_total": PROMO_CONFIG["promo_200_total"], "discount_pct": PROMO_CONFIG["promo_200_discount_pct"]},
            "revenue": {"mrr": round(mrr, 2)},
            "messages": {"total": contact_msgs, "unread": unread_msgs},
        }

    @ceo_router.get("/users")
    async def list_users(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20, search: str = ""):
        await require_admin_fn(request, session_token)
        query = {}
        if search:
            query = {"$or": [{"email": {"$regex": search, "$options": "i"}}, {"name": {"$regex": search, "$options": "i"}}, {"full_name": {"$regex": search, "$options": "i"}}]}
        total = await db["users"].count_documents(query)
        users = await db["users"].find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"users": users, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/subscriptions")
    async def list_subscriptions(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["subscriptions"].count_documents({})
        subs = await db["subscriptions"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"subscriptions": subs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/orders")
    async def list_orders(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["orders"].count_documents({})
        orders = await db["orders"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"orders": orders, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/refunds")
    async def list_refunds(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["refunds"].count_documents({})
        refunds = await db["refunds"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"refunds": refunds, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/messages")
    async def list_messages(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["contact_messages"].count_documents({})
        msgs = await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"messages": msgs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/activity")
    async def get_recent_activity(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        activities = []
        for u in await db["users"].find({}, {"_id": 0, "password": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "new_user", "email": u.get("email", ""), "name": u.get("name", u.get("full_name", "")), "time": u.get("created_at", "")})
        for o in await db["orders"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "order", "product": o.get("product", ""), "status": o.get("status", ""), "time": o.get("created_at", "")})
        for m in await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "message", "name": m.get("name", ""), "subject": m.get("subject", ""), "time": m.get("created_at", "")})
        activities.sort(key=lambda x: x.get("time", ""), reverse=True)
        return {"activities": activities[:15]}

    @ceo_router.get("/promo-status")
    async def get_promo_status():
        """Public - no auth needed for promo counters"""
        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        promo_users = await db["subscriptions"].count_documents({"promo_200": True})
        return {
            "basic_stock_remaining": max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed),
            "basic_stock_total": PROMO_CONFIG["basic_stock_total"],
            "promo_200_remaining": max(0, PROMO_CONFIG["promo_200_total"] - promo_users),
            "promo_200_total": PROMO_CONFIG["promo_200_total"],
            "discount_pct": PROMO_CONFIG["promo_200_discount_pct"],
        }

    return ceo_router
