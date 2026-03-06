"""
ManoProtect - Emergency Notification Service
FCM DATA MESSAGES with High Priority + Infobip SMS Backup

CRÍTICO: Este servicio envía DATA MESSAGES (no notification messages)
para que la app Android pueda procesarlos en segundo plano y activar
la sirena usando AudioManager.STREAM_ALARM
"""
import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict
import firebase_admin
from firebase_admin import credentials, messaging

# Import Infobip SMS service
from services.infobip_sms import send_sms, send_sos_alert as send_sos_sms, is_configured as infobip_configured

# Initialize Firebase Admin SDK
_firebase_initialized = False

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global _firebase_initialized
    if _firebase_initialized:
        return True
    
    try:
        fb_project = os.environ.get('FIREBASE_PROJECT_ID')
        fb_email = os.environ.get('FIREBASE_CLIENT_EMAIL')
        fb_key = os.environ.get('FIREBASE_PRIVATE_KEY')
        if fb_project and fb_email and fb_key:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": fb_project,
                "client_email": fb_email,
                "private_key": fb_key.replace('\\n', '\n'),
                "token_uri": "https://oauth2.googleapis.com/token"
            })
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            print("Firebase Admin SDK initialized from env vars")
            return True
        else:
            print("Firebase credentials not configured in .env")
            return False
    except Exception as e:
        if "already exists" in str(e):
            _firebase_initialized = True
            return True
        print(f"Firebase init error: {e}")
        return False

# Initialize on module load
init_firebase()

# Check Infobip configuration
if infobip_configured():
    print("✅ Infobip SMS initialized")
else:
    print("⚠️ Infobip SMS not configured")


async def send_fcm_data_message(
    fcm_tokens: List[str],
    data: Dict
) -> Dict:
    """
    Send FCM DATA MESSAGE with HIGH PRIORITY for critical alerts
    
    IMPORTANTE: Usamos DATA MESSAGES (no notification messages)
    Esto permite que la app reciba los datos en segundo plano
    y ejecute código ANTES de mostrar nada al usuario.
    
    El servicio nativo de Android (SOSFirebaseMessagingService) procesará
    estos datos y activará:
    - Sirena usando AudioManager.STREAM_ALARM (ignora modo silencioso)
    - Volumen al 100%
    - Vibración continua
    - GPS tracking en segundo plano
    - Pantalla sobre lock screen
    """
    if not _firebase_initialized:
        init_firebase()
    
    if not fcm_tokens:
        return {"success": 0, "failure": 0, "errors": ["No FCM tokens provided"]}
    
    results = {
        "success": 0,
        "failure": 0,
        "errors": []
    }
    
    # Ensure all data values are strings (FCM requirement)
    string_data = {k: str(v) if v is not None else "" for k, v in data.items()}
    
    for token in fcm_tokens:
        try:
            # Create DATA-ONLY message (NO notification payload)
            # This ensures the app can process data in background
            message = messaging.Message(
                token=token,
                # NO notification field - only data payload
                data=string_data,
                android=messaging.AndroidConfig(
                    priority='high',  # CRITICAL: High priority for immediate delivery
                    ttl=0,  # No delay - deliver immediately even in Doze mode
                ),
                # For web push (PWA fallback)
                webpush=messaging.WebpushConfig(
                    headers={
                        'Urgency': 'high',
                        'TTL': '0'
                    },
                    data=string_data
                ),
                # For iOS (if ever needed)
                apns=messaging.APNSConfig(
                    headers={
                        'apns-priority': '10',
                        'apns-push-type': 'background'
                    },
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            content_available=True
                        ),
                        custom_data=string_data
                    )
                )
            )
            
            response = messaging.send(message)
            results["success"] += 1
            print(f"✅ FCM DATA message sent: {response}")
            
        except Exception as e:
            results["failure"] += 1
            results["errors"].append(str(e))
            print(f"❌ FCM error: {e}")
    
    return results


