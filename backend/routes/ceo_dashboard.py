"""
ManoProtect CEO Dashboard API Routes
Full admin control: users, memberships, purchases, refunds, metrics, stock
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timezone, timedelta
import os

ceo_router = APIRouter(prefix="/ceo", tags=["CEO Dashboard"])

def init_ceo_routes(db):
    """Initialize CEO dashboard routes with database connection"""

    # ── Stock & Promo Config ──
    PROMO_CONFIG = {
        "basic_stock_total": 50,
        "promo_200_discount_pct": 20,
        "promo_200_total": 200,
    }

    async def verify_admin(request: Request):
        """Verify that the request comes from an admin user"""
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No autorizado")
        token = auth.split(" ")[1]
        import jwt
        try:
            payload = jwt.decode(token, os.environ.get("JWT_SECRET", "manoprotect_secret_2024"), algorithms=["HS256"])
            user = await db["users"].find_one({"email": payload.get("email")}, {"_id": 0, "password": 0})
            if not user or user.get("role") not in ["super_admin", "admin", "ceo"]:
                raise HTTPException(status_code=403, detail="Acceso denegado")
            return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado")
        except Exception:
            raise HTTPException(status_code=401, detail="Token inválido")

    @ceo_router.get("/stats")
    async def get_dashboard_stats(request: Request):
        admin = await verify_admin(request)
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
        shipped_orders = await db["orders"].count_documents({"status": "shipped"})

        total_refunds = await db["refunds"].count_documents({})
        pending_refunds = await db["refunds"].count_documents({"status": "pending"})

        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        basic_remaining = max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed)

        promo_users = await db["subscriptions"].count_documents({"promo_200": True})
        promo_remaining = max(0, PROMO_CONFIG["promo_200_total"] - promo_users)

        contact_msgs = await db["contact_messages"].count_documents({})
        unread_msgs = await db["contact_messages"].count_documents({"status": "new"})

        total_revenue_monthly = monthly_subs * 9.99
        total_revenue_yearly = yearly_subs * 99.99
        mrr = total_revenue_monthly + (total_revenue_yearly / 12)

        return {
            "users": {
                "total": total_users,
                "today": users_today,
                "this_month": users_month,
            },
            "subscriptions": {
                "active": active_subs,
                "monthly": monthly_subs,
                "yearly": yearly_subs,
            },
            "orders": {
                "total": total_orders,
                "pending": pending_orders,
                "shipped": shipped_orders,
            },
            "refunds": {
                "total": total_refunds,
                "pending": pending_refunds,
            },
            "promo": {
                "basic_stock_remaining": basic_remaining,
                "basic_stock_total": PROMO_CONFIG["basic_stock_total"],
                "promo_200_remaining": promo_remaining,
                "promo_200_total": PROMO_CONFIG["promo_200_total"],
                "discount_pct": PROMO_CONFIG["promo_200_discount_pct"],
            },
            "revenue": {
                "mrr": round(mrr, 2),
                "monthly_total": round(total_revenue_monthly, 2),
                "yearly_total": round(total_revenue_yearly, 2),
            },
            "messages": {
                "total": contact_msgs,
                "unread": unread_msgs,
            },
        }

    @ceo_router.get("/users")
    async def list_users(request: Request, page: int = 1, limit: int = 20, search: str = ""):
        admin = await verify_admin(request)
        query = {}
        if search:
            query = {"$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}},
            ]}
        total = await db["users"].count_documents(query)
        users = await db["users"].find(query, {"_id": 0, "password": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"users": users, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/subscriptions")
    async def list_subscriptions(request: Request, page: int = 1, limit: int = 20, status: str = ""):
        admin = await verify_admin(request)
        query = {}
        if status:
            query["status"] = status
        total = await db["subscriptions"].count_documents(query)
        subs = await db["subscriptions"].find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"subscriptions": subs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/orders")
    async def list_orders(request: Request, page: int = 1, limit: int = 20, status: str = ""):
        admin = await verify_admin(request)
        query = {}
        if status:
            query["status"] = status
        total = await db["orders"].count_documents(query)
        orders = await db["orders"].find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"orders": orders, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/refunds")
    async def list_refunds(request: Request, page: int = 1, limit: int = 20):
        admin = await verify_admin(request)
        total = await db["refunds"].count_documents({})
        refunds = await db["refunds"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"refunds": refunds, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/messages")
    async def list_messages(request: Request, page: int = 1, limit: int = 20):
        admin = await verify_admin(request)
        total = await db["contact_messages"].count_documents({})
        msgs = await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"messages": msgs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.put("/messages/{msg_id}/read")
    async def mark_message_read(msg_id: str, request: Request):
        admin = await verify_admin(request)
        await db["contact_messages"].update_one({"message_id": msg_id}, {"$set": {"status": "read"}})
        return {"status": "ok"}

    @ceo_router.get("/promo-status")
    async def get_promo_status(request: Request):
        """Public endpoint for promo stock counters"""
        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        basic_remaining = max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed)
        promo_users = await db["subscriptions"].count_documents({"promo_200": True})
        promo_remaining = max(0, PROMO_CONFIG["promo_200_total"] - promo_users)
        return {
            "basic_stock_remaining": basic_remaining,
            "basic_stock_total": PROMO_CONFIG["basic_stock_total"],
            "promo_200_remaining": promo_remaining,
            "promo_200_total": PROMO_CONFIG["promo_200_total"],
            "discount_pct": PROMO_CONFIG["promo_200_discount_pct"],
        }

    @ceo_router.get("/activity")
    async def get_recent_activity(request: Request):
        admin = await verify_admin(request)
        activities = []
        recent_users = await db["users"].find({}, {"_id": 0, "password": 0}).sort("created_at", -1).limit(5).to_list(5)
        for u in recent_users:
            activities.append({"type": "new_user", "email": u.get("email", ""), "name": u.get("name", u.get("full_name", "")), "time": u.get("created_at", "")})
        recent_orders = await db["orders"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
        for o in recent_orders:
            activities.append({"type": "order", "product": o.get("product", ""), "status": o.get("status", ""), "email": o.get("email", ""), "time": o.get("created_at", "")})
        recent_msgs = await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
        for m in recent_msgs:
            activities.append({"type": "message", "name": m.get("name", ""), "subject": m.get("subject", ""), "time": m.get("created_at", "")})
        activities.sort(key=lambda x: x.get("time", ""), reverse=True)
        return {"activities": activities[:15]}

    return ceo_router
