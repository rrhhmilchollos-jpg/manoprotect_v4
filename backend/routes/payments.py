"""
ManoProtect - Payment System with Stripe
Handles:
- Device SOS orders (one-time payment with scalable shipping)
- Subscription plans with 7-day trial
- Card validation (no prepaid cards)
- Auto-charge after trial
- Downgrade to basic on cancellation
- Device verification codes (generated on subscription payment confirmation)
"""
import os
import secrets
import string
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from dotenv import load_dotenv
import stripe
from pymongo import MongoClient

load_dotenv()

router = APIRouter(prefix="/payments", tags=["Payments"])

# Stripe Configuration
stripe.api_key = os.environ.get("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# ==================== DEVICE VERIFICATION CODE SYSTEM ====================

def generate_device_code() -> str:
    """Generate a unique verification code for device orders (format: MP-XXXX-XXXX)"""
    chars = string.ascii_uppercase + string.digits
    part1 = ''.join(secrets.choice(chars) for _ in range(4))
    part2 = ''.join(secrets.choice(chars) for _ in range(4))
    return f"MP-{part1}-{part2}"

def create_device_verification_code(user_id: str, user_email: str, plan_id: str, subscription_id: str) -> str:
    """Create and store a device verification code for a user after successful subscription payment"""
    code = generate_device_code()
    
    # Store the code
    db.device_verification_codes.insert_one({
        "code": code,
        "user_id": user_id,
        "user_email": user_email,
        "plan_id": plan_id,
        "subscription_id": subscription_id,
        "status": "active",  # active, used, expired
        "max_devices": 5 if "famil" in plan_id.lower() else 1,
        "devices_ordered": 0,
        "created_at": datetime.now(timezone.utc),
        "used_at": None,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=365)  # Valid for 1 year
    })
    
    return code

# ==================== PRICING PACKAGES ====================
# SECURITY: All prices defined server-side only

# Shipping costs - AHORA GRATIS
SHIPPING_COSTS = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0
}

def get_shipping_cost(quantity: int) -> float:
    """Get shipping cost based on quantity - NOW FREE"""
    return 0  # Envío GRATIS

SUBSCRIPTION_PLANS = {
    "individual": {
        "name": "Plan Individual",
        "monthly_price": 29.99,
        "yearly_price": 249.99,
        "trial_days": 7,
        "features": ["Protección 24/7", "Análisis ilimitados", "1 Dispositivo SOS GRATIS", "Soporte 24/7"],
        "max_devices": 1,
        "max_members": 1
    },
    "familiar": {
        "name": "Plan Familiar", 
        "monthly_price": 49.99,
        "yearly_price": 399.99,
        "trial_days": 7,
        "features": ["Todo de Individual", "Hasta 5 miembros", "5 Dispositivos SOS GRATIS", "Panel familiar"],
        "max_devices": 5,
        "max_members": 5
    }
}

# ==================== MODELS ====================

class DeviceOrderRequest(BaseModel):
    quantity: int = Field(ge=1, le=10)
    colors: List[str]  # Array of colors, one per device
    device_style: str = "adulto"  # juvenil, adulto, senior
    shipping: Dict
    origin_url: str

class SubscriptionRequest(BaseModel):
    plan_id: str
    billing_cycle: str = "yearly"  # yearly or monthly
    origin_url: str

class CancelSubscriptionRequest(BaseModel):
    user_id: str

# ==================== HELPER FUNCTIONS ====================

def validate_card_not_prepaid(payment_method_id: str) -> bool:
    """Check if card is prepaid and reject if so"""
    try:
        pm = stripe.PaymentMethod.retrieve(payment_method_id)
        if pm.card and pm.card.funding == "prepaid":
            return False
        return True
    except Exception:
        return True

