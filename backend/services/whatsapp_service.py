"""
ManoProtect - WhatsApp SOS Alert Service
Sends emergency alerts via WhatsApp using Twilio API
"""
import os
from twilio.rest import Client
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    """Service for sending WhatsApp SOS alerts"""
    
    def __init__(self):
        """Initialize Twilio client"""
        self.account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        self.auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        self.whatsapp_number = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
            self.enabled = True
            logger.info("WhatsApp service initialized successfully")
        else:
            self.client = None
            self.enabled = False
            logger.warning("WhatsApp service disabled - missing Twilio credentials")
    
    def format_phone_for_whatsapp(self, phone: str) -> str:
        """Format phone number for WhatsApp"""
        # Remove any existing 'whatsapp:' prefix
        phone = phone.replace('whatsapp:', '')
        # Remove spaces and dashes
        phone = ''.join(filter(lambda x: x.isdigit() or x == '+', phone))
        # Ensure it starts with +
        if not phone.startswith('+'):
            # Assume Spanish number if no country code
            if phone.startswith('34'):
                phone = '+' + phone
            else:
                phone = '+34' + phone
        return f"whatsapp:{phone}"
    
    def send_sos_alert(
        self,
        recipient_phone: str,
        user_name: str,
        latitude: float,
        longitude: float,
        custom_message: Optional[str] = None
    ) -> dict:
        """
        Send an emergency SOS alert via WhatsApp
        
        Args:
            recipient_phone: Recipient phone number
            user_name: Name of person triggering SOS
            latitude: GPS latitude
            longitude: GPS longitude
            custom_message: Optional custom message
        
        Returns:
            Dictionary with success status and details
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "WhatsApp service not configured",
                "recipient": recipient_phone
            }
        
        try:
            # Format recipient phone
            to_number = self.format_phone_for_whatsapp(recipient_phone)
            
            # Create Google Maps URL
            maps_url = f"https://www.google.com/maps?q={latitude},{longitude}"
            
            # Create emergency message in Spanish
            if custom_message:
                message_body = custom_message
            else:
                message_body = (
                    f"🚨 *ALERTA DE EMERGENCIA SOS* 🚨\n\n"
                    f"*{user_name}* ha activado el botón de emergencia y necesita ayuda.\n\n"
                    f"📍 *Ubicación actual:*\n{maps_url}\n\n"
                    f"Por favor, verifica su estado inmediatamente.\n\n"
                    f"_Enviado desde ManoProtect_"
                )
            
            # Send WhatsApp message
            message = self.client.messages.create(
                from_=self.whatsapp_number,
                to=to_number,
                body=message_body
            )
            
            logger.info(f"SOS WhatsApp alert sent to {recipient_phone}, SID: {message.sid}")
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status,
                "recipient": recipient_phone,
                "to": to_number
            }
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp SOS alert: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "recipient": recipient_phone
            }
    
    def send_bulk_sos_alerts(
        self,
        recipients: List[str],
        user_name: str,
        latitude: float,
        longitude: float
    ) -> List[dict]:
        """
        Send SOS alerts to multiple recipients
        
        Args:
            recipients: List of phone numbers
            user_name: Name of person triggering SOS
            latitude: GPS latitude
            longitude: GPS longitude
        
        Returns:
            List of results for each recipient
        """
        results = []
        
        for recipient in recipients:
            result = self.send_sos_alert(
                recipient_phone=recipient,
                user_name=user_name,
                latitude=latitude,
                longitude=longitude
            )
            results.append(result)
        
        # Log summary
        successful = sum(1 for r in results if r.get("success"))
        logger.info(f"Bulk SOS alerts: {successful}/{len(recipients)} sent successfully")
        
        return results
    
    def send_test_message(self, recipient_phone: str) -> dict:
        """
        Send a test message to verify WhatsApp integration
        
        Args:
            recipient_phone: Phone number to send test to
        
        Returns:
            Dictionary with success status
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "WhatsApp service not configured"
            }
        
        try:
            to_number = self.format_phone_for_whatsapp(recipient_phone)
            
            message = self.client.messages.create(
                from_=self.whatsapp_number,
                to=to_number,
                body=(
                    "✅ *ManoProtect - Prueba de conexión*\n\n"
                    "Este es un mensaje de prueba del sistema de alertas SOS.\n"
                    "Tu WhatsApp está correctamente conectado.\n\n"
                    "_Sistema ManoProtect_"
                )
            )
            
            logger.info(f"Test WhatsApp message sent, SID: {message.sid}")
            
            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status
            }
            
        except Exception as e:
            logger.error(f"Failed to send test WhatsApp message: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }


# Global instance
whatsapp_service = WhatsAppService()
