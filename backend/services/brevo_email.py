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


# ============================================
# BACK OFFICE EMAILS
# ============================================

def send_employee_credentials_email(to_email: str, to_name: str, rol: str, temp_password: str) -> dict:
    """Enviar credenciales a nuevo comercial/instalador"""
    rol_label = "Comercial" if rol == "comercial" else "Instalador"
    app_url = f"https://www.manoprotectt.com/app-{'comerciales' if rol == 'comercial' else 'instaladores'}"
    rol_color = "#f59e0b" if rol == "comercial" else "#10b981"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">ManoProtect</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Sistema de Seguridad Profesional</p>
        </div>
        <h2 style="color: #f1f5f9; font-size: 18px;">Bienvenido al equipo, {to_name}</h2>
        <p style="color: #cbd5e1;">Se te ha dado de alta como <strong style="color: {rol_color};">{rol_label}</strong> en el sistema ManoProtect.</p>
        <p style="color: #cbd5e1;">Tus credenciales de acceso son:</p>
        <div style="background: #0f172a; border: 2px solid {rol_color}; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #94a3b8; padding: 6px 0; font-size: 13px;">Email:</td><td style="color: #fff; font-weight: 600; font-size: 14px;">{to_email}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0; font-size: 13px;">Contrasena:</td><td style="color: {rol_color}; font-weight: 700; font-size: 16px; letter-spacing: 1px;">{temp_password}</td></tr>
          </table>
        </div>
        <p style="color: #f59e0b; font-size: 13px; background: rgba(245,158,11,0.1); padding: 10px 14px; border-radius: 8px; border-left: 3px solid #f59e0b;">
          <strong>Importante:</strong> En tu primer inicio de sesion deberas cambiar la contrasena.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="{app_url}" style="display: inline-block; background: {rol_color}; color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px;">Acceder a la App</a>
        </div>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px; text-align: center;">ManoProtect - Seguridad Inteligente<br>www.manoprotectt.com</p>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, f"Bienvenido al equipo ManoProtect - Credenciales {rol_label}", html, to_name)


def send_client_activation_email(to_email: str, to_name: str, temp_password: str) -> dict:
    """Enviar credenciales al cliente cuando se activa desde el pipeline"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">ManoProtect</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Tu Seguridad, Nuestra Prioridad</p>
        </div>
        <h2 style="color: #f1f5f9; font-size: 18px;">Tu sistema de seguridad esta activo</h2>
        <p style="color: #cbd5e1;">Hola <strong>{to_name}</strong>,</p>
        <p style="color: #cbd5e1;">Tu sistema de alarma ManoProtect ha sido activado. Ya puedes controlar tu seguridad desde la App.</p>
        <div style="background: #0f172a; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Tus credenciales de acceso</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #94a3b8; padding: 6px 0; font-size: 13px;">Email:</td><td style="color: #fff; font-weight: 600; font-size: 14px;">{to_email}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0; font-size: 13px;">Contrasena:</td><td style="color: #3b82f6; font-weight: 700; font-size: 16px; letter-spacing: 1px;">{temp_password}</td></tr>
          </table>
        </div>
        <div style="background: rgba(16,185,129,0.08); border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid rgba(16,185,129,0.2);">
          <p style="color: #10b981; font-size: 13px; font-weight: 600; margin: 0 0 8px;">Con tu App puedes:</p>
          <ul style="color: #cbd5e1; font-size: 13px; margin: 0; padding-left: 16px;">
            <li>Armar y desarmar tu alarma</li>
            <li>Ver tus camaras en directo</li>
            <li>Recibir alertas en tiempo real</li>
            <li>Activar el boton SOS de emergencia</li>
            <li>Ver el historial de eventos</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://www.manoprotectt.com/app-cliente" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 14px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px;">Acceder a Mi Seguridad</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Ante cualquier emergencia, pulsa el boton SOS en la app o llama al 112.</p>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px; text-align: center;">ManoProtect - Central Receptora de Alarmas 24/7<br>www.manoprotectt.com</p>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, "Tu sistema ManoProtect esta activo - Credenciales de acceso", html, to_name)


def send_pipeline_stage_email(to_email: str, to_name: str, stage: str, details: str = "") -> dict:
    """Enviar notificacion al avanzar etapa del pipeline"""
    stage_messages = {
        "contacto": ("Hemos recibido tu solicitud", "Un asesor de seguridad se pondra en contacto contigo en las proximas 24 horas para analizar tus necesidades."),
        "estudio": ("Estudio de seguridad programado", "Nuestro equipo tecnico realizara un estudio personalizado de tu inmueble para determinar la mejor proteccion."),
        "propuesta": ("Tu propuesta de seguridad esta lista", "Hemos preparado una propuesta personalizada. Un asesor te contactara para explicarte todos los detalles."),
        "contrato": ("Contrato formalizado", "Gracias por confiar en ManoProtect. Tu sistema de seguridad sera instalado en la fecha acordada."),
        "instalacion": ("Instalacion programada", "Nuestro equipo de instaladores se desplazara a tu domicilio. Te enviaremos los detalles de fecha y hora."),
        "activacion": ("Activando tu sistema", "Tu sistema de alarma esta siendo activado y conectado a nuestra Central Receptora de Alarmas 24/7."),
    }

    if stage not in stage_messages:
        return {"status": "skipped", "reason": f"No email for stage {stage}"}

    title, message = stage_messages[stage]

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">ManoProtect</h1>
        </div>
        <h2 style="color: #f1f5f9; font-size: 18px;">{title}</h2>
        <p style="color: #cbd5e1;">Hola <strong>{to_name}</strong>,</p>
        <p style="color: #cbd5e1;">{message}</p>
        {f'<p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">{details}</p>' if details else ''}
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://www.manoprotectt.com" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Visitar ManoProtect</a>
        </div>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #475569; font-size: 11px; text-align: center;">ManoProtect - Seguridad Inteligente<br>www.manoprotectt.com</p>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, f"{title} - ManoProtect", html, to_name)
