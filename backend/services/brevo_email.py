"""
ManoProtect - Servicio de Email con Brevo (producción)
Envía emails transaccionales reales: recuperación de contraseña, notificaciones, etc.
"""
import os
import json
import requests


BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "no-reply@manoprotectt.com")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "ManoProtect")

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(to_email: str, subject: str, html_content: str, to_name: str = "") -> dict:
    """Enviar email real vía Brevo API"""
    if not BREVO_API_KEY:
        raise Exception("BREVO_API_KEY no configurada")

    payload = {
        "sender": {"name": EMAIL_FROM_NAME, "email": EMAIL_FROM},
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    response = requests.post(BREVO_URL, headers=headers, data=json.dumps(payload), timeout=10)
    response.raise_for_status()
    return response.json()


def send_password_reset_email(to_email: str, to_name: str, reset_token: str, familia_id: str = "") -> dict:
    """Enviar email de recuperación de contraseña"""
    reset_url = f"https://www.manoprotectt.com/familia?mode=reset&token={reset_token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">ManoProtect</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Sistema de Seguridad Profesional</p>
        </div>
        <h2 style="color: #f1f5f9; font-size: 18px;">Recuperación de Contraseña</h2>
        <p style="color: #cbd5e1;">Hola <strong>{to_name}</strong>,</p>
        <p style="color: #cbd5e1;">Hemos recibido una solicitud para restablecer tu contraseña{' para la familia ' + familia_id if familia_id else ''}.</p>
        <p style="color: #cbd5e1;">Tu código de recuperación es:</p>
        <div style="background: #0f172a; border: 2px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <code style="font-size: 14px; color: #10b981; word-break: break-all;">{reset_token}</code>
        </div>
        <p style="color: #cbd5e1;">O haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{reset_url}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px; text-align: center;">ManoProtect - Seguridad Inteligente para tu Hogar<br>www.manoprotectt.com</p>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, "Recuperación de Contraseña - ManoProtect", html, to_name)


def send_welcome_email(to_email: str, to_name: str, familia_id: str = "") -> dict:
    """Enviar email de bienvenida tras registro"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">ManoProtect</h1>
        </div>
        <h2 style="color: #f1f5f9; font-size: 18px;">Bienvenido a ManoProtect</h2>
        <p style="color: #cbd5e1;">Hola <strong>{to_name}</strong>,</p>
        <p style="color: #cbd5e1;">Tu cuenta familiar ha sido creada correctamente{' con el ID: ' + familia_id if familia_id else ''}.</p>
        <p style="color: #cbd5e1;">Ya puedes acceder a tu panel de seguridad desde la app o desde www.manoprotectt.com/familia</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://www.manoprotectt.com/familia" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Acceder a Mi Cuenta</a>
        </div>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px; text-align: center;">ManoProtect - Seguridad Inteligente para tu Hogar</p>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, "Bienvenido a ManoProtect", html, to_name)
