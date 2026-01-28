"""
Twilio SMS Service for ManoProtect
- Verification codes (OTP)
- Password reset
- Transaction alerts
- Security notifications
"""
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Twilio credentials from environment
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_VERIFY_SERVICE_SID = os.environ.get('TWILIO_VERIFY_SERVICE_SID')

# Initialize Twilio client
_client = None

def get_twilio_client():
    global _client
    if _client is None and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        _client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    return _client


def send_verification_code(phone_number: str) -> dict:
    """
    Send OTP verification code via SMS
    Phone must be in E.164 format: +34612345678
    """
    client = get_twilio_client()
    if not client:
        return {"success": False, "error": "Twilio not configured"}
    
    try:
        # Ensure phone has country code
        if not phone_number.startswith('+'):
            phone_number = '+34' + phone_number.lstrip('0')
        
        verification = client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID) \
            .verifications \
            .create(to=phone_number, channel='sms')
        
        return {
            "success": True,
            "status": verification.status,
            "message": f"Código enviado a {phone_number[-4:].rjust(len(phone_number), '*')}"
        }
    except TwilioRestException as e:
        return {"success": False, "error": str(e)}


def verify_code(phone_number: str, code: str) -> dict:
    """
    Verify the OTP code entered by user
    """
    client = get_twilio_client()
    if not client:
        return {"success": False, "error": "Twilio not configured"}
    
    try:
        if not phone_number.startswith('+'):
            phone_number = '+34' + phone_number.lstrip('0')
        
        verification_check = client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID) \
            .verification_checks \
            .create(to=phone_number, code=code)
        
        if verification_check.status == 'approved':
            return {"success": True, "verified": True, "message": "Código verificado correctamente"}
        else:
            return {"success": False, "verified": False, "message": "Código incorrecto o expirado"}
    except TwilioRestException as e:
        return {"success": False, "error": str(e)}


def send_sms(phone_number: str, message: str) -> dict:
    """
    Send a direct SMS message (for alerts, notifications)
    Requires a Twilio phone number for 'from'
    """
    client = get_twilio_client()
    if not client:
        return {"success": False, "error": "Twilio not configured"}
    
    try:
        if not phone_number.startswith('+'):
            phone_number = '+34' + phone_number.lstrip('0')
        
        # Get first available Twilio number
        incoming_numbers = client.incoming_phone_numbers.list(limit=1)
        if not incoming_numbers:
            return {"success": False, "error": "No Twilio phone number configured"}
        
        from_number = incoming_numbers[0].phone_number
        
        sms = client.messages.create(
            body=message,
            from_=from_number,
            to=phone_number
        )
        
        return {
            "success": True,
            "sid": sms.sid,
            "status": sms.status,
            "message": "SMS enviado correctamente"
        }
    except TwilioRestException as e:
        return {"success": False, "error": str(e)}


def send_password_reset_code(phone_number: str) -> dict:
    """Send password reset verification code"""
    return send_verification_code(phone_number)


def send_transaction_alert(phone_number: str, amount: float, transaction_type: str, balance: float) -> dict:
    """Send transaction notification"""
    if transaction_type == 'debit':
        message = f"ManoProtect: Cargo de {amount:.2f}€ en tu cuenta. Saldo actual: {balance:.2f}€"
    else:
        message = f"ManoProtect: Abono de {amount:.2f}€ en tu cuenta. Saldo actual: {balance:.2f}€"
    
    return send_sms(phone_number, message)


def send_login_alert(phone_number: str, device: str = "dispositivo desconocido", location: str = "ubicación desconocida") -> dict:
    """Send security alert for new login"""
    message = f"ManoProtect: Nuevo acceso detectado desde {device} en {location}. Si no fuiste tú, contacta con soporte inmediatamente."
    return send_sms(phone_number, message)


def send_card_blocked_alert(phone_number: str, card_last4: str) -> dict:
    """Send alert when card is blocked"""
    message = f"ManoProtect: Tu tarjeta terminada en {card_last4} ha sido bloqueada por seguridad. Contacta con soporte para desbloquearla."
    return send_sms(phone_number, message)


def send_welcome_sms(phone_number: str, customer_name: str) -> dict:
    """Send welcome message to new customer"""
    message = f"¡Bienvenido a ManoProtect, {customer_name}! Tu cuenta está activa. Descarga nuestra app para gestionar tus finanzas. Soporte: soporte@manoprotect.es"
    return send_sms(phone_number, message)