def create_or_update_subscription_db(user_id: str, plan_id: str, stripe_subscription_id: str, status: str):
    """Create or update user subscription in database"""
    subscription_data = {
        "user_id": user_id,
        "plan_id": plan_id,
        "stripe_subscription_id": stripe_subscription_id,
        "status": status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    existing = db.subscriptions.find_one({"user_id": user_id})
    if existing:
        db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": subscription_data}
        )
    else:
        subscription_data["created_at"] = datetime.now(timezone.utc)
        db.subscriptions.insert_one(subscription_data)

def downgrade_to_basic(user_id: str):
    """Downgrade user to basic free plan"""
    db.subscriptions.update_one(
        {"user_id": user_id},
        {"$set": {
            "plan_id": "basic",
            "status": "active",
            "stripe_subscription_id": None,
            "downgraded_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )

# ==================== DEVICE ORDER ENDPOINTS ====================

@router.post("/device/checkout")
async def create_device_checkout(order: DeviceOrderRequest):
    """Create checkout session for SOS device order (shipping only, scalable by quantity)"""
    try:
        origin_url = order.origin_url
        success_url = f"{origin_url}/pedido-confirmado?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/pedido-confirmado?payment=cancelled"
        
        # Calculate shipping cost based on quantity (escalates)
        shipping_price = get_shipping_cost(order.quantity)
        
        # Format colors for description
        colors_desc = ", ".join(order.colors[:3])
        if len(order.colors) > 3:
            colors_desc += f" (+{len(order.colors) - 3} más)"
        
        # Create Stripe checkout session for shipping
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': int(shipping_price * 100),  # Convert to cents
                    'product_data': {
                        'name': f'Envío Dispositivo SOS ManoProtect x{order.quantity}',
                        'description': f'Envío Express 24-48h - Colores: {colors_desc} - Estilo: {order.device_style}',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'type': 'device_order',
                'quantity': str(order.quantity),
                'colors': ','.join(order.colors),
                'device_style': order.device_style,
                'shipping_name': order.shipping.get('fullName', ''),
                'shipping_phone': order.shipping.get('phone', ''),
                'shipping_address': order.shipping.get('address', ''),
                'shipping_city': order.shipping.get('city', ''),
                'shipping_postal': order.shipping.get('postalCode', ''),
                'shipping_province': order.shipping.get('province', '')
            }
        )
        
        # Save pending transaction
        db.payment_transactions.insert_one({
            "session_id": session.id,
            "type": "device_order",
            "amount": shipping_price,
            "currency": "eur",
            "quantity": order.quantity,
            "colors": order.colors,
            "device_style": order.device_style,
            "shipping": order.shipping,
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"url": session.url, "session_id": session.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/device/status/{session_id}")
async def get_device_payment_status(session_id: str):
    """Get payment status for device order"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Update database
        status_update = {
            "status": session.status,
            "payment_status": session.payment_status,
            "updated_at": datetime.now(timezone.utc)
        }
        
        email_sent = False
        if session.payment_status == "paid":
            status_update["paid_at"] = datetime.now(timezone.utc)
            
            # Create device order record
            transaction = db.payment_transactions.find_one({"session_id": session_id})
            if transaction and not db.device_orders.find_one({"session_id": session_id}):
                # Get shipping cost based on quantity
                quantity = transaction.get("quantity", 1)
                shipping_price = get_shipping_cost(quantity)
                shipping = transaction.get("shipping", {})
                colors = transaction.get("colors", ["plata"])
                device_style = transaction.get("device_style", "adulto")
                
                order_doc = {
                    "session_id": session_id,
                    "quantity": quantity,
                    "colors": colors,
                    "device_style": device_style,
                    "shipping": shipping,
                    "amount_paid": shipping_price,
                    "order_status": "pending_shipment",
                    "tracking_number": None,
                    "carrier": None,
                    "created_at": datetime.now(timezone.utc)
                }
                db.device_orders.insert_one(order_doc)
                
                # Send order confirmation email
                try:
                    from services.email_service import email_service
                    customer_email = session.customer_email or shipping.get('email', '')
                    if customer_email:
                        import asyncio
                        asyncio.create_task(email_service.send_device_order_confirmation(
                            user_id=str(transaction.get("user_id", "")),
                            email=customer_email,
                            order_data={
                                "order_id": session_id,
                                "quantity": quantity,
                                "colors": colors,
                                "device_style": device_style,
                                "shipping": shipping,
                                "total_amount": shipping_price
                            }
                        ))
                        email_sent = True
                except Exception as email_error:
                    print(f"[EMAIL] Error sending confirmation email: {email_error}")
        
        db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": status_update}
        )
        
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount_total": session.amount_total / 100 if session.amount_total else 0,
            "currency": session.currency,
            "email_sent": email_sent
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DEVICE VERIFICATION CODE ENDPOINTS ====================

class VerifyCodeRequest(BaseModel):
    code: str
    user_email: str

class DeviceOrderWithCodeRequest(BaseModel):
    code: str
    quantity: int = Field(ge=1, le=10)
    colors: List[str]
    device_style: str = "adulto"
    shipping: Dict
    user_email: str

@router.post("/device/verify-code")
async def verify_device_code(request: VerifyCodeRequest):
    """Verify if a device purchase code is valid"""
    try:
        code = request.code.upper().strip()
        
        # Find the code
        code_record = db.device_verification_codes.find_one({
            "code": code,
            "user_email": request.user_email,
            "status": "active"
        })
        
        if not code_record:
            # Try without email check in case user_id is different
            code_record = db.device_verification_codes.find_one({
                "code": code,
                "status": "active"
            })
            
            if not code_record:
                return {
                    "valid": False,
                    "error": "Código no válido o ya utilizado"
                }
        
        # Check expiration
        if code_record.get("expires_at") and code_record["expires_at"] < datetime.now(timezone.utc):
            return {
                "valid": False,
                "error": "El código ha expirado"
            }
        
        # Check remaining devices
        max_devices = code_record.get("max_devices", 1)
        devices_ordered = code_record.get("devices_ordered", 0)
        remaining = max_devices - devices_ordered
        
        if remaining <= 0:
            return {
                "valid": False,
                "error": "Ya has solicitado el máximo de dispositivos con este código"
            }
        
        return {
            "valid": True,
            "plan_id": code_record.get("plan_id"),
            "max_devices": max_devices,
            "devices_ordered": devices_ordered,
            "remaining_devices": remaining,
            "created_at": code_record.get("created_at").isoformat() if code_record.get("created_at") else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/device/order-with-code")
async def create_device_order_with_code(request: DeviceOrderWithCodeRequest):
    """Create a device order using verification code (FREE shipping)"""
    try:
        code = request.code.upper().strip()
        
        # Verify code first
        code_record = db.device_verification_codes.find_one({
            "code": code,
            "status": "active"
        })
        
        if not code_record:
            raise HTTPException(status_code=400, detail="Código no válido o ya utilizado")
        
        # Check expiration
        if code_record.get("expires_at") and code_record["expires_at"] < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="El código ha expirado")
        
        # Check remaining devices
        max_devices = code_record.get("max_devices", 1)
        devices_ordered = code_record.get("devices_ordered", 0)
        remaining = max_devices - devices_ordered
        
        if request.quantity > remaining:
            raise HTTPException(
                status_code=400, 
                detail=f"Solo puedes solicitar {remaining} dispositivo(s) más con este código"
            )
        
        # Create the order - FREE (no payment required)
        order_id = f"ORD-{secrets.token_hex(8).upper()}"
        
        order_doc = {
            "order_id": order_id,
            "user_email": request.user_email,
            "user_id": code_record.get("user_id"),
            "verification_code": code,
            "quantity": request.quantity,
            "colors": request.colors,
            "device_style": request.device_style,
            "shipping": request.shipping,
            "order_status": "confirmed",
            "payment_status": "free_with_code",
            "amount_paid": 0,  # FREE shipping
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        db.device_orders.insert_one(order_doc)
        
        # Update the code usage
        db.device_verification_codes.update_one(
            {"code": code},
            {
                "$inc": {"devices_ordered": request.quantity},
                "$set": {"last_used_at": datetime.now(timezone.utc)}
            }
        )
        
        # Mark as used if all devices ordered
        if devices_ordered + request.quantity >= max_devices:
            db.device_verification_codes.update_one(
                {"code": code},
                {"$set": {"status": "fully_used", "used_at": datetime.now(timezone.utc)}}
            )
        
        return {
            "success": True,
            "order_id": order_id,
            "message": "¡Pedido confirmado! Tu dispositivo SOS será enviado pronto.",
            "order": {
                "order_id": order_id,
                "quantity": request.quantity,
                "colors": request.colors,
                "shipping": request.shipping,
                "amount_paid": 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/device/my-code")
async def get_user_device_code(email: str):
    """Get the user's device verification code if they have one"""
    try:
        code_record = db.device_verification_codes.find_one(
            {"user_email": email},
            {"_id": 0, "code": 1, "plan_id": 1, "max_devices": 1, "devices_ordered": 1, "status": 1, "created_at": 1}
        )
        
        if not code_record:
            return {"has_code": False}
        
        return {
            "has_code": True,
            "code": code_record.get("code"),
            "plan_id": code_record.get("plan_id"),
            "max_devices": code_record.get("max_devices", 1),
            "devices_ordered": code_record.get("devices_ordered", 0),
            "status": code_record.get("status"),
            "remaining": code_record.get("max_devices", 1) - code_record.get("devices_ordered", 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/my-orders")
async def get_user_orders(request: Request):
    """Get all orders for the current user"""
    try:
        # Get user from session or return all orders for now
        # In production, this would filter by user_id from auth
        orders = list(db.device_orders.find().sort("created_at", -1).limit(20))
        
        # Serialize orders
        serialized_orders = []
        for order in orders:
            order_dict = {
                "_id": str(order.get("_id", "")),
                "session_id": order.get("session_id", ""),
                "quantity": order.get("quantity", 1),
                "colors": order.get("colors", ["plata"]),
                "device_style": order.get("device_style", "adulto"),
                "shipping": order.get("shipping", {}),
                "order_status": order.get("order_status", "pending_shipment"),
                "tracking_number": order.get("tracking_number"),
                "carrier": order.get("carrier"),
                "amount_paid": order.get("amount_paid", 4.95),
                "created_at": order.get("created_at").isoformat() if order.get("created_at") else None,
                "shipped_at": order.get("shipped_at").isoformat() if order.get("shipped_at") else None,
                "delivered_at": order.get("delivered_at").isoformat() if order.get("delivered_at") else None
            }
            serialized_orders.append(order_dict)
        
        return {"orders": serialized_orders, "total": len(serialized_orders)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SUBSCRIPTION ENDPOINTS ====================

@router.post("/subscription/checkout")
async def create_subscription_checkout(sub_request: SubscriptionRequest):
    """Create checkout for subscription with 7-day trial"""
    try:
        plan = SUBSCRIPTION_PLANS.get(sub_request.plan_id)
        if not plan:
            raise HTTPException(status_code=400, detail="Plan no válido")
        
        # Get price based on billing cycle
        if sub_request.billing_cycle == "yearly":
            price = plan["yearly_price"]
            interval = "year"
        else:
            price = plan["monthly_price"]
            interval = "month"
        
        origin_url = sub_request.origin_url
        success_url = f"{origin_url}/dashboard?subscription=success&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/servicios-sos?tab=planes"
        
        # Create Stripe checkout session with trial
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': int(price * 100),
                    'product_data': {
                        'name': plan["name"],
                        'description': f'Suscripción {sub_request.billing_cycle} con 7 días de prueba gratis',
                    },
                    'recurring': {
                        'interval': interval,
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            subscription_data={
                'trial_period_days': plan["trial_days"],
                'metadata': {
                    'plan_id': sub_request.plan_id,
                    'billing_cycle': sub_request.billing_cycle
                }
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'type': 'subscription',
                'plan_id': sub_request.plan_id,
                'billing_cycle': sub_request.billing_cycle
            },
            payment_method_options={
                'card': {
                    'request_three_d_secure': 'automatic'
                }
            }
        )
        
        # Save pending subscription
        db.payment_transactions.insert_one({
            "session_id": session.id,
            "type": "subscription",
            "plan_id": sub_request.plan_id,
            "billing_cycle": sub_request.billing_cycle,
            "amount": price,
            "currency": "eur",
            "status": "pending",
            "payment_status": "initiated",
            "trial_ends_at": datetime.now(timezone.utc) + timedelta(days=plan["trial_days"]),
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"url": session.url, "session_id": session.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subscription/status/{session_id}")
async def get_subscription_status(session_id: str):
    """Get subscription status"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        result = {
            "status": session.status,
            "payment_status": session.payment_status,
            "subscription_id": session.subscription
        }
        
        if session.subscription:
            subscription = stripe.Subscription.retrieve(session.subscription)
            result["subscription_status"] = subscription.status
            result["trial_end"] = subscription.trial_end
            result["current_period_end"] = subscription.current_period_end
        
        # Update database
        db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": session.status,
                "payment_status": session.payment_status,
                "stripe_subscription_id": session.subscription,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subscription/cancel")
async def cancel_subscription(request: CancelSubscriptionRequest):
    """Cancel subscription and downgrade to basic"""
    try:
        # Find user's subscription
        sub = db.subscriptions.find_one({"user_id": request.user_id})
        if not sub or not sub.get("stripe_subscription_id"):
            raise HTTPException(status_code=404, detail="Suscripción no encontrada")
        
        # Cancel in Stripe
        stripe.Subscription.cancel(sub["stripe_subscription_id"])
        
        # Downgrade to basic
        downgrade_to_basic(request.user_id)
        
        return {"message": "Suscripción cancelada. Se ha asignado el Plan Básico gratuito."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PLANS INFO ====================

@router.get("/plans")
async def get_plans():
    """Get available subscription plans"""
    plans_with_info = []
    for plan_id, plan in SUBSCRIPTION_PLANS.items():
        plans_with_info.append({
            "id": plan_id,
            **plan,
            "trial_info": f"{plan['trial_days']} días de prueba gratis",
            "card_required": True,
            "prepaid_accepted": False
        })
    
    return {
        "plans": plans_with_info,
        "basic": {
            "id": "basic",
            "name": "Plan Básico",
            "price": 0,
            "features": ["Botón SOS en App", "10 análisis/mes", "Alertas básicas"]
        }
    }

# ==================== WEBHOOK ====================

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        
        if metadata.get("type") == "device_order":
            db.payment_transactions.update_one(
                {"session_id": session["id"]},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc)}}
            )
        
        elif metadata.get("type") == "subscription":
            user_email = session.get("customer_email")
            if user_email and session.get("subscription"):
                create_or_update_subscription_db(
                    user_id=user_email,
                    plan_id=metadata.get("plan_id"),
                    stripe_subscription_id=session["subscription"],
                    status="trialing"
                )
    
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        db.subscriptions.update_one(
            {"stripe_subscription_id": subscription["id"]},
            {"$set": {
                "status": subscription["status"],
                "updated_at": datetime.now(timezone.utc)
            }}
        )
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        sub_record = db.subscriptions.find_one({"stripe_subscription_id": subscription["id"]})
        if sub_record:
            downgrade_to_basic(sub_record["user_id"])
    
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        if subscription_id:
            db.subscriptions.update_one(
                {"stripe_subscription_id": subscription_id},
                {"$set": {
                    "status": "payment_failed",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
    
    return {"status": "success"}
