"""
MANO - SendGrid Email Integration
Handles transactional emails, alerts, and notifications
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, BackgroundTasks
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import os
import uuid

router = APIRouter(prefix="/email", tags=["Email"])
alerts_router = APIRouter(prefix="/alerts", tags=["Alerts"])

# Database reference (initialized in init_email_routes)
db = None

def init_email_routes(database):
    """Initialize email routes with database"""
    global db
    db = database

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@manoprotect.com')


class EmailRequest(BaseModel):
    to: EmailStr
    subject: str
    content: str
    content_type: str = "html"  # "html" or "plain"


class ThreatAlertEmail(BaseModel):
    to: EmailStr
    threat_type: str
    risk_level: str
    description: str


class WelcomeEmail(BaseModel):
    to: EmailStr
    name: str


class ReceiptEmail(BaseModel):
    to: EmailStr
    name: str
    plan_name: str
    amount: float
    currency: str = "EUR"


async def send_email(to: str, subject: str, html_content: str) -> bool:
    """Send email via SendGrid"""
    if not SENDGRID_API_KEY:
        print(f"[EMAIL MOCK] SendGrid no configurado. Email a {to}: {subject}")
        return True
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=to,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code == 202
        
    except ImportError:
        print(f"[EMAIL MOCK] SendGrid SDK no instalado. Email a {to}: {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


# Email Templates
def get_welcome_template(name: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🛡️ Bienvenido a MANO</h1>
        </div>
        <div class="content">
            <h2>¡Hola {name}!</h2>
            <p>Gracias por unirte a MANO, tu escudo digital contra fraudes y estafas.</p>
            <p>Con MANO podrás:</p>
            <ul>
                <li>✅ Analizar mensajes sospechosos con IA</li>
                <li>✅ Proteger a tu familia de estafas</li>
                <li>✅ Recibir alertas en tiempo real</li>
                <li>✅ Acceder a nuestra base de conocimiento</li>
            </ul>
            <a href="https://manoprotect.com/dashboard" class="button">Acceder al Dashboard</a>
        </div>
        <div class="footer">
            <p>© 2025 MANO Protect. Todos los derechos reservados.</p>
            <p>Si no creaste esta cuenta, ignora este email.</p>
        </div>
    </body>
    </html>
    """


def get_threat_alert_template(threat_type: str, risk_level: str, description: str) -> str:
    risk_color = "#ef4444" if risk_level == "alto" else "#f59e0b" if risk_level == "medio" else "#22c55e"
    risk_emoji = "🔴" if risk_level == "alto" else "🟡" if risk_level == "medio" else "🟢"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {risk_color}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .alert-box {{ background: white; border-left: 4px solid {risk_color}; padding: 15px; margin: 20px 0; }}
            .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{risk_emoji} Alerta de Seguridad</h1>
        </div>
        <div class="content">
            <h2>Se ha detectado una posible amenaza</h2>
            <div class="alert-box">
                <p><strong>Tipo:</strong> {threat_type}</p>
                <p><strong>Nivel de riesgo:</strong> {risk_level.upper()}</p>
                <p><strong>Descripción:</strong> {description}</p>
            </div>
            <p>Te recomendamos revisar esta alerta y tomar las precauciones necesarias.</p>
            <a href="https://manoprotect.com/dashboard" class="button">Ver Detalles</a>
        </div>
    </body>
    </html>
    """


def get_receipt_template(name: str, plan_name: str, amount: float, currency: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .receipt-box {{ background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }}
            .amount {{ font-size: 32px; font-weight: bold; color: #10b981; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✅ ¡Gracias por tu compra!</h1>
        </div>
        <div class="content">
            <h2>Hola {name},</h2>
            <p>Tu suscripción a MANO ha sido activada correctamente.</p>
            
            <div class="receipt-box">
                <h3>Recibo de compra</h3>
                <p><strong>Plan:</strong> {plan_name}</p>
                <p><strong>Importe:</strong></p>
                <p class="amount">€{amount:.2f} {currency}</p>
                <p><strong>Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
            </div>
            
            <h3>¿Qué incluye tu plan?</h3>
            <ul>
                <li>✅ Análisis ilimitados con IA</li>
                <li>✅ Protección 24/7</li>
                <li>✅ Soporte prioritario</li>
                <li>✅ Todas las funciones Premium</li>
            </ul>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
            <p>© 2025 MANO Protect</p>
            <p>Este recibo ha sido generado automáticamente.</p>
        </div>
    </body>
    </html>
    """


