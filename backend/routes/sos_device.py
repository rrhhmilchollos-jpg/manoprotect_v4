"""
ManoProtect - SOS Device Orders API
Gestión de pedidos de dispositivos SOS físicos
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/sos-device", tags=["SOS Device"])

# Database will be injected from server.py
db = None

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
    total_price: float

class DeviceActivationRequest(BaseModel):
    device_code: str
    
class SOSAlertRequest(BaseModel):
    device_id: str
    latitude: float
    longitude: float
    alert_type: str  # "manual", "fall_detection", "emergency_112"
    battery_level: Optional[int] = None


# Helper function to get user from session
async def get_current_user(request: Request, session_token: Optional[str] = None):
    if not session_token:
        session_token = request.cookies.get("session_token")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
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
    """
    user = await get_current_user(request, session_token)
    
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    order_data = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "user_email": user.get("email"),
        "user_name": user.get("name"),
        "quantity": order.quantity,
        "family_members": order.family_members,
        "shipping": {
            "full_name": order.shipping.fullName,
            "phone": order.shipping.phone,
            "address": order.shipping.address,
            "city": order.shipping.city,
            "postal_code": order.shipping.postalCode,
            "province": order.shipping.province,
            "notes": order.shipping.notes
        },
        "total_price": order.total_price,
        "status": "pending",  # pending, processing, shipped, delivered
        "payment_status": "pending" if order.total_price > 0 else "free",
        "tracking_number": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.device_orders.insert_one(order_data)
    
    # Create placeholder device records for activation later
    devices = []
    for i in range(order.quantity):
        device_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
        device_data = {
            "device_id": device_id,
            "order_id": order_id,
            "user_id": user["user_id"],
            "status": "pending_activation",  # pending_activation, active, inactive
            "activation_code": f"ACT-{uuid.uuid4().hex[:6].upper()}",
            "battery_level": None,
            "last_location": None,
            "last_seen": None,
            "assigned_to": None,  # Name of family member using this device
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        devices.append(device_data)
    
    if devices:
        await db.sos_devices.insert_many(devices)
    
    return {
        "success": True,
        "order_id": order_id,
        "message": "Pedido creado correctamente",
        "devices_count": order.quantity,
        "estimated_delivery": "24-48 horas",
        "shipping_address": f"{order.shipping.address}, {order.shipping.city}, {order.shipping.postalCode}"
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
