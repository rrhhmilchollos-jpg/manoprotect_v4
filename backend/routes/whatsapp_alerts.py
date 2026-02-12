"""
ManoProtect - WhatsApp Alerts API
Envío de alertas SOS por WhatsApp usando Twilio
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import os
import httpx

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

# Database will be injected from server.py
db = None

def set_database(database):
    global db
    db = database

# Twilio Configuration (to be set in .env)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

class WhatsAppAlertRequest(BaseModel):
    phone_numbers: List[str]  # List of phone numbers to send alerts
    alert_type: str  # "sos", "location", "fall_detection"
    sender_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    custom_message: Optional[str] = None

class WhatsAppConfigRequest(BaseModel):
    phone_number: str
    enabled: bool = True

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


def format_whatsapp_number(phone: str) -> str:
    """Format phone number for WhatsApp (must include country code)"""
    # Remove all non-numeric characters
    phone = ''.join(filter(str.isdigit, phone))
    
    # If starts with 6 or 7, assume it's Spanish mobile
    if phone.startswith('6') or phone.startswith('7'):
        phone = '34' + phone
    
    # Ensure it starts with country code
    if not phone.startswith('34') and len(phone) == 9:
        phone = '34' + phone
    
    return f"whatsapp:+{phone}"


async def send_whatsapp_message(to_number: str, message: str) -> dict:
    """
    Send WhatsApp message using Twilio API
    Returns success status
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        # Twilio not configured - log and continue
        print(f"[WhatsApp] Twilio not configured. Would send to {to_number}: {message[:50]}...")
        return {
            "success": False, 
            "error": "Twilio not configured",
            "simulated": True,
            "message": message
        }
    
    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                data={
                    "From": TWILIO_WHATSAPP_NUMBER,
                    "To": format_whatsapp_number(to_number),
                    "Body": message
                }
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "message_sid": result.get("sid"),
                    "status": result.get("status")
                }
            else:
                return {
                    "success": False,
                    "error": response.text,
                    "status_code": response.status_code
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_sos_message(sender_name: str, latitude: float = None, longitude: float = None) -> str:
    """Generate SOS alert message with location"""
    message = f"""🚨 *ALERTA SOS - MANOPROTECT*

⚠️ {sender_name} ha activado una alerta de emergencia.

"""
    
    if latitude and longitude:
        google_maps_url = f"https://maps.google.com/?q={latitude},{longitude}"
        message += f"""📍 *Ubicación:*
{google_maps_url}

Coordenadas: {latitude:.6f}, {longitude:.6f}

"""
    
    message += """Por favor, contacta con esta persona inmediatamente.

📞 Si no responde, considera llamar al 112 (emergencias).

_Enviado por ManoProtect - Protección Familiar_"""
    
    return message


def generate_fall_message(sender_name: str, latitude: float = None, longitude: float = None) -> str:
    """Generate fall detection alert message"""
    message = f"""🔴 *ALERTA DE CAÍDA - MANOPROTECT*

⚠️ Se ha detectado una posible caída de {sender_name}.

"""
    
    if latitude and longitude:
        google_maps_url = f"https://maps.google.com/?q={latitude},{longitude}"
        message += f"""📍 *Última ubicación conocida:*
{google_maps_url}

"""
    
    message += """Por favor, verifica que se encuentra bien.

📞 Si no responde, llama al 112.

_Alerta automática de ManoProtect_"""
    
    return message


def generate_location_message(sender_name: str, latitude: float, longitude: float) -> str:
    """Generate location share message"""
    google_maps_url = f"https://maps.google.com/?q={latitude},{longitude}"
    
    return f"""📍 *Ubicación compartida - MANOPROTECT*

{sender_name} ha compartido su ubicación contigo:

{google_maps_url}

_Enviado por ManoProtect_"""


@router.post("/alert")
async def send_sos_alert(
    alert: WhatsAppAlertRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Enviar alerta SOS por WhatsApp a múltiples contactos
    """
    user = await get_current_user(request, session_token)
    
    # Generate appropriate message based on alert type
    if alert.alert_type == "sos":
        message = generate_sos_message(alert.sender_name, alert.latitude, alert.longitude)
    elif alert.alert_type == "fall_detection":
        message = generate_fall_message(alert.sender_name, alert.latitude, alert.longitude)
    elif alert.alert_type == "location":
        if not alert.latitude or not alert.longitude:
            raise HTTPException(status_code=400, detail="Se requieren coordenadas para compartir ubicación")
        message = generate_location_message(alert.sender_name, alert.latitude, alert.longitude)
    else:
        message = alert.custom_message or f"Alerta de {alert.sender_name} desde ManoProtect"
    
    # Send to all recipients
    results = []
    for phone in alert.phone_numbers:
        result = await send_whatsapp_message(phone, message)
        results.append({
            "phone": phone,
            **result
        })
    
    # Log alert
    alert_log = {
        "user_id": user["user_id"],
        "alert_type": alert.alert_type,
        "recipients": alert.phone_numbers,
        "location": {
            "latitude": alert.latitude,
            "longitude": alert.longitude
        } if alert.latitude else None,
        "results": results,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.whatsapp_alerts.insert_one(alert_log)
    
    successful = sum(1 for r in results if r.get("success"))
    
    return {
        "success": successful > 0,
        "sent": successful,
        "failed": len(results) - successful,
        "results": results
    }


@router.post("/test")
async def send_test_message(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Enviar mensaje de prueba al número del usuario
    """
    user = await get_current_user(request, session_token)
    
    phone = user.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="No tienes número de teléfono configurado")
    
    message = """✅ *Prueba de WhatsApp - ManoProtect*

¡Tu configuración de WhatsApp funciona correctamente!

Las alertas SOS y notificaciones se enviarán a este número.

_Equipo ManoProtect_"""
    
    result = await send_whatsapp_message(phone, message)
    
    return result


@router.get("/config")
async def get_whatsapp_config(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Obtener configuración de WhatsApp del usuario
    """
    user = await get_current_user(request, session_token)
    
    config = await db.whatsapp_config.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    return {
        "configured": TWILIO_ACCOUNT_SID is not None,
        "user_phone": user.get("phone"),
        "whatsapp_enabled": config.get("enabled", True) if config else True,
        "family_contacts": config.get("family_contacts", []) if config else []
    }


@router.post("/config")
async def update_whatsapp_config(
    config: WhatsAppConfigRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Actualizar configuración de WhatsApp del usuario
    """
    user = await get_current_user(request, session_token)
    
    await db.whatsapp_config.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "phone_number": config.phone_number,
                "enabled": config.enabled,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"success": True, "message": "Configuración actualizada"}


@router.get("/alerts/history")
async def get_alert_history(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 20
):
    """
    Obtener historial de alertas enviadas
    """
    user = await get_current_user(request, session_token)
    
    alerts = await db.whatsapp_alerts.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"alerts": alerts}
