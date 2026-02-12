"""
ManoProtect - Shipping Management Panel (Internal Admin)
Panel interno para gestionar envíos de dispositivos SOS
"""
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/admin/shipping", tags=["Admin Shipping"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Available carriers
CARRIERS = [
    {"id": "correos", "name": "Correos Express", "tracking_url": "https://www.correosexpress.com/seguimiento"},
    {"id": "seur", "name": "SEUR", "tracking_url": "https://www.seur.com/livetracking"},
    {"id": "mrw", "name": "MRW", "tracking_url": "https://www.mrw.es/seguimiento_envios"},
    {"id": "gls", "name": "GLS Spain", "tracking_url": "https://www.gls-spain.es/seguimiento"},
    {"id": "dhl", "name": "DHL Express", "tracking_url": "https://www.dhl.com/es-es/home/tracking"},
    {"id": "ups", "name": "UPS", "tracking_url": "https://www.ups.com/track"},
    {"id": "fedex", "name": "FedEx", "tracking_url": "https://www.fedex.com/fedextrack"},
    {"id": "nacex", "name": "Nacex", "tracking_url": "https://www.nacex.es/seguimiento"}
]

ORDER_STATUSES = [
    "pending_shipment",  # Esperando envío
    "preparing",         # Preparando
    "shipped",          # Enviado
    "in_transit",       # En tránsito
    "out_for_delivery", # En reparto
    "delivered",        # Entregado
    "returned",         # Devuelto
    "cancelled"         # Cancelado
]

# ==================== MODELS ====================