# API Routes
@router.get("/status")
async def get_email_status():
    """Check if email service is configured"""
    is_configured = bool(SENDGRID_API_KEY)
    return {
        "configured": is_configured,
        "provider": "SendGrid",
        "sender": SENDER_EMAIL,
        "message": "Email configurado correctamente" if is_configured else "MOCKED - Configura SENDGRID_API_KEY en .env"
    }


@router.post("/send/welcome")
async def send_welcome_email(
    data: WelcomeEmail,
    background_tasks: BackgroundTasks
):
    """Send welcome email to new user"""
    html_content = get_welcome_template(data.name)
    subject = f"🛡️ Bienvenido a MANO, {data.name}!"
    
    background_tasks.add_task(send_email, data.to, subject, html_content)
    
    return {
        "status": "queued",
        "message": "Email de bienvenida enviado"
    }


@router.post("/send/threat-alert")
async def send_threat_alert_email(
    data: ThreatAlertEmail,
    background_tasks: BackgroundTasks
):
    """Send threat alert email"""
    html_content = get_threat_alert_template(
        data.threat_type,
        data.risk_level,
        data.description
    )
    subject = f"⚠️ Alerta de Seguridad MANO - {data.threat_type}"
    
    background_tasks.add_task(send_email, data.to, subject, html_content)
    
    return {
        "status": "queued",
        "message": "Alerta enviada por email"
    }


@router.post("/send/receipt")
async def send_receipt_email(
    data: ReceiptEmail,
    background_tasks: BackgroundTasks
):
    """Send purchase receipt email"""
    html_content = get_receipt_template(
        data.name,
        data.plan_name,
        data.amount,
        data.currency
    )
    subject = f"✅ Recibo de tu suscripción MANO - {data.plan_name}"
    
    background_tasks.add_task(send_email, data.to, subject, html_content)
    
    return {
        "status": "queued",
        "message": "Recibo enviado por email"
    }


@router.post("/send/custom")
async def send_custom_email(
    data: EmailRequest,
    background_tasks: BackgroundTasks
):
    """Send custom email"""
    background_tasks.add_task(send_email, data.to, data.subject, data_content)
    
    return {
        "status": "queued",
        "message": "Email enviado"
    }


# ============================================
# FRAUD ALERT SUBSCRIPTION MODELS
# ============================================

