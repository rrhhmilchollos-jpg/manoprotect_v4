"""
ManoProtect - SOS Device Orders API
Gestión de pedidos de dispositivos SOS físicos
Con verificación de pago via Stripe Webhooks
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os
import stripe
import json

router = APIRouter(prefix="/sos-device", tags=["SOS Device"])

# Database will be injected from server.py
db = None

# Stripe config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

if STRIPE_API_KEY:
    stripe.api_key = STRIPE_API_KEY

def set_database(database):
    global db
    db = database

# Models
class ShippingInfo(BaseModel):
    fullName: str
    phone: str
    address: str
    city: str
    postalCode: str
    province: str
    notes: Optional[str] = ""

class DeviceOrderRequest(BaseModel):
    quantity: int
    family_members: int
    shipping: ShippingInfo
    selected_colors: Optional[List[str]] = []
    total_price: float

class DeviceActivationRequest(BaseModel):
    device_code: str
    
class SOSAlertRequest(BaseModel):
    device_id: str
    latitude: float
    longitude: float
    alert_type: str  # "manual", "fall_detection", "emergency_112"
    battery_level: Optional[int] = None

# Device pricing
DEVICE_PRICE = 0.00  # Promo: Device free
SHIPPING_PRICE = 4.95  # Shipping cost


# Helper function to get user from session
async def get_current_user(request: Request, session_token: Optional[str] = None):
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session:
        # Try alternative collection
        session = await db.sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=401, detail="Sesión no válida")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return user


@router.post("/order")
async def create_device_order(
    order: DeviceOrderRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Crear pedido de dispositivos SOS físicos
    IMPORTANTE: El pedido se crea con estado 'pending_payment'
    Solo se procesa cuando Stripe confirma el pago via webhook
    """
    user = await get_current_user(request, session_token)
    
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate total (device is FREE during promo, only shipping)
    total_amount = SHIPPING_PRICE * order.quantity
    
    order_data = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "user_email": user.get("email"),
        "user_name": user.get("name"),
        "quantity": order.quantity,
        "family_members": order.family_members,
        "selected_colors": order.selected_colors or [],
        "shipping": {
            "full_name": order.shipping.fullName,
            "phone": order.shipping.phone,
            "address": order.shipping.address,
            "city": order.shipping.city,
            "postal_code": order.shipping.postalCode,
            "province": order.shipping.province,
            "notes": order.shipping.notes
        },
        "total_price": total_amount,
        "status": "pending_payment",  # CHANGED: Start with pending_payment
        "payment_status": "pending",  # Always start as pending
        "stripe_session_id": None,  # Will be set after checkout
        "tracking_number": None,
        "carrier": None,
        "estimated_delivery": None,
        "history": [
            {
                "date": datetime.now(timezone.utc).isoformat(),
                "status": "pending_payment",
                "message": "Pedido creado - Esperando confirmación de pago"
            }
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.device_orders.insert_one(order_data)
    
    # DON'T create devices yet - only after payment confirmation
    # Devices will be created in the webhook handler
    
    # Create Stripe checkout session for shipping payment
    if total_amount > 0 and STRIPE_API_KEY:
        try:
            # Use frontend URL for redirects
            frontend_url = os.environ.get('FRONTEND_URL', 'https://mano-protect-preview.preview.emergentagent.com')
            
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': f'Envío Dispositivo SOS ManoProtect x{order.quantity}',
                            'description': f'Envío express 24-48h a {order.shipping.city}, {order.shipping.province}',
                        },
                        'unit_amount': int(SHIPPING_PRICE * 100),  # Stripe uses cents
                    },
                    'quantity': order.quantity,
                }],
                mode='payment',
                success_url=f'{frontend_url}/pedido-confirmado?order_id={order_id}&session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{frontend_url}/dispositivo-sos?canceled=true',
                customer_email=user.get("email"),
                metadata={
                    'order_id': order_id,
                    'user_id': user["user_id"],
                    'order_type': 'sos_device',
                    'quantity': str(order.quantity),
                    'shipping_address': f"{order.shipping.address}, {order.shipping.city}",
                    'shipping_phone': order.shipping.phone
                },
                shipping_address_collection={
                    'allowed_countries': ['ES'],  # Only Spain
                }
            )
            
            # Update order with Stripe session ID
            await db.device_orders.update_one(
                {"order_id": order_id},
                {"$set": {"stripe_session_id": checkout_session.id}}
            )
            
            return {
                "success": True,
                "order_id": order_id,
                "requires_payment": True,
                "checkout_url": checkout_session.url,
                "stripe_session_id": checkout_session.id,
                "message": "Pedido creado. Redirigiendo al pago...",
                "total_amount": total_amount
            }
        except Exception as e:
            # If Stripe fails, mark order as failed
            await db.device_orders.update_one(
                {"order_id": order_id},
                {"$set": {"status": "payment_failed", "error": str(e)}}
            )
            raise HTTPException(status_code=500, detail=f"Error al crear sesión de pago: {str(e)}")
    
    # Free order (shouldn't happen with shipping, but handle it)
    return {
        "success": True,
        "order_id": order_id,
        "requires_payment": False,
        "message": "Pedido creado correctamente",
        "devices_count": order.quantity,
        "estimated_delivery": "24-48 horas"
    }


