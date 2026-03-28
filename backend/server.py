from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Depends
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import csv
import io
import httpx
import hashlib
import re
from collections import defaultdict
import time

# Import models from centralized schema file
from models.all_schemas import (
    User, UserRegister, UserLogin, UserUpdate, SessionData,
    InvestorRequest, InvestorRegisterRequest,
    ThreatAnalysis, AnalyzeRequest, FalsePositiveReport, ShareRequest, CommunityAlert,
    TrustedContact, TrustedContactCreate,
    SOSAlert, SOSRequest, SOSAlertRequest, LocationUpdate,
    CheckoutRequest, PaymentTransaction,
    FamilyMember, FamilyMemberCreate, FamilyAlert, ChildMember, LocationRequest,
    NotificationSubscription, Notification, SubscriptionRequest, NotificationPreferences, PushSubscription,
    APIKey, APIKeyCreate,
    WhatsAppMessage, WhatsAppAlert,
    EmailPreferencesUpdate
    # BankAlert, BankAccountConnect, TransactionAnalyze - RESERVED for ManoBank.es
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Digital Asset Links for Android TWA verification
# Served at /.well-known/assetlinks.json (no /api prefix)
public_well_known_router = APIRouter()

@public_well_known_router.get("/.well-known/assetlinks.json")
async def assetlinks():
    import json
    assetlinks_path = Path(__file__).parent.parent / ".well-known" / "assetlinks.json"
    if assetlinks_path.exists():
        data = json.loads(assetlinks_path.read_text())
        return JSONResponse(content=data, media_type="application/json")
    return JSONResponse(content=[], media_type="application/json")


# Privacy Policy endpoint for Google Play Store
@api_router.get("/privacy-policy", response_class=HTMLResponse)
async def privacy_policy():
    return """<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Politica de Privacidad - ManoProtect</title>
<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:860px;margin:0 auto;padding:32px 20px;color:#333;line-height:1.7;background:#fafafa}h1{color:#1a1a2e;font-size:28px;border-bottom:3px solid #4F46E5;padding-bottom:12px}h2{color:#4F46E5;margin-top:28px;font-size:20px}h3{color:#374151;margin-top:16px;font-size:16px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#4F46E5;color:#fff;padding:10px 14px;text-align:left;font-size:14px}td{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px}tr:nth-child(even){background:#f3f4f6}ul{padding-left:20px}li{margin-bottom:6px}p{margin:10px 0}.highlight{background:#EEF2FF;border-left:4px solid #4F46E5;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0}.footer{margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;text-align:center;color:#6b7280;font-size:13px}</style></head><body>
<h1>Politica de Privacidad de ManoProtect</h1>
<p><strong>Ultima actualizacion:</strong> 27 de marzo de 2026</p>
<p><strong>Responsable del tratamiento:</strong> ManoProtect Security S.L. — CIF: B12345678</p>
<p>ManoProtect ("nosotros", "nuestro") opera las siguientes aplicaciones y servicios digitales:</p>
<ul>
<li><strong>ManoProtect</strong> (App de Cliente) — Sistema de seguridad y alarma para el hogar</li>
<li><strong>MP Comerciales</strong> — Herramienta de gestion para el equipo comercial</li>
<li><strong>MP Instaladores</strong> — Herramienta de gestion para el equipo tecnico</li>
<li><strong>manoprotectt.com</strong> — Sitio web corporativo y CRA (Central Receptora de Alarmas)</li>
</ul>
<p>Esta politica describe como recopilamos, usamos, almacenamos y protegemos la informacion personal de nuestros usuarios conforme al <strong>Reglamento General de Proteccion de Datos (RGPD)</strong> y la <strong>Ley Organica 3/2018 de Proteccion de Datos (LOPDGDD)</strong>.</p>

<h2>1. Datos que recopilamos</h2>
<h3>1.1 Datos de registro</h3>
<table><tr><th>Dato</th><th>Aplicacion</th><th>Finalidad</th></tr>
<tr><td>Nombre completo</td><td>Todas</td><td>Identificacion del usuario</td></tr>
<tr><td>Correo electronico</td><td>Todas</td><td>Autenticacion y comunicaciones</td></tr>
<tr><td>Contrasena (cifrada bcrypt)</td><td>Todas</td><td>Acceso seguro a la cuenta</td></tr>
<tr><td>Telefono de contacto</td><td>Clientes</td><td>Contacto de emergencia y verificacion</td></tr>
</table>

<h3>1.2 Datos de uso del servicio de seguridad (App Cliente)</h3>
<table><tr><th>Dato</th><th>Finalidad</th><th>Retencion</th></tr>
<tr><td>Estado de la alarma (armado/desarmado)</td><td>Operacion del sistema de seguridad</td><td>Mientras la cuenta este activa</td></tr>
<tr><td>Historial de eventos de seguridad</td><td>Registro de actividad del sistema</td><td>12 meses</td></tr>
<tr><td>Contactos de emergencia (nombre, telefono, relacion)</td><td>Notificacion en caso de emergencia/SOS</td><td>Mientras la cuenta este activa</td></tr>
<tr><td>PIN de seguridad (cifrado)</td><td>Verificacion de armado/desarmado</td><td>Mientras la cuenta este activa</td></tr>
<tr><td>Configuracion de zonas y sensores</td><td>Operacion del sistema de alarma</td><td>Mientras la cuenta este activa</td></tr>
</table>

<h3>1.3 Datos de geolocalizacion</h3>
<div class="highlight"><strong>Ubicacion GPS:</strong> Solo se recopila cuando el usuario activa manualmente la funcion SOS de emergencia. La ubicacion se envia a la Central Receptora de Alarmas y a los contactos de emergencia designados. No se realiza seguimiento continuo de ubicacion.</div>

<h3>1.4 Datos del dispositivo y anti-fraude</h3>
<table><tr><th>Dato</th><th>Finalidad</th><th>Retencion</th></tr>
<tr><td>Huella digital del dispositivo (fingerprint)</td><td>Prevencion de abuso del periodo de prueba gratuito</td><td>90 dias</td></tr>
<tr><td>Direccion IP (anonimizada)</td><td>Seguridad y prevencion de fraude</td><td>30 dias</td></tr>
<tr><td>Token FCM (Firebase Cloud Messaging)</td><td>Envio de notificaciones push de seguridad</td><td>Mientras la cuenta este activa</td></tr>
</table>

<h3>1.5 Datos de pago</h3>
<p>Los pagos de suscripcion se procesan a traves de <strong>Stripe, Inc.</strong> ManoProtect no almacena datos de tarjetas de credito ni datos bancarios. Stripe actua como procesador de pagos independiente bajo su propia politica de privacidad. Unicamente almacenamos el identificador de cliente de Stripe y el estado de la suscripcion.</p>

<h3>1.6 Datos profesionales (Comerciales e Instaladores)</h3>
<table><tr><th>Dato</th><th>Finalidad</th></tr>
<tr><td>Historial de actividad laboral</td><td>Gestion de leads, ventas e instalaciones</td></tr>
<tr><td>Ubicacion durante jornada laboral</td><td>Optimizacion de rutas de trabajo</td></tr>
<tr><td>Fotografias de instalaciones</td><td>Documentacion tecnica y verificacion</td></tr>
</table>

<h2>2. Base legal del tratamiento</h2>
<ul>
<li><strong>Ejecucion de contrato</strong> (Art. 6.1.b RGPD): Necesario para prestar el servicio de seguridad contratado.</li>
<li><strong>Interes legitimo</strong> (Art. 6.1.f RGPD): Prevencion de fraude y seguridad del sistema.</li>
<li><strong>Consentimiento</strong> (Art. 6.1.a RGPD): Notificaciones push, cookies analiticas y de marketing.</li>
<li><strong>Obligacion legal</strong> (Art. 6.1.c RGPD): Conservacion de datos de facturacion (normativa fiscal).</li>
</ul>

<h2>3. Comparticion de datos con terceros</h2>
<p>No vendemos datos personales. Compartimos datos exclusivamente con:</p>
<table><tr><th>Proveedor</th><th>Servicio</th><th>Datos compartidos</th><th>Ubicacion</th></tr>
<tr><td>Google Firebase</td><td>Notificaciones push</td><td>Token FCM</td><td>UE/EEUU (Standard Contractual Clauses)</td></tr>
<tr><td>Stripe, Inc.</td><td>Procesamiento de pagos</td><td>Email, ID de suscripcion</td><td>EEUU (Standard Contractual Clauses)</td></tr>
<tr><td>Brevo (Sendinblue)</td><td>Emails transaccionales</td><td>Email, nombre</td><td>Francia (UE)</td></tr>
<tr><td>MongoDB Atlas</td><td>Almacenamiento de datos</td><td>Todos los datos de cuenta</td><td>UE (Frankfurt)</td></tr>
</table>

<h2>4. Derechos del usuario (RGPD)</h2>
<p>Conforme al RGPD, tienes derecho a:</p>
<ul>
<li><strong>Acceso:</strong> Solicitar una copia de todos tus datos personales.</li>
<li><strong>Rectificacion:</strong> Corregir datos inexactos o incompletos.</li>
<li><strong>Supresion:</strong> Solicitar la eliminacion de tus datos ("derecho al olvido").</li>
<li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado y legible por maquina.</li>
<li><strong>Oposicion:</strong> Oponerte al tratamiento de tus datos.</li>
<li><strong>Limitacion:</strong> Solicitar la limitacion del tratamiento.</li>
</ul>
<p>Para ejercer cualquier derecho, contacta con nosotros en <strong>info@manoprotectt.com</strong> o visita <a href="/api/data-deletion">la pagina de eliminacion de datos</a>. Responderemos en un plazo maximo de 30 dias.</p>
<p>Tambien tienes derecho a presentar una reclamacion ante la <strong>Agencia Espanola de Proteccion de Datos (AEPD)</strong>: <a href="https://www.aepd.es">www.aepd.es</a>.</p>

<h2>5. Seguridad de los datos</h2>
<ul>
<li>Cifrado en transito: HTTPS/TLS 1.3 en todas las comunicaciones.</li>
<li>Contrasenas: Cifradas con algoritmo bcrypt (nunca almacenadas en texto plano).</li>
<li>Tokens de sesion: JWT con expiracion configurable.</li>
<li>Acceso interno: Solo personal autorizado con autenticacion multifactor.</li>
<li>Copias de seguridad: Cifradas y almacenadas en centros de datos de la UE.</li>
</ul>

<h2>6. Cookies</h2>
<p>Nuestro sitio web utiliza cookies. Al visitar manoprotectt.com, se te presentara un banner de consentimiento donde puedes aceptar o rechazar las siguientes categorias:</p>
<ul>
<li><strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio (no requieren consentimiento).</li>
<li><strong>Analiticas:</strong> Google Analytics 4 — para mejorar la experiencia de usuario.</li>
<li><strong>Marketing:</strong> Google Ads, Meta Pixel — para mostrar anuncios relevantes.</li>
</ul>

<h2>7. Menores de edad</h2>
<p>Nuestros servicios estan dirigidos a personas mayores de 18 anos. No recopilamos conscientemente datos de menores de 16 anos.</p>

<h2>8. Cambios en esta politica</h2>
<p>Podemos actualizar esta politica periodicamente. Notificaremos cambios significativos por email o mediante aviso en la aplicacion.</p>

<h2>9. Contacto</h2>
<p><strong>ManoProtect Security S.L.</strong></p>
<p>Email: <strong>info@manoprotectt.com</strong></p>
<p>Web: <a href="https://www.manoprotectt.com">www.manoprotectt.com</a></p>
<div class="footer">ManoProtect Security S.L. — Todos los derechos reservados 2026</div>
</body></html>"""

# Data Deletion Request endpoint for Google Play Store
@api_router.get("/data-deletion", response_class=HTMLResponse)
async def data_deletion():
    return """<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Eliminacion de Datos - ManoProtect</title>
<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:860px;margin:0 auto;padding:32px 20px;color:#333;line-height:1.7;background:#fafafa}h1{color:#1a1a2e;font-size:28px;border-bottom:3px solid #DC2626;padding-bottom:12px}h2{color:#DC2626;margin-top:28px;font-size:20px}h3{color:#374151;margin-top:16px;font-size:16px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#DC2626;color:#fff;padding:10px 14px;text-align:left;font-size:14px}td{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px}tr:nth-child(even){background:#fef2f2}ul{padding-left:20px}li{margin-bottom:8px}ol li{margin-bottom:12px}.btn{display:inline-block;background:#DC2626;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;margin-top:16px;font-weight:bold;font-size:16px}.btn:hover{background:#b91c1c}.warning{background:#FEF3C7;border-left:4px solid #F59E0B;padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:14px}.info{background:#EFF6FF;border-left:4px solid #3B82F6;padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-size:14px}.steps{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:20px 0}.step-num{display:inline-block;width:32px;height:32px;background:#DC2626;color:#fff;border-radius:50%;text-align:center;line-height:32px;font-weight:bold;margin-right:10px;font-size:14px}.footer{margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;text-align:center;color:#6b7280;font-size:13px}</style></head><body>
<h1>Eliminacion de Datos de Usuario</h1>
<p><strong>ManoProtect Security S.L.</strong> — Conforme al RGPD (Art. 17: Derecho de supresion)</p>
<p>Esta pagina aplica a todas nuestras aplicaciones: <strong>ManoProtect</strong> (App Cliente), <strong>MP Comerciales</strong> y <strong>MP Instaladores</strong>.</p>

<h2>1. Como solicitar la eliminacion de tus datos</h2>
<div class="steps">
<ol>
<li><span class="step-num">1</span><strong>Envia un email</strong> a <strong>info@manoprotectt.com</strong> con el asunto: <em>"Solicitud de eliminacion de datos - [tu email de registro]"</em></li>
<li><span class="step-num">2</span><strong>Incluye en el correo:</strong>
<ul>
<li>Tu nombre completo</li>
<li>La direccion de correo electronico asociada a tu cuenta</li>
<li>La aplicacion en la que estas registrado (ManoProtect, MP Comerciales o MP Instaladores)</li>
<li>Si deseas eliminacion parcial o total (ver tabla abajo)</li>
</ul></li>
<li><span class="step-num">3</span><strong>Verificacion de identidad:</strong> Podemos solicitar una verificacion adicional para proteger tu cuenta.</li>
<li><span class="step-num">4</span><strong>Procesamiento:</strong> Tu solicitud sera procesada en un plazo maximo de <strong>30 dias naturales</strong>.</li>
<li><span class="step-num">5</span><strong>Confirmacion:</strong> Recibiras un email de confirmacion cuando la eliminacion se haya completado.</li>
</ol>
</div>

<h2>2. Datos que se eliminan</h2>
<h3>2.1 App ManoProtect (Clientes)</h3>
<table><tr><th>Dato</th><th>Accion</th></tr>
<tr><td>Nombre, email y datos de perfil</td><td>Eliminados permanentemente</td></tr>
<tr><td>Contrasena cifrada</td><td>Eliminada permanentemente</td></tr>
<tr><td>Estado de alarma y configuracion de zonas</td><td>Eliminados permanentemente</td></tr>
<tr><td>Historial de eventos de seguridad</td><td>Eliminado permanentemente</td></tr>
<tr><td>Contactos de emergencia</td><td>Eliminados permanentemente</td></tr>
<tr><td>PIN de seguridad</td><td>Eliminado permanentemente</td></tr>
<tr><td>Datos de geolocalizacion SOS</td><td>Eliminados permanentemente</td></tr>
<tr><td>Tokens de notificaciones push (FCM)</td><td>Eliminados y desregistrados</td></tr>
<tr><td>Huella digital del dispositivo (fingerprint)</td><td>Eliminada permanentemente</td></tr>
<tr><td>Codigo de referido y relaciones de referido</td><td>Eliminados permanentemente</td></tr>
<tr><td>ID de cliente en Stripe</td><td>Eliminado (suscripcion cancelada automaticamente)</td></tr>
</table>

<h3>2.2 MP Comerciales y MP Instaladores</h3>
<table><tr><th>Dato</th><th>Accion</th></tr>
<tr><td>Nombre, email y datos profesionales</td><td>Eliminados permanentemente</td></tr>
<tr><td>Historial de actividad (leads, ventas, instalaciones)</td><td>Anonimizado (se elimina la vinculacion personal)</td></tr>
<tr><td>Datos de ubicacion laboral</td><td>Eliminados permanentemente</td></tr>
<tr><td>Fotografias de instalaciones</td><td>Eliminadas permanentemente</td></tr>
</table>

<div class="warning"><strong>Importante:</strong> Al eliminar tu cuenta de ManoProtect (App Cliente), tu sistema de alarma dejara de estar monitorizado por la CRA. Asegurate de desactivar tu alarma antes de solicitar la eliminacion.</div>

<h2>3. Datos que debemos conservar (obligacion legal)</h2>
<p>Conforme a la legislacion espanola y europea, estamos obligados a conservar ciertos datos incluso despues de tu solicitud de eliminacion:</p>
<table><tr><th>Dato</th><th>Motivo legal</th><th>Periodo de retencion</th></tr>
<tr><td>Registros de facturacion y pagos</td><td>Ley General Tributaria (Art. 29.2.e)</td><td>5 anos</td></tr>
<tr><td>Datos de contratos de servicio</td><td>Codigo de Comercio (Art. 30)</td><td>6 anos</td></tr>
<tr><td>Logs de seguridad del sistema</td><td>Ley 25/2007 de conservacion de datos</td><td>12 meses (anonimizados)</td></tr>
<tr><td>Registros de consentimiento RGPD</td><td>RGPD (Art. 7.1)</td><td>Mientras sea necesario demostrar el consentimiento</td></tr>
</table>

<div class="info"><strong>Nota:</strong> Los datos conservados por obligacion legal se almacenan de forma separada y restringida, y no se utilizan para ningun otro fin.</div>

<h2>4. Eliminacion de cuenta desde la aplicacion</h2>
<p>Tambien puedes solicitar la eliminacion directamente desde la aplicacion:</p>
<ul>
<li><strong>ManoProtect:</strong> Perfil → Ajustes → Eliminar mi cuenta</li>
<li><strong>MP Comerciales/Instaladores:</strong> Contacta con tu administrador o envia el email indicado arriba</li>
</ul>

<h2>5. Que ocurre tras la eliminacion</h2>
<ul>
<li>Tu cuenta sera desactivada inmediatamente y no podras iniciar sesion.</li>
<li>Todas las sesiones activas seran cerradas.</li>
<li>Las suscripciones activas en Stripe seran canceladas (no se realizaran mas cobros).</li>
<li>Los datos se eliminan de forma irreversible de nuestros servidores activos en un plazo de 30 dias.</li>
<li>Los datos en copias de seguridad cifradas se eliminaran en el siguiente ciclo de rotacion (maximo 90 dias).</li>
</ul>

<h2>6. Contacto</h2>
<p><strong>ManoProtect Security S.L.</strong></p>
<p>Email: <strong>info@manoprotectt.com</strong></p>
<p>Web: <a href="https://www.manoprotectt.com">www.manoprotectt.com</a></p>
<p>Autoridad de control: <a href="https://www.aepd.es">Agencia Espanola de Proteccion de Datos (AEPD)</a></p>
<br>
<a class="btn" href="mailto:info@manoprotectt.com?subject=Solicitud%20de%20eliminacion%20de%20datos%20-%20ManoProtect&body=Nombre%20completo%3A%20%0AEmail%20de%20registro%3A%20%0AAplicacion%3A%20ManoProtect%20%2F%20MP%20Comerciales%20%2F%20MP%20Instaladores%0ATipo%20de%20eliminacion%3A%20Total%20%2F%20Parcial%0A%0ASolicito%20la%20eliminacion%20de%20mis%20datos%20personales%20conforme%20al%20Art.%2017%20del%20RGPD.">Solicitar eliminacion por email</a>
<div class="footer">ManoProtect Security S.L. — Todos los derechos reservados 2026<br>Conforme al RGPD (UE) 2016/679 y LOPDGDD 3/2018</div>
</body></html>"""





# Direct download endpoint (under /api so Kubernetes routes it to backend)
@api_router.get("/descargas/{filename}")
async def descargar_archivo_directo(filename: str):
    """Descarga directa de ZIPs, APKs y AABs"""
    safe = filename.replace("..", "").replace("/", "")
    media_types = {
        ".zip": "application/zip",
        ".apk": "application/vnd.android.package-archive",
        ".aab": "application/x-authorware-bin",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }
    for d in ["/app/downloads", "/app/backend/uploads/downloads"]:
        fp = Path(d) / safe
        if fp.exists() and fp.suffix in media_types:
            return FileResponse(path=str(fp), media_type=media_types[fp.suffix], filename=safe)
    raise HTTPException(status_code=404, detail="Archivo no encontrado")


# Mount downloads directory
from starlette.staticfiles import StaticFiles
import os as _os
downloads_path = _os.path.join(_os.path.dirname(__file__), '..', 'downloads')
if _os.path.exists(downloads_path):
    app.mount("/downloads", StaticFiles(directory=downloads_path), name="downloads")

# ============================================
# SECURITY MIDDLEWARE
# ============================================

# Rate limiting storage
rate_limit_storage = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 100  # max requests per window

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers to prevent common attacks
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self), microphone=()"
        
        # Content Security Policy - Prevent XSS and injection attacks
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://widget.trustpilot.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://*.emergentagent.com https://*.emergent.host https://*.manoprotectt.com https://*.stripe.com https://api.stripe.com wss://*.emergentagent.com wss://*.emergent.host wss://*.manoprotectt.com; "
            "frame-src 'self' https://www.googletagmanager.com https://js.stripe.com https://widget.trustpilot.com; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        
        # Strict Transport Security (HSTS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Cache control for sensitive endpoints
        if "/api/" in str(request.url):
            # Allow caching for public read-only endpoints
            cacheable_paths = ["/api/plans", "/api/dashboard-barrio/", "/api/community-shield/heatmap", "/api/referrals/validate/"]
            is_cacheable = any(request.url.path.startswith(p) for p in cacheable_paths)
            if is_cacheable:
                response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=600"
            else:
                response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        rate_limit_storage[client_ip] = [
            t for t in rate_limit_storage[client_ip] 
            if current_time - t < RATE_LIMIT_WINDOW
        ]
        
        # Check rate limit
        if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Demasiadas solicitudes. Espera un momento."}
            )
        
        # Record this request
        rate_limit_storage[client_ip].append(current_time)
        
        return await call_next(request)