class AlertSubscription(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    alert_types: List[str] = ["all"]  # phishing, smishing, vishing, identity-theft, all
    frequency: str = "immediate"  # immediate, daily, weekly


class AlertUnsubscribe(BaseModel):
    email: EmailStr
    token: str


class NewThreatAlert(BaseModel):
    threat_type: str
    title: str
    description: str
    risk_level: str = "alto"  # alto, medio, bajo
    source: Optional[str] = None
    affected_entities: Optional[List[str]] = []


# ============================================
# EMAIL TEMPLATES FOR ALERTS
# ============================================

def get_alert_subscription_template(name: str, unsubscribe_token: str) -> str:
    """Template for subscription confirmation"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .success-box {{ background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
            .unsubscribe {{ color: #9ca3af; font-size: 11px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🛡️ ¡Suscripción Activada!</h1>
        </div>
        <div class="content">
            <h2>Hola {name or 'Usuario'},</h2>
            <div class="success-box">
                <p style="color: #10b981; font-size: 18px; margin: 0;">✅ Te has suscrito a las alertas de seguridad de ManoProtect</p>
            </div>
            <p>A partir de ahora recibirás notificaciones sobre:</p>
            <ul>
                <li>🎣 Nuevas campañas de phishing detectadas</li>
                <li>📱 Alertas de smishing y SMS fraudulentos</li>
                <li>📞 Estafas telefónicas (vishing) activas</li>
                <li>🆔 Intentos de suplantación de identidad</li>
                <li>🏦 Fraudes financieros en circulación</li>
            </ul>
            <p>Mantente un paso adelante de los ciberdelincuentes.</p>
        </div>
        <div class="footer">
            <p>© 2025 ManoProtect. Tu escudo digital contra fraudes.</p>
            <p class="unsubscribe">¿Ya no quieres recibir alertas? <a href="https://manoprotect.com/unsubscribe?token={unsubscribe_token}">Darse de baja</a></p>
        </div>
    </body>
    </html>
    """


def get_new_threat_broadcast_template(threat_type: str, title: str, description: str, risk_level: str, affected_entities: List[str]) -> str:
    """Template for broadcasting new threat alerts"""
    risk_color = "#ef4444" if risk_level == "alto" else "#f59e0b" if risk_level == "medio" else "#22c55e"
    risk_emoji = "🔴" if risk_level == "alto" else "🟡" if risk_level == "medio" else "🟢"
    
    entities_html = ""
    if affected_entities:
        entities_list = "".join([f"<li>{entity}</li>" for entity in affected_entities])
        entities_html = f"""
        <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <strong>⚠️ Entidades afectadas:</strong>
            <ul style="margin: 10px 0;">{entities_list}</ul>
        </div>
        """
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {risk_color}; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .alert-badge {{ display: inline-block; background: white; color: {risk_color}; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 12px; }}
            .threat-box {{ background: white; border-left: 4px solid {risk_color}; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .action-box {{ background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0; }}
            .button {{ display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <span class="alert-badge">{risk_emoji} RIESGO {risk_level.upper()}</span>
            <h1 style="margin-top: 15px;">⚠️ Nueva Alerta de Seguridad</h1>
        </div>
        <div class="content">
            <div class="threat-box">
                <h2 style="margin-top: 0; color: #1f2937;">{title}</h2>
                <p><strong>Tipo de amenaza:</strong> {threat_type}</p>
                <p>{description}</p>
            </div>
            {entities_html}
            <div class="action-box">
                <strong>🛡️ ¿Qué debes hacer?</strong>
                <ul style="margin: 10px 0;">
                    <li>No hagas clic en enlaces sospechosos</li>
                    <li>Verifica siempre el remitente antes de responder</li>
                    <li>Si tienes dudas, usa ManoProtect para analizar el mensaje</li>
                    <li>Comparte esta alerta con familiares y amigos</li>
                </ul>
            </div>
            <div style="text-align: center;">
                <a href="https://manoprotect.com/dashboard" class="button">Analizar mensaje sospechoso</a>
            </div>
        </div>
        <div class="footer">
            <p>© 2025 ManoProtect - Protegiendo a la comunidad</p>
            <p style="font-size: 11px; color: #9ca3af;">Esta alerta fue generada automáticamente por el sistema de detección de ManoProtect</p>
        </div>
    </body>
    </html>
    """


# ============================================
# ALERT SUBSCRIPTION ENDPOINTS
# ============================================

@alerts_router.post("/subscribe")
async def subscribe_to_alerts(
    data: AlertSubscription,
    background_tasks: BackgroundTasks
):
    """Subscribe to fraud alert notifications"""
    if not db:
        raise HTTPException(status_code=500, detail="Base de datos no inicializada")
    
    # Check if already subscribed
    existing = await db.alert_subscriptions.find_one({"email": data.email.lower()})
    if existing:
        if existing.get("is_active", True):
            return {
                "status": "already_subscribed",
                "message": "Ya estás suscrito a las alertas de ManoProtect"
            }
        else:
            # Reactivate subscription
            unsubscribe_token = str(uuid.uuid4())
            await db.alert_subscriptions.update_one(
                {"email": data.email.lower()},
                {"$set": {
                    "is_active": True,
                    "reactivated_at": datetime.now(timezone.utc).isoformat(),
                    "unsubscribe_token": unsubscribe_token,
                    "alert_types": data.alert_types,
                    "frequency": data.frequency
                }}
            )
            
            # Send confirmation email
            html_content = get_alert_subscription_template(data.name, unsubscribe_token)
            background_tasks.add_task(
                send_email, 
                data.email, 
                "🛡️ Tu suscripción a alertas de ManoProtect ha sido reactivada", 
                html_content
            )
            
            return {
                "status": "reactivated",
                "message": "Tu suscripción ha sido reactivada"
            }
    
    # Create new subscription
    unsubscribe_token = str(uuid.uuid4())
    subscription = {
        "id": f"sub_{uuid.uuid4().hex[:12]}",
        "email": data.email.lower(),
        "name": data.name,
        "alert_types": data.alert_types,
        "frequency": data.frequency,
        "is_active": True,
        "unsubscribe_token": unsubscribe_token,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.alert_subscriptions.insert_one(subscription)
    
    # Send confirmation email
    html_content = get_alert_subscription_template(data.name, unsubscribe_token)
    background_tasks.add_task(
        send_email, 
        data.email, 
        "🛡️ ¡Bienvenido a las alertas de seguridad de ManoProtect!", 
        html_content
    )
    
    return {
        "status": "subscribed",
        "message": "Te has suscrito correctamente a las alertas de fraude",
        "subscription_id": subscription["id"]
    }


@alerts_router.post("/unsubscribe")
async def unsubscribe_from_alerts(data: AlertUnsubscribe):
    """Unsubscribe from fraud alert notifications"""
    if not db:
        raise HTTPException(status_code=500, detail="Base de datos no inicializada")
    
    result = await db.alert_subscriptions.update_one(
        {"email": data.email.lower(), "unsubscribe_token": data.token},
        {"$set": {
            "is_active": False,
            "unsubscribed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada o token inválido")
    
    return {
        "status": "unsubscribed",
        "message": "Te has dado de baja de las alertas de ManoProtect"
    }


@alerts_router.get("/subscriptions/count")
async def get_subscription_count():
    """Get total number of alert subscribers (public stat)"""
    if not db:
        return {"count": 0, "message": "Base de datos no disponible"}
    
    count = await db.alert_subscriptions.count_documents({"is_active": True})
    return {"count": count}


@alerts_router.post("/broadcast")
async def broadcast_new_threat(
    data: NewThreatAlert,
    background_tasks: BackgroundTasks,
    api_key: Optional[str] = None
):
    """
    Broadcast a new threat alert to all subscribers.
    This endpoint can be called internally when new threats are detected,
    or by ManoBank to notify about new security threats.
    """
    if not db:
        raise HTTPException(status_code=500, detail="Base de datos no inicializada")
    
    # Get all active subscribers
    subscribers = await db.alert_subscriptions.find(
        {"is_active": True}
    ).to_list(10000)
    
    if not subscribers:
        return {
            "status": "no_subscribers",
            "message": "No hay suscriptores activos para enviar alertas"
        }
    
    # Generate email content
    html_content = get_new_threat_broadcast_template(
        data.threat_type,
        data.title,
        data.description,
        data.risk_level,
        data.affected_entities or []
    )
    
    # Subject based on risk level
    risk_prefix = "🔴 URGENTE" if data.risk_level == "alto" else "🟡 ALERTA" if data.risk_level == "medio" else "🟢 INFO"
    subject = f"{risk_prefix}: {data.title} - ManoProtect"
    
    # Send to all subscribers in background
    sent_count = 0
    for sub in subscribers:
        # Check if subscriber wants this type of alert
        if "all" in sub.get("alert_types", ["all"]) or data.threat_type in sub.get("alert_types", []):
            background_tasks.add_task(send_email, sub["email"], subject, html_content)
            sent_count += 1
    
    # Log the broadcast
    await db.alert_broadcasts.insert_one({
        "id": f"broadcast_{uuid.uuid4().hex[:12]}",
        "threat_type": data.threat_type,
        "title": data.title,
        "description": data.description,
        "risk_level": data.risk_level,
        "source": data.source,
        "affected_entities": data.affected_entities,
        "subscribers_notified": sent_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "status": "broadcast_queued",
        "message": f"Alerta enviada a {sent_count} suscriptores",
        "subscribers_notified": sent_count
    }


@alerts_router.get("/history")
async def get_alert_history(limit: int = 20):
    """Get recent broadcast alert history (public)"""
    if not db:
        return {"alerts": [], "message": "Base de datos no disponible"}
    
    alerts = await db.alert_broadcasts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"alerts": alerts}
