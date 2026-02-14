"""
ManoProtect - SMS Service using Infobip
Handles 2FA verification codes via SMS
"""
import os
import httpx
import random
import string
from datetime import datetime, timezone, timedelta
from typing import Optional

class SMSService:
    def __init__(self):
        self.api_key = os.environ.get('INFOBIP_API_KEY')
        self.base_url = os.environ.get('INFOBIP_BASE_URL', 'https://api.infobip.com')
        self.sender = os.environ.get('INFOBIP_SENDER', 'ManoProtect')
        
    def generate_code(self, length: int = 6) -> str:
        """Generate a random numeric verification code"""
        return ''.join(random.choices(string.digits, k=length))
    
    async def send_verification_code(self, phone_number: str, code: str) -> dict:
        """
        Send SMS verification code via Infobip
        
        Args:
            phone_number: Phone number with country code (e.g., +34601510950)
            code: 6-digit verification code
            
        Returns:
            dict with success status and message
        """
        if not self.api_key:
            return {"success": False, "error": "Infobip API key not configured"}
        
        # Clean phone number (remove spaces, ensure + prefix)
        clean_phone = phone_number.replace(" ", "").replace("-", "")
        if not clean_phone.startswith("+"):
            clean_phone = f"+{clean_phone}"
        
        message = f"ManoProtect: Tu código de verificación es {code}. Válido por 5 minutos. No compartas este código."
        
        payload = {
            "messages": [
                {
                    "destinations": [{"to": clean_phone}],
                    "from": self.sender,
                    "text": message
                }
            ]
        }
        
        headers = {
            "Authorization": f"App {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/sms/2/text/advanced",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    print(f"[SMS] Code sent to {clean_phone[-4:]}: {data}")
                    return {
                        "success": True,
                        "message": "Código enviado por SMS",
                        "phone_masked": f"***{clean_phone[-4:]}"
                    }
                else:
                    error_text = response.text
                    print(f"[SMS] Error: {response.status_code} - {error_text}")
                    return {
                        "success": False,
                        "error": f"Error al enviar SMS: {response.status_code}"
                    }
                    
        except Exception as e:
            print(f"[SMS] Exception: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_login_alert(self, phone_number: str, ip_address: str) -> dict:
        """Send security alert for new login"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        clean_phone = phone_number.replace(" ", "").replace("-", "")
        if not clean_phone.startswith("+"):
            clean_phone = f"+{clean_phone}"
        
        message = f"ManoProtect: Nuevo acceso detectado desde IP {ip_address}. Si no fuiste tú, contacta con soporte inmediatamente."
        
        payload = {
            "messages": [
                {
                    "destinations": [{"to": clean_phone}],
                    "from": self.sender,
                    "text": message
                }
            ]
        }
        
        headers = {
            "Authorization": f"App {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/sms/2/text/advanced",
                    json=payload,
                    headers=headers
                )
                return {"success": response.status_code in [200, 201]}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Global instance
sms_service = SMSService()
