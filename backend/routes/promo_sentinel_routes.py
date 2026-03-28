"""
MANOPROTECT - Promoción Sentinel S TikTok
100 Sentinel S gratis para los primeros 100 suscriptores (mensual o anual)
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
import logging
import stripe
import os
import uuid
import secrets
import string

from core.database import db, get_current_user, STRIPE_API_KEY
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest
)

stripe.api_key = STRIPE_API_KEY

router = APIRouter(prefix="/promo", tags=["Promociones"])
logger = logging.getLogger(__name__)

PROMO_TOTAL = 100
PROMO_PLANS = {
    "sentinel-promo-monthly": {
        "amount": 49.99,
        "name": "Plan Familiar Mensual + Sentinel S GRATIS",
        "period": "mes"
    },
    "sentinel-promo-yearly": {
        "amount": 499.99,
        "name": "Plan Familiar Anual + Sentinel S GRATIS",
        "period": "año"
    }
}


def generate_gift_code():
    chars = string.ascii_uppercase + string.digits
    return f"SENTINEL-{''.join(secrets.choice(chars) for _ in range(8))}"


class PromoCheckoutRequest(BaseModel):
    plan_type: str
    origin_url: str
    email: str = ""


class ShippingFormRequest(BaseModel):
    order_id: str
    nombre_completo: str
    telefono: str
    direccion: str
    codigo_postal: str
    ciudad: str
    provincia: str
    pais: str = "España"
    notas: str = ""


class TrackingUpdateRequest(BaseModel):
    tracking_number: str
    carrier: str = "Correos"
    status: str = "enviado"


# ============================
# PUBLIC ENDPOINTS
# ============================

@router.get("/sentinel-s/status")
async def get_promo_status():
    """Get current promo status - how many remaining"""
    claimed = await db.promo_sentinel_orders.count_documents({"status": {"$ne": "canceled"}})
    return {
        "total": PROMO_TOTAL,
        "claimed": min(claimed, PROMO_TOTAL),
        "remaining": max(0, PROMO_TOTAL - claimed),
        "active": (PROMO_TOTAL - claimed) > 0,
        "shipping_days": 60
    }


@router.post("/sentinel-s/checkout")
async def create_promo_checkout(
    data: PromoCheckoutRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout for promo subscription"""
    remaining = await db.promo_sentinel_orders.count_documents({"status": {"$ne": "canceled"}})
    if remaining >= PROMO_TOTAL:
        raise HTTPException(status_code=410, detail="Promoción agotada. Las 100 unidades han sido reclamadas.")

    plan = PROMO_PLANS.get(data.plan_type)
    if not plan:
        raise HTTPException(status_code=400, detail="Plan no válido. Elige sentinel-promo-monthly o sentinel-promo-yearly")

    user = await get_current_user(http_request, session_token)
    user_id = user.user_id if user else f"promo_{uuid.uuid4().hex[:12]}"
    user_email = user.email if user else data.email

    if user_email:
        existing = await db.promo_sentinel_orders.find_one({
            "email": user_email,
            "status": {"$ne": "canceled"}
        })
        if existing:
            raise HTTPException(status_code=409, detail="Ya tienes una promoción activa. Solo una por usuario.")

    order_id = f"PROMO-{uuid.uuid4().hex[:10].upper()}"
    gift_code = generate_gift_code()

    success_url = f"{data.origin_url}/promo/sentinel-s/gracias?order_id={order_id}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/?promo_canceled=true#promo-sentinel"

    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_request = CheckoutSessionRequest(
        amount=plan["amount"],
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "promo": "sentinel-s-tiktok",
            "order_id": order_id,
            "gift_code": gift_code,
            "user_id": user_id,
            "email": user_email,
            "plan_type": data.plan_type,
            "plan_name": plan["name"]
        }
    )

    session = await stripe_checkout.create_checkout_session(checkout_request)

    await db.promo_sentinel_orders.insert_one({
        "order_id": order_id,
        "gift_code": gift_code,
        "session_id": session.session_id,
        "user_id": user_id,
        "email": user_email,
        "plan_type": data.plan_type,
        "plan_name": plan["name"],
        "amount": plan["amount"],
        "status": "pending_payment",
        "shipping": None,
        "tracking": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "order_id": order_id,
        "gift_code": gift_code
    }


@router.get("/sentinel-s/order/{order_id}")
async def get_promo_order(order_id: str):
    """Get promo order details"""
    order = await db.promo_sentinel_orders.find_one(
        {"order_id": order_id},
        {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return order


@router.post("/sentinel-s/confirm/{order_id}")
async def confirm_promo_order(order_id: str, http_request: Request):
    """Confirm order after successful Stripe payment"""
    order = await db.promo_sentinel_orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if order.get("status") == "paid":
        return {"message": "Pedido ya confirmado", "order_id": order_id, "gift_code": order.get("gift_code")}

    await db.promo_sentinel_orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": "paid",
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {
        "message": "Pago confirmado. Sentinel S reservado.",
        "order_id": order_id,
        "gift_code": order.get("gift_code")
    }


@router.post("/sentinel-s/shipping")
async def submit_shipping_form(data: ShippingFormRequest):
    """Submit shipping address for Sentinel S delivery"""
    order = await db.promo_sentinel_orders.find_one({"order_id": data.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if order.get("status") not in ("paid", "pending_shipping"):
        raise HTTPException(status_code=400, detail="El pedido no está confirmado aún")

    shipping = {
        "nombre_completo": data.nombre_completo,
        "telefono": data.telefono,
        "direccion": data.direccion,
        "codigo_postal": data.codigo_postal,
        "ciudad": data.ciudad,
        "provincia": data.provincia,
        "pais": data.pais,
        "notas": data.notas,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    await db.promo_sentinel_orders.update_one(
        {"order_id": data.order_id},
        {"$set": {
            "shipping": shipping,
            "status": "pending_shipping",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    await db.admin_notifications.insert_one({
        "type": "promo_sentinel_order",
        "title": f"Nuevo pedido Sentinel S: {data.nombre_completo}",
        "message": f"Nuevo pedido promo TikTok #{data.order_id}. Dirección: {data.direccion}, {data.codigo_postal} {data.ciudad} ({data.provincia}). Tel: {data.telefono}",
        "order_id": data.order_id,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"message": "Dirección de envío guardada. Recibirás tu Sentinel S en un plazo máximo de 60 días.", "order_id": data.order_id}


# ============================
# ADMIN ENDPOINTS
# ============================

@router.get("/sentinel-s/admin/orders")
async def get_all_promo_orders(http_request: Request, session_token: Optional[str] = Cookie(None)):
    """Admin: get all promo orders"""
    orders = await db.promo_sentinel_orders.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    stats = {
        "total_orders": len(orders),
        "paid": sum(1 for o in orders if o.get("status") in ("paid", "pending_shipping", "shipped", "delivered")),
        "pending_shipping": sum(1 for o in orders if o.get("status") == "pending_shipping"),
        "shipped": sum(1 for o in orders if o.get("status") == "shipped"),
        "delivered": sum(1 for o in orders if o.get("status") == "delivered"),
        "remaining": max(0, PROMO_TOTAL - len([o for o in orders if o.get("status") != "canceled"]))
    }

    return {"orders": orders, "stats": stats}


@router.get("/sentinel-s/admin/notifications")
async def get_admin_notifications():
    """Admin: get unread notifications"""
    notifications = await db.admin_notifications.find(
        {"type": "promo_sentinel_order", "read": False},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"notifications": notifications, "count": len(notifications)}


@router.put("/sentinel-s/admin/notifications/read")
async def mark_notifications_read():
    """Admin: mark all notifications as read"""
    await db.admin_notifications.update_many(
        {"type": "promo_sentinel_order", "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "Notificaciones marcadas como leídas"}


@router.put("/sentinel-s/admin/orders/{order_id}/tracking")
async def update_order_tracking(order_id: str, data: TrackingUpdateRequest):
    """Admin: update shipping tracking"""
    order = await db.promo_sentinel_orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    tracking = {
        "tracking_number": data.tracking_number,
        "carrier": data.carrier,
        "status": data.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    new_status = "shipped" if data.status == "enviado" else ("delivered" if data.status == "entregado" else order.get("status"))

    await db.promo_sentinel_orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "tracking": tracking,
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {"message": f"Tracking actualizado: {data.tracking_number}", "status": new_status}


# ============================
# TIKTOK PROMO CODES
# ============================

@router.get("/tiktok-codes")
async def get_tiktok_codes():
    """Get all TikTok promo codes with their status"""
    codes = await db.promo_codes.find(
        {"type": "tiktok_sentinel_s"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    total = len(codes)
    used = sum(1 for c in codes if c.get("used"))
    return {
        "total": total,
        "used": used,
        "available": total - used,
        "codes": codes
    }

@router.post("/tiktok-codes/validate")
async def validate_tiktok_code(data: dict):
    """Validate a TikTok promo code"""
    code = data.get("code", "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Codigo requerido")
    
    promo = await db.promo_codes.find_one({"code": code, "type": "tiktok_sentinel_s"})
    if not promo:
        raise HTTPException(status_code=404, detail="Codigo no valido")
    if promo.get("used"):
        raise HTTPException(status_code=400, detail="Este codigo ya ha sido utilizado")
    
    return {"valid": True, "code": code, "description": promo.get("discount_description", "")}

@router.post("/tiktok-codes/redeem")
async def redeem_tiktok_code(data: dict):
    """Redeem a TikTok promo code"""
    code = data.get("code", "").strip().upper()
    email = data.get("email", "").strip()
    
    if not code or not email:
        raise HTTPException(status_code=400, detail="Codigo y email requeridos")
    
    promo = await db.promo_codes.find_one({"code": code, "type": "tiktok_sentinel_s"})
    if not promo:
        raise HTTPException(status_code=404, detail="Codigo no valido")
    if promo.get("used"):
        raise HTTPException(status_code=400, detail="Este codigo ya ha sido utilizado")
    
    await db.promo_codes.update_one(
        {"code": code},
        {"$set": {
            "used": True,
            "used_by": email,
            "used_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Codigo canjeado correctamente. Tu Sentinel S sera enviado con tu suscripcion."}


# ============================
# ESCUDO VECINAL DYNAMIC COUNTER
# ============================

async def seed_tiktok_promo_codes():
    """Ensure 100 TikTok promo codes exist in the database"""
    existing = await db.promo_codes.count_documents({"type": "tiktok_sentinel_s"})
    if existing >= 100:
        return {"message": f"Already have {existing} codes", "created": 0}
    
    codes_to_create = 100 - existing
    new_codes = []
    existing_codes = set()
    async for doc in db.promo_codes.find({"type": "tiktok_sentinel_s"}, {"code": 1, "_id": 0}):
        existing_codes.add(doc["code"])
    
    while len(new_codes) < codes_to_create:
        chars = string.ascii_uppercase + string.digits
        code = f"TIKTOK-{''.join(secrets.choice(chars) for _ in range(6))}"
        if code not in existing_codes:
            existing_codes.add(code)
            new_codes.append({
                "code": code,
                "type": "tiktok_sentinel_s",
                "discount_description": "Sentinel S GRATIS con suscripcion ManoProtect",
                "used": False,
                "used_by": None,
                "used_at": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    
    if new_codes:
        await db.promo_codes.insert_many(new_codes)
    
    return {"message": f"Created {len(new_codes)} codes. Total: {existing + len(new_codes)}", "created": len(new_codes)}


@router.get("/escudo-vecinal/status")
async def get_escudo_vecinal_status():
    """Get dynamic counter for Escudo Vecinal promo"""
    ESCUDO_TOTAL = 50
    claimed = await db.escudo_vecinal_subs.count_documents({"status": {"$ne": "canceled"}})
    return {
        "total": ESCUDO_TOTAL,
        "claimed": min(claimed, ESCUDO_TOTAL),
        "remaining": max(0, ESCUDO_TOTAL - claimed),
        "active": (ESCUDO_TOTAL - claimed) > 0,
        "discount_percent": 20,
        "price_original": 299.99,
        "price_discounted": 239.99,
        "max_neighbors": 10
    }