# IP Blacklist cache (refreshed from DB periodically)
_ip_blacklist_cache = {"ips": set(), "last_refresh": 0}

class IPBlockMiddleware(BaseHTTPMiddleware):
    """Block requests from blacklisted IPs stored in MongoDB"""
    async def dispatch(self, request: Request, call_next):
        client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (request.client.host if request.client else "unknown")
        
        # Refresh cache every 30 seconds
        now = time.time()
        if now - _ip_blacklist_cache["last_refresh"] > 30:
            try:
                blocked = await db["blocked_ips"].find({"active": True}, {"_id": 0, "ip": 1}).to_list(1000)
                _ip_blacklist_cache["ips"] = {b["ip"] for b in blocked}
                _ip_blacklist_cache["last_refresh"] = now
            except Exception:
                pass
        
        if client_ip in _ip_blacklist_cache["ips"]:
            return JSONResponse(
                status_code=403,
                content={"detail": "Acceso denegado. Su IP ha sido bloqueada por motivos de seguridad. Contacte soporte@manoprotectt.com"}
            )
        
        return await call_next(request)

# Apply security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(IPBlockMiddleware)

# Initialize WebSocket manager
from services.websocket_manager import sio, init_websocket
init_websocket(db)

# Create combined ASGI app that handles both FastAPI and Socket.IO
# Socket.IO will be available at /socket.io path
combined_asgi_app = None  # Will be set after all routes are defined

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

# ============================================
# SUPERADMIN CONFIGURATION (passwords from env)
# ============================================
SUPERADMIN_ACCOUNTS = [
    {"email": "info@manoprotectt.com", "name": "ManoProtect Admin", "password": os.environ.get('SUPERADMIN_PASSWORD_1')},
    {"email": "rrhh.milchollos@gmail.com", "name": "ManoProtect RRHH", "password": os.environ.get('SUPERADMIN_PASSWORD_2')},
    {"email": "ivanrubiosolas@gmail.com", "name": "Ivan Rubio Cano", "password": None},  # None = don't change password if exists
]

# Initialize auth module with database
from core.auth import (
    init_auth, hash_password, verify_password, generate_session_token,
    get_current_user, require_auth, require_admin, require_investor
)
init_auth(db)

# ============================================
# CONFIGURATION
# ============================================

# Fixed subscription pricing packages (amounts in EUR) - SINCRONIZADO CON FRONTEND
SUBSCRIPTION_PACKAGES = {
    # Planes individuales Premium (hasta 2 usuarios)
    "weekly": {"amount": 9.99, "name": "Premium Semanal", "period": "semana", "max_users": 2},
    "monthly": {"amount": 29.99, "name": "Premium Mensual", "period": "mes", "max_users": 2},
    "quarterly": {"amount": 74.99, "name": "Premium Trimestral", "period": "3 meses", "max_users": 2},
    "yearly": {"amount": 249.99, "name": "Premium Anual", "period": "año", "max_users": 2},
    # Alias para compatibilidad con planes personales
    "personal": {"amount": 29.99, "name": "Personal", "period": "mes", "max_users": 2},
    "personal-monthly": {"amount": 29.99, "name": "Personal Mensual", "period": "mes", "max_users": 2},
    "personal-quarterly": {"amount": 74.99, "name": "Personal Trimestral", "period": "3 meses", "max_users": 2},
    "personal-yearly": {"amount": 249.99, "name": "Personal Anual", "period": "año", "max_users": 2},
    # Planes familiares (hasta 5 usuarios + GPS + SOS) - Sincronizado con Landing CRO
    "family-monthly": {"amount": 9.99, "name": "Familiar Mensual", "period": "mes", "max_users": 5, "gps": True, "sos": True},
    "family-quarterly": {"amount": 24.99, "name": "Familiar Trimestral", "period": "3 meses", "max_users": 5, "gps": True, "sos": True},
    "family-yearly": {"amount": 99.99, "name": "Familiar Anual", "period": "año", "max_users": 5, "gps": True, "sos": True, "child_tracking": True},
    # Planes business
    "business": {"amount": 49.99, "name": "Business", "period": "mes", "max_users": 25},
    "business-monthly": {"amount": 49.99, "name": "Business Mensual", "period": "mes", "max_users": 25},
    "business-yearly": {"amount": 479.99, "name": "Business Anual", "period": "año", "max_users": 25},
    # Plan enterprise
    "enterprise": {"amount": 199.99, "name": "Enterprise", "period": "mes", "max_users": -1},
    "enterprise-monthly": {"amount": 199.99, "name": "Enterprise Mensual", "period": "mes", "max_users": -1},
    "enterprise-yearly": {"amount": 1999.99, "name": "Enterprise Anual", "period": "año", "max_users": -1},
    # Plan trial
    "trial-7days": {"amount": 0, "name": "Prueba 7 días", "period": "7 días", "max_users": 2, "is_trial": True, "trial_days": 7},
    # CRO Landing plans
    "cro-monthly": {"amount": 9.99, "name": "Plan Mensual", "period": "mes", "max_users": 5},
    "cro-yearly": {"amount": 99.99, "name": "Plan Anual", "period": "año", "max_users": 5},
    # Planes Alarmas Hogar y Empresa - Precios competitivos Securitas Direct
    # Instalacion GRATIS, kits incluidos, aparatos extra se cobran aparte
    "alarm-essential": {"amount": 33.90, "name": "Alarma Essential", "period": "mes", "max_users": 1, "is_alarm": True},
    "alarm-essential-regular": {"amount": 44.90, "name": "Alarma Essential", "period": "mes", "max_users": 1, "is_alarm": True},
    "alarm-premium": {"amount": 44.90, "name": "Alarma Premium", "period": "mes", "max_users": 1, "is_alarm": True},
    "alarm-premium-regular": {"amount": 54.90, "name": "Alarma Premium", "period": "mes", "max_users": 1, "is_alarm": True},
    "alarm-business": {"amount": 54.90, "name": "Alarma Comercio", "period": "mes", "max_users": 3, "is_alarm": True},
    "alarm-business-regular": {"amount": 69.90, "name": "Alarma Comercio", "period": "mes", "max_users": 3, "is_alarm": True},
    "alarm-enterprise": {"amount": 74.90, "name": "Alarma Empresa", "period": "mes", "max_users": 10, "is_alarm": True},
    "alarm-enterprise-regular": {"amount": 89.90, "name": "Alarma Empresa", "period": "mes", "max_users": 10, "is_alarm": True},
    # Planes Sentinel - Suscripcion mensual por dispositivo
    "sentinel-basic": {"amount": 9.99, "name": "Sentinel Basic", "period": "mes", "max_users": 1, "is_sentinel": True},
    "sentinel-plus": {"amount": 14.99, "name": "Sentinel Plus", "period": "mes", "max_users": 1, "is_sentinel": True},
    "sentinel-pro": {"amount": 24.99, "name": "Sentinel Pro", "period": "mes", "max_users": 1, "is_sentinel": True},
    # PLAN VECINAL PREMIUM - INDEPENDIENTE Y OPCIONAL - SOLO ANUAL - POR FAMILIA
    # No requiere ningún otro plan. Cualquier grupo de vecinos puede contratarlo.
    "vecinal-anual": {"amount": 299.99, "name": "Escudo Vecinal Premium", "period": "ano", "max_users": -1, "is_vecinal": True, "annual_only": True, "standalone": True, "per_family": True, "unlimited_families": True},
}

# Plan features - detailed by billing period for family plans
PLAN_FEATURES = {
    "free": {"max_users": 1, "gps": False, "sos": False, "ai_analysis": False, "child_tracking": False, "location_history": False},
    # Planes individuales Premium
    "weekly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "monthly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "quarterly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "yearly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-monthly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-quarterly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    "personal-yearly": {"max_users": 2, "gps": False, "sos": False, "ai_analysis": True, "child_tracking": False, "location_history": False},
    # Family plans with tiered features
    "family": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-monthly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": False},
    "family-quarterly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": False, "location_history": True},
    "family-yearly": {"max_users": 5, "gps": True, "sos": True, "ai_analysis": True, "senior_mode": True, "child_tracking": True, "location_history": True, "silent_mode": True},
    # Business and Enterprise
    "business": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "business-monthly": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "business-yearly": {"max_users": 25, "gps": False, "sos": False, "ai_analysis": True, "dashboard": True, "child_tracking": False, "location_history": False},
    "enterprise": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
    "enterprise-monthly": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
    "enterprise-yearly": {"max_users": -1, "gps": True, "sos": True, "ai_analysis": True, "dashboard": True, "api": True, "child_tracking": True, "location_history": True},
}

# Import and initialize modular routes
from routes.auth_routes import router as auth_router, init_auth_routes
from services.security_service import init_security_service
init_security_service(db)

# Initialize Infobip SMS
infobip_configured = False
try:
    from services.infobip_sms import is_configured
    infobip_configured = is_configured()
    if infobip_configured:
        print("✅ Infobip SMS initialized")
    else:
        print("⚠️ Infobip SMS not configured (add INFOBIP_API_KEY to .env)")
except Exception as e:
    print(f"⚠️ Infobip not available: {e}")

init_auth_routes(db, None)  # SMS handled separately via Infobip

from routes.investor_routes import router as investor_router, init_investor_routes
init_investor_routes(db)

from routes.threat_routes import router as threat_router, init_threat_routes
from emergentintegrations.llm.chat import LlmChat, UserMessage
init_threat_routes(db, EMERGENT_LLM_KEY, LlmChat, UserMessage)

