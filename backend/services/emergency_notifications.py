"""
ManoProtect - Emergency Notification Service
FCM High Priority + SMS Backup for 100% reliable SOS alerts
"""
import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict
import firebase_admin
from firebase_admin import credentials, messaging
from twilio.rest import Client as TwilioClient

# Initialize Firebase Admin SDK
_firebase_initialized = False
_twilio_client = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global _firebase_initialized
    if _firebase_initialized:
        return True
    
    try:
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-admin-sdk.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            print("✅ Firebase Admin SDK initialized")
            return True
        else:
            print("❌ Firebase Admin SDK JSON not found")
            return False
    except Exception as e:
        print(f"❌ Firebase init error: {e}")
        return False

def get_twilio_client():
    """Get Twilio client"""
    global _twilio_client
    if _twilio_client:
        return _twilio_client
    
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    
    if account_sid and auth_token:
        _twilio_client = TwilioClient(account_sid, auth_token)
        print("✅ Twilio client initialized")
        return _twilio_client
    return None

# Initialize on module load
init_firebase()
get_twilio_client()


async def send_fcm_high_priority(
    fcm_tokens: List[str],
    title: str,
    body: str,
    data: Dict = None,
    image_url: str = None
) -> Dict:
    """
    Send FCM notification with HIGH PRIORITY for immediate delivery
    Works even when app is closed on Android
    """
    if not _firebase_initialized:
        init_firebase()
    
    if not fcm_tokens:
        return {"success": False, "error": "No FCM tokens provided"}
    
    results = {
        "success": 0,
        "failure": 0,
        "errors": []
    }
    
    for token in fcm_tokens:
        try:
            # Create message with HIGH PRIORITY
            message = messaging.Message(
                token=token,
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=image_url
                ),
                data=data or {},
                android=messaging.AndroidConfig(
                    priority='high',  # HIGH PRIORITY - immediate delivery
                    ttl=0,  # No delay
                    notification=messaging.AndroidNotification(
                        title=title,
                        body=body,
                        icon='ic_notification',
                        color='#DC2626',  # Red for emergency
                        sound='default',
                        priority='max',  # Maximum priority
                        visibility='public',
                        channel_id='sos_emergency',  # Emergency channel
                        tag='sos_alert',
                        click_action='OPEN_SOS_ALERT'
                    )
                ),
                webpush=messaging.WebpushConfig(
                    headers={
                        'Urgency': 'high',
                        'TTL': '0'
                    },
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icons/sos-icon-192.png',
                        badge='/icons/sos-icon-192.png',
                        tag='sos_emergency',
                        require_interaction=True,
                        vibrate=[500, 200, 500, 200, 500],
                        actions=[
                            messaging.WebpushNotificationAction(
                                action='view',
                                title='Ver ubicación'
                            ),
                            messaging.WebpushNotificationAction(
                                action='call',
                                title='Llamar 112'
                            )
                        ]
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link=data.get('url', '/sos-alert') if data else '/sos-alert'
                    )
                ),
                apns=messaging.APNSConfig(
                    headers={
                        'apns-priority': '10',  # Immediate delivery
                        'apns-push-type': 'alert'
                    },
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=title,
                                body=body
                            ),
                            sound='default',
                            badge=1,
                            content_available=True,
                            mutable_content=True,
                            category='SOS_ALERT'
                        )
                    )
                )
            )
            
            # Send synchronously (Firebase Admin SDK is sync)
            response = messaging.send(message)
            results["success"] += 1
            print(f"✅ FCM sent: {response}")
            
        except Exception as e:
            results["failure"] += 1
            results["errors"].append(str(e))
            print(f"❌ FCM error: {e}")
    
    return results


