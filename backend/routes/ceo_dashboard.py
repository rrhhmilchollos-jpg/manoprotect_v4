"""
ManoProtect CEO Dashboard API Routes - COMPLETE ENTERPRISE EDITION
Full admin control: dashboard, inventory, users, memberships, payments, refunds, security, notifications
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, Body
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel

ceo_router = APIRouter(prefix="/ceo", tags=["CEO Dashboard"])


class RefundActionRequest(BaseModel):
    action: str  # "approve" or "reject"
    reason: str = ""


class InventoryItem(BaseModel):
    product: str
    serial_number: str = ""
    status: str = "in_stock"
    location: str = "Almacén Madrid"


class MembershipUpdate(BaseModel):
    plan_type: str
    discount_pct: int = 0


def init_ceo_routes(db, require_admin_fn):
    """Initialize CEO dashboard routes with database connection"""

    PROMO_CONFIG = {
        "basic_stock_total": 50,
        "promo_200_discount_pct": 20,
        "promo_200_total": 200,
    }

    # ═══════════════════════════════════════════
    # DASHBOARD STATS
    # ═══════════════════════════════════════════

    @ceo_router.get("/stats")
    async def get_dashboard_stats(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        total_users = await db["users"].count_documents({})
        users_today = await db["users"].count_documents({"created_at": {"$gte": today_start.isoformat()}})
        users_month = await db["users"].count_documents({"created_at": {"$gte": month_start.isoformat()}})
        active_subs = await db["subscriptions"].count_documents({"status": "active"})
        monthly_subs = await db["subscriptions"].count_documents({"status": "active", "plan_type": {"$regex": "monthly"}})
        yearly_subs = await db["subscriptions"].count_documents({"status": "active", "plan_type": {"$regex": "yearly"}})
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

        # Revenue calculations
        revenue_pipeline = [
            {"$match": {"payment_status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        rev_result = await db["payment_transactions"].aggregate(revenue_pipeline).to_list(1)
        total_revenue = rev_result[0]["total"] if rev_result else 0

        # Revenue today
        rev_today_pipeline = [
            {"$match": {"payment_status": "paid", "created_at": {"$gte": today_start.isoformat()}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        rev_today = await db["payment_transactions"].aggregate(rev_today_pipeline).to_list(1)
        revenue_today = rev_today[0]["total"] if rev_today else 0

        # Revenue this month
        rev_month_pipeline = [
            {"$match": {"payment_status": "paid", "created_at": {"$gte": month_start.isoformat()}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        rev_month = await db["payment_transactions"].aggregate(rev_month_pipeline).to_list(1)
        revenue_month = rev_month[0]["total"] if rev_month else 0

        # Inventory counts
        inv_x = await db["inventory"].count_documents({"product": "sentinel_x", "status": "in_stock"})
        inv_j = await db["inventory"].count_documents({"product": "sentinel_j", "status": "in_stock"})
        inv_s = await db["inventory"].count_documents({"product": "sentinel_s", "status": "in_stock"})

        # Failed payments
        failed_payments = await db["payment_transactions"].count_documents({"payment_status": "failed"})

        # Expiring subs (next 7 days)
        week_from_now = (now + timedelta(days=7)).isoformat()
        expiring_subs = await db["subscriptions"].count_documents({
            "status": "active",
            "expires_at": {"$lte": week_from_now, "$gte": now.isoformat()}
        })

        return {
            "users": {"total": total_users, "today": users_today, "this_month": users_month},
            "subscriptions": {"active": active_subs, "monthly": monthly_subs, "yearly": yearly_subs, "expiring_soon": expiring_subs},
            "orders": {"total": total_orders, "pending": pending_orders},
            "refunds": {"total": total_refunds, "pending": pending_refunds},
            "promo": {
                "basic_stock_remaining": basic_remaining,
                "basic_stock_total": PROMO_CONFIG["basic_stock_total"],
                "promo_200_remaining": promo_remaining,
                "promo_200_total": PROMO_CONFIG["promo_200_total"],
                "discount_pct": PROMO_CONFIG["promo_200_discount_pct"],
            },
            "revenue": {"mrr": round(mrr, 2), "today": round(revenue_today, 2), "month": round(revenue_month, 2), "total": round(total_revenue, 2)},
            "messages": {"total": contact_msgs, "unread": unread_msgs},
            "inventory": {"sentinel_x": inv_x, "sentinel_j": inv_j, "sentinel_s": inv_s},
            "alerts": {
                "low_stock": (inv_x + inv_j + inv_s) < 10,
                "pending_refunds": pending_refunds > 0,
                "failed_payments": failed_payments,
                "expiring_subs": expiring_subs,
            },
        }

    # ═══════════════════════════════════════════
    # CHART DATA
    # ═══════════════════════════════════════════

    @ceo_router.get("/chart-data")
    async def get_chart_data(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        now = datetime.now(timezone.utc)

        # Users per month (last 6 months)
        users_by_month = []
        for i in range(5, -1, -1):
            m = now.month - i
            y = now.year
            if m <= 0:
                m += 12
                y -= 1
            start = datetime(y, m, 1, tzinfo=timezone.utc).isoformat()
            if m == 12:
                end = datetime(y + 1, 1, 1, tzinfo=timezone.utc).isoformat()
            else:
                end = datetime(y, m + 1, 1, tzinfo=timezone.utc).isoformat()
            count = await db["users"].count_documents({"created_at": {"$gte": start, "$lt": end}})
            month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            users_by_month.append({"month": month_names[m - 1], "users": count})

        # Plan distribution
        plans = {}
        for plan_name in ["free", "family-monthly", "family-yearly", "enterprise"]:
            plans[plan_name] = await db["users"].count_documents({"plan": plan_name})
        other_plans = await db["users"].count_documents({"plan": {"$nin": list(plans.keys())}})
        plan_dist = [{"name": k.replace("-", " ").title(), "value": v} for k, v in plans.items() if v > 0]
        if other_plans > 0:
            plan_dist.append({"name": "Otros", "value": other_plans})

        # Revenue by month (last 6 months)
        revenue_by_month = []
        for i in range(5, -1, -1):
            m = now.month - i
            y = now.year
            if m <= 0:
                m += 12
                y -= 1
            start = datetime(y, m, 1, tzinfo=timezone.utc).isoformat()
            if m == 12:
                end = datetime(y + 1, 1, 1, tzinfo=timezone.utc).isoformat()
            else:
                end = datetime(y, m + 1, 1, tzinfo=timezone.utc).isoformat()
            pipeline = [
                {"$match": {"payment_status": "paid", "created_at": {"$gte": start, "$lt": end}}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            result = await db["payment_transactions"].aggregate(pipeline).to_list(1)
            month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            revenue_by_month.append({"month": month_names[m - 1], "revenue": round(result[0]["total"], 2) if result else 0})

        return {
            "users_by_month": users_by_month,
            "plan_distribution": plan_dist,
            "revenue_by_month": revenue_by_month,
        }

    # ═══════════════════════════════════════════
    # USERS
    # ═══════════════════════════════════════════

    @ceo_router.get("/users")
    async def list_users(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20, search: str = ""):
        await require_admin_fn(request, session_token)
        query = {}
        if search:
            query = {"$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}},
                {"user_id": {"$regex": search, "$options": "i"}},
            ]}
        total = await db["users"].count_documents(query)
        users = await db["users"].find(query, {"_id": 0, "password": 0, "password_hash": 0, "hashed_password": 0, "session_token": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"users": users, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.patch("/users/{user_id}/plan")
    async def update_user_plan(user_id: str, request: Request, session_token: Optional[str] = Cookie(None), body: MembershipUpdate = Body(...)):
        await require_admin_fn(request, session_token)
        user = await db["users"].find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        now = datetime.now(timezone.utc)
        discount_text = f" (-{body.discount_pct}%)" if body.discount_pct > 0 else ""
        await db["users"].update_one({"user_id": user_id}, {"$set": {
            "plan": body.plan_type,
            "subscription_status": "active" if body.plan_type != "free" else None,
            "plan_updated_at": now.isoformat(),
            "plan_updated_by": "ceo_dashboard",
        }})
        await db["admin_logs"].insert_one({
            "action": "plan_change",
            "user_id": user_id,
            "old_plan": user.get("plan", "free"),
            "new_plan": body.plan_type + discount_text,
            "changed_by": "ceo_dashboard",
            "created_at": now.isoformat()
        })
        return {"success": True, "message": f"Plan actualizado a {body.plan_type}{discount_text}"}

    @ceo_router.patch("/users/{user_id}/suspend")
    async def suspend_user(user_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        user = await db["users"].find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        new_status = not user.get("is_active", True)
        await db["users"].update_one({"user_id": user_id}, {"$set": {"is_active": new_status}})
        return {"success": True, "is_active": new_status, "message": "Cuenta activada" if new_status else "Cuenta suspendida"}

    # ═══════════════════════════════════════════
    # SUBSCRIPTIONS / MEMBERSHIPS
    # ═══════════════════════════════════════════

    @ceo_router.get("/subscriptions")
    async def list_subscriptions(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["subscriptions"].count_documents({})
        subs = await db["subscriptions"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"subscriptions": subs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    # ═══════════════════════════════════════════
    # ORDERS
    # ═══════════════════════════════════════════

    @ceo_router.get("/orders")
    async def list_orders(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["orders"].count_documents({})
        orders = await db["orders"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"orders": orders, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    # ═══════════════════════════════════════════
    # REFUNDS with approve/reject
    # ═══════════════════════════════════════════

    @ceo_router.get("/payments")
    async def list_payments(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["payment_transactions"].count_documents({})
        payments = await db["payment_transactions"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"payments": payments, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/refunds")
    async def list_refunds(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["refunds"].count_documents({})
        refunds = await db["refunds"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"refunds": refunds, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.patch("/refunds/{refund_id}")
    async def process_refund(refund_id: str, request: Request, session_token: Optional[str] = Cookie(None), body: RefundActionRequest = Body(...)):
        await require_admin_fn(request, session_token)
        new_status = "approved" if body.action == "approve" else "rejected"
        result = await db["refunds"].update_one(
            {"refund_id": refund_id},
            {"$set": {"status": new_status, "processed_at": datetime.now(timezone.utc).isoformat(), "admin_reason": body.reason}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Reembolso no encontrado")
        return {"success": True, "status": new_status}

    # ═══════════════════════════════════════════
    # MESSAGES
    # ═══════════════════════════════════════════

    @ceo_router.get("/messages")
    async def list_messages(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 20):
        await require_admin_fn(request, session_token)
        total = await db["contact_messages"].count_documents({})
        msgs = await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"messages": msgs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.patch("/messages/{msg_id}/read")
    async def mark_message_read(msg_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        await db["contact_messages"].update_one({"message_id": msg_id}, {"$set": {"status": "read"}})
        return {"success": True}

    # ═══════════════════════════════════════════
    # INVENTORY
    # ═══════════════════════════════════════════

    @ceo_router.get("/inventory")
    async def list_inventory(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 50, product: str = "", status: str = ""):
        await require_admin_fn(request, session_token)
        query = {}
        if product:
            query["product"] = product
        if status:
            query["status"] = status
        total = await db["inventory"].count_documents(query)
        items = await db["inventory"].find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"items": items, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.post("/inventory")
    async def add_inventory_item(request: Request, session_token: Optional[str] = Cookie(None), body: InventoryItem = Body(...)):
        await require_admin_fn(request, session_token)
        import uuid
        item = {
            "item_id": f"INV-{uuid.uuid4().hex[:8].upper()}",
            "product": body.product,
            "serial_number": body.serial_number or f"SN-{uuid.uuid4().hex[:10].upper()}",
            "status": body.status,
            "location": body.location,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db["inventory"].insert_one(item)
        return {"success": True, "item_id": item["item_id"]}

    @ceo_router.patch("/inventory/{item_id}")
    async def update_inventory_item(item_id: str, request: Request, session_token: Optional[str] = Cookie(None), body: InventoryItem = Body(...)):
        await require_admin_fn(request, session_token)
        result = await db["inventory"].update_one(
            {"item_id": item_id},
            {"$set": {"status": body.status, "location": body.location, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item no encontrado")
        return {"success": True}

    # ═══════════════════════════════════════════
    # SECURITY / ACTIVITY LOGS
    # ═══════════════════════════════════════════

    @ceo_router.get("/security-logs")
    async def get_security_logs(request: Request, session_token: Optional[str] = Cookie(None), page: int = 1, limit: int = 50):
        await require_admin_fn(request, session_token)
        total = await db["admin_logs"].count_documents({})
        logs = await db["admin_logs"].find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
        return {"logs": logs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

    @ceo_router.get("/security-overview")
    async def get_security_overview(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        admin_users = await db["users"].find({"role": {"$in": ["admin", "superadmin"]}}, {"_id": 0, "password_hash": 0, "hashed_password": 0}).to_list(50)
        twofa_enabled = await db["users"].count_documents({"two_factor_enabled": True})
        failed_logins = await db["admin_logs"].count_documents({"action": "failed_login"})
        return {
            "admin_users": [{"email": u.get("email"), "role": u.get("role"), "name": u.get("name", "")} for u in admin_users],
            "two_factor_enabled_count": twofa_enabled,
            "failed_login_attempts": failed_logins,
            "total_admins": len(admin_users),
        }

    # ═══════════════════════════════════════════
    # NOTIFICATIONS (Real-time polling)
    # ═══════════════════════════════════════════

    @ceo_router.get("/notifications")
    async def get_notifications(request: Request, session_token: Optional[str] = Cookie(None), since: str = ""):
        await require_admin_fn(request, session_token)
        query = {"dismissed": {"$ne": True}}
        if since:
            query["created_at"] = {"$gt": since}
        notifications = await db["ceo_notifications"].find(query, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)

        # Auto-generate notifications from recent events if none exist
        if not notifications and not since:
            now = datetime.now(timezone.utc)
            auto_notifs = []
            pending_refunds = await db["refunds"].count_documents({"status": "pending"})
            if pending_refunds > 0:
                auto_notifs.append({"type": "refund", "title": f"{pending_refunds} reembolso(s) pendiente(s)", "severity": "warning", "created_at": now.isoformat()})
            unread_msgs = await db["contact_messages"].count_documents({"status": "new"})
            if unread_msgs > 0:
                auto_notifs.append({"type": "message", "title": f"{unread_msgs} mensaje(s) sin leer", "severity": "info", "created_at": now.isoformat()})
            failed = await db["payment_transactions"].count_documents({"payment_status": "failed"})
            if failed > 0:
                auto_notifs.append({"type": "payment_failed", "title": f"{failed} pago(s) fallido(s)", "severity": "error", "created_at": now.isoformat()})
            # Recent new users
            day_ago = (now - timedelta(days=1)).isoformat()
            new_users = await db["users"].count_documents({"created_at": {"$gte": day_ago}})
            if new_users > 0:
                auto_notifs.append({"type": "new_user", "title": f"{new_users} nuevo(s) usuario(s) en 24h", "severity": "success", "created_at": now.isoformat()})
            return {"notifications": auto_notifs}

        return {"notifications": notifications}

    @ceo_router.post("/notifications/dismiss")
    async def dismiss_notification(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        await db["ceo_notifications"].update_many({}, {"$set": {"dismissed": True}})
        return {"success": True}

    # ═══════════════════════════════════════════
    # ACTIVITY FEED
    # ═══════════════════════════════════════════

    @ceo_router.get("/activity")
    async def get_recent_activity(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        activities = []
        for u in await db["users"].find({}, {"_id": 0, "password": 0, "password_hash": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "new_user", "email": u.get("email", ""), "name": u.get("name", u.get("full_name", "")), "time": u.get("created_at", "")})
        for o in await db["orders"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "order", "product": o.get("product", ""), "status": o.get("status", ""), "email": o.get("email", ""), "time": o.get("created_at", "")})
        for m in await db["contact_messages"].find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "message", "name": m.get("name", ""), "subject": m.get("subject", ""), "time": m.get("created_at", "")})
        for p in await db["payment_transactions"].find({"payment_status": "paid"}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5):
            activities.append({"type": "payment", "email": p.get("email", ""), "amount": p.get("amount", 0), "plan": p.get("plan_type", ""), "time": p.get("created_at", "")})
        activities.sort(key=lambda x: x.get("time", ""), reverse=True)
        return {"activities": activities[:20]}

    # ═══════════════════════════════════════════
    # PROMO STATUS (Public)
    # ═══════════════════════════════════════════

    @ceo_router.get("/promo-status")
    async def get_promo_status():
        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        promo_users = await db["subscriptions"].count_documents({"promo_200": True})
        return {
            "basic_stock_remaining": max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed),
            "basic_stock_total": PROMO_CONFIG["basic_stock_total"],
            "promo_200_remaining": max(0, PROMO_CONFIG["promo_200_total"] - promo_users),
            "promo_200_total": PROMO_CONFIG["promo_200_total"],
            "discount_pct": PROMO_CONFIG["promo_200_discount_pct"],
        }

    @ceo_router.post("/claim-sentinel-basic")
    async def claim_sentinel_basic(request: Request, session_token: Optional[str] = Cookie(None)):
        from core.auth import get_current_user
        user = await get_current_user(request, session_token)
        active_sub = await db["subscriptions"].find_one({"user_id": user.user_id, "status": "active"})
        if not active_sub:
            raise HTTPException(status_code=403, detail="Necesitas una suscripción activa")
        existing_claim = await db["orders"].find_one({"user_id": user.user_id, "product": "sentinel_x_basic"})
        if existing_claim:
            raise HTTPException(status_code=409, detail="Ya has reclamado tu Sentinel X Basic")
        basic_claimed = await db["orders"].count_documents({"product": "sentinel_x_basic"})
        if basic_claimed >= PROMO_CONFIG["basic_stock_total"]:
            raise HTTPException(status_code=410, detail="Todas las unidades han sido reclamadas")
        await db["orders"].insert_one({
            "user_id": user.user_id, "email": user.email,
            "product": "sentinel_x_basic", "product_name": "Sentinel X Basic",
            "price": 0, "status": "pending", "promo_free": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "remaining": max(0, PROMO_CONFIG["basic_stock_total"] - basic_claimed - 1)}

    # ═══════════════════════════════════════════
    # EXPORT (CSV)
    # ═══════════════════════════════════════════

    @ceo_router.get("/export/users")
    async def export_users_csv(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        import csv, io
        users = await db["users"].find({}, {"_id": 0, "password_hash": 0, "hashed_password": 0, "session_token": 0}).to_list(10000)
        output = io.StringIO()
        if users:
            writer = csv.DictWriter(output, fieldnames=["email", "name", "role", "plan", "created_at", "is_active"])
            writer.writeheader()
            for u in users:
                writer.writerow({k: u.get(k, "") for k in ["email", "name", "role", "plan", "created_at", "is_active"]})
        from fastapi.responses import Response
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=usuarios_manoprotect.csv"})

    @ceo_router.get("/export/payments")
    async def export_payments_csv(request: Request, session_token: Optional[str] = Cookie(None)):
        await require_admin_fn(request, session_token)
        import csv, io
        payments = await db["payment_transactions"].find({}, {"_id": 0}).to_list(10000)
        output = io.StringIO()
        if payments:
            writer = csv.DictWriter(output, fieldnames=["email", "plan_type", "amount", "payment_status", "created_at"])
            writer.writeheader()
            for p in payments:
                writer.writerow({k: p.get(k, "") for k in ["email", "plan_type", "amount", "payment_status", "created_at"]})
        from fastapi.responses import Response
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=pagos_manoprotect.csv"})

    return ceo_router