from routes.profile_contacts_routes import router as profile_contacts_router, init_profile_routes
init_profile_routes(db)

from routes.family_sos_routes import router as family_sos_router, init_family_routes
init_family_routes(db, PLAN_FEATURES)

# Family Management Routes
from routes.family_routes import router as family_router, init_db as init_family_db
init_family_db(db)

# Smart Family Locator Routes
from routes.smart_locator import router as smart_locator_router, init_db as init_smart_locator_db
init_smart_locator_db(db)

# Anti-Deepfake Shield Routes
from routes.deepfake_shield import router as deepfake_shield_router, init_db as init_deepfake_db
init_deepfake_db(db)

# Investor CRM Routes
from routes.investor_crm import router as investor_crm_router, init_db as init_investor_crm_db
init_investor_crm_db(db)

# Geofencing Routes
from routes.geofence_routes import router as geofence_router, init_geofence_routes
init_geofence_routes(db)

# Core Routes (health, plans, knowledge base)
from routes.core_routes import router as core_router, init_core_routes
init_core_routes(db, PLAN_FEATURES)

# Notifications Routes
from routes.notifications_routes import router as notifications_router, init_notifications_routes
init_notifications_routes(db)

# Metrics Routes
from routes.metrics_routes import router as metrics_router, init_metrics_routes
init_metrics_routes(db)

# Chat Routes (AI Support)
from routes.chat_routes import router as chat_router, init_chat_routes
init_chat_routes(db)

# Employee Portal Routes (Messaging & Presence)
from routes.employee_portal_routes import router as enterprise_auth_router, init_employee_routes
init_employee_routes(db)

# Enterprise Routes (Dashboard & Reports)
from routes.enterprise_routes import router as enterprise_router, init_enterprise_routes
init_enterprise_routes(db)

# ManoProtect Shield Routes (DNA Digital, Trust Seal, Voice AI, etc.)
from routes.shield import router as shield_router, set_database as init_shield_routes
init_shield_routes(db)

# Real-Time Scam Detection Routes (LIVE data)
from routes.realtime_scam import router as realtime_router, set_database as init_realtime_routes
init_realtime_routes(db)

# AI Voice Shield Routes
from routes.voice_shield import router as voice_shield_router, set_database as init_voice_shield
init_voice_shield(db)

# Payment Routes (Stripe)
from routes.payments_routes import router as payments_router
from routes.admin_routes import router as admin_routes, init_db as init_admin_routes
from routes.health_routes import router as health_router, init_db as init_health_routes
from routes.audio_routes import router as audio_router, init_db as init_audio_routes
from routes.device_routes import router as device_router, init_db as init_device_routes
from routes.push_routes import router as push_router, init_db as init_push_routes

# Demo Videos Routes (Sora 2 AI video generation)
from routes.demo_videos import router as demo_videos_router

# SOS Device Orders Routes (Physical SOS Keychain)
from routes.sos_device import router as sos_device_router, set_database as init_sos_device
init_sos_device(db)

# WhatsApp Alerts (Twilio)
from routes.whatsapp_alerts import router as whatsapp_router, set_database as init_whatsapp
init_whatsapp(db)

# Legacy Vault (Secure Digital Legacy)
from routes.legacy_vault import router as legacy_vault_router

# Phishing Simulation (B2B Enterprise)
from routes.phishing_simulation import router as phishing_router

# Promo Sentinel S TikTok
from routes.promo_sentinel_routes import router as promo_sentinel_router

# User Reviews/Ratings System
from routes.reviews_routes import router as reviews_router, set_database as init_reviews
init_reviews(db)

# Location Lock & Documents (Parental Control + PDF generation)
from routes.location_lock_routes import router as location_lock_router, init_db as init_location_lock
init_location_lock(db)


# Emergency 112 + Trial Reminders + Analytics Export
from routes.emergency_analytics_routes import router as emergency_analytics_router, init_db as init_emergency_analytics
init_emergency_analytics(db)


# Export Reports (CSV/PDF)
from routes.export_routes import router as export_router, set_database as init_export
init_export(db)

# Two-Factor Authentication (2FA)
from routes.two_factor_routes import router as twofa_router, set_database as init_twofa
init_twofa(db)

# Employee Portal (Director-managed access)
from routes.employee_portal import router as employee_portal_router, set_database as init_employee_portal, set_email_service as init_employee_email
init_employee_portal(db)
# Connect email service to employee portal
from services.email_service import email_service
init_employee_email(email_service)

# Password Recovery System (Email + SMS)
from routes.password_recovery_routes import router as recovery_router, set_database as init_recovery
init_recovery(db)

# Employee Portal Extended Modules
from routes.employee_absences_routes import router as absences_router, set_database as init_absences
from routes.employee_payslips_routes import router as payslips_router, set_database as init_payslips
from routes.employee_documents_routes import router as documents_router, set_database as init_documents
from routes.employee_notifications_routes import router as emp_notifications_router, set_database as init_emp_notifications
from routes.employee_holidays_routes import router as holidays_router, set_database as init_holidays
init_absences(db)
init_payslips(db)
init_documents(db)
init_emp_notifications(db)
init_holidays(db)

# Community Shield / Escudo Vecinal
from routes.community_shield_routes import router as community_shield_router, init_community_shield
init_community_shield(db)

# Newsletter
from routes.newsletter_routes import router as newsletter_router, init_newsletter
init_newsletter(db)

# Panel Vecinal Premium
from routes.panel_vecinal_routes import router as panel_vecinal_router, init_panel_vecinal
init_panel_vecinal(db)

# Subscription Manager (Trial management, blocking system)
from routes.subscription_manager import router as subscription_manager_router

# Banking and Compliance services - RESERVED for ManoBank.es
# from services.compliance_service import init_compliance_service
# from routes.compliance_routes import router as compliance_router, init_compliance_routes
# init_compliance_service(db)
# init_compliance_routes(db, require_admin)
# from routes.banking_core_routes import router as banking_core_router, init_banking_core_routes
# init_banking_core_routes(db, require_admin)

# ============================================
# ROOT HEALTH CHECK (for Kubernetes probes)
# ============================================

@app.get("/health")
async def root_health_check():
    """Root health check endpoint for Kubernetes liveness/readiness probes"""
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": str(e)}
        )

@app.get("/api/heartbeat")
async def heartbeat():
    """Fast heartbeat endpoint - responds in <5ms"""
    return {"alive": True, "ts": datetime.now(timezone.utc).isoformat()}

# ============================================
# HEALTH CHECK ENDPOINT (for production monitoring)
# ============================================

@api_router.get("/health")
async def health_check():
    """Health check endpoint for production monitoring"""
    try:
        # Test database connection
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "manoprotect-api",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ============================================
# PUBLIC USER STATISTICS (No auth required)
# ============================================

@api_router.get("/public/users-count")
async def get_public_users_count():
    """Get public count of registered users - No authentication required"""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"status": {"$ne": "inactive"}})
    
    # Get users registered in last 24 hours
    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    new_users_24h = await db.users.count_documents({"created_at": {"$gte": day_ago}})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_24h": new_users_24h,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@api_router.get("/public/landing-stats")
