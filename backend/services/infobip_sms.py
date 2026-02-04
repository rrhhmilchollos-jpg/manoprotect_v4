"""
Infobip SMS Service for ManoProtect
- Verification codes (OTP)
- Password reset
- Emergency SOS alerts
- Security notifications
"""
import os
import httpx
from typing import Optional

# Infobip credentials from environment
INFOBIP_API_KEY = os.environ.get('INFOBIP_API_KEY')
INFOBIP_BASE_URL = os.environ.get('INFOBIP_BASE_URL', 'https://api.infobip.com')
INFOBIP_SENDER = os.environ.get('INFOBIP_SENDER', 'ManoProtect')

# HTTP client for async requests
_client: Optional[httpx.AsyncClient] = None


def get_infobip_client() -> Optional[httpx.AsyncClient]:
    """Get or create Infobip HTTP client"""
    global _client
    if _client is None and INFOBIP_API_KEY:
        _client = httpx.AsyncClient(
            base_url=INFOBIP_BASE_URL,
            headers={
                "Authorization": f"App {INFOBIP_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=30.0
        )
    return _client


def is_configured() -> bool:
    """Check if Infobip is properly configured"""
    return bool(INFOBIP_API_KEY and INFOBIP_BASE_URL)


async def send_sms(phone_number: str, message: str, sender: str = None) -> dict:
    """
    Send a direct SMS message via Infobip
    Phone must be in E.164 format: +34612345678
    """
    client = get_infobip_client()
    if not client:
        return {"success": False, "error": "Infobip not configured"}
    
    try:
        # Ensure phone has country code
        if not phone_number.startswith('+'):
            phone_number = '+34' + phone_number.lstrip('0')
        
        # Remove + for Infobip (they expect format without +)
        destination = phone_number.lstrip('+')
        
        payload = {
            "messages": [
                {
                    "destinations": [{"to": destination}],
                    "from": sender or INFOBIP_SENDER,
                    "text": message
                }
            ]
        }
        
        response = await client.post("/sms/2/text/advanced", json=payload)
        response_data = response.json()
        
        if response.status_code in [200, 201]:
            # Check message status
            messages = response_data.get("messages", [])
            if messages:
                msg_status = messages[0].get("status", {})
                group_name = msg_status.get("groupName", "")
                
                if group_name in ["PENDING", "SENT", "DELIVERED"]:
                    return {
                        "success": True,
                        "message_id": messages[0].get("messageId"),
                        "status": msg_status.get("name"),
                        "message": f"SMS enviado a ***{phone_number[-4:]}"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"SMS status: {msg_status.get('description', 'Unknown error')}"
                    }
            
            return {"success": True, "message": "SMS enviado"}
        else:
            error_msg = response_data.get("requestError", {}).get("serviceException", {}).get("text", "Error desconocido")
            return {"success": False, "error": error_msg}
            
    except httpx.TimeoutException:
        return {"success": False, "error": "Timeout al enviar SMS"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def send_sms_bulk(phone_numbers: list, message: str, sender: str = None) -> dict:
    """
    Send SMS to multiple phone numbers
    """
    client = get_infobip_client()
    if not client:
        return {"success": False, "error": "Infobip not configured", "sent": 0}
    
    try:
        # Prepare destinations
        destinations = []
        for phone in phone_numbers:
            if not phone.startswith('+'):
                phone = '+34' + phone.lstrip('0')
            destinations.append({"to": phone.lstrip('+')})
        
        payload = {
            "messages": [
                {
                    "destinations": destinations,
                    "from": sender or INFOBIP_SENDER,
                    "text": message
                }
            ]
        }
        
        response = await client.post("/sms/2/text/advanced", json=payload)
        response_data = response.json()
        
        if response.status_code in [200, 201]:
            messages = response_data.get("messages", [])
            sent_count = sum(1 for m in messages if m.get("status", {}).get("groupName") in ["PENDING", "SENT", "DELIVERED"])
            
            return {
                "success": True,
                "sent": sent_count,
                "total": len(phone_numbers),
                "message": f"SMS enviados: {sent_count}/{len(phone_numbers)}"
            }
        else:
            error_msg = response_data.get("requestError", {}).get("serviceException", {}).get("text", "Error desconocido")
            return {"success": False, "error": error_msg, "sent": 0}
            
    except Exception as e:
        return {"success": False, "error": str(e), "sent": 0}


async def send_verification_code(phone_number: str, code: str) -> dict:
    """
    Send OTP verification code via SMS
    """
    message = f"Tu código de verificación ManoProtect es: {code}. Válido por 10 minutos. No lo compartas con nadie."
    return await send_sms(phone_number, message)


async def send_sos_alert(phone_number: str, sender_name: str, location_url: str, message: str = None) -> dict:
    """
    Send emergency SOS alert SMS
    """
    sms_text = f"🆘 ALERTA SOS - {sender_name} ha activado una emergencia."
    if message:
        sms_text += f"\nMensaje: {message}"
    sms_text += f"\n📍 Ubicación: {location_url}"
    sms_text += "\n\n⚠️ Contacta inmediatamente o llama al 112."
    
    return await send_sms(phone_number, sms_text)


async def send_password_reset_code(phone_number: str, code: str) -> dict:
    """Send password reset verification code"""
    message = f"Tu código para restablecer la contraseña de ManoProtect es: {code}. Válido por 15 minutos."
    return await send_sms(phone_number, message)


async def send_transaction_alert(phone_number: str, amount: float, transaction_type: str, balance: float) -> dict:
    """Send transaction notification"""
    if transaction_type == 'debit':
        message = f"ManoProtect: Cargo de {amount:.2f}€ en tu cuenta. Saldo actual: {balance:.2f}€"
    else:
        message = f"ManoProtect: Abono de {amount:.2f}€ en tu cuenta. Saldo actual: {balance:.2f}€"
    
    return await send_sms(phone_number, message)


async def send_login_alert(phone_number: str, device: str = "dispositivo desconocido", location: str = "ubicación desconocida") -> dict:
    """Send security alert for new login"""
    message = f"ManoProtect: Nuevo acceso detectado desde {device} en {location}. Si no fuiste tú, contacta con soporte inmediatamente."
    return await send_sms(phone_number, message)


async def send_welcome_sms(phone_number: str, customer_name: str) -> dict:
    """Send welcome message to new customer"""
    message = f"¡Bienvenido a ManoProtect, {customer_name}! Tu cuenta está activa. Descarga nuestra app para gestionar tu seguridad familiar."
    return await send_sms(phone_number, message)


async def check_balance() -> dict:
    """Check Infobip account balance (if available)"""
    client = get_infobip_client()
    if not client:
        return {"success": False, "error": "Infobip not configured"}
    
    try:
        response = await client.get("/account/1/balance")
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "balance": data.get("balance"),
                "currency": data.get("currency")
            }
        return {"success": False, "error": "Could not fetch balance"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Sync wrapper for backward compatibility
def send_sms_sync(phone_number: str, message: str) -> dict:
    """Synchronous wrapper for send_sms"""
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If already in async context, create task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, send_sms(phone_number, message))
                return future.result()
        else:
            return loop.run_until_complete(send_sms(phone_number, message))
    except RuntimeError:
        return asyncio.run(send_sms(phone_number, message))
