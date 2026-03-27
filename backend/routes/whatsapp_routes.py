"""
MANO - WhatsApp Business Integration
Handles WhatsApp alerts and notifications via Cloud API
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, BackgroundTasks
from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import httpx
import os

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN = os.environ.get('WHATSAPP_TOKEN')
WHATSAPP_PHONE_ID = os.environ.get('WHATSAPP_PHONE_ID')
WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"


class WhatsAppMessage(BaseModel):
    phone: str  # Format: 34612345678 (without +)
    message: str


class WhatsAppAlert(BaseModel):
    phone: str
    threat_type: str
    risk_level: str
    description: str


class SOSWhatsAppAlert(BaseModel):
    phone: str
    sender_name: str
    location_url: Optional[str] = None
    message: Optional[str] = None


async def send_whatsapp_message(phone: str, message: str) -> Dict[str, Any]:
    """Send WhatsApp message via Cloud API"""
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_ID:
        print(f"[WHATSAPP MOCK] No configurado. Mensaje a {phone}: {message[:50]}...")
        return {"status": "mocked", "message": "WhatsApp no configurado"}
    
    try:
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        
        # Format phone number (remove + and spaces)
        formatted_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": formatted_phone,
            "type": "text",
            "text": {"body": message}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_ID}/messages",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return {"status": "sent", "data": response.json()}
            
    except httpx.HTTPStatusError as e:
        print(f"[WHATSAPP ERROR] HTTP {e.response.status_code}: {e.response.text}")
        return {"status": "error", "error": str(e)}
    except Exception as e:
        print(f"[WHATSAPP ERROR] {e}")
        return {"status": "error", "error": str(e)}


# Message Templates
def format_threat_alert(threat_type: str, risk_level: str, description: str) -> str:
    risk_emoji = "🔴" if risk_level == "alto" else "🟡" if risk_level == "medio" else "🟢"
    return f"""
{risk_emoji} *ALERTA DE SEGURIDAD MANO*

⚠️ *Tipo:* {threat_type}
📊 *Nivel de riesgo:* {risk_level.upper()}

📝 *Descripción:*
{description}

🛡️ Te recomendamos revisar esta alerta en tu dashboard de MANO.

_Este mensaje es automático. No respondas a este número._
"""


def format_sos_alert(sender_name: str, location_url: Optional[str], message: Optional[str]) -> str:
    location_text = f"\n📍 *Ubicación:* {location_url}" if location_url else ""
    message_text = f"\n💬 *Mensaje:* {message}" if message else ""
    
    return f"""
🆘 *ALERTA SOS - MANO PROTECT*

⚠️ *{sender_name}* ha activado una alerta de emergencia.
{location_text}{message_text}

Por favor, contacta inmediatamente con esta persona o servicios de emergencia si es necesario.

📞 Emergencias: 112

_Este mensaje es automático de MANO Protect._
"""


def format_welcome_message(name: str) -> str:
    return f"""
🛡️ *¡Bienvenido a MANO, {name}!*

Gracias por unirte a MANO Protect, tu escudo digital contra fraudes y estafas.

📱 Recibirás alertas importantes en este número.

🔔 *Comandos disponibles:*
• Envía "AYUDA" para ver opciones
• Envía "ESTADO" para ver tu protección

_Protegiendo tu mundo digital._
"""


# API Routes
@router.get("/status")
async def get_whatsapp_status():
    """Check if WhatsApp is configured"""
    is_configured = bool(WHATSAPP_TOKEN and WHATSAPP_PHONE_ID)
    return {
        "configured": is_configured,
        "provider": "WhatsApp Cloud API (Meta)",
        "message": "WhatsApp configurado" if is_configured else "MOCKED - Configura WHATSAPP_TOKEN y WHATSAPP_PHONE_ID en .env"
    }


@router.post("/send")
async def send_message(
    data: WhatsAppMessage,
    background_tasks: BackgroundTasks
):
    """Send a WhatsApp message"""
    result = await send_whatsapp_message(data.phone, data.message)
    return result


@router.post("/send/threat-alert")
async def send_threat_alert(
    data: WhatsAppAlert,
    background_tasks: BackgroundTasks
):
    """Send threat alert via WhatsApp"""
    message = format_threat_alert(
        data.threat_type,
        data.risk_level,
        data.description
    )
    
    background_tasks.add_task(send_whatsapp_message, data.phone, message)
    
    return {
        "status": "queued",
        "message": "Alerta de amenaza enviada por WhatsApp"
    }


@router.post("/send/sos-alert")
async def send_sos_alert(
    data: SOSWhatsAppAlert,
    background_tasks: BackgroundTasks
):
    """Send SOS emergency alert via WhatsApp"""
    message = format_sos_alert(
        data.sender_name,
        data.location_url,
        data.message
    )
    
    background_tasks.add_task(send_whatsapp_message, data.phone, message)
    
    return {
        "status": "queued",
        "message": "Alerta SOS enviada por WhatsApp"
    }


@router.post("/send/welcome")
async def send_welcome(
    phone: str,
    name: str,
    background_tasks: BackgroundTasks
):
    """Send welcome message via WhatsApp"""
    message = format_welcome_message(name)
    
    background_tasks.add_task(send_whatsapp_message, phone, message)
    
    return {
        "status": "queued",
        "message": "Mensaje de bienvenida enviado"
    }


@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp webhook events"""
    try:
        body = await request.json()
        
        # Log incoming messages
        if "messages" in body.get("entry", [{}])[0].get("changes", [{}])[0].get("value", {}):
            messages = body["entry"][0]["changes"][0]["value"]["messages"]
            for msg in messages:
                from_number = msg.get("from")
                message_text = msg.get("text", {}).get("body", "")
                
                print(f"[WHATSAPP IN] De {from_number}: {message_text}")
                
                # Auto-respond to commands
                if message_text.upper() == "AYUDA":
                    await send_whatsapp_message(
                        from_number,
                        "🛡️ *MANO Protect - Ayuda*\n\n" +
                        "• Envía 'ESTADO' para ver tu protección\n" +
                        "• Visita manoprotectt.com para más opciones\n\n" +
                        "_Estamos aquí para protegerte._"
                    )
                elif message_text.upper() == "ESTADO":
                    await send_whatsapp_message(
                        from_number,
                        "✅ *Tu protección MANO está activa*\n\n" +
                        "📊 Amenazas bloqueadas hoy: 0\n" +
                        "🛡️ Estado: Protegido\n\n" +
                        "_Visita manoprotectt.com para más detalles._"
                    )
        
        return {"status": "ok"}
        
    except Exception as e:
        print(f"[WHATSAPP WEBHOOK ERROR] {e}")
        return {"status": "error", "error": str(e)}


@router.get("/webhook")
async def verify_webhook(request: Request):
    """Verify WhatsApp webhook (for Meta verification)"""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    
    # Verify token should be set in your Meta app settings
    verify_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "mano_verify_token")
    
    if mode == "subscribe" and token == verify_token:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Verification failed")
