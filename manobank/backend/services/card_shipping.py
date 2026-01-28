"""
Card Shipping Service - SEUR Integration
Gestión de envíos de tarjetas físicas a domicilios de clientes
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from enum import Enum

class ShippingStatus(str, Enum):
    PENDING = "pending"           # Pendiente de preparar
    PREPARING = "preparing"       # En preparación
    READY = "ready"              # Listo para enviar
    SHIPPED = "shipped"          # Enviado
    IN_TRANSIT = "in_transit"    # En tránsito
    OUT_FOR_DELIVERY = "out_for_delivery"  # En reparto
    DELIVERED = "delivered"      # Entregado
    FAILED = "failed"            # Fallido
    RETURNED = "returned"        # Devuelto

# SEUR Configuration
SEUR_PICKUP_POINT = "ES29153"
SENDER_ADDRESS = {
    "name": "ManoBank S.A.",
    "street": "Calle Sor Isabel de Villena 82 bajo",
    "city": "Noveltle",
    "province": "Valencia", 
    "postal_code": "46819",
    "country": "España",
    "phone": "+34 900 123 456"
}


def generate_tracking_number() -> str:
    """Generate a tracking number for the shipment"""
    # Format: MANO + timestamp + random
    timestamp = datetime.now().strftime("%y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()
    return f"MANO{timestamp}{random_part}"


def create_shipment_record(
    card_id: str,
    customer_id: str,
    customer_name: str,
    customer_phone: str,
    delivery_address: Dict[str, str],
    card_type: str,
    created_by: str
) -> Dict[str, Any]:
    """Create a new shipment record"""
    shipment_id = f"ship_{uuid.uuid4().hex[:12]}"
    tracking_number = generate_tracking_number()
    
    return {
        "id": shipment_id,
        "tracking_number": tracking_number,
        "card_id": card_id,
        "customer_id": customer_id,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "card_type": card_type,
        
        # Sender (ManoBank)
        "sender": SENDER_ADDRESS,
        "pickup_point_id": SEUR_PICKUP_POINT,
        
        # Recipient
        "recipient": {
            "name": customer_name,
            "street": delivery_address.get("street", ""),
            "city": delivery_address.get("city", ""),
            "province": delivery_address.get("province", ""),
            "postal_code": delivery_address.get("postal_code", ""),
            "country": delivery_address.get("country", "España"),
            "phone": customer_phone
        },
        
        # Shipment details
        "status": ShippingStatus.PENDING.value,
        "status_history": [
            {
                "status": ShippingStatus.PENDING.value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "note": "Envío creado",
                "updated_by": created_by
            }
        ],
        
        # SEUR specific
        "carrier": "SEUR",
        "service_type": "standard",  # standard, express, 24h
        "seur_reference": None,  # Will be filled when label is generated
        "label_generated": False,
        "label_url": None,
        
        # Dates
        "created_at": datetime.now(timezone.utc).isoformat(),
        "shipped_at": None,
        "delivered_at": None,
        "estimated_delivery": None,
        
        # Additional
        "created_by": created_by,
        "notes": [],
        "delivery_attempts": 0,
        "signature_required": True,
        "insurance_value": 50.00  # Card replacement value
    }


def update_shipment_status(
    shipment: Dict[str, Any],
    new_status: str,
    updated_by: str,
    note: str = ""
) -> Dict[str, Any]:
    """Update shipment status and add to history"""
    shipment["status"] = new_status
    shipment["status_history"].append({
        "status": new_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": note,
        "updated_by": updated_by
    })
    
    # Update specific dates based on status
    if new_status == ShippingStatus.SHIPPED.value:
        shipment["shipped_at"] = datetime.now(timezone.utc).isoformat()
    elif new_status == ShippingStatus.DELIVERED.value:
        shipment["delivered_at"] = datetime.now(timezone.utc).isoformat()
    
    return shipment


def get_status_display(status: str) -> Dict[str, str]:
    """Get display info for status"""
    status_info = {
        "pending": {"label": "Pendiente", "color": "gray", "icon": "clock"},
        "preparing": {"label": "Preparando", "color": "yellow", "icon": "package"},
        "ready": {"label": "Listo para enviar", "color": "blue", "icon": "check"},
        "shipped": {"label": "Enviado", "color": "indigo", "icon": "truck"},
        "in_transit": {"label": "En tránsito", "color": "purple", "icon": "navigation"},
        "out_for_delivery": {"label": "En reparto", "color": "orange", "icon": "map-pin"},
        "delivered": {"label": "Entregado", "color": "green", "icon": "check-circle"},
        "failed": {"label": "Fallido", "color": "red", "icon": "x-circle"},
        "returned": {"label": "Devuelto", "color": "red", "icon": "rotate-ccw"}
    }
    return status_info.get(status, {"label": status, "color": "gray", "icon": "help"})


def generate_sms_tracking_message(tracking_number: str, status: str, customer_name: str) -> str:
    """Generate SMS message for tracking updates"""
    status_messages = {
        "shipped": f"Hola {customer_name}, tu tarjeta ManoBank ha sido enviada. Tracking: {tracking_number}. Seguimiento en: manobank.es/tracking/{tracking_number}",
        "in_transit": f"Tu tarjeta ManoBank está en camino. Tracking: {tracking_number}",
        "out_for_delivery": f"Tu tarjeta ManoBank está en reparto hoy. Tracking: {tracking_number}",
        "delivered": f"Tu tarjeta ManoBank ha sido entregada. ¡Actívala en manobank.es!",
        "failed": f"No pudimos entregar tu tarjeta ManoBank. Contacta: 900 123 456"
    }
    return status_messages.get(status, f"Actualización de tu envío ManoBank: {tracking_number}")
