"""
MANO - SendGrid Email Integration
Handles transactional emails, alerts, and notifications
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, BackgroundTasks
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/email", tags=["Email"])

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
    background_tasks.add_task(send_email, data.to, data.subject, data.content)
    
    return {
        "status": "queued",
        "message": "Email enviado"
    }