async def send_sms_emergency(
    phone_numbers: List[str],
    sender_name: str,
    message: str,
    location_url: str = None
) -> Dict:
    """
    Send emergency SMS via Twilio as backup
    """
    client = get_twilio_client()
    if not client:
        print("⚠️ Twilio not configured - SMS not sent")
        return {"success": False, "error": "Twilio not configured"}
    
    # Get Twilio phone number
    twilio_number = os.environ.get('TWILIO_PHONE_NUMBER', '+12513137701')
    
    results = {
        "success": 0,
        "failure": 0,
        "errors": []
    }
    
    print(f"📱 Attempting to send SMS to {len(phone_numbers)} numbers via {twilio_number}")
    
    for phone in phone_numbers:
        if not phone or len(phone) < 9:
            print(f"⚠️ Invalid phone number skipped: {phone}")
            continue
            
        # Format phone number
        if not phone.startswith('+'):
            if phone.startswith('34'):
                phone = '+' + phone
            else:
                phone = '+34' + phone.lstrip('0')
        
        try:
            # Compose emergency message
            sms_body = f"🚨 EMERGENCIA SOS - ManoProtect\n\n"
            sms_body += f"{sender_name} ha activado una alerta de emergencia.\n\n"
            sms_body += f"{message}\n\n"
            if location_url:
                sms_body += f"📍 Ubicación: {location_url}\n\n"
            sms_body += "Abre la app ManoProtect para más detalles."
            
            # Send SMS
            sms = client.messages.create(
                body=sms_body,
                from_=twilio_number,
                to=phone
            )
            
            results["success"] += 1
            print(f"✅ SMS sent to {phone}: {sms.sid}")
            
        except Exception as e:
            results["failure"] += 1
            error_msg = str(e)
            results["errors"].append(f"{phone}: {error_msg}")
            print(f"❌ SMS error to {phone}: {error_msg}")
            
            # Check if it's a Twilio config error
            if "Mismatch" in error_msg or "not a valid" in error_msg:
                print("⚠️ TWILIO CONFIG ERROR: Please verify your Twilio phone number and account settings")
    
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
    1. FCM High Priority (instant even with app closed)
    2. SMS Backup (if FCM fails or no token)
    
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
    if location and location.get('latitude') and location.get('longitude'):
        location_url = f"https://maps.google.com/?q={location['latitude']},{location['longitude']}"
    
    # Collect FCM tokens and phone numbers
    fcm_tokens = []
    phone_numbers = []
    contacts_without_fcm = []
    
    for contact in contacts:
        contact_user_id = contact.get('user_id') or contact.get('contact_id') or contact.get('id')
        contact_email = contact.get('email')
        
        # Get FCM token from database - try multiple methods
        if db is not None:
            fcm_sub = None
            
            # Try by user_id first
            if contact_user_id:
                fcm_sub = await db.fcm_tokens.find_one(
                    {"user_id": contact_user_id},
                    {"_id": 0, "fcm_token": 1}
                )
            
            # Try by email if no user_id match
            if not fcm_sub and contact_email:
                # Find user by email first
                user_doc = await db.users.find_one(
                    {"email": contact_email.lower()},
                    {"_id": 0, "user_id": 1}
                )
                if user_doc:
                    fcm_sub = await db.fcm_tokens.find_one(
                        {"user_id": user_doc["user_id"]},
                        {"_id": 0, "fcm_token": 1}
                    )
            
            if fcm_sub and fcm_sub.get('fcm_token'):
                fcm_tokens.append(fcm_sub['fcm_token'])
            else:
                contacts_without_fcm.append(contact)
        
        # Always collect phone for SMS backup
        phone = contact.get('phone')
        if phone:
            phone_numbers.append(phone)
    
    # 1. Send FCM High Priority notifications
    if fcm_tokens:
        fcm_data = {
            "type": "sos_alert",
            "alert_id": alert_id,
            "sender_name": sender_name,
            "sender_email": sender_email,
            "latitude": str(location.get('latitude', 0)),
            "longitude": str(location.get('longitude', 0)),
            "url": f"/sos-alert?alert={alert_id}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        fcm_results = await send_fcm_high_priority(
            fcm_tokens=fcm_tokens,
            title=f"🚨 ¡EMERGENCIA SOS! - {sender_name}",
            body=f"{sender_name} necesita ayuda urgente. Pulsa para ver su ubicación.",
            data=fcm_data
        )
        
        results["fcm_sent"] = fcm_results.get("success", 0)
        results["fcm_failed"] = fcm_results.get("failure", 0)
    
    # 2. Send SMS to ALL contacts as backup (SMS is the most reliable for emergencies)
    # Collect all phone numbers
    all_phone_numbers = list(set(phone_numbers))  # Remove duplicates
    
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


async def register_fcm_token(db, user_id: str, fcm_token: str, platform: str = "web") -> bool:
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