async def send_sos_critical_alert(
    fcm_tokens: List[str],
    alert_id: str,
    sender_name: str,
    sender_email: str,
    latitude: float,
    longitude: float,
    message: str = "Necesita tu ayuda"
) -> Dict:
    """
    Enviar AVISO PERSONAL SOS a contactos de emergencia
    
    IMPORTANTE: Este es un AVISO PERSONAL, NO una alerta oficial.
    Cumple con políticas de Google Play.
    """
    data = {
        "type": "sos_alert",
        "alert_id": alert_id,
        "sender_name": sender_name,
        "sender_email": sender_email,
        "latitude": str(latitude),
        "longitude": str(longitude),
        # Mensaje claro: aviso personal, no oficial
        "message": f"Aviso personal: {sender_name} {message}",
        "title": f"Aviso de {sender_name}",
        "disclaimer": "Este es un mensaje privado entre contactos de emergencia, no una alerta oficial.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "url": f"/sos-alert?alert={alert_id}"
    }
    
    print(f"📱 Sending personal SOS alert to {len(fcm_tokens)} contacts")
    return await send_fcm_data_message(fcm_tokens, data)


async def send_siren_stop(
    fcm_tokens: List[str],
    alert_id: str,
    acknowledged_by: str,
    reason: str = "acknowledged"
) -> Dict:
    """
    Enviar señal para DETENER SIRENA en todos los dispositivos
    
    Esta función se llama cuando un familiar pulsa "Enterado".
    Envía un DATA MESSAGE que será procesado por
    SOSFirebaseMessagingService, el cual:
    1. Detiene la sirena
    2. Detiene la vibración
    3. Restaura el volumen original
    4. Cierra la pantalla de lock screen
    """
    data = {
        "type": "siren_stop",
        "alert_id": alert_id,
        "acknowledged_by": acknowledged_by,
        "reason": reason,
        "message": f"{acknowledged_by} está atendiendo la emergencia",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    print(f"🔇 Sending SIREN STOP to {len(fcm_tokens)} devices")
    return await send_fcm_data_message(fcm_tokens, data)


async def send_location_update(
    fcm_tokens: List[str],
    alert_id: str,
    latitude: float,
    longitude: float
) -> Dict:
    """
    Enviar actualización de ubicación a familiares durante emergencia
    """
    data = {
        "type": "location_update",
        "alert_id": alert_id,
        "latitude": str(latitude),
        "longitude": str(longitude),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    return await send_fcm_data_message(fcm_tokens, data)


async def send_sms_emergency(
    phone_numbers: List[str],
    sender_name: str,
    message: str,
    location_url: str = None
) -> Dict:
    """
    Send emergency SMS via Infobip as backup
    """
    if not infobip_configured():
        print("⚠️ Infobip not configured - SMS not sent")
        return {"success": 0, "failure": 0, "errors": ["Infobip not configured"]}
    
    results = {
        "success": 0,
        "failure": 0,
        "errors": []
    }
    
    print(f"📱 Sending SMS to {len(phone_numbers)} phone numbers via Infobip")
    
    for phone in phone_numbers:
        if not phone or len(phone) < 9:
            print(f"⚠️ Invalid phone number skipped: {phone}")
            continue
        
        try:
            result = await send_sos_sms(
                phone_number=phone,
                sender_name=sender_name,
                location_url=location_url,
                message=message
            )
            
            if result.get("success"):
                results["success"] += 1
                print(f"✅ SMS sent to {phone[-4:].rjust(len(phone), '*')}")
            else:
                results["failure"] += 1
                results["errors"].append(f"{phone}: {result.get('error', 'Unknown error')}")
                print(f"❌ SMS error to {phone}: {result.get('error')}")
                
        except Exception as e:
            results["failure"] += 1
            results["errors"].append(f"{phone}: {str(e)}")
            print(f"❌ SMS exception to {phone}: {e}")
    
    return results


async def send_sos_notifications(
    alert_id: str,
    sender_name: str,
    sender_email: str,
    message: str,
    location: Dict,
    contacts: List[Dict],
    db = None
) -> Dict:
    """
    Main function to send SOS notifications through all channels:
    1. FCM DATA MESSAGES with High Priority (instant, activates native siren)
    2. Infobip SMS Backup (if FCM fails or no token)
    
    Returns summary of all notifications sent
    """
    results = {
        "fcm_sent": 0,
        "fcm_failed": 0,
        "sms_sent": 0,
        "sms_failed": 0,
        "total_contacts": len(contacts),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if not contacts:
        return results
    
    # Build location URL
    location_url = None
    lat = location.get('latitude', 0)
    lng = location.get('longitude', 0)
    if lat and lng:
        location_url = f"https://maps.google.com/?q={lat},{lng}"
    
    # Collect FCM tokens and phone numbers
    fcm_tokens = []
    phone_numbers = []
    
    for contact in contacts:
        contact_user_id = contact.get('user_id') or contact.get('contact_id') or contact.get('id') or contact.get('member_user_id')
        contact_email = contact.get('email') or contact.get('member_email')
        
        # Get FCM token from database
        if db is not None and contact_user_id:
            # Try fcm_tokens collection first
            fcm_sub = await db.fcm_tokens.find_one(
                {"user_id": contact_user_id},
                {"_id": 0, "fcm_token": 1}
            )
            
            # Try push_subscriptions as fallback
            if not fcm_sub:
                fcm_sub = await db.push_subscriptions.find_one(
                    {"user_id": contact_user_id},
                    {"_id": 0, "fcm_token": 1}
                )
            
            # Try by email if no user_id match
            if not fcm_sub and contact_email:
                user_doc = await db.users.find_one(
                    {"email": contact_email.lower()},
                    {"_id": 0, "user_id": 1}
                )
                if user_doc:
                    fcm_sub = await db.fcm_tokens.find_one(
                        {"user_id": user_doc["user_id"]},
                        {"_id": 0, "fcm_token": 1}
                    )
                    if not fcm_sub:
                        fcm_sub = await db.push_subscriptions.find_one(
                            {"user_id": user_doc["user_id"]},
                            {"_id": 0, "fcm_token": 1}
                        )
            
            if fcm_sub and fcm_sub.get('fcm_token'):
                fcm_tokens.append(fcm_sub['fcm_token'])
        
        # Always collect phone for SMS backup
        phone = contact.get('phone') or contact.get('member_phone')
        if phone:
            phone_numbers.append(phone)
    
    # 1. Send FCM DATA MESSAGES with critical alert
    if fcm_tokens:
        fcm_results = await send_sos_critical_alert(
            fcm_tokens=fcm_tokens,
            alert_id=alert_id,
            sender_name=sender_name,
            sender_email=sender_email,
            latitude=lat,
            longitude=lng,
            message=message
        )
        
        results["fcm_sent"] = fcm_results.get("success", 0)
        results["fcm_failed"] = fcm_results.get("failure", 0)
    
    # 2. Send SMS to ALL contacts as backup via Infobip
    all_phone_numbers = list(set(phone_numbers))
    
    if all_phone_numbers:
        print(f"📱 Sending SMS to {len(all_phone_numbers)} phone numbers as backup")
        sms_results = await send_sms_emergency(
            phone_numbers=all_phone_numbers,
            sender_name=sender_name,
            message=message,
            location_url=location_url
        )
        
        results["sms_sent"] = sms_results.get("success", 0)
        results["sms_failed"] = sms_results.get("failure", 0)
    else:
        print("⚠️ No phone numbers available for SMS backup")
    
    print(f"📊 SOS Notifications Summary: FCM={results['fcm_sent']}, SMS={results['sms_sent']}")
    
    return results


async def register_fcm_token(db, user_id: str, fcm_token: str, platform: str = "android") -> bool:
    """
    Register or update FCM token for a user
    """
    try:
        await db.fcm_tokens.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "fcm_token": fcm_token,
                    "platform": platform,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        print(f"✅ FCM token registered for user {user_id}")
        return True
    except Exception as e:
        print(f"❌ Error registering FCM token: {e}")
        return False