async def get_public_landing_stats():
    """
    Get real statistics for landing page - No authentication required
    Returns actual data from database, no mock/demo data
    """
    # Total registered users (families)
    total_users = await db.users.count_documents({})
    
    # Total threats blocked (security alerts)
    total_alerts = await db.security_alerts.count_documents({})
    
    # Calculate average rating from APPROVED user reviews
    avg_rating = 0
    total_reviews = 0
    try:
        ratings_pipeline = [
            {"$match": {"status": "approved", "rating": {"$exists": True, "$ne": None}}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        ratings_result = await db.user_reviews.aggregate(ratings_pipeline).to_list(1)
        if ratings_result and ratings_result[0].get("count", 0) > 0:
            avg_rating = round(ratings_result[0]["avg"], 1)
            total_reviews = ratings_result[0]["count"]
    except Exception:
        pass  # Use defaults if collection doesn't exist
    
    # Total SOS events handled
    total_sos = await db.sos_events.count_documents({})
    
    # Total payments processed
    total_payments = await db.payments.count_documents({"status": "completed"})
    
    return {
        "families_protected": total_users,
        "threats_blocked": total_alerts,
        "average_rating": avg_rating,
        "total_reviews": total_reviews,
        "sos_events": total_sos,
        "payments_processed": total_payments,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@api_router.get("/public/active-users")
async def get_public_active_users():
    """Get list of active users with basic info - Privacy protected"""
    users = await db.users.find(
        {"status": {"$ne": "inactive"}},
        {
            "_id": 0,
            "password_hash": 0,
            "session_token": 0
        }
    ).sort("created_at", -1).limit(100).to_list(100)
    
    # Return users with masked info for privacy
    sanitized_users = []
    for u in users:
        email = u.get("email", "")
        masked_email = email[:3] + "***@***" if email else "***"
        sanitized_users.append({
            "user_id": u.get("user_id", ""),
            "name": u.get("name", "Usuario"),
            "email_masked": masked_email,
            "role": u.get("role", "user"),
            "plan": u.get("plan", "free"),
            "status": u.get("status", "active"),
            "member_since": u.get("created_at"),
            "avatar_initial": u.get("name", "U")[0].upper() if u.get("name") else "U"
        })
    
    return {
        "users": sanitized_users,
        "total": len(sanitized_users),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ============================================
# COMMUNITY ROUTES
# ============================================

@api_router.get("/community-alerts")
async def get_community_alerts(limit: int = 20):
    """Get recent community alerts"""
    alerts = await db.community_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return alerts

@api_router.get("/knowledge-base")
async def get_knowledge_base():
    """Get knowledge base about threats"""
    return {
        "threat_types": [
            {
                "id": "phishing",
                "name": "Phishing",
                "description": "Correos electrónicos fraudulentos que intentan robar información personal o credenciales.",
                "indicators": ["Enlaces sospechosos", "Urgencia artificial", "Errores ortográficos", "Remitente desconocido"],
                "prevention": "Verifica siempre el remitente, no hagas clic en enlaces sospechosos, contacta directamente a la empresa."
            },
            {
                "id": "smishing",
                "name": "Smishing",
                "description": "Mensajes SMS fraudulentos que buscan engañarte para revelar información o hacer clic en enlaces maliciosos.",
                "indicators": ["Premios falsos", "Enlaces acortados", "Solicitudes urgentes", "Números desconocidos"],
                "prevention": "No respondas a SMS de números desconocidos, no hagas clic en enlaces, verifica con la entidad oficial."
            },
            {
                "id": "vishing",
                "name": "Vishing",
                "description": "Llamadas telefónicas fraudulentas que se hacen pasar por entidades legítimas para obtener información.",
                "indicators": ["Presión para actuar rápido", "Solicitud de datos sensibles", "Números ocultos", "Amenazas"],
                "prevention": "Cuelga y llama tú al número oficial, nunca des información por teléfono, desconfía de la urgencia."
            },
            {
                "id": "identity-theft",
                "name": "Suplantación de Identidad",
                "description": "Cuando alguien se hace pasar por una persona u organización legítima para engañarte.",
                "indicators": ["Perfiles falsos", "Solicitudes inusuales", "Cambios en servicios", "Transacciones no autorizadas"],
                "prevention": "Verifica la identidad por canales oficiales, usa autenticación de dos factores, monitorea tus cuentas."
            }
        ]
    }

@api_router.get("/plans")
async def get_available_plans():
    """Get all available subscription plans with features - SINCRONIZADO CON FRONTEND"""
    # Planes individuales Premium
    individual_plans = [
        {
            "id": "free",
            "name": "Básico",
            "price": 0,
            "period": "mes",
            "max_users": 1,
            "features": [
                "10 análisis por mes",
                "Alertas básicas",
                "Historial 7 días",
                "Base de conocimiento",
                "Soporte por email"
            ],
            "limitations": ["Sin bloqueo automático", "Sin modo familiar", "Sin exportación"]
        },
        {
            "id": "weekly",
            "name": "Premium Semanal",
            "price": 9.99,
            "period": "semana",
            "max_users": 2,
            "badge": "Prueba",
            "features": [
                "Protección hasta 2 familiares",
                "Análisis ilimitados",
                "Bloqueo automático IA",
                "Historial completo",
                "Exportación de datos",
                "Soporte prioritario"
            ]
        },
        {
            "id": "monthly",
            "name": "Premium Mensual",
            "price": 29.99,
            "period": "mes",
            "max_users": 2,
            "badge": "Popular",
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Semanal",
                "Protección 24/7",
                "Análisis avanzado IA",
                "Reportes personalizados"
            ]
        },
        {
            "id": "quarterly",
            "name": "Premium Trimestral",
            "price": 74.99,
            "originalPrice": 89.97,
            "period": "3 meses",
            "max_users": 2,
            "badge": "Ahorro 17%",
            "savings": 15,
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Mensual",
                "Equivale a €25/mes",
                "Sin interrupciones"
            ]
        },
        {
            "id": "yearly",
            "name": "Premium Anual",
            "price": 249.99,
            "originalPrice": 359.88,
            "period": "año",
            "max_users": 2,
            "badge": "Mejor Valor - 31% OFF",
            "popular": True,
            "savings": 109.89,
            "features": [
                "Protección hasta 2 familiares",
                "Todo de Premium Mensual",
                "Equivale a €20.83/mes",
                "2 meses GRATIS",
                "Garantía satisfacción 15 días"
            ]
        }
    ]
    
    # Planes familiares - Sincronizado con Landing CRO (9.99/mes, 99.99/año)
    family_plans = [
        {
            "id": "family-monthly",
            "name": "Familiar Mensual",
            "price": 9.99,
            "period": "mes",
            "max_users": 5,
            "features": [
                "Hasta 5 miembros familia",
                "GPS en segundo plano 24/7",
                "Alertas SOS instant\u00e1neas",
                "Zonas seguras",
                "Notificaciones push"
            ]
        },
        {
            "id": "family-quarterly",
            "name": "Familiar Trimestral",
            "price": 24.99,
            "originalPrice": 29.97,
            "period": "3 meses",
            "max_users": 5,
            "badge": "Ahorro 17%",
            "savings": 4.98,
            "features": [
                "Todo Familiar Mensual",
                "Bot\u00f3n SOS + GPS incluido",
                "Equivale a 8,33\u20ac/mes"
            ]
        },
        {
            "id": "family-yearly",
            "name": "Familiar Anual",
            "price": 99.99,
            "originalPrice": 119.88,
            "period": "a\u00f1o",
            "max_users": 5,
            "badge": "M\u00c1S POPULAR - Ahorra 20\u20ac",
            "popular": True,
            "savings": 19.89,
            "features": [
                "TODO de planes inferiores",
                "GPS 24/7 + SOS completo",
                "Prioridad en soporte",
                "Alertas por WhatsApp",
                "Dispositivo GRATIS incluido",
                "Equivale a 8,33\u20ac/mes",
                "Garant\u00eda satisfacci\u00f3n 14 d\u00edas"
            ]
        }
    ]
    
    # Planes Business y Enterprise
    business_plans = [
        {
            "id": "business",
            "name": "Business",
            "price": 49.99,
            "period": "mes",
            "max_users": 25,
            "features": [
                "Protección para hasta 25 empleados",
                "Dashboard empresarial",
                "Reportes de amenazas",
                "API básica de integración",
                "Soporte dedicado"
            ]
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price": 199.99,
            "period": "mes",
            "max_users": -1,
            "features": [
                "Usuarios ilimitados",
                "Todo incluido",
                "API completa",
                "GPS y SOS",
                "Soporte 24/7",
                "Personalización completa",
                "Account manager dedicado"
            ]
        }
    ]
    
    # Planes Alarmas Hogar - Precios competitivos tipo Securitas Direct
    alarm_plans = [
        {
            "id": "alarm-essential",
            "name": "Alarma Essential",
            "target": "Pisos y apartamentos",
            "price": 33.90,
            "regularPrice": 44.90,
            "period": "mes",
            "promoNote": "6 primeros meses",
            "features": [
                "Hub inteligente pantalla 7\"",
                "2 camaras Full HD + vision nocturna",
                "3 sensores PIR anti-mascotas",
                "2 contactos magneticos",
                "Sirena exterior 110dB",
                "Centro control 24h (CRA)",
                "App completa",
                "1 Sentinel X de REGALO",
                "Refiere = 1 mes GRATIS",
            ],
            "installation": "GRATIS",
            "commitment": "SIN permanencia",
        },
        {
            "id": "alarm-premium",
            "name": "Alarma Premium",
            "target": "Chalets, adosados y casas",
            "price": 44.90,
            "regularPrice": 54.90,
            "period": "mes",
            "popular": True,
            "promoNote": "6 primeros meses",
            "features": [
                "Hub Pro pantalla 10\" HD",
                "4 camaras 2K + 2 PTZ exterior 360",
                "6 sensores PIR + 4 magneticos",
                "Detector humo + CO2 + inundacion",
                "2 sirenas 120dB + teclado RFID",
                "CRA Premium + Servicio Acuda",
                "Grabacion nube 30 dias",
                "2 Sentinel X de REGALO",
                "Refiere = 1 mes GRATIS",
            ],
            "installation": "GRATIS",
            "commitment": "SIN permanencia",
        },
    ]

    # Planes Alarmas Negocio
    alarm_business_plans = [
        {
            "id": "alarm-business",
            "name": "Alarma Comercio",
            "target": "Tiendas, locales y restaurantes",
            "price": 54.90,
            "regularPrice": 69.90,
            "period": "mes",
            "promoNote": "6 primeros meses",
            "features": [
                "Hub Enterprise + 6 camaras 4K IA",
                "Control acceso biometrico",
                "CRA Enterprise + Acuda prioritario",
                "App Business multi-sede",
                "2 Sentinel X de REGALO",
                "Refiere = 1 mes GRATIS",
            ],
            "installation": "GRATIS",
            "commitment": "SIN permanencia",
        },
        {
            "id": "alarm-enterprise",
            "name": "Alarma Empresa",
            "target": "Naves, oficinas y franquicias",
            "price": 74.90,
            "regularPrice": 89.90,
            "period": "mes",
            "popular": True,
            "promoNote": "6 primeros meses",
            "features": [
                "Doble Hub redundante + 10 camaras 4K",
                "Videoportero reconocimiento facial",
                "Grabacion nube 90 dias",
                "Custodia llaves + mantenimiento trimestral",
                "3 Sentinel X REGALO",
                "Gestion multi-sede completa",
                "Refiere = 1 mes GRATIS",
            ],
            "installation": "GRATIS",
            "commitment": "SIN permanencia",
        },
    ]

    # Planes Sentinel SOS
    sentinel_plans = [
        {
            "id": "sentinel-basic",
            "name": "Sentinel Basic",
            "price": 9.99,
            "period": "mes",
            "features": ["GPS tiempo real", "Alertas SOS", "App basica", "Hasta 2 contactos"],
        },
        {
            "id": "sentinel-plus",
            "name": "Sentinel Plus",
            "price": 14.99,
            "period": "mes",
            "popular": True,
            "features": ["Todo de Basic", "GPS 24/7 + historial", "Alertas familiares", "Deteccion caidas", "Hasta 5 contactos"],
        },
        {
            "id": "sentinel-pro",
            "name": "Sentinel Pro",
            "price": 24.99,
            "period": "mes",
            "features": ["Todo de Plus", "Monitorizacion CRA 24/7", "Servicio Acuda", "Geovallas ilimitadas", "Soporte prioritario"],
        },
    ]

    return {
        "individual_plans": individual_plans,
        "family_plans": family_plans,
        "business_plans": business_plans,
        "alarm_plans": alarm_plans,
        "alarm_business_plans": alarm_business_plans,
        "sentinel_plans": sentinel_plans,
        "currency": "EUR",
        "referral_bonus": "1 mes gratis para ambos (referidor y referido)",
        "billing_options": ["monthly", "quarterly", "yearly"],
        "discounts": {
            "quarterly": 17,
            "yearly": 31
        }
    }

# ============================================
# STRIPE PAYMENT ROUTES
# ============================================

# Company information for invoices
COMPANY_INFO = {
    "name": "STARTBOOKING SL",
    "cif": "B19427723",
    "country": "ES"
}

@api_router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout session with promotional pricing logic"""
    user = await get_current_user(http_request, session_token)
    user_id = user.user_id if user else "anonymous"
    user_email = user.email if user else "anonymous@mano.com"
    
    try:
        package = SUBSCRIPTION_PACKAGES.get(data.plan_type)
        if not package:
            raise HTTPException(status_code=400, detail="Plan de suscripción no válido")
        
        final_amount = package["amount"]
        promo_applied = None
        
        # --- PROMOTIONAL LOGIC ---
        # 1. Check if user qualifies for 20% discount (first 200 subscribers)
        PROMO_200_LIMIT = 200
        PROMO_DISCOUNT_PCT = 20
        promo_subscribers = await db.subscriptions.count_documents({"promo_200": True})
        
        if promo_subscribers < PROMO_200_LIMIT and data.plan_type in (
            "family-monthly", "family-yearly", "family-quarterly",
            "monthly", "yearly", "quarterly",
            "alarm-essential", "alarm-premium", "alarm-business", "alarm-enterprise",
            "sentinel-basic", "sentinel-plus", "sentinel-pro",
            "vecinal-anual"
        ):
            discount_factor = (100 - PROMO_DISCOUNT_PCT) / 100
            final_amount = round(package["amount"] * discount_factor, 2)
            promo_applied = f"-{PROMO_DISCOUNT_PCT}% primeros {PROMO_200_LIMIT} suscriptores"
        
        # Build product description for checkout
        product_description = f"ManoProtect {package['name']} - Protección contra fraudes y estafas digitales"
        if package.get("max_users", 1) > 1:
            product_description += f" (hasta {package['max_users']} usuarios)"
        product_description += f". Período: {package['period']}."
        if promo_applied:
            product_description += f" PROMO: {promo_applied}"
        
        success_url = f"{data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/pricing?canceled=true"
        
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        checkout_request = CheckoutSessionRequest(
            amount=final_amount,
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "email": user_email,
                "plan_type": data.plan_type,
                "plan_name": package["name"],
                "product_description": product_description,
                "company_name": COMPANY_INFO["name"],
                "company_cif": COMPANY_INFO["cif"],
                "billing_period": package["period"],
                "promo_applied": promo_applied or "none",
                "original_amount": str(package["amount"]),
                "referral_code": data.referral_code or ""
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        transaction = PaymentTransaction(
            session_id=session.session_id,
            user_id=user_id,
            email=user_email,
            plan_type=data.plan_type,
            amount=final_amount,
            currency="eur",
            status="pending",
            payment_status="initiated",
            metadata={
                "plan_name": package["name"], 
                "plan_period": package["period"],
                "product_description": product_description,
                "company": COMPANY_INFO["name"],
                "cif": COMPANY_INFO["cif"],
                "promo_applied": promo_applied,
                "original_amount": package["amount"]
            }
        )
        
        tx_doc = transaction.model_dump()
        tx_doc['created_at'] = tx_doc['created_at'].isoformat()
        tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
        await db.payment_transactions.insert_one(tx_doc)
        
        return {
            "checkout_url": session.url, 
            "session_id": session.session_id,
            "product": {
                "name": package["name"],
                "description": product_description,
                "amount": final_amount,
                "original_amount": package["amount"] if promo_applied else None,
                "currency": "EUR",
                "period": package["period"],
                "promo_applied": promo_applied
            },
            "company": COMPANY_INFO
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al crear sesión de pago: {str(e)}")

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Get checkout session status"""
    try:
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        existing_tx = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if existing_tx and existing_tx.get('payment_status') == 'paid':
            return {
                "status": status.status,
                "payment_status": "paid",
                "amount_total": status.amount_total,
                "currency": status.currency,
                "already_processed": True
            }
        
        new_status = "completed" if status.payment_status == "paid" else status.status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": new_status,
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if status.payment_status == "paid" and existing_tx:
            promo_applied = existing_tx.get("metadata", {}).get("promo_applied")
            await db.users.update_one(
                {"user_id": existing_tx.get("user_id")},
                {"$set": {
                    "plan": existing_tx.get("plan_type"),
                    "subscription_status": "active",
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            # Create subscription if not exists
            existing_sub = await db.subscriptions.find_one({"user_id": existing_tx.get("user_id"), "plan_type": existing_tx.get("plan_type"), "status": "active"})
            if not existing_sub:
                await db.subscriptions.insert_one({
                    "user_id": existing_tx.get("user_id"),
                    "email": existing_tx.get("email"),
                    "plan_type": existing_tx.get("plan_type"),
                    "status": "active",
                    "promo_200": bool(promo_applied and promo_applied != "none"),
                    "amount_paid": existing_tx.get("amount"),
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "metadata": status.metadata
        }
    
    except Exception as e:
        logging.error(f"Checkout status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(
            payload,
            request.headers.get("Stripe-Signature")
        )
        
        if webhook_response.session_id:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": webhook_response.event_type,
                    "payment_status": webhook_response.payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            if webhook_response.payment_status == "paid":
                tx = await db.payment_transactions.find_one(
                    {"session_id": webhook_response.session_id},
                    {"_id": 0}
                )
                if tx:
                    # Handle trial subscription activation
                    if tx.get("metadata", {}).get("type") == "manoprotect_subscription" or tx.get("email", "").endswith("@"):
                        trial_user_id = tx.get("user_id") or tx.get("metadata", {}).get("user_id")
                        if trial_user_id:
                            await db.trial_users.update_one(
                                {"user_id": trial_user_id},
                                {"$set": {
                                    "subscription_status": "active",
                                    "subscription_started": datetime.now(timezone.utc).isoformat(),
                                }}
                            )

                    promo_applied = tx.get("metadata", {}).get("promo_applied")
                    update_fields = {
                        "plan": tx.get("plan_type"),
                        "subscription_status": "active",
                        "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                    }
                    await db.users.update_one(
                        {"user_id": tx.get("user_id")},
                        {"$set": update_fields},
                        upsert=True
                    )
                    # Create subscription record with promo flag
                    sub_doc = {
                        "user_id": tx.get("user_id"),
                        "email": tx.get("email"),
                        "plan_type": tx.get("plan_type"),
                        "status": "active",
                        "promo_200": bool(promo_applied and promo_applied != "none"),
                        "amount_paid": tx.get("amount"),
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    # Generate referral code for new subscriber
                    ref_code = f"MP-{tx.get('user_id', 'X')[:6].upper()}"
                    sub_doc["referral_code"] = ref_code
                    await db.subscriptions.insert_one(sub_doc)

                    # Process referral redemption if referral_code was used
                    ref_code_used = tx.get("metadata", {}).get("referral_code", "")
                    if ref_code_used:
                        try:
                            referrer_sub = await db.subscriptions.find_one(
                                {"referral_code": ref_code_used.strip().upper(), "status": "active"},
                                {"_id": 0}
                            )
                            if referrer_sub and referrer_sub.get("user_id") != tx.get("user_id"):
                                now = datetime.now(timezone.utc)
                                # Record the referral
                                await db.referrals.insert_one({
                                    "referrer_id": referrer_sub.get("user_id"),
                                    "referred_id": tx.get("user_id"),
                                    "referral_code": ref_code_used.strip().upper(),
                                    "plan_type": tx.get("plan_type"),
                                    "status": "completed",
                                    "created_at": now.isoformat(),
                                })
                                # Extend referrer subscription by 30 days
                                current_expires = referrer_sub.get("expires_at")
                                if current_expires:
                                    try:
                                        base = datetime.fromisoformat(current_expires.replace("Z", "+00:00"))
                                    except (ValueError, TypeError):
                                        base = now
                                else:
                                    base = now + timedelta(days=365)
                                new_exp = (base + timedelta(days=30)).isoformat()
                                await db.subscriptions.update_one(
                                    {"user_id": referrer_sub.get("user_id"), "status": "active"},
                                    {"$set": {"expires_at": new_exp, "last_referral_bonus_at": now.isoformat()}}
                                )
                        except Exception as ref_err:
                            logging.error(f"Referral processing error: {ref_err}")
        
        return {"status": "success", "event_type": webhook_response.event_type}
    
    except Exception as e:
        logging.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# Universal referral validation endpoint (for all products)
@api_router.get("/referrals/validate/{code}")
async def validate_referral_universal(code: str):
    """Validate a referral code for any product."""
    sub = await db.subscriptions.find_one(
        {"referral_code": code.strip().upper(), "status": "active"},
        {"_id": 0, "referral_code": 1, "plan_type": 1}
    )
    if not sub:
        return {"valid": False, "message": "Codigo de referido no valido"}
    return {"valid": True, "message": "Codigo valido. Al contratar, ambos recibis 1 mes gratis.", "plan": sub.get("plan_type")}

# ============================================
# ADMIN ROUTES
# ============================================

@api_router.post("/admin/create-admin")
async def create_admin_user(email: str, name: str, password: str):
    """Create admin user (use once, then remove or protect)"""
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        await db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
        return {"message": "Usuario actualizado a admin"}
    
    user = User(
        email=email,
        name=name,
        auth_provider="email",
        password_hash=hash_password(password),
        role="admin"
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    return {"message": "Admin creado", "user_id": user.user_id}

# ============================================
# ENTERPRISE DASHBOARD ROUTES - MOVED TO routes/enterprise_routes.py
# ============================================

# ============================================
# FAMILY ROUTES - Using routes/family_routes.py
# (Legacy routes moved to modular router)
# ============================================

# ============================================
# NOTIFICATIONS - Using routes/notifications_routes.py
# (Legacy routes removed - all notification functionality in modular router)
# Helper function kept for internal use
# ============================================

# Helper function to create notification (used internally by other modules)
async def create_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    """Create and store a notification"""
    from models.all_schemas import Notification
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    
    doc = notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    
    return notification

# ============================================
# INVESTOR PORTAL ROUTES
# ============================================

@api_router.get("/investor/verify-access")
async def verify_investor_access(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Check if current user has investor access and return download history"""
    try:
        user = await get_current_user(request, session_token)
        
        # Check if user has investor role
        has_access = user.role in ["investor", "admin", "superadmin"]
        
        # Get download history if has access
        download_history = []
        if has_access:
            cursor = db.document_downloads.find(
                {"user_id": user.user_id}
            ).sort("downloaded_at", -1).limit(20)
            
            async for doc in cursor:
                download_history.append({
                    "doc_type": doc.get("doc_type"),
                    "downloaded_at": doc.get("downloaded_at"),
                    "format": doc.get("format", "pdf")
                })
        
        return {
            "has_access": has_access,
            "user_role": user.role,
            "download_history": download_history
        }
    except HTTPException:
        return {"has_access": False, "download_history": []}

# ============================================
# PDF GENERATION ROUTES
# ============================================

@api_router.get("/investor/download-pdf/{doc_type}")
async def download_investor_pdf(
    doc_type: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Download document as HTML (styled for printing/PDF conversion) - investor only"""
    import markdown2
    
    user = await require_investor(request, session_token)
    
    doc_map = {
        "business-plan": "/app/memory/plan-de-negocio-completo.md",
        "financial-model": "/app/memory/financial-model.md",
        "pitch-deck": "/app/memory/pitch-deck-inversores.md",
        "dossier-b2b": "/app/memory/dossier-comercial-b2b.md",
        "one-pager": "/app/memory/ONE_PAGER_INVERSORES.md",
        "roadmap-tecnico": "/app/memory/roadmap-tecnico.md",
        "business-plan-full": "/app/memory/BUSINESS_PLAN_INVERSORES.md",
        "pitch-deck-extended": "/app/memory/PITCH_DECK_INVERSORES.md"
    }
    
    file_path = doc_map.get(doc_type)
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    # Log download
    await db.document_downloads.insert_one({
        "user_id": user.user_id,
        "doc_type": doc_type,
        "format": "pdf",
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Read markdown
    with open(file_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(md_content, extras=["tables", "fenced-code-blocks", "header-ids"])
    
    # Create styled HTML document (can be printed to PDF from browser)
    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MANO - {doc_type.replace('-', ' ').title()}</title>
    <style>
        @media print {{
            body {{ margin: 2cm; }}
            .no-print {{ display: none; }}
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        h1 {{
            color: #4338ca;
            font-size: 28pt;
            border-bottom: 3px solid #4338ca;
            padding-bottom: 15px;
            margin-top: 40px;
        }}
        h2 {{
            color: #4338ca;
            font-size: 20pt;
            margin-top: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }}
        h3 {{
            color: #374151;
            font-size: 16pt;
            margin-top: 25px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid #d1d5db;
            padding: 10px 15px;
            text-align: left;
        }}
        th {{
            background-color: #f3f4f6;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9fafb;
        }}
        code {{
            background-color: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11pt;
        }}
        pre {{
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }}
        blockquote {{
            border-left: 4px solid #4338ca;
            padding-left: 20px;
            margin: 20px 0;
            color: #4b5563;
            font-style: italic;
        }}
        ul, ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 8px 0;
        }}
        .header {{
            text-align: center;
            margin-bottom: 50px;
            padding: 30px;
            background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
            color: white;
            border-radius: 12px;
        }}
        .header h1 {{
            color: white;
            border: none;
            margin: 0 0 10px 0;
            font-size: 32pt;
        }}
        .header p {{
            margin: 0;
            font-size: 14pt;
            opacity: 0.9;
        }}
        .confidential {{
            text-align: center;
            color: #dc2626;
            font-weight: bold;
            margin: 30px 0;
            padding: 15px;
            border: 2px solid #dc2626;
            border-radius: 8px;
            background-color: #fef2f2;
        }}
        .print-btn {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4338ca;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14pt;
            box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
        }}
        .print-btn:hover {{
            background: #3730a3;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>MANO</h1>
        <p>Plataforma Integral de Protección contra Fraudes</p>
    </div>
    <div class="confidential">
        ⚠️ DOCUMENTO CONFIDENCIAL - Solo para inversores autorizados
    </div>
    {html_content}
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 10pt;">
        MANO © 2025 - Documento generado el {datetime.now().strftime('%d/%m/%Y')} - Confidencial
    </div>
    <button class="print-btn no-print" onclick="window.print()">Imprimir / Guardar PDF</button>
</body>
</html>"""
    
    filename = f"MANO_{doc_type.replace('-', '_')}_CONFIDENCIAL_2025.html"
    
    return Response(
        content=full_html,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

# ============================================
# ADMIN PANEL ROUTES (Enhanced)
# ============================================

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get admin dashboard overview"""
    await require_admin(request, session_token)
    
    # Get counts
    total_users = await db.users.count_documents({})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    pending_investors = await db.investor_requests.count_documents({"status": "pending"})
    approved_investors = await db.investor_requests.count_documents({"status": "approved"})
    
    # Get recent activity
    recent_users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_threats = await db.threats.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Revenue (optimized aggregation - calculates sum directly in DB)
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payment_transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "stats": {
            "total_users": total_users,
            "premium_users": premium_users,
            "free_users": total_users - premium_users,
            "pending_investors": pending_investors,
            "approved_investors": approved_investors,
            "total_revenue": total_revenue
        },
        "recent_users": recent_users,
        "recent_threats": recent_threats[:5]
    }


@api_router.get("/admin/services-status")
async def get_services_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check status of all external services (Infobip, Firebase, Stripe)"""
    await require_admin(request, session_token)
    
    services = {
        "infobip": {"status": "unknown", "message": "", "configured": False},
        "firebase": {"status": "unknown", "message": "", "configured": False},
        "stripe": {"status": "unknown", "message": "", "configured": False},
        "mongodb": {"status": "ok", "message": "Conectado", "configured": True}
    }
    
    # Check Infobip
    infobip_key = os.environ.get('INFOBIP_API_KEY')
    infobip_url = os.environ.get('INFOBIP_BASE_URL')
    
    if infobip_key and infobip_url:
        services["infobip"]["configured"] = True
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{infobip_url}/account/1/balance",
                    headers={"Authorization": f"App {infobip_key}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    services["infobip"]["status"] = "ok"
                    services["infobip"]["message"] = f"Activo - Saldo: {data.get('balance', 'N/A')} {data.get('currency', '')}"
                else:
                    services["infobip"]["status"] = "error"
                    services["infobip"]["message"] = f"Error HTTP {response.status_code}"
        except Exception as e:
            services["infobip"]["status"] = "error"
            services["infobip"]["message"] = f"Error: {str(e)}"
    else:
        services["infobip"]["message"] = "Credenciales no configuradas en .env (INFOBIP_API_KEY, INFOBIP_BASE_URL)"
    
    # Check Firebase - use env vars instead of JSON file
    fb_project = os.environ.get('FIREBASE_PROJECT_ID')
    fb_email = os.environ.get('FIREBASE_CLIENT_EMAIL')
    fb_key = os.environ.get('FIREBASE_PRIVATE_KEY')
    if fb_project and fb_email and fb_key:
        services["firebase"]["configured"] = True
        try:
            import firebase_admin
            from firebase_admin import credentials
            try:
                firebase_admin.get_app()
                services["firebase"]["status"] = "ok"
                services["firebase"]["message"] = "Firebase Admin SDK inicializado"
            except ValueError:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": fb_project,
                    "client_email": fb_email,
                    "private_key": fb_key.replace('\\n', '\n'),
                    "token_uri": "https://oauth2.googleapis.com/token"
                })
                firebase_admin.initialize_app(cred)
                services["firebase"]["status"] = "ok"
                services["firebase"]["message"] = "Firebase Admin SDK inicializado desde env vars"
        except Exception as e:
            services["firebase"]["status"] = "error"
            services["firebase"]["message"] = f"Error: {str(e)}"
    else:
        services["firebase"]["message"] = "Credenciales Firebase no configuradas en .env"
    
    # Check Stripe
    stripe_key = os.environ.get('STRIPE_API_KEY')
    if stripe_key:
        services["stripe"]["configured"] = True
        try:
            import stripe
            stripe.api_key = stripe_key
            # Quick test - get account info
            account = stripe.Account.retrieve()
            services["stripe"]["status"] = "ok"
            services["stripe"]["message"] = f"Conectado - {account.get('business_profile', {}).get('name', 'Cuenta activa')}"
        except Exception as e:
            services["stripe"]["status"] = "error"
            services["stripe"]["message"] = f"Error: {str(e)}"
    else:
        services["stripe"]["message"] = "STRIPE_API_KEY no configurada"
    
    # Overall status
    all_ok = all(s["status"] == "ok" for s in services.values())
    any_error = any(s["status"] == "error" for s in services.values())
    
    return {
        "overall_status": "ok" if all_ok else ("error" if any_error else "warning"),
        "services": services,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/admin/users")
async def get_admin_users(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None
):
    """Get all users (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

# Email del único superadmin permitido (desde variable de entorno)
SUPERADMIN_EMAIL = os.environ.get("SUPERADMIN_EMAIL", "rrhh.milchollos@gmail.com")

@api_router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user role (superadmin only)"""
    await require_admin(request, session_token)
    
    if role not in ["user", "premium", "superadmin"]:
        raise HTTPException(status_code=400, detail="Rol inválido. Roles válidos: user, premium, superadmin")
    
    # Only allow superadmin role for the designated email
    if role == "superadmin":
        target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if target_user and target_user.get("email") != SUPERADMIN_EMAIL:
            raise HTTPException(
                status_code=403, 
                detail=f"Solo {SUPERADMIN_EMAIL} puede tener el rol de superadmin"
            )
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": f"Rol actualizado a {role}"}

@api_router.patch("/admin/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    plan: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user subscription plan (admin only) - Manual premium activation"""
    await require_admin(request, session_token)
    
    valid_plans = [
        "free", 
        "personal", "personal-monthly", "personal-quarterly", "personal-yearly",
        "family", "family-monthly", "family-quarterly", "family-yearly",
        "business", "business-monthly", "business-yearly",
        "enterprise", "enterprise-monthly", "enterprise-yearly"
    ]
    
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Plan inválido. Planes válidos: {', '.join(valid_plans)}")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        # Try with 'id' field
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    # Determine subscription status and expiry based on plan
    now = datetime.now(timezone.utc)
    if plan == "free":
        subscription_status = None
        subscription_expiry = None
    else:
        subscription_status = "active"
        # Set expiry based on plan period
        if "yearly" in plan:
            subscription_expiry = (now + timedelta(days=365)).isoformat()
        elif "quarterly" in plan:
            subscription_expiry = (now + timedelta(days=90)).isoformat()
        else:  # monthly
            subscription_expiry = (now + timedelta(days=30)).isoformat()
    
    # Update user plan
    update_data = {
        "plan": plan,
        "subscription_status": subscription_status,
        "subscription_expiry": subscription_expiry,
        "plan_updated_at": now.isoformat(),
        "plan_updated_by": "admin_manual",
        "is_active": True
    }
    
    # Update using the correct ID field
    query = {"user_id": user_id} if "user_id" in user else {"id": user_id}
    result = await db.users.update_one(query, {"$set": update_data})
    
    # Log the plan change
    await db.admin_logs.insert_one({
        "action": "plan_change",
        "user_id": user_id,
        "user_email": user.get("email"),
        "old_plan": old_plan,
        "new_plan": plan,
        "changed_by": "admin",
        "subscription_expiry": subscription_expiry,
        "created_at": now.isoformat()
    })
    
    return {
        "success": True,
        "message": f"Plan actualizado de '{old_plan}' a '{plan}'",
        "user_id": user_id,
        "old_plan": old_plan,
        "new_plan": plan,
        "subscription_status": subscription_status,
        "subscription_expiry": subscription_expiry
    }

@api_router.get("/admin/subscriptions")
async def get_admin_subscriptions(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all premium subscriptions with details (admin only)"""
    await require_admin(request, session_token)
    
    # Get all premium users
    premium_users = await db.users.find(
        {"plan": {"$ne": "free"}},
        {"_id": 0, "password_hash": 0}
    ).to_list(500)
    
    # Get subscription stats
    stats = {
        "total_premium": len(premium_users),
        "by_plan": {},
        "recent_upgrades": []
    }
    
    for user in premium_users:
        plan = user.get("plan", "unknown")
        stats["by_plan"][plan] = stats["by_plan"].get(plan, 0) + 1
    
    # Get recent plan changes
    recent_logs = await db.admin_logs.find(
        {"action": "plan_change"},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "subscribers": premium_users,
        "stats": stats,
        "recent_changes": recent_logs
    }


@api_router.patch("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Activate or deactivate a user (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Can't deactivate yourself
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Can't deactivate other superadmins
    if user.get("role") == "superadmin" and not is_active:
        raise HTTPException(status_code=400, detail="No puedes desactivar a otro superadmin")
    
    # Update user status
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_active": is_active}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        "action": "user_status_change",
        "user_id": user_id,
        "is_active": is_active,
        "changed_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    status_text = "activado" if is_active else "dado de baja"
    return {
        "message": f"Usuario {status_text} correctamente",
        "user_id": user_id,
        "is_active": is_active
    }

@api_router.post("/admin/users/{user_id}/cancel-subscription")
async def cancel_user_subscription(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel user subscription - downgrade to free plan (admin only)"""
    admin = await require_admin(request, session_token)
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    old_plan = user.get("plan", "free")
    
    # Update to free plan
    query = {"user_id": user_id} if "user_id" in user else {"id": user_id}
    await db.users.update_one(query, {"$set": {
        "plan": "free",
        "subscription_status": "cancelled",
        "subscription_cancelled_at": datetime.now(timezone.utc).isoformat(),
        "subscription_cancelled_by": admin.user_id
    }})
    
    # Log the cancellation
    await db.admin_logs.insert_one({
        "action": "subscription_cancelled",
        "user_id": user_id,
        "user_email": user.get("email"),
        "old_plan": old_plan,
        "cancelled_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": f"Suscripción cancelada. Usuario degradado de '{old_plan}' a 'free'",
        "user_id": user_id
    }

@api_router.get("/admin/users/{user_id}/details")
async def get_user_details(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get detailed user information including family members (admin only)"""
    await require_admin(request, session_token)
    
    # Get user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get family members if family plan
    family_members = []
    if user.get("plan", "").startswith("family"):
        family_members = await db.family_members.find(
            {"owner_id": user_id},
            {"_id": 0}
        ).to_list(10)
    
    # Get children for tracking
    children = await db.family_children.find(
        {"family_owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get activity log
    activity = await db.admin_logs.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Get subscription history
    sub_history = await db.admin_logs.find(
        {"user_id": user_id, "action": {"$in": ["plan_change", "subscription_cancelled"]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "user": user,
        "family_members": family_members,
        "children_tracking": children,
        "activity": activity,
        "subscription_history": sub_history,
        "badge": SUBSCRIPTION_BADGES.get(user.get("plan", "free"), SUBSCRIPTION_BADGES["free"])
    }

@api_router.get("/admin/users/{user_id}/family-members")
async def get_user_family_members(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get family members for a user (admin only)"""
    await require_admin(request, session_token)
    
    # Get user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get family members
    family_members = await db.family_members.find(
        {"owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get children for tracking
    children = await db.family_children.find(
        {"family_owner_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    return {
        "user_email": user.get("email"),
        "user_plan": user.get("plan"),
        "family_members": family_members,
        "children_tracking": children,
        "max_members": 5 if user.get("plan", "").startswith("family") else 2
    }

@api_router.post("/admin/users/{user_id}/add-family-member")
async def admin_add_family_member(
    user_id: str,
    name: str,
    email: str,
    relationship: str = "familiar",
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Add family member to a user (admin only)"""
    await require_admin(request, session_token)
    
    # Verify user exists and has family plan
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user.get("plan", "").startswith("family"):
        raise HTTPException(status_code=400, detail="El usuario no tiene plan familiar")
    
    # Check member limit
    existing_members = await db.family_members.count_documents({"owner_id": user_id})
    if existing_members >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros alcanzado")
    
    # Add member
    member = {
        "member_id": f"member_{uuid.uuid4().hex[:12]}",
        "owner_id": user_id,
        "name": name,
        "email": email,
        "relationship": relationship,
        "added_at": datetime.now(timezone.utc).isoformat(),
        "added_by": "admin"
    }
    
    await db.family_members.insert_one(member)
    
    return {
        "success": True,
        "message": f"Miembro '{name}' añadido",
        "member": {k: v for k, v in member.items() if k != "_id"}
    }

@api_router.delete("/admin/users/{user_id}/family-member/{member_id}")
async def admin_remove_family_member(
    user_id: str,
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove family member from a user (admin only)"""
    await require_admin(request, session_token)
    
    result = await db.family_members.delete_one({
        "member_id": member_id,
        "owner_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"success": True, "message": "Miembro eliminado"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Permanently delete a user (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Can't delete yourself
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    # Get current user
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Can't delete other superadmins
    if user.get("role") == "superadmin":
        raise HTTPException(status_code=400, detail="No puedes eliminar a un superadmin")
    
    # Delete user and related data
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    
    # Log the action
    await db.admin_logs.insert_one({
        "action": "user_deleted",
        "user_id": user_id,
        "user_email": user.get("email"),
        "deleted_by": admin.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": "Usuario eliminado permanentemente",
        "user_id": user_id
    }

@api_router.delete("/admin/users/cleanup/test-users")
async def delete_test_users(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete all test users (superadmin only)"""
    admin = await require_admin(request, session_token)
    
    # Find test users
    test_patterns = ["test_", "demo@", "test@", "testuser@", "admin@mano"]
    deleted_count = 0
    deleted_emails = []
    
    async for user in db.users.find():
        email = user.get("email", "")
        user_id = user.get("user_id", user.get("id", ""))
        
        # Skip superadmins
        if user.get("role") == "superadmin":
            continue
            
        # Check if it's a test user
        is_test = any(pattern in email.lower() for pattern in test_patterns)
        if is_test:
            await db.users.delete_one({"_id": user["_id"]})
            await db.user_sessions.delete_many({"user_id": user_id})
            deleted_emails.append(email)
            deleted_count += 1
    
    return {
        "message": f"Eliminados {deleted_count} usuarios de test",
        "deleted_count": deleted_count,
        "deleted_emails": deleted_emails
    }

# Subscription badge system
SUBSCRIPTION_BADGES = {
    "free": {"name": "Bronce", "icon": "🥉", "color": "#CD7F32", "level": 1},
    "personal": {"name": "Plata", "icon": "🥈", "color": "#C0C0C0", "level": 2},
    "personal-monthly": {"name": "Plata", "icon": "🥈", "color": "#C0C0C0", "level": 2},
    "personal-quarterly": {"name": "Oro", "icon": "🥇", "color": "#FFD700", "level": 3},
    "personal-yearly": {"name": "Oro", "icon": "🥇", "color": "#FFD700", "level": 3},
    "family": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-monthly": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-quarterly": {"name": "Platino", "icon": "💎", "color": "#E5E4E2", "level": 4},
    "family-yearly": {"name": "Diamante", "icon": "💠", "color": "#B9F2FF", "level": 5},
    "business": {"name": "Diamante", "icon": "💠", "color": "#B9F2FF", "level": 5},
    "enterprise": {"name": "Élite", "icon": "👑", "color": "#9400D3", "level": 6},
}

@api_router.get("/user/badge")
async def get_user_badge(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's subscription badge"""
    user = await require_auth(request, session_token)
    plan = user.plan or "free"
    
    badge = SUBSCRIPTION_BADGES.get(plan, SUBSCRIPTION_BADGES["free"])
    
    return {
        "plan": plan,
        "badge": badge,
        "next_level": get_next_badge_level(plan)
    }

def get_next_badge_level(current_plan: str) -> dict:
    """Get next badge level for upgrade suggestion"""
    current = SUBSCRIPTION_BADGES.get(current_plan, SUBSCRIPTION_BADGES["free"])
    current_level = current["level"]
    
    upgrade_path = {
        1: {"plan": "personal", "badge": SUBSCRIPTION_BADGES["personal"]},
        2: {"plan": "personal-yearly", "badge": SUBSCRIPTION_BADGES["personal-yearly"]},
        3: {"plan": "family-monthly", "badge": SUBSCRIPTION_BADGES["family-monthly"]},
        4: {"plan": "family-yearly", "badge": SUBSCRIPTION_BADGES["family-yearly"]},
        5: {"plan": "enterprise", "badge": SUBSCRIPTION_BADGES["enterprise"]},
        6: None  # Already at max
    }
    
    return upgrade_path.get(current_level)

@api_router.get("/admin/stats")
async def get_admin_stats(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get platform statistics (superadmin only)"""
    await require_admin(request, session_token)
    
    # User stats
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": {"$ne": False}})
    premium_users = await db.users.count_documents({"plan": {"$ne": "free"}})
    
    # Role distribution
    user_count = await db.users.count_documents({"role": "user"})
    premium_count = await db.users.count_documents({"role": "premium"})
    superadmin_count = await db.users.count_documents({"role": "superadmin"})
    
    # Plan distribution
    plan_stats = {}
    for plan in ["free", "personal", "family", "business", "enterprise"]:
        plan_stats[plan] = await db.users.count_documents({"plan": plan})
    
    # Recent activity
    recent_logins = await db.user_sessions.count_documents({
        "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()}
    })
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "premium": premium_users
        },
        "roles": {
            "user": user_count,
            "premium": premium_count,
            "superadmin": superadmin_count
        },
        "plans": plan_stats,
        "activity": {
            "logins_last_7_days": recent_logins
        }
    }


@api_router.get("/admin/payments")
async def get_admin_payments(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Get all payments (admin only)"""
    await require_admin(request, session_token)
    
    query = {}
    if status:
        query["payment_status"] = status
    
    payments = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    return payments

@api_router.get("/admin/document-downloads")
async def get_document_downloads(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get document download history (admin only)"""
    await require_admin(request, session_token)
    
    downloads = await db.document_downloads.find({}, {"_id": 0}).sort("downloaded_at", -1).limit(100).to_list(100)
    
    return downloads

# ============================================
# PUSH NOTIFICATIONS - Using routes/push_routes.py
# (Legacy code removed - all push functionality in modular router)
# ============================================

# ============================================
# WHATSAPP INTEGRATION
# ============================================

# WhatsApp API configuration (using official Cloud API)
WHATSAPP_API_URL = os.environ.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v17.0')
WHATSAPP_PHONE_ID = os.environ.get('WHATSAPP_PHONE_ID', '')
WHATSAPP_ACCESS_TOKEN = os.environ.get('WHATSAPP_ACCESS_TOKEN', '')

@api_router.post("/whatsapp/send")
async def send_whatsapp_message(
    data: WhatsAppMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send WhatsApp message (requires WhatsApp Business API credentials)"""
    user = await require_auth(request, session_token)
    
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_ID:
        # Log message for later sending when configured
        alert = WhatsAppAlert(
            user_id=user.user_id,
            phone_number=data.phone_number,
            message_type="manual",
            message=data.message,
            status="pending"
        )
        doc = alert.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.whatsapp_queue.insert_one(doc)
        
        return {
            "success": False,
            "message": "WhatsApp API no configurada. Mensaje en cola.",
            "queue_id": alert.id
        }
    
    # Send via WhatsApp Cloud API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_ID}/messages",
                headers={
                    "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                },
                json={
                    "messaging_product": "whatsapp",
                    "to": data.phone_number,
                    "type": "text",
                    "text": {"body": data.message}
                }
            )
            
            if response.status_code == 200:
                return {"success": True, "message": "Mensaje enviado"}
            else:
                return {"success": False, "error": response.text}
    except Exception as e:
        logging.error(f"WhatsApp send error: {e}")
        return {"success": False, "error": str(e)}

@api_router.post("/whatsapp/alert")
async def send_whatsapp_alert(
    threat_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send threat alert via WhatsApp to emergency contacts"""
    user = await require_auth(request, session_token)
    
    # Get threat details
    threat = await db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    # Get emergency contacts
    contacts = await db.contacts.find(
        {"user_id": user.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(10)
    
    if not contacts:
        return {"success": False, "message": "No hay contactos de emergencia configurados"}
    
    # Build alert message
    alert_message = f"""🚨 *ALERTA DE SEGURIDAD MANO*

Se ha detectado una amenaza de nivel *{threat.get('risk_level', 'desconocido').upper()}*

Tipos: {', '.join(threat.get('threat_types', ['No especificado']))}

Recomendación: {threat.get('recommendation', 'Mantén precaución')}

_Este mensaje fue enviado automáticamente por MANO._
"""
    
    # Queue messages for each contact
    sent_count = 0
    for contact in contacts:
        if contact.get('phone'):
            alert = WhatsAppAlert(
                user_id=user.user_id,
                phone_number=contact['phone'],
                message_type="threat_alert",
                message=alert_message,
                status="pending"
            )
            doc = alert.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.whatsapp_queue.insert_one(doc)
            sent_count += 1
    
    return {
        "success": True,
        "message": f"Alertas en cola para {sent_count} contactos",
        "contacts_notified": sent_count
    }

@api_router.get("/whatsapp/queue")
async def get_whatsapp_queue(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get pending WhatsApp messages"""
    user = await require_auth(request, session_token)
    
    messages = await db.whatsapp_queue.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return messages

# ============================================
# REAL-TIME METRICS (Server-Sent Events)
# ============================================
# AI SUPPORT CHAT ROUTES
# ============================================

from pydantic import BaseModel as PydanticBaseModel

class ChatMessage(PydanticBaseModel):
    message: str
    session_id: Optional[str] = None

@api_router.post("/chat/message")
async def send_chat_message(
    data: ChatMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send a message to the AI support assistant"""
    from services.ai_support import get_ai_response
    
    # Get user if authenticated (optional for chat)
    user = await get_current_user(request, session_token)
    
    # Use user_id as session if authenticated, otherwise use provided or generate
    session_id = data.session_id
    if not session_id:
        if user:
            session_id = user.user_id
        else:
            session_id = f"anon_{uuid.uuid4().hex[:8]}"
    
    # Get AI response
    result = await get_ai_response(
        user_message=data.message,
        session_id=session_id,
        db=db
    )
    
    return {
        "success": True,
        "response": result["response"],
        "session_id": result["session_id"],
        "escalate_to_human": result.get("escalate_to_human", False)
    }


@api_router.get("/chat/quick-responses")
async def get_quick_responses():
    """Get quick response options for the chat widget"""
    from services.ai_support import get_quick_responses
    return {"responses": get_quick_responses()}


@api_router.delete("/chat/session/{session_id}")
async def clear_chat_session(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Clear chat history for a session"""
    from services.ai_support import clear_session
    clear_session(session_id)
    return {"success": True, "message": "Sesión limpiada"}


# ============================================
# PUBLIC API FOR PARTNERS (metrics & api-keys are in metrics_routes.py)
# ============================================

async def validate_api_key(api_key: str) -> Optional[dict]:
    """Validate API key and return key info"""
    key_doc = await db.api_keys.find_one({"key": api_key, "is_active": True}, {"_id": 0})
    return key_doc

# Public API endpoints (authenticated via API key)
public_router = APIRouter(prefix="/api/v1", tags=["public-api"])

# Simple access key for downloading documents (owner access)
OWNER_DOWNLOAD_KEY = os.environ.get("OWNER_DOWNLOAD_KEY")

@public_router.get("/documents/download-zip")
async def public_download_documents(key: str = ""):
    """Download all investor documents with access key"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    zip_path = "/app/MANO_Documentos_Inversores.zip"
    if not Path(zip_path).exists():
        raise HTTPException(status_code=404, detail="Archivo ZIP no encontrado")
    
    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename="MANO_Documentos_Inversores_CONFIDENCIAL.zip"
    )

@public_router.get("/documents/download-pdf/{doc_name}")
async def public_download_single_pdf(doc_name: str, key: str = ""):
    """Download a single PDF document with access key"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    # Map of allowed document names
    allowed_docs = {
        "plan-negocio": "PLAN_DE_NEGOCIO.pdf",
        "presentacion": "PRESENTACION_INVERSORES.pdf",
        "modelo-financiero": "MODELO_FINANCIERO.pdf",
        "terminos": "TERMINOS_INVERSION.pdf",
        "enterprise": "MANO_ENTERPRISE_BUSINESS_PLAN.pdf"
    }
    
    if doc_name not in allowed_docs:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    pdf_path = f"/app/docs/pdf/{allowed_docs[doc_name]}"
    if not Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado")
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"MANO_{doc_name}_CONFIDENCIAL.pdf"
    )

# Download endpoints for deployable packages
@public_router.get("/downloads/{package_name}")
async def download_package(package_name: str, key: str = ""):
    """Download deployment packages"""
    if key != OWNER_DOWNLOAD_KEY:
        raise HTTPException(status_code=403, detail="Clave de acceso inválida")
    
    packages = {
        "web": "/app/downloads/MANO_Web_IONOS.zip",
        "mobile": "/app/downloads/MANO_Mobile_App.zip",
        "backend": "/app/downloads/MANO_Backend_Server.zip",
        "docs": "/app/downloads/MANO_Documentos_Inversores.zip",
        "todo": "/app/downloads/MANO_Completo_Todo.zip",
        "desktop-crm": "/app/backend/uploads/downloads/ManoProtect-CRM-Desktop.zip",
        "desktop-cra": "/app/backend/uploads/downloads/ManoProtect-CRA-Desktop.zip",
        "desktop-completo": "/app/backend/uploads/downloads/ManoProtect-Desktop-Apps-COMPLETO.zip"
    }
    
    if package_name not in packages:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    file_path = packages[package_name]
    if not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    filenames = {
        "web": "MANO_Web_IONOS.zip",
        "mobile": "MANO_Mobile_App_PlayStore.zip",
        "backend": "MANO_Backend_Server.zip",
        "docs": "MANO_Documentos_Inversores.zip",
        "todo": "MANO_Completo_Todo.zip",
        "desktop-crm": "ManoProtect-CRM-Desktop.zip",
        "desktop-cra": "ManoProtect-CRA-Desktop.zip",
        "desktop-completo": "ManoProtect-Desktop-Apps-COMPLETO.zip"
    }
    
    return FileResponse(
        path=file_path,
        media_type="application/zip",
        filename=filenames[package_name]
    )


@public_router.get("/descargas/{filename}")
async def descargar_zip(filename: str):
    """Descarga directa de ZIPs sin autenticacion"""
    safe = filename.replace("..", "").replace("/", "")
    for d in ["/app/downloads", "/app/backend/uploads/downloads"]:
        fp = Path(d) / safe
        if fp.exists() and fp.suffix == ".zip":
            return FileResponse(path=str(fp), media_type="application/zip", filename=safe)
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

async def get_api_key_user(request: Request) -> dict:
    """Get user from API key in header"""
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key requerida")
    
    key_doc = await validate_api_key(api_key)
    if not key_doc:
        raise HTTPException(status_code=401, detail="API key inválida")
    
    return key_doc

@public_router.get("/analyze/status")
async def public_api_status(request: Request):
    """Check API status (no auth required)"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/analyze",
            "/api/v1/threats",
            "/api/v1/stats"
        ]
    }

@public_router.post("/analyze")
async def public_analyze(
    data: AnalyzeRequest,
    request: Request
):
    """Analyze content for threats via public API"""
    key_info = await get_api_key_user(request)
    
    if "write:analyze" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    # Rate limiting check
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    usage_key = f"{key_info['id']}_{today}"
    
    usage = await db.api_usage.find_one({"key": usage_key})
    if usage and usage.get("count", 0) >= key_info.get("rate_limit", 1000):
        raise HTTPException(status_code=429, detail="Límite de rate alcanzado")
    
    # Increment usage
    await db.api_usage.update_one(
        {"key": usage_key},
        {"$inc": {"count": 1}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    # Analyze
    analysis_result = await analyze_threat(data.content, data.content_type)
    
    # Store result
    threat_obj = ThreatAnalysis(
        user_id=key_info["user_id"],
        content=data.content,
        content_type=data.content_type,
        risk_level=analysis_result["risk_level"],
        is_threat=analysis_result["is_threat"],
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result["recommendation"],
        analysis=analysis_result["analysis"]
    )
    
    doc = threat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['source'] = 'api'
    doc['api_key_id'] = key_info['id']
    await db.threats.insert_one(doc)
    
    return {
        "id": threat_obj.id,
        "is_threat": threat_obj.is_threat,
        "risk_level": threat_obj.risk_level,
        "threat_types": threat_obj.threat_types,
        "recommendation": threat_obj.recommendation
    }

@public_router.get("/threats")
async def public_get_threats(
    request: Request,
    limit: int = 50,
    offset: int = 0
):
    """Get threats via public API"""
    key_info = await get_api_key_user(request)
    
    if "read:threats" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    threats = await db.threats.find(
        {"user_id": key_info["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(offset).limit(min(limit, 100)).to_list(100)
    
    total = await db.threats.count_documents({"user_id": key_info["user_id"]})
    
    return {
        "data": threats,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@public_router.get("/stats")
async def public_get_stats(request: Request):
    """Get statistics via public API"""
    key_info = await get_api_key_user(request)
    
    if "read:threats" not in key_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Permiso denegado")
    
    user_id = key_info["user_id"]
    
    total = await db.threats.count_documents({"user_id": user_id})
    blocked = await db.threats.count_documents({"user_id": user_id, "is_threat": True})
    
    return {
        "total_analyzed": total,
        "threats_blocked": blocked,
        "protection_rate": round((blocked / total * 100) if total > 0 else 100, 1)
    }

# ============================================
# BANKING INTEGRATION - RESERVED FOR MANOBANK.ES
# ============================================
# Banking features will be available when ManoBank.es is launched
# All banking endpoints (/bank/*) are disabled for ManoProtect

# ============================================
# MANOPROTECT ML FRAUD DETECTION
# ============================================

# ============================================
# ML FRAUD DETECTION ROUTES
# ============================================

@api_router.get("/ml/risk-summary")
async def get_risk_summary(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's fraud risk summary"""
    user = await require_auth(request, session_token)
    summary = await fraud_service.get_user_risk_summary(user.user_id)
    return summary

@api_router.post("/ml/analyze-text")
async def ml_analyze_text(
    data: AnalyzeRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze text using ML + LLM hybrid approach"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    result = await ta_service.analyze_content(
        data.content, 
        data.content_type,
        user_id
    )
    
    # Save analysis
    if user:
        await ta_service.save_analysis(user_id, data.content, data.content_type, result)
    
    return result

@api_router.get("/ml/behavior-profile")
async def get_behavior_profile(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's behavior profile for ML"""
    user = await require_auth(request, session_token)
    profile = await fraud_service._get_user_profile(user.user_id)
    
    if not profile:
        return {
            "message": "No hay suficientes datos para generar un perfil",
            "profile": None
        }
    
    return {
        "profile": {
            "avg_transaction_amount": profile.get("avg_transaction_amount", 0),
            "transaction_count": profile.get("transaction_count", 0),
            "typical_merchants": profile.get("typical_merchants", []),
            "typical_hours": profile.get("typical_hours", []),
            "updated_at": profile.get("updated_at")
        }
    }

# ============================================
# REWARDS AND GAMIFICATION ROUTES
# ============================================

from services.rewards_service import rewards_service
from services.email_service import email_service

@api_router.get("/rewards")
async def get_user_rewards(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's rewards, points, badges, and level"""
    user = await require_auth(request, session_token)
    rewards = await rewards_service.get_user_rewards(user.user_id)
    return rewards

@api_router.post("/rewards/claim-daily")
async def claim_daily_reward(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Claim daily login reward and update streak"""
    user = await require_auth(request, session_token)
    
    # Update streak
    streak_result = await rewards_service.update_streak(user.user_id)
    
    # Award daily login points
    points_result = await rewards_service.award_points(user.user_id, 'daily_login')
    
    return {
        "success": True,
        "daily_points": points_result.get('points_earned', 0),
        "streak_days": streak_result.get('streak_days', 1),
        "streak_bonus": streak_result.get('bonus_points', 0),
        "total_points": points_result.get('total_points', 0),
        "level": points_result.get('level', {})
    }

@api_router.get("/rewards/leaderboard")
async def get_leaderboard(
    period: str = "weekly",
    limit: int = 10
):
    """Get leaderboard for specified period"""
    if period not in ['weekly', 'monthly', 'all_time']:
        period = 'weekly'
    
    leaderboard = await rewards_service.get_leaderboard(period, min(limit, 50))
    return {"period": period, "leaderboard": leaderboard}

@api_router.get("/rewards/badges")
async def get_all_badges():
    """Get all available badges"""
    return {"badges": list(rewards_service.badges.values())}

@api_router.post("/rewards/action/{action}")
async def reward_action(
    action: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Award points for a specific action"""
    user = await require_auth(request, session_token)
    
    if action not in rewards_service.point_actions:
        raise HTTPException(status_code=400, detail="Acción no válida")
    
    result = await rewards_service.award_points(user.user_id, action)
    return result

# ============================================
# EMAIL NOTIFICATION ROUTES
# ============================================

@api_router.get("/email/queue")
async def get_email_queue(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get pending emails (admin only)"""
    user = await require_auth(request, session_token)
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    emails = await email_service.get_email_queue()
    return {"emails": emails, "sendgrid_configured": email_service.is_configured}

@api_router.post("/email/test")
async def send_test_email(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send a test email to the current user"""
    user = await require_auth(request, session_token)
    
    result = await email_service.send_daily_summary(
        user.user_id,
        user.email,
        {
            "analyzed_today": 5,
            "threats_blocked": 2,
            "safe_items": 3,
            "points_earned": 25,
            "protection_rate": 98.5
        }
    )
    
    return result

@api_router.get("/email/preferences")
async def get_email_preferences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's email notification preferences"""
    user = await require_auth(request, session_token)
    
    prefs = await db.email_preferences.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not prefs:
        new_prefs = {
            "user_id": user.user_id,
            "threat_alerts": True,
            "transaction_alerts": True,
            "daily_summary": True,
            "weekly_summary": False,
            "reward_notifications": True,
            "family_alerts": True,
            "marketing": False
        }
        await db.email_preferences.insert_one(new_prefs.copy())
        prefs = new_prefs
    
    return prefs

@api_router.patch("/email/preferences")
async def update_email_preferences(
    data: EmailPreferencesUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's email notification preferences"""
    user = await require_auth(request, session_token)
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if update_data:
        await db.email_preferences.update_one(
            {"user_id": user.user_id},
            {"$set": update_data},
            upsert=True
        )
    
    return {"success": True, "message": "Preferencias actualizadas"}

# ============================================
# APP SETUP
# ============================================

# Import and include modular routes BEFORE registering api_router
# Auth routes (already initialized at the top)
api_router.include_router(auth_router)
print("✅ Auth routes loaded")

# Investor routes
api_router.include_router(investor_router)
print("✅ Investor routes loaded")

# Threat routes
api_router.include_router(threat_router)
print("✅ Threat routes loaded")

# Profile & Contacts routes
api_router.include_router(profile_contacts_router)
print("✅ Profile & Contacts routes loaded")

# Family & SOS routes
api_router.include_router(family_sos_router)
print("✅ Family & SOS routes loaded")

# Family Management routes
api_router.include_router(family_router)
print("✅ Family Management routes loaded")

# Geofencing routes
api_router.include_router(geofence_router)
print("✅ Geofencing routes loaded")

# Core routes (health, plans, knowledge)
api_router.include_router(core_router)
print("✅ Core routes loaded")

# Notifications routes
api_router.include_router(notifications_router)
print("✅ Notifications routes loaded")

# Metrics routes
api_router.include_router(metrics_router)
print("✅ Metrics routes loaded")

# Chat routes (AI Support)
api_router.include_router(chat_router)
print("✅ Chat routes loaded")

# Employee Portal routes (Messaging & Presence)
api_router.include_router(employee_portal_router)
print("✅ Employee Portal routes loaded")

# Enterprise Auth routes (Login, 2FA, Dashboard)
api_router.include_router(enterprise_auth_router)
print("✅ Enterprise Auth routes loaded")

# Enterprise routes (Dashboard & Reports)
api_router.include_router(enterprise_router)
print("✅ Enterprise routes loaded")

# ManoProtect Shield routes (DNA Digital, Trust Seal, Voice AI, etc.)
api_router.include_router(shield_router)
print("✅ ManoProtect Shield routes loaded")

# Real-Time Scam Detection routes (LIVE data)
api_router.include_router(realtime_router)
print("✅ Real-Time Scam Detection routes loaded (LIVE)")

# AI Voice Shield routes
api_router.include_router(voice_shield_router)
print("✅ AI Voice Shield routes loaded")

# Smart Family Locator routes
api_router.include_router(smart_locator_router)
print("✅ Smart Family Locator routes loaded")

# Anti-Deepfake Shield routes
api_router.include_router(deepfake_shield_router)
print("✅ Anti-Deepfake Shield routes loaded")

# Investor CRM routes
api_router.include_router(investor_crm_router)

# Demo Videos (Sora 2 AI video generation)
api_router.include_router(demo_videos_router)

# SOS Device Orders (Physical SOS Keychain)
api_router.include_router(sos_device_router)
print("✅ SOS Device routes loaded")

# Legacy Vault (Secure Digital Legacy)
api_router.include_router(legacy_vault_router)

# User Reviews/Ratings System
api_router.include_router(reviews_router)
print("✅ Reviews routes loaded")

# Location Lock & Documents (Parental Control + PDF)
api_router.include_router(location_lock_router)
print("✅ Location Lock & Documents routes loaded")


# Emergency 112 + Trial Reminders + Analytics
api_router.include_router(emergency_analytics_router)
print("✅ Emergency 112 + Analytics routes loaded")


# Export Reports
api_router.include_router(export_router)
print("✅ Export routes loaded")

# Two-Factor Authentication
api_router.include_router(twofa_router)
print("✅ 2FA routes loaded")

# WhatsApp Alerts (Twilio)
api_router.include_router(whatsapp_router)
print("✅ WhatsApp alerts routes loaded")

# Phishing Simulation (B2B Enterprise)
api_router.include_router(phishing_router)
print("✅ Investor CRM routes loaded")

# Promo Sentinel S TikTok
api_router.include_router(promo_sentinel_router)
print("✅ Promo Sentinel S routes loaded")

# Community Shield / Escudo Vecinal
api_router.include_router(community_shield_router)
print("✅ Community Shield routes loaded")

# Newsletter
api_router.include_router(newsletter_router)
print("✅ Newsletter routes loaded")

# Panel Vecinal Premium
api_router.include_router(panel_vecinal_router)
print("✅ Panel Vecinal Premium routes loaded")

# Push Notification Service (Vecinal Alerts)
from services.push_notification_service import init_push_service
init_push_service(db)

# Dashboard de Barrio (Public neighborhood stats)
from routes.dashboard_barrio_routes import router as dashboard_barrio_router, init_dashboard_barrio
init_dashboard_barrio(db)
api_router.include_router(dashboard_barrio_router)
print("✅ Dashboard Barrio routes loaded")

# Enterprise Central System (Company management + Sales CRM)
from routes.enterprise_central_routes import router as enterprise_central_router, init_enterprise_central
init_enterprise_central(db)
api_router.include_router(enterprise_central_router)
print("✅ Enterprise Central routes loaded")

# Payment routes (Stripe)
api_router.include_router(payments_router)
print("✅ Payment routes loaded")

# Admin routes for user management
init_admin_routes(db)
api_router.include_router(admin_routes)
print("✅ Admin routes loaded")

# Health profile routes
init_health_routes(db)
api_router.include_router(health_router)
print("✅ Health profile routes loaded")

# Audio storage routes
init_audio_routes(db)
api_router.include_router(audio_router)
print("✅ Audio storage routes loaded")

# Device management routes
init_device_routes(db)
api_router.include_router(device_router)
print("✅ Device management routes loaded")

# Push notification routes
init_push_routes(db)
api_router.include_router(push_router)
print("✅ Push notification routes loaded")

# SOS Test routes (for development/testing)
try:
    from routes.sos_test_routes import router as sos_test_router
    api_router.include_router(sos_test_router)
    print("✅ SOS Test routes loaded")
except ImportError as e:
    print(f"⚠️ SOS Test routes not loaded: {e}")

# Banking routes - RESERVED for ManoBank.es
# try:
#     from routes.banking_routes import router as banking_router
#     api_router.include_router(banking_router)
#     print("✅ Banking routes loaded")
# except ImportError as e:
#     print(f"⚠️ Banking routes not loaded: {e}")

# ManoBank routes RESERVED - Will be loaded when ManoBank.es domain is ready
# try:
#     from routes.manobank_routes import router as manobank_router, init_manobank_routes
#     init_manobank_routes(db)
#     api_router.include_router(manobank_router)
#     print("✅ ManoBank routes loaded")
# except ImportError as e:
#     print(f"⚠️ ManoBank routes not loaded: {e}")
#
# try:
#     from routes.manobank_admin_routes import router as manobank_admin_router, init_manobank_admin_routes
#     init_manobank_admin_routes(db)
#     api_router.include_router(manobank_admin_router)
#     print("✅ ManoBank Admin routes loaded")
# except ImportError as e:
#     print(f"⚠️ ManoBank Admin routes not loaded: {e}")

try:
    from routes.email_routes import router as email_router, alerts_router, init_email_routes
    init_email_routes(db)
    api_router.include_router(email_router)
    api_router.include_router(alerts_router)
    print("✅ Email routes loaded")
    print("✅ Alert subscription routes loaded")
except ImportError as e:
    print(f"⚠️ Email routes not loaded: {e}")

try:
    from routes.whatsapp_routes import router as whatsapp_router
    api_router.include_router(whatsapp_router)
    print("✅ WhatsApp routes loaded")
except ImportError as e:
    print(f"⚠️ WhatsApp routes not loaded: {e}")

# Fraud API routes - Public scam verification
try:
    from routes.fraud_routes import router as fraud_router, init_fraud_routes
    init_fraud_routes(db)
    api_router.include_router(fraud_router)
    print("✅ Fraud API routes loaded")
except ImportError as e:
    print(f"⚠️ Fraud routes not loaded: {e}")

# SMS routes - RESERVED for ManoBank.es
# try:
#     from routes.sms_routes import router as sms_router, init_sms_routes
#     init_sms_routes(db)
#     api_router.include_router(sms_router)
#     print("✅ SMS/Twilio routes loaded")
# except ImportError as e:
#     print(f"⚠️ SMS routes not loaded: {e}")

# KYC Video Verification routes - RESERVED for ManoBank.es
# try:
#     from routes.kyc_video_routes import router as kyc_router, init_kyc_routes
#     init_kyc_routes(db)
#     api_router.include_router(kyc_router)
#     print("✅ KYC Video Verification routes loaded")
# except ImportError as e:
#     print(f"⚠️ KYC routes not loaded: {e}")

# Compliance & Banking Core routes - RESERVED for ManoBank.es
# api_router.include_router(compliance_router)
# print("✅ Compliance routes loaded")
# api_router.include_router(banking_core_router)
# print("✅ Banking Core routes loaded (Ledger, AML, KYC, Reporting)")

# Account deletion request routes (required by Google Play)
try:
    from routes.account_routes import router as account_router, init_account_routes
    init_account_routes(db)
    api_router.include_router(account_router)
    print("✅ Account deletion routes loaded")
except ImportError as e:
    print(f"⚠️ Account routes not loaded: {e}")

# Security Intelligence routes
try:
    from routes.security_routes import router as security_router, init_security_routes
    init_security_routes(db)
    api_router.include_router(security_router)
    print("✅ Security Intelligence routes loaded")
except ImportError as e:
    print(f"⚠️ Security routes not loaded: {e}")

# === Payment Routes ===
try:
    from routes.payments import router as payments_router
    api_router.include_router(payments_router)
    print("✅ Payment routes loaded")
except ImportError as e:
    print(f"⚠️ Payment routes not loaded: {e}")

# === Shipping Admin Routes ===
try:
    from routes.shipping_admin import router as shipping_admin_router
    api_router.include_router(shipping_admin_router)
    print("✅ Shipping Admin routes loaded")
except ImportError as e:
    print(f"⚠️ Shipping Admin routes not loaded: {e}")

# Employee Portal routes
try:
    api_router.include_router(employee_portal_router)
    print("✅ Employee Portal routes loaded")
except Exception as e:
    print(f"⚠️ Employee Portal routes not loaded: {e}")

# Enterprise Portal routes (Complete system)
try:
    from routes.enterprise_portal_routes import router as enterprise_portal_v2_router, set_database as init_enterprise_v2
    init_enterprise_v2(db)
    api_router.include_router(enterprise_portal_v2_router)
    print("✅ Enterprise Portal routes loaded")
except Exception as e:
    print(f"⚠️ Enterprise Portal routes not loaded: {e}")

# Password Recovery routes (Email + SMS)
try:
    api_router.include_router(recovery_router)
    print("✅ Password Recovery routes loaded")
except Exception as e:
    print(f"⚠️ Password Recovery routes not loaded: {e}")

# Employee Portal Extended Modules (Absences, Payslips, Documents, Notifications, Holidays)
try:
    api_router.include_router(absences_router)
    api_router.include_router(payslips_router)
    api_router.include_router(documents_router)
    api_router.include_router(emp_notifications_router)
    api_router.include_router(holidays_router)
    print("✅ Employee Portal Extended Modules loaded (Absences, Payslips, Documents, Notifications, Holidays)")
except Exception as e:
    print(f"⚠️ Employee Portal Extended Modules not loaded: {e}")

# Subscription Manager routes (Trial, Blocking, Card Validation)
try:
    api_router.include_router(subscription_manager_router)
    print("✅ Subscription Manager loaded (Trial management, User blocking, Card validation)")
except Exception as e:
    print(f"⚠️ Subscription Manager not loaded: {e}")

# New Subscription System routes (Full trial flow with Stripe)
try:
    from routes.subscription_routes import router as subscription_routes_router
    api_router.include_router(subscription_routes_router)
    print("✅ Subscription Routes loaded (Full trial system with Stripe)")
except Exception as e:
    print(f"⚠️ Subscription Routes not loaded: {e}")

# CRO System routes (A/B Testing, Email Sequences, Conversion Tracking)
try:
    from routes.cro_routes import router as cro_router, init_cro_routes
    init_cro_routes(db)
    api_router.include_router(cro_router)
    print("\u2705 CRO System loaded (A/B Testing, Email Sequences, Conversion Tracking)")
except Exception as e:
    print(f"\u26a0\ufe0f CRO routes not loaded: {e}")

# ── Contact Form Endpoint ──
@api_router.post("/contact")
async def submit_contact_form(request: Request):
    data = await request.json()
    contact_entry = {
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "subject": data.get("subject", ""),
        "message": data.get("message", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    await db["contact_messages"].insert_one(contact_entry)
    return {"status": "ok", "message": "Mensaje recibido"}

# ── CEO Dashboard Routes ──
try:
    from routes.ceo_dashboard import ceo_router, init_ceo_routes
    init_ceo_routes(db, require_admin)
    api_router.include_router(ceo_router)
    print("\u2705 CEO Dashboard routes loaded")
except Exception as e:
    print(f"\u26a0\ufe0f CEO Dashboard routes not loaded: {e}")

# ── CRA Operations Routes ──
try:
    from routes.cra_operations_routes import router as cra_ops_router, init_cra
    init_cra(db)
    api_router.include_router(cra_ops_router)
    print("\u2705 CRA Operations routes loaded")
except Exception as e:
    print(f"\u26a0\ufe0f CRA Operations routes not loaded: {e}")

# ── Client App Routes ──
try:
    from routes.client_app_routes import router as client_app_router, init_client_app
    init_client_app(db)
    api_router.include_router(client_app_router)
    print("\u2705 Client App routes loaded")
except Exception as e:
    print(f"\u26a0\ufe0f Client App routes not loaded: {e}")

# Trial, Anti-Abuse & Subscription System
try:
    from routes.client_trial_routes import router as trial_router, init_client_trial
    init_client_trial(db)
    api_router.include_router(trial_router)
    print("\u2705 Client Trial & Subscription routes loaded")
except Exception as e:
    print(f"\u26a0\ufe0f Client Trial routes not loaded: {e}")


# Firebase Push Notifications
try:
    from routes.notification_routes import router as notif_router, init_notifications
    init_notifications(db)
    api_router.include_router(notif_router)
    print("\u2705 Firebase Push Notifications loaded")
except Exception as e:
    print(f"\u26a0\ufe0f Notification routes not loaded: {e}")


# Sistema de Gestión CRA (Comerciales, Instaladores, Admin)
try:
    from routes.gestion_routes import router as gestion_router, init_gestion, _seed_gestion_users as seed_gestion
    init_gestion(db)
    api_router.include_router(gestion_router)

    from routes.backoffice_routes import router as backoffice_router, init_backoffice
    init_backoffice(db)
    api_router.include_router(backoffice_router)
    print("\u2705 Gestion CRA routes loaded")
    
    # Auto-seed gestion users on startup
    @app.on_event("startup")
    async def auto_seed_gestion():
        try:
            result = await seed_gestion()
            print(f"\U0001f464 Gestion auto-seed: {result.get('results', [])}")
        except Exception as e:
            print(f"\u26a0\ufe0f Gestion auto-seed error: {e}")

    # Auto-seed client demo data on startup
    @app.on_event("startup")
    async def auto_seed_client_demo():
        try:
            from routes.client_app_routes import seed_client_demo
            await seed_client_demo()
            print("\U0001f464 Client demo data seeded")
        except Exception as e:
            print(f"\u26a0\ufe0f Client demo seed error: {e}")
except Exception as e:
    print(f"\u26a0\ufe0f Gestion CRA routes not loaded: {e}")

# Endpoint descarga catálogo comercial PDF
from fastapi.responses import FileResponse as FR2
@api_router.get("/rss/feed.xml")
async def rss_feed():
    """RSS feed for Google Discover and news aggregators"""
    base = "https://manoprotectt.com"
    articles = [
        {"title": "Mejores Relojes GPS con SOS para Mayores 2026", "slug": "blog/mejores-relojes-sos-2026",
         "desc": "Comparativa completa de relojes inteligentes con boton SOS y GPS para personas mayores. Sentinel X, Sentinel S y mas.",
         "img": f"{base}/images/optimized/hero-family-hd.webp", "date": "2026-03-06"},
        {"title": "Como Funciona un Reloj SOS: Guia Completa", "slug": "blog/como-funciona-reloj-sos",
         "desc": "Todo sobre relojes de emergencia SOS: deteccion de caidas, GPS, alertas automaticas y Central Receptora de Alarmas 24/7.",
         "img": f"{base}/images/optimized/step-elderly.webp", "date": "2026-03-01"},
        {"title": "Reloj GPS para Personas con Alzheimer", "slug": "blog/reloj-para-alzheimer",
         "desc": "Como un reloj GPS puede ayudar a cuidar personas con demencia y Alzheimer. Geocercas, alertas y monitorizacion.",
         "img": f"{base}/images/optimized/sentinel-s.webp", "date": "2026-02-20"},
        {"title": "Seguridad para Hijos: Boton SOS Infantil", "slug": "blog/seguridad-hijos-boton-sos",
         "desc": "Guia para padres sobre dispositivos de seguridad GPS y SOS para ninos. Sentinel J analizado.",
         "img": f"{base}/images/optimized/step-child.webp", "date": "2026-02-15"},
        {"title": "Alarmas para Hogar sin Permanencia 2026", "slug": "blog/seguridad-familiar-digital-2026",
         "desc": "Las mejores alarmas para hogar y negocio sin permanencia ni cuotas ocultas. Instalacion gratuita.",
         "img": f"{base}/images/optimized/gallery-garcia.webp", "date": "2026-02-10"},
        {"title": "Proteccion contra Phishing y Estafas Online", "slug": "proteccion-phishing",
         "desc": "Como proteger a tu familia de phishing, fraudes online y estafas digitales. Herramientas y consejos practicos.",
         "img": f"{base}/images/optimized/step-teenager.webp", "date": "2026-01-25"},
    ]
    items_xml = ""
    for a in articles:
        items_xml += f"""    <item>
      <title>{a['title']}</title>
      <link>{base}/{a['slug']}</link>
      <description>{a['desc']}</description>
      <pubDate>{a['date']}T10:00:00+01:00</pubDate>
      <guid isPermaLink="true">{base}/{a['slug']}</guid>
      <enclosure url="{a['img']}" type="image/webp" length="50000" />
    </item>
"""
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>ManoProtect Blog - Seguridad Familiar</title>
    <link>{base}/blog</link>
    <description>Noticias y guias sobre seguridad familiar, alarmas profesionales, relojes GPS con SOS y proteccion digital.</description>
    <language>es</language>
    <lastBuildDate>2026-03-06T10:00:00+01:00</lastBuildDate>
    <atom:link href="{base}/api/rss/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>{base}/images/optimized/hero-family-hd.webp</url>
      <title>ManoProtect</title>
      <link>{base}</link>
    </image>
{items_xml}  </channel>
</rss>"""
    from fastapi.responses import Response
    return Response(content=rss, media_type="application/xml")


@api_router.get("/catalogo/comercial")
async def descargar_catalogo():
    pdf_path = "/app/backend/uploads/downloads/ManoProtect_Catalogo_Comercial_2025.pdf"
    if not os.path.exists(pdf_path):
        from scripts.generar_revista import RevistaManoProtect
        RevistaManoProtect().generar(pdf_path)
    return FR2(pdf_path, filename="ManoProtect_Catalogo_Comercial_2025.pdf", media_type="application/pdf")


# ── GA4 / Analytics Event Tracking ──
@api_router.post("/analytics/event")
async def track_event(request: Request):
    data = await request.json()
    event = {"event_name": data.get("event_name", "custom"), "params": data.get("params", {}), "user_id": data.get("user_id"), "page_url": data.get("page_url"), "utm_source": data.get("utm_source"), "utm_medium": data.get("utm_medium"), "utm_campaign": data.get("utm_campaign"), "ua": request.headers.get("user-agent", ""), "created_at": datetime.now(timezone.utc).isoformat()}
    await db["analytics_events"].insert_one(event)
    return {"tracked": True}


app.include_router(api_router)
app.include_router(public_router)
app.include_router(public_well_known_router)

# Note: Socket.IO is mounted earlier in the file (after WebSocket manager init)

# Configure CORS - read from environment for deployment flexibility
# Use allow_origin_regex to support credentials with any origin
# This echoes back the specific Origin header (not wildcard *) which is CORS-compliant with credentials
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=r".*",
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================
# STARTUP: Initialize Cron Jobs
# ============================================
@app.on_event("startup")
async def start_cron_jobs():
    """Start scheduled cron jobs for subscription management"""
    try:
        from services.cron_jobs import start_scheduler
        start_scheduler()
        print("✅ Cron jobs scheduler started")
    except Exception as e:
        print(f"⚠️ Could not start cron jobs: {e}")

@app.on_event("shutdown")
async def stop_cron_jobs():
    try:
        from services.cron_jobs import stop_scheduler
        stop_scheduler()
    except Exception:
        pass


# ── Push Notification Recovery (Re-engagement for inactive users) ──
@app.on_event("startup")
async def start_push_recovery():
    import asyncio
    async def recovery_loop():
        while True:
            await asyncio.sleep(3600 * 6)
            try:
                if not firebase_admin._apps:
                    continue
                from datetime import timedelta
                now = datetime.now(timezone.utc)
                threshold = (now - timedelta(days=2)).isoformat()
                users = db["client_users"].find({"subscription_status": {"$in": ["trial", "active"]}, "last_activity": {"$lt": threshold}}, {"_id": 0, "user_id": 1})
                msgs = [
                    ("Tu hogar te necesita protegido", "Hace dias que no abres ManoClient+. Tu sistema sigue activo."),
                    ("No olvides tu seguridad", "Revisa el estado de tus sensores y camaras en ManoClient+."),
                    ("Alerta de inactividad", "Tu sistema de alarma necesita tu atencion. Abre ManoClient+."),
                ]
                import random
                ct = 0
                async for u in users:
                    tks = [t["token"] async for t in db.fcm_tokens.find({"user_id": u["user_id"], "active": True}, {"_id": 0, "token": 1})]
                    if tks:
                        t, b = random.choice(msgs)
                        try:
                            messaging.send_each_for_multicast(messaging.MulticastMessage(notification=messaging.Notification(title=t, body=b), data={"type": "recovery"}, tokens=tks))
                            ct += 1
                        except Exception:
                            pass
                if ct > 0:
                    print(f"Push recovery: {ct} users notified")
            except Exception as e:
                print(f"Push recovery error: {e}")
    asyncio.create_task(recovery_loop())
    print("Push recovery scheduler started")


# ============================================
# STARTUP: Initialize Superadmins
# ============================================
@app.on_event("startup")
async def initialize_superadmins():
    """Create or update superadmin accounts on server startup"""
    import bcrypt
    import hashlib
    
    print("🔐 Initializing superadmin accounts...")
    
    for admin in SUPERADMIN_ACCOUNTS:
        try:
            existing = await db.users.find_one({"email": admin["email"]})
            
            if existing:
                # Update existing user to superadmin and unblock
                update_data = {
                    "role": "superadmin",
                    "is_superadmin": True,
                    "plan": "enterprise",
                    "subscription_status": "active",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                # Update password if specified
                if admin.get("password"):
                    update_data["password_hash"] = bcrypt.hashpw(
                        admin["password"].encode(), 
                        bcrypt.gensalt()
                    ).decode()
                
                await db.users.update_one(
                    {"email": admin["email"]},
                    {"$set": update_data}
                )
                
                # Remove any login blocks
                await db.security_login_attempts.delete_many({"email": admin["email"]})
                
                print(f"  ✅ Updated: {admin['email']} (superadmin, unblocked)")
            else:
                # Create new superadmin
                if not admin.get("password"):
                    print(f"  ⚠️ Skipped: {admin['email']} (no password, user doesn't exist)")
                    continue
                    
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                password_hash = bcrypt.hashpw(admin["password"].encode(), bcrypt.gensalt()).decode()
                
                user_doc = {
                    "user_id": user_id,
                    "email": admin["email"],
                    "name": admin["name"],
                    "password_hash": password_hash,
                    "plan": "enterprise",
                    "role": "superadmin",
                    "is_superadmin": True,
                    "subscription_status": "active",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.users.insert_one(user_doc)
                print(f"  ✅ Created: {admin['email']} (superadmin)")
                
        except Exception as e:
            print(f"  ❌ Error with {admin['email']}: {e}")
    
    print("🔐 Superadmin initialization complete!")
    
    # Initialize Enterprise CEO Employee
    print("👔 Initializing Enterprise CEO employee...")
    try:
        ceo_email = "ceo@manoprotectt.com"
        ceo_password = os.environ.get('SUPERADMIN_PASSWORD_1', '')
        
        existing_ceo = await db.enterprise_employees.find_one({"email": ceo_email})
        
        ceo_password_hash = bcrypt.hashpw(ceo_password.encode(), bcrypt.gensalt()).decode()
        
        if existing_ceo:
            await db.enterprise_employees.update_one(
                {"email": ceo_email},
                {"$set": {
                    "password_hash": ceo_password_hash,
                    "status": "active",
                    "is_active": True
                }}
            )
            print(f"  ✅ Updated: {ceo_email} (enterprise CEO)")
        else:
            ceo_doc = {
                "employee_id": "emp_superadmin001",
                "email": ceo_email,
                "name": "CEO ManoProtect",
                "role": "super_admin",
                "department": "Dirección",
                "phone": "+34601510950",
                "password_hash": ceo_password_hash,
                "status": "active",
                "is_active": True,
                "two_factor_enabled": False,
                "permissions": ["all"],
                "created_at": datetime.now(timezone.utc),
                "created_by": "system_init"
            }
            await db.enterprise_employees.insert_one(ceo_doc)
            print(f"  ✅ Created: {ceo_email} (enterprise CEO)")
    except Exception as e:
        print(f"  ❌ Error initializing CEO: {e}")
    
    print("👔 Enterprise CEO initialization complete!")
    
    # Generate desktop app ZIP files for download
    import zipfile
    downloads_dir = "/app/backend/uploads/downloads"
    desktop_dir = "/app/desktop-apps"
    os.makedirs(downloads_dir, exist_ok=True)
    
    zip_configs = [
        ("ManoProtect-CRM-Desktop.zip", ["crm-ventas", "README.md"]),
        ("ManoProtect-CRA-Desktop.zip", ["cra-operador", "README.md"]),
        ("ManoProtect-Desktop-Apps-COMPLETO.zip", ["crm-ventas", "cra-operador", "README.md"]),
    ]
    
    for zip_name, folders in zip_configs:
        zip_path = os.path.join(downloads_dir, zip_name)
        if not os.path.exists(zip_path):
            try:
                pass
            except Exception:
                pass


# ── ASGI Export ──
combined_app = app
