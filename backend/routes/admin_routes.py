"""
Admin Routes - User Management for ManoProtect
Endpoints for superadmin/admin to manage users, subscriptions, and device orders
"""
from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db

class UserUpdate(BaseModel):
    plan: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None
    phone: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # pending, processing, shipped, delivered, cancelled
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None
    notes: Optional[str] = None

# ===========================================
# USER MANAGEMENT ENDPOINTS
# ===========================================

@router.get("/admin/users")
async def get_all_users(
    request: Request, 
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    plan: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all users with filtering and pagination - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Build query
    query = {}
    if status:
        query["estado"] = status
    if plan:
        query["plan_type"] = plan
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"nombre": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await _db.users.count_documents(query)
    
    # Get paginated users
    skip = (page - 1) * limit
    users = await _db.users.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return {
        "users": users, 
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/admin/users/subscriptions")
async def get_subscription_users(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    estado: Optional[str] = None,  # trial_active, active, grace_period, blocked
    plan_type: Optional[str] = None  # basico, individual, familiar
):
    """Get users with subscription info - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Build query for subscription users
    query = {"estado": {"$exists": True}}
    if estado:
        query["estado"] = estado
    if plan_type:
        query["plan_type"] = plan_type
    
    # Get total count
    total = await _db.users.count_documents(query)
    
    # Get paginated users (exclude sensitive fields only)
    skip = (page - 1) * limit
    users = await _db.users.find(
        query,
        {"_id": 0, "password_hash": 0}
            "card_last4": 1,
            "card_brand": 1,
            "created_at": 1,
            "updated_at": 1
        }
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Get subscription stats
    stats = {
        "total_subscriptions": total,
        "trial_active": await _db.users.count_documents({"estado": "trial_active"}),
        "active": await _db.users.count_documents({"estado": "active"}),
        "grace_period": await _db.users.count_documents({"estado": "grace_period"}),
        "blocked": await _db.users.count_documents({"estado": "blocked"}),
        "by_plan": {
            "basico": await _db.users.count_documents({"plan_type": {"$in": ["basico", "basic_trial"]}}),
            "individual": await _db.users.count_documents({"plan_type": "individual"}),
            "familiar": await _db.users.count_documents({"plan_type": "familiar"})
        }
    }
    
    return {
        "users": users,
        "stats": stats,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/admin/users/recent")
async def get_recent_users(request: Request, limit: int = Query(20, ge=1, le=100)):
    """Get most recently registered users - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    users = await _db.users.find(
        {},
        {
            "_id": 0,
            "password_hash": 0,
            "user_id": 1,
            "email": 1,
            "nombre": 1,
            "name": 1,
            "phone": 1,
            "plan_type": 1,
            "plan_period": 1,
            "estado": 1,
            "trial_end": 1,
            "created_at": 1,
            "auth_provider": 1
        }
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return {"users": users, "count": len(users)}

@router.get("/admin/users/{user_id}")
async def get_user_detail(user_id: str, request: Request):
    """Get single user details - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    user = await _db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get additional user data
    emergency_contacts = await _db.emergency_contacts.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=100)
    
    sessions = await _db.user_sessions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=100)
    
    # Get user's device orders
    device_orders = await _db.device_orders.find(
        {"$or": [{"user_id": user_id}, {"client_email": user.get("email")}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=50)
    
    return {
        "user": user,
        "emergency_contacts": emergency_contacts,
        "active_sessions": len(sessions),
        "device_orders": device_orders
    }

@router.put("/admin/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate, request: Request):
    """Update user - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Find user
    user = await _db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Build update dict
    updates = {}
    if data.plan is not None:
        updates["plan"] = data.plan
        updates["plan_updated_at"] = datetime.now(timezone.utc).isoformat()
        updates["plan_updated_by"] = f"admin_{current_user.user_id}"
    if data.role is not None:
        # Only superadmin can change roles
        if current_user.role != 'superadmin':
            raise HTTPException(status_code=403, detail="Solo superadmin puede cambiar roles")
        updates["role"] = data.role
    if data.is_active is not None:
        updates["is_active"] = data.is_active
    if data.name is not None:
        updates["name"] = data.name
    if data.phone is not None:
        updates["phone"] = data.phone
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        updates["updated_by"] = current_user.user_id
        
        await _db.users.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
    
    # Get updated user
    updated_user = await _db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0}
    )
    
    return {"message": "Usuario actualizado", "user": updated_user}

@router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    """Delete user completely - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Find user
    user = await _db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Prevent self-deletion
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    # Delete user data
    await _db.users.delete_one({"user_id": user_id})
    await _db.emergency_contacts.delete_many({"user_id": user_id})
    await _db.user_sessions.delete_many({"user_id": user_id})
    await _db.locations.delete_many({"user_id": user_id})
    await _db.sos_alerts.delete_many({"user_id": user_id})
    await _db.deletion_requests.delete_many({"user_id": user_id})
    
    # Log deletion
    await _db.admin_logs.insert_one({
        "action": "user_deleted",
        "target_user_id": user_id,
        "target_email": user.get("email"),
        "performed_by": current_user.user_id,
        "timestamp": datetime.now(timezone.utc)
    })
    
    return {"message": "Usuario eliminado correctamente", "user_id": user_id}

# ===========================================
# DEVICE ORDERS MANAGEMENT
# ===========================================

@router.get("/admin/device-orders")
async def get_all_device_orders(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,  # pending, processing, shipped, delivered, cancelled
    search: Optional[str] = None
):
    """Get all device orders with complete shipping info - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"client_email": {"$regex": search, "$options": "i"}},
            {"client_name": {"$regex": search, "$options": "i"}},
            {"order_id": {"$regex": search, "$options": "i"}},
            {"shipping_address.dni": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await _db.device_orders.count_documents(query)
    
    # Get paginated orders
    skip = (page - 1) * limit
    orders = await _db.device_orders.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Get order stats
    stats = {
        "total_orders": total,
        "pending": await _db.device_orders.count_documents({"status": "pending"}),
        "processing": await _db.device_orders.count_documents({"status": "processing"}),
        "shipped": await _db.device_orders.count_documents({"status": "shipped"}),
        "delivered": await _db.device_orders.count_documents({"status": "delivered"}),
        "cancelled": await _db.device_orders.count_documents({"status": "cancelled"})
    }
    
    return {
        "orders": orders,
        "stats": stats,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/admin/device-orders/pending-shipment")
async def get_pending_shipment_orders(request: Request):
    """Get orders pending shipment with full customer data - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Get orders that need to be shipped
    orders = await _db.device_orders.find(
        {"status": {"$in": ["pending", "processing"]}},
        {"_id": 0}
    ).sort("created_at", 1).to_list(length=500)
    
    # Enrich with user data if available
    enriched_orders = []
    for order in orders:
        enriched = dict(order)
        
        # Try to get more user data from users collection
        user_email = order.get("client_email")
        if user_email:
            user_data = await _db.users.find_one(
                {"email": user_email},
                {"_id": 0, "password_hash": 0, "nombre": 1, "name": 1, "phone": 1, "dni": 1}
            )
            if user_data:
                enriched["user_data"] = user_data
        
        enriched_orders.append(enriched)
    
    return {
        "orders": enriched_orders,
        "count": len(enriched_orders),
        "message": f"{len(enriched_orders)} pedidos pendientes de envío"
    }

@router.get("/admin/device-orders/{order_id}")
async def get_device_order_detail(order_id: str, request: Request):
    """Get single device order with all details - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    order = await _db.device_orders.find_one(
        {"order_id": order_id},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Get user info
    user_info = None
    if order.get("client_email"):
        user_info = await _db.users.find_one(
            {"email": order.get("client_email")},
            {"_id": 0, "password_hash": 0}
        )
    
    return {
        "order": order,
        "user": user_info
    }

@router.put("/admin/device-orders/{order_id}")
async def update_device_order(order_id: str, data: OrderStatusUpdate, request: Request):
    """Update device order status - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Find order
    order = await _db.device_orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Build updates
    updates = {
        "status": data.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user.user_id
    }
    
    if data.tracking_number:
        updates["tracking_number"] = data.tracking_number
    if data.shipping_carrier:
        updates["shipping_carrier"] = data.shipping_carrier
    if data.notes:
        updates["notes"] = data.notes
    
    # Set shipped_at or delivered_at timestamps
    if data.status == "shipped" and not order.get("shipped_at"):
        updates["shipped_at"] = datetime.now(timezone.utc).isoformat()
    if data.status == "delivered" and not order.get("delivered_at"):
        updates["delivered_at"] = datetime.now(timezone.utc).isoformat()
    
    await _db.device_orders.update_one(
        {"order_id": order_id},
        {"$set": updates}
    )
    
    # If shipped, send notification email
    if data.status == "shipped" and data.tracking_number:
        try:
            from services.email_service import EmailNotificationService
            email_service = EmailNotificationService()
            
            await email_service.send_shipping_update(
                user_id=order.get("client_id", ""),
                email=order.get("client_email", ""),
                shipping_data={
                    "order_id": order_id,
                    "status": "shipped",
                    "tracking_number": data.tracking_number,
                    "carrier": data.shipping_carrier or "Correos Express"
                }
            )
        except Exception as e:
            print(f"Error sending shipping notification: {e}")
    
    # Get updated order
    updated_order = await _db.device_orders.find_one(
        {"order_id": order_id},
        {"_id": 0}
    )
    
    return {"message": "Pedido actualizado", "order": updated_order}

@router.get("/admin/device-orders/export/csv")
async def export_orders_csv(
    request: Request,
    status: Optional[str] = None
):
    """Export device orders as CSV data - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await _db.device_orders.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=10000)
    
    # Build CSV data
    csv_rows = []
    headers = [
        "ID Pedido", "Fecha", "Estado", "Nombre", "Email", "Teléfono", "DNI",
        "Dirección", "Ciudad", "Código Postal", "Provincia",
        "Cantidad", "Colores", "Estilo", "Coste Envío",
        "Nº Seguimiento", "Transportista", "Notas"
    ]
    csv_rows.append(headers)
    
    for order in orders:
        shipping = order.get("shipping_address", {})
        row = [
            order.get("order_id", "")[:8].upper(),
            order.get("created_at", "")[:10],
            order.get("status", ""),
            order.get("client_name", shipping.get("fullName", "")),
            order.get("client_email", ""),
            order.get("client_phone", shipping.get("phone", "")),
            shipping.get("dni", ""),
            shipping.get("street", shipping.get("address", "")),
            shipping.get("city", ""),
            shipping.get("postal_code", shipping.get("postalCode", "")),
            shipping.get("province", ""),
            str(order.get("quantity", 1)),
            ", ".join(order.get("colors", [])) if isinstance(order.get("colors"), list) else str(order.get("colors", "")),
            order.get("device_style", ""),
            f"{order.get('shipping_cost', 4.95):.2f}€",
            order.get("tracking_number", ""),
            order.get("shipping_carrier", ""),
            order.get("notes", "")
        ]
        csv_rows.append(row)
    
    return {
        "headers": headers,
        "rows": csv_rows,
        "total": len(orders),
        "format": "csv"
    }

# ===========================================
# ADMIN STATS & DASHBOARD
# ===========================================

@router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get admin dashboard stats"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    total_users = await _db.users.count_documents({})
    active_users = await _db.users.count_documents({"is_active": {"$ne": False}})
    free_users = await _db.users.count_documents({"plan": "free"})
    premium_users = await _db.users.count_documents({"plan": "premium"})
    enterprise_users = await _db.users.count_documents({"plan": "enterprise"})
    pending_deletions = await _db.deletion_requests.count_documents({"status": "pending"})
    
    # Subscription stats
    trial_users = await _db.users.count_documents({"estado": "trial_active"})
    active_subscriptions = await _db.users.count_documents({"estado": "active"})
    
    # Device order stats
    pending_orders = await _db.device_orders.count_documents({"status": {"$in": ["pending", "processing"]}})
    total_orders = await _db.device_orders.count_documents({})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "free_users": free_users,
        "premium_users": premium_users,
        "enterprise_users": enterprise_users,
        "pending_deletions": pending_deletions,
        "trial_users": trial_users,
        "active_subscriptions": active_subscriptions,
        "pending_device_orders": pending_orders,
        "total_device_orders": total_orders
    }

@router.get("/admin/deletion-requests")
async def get_deletion_requests(request: Request):
    """Get pending deletion requests"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    requests = await _db.deletion_requests.find(
        {},
        {"_id": 0}
    ).sort("requested_at", -1).to_list(length=100)
    
    return {"requests": requests}