class UpdateOrderRequest(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    order_status: Optional[str] = None
    notes: Optional[str] = None

class BulkShipmentRequest(BaseModel):
    order_ids: List[str]
    carrier: str
    tracking_prefix: str

# ==================== HELPER ====================

def serialize_order(order):
    """Convert MongoDB document to JSON-serializable dict"""
    if order:
        order["_id"] = str(order["_id"])
        if "created_at" in order and order["created_at"]:
            order["created_at"] = order["created_at"].isoformat()
        if "updated_at" in order and order["updated_at"]:
            order["updated_at"] = order["updated_at"].isoformat()
        if "shipped_at" in order and order["shipped_at"]:
            order["shipped_at"] = order["shipped_at"].isoformat()
        if "delivered_at" in order and order["delivered_at"]:
            order["delivered_at"] = order["delivered_at"].isoformat()
    return order

# ==================== ENDPOINTS ====================

@router.get("/orders")
async def get_all_orders(
    status: Optional[str] = None,
    carrier: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    """Get all device orders with filtering"""
    query = {}
    
    if status:
        query["order_status"] = status
    if carrier:
        query["carrier"] = carrier
    
    skip = (page - 1) * limit
    
    orders = list(db.device_orders.find(query).sort("created_at", -1).skip(skip).limit(limit))
    total = db.device_orders.count_documents(query)
    
    # Get stats
    stats = {
        "pending": db.device_orders.count_documents({"order_status": "pending_shipment"}),
        "preparing": db.device_orders.count_documents({"order_status": "preparing"}),
        "shipped": db.device_orders.count_documents({"order_status": "shipped"}),
        "in_transit": db.device_orders.count_documents({"order_status": "in_transit"}),
        "delivered": db.device_orders.count_documents({"order_status": "delivered"}),
        "total": db.device_orders.count_documents({})
    }
    
    return {
        "orders": [serialize_order(o) for o in orders],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "stats": stats
    }

@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get single order details"""
    try:
        order = db.device_orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return serialize_order(order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/orders/{order_id}")
async def update_order(order_id: str, update: UpdateOrderRequest):
    """Update order with tracking info"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc)}
        
        if update.tracking_number:
            update_data["tracking_number"] = update.tracking_number
        if update.carrier:
            update_data["carrier"] = update.carrier
        if update.order_status:
            update_data["order_status"] = update.order_status
            if update.order_status == "shipped":
                update_data["shipped_at"] = datetime.now(timezone.utc)
            elif update.order_status == "delivered":
                update_data["delivered_at"] = datetime.now(timezone.utc)
        if update.notes:
            update_data["notes"] = update.notes
        
        result = db.device_orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
        return {"message": "Pedido actualizado", "order_id": order_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orders/{order_id}/ship")
async def ship_order(order_id: str, tracking_number: str, carrier: str):
    """Mark order as shipped with tracking"""
    try:
        result = db.device_orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "tracking_number": tracking_number,
                "carrier": carrier,
                "order_status": "shipped",
                "shipped_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
        # TODO: Send notification to customer (email/SMS)
        
        return {"message": "Pedido marcado como enviado", "tracking_number": tracking_number}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orders/bulk-ship")
async def bulk_ship_orders(bulk: BulkShipmentRequest):
    """Ship multiple orders with auto-generated tracking numbers"""
    shipped = []
    errors = []
    
    for i, order_id in enumerate(bulk.order_ids):
        try:
            tracking = f"{bulk.tracking_prefix}{i+1:04d}"
            
            result = db.device_orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {
                    "tracking_number": tracking,
                    "carrier": bulk.carrier,
                    "order_status": "shipped",
                    "shipped_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            if result.matched_count > 0:
                shipped.append({"order_id": order_id, "tracking": tracking})
            else:
                errors.append({"order_id": order_id, "error": "No encontrado"})
                
        except Exception as e:
            errors.append({"order_id": order_id, "error": str(e)})
    
    return {
        "shipped": len(shipped),
        "errors": len(errors),
        "details": {"shipped": shipped, "errors": errors}
    }

@router.get("/carriers")
async def get_carriers():
    """Get available shipping carriers"""
    return {"carriers": CARRIERS}

@router.get("/statuses")
async def get_statuses():
    """Get available order statuses"""
    status_labels = {
        "pending_shipment": "Pendiente de envío",
        "preparing": "Preparando",
        "shipped": "Enviado",
        "in_transit": "En tránsito",
        "out_for_delivery": "En reparto",
        "delivered": "Entregado",
        "returned": "Devuelto",
        "cancelled": "Cancelado"
    }
    return {"statuses": ORDER_STATUSES, "labels": status_labels}

@router.get("/dashboard")
async def shipping_dashboard():
    """Get shipping dashboard stats"""
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    stats = {
        "total_orders": db.device_orders.count_documents({}),
        "pending": db.device_orders.count_documents({"order_status": "pending_shipment"}),
        "preparing": db.device_orders.count_documents({"order_status": "preparing"}),
        "shipped_today": db.device_orders.count_documents({
            "shipped_at": {"$gte": today}
        }),
        "delivered": db.device_orders.count_documents({"order_status": "delivered"}),
        "in_transit": db.device_orders.count_documents({"order_status": "in_transit"}),
        "returns": db.device_orders.count_documents({"order_status": "returned"})
    }
    
    # Orders by carrier
    carriers_pipeline = [
        {"$match": {"carrier": {"$ne": None}}},
        {"$group": {"_id": "$carrier", "count": {"$sum": 1}}}
    ]
    by_carrier = list(db.device_orders.aggregate(carriers_pipeline))
    
    # Recent orders
    recent = list(db.device_orders.find().sort("created_at", -1).limit(10))
    
    return {
        "stats": stats,
        "by_carrier": by_carrier,
        "recent_orders": [serialize_order(o) for o in recent]
    }

@router.get("/export")
async def export_orders(status: Optional[str] = None, format: str = "json"):
    """Export orders for shipping label generation"""
    query = {}
    if status:
        query["order_status"] = status
    
    orders = list(db.device_orders.find(query).sort("created_at", -1))
    
    # Format for shipping labels
    export_data = []
    for order in orders:
        shipping = order.get("shipping", {})
        export_data.append({
            "order_id": str(order["_id"]),
            "recipient_name": shipping.get("fullName", ""),
            "phone": shipping.get("phone", ""),
            "address": shipping.get("address", ""),
            "city": shipping.get("city", ""),
            "postal_code": shipping.get("postalCode", ""),
            "province": shipping.get("province", ""),
            "country": "España",
            "quantity": order.get("quantity", 1),
            "product": f"Dispositivo SOS ManoProtect - {order.get('color', 'plata')}",
            "weight_kg": 0.15 * order.get("quantity", 1),
            "tracking_number": order.get("tracking_number", ""),
            "carrier": order.get("carrier", "")
        })
    
    return {"orders": export_data, "total": len(export_data)}