@router.post("/webhook/stripe")
async def stripe_device_webhook(request: Request):
    """
    Webhook para confirmar pagos de dispositivos SOS
    Stripe llama a este endpoint cuando el pago se completa
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        else:
            # Fallback: parse without verification (dev mode)
            data = json.loads(payload)
            event = stripe.Event.construct_from(data, stripe.api_key)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')
        order_type = session.get('metadata', {}).get('order_type')
        
        if order_type == 'sos_device' and order_id:
            # Get shipping address from Stripe session
            shipping_details = session.get('shipping_details') or session.get('shipping', {})
            customer_details = session.get('customer_details', {})
            
            # Update order to confirmed
            update_data = {
                "status": "confirmed",
                "payment_status": "paid",
                "stripe_payment_intent": session.get('payment_intent'),
                "payment_confirmed_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            
            # Add Stripe shipping address if available
            if shipping_details and shipping_details.get('address'):
                stripe_addr = shipping_details['address']
                update_data["stripe_shipping"] = {
                    "name": shipping_details.get('name'),
                    "phone": shipping_details.get('phone') or customer_details.get('phone'),
                    "address_line1": stripe_addr.get('line1'),
                    "address_line2": stripe_addr.get('line2'),
                    "city": stripe_addr.get('city'),
                    "postal_code": stripe_addr.get('postal_code'),
                    "state": stripe_addr.get('state'),
                    "country": stripe_addr.get('country'),
                }
            
            # Add to history
            update_data["$push"] = {
                "history": {
                    "date": datetime.now(timezone.utc).isoformat(),
                    "status": "confirmed",
                    "message": "Pago confirmado por Stripe"
                }
            }
            
            # Separate $push from $set
            push_data = update_data.pop("$push", None)
            
            result = await db.device_orders.update_one(
                {"order_id": order_id},
                {"$set": update_data, **({"$push": push_data} if push_data else {})}
            )
            
            if result.matched_count > 0:
                # NOW create the device records since payment is confirmed
                order = await db.device_orders.find_one({"order_id": order_id})
                if order:
                    devices = []
                    for i in range(order.get("quantity", 1)):
                        device_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
                        device_data = {
                            "device_id": device_id,
                            "order_id": order_id,
                            "user_id": order["user_id"],
                            "status": "pending_activation",
                            "activation_code": f"ACT-{uuid.uuid4().hex[:6].upper()}",
                            "battery_level": None,
                            "last_location": None,
                            "last_seen": None,
                            "assigned_to": None,
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                        devices.append(device_data)
                    
                    if devices:
                        await db.sos_devices.insert_many(devices)
                        # Update order with device IDs
                        device_ids = [d["device_id"] for d in devices]
                        await db.device_orders.update_one(
                            {"order_id": order_id},
                            {"$set": {"device_ids": device_ids}}
                        )
                
                print(f"✅ Order {order_id} confirmed and devices created")
    
    elif event['type'] == 'checkout.session.expired':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')
        
        if order_id:
            await db.device_orders.update_one(
                {"order_id": order_id},
                {"$set": {
                    "status": "payment_expired",
                    "payment_status": "expired",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    elif event['type'] == 'payment_intent.payment_failed':
        # Handle failed payment
        intent = event['data']['object']
        order_id = intent.get('metadata', {}).get('order_id')
        
        if order_id:
            await db.device_orders.update_one(
                {"order_id": order_id},
                {"$set": {
                    "status": "payment_failed",
                    "payment_status": "failed",
                    "payment_error": intent.get('last_payment_error', {}).get('message'),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {"status": "success", "event_type": event['type']}


@router.get("/order/{order_id}/status")
async def get_order_payment_status(
    order_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Verificar estado del pago de un pedido
    """
    user = await get_current_user(request, session_token)
    
    order = await db.device_orders.find_one(
        {"order_id": order_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # If has stripe session, check live status
    if order.get("stripe_session_id") and STRIPE_API_KEY:
        try:
            session = stripe.checkout.Session.retrieve(order["stripe_session_id"])
            if session.payment_status == 'paid' and order["payment_status"] != "paid":
                # Update if webhook hasn't fired yet
                await db.device_orders.update_one(
                    {"order_id": order_id},
                    {"$set": {
                        "status": "confirmed",
                        "payment_status": "paid",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                order["status"] = "confirmed"
                order["payment_status"] = "paid"
        except Exception:
            pass
    
    return {
        "order_id": order_id,
        "status": order.get("status"),
        "payment_status": order.get("payment_status"),
        "total_price": order.get("total_price"),
        "created_at": order.get("created_at"),
        "shipping": order.get("shipping")
    }


@router.get("/orders")
async def get_user_orders(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener pedidos del usuario
    """
    user = await get_current_user(request, session_token)
    
    orders = await db.device_orders.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"orders": orders}


@router.get("/my-orders")
async def get_my_orders_v1(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener pedidos del usuario (ruta alternativa para compatibilidad)
    """
    return await get_user_orders(request, session_token)


@router.get("/track/{order_id}")
async def track_order(
    order_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener estado detallado de un pedido específico
    """
    user = await get_current_user(request, session_token)
    
    order = await db.device_orders.find_one(
        {"order_id": order_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        # Try by tracking number
        order = await db.device_orders.find_one(
            {"tracking_number": order_id, "user_id": user["user_id"]},
            {"_id": 0}
        )
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Format for frontend
    formatted_order = {
        "id": order.get("order_id"),
        "status": order.get("status"),
        "created_at": order.get("created_at"),
        "updated_at": order.get("updated_at"),
        "quantity": order.get("quantity"),
        "colors": order.get("selected_colors", []),
        "shipping": {
            "fullName": order.get("shipping", {}).get("full_name"),
            "address": order.get("shipping", {}).get("address"),
            "city": order.get("shipping", {}).get("city"),
            "postalCode": order.get("shipping", {}).get("postal_code"),
            "province": order.get("shipping", {}).get("province"),
        },
        "tracking_number": order.get("tracking_number"),
        "carrier": order.get("carrier"),
        "estimated_delivery": order.get("estimated_delivery"),
        "history": order.get("history", [])
    }
    
    return {"order": formatted_order}


@router.get("/devices")
async def get_user_devices(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener dispositivos del usuario
    """
    user = await get_current_user(request, session_token)
    
    devices = await db.sos_devices.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(50)
    
    return {"devices": devices}


@router.post("/activate")
async def activate_device(
    activation: DeviceActivationRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Activar un dispositivo SOS escaneando el código QR
    """
    user = await get_current_user(request, session_token)
    
    # Find device by activation code
    device = await db.sos_devices.find_one({
        "activation_code": activation.device_code,
        "user_id": user["user_id"]
    })
    
    if not device:
        # Check if device exists but belongs to another user
        other_device = await db.sos_devices.find_one({"activation_code": activation.device_code})
        if other_device:
            raise HTTPException(status_code=403, detail="Este dispositivo pertenece a otra cuenta")
        raise HTTPException(status_code=404, detail="Código de activación no válido")
    
    if device.get("status") == "active":
        raise HTTPException(status_code=400, detail="Este dispositivo ya está activado")
    
    # Activate device
    await db.sos_devices.update_one(
        {"activation_code": activation.device_code},
        {
            "$set": {
                "status": "active",
                "activated_at": datetime.now(timezone.utc).isoformat(),
                "last_seen": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "device_id": device["device_id"],
        "message": "Dispositivo activado correctamente"
    }


@router.post("/alert")
async def receive_sos_alert(alert: SOSAlertRequest):
    """
    Recibir alerta SOS desde un dispositivo físico
    Este endpoint será llamado por el dispositivo cuando se pulse el botón SOS
    """
    # Find device
    device = await db.sos_devices.find_one({"device_id": alert.device_id})
    
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    if device.get("status") != "active":
        raise HTTPException(status_code=400, detail="Dispositivo no activado")
    
    # Create alert record
    alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
    alert_data = {
        "alert_id": alert_id,
        "device_id": alert.device_id,
        "user_id": device["user_id"],
        "alert_type": alert.alert_type,
        "location": {
            "latitude": alert.latitude,
            "longitude": alert.longitude
        },
        "battery_level": alert.battery_level,
        "status": "active",  # active, acknowledged, resolved
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.sos_alerts.insert_one(alert_data)
    
    # Update device last seen
    await db.sos_devices.update_one(
        {"device_id": alert.device_id},
        {
            "$set": {
                "last_location": {
                    "latitude": alert.latitude,
                    "longitude": alert.longitude
                },
                "battery_level": alert.battery_level,
                "last_seen": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # TODO: Send notifications to family members
    # TODO: If alert_type is "emergency_112", initiate 112 call
    
    return {
        "success": True,
        "alert_id": alert_id,
        "message": "Alerta recibida",
        "notify_112": alert.alert_type == "emergency_112"
    }


@router.get("/location/{device_id}")
async def get_device_location(
    device_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener última ubicación conocida del dispositivo
    """
    user = await get_current_user(request, session_token)
    
    device = await db.sos_devices.find_one({
        "device_id": device_id,
        "user_id": user["user_id"]
    }, {"_id": 0})
    
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    return {
        "device_id": device_id,
        "location": device.get("last_location"),
        "battery_level": device.get("battery_level"),
        "last_seen": device.get("last_seen"),
        "status": device.get("status")
    }


# Admin endpoints for order management
@router.get("/admin/orders")
async def get_all_orders(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener todos los pedidos (solo admin)
    """
    user = await get_current_user(request, session_token)
    
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    orders = await db.device_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    # Get summary stats
    total_orders = len(orders)
    pending_orders = len([o for o in orders if o.get("status") == "pending"])
    shipped_orders = len([o for o in orders if o.get("status") == "shipped"])
    total_devices = sum(o.get("quantity", 0) for o in orders)
    
    return {
        "orders": orders,
        "stats": {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "shipped_orders": shipped_orders,
            "total_devices": total_devices
        }
    }


@router.patch("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    tracking_number: Optional[str] = None,
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """
    Actualizar estado del pedido (solo admin)
    """
    user = await get_current_user(request, session_token)
    
    if user.get("role") not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if tracking_number:
        update_data["tracking_number"] = tracking_number
    
    result = await db.device_orders.update_one(
        {"order_id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    return {"success": True, "message": f"Pedido actualizado a: {status}"}
