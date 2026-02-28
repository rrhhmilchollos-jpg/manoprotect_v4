"""
MANOPROTECT - Sistema de Suscripciones con Trial
Implementa el flujo completo de registro, trial, cobro automático y bloqueos
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr
import logging
import stripe
import os
import hashlib
import uuid

from core.database import db, get_current_user, STRIPE_API_KEY
from services.email_service import EmailNotificationService

# Configure Stripe
stripe.api_key = STRIPE_API_KEY

# Email service instance
email_service = EmailNotificationService()

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])
logger = logging.getLogger(__name__)

# ===========================================
# CONFIGURACIÓN DE PLANES Y PRECIOS
# ===========================================

# Stripe Price IDs - Configurar en producción
STRIPE_PRICES = {
    "individual": {
        "mensual": os.environ.get("STRIPE_PRICE_INDIVIDUAL_MONTHLY", "price_individual_monthly"),
        "anual": os.environ.get("STRIPE_PRICE_INDIVIDUAL_YEARLY", "price_individual_yearly"),
        "amount_monthly": 20.83,
        "amount_yearly": 249.99
    },
    "familiar": {
        "mensual": os.environ.get("STRIPE_PRICE_FAMILIAR_MONTHLY", "price_familiar_monthly"),
        "anual": os.environ.get("STRIPE_PRICE_FAMILIAR_YEARLY", "price_familiar_yearly"),
        "amount_monthly": 9.99,
        "amount_yearly": 99.99
    }
}

PLAN_FEATURES = {
    "basico": {
        "name": "Plan Básico",
        "max_users": 1,
        "trial_days": 7,
        "requires_card": False,
        "features": ["Análisis básico", "Alertas email", "Historial 7 días"]
    },
    "individual": {
        "name": "Plan Individual",
        "max_users": 2,
        "trial_days": 7,
        "requires_card": True,
        "features": ["Protección 24/7", "Análisis IA avanzado", "Bloqueo automático", "2 usuarios", "Soporte prioritario"]
    },
    "familiar": {
        "name": "Plan Familiar",
        "max_users": 5,
        "trial_days": 7,
        "requires_card": True,
        "features": ["Todo del Individual", "5 miembros familia", "GPS tracking 24/7", "Alertas SOS", "Panel familiar", "Dispositivo GRATIS (anual)"]
    }
}

# ===========================================
# MODELOS PYDANTIC
# ===========================================

class RegistroUsuarioRequest(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    plan: str = "basico"  # basico, individual, familiar
    periodo: str = "mensual"  # mensual, anual
    payment_method_id: Optional[str] = None  # ID del método de pago de Stripe

class CancelarTrialRequest(BaseModel):
    motivo: Optional[str] = None

class CambiarPlanRequest(BaseModel):
    nuevo_plan: str
    nuevo_periodo: str
    payment_method_id: Optional[str] = None

# ===========================================
# FUNCIONES AUXILIARES
# ===========================================

def hash_ip(ip: str) -> str:
    """Hash IP for privacy-compliant blocking"""
    return hashlib.sha256(ip.encode()).hexdigest()

def hash_card(last4: str, exp_month: int, exp_year: int) -> str:
    """Hash card details for duplicate detection"""
    return hashlib.sha256(f"{last4}{exp_month}{exp_year}".encode()).hexdigest()

async def verificar_bloqueos(email: str, ip: str, card_hash: Optional[str] = None):
    """Verificar si el usuario está bloqueado por email, IP o tarjeta"""
    # Verificar email bloqueado
    email_blocked = await db.blocked_users.find_one({"email": email})
    if email_blocked:
        raise HTTPException(status_code=403, detail="Este email ha sido bloqueado por incumplimiento de términos")
    
    # Verificar IP bloqueada
    ip_hash = hash_ip(ip)
    ip_blocked = await db.blocked_users.find_one({"ip_hash": ip_hash})
    if ip_blocked:
        raise HTTPException(status_code=403, detail="Acceso denegado desde esta ubicación")
    
    # Verificar tarjeta bloqueada
    if card_hash:
        card_blocked = await db.blocked_users.find_one({"card_hash": card_hash})
        if card_blocked:
            raise HTTPException(status_code=403, detail="Este método de pago no está permitido")

async def obtener_price_id(plan: str, periodo: str) -> str:
    """Obtener el Price ID de Stripe según el plan y periodo"""
    if plan not in STRIPE_PRICES:
        raise HTTPException(status_code=400, detail=f"Plan no válido: {plan}")
    
    price_key = "mensual" if periodo == "mensual" else "anual"
    return STRIPE_PRICES[plan][price_key]

# ===========================================
# REGISTRO DE USUARIO CON TRIAL
# ===========================================

@router.post("/registrar")
async def registrar_usuario(
    data: RegistroUsuarioRequest,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Registrar nuevo usuario con trial de 7 días.
    - Plan básico: Sin tarjeta, trial gratuito
    - Planes de pago: Requiere tarjeta para verificación 3D Secure, sin cargo inicial
    """
    now = datetime.now(timezone.utc)
    client_ip = request.client.host if request.client else "unknown"
    
    # Verificar si el email ya existe
    existing_user = await db.users.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    
    # Verificar bloqueos
    await verificar_bloqueos(data.email, client_ip)
    
    # Crear documento base del usuario
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "nombre": data.nombre,
        "name": data.nombre,  # Compatibility with other parts of the app
        "password_hash": hashlib.sha256(data.password.encode()).hexdigest(),
        "plan_type": data.plan,
        "plan_period": data.periodo,
        "plan": data.plan,  # Compatibility
        "role": "user",
        "estado": "trial_active",
        "trial_start": now.isoformat(),
        "trial_end": (now + timedelta(days=7)).isoformat(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "payment_attempts": 0,
        "ip_registro": hash_ip(client_ip),
        "features": PLAN_FEATURES.get(data.plan, PLAN_FEATURES["basico"])["features"],
        "max_users": PLAN_FEATURES.get(data.plan, PLAN_FEATURES["basico"])["max_users"],
        "is_active": True,
        "auth_provider": "email"
    }
    
    # PLAN BÁSICO - Sin tarjeta
    if data.plan == "basico":
        user_doc["plan_type"] = "basic_trial"
        await db.users.insert_one(user_doc)
        
        logger.info(f"Usuario básico registrado: {data.email}")
        
        # Enviar email de bienvenida
        try:
            await email_service.send_trial_started_email(
                user_id=user_id,
                email=data.email,
                trial_data={
                    "trial_end": user_doc["trial_end"],
                    "plan_name": "Plan Básico",
                    "plan_price": "0",
                    "nombre": data.nombre
                }
            )
            logger.info(f"Email de bienvenida enviado a: {data.email}")
        except Exception as e:
            logger.warning(f"No se pudo enviar email de bienvenida: {e}")
        
        return {
            "success": True,
            "message": "Cuenta básica activa con 7 días de prueba gratuita",
            "trial_end": user_doc["trial_end"],
            "plan": "basico",
            "email": data.email,
            "requires_card": False
        }
    
    # PLANES DE PAGO - Requieren tarjeta
    if not data.payment_method_id:
        raise HTTPException(
            status_code=400, 
            detail="Se requiere un método de pago para planes premium"
        )
    
    try:
        # Crear cliente en Stripe
        stripe_customer = stripe.Customer.create(
            email=data.email,
            name=data.nombre,
            payment_method=data.payment_method_id,
            invoice_settings={"default_payment_method": data.payment_method_id},
            metadata={
                "plan": data.plan,
                "periodo": data.periodo,
                "registro_fecha": now.isoformat()
            }
        )
        
        # Obtener info de la tarjeta para hash
        payment_method = stripe.PaymentMethod.retrieve(data.payment_method_id)
        card_info = payment_method.card
        card_hash = hash_card(
            card_info.last4, 
            card_info.exp_month, 
            card_info.exp_year
        )
        
        # Verificar si la tarjeta está bloqueada
        await verificar_bloqueos(data.email, client_ip, card_hash)
        
        # Obtener Price ID
        price_id = await obtener_price_id(data.plan, data.periodo)
        
        # Crear suscripción con trial de 7 días
        subscription = stripe.Subscription.create(
            customer=stripe_customer.id,
            items=[{"price": price_id}],
            trial_period_days=7,
            payment_behavior="default_incomplete",
            payment_settings={
                "payment_method_types": ["card"],
                "save_default_payment_method": "on_subscription"
            },
            expand=["latest_invoice.payment_intent"],
            metadata={
                "user_email": data.email,
                "plan": data.plan,
                "periodo": data.periodo
            }
        )
        
        # Actualizar documento del usuario
        user_doc["stripe_customer_id"] = stripe_customer.id
        user_doc["stripe_subscription_id"] = subscription.id
        user_doc["card_hash"] = card_hash
        user_doc["card_last4"] = card_info.last4
        user_doc["card_brand"] = card_info.brand
        
        await db.users.insert_one(user_doc)
        
        logger.info(f"Usuario premium registrado: {data.email}, plan: {data.plan}")
        
        # Enviar email de bienvenida
        plan_price = STRIPE_PRICES[data.plan][f"amount_{'monthly' if data.periodo == 'mensual' else 'yearly'}"]
        try:
            await email_service.send_trial_started_email(
                user_id=user_id,
                email=data.email,
                trial_data={
                    "trial_end": user_doc["trial_end"],
                    "plan_name": f"{PLAN_FEATURES[data.plan]['name']} {'Anual' if data.periodo == 'anual' else 'Mensual'}",
                    "plan_price": f"{plan_price:.2f}",
                    "nombre": data.nombre
                }
            )
            logger.info(f"Email de bienvenida enviado a: {data.email}")
        except Exception as e:
            logger.warning(f"No se pudo enviar email de bienvenida: {e}")
        
        # Verificar si se requiere 3D Secure
        requires_action = False
        client_secret = None
        
        if subscription.latest_invoice and subscription.latest_invoice.payment_intent:
            pi = subscription.latest_invoice.payment_intent
            if pi.status == "requires_action":
                requires_action = True
                client_secret = pi.client_secret
        
        return {
            "success": True,
            "message": f"Trial de 7 días iniciado para {PLAN_FEATURES[data.plan]['name']}",
            "trial_end": user_doc["trial_end"],
            "plan": data.plan,
            "periodo": data.periodo,
            "email": data.email,
            "stripe_subscription_id": subscription.id,
            "requires_action": requires_action,
            "client_secret": client_secret,
            "next_billing_date": (now + timedelta(days=7)).isoformat(),
            "amount": plan_price
        }
        
    except stripe.error.CardError as e:
        logger.error(f"Error de tarjeta para {data.email}: {e.user_message}")
        raise HTTPException(status_code=400, detail=f"Error con la tarjeta: {e.user_message}")
    except stripe.error.StripeError as e:
        logger.error(f"Error de Stripe para {data.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error procesando el pago")

# ===========================================
# CANCELAR TRIAL
# ===========================================

@router.post("/cancelar-trial")
async def cancelar_trial(
    data: CancelarTrialRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Cancelar trial y activar periodo de gracia de 7 días.
    El usuario mantiene acceso durante el periodo de gracia.
    """
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    user_doc = await db.users.find_one({"email": user.email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_doc.get("estado") != "trial_active":
        raise HTTPException(status_code=400, detail="Solo se puede cancelar durante el periodo de prueba")
    
    now = datetime.now(timezone.utc)
    
    # Si tiene suscripción de Stripe, cancelarla
    if user_doc.get("stripe_subscription_id"):
        try:
            stripe.Subscription.delete(user_doc["stripe_subscription_id"])
            logger.info(f"Suscripción Stripe cancelada para {user.email}")
        except stripe.error.StripeError as e:
            logger.error(f"Error cancelando suscripción Stripe: {e}")
    
    # Activar periodo de gracia
    grace_end = now + timedelta(days=7)
    
    await db.users.update_one(
        {"email": user.email},
        {
            "$set": {
                "estado": "grace_period",
                "grace_start": now.isoformat(),
                "grace_end": grace_end.isoformat(),
                "cancelacion_motivo": data.motivo,
                "cancelacion_fecha": now.isoformat(),
                "updated_at": now.isoformat()
            },
            "$unset": {
                "stripe_subscription_id": ""
            }
        }
    )
    
    logger.info(f"Trial cancelado para {user.email}, periodo de gracia hasta {grace_end}")
    
    return {
        "success": True,
        "message": "Has cancelado tu suscripción. Tienes 7 días de acceso gratuito.",
        "grace_end": grace_end.isoformat(),
        "estado": "grace_period"
    }

# ===========================================
# COBRO AUTOMÁTICO (llamado por cron o webhook)
# ===========================================

@router.post("/procesar-cobro/{user_email}")
async def cobrar_stripe(user_email: str, request: Request):
    """
    Procesar cobro automático al finalizar el trial.
    Solo para uso interno (cron job o webhook de Stripe).
    """
    # Verificar que es una llamada interna (simplificado)
    # En producción, usar autenticación más robusta
    
    user_doc = await db.users.find_one({"email": user_email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user_doc.get("stripe_subscription_id"):
        raise HTTPException(status_code=400, detail="Usuario sin suscripción activa")
    
    try:
        # Modificar suscripción para que no se cancele
        stripe.Subscription.modify(
            user_doc["stripe_subscription_id"],
            cancel_at_period_end=False
        )
        
        # Actualizar estado a activo
        await db.users.update_one(
            {"email": user_email},
            {
                "$set": {
                    "estado": "active",
                    "payment_attempts": 0,
                    "last_payment_date": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        logger.info(f"Cobro exitoso para {user_email}")
        
        return {"success": True, "message": "Pago procesado correctamente"}
        
    except stripe.error.CardError as e:
        # Incrementar intentos fallidos
        payment_attempts = user_doc.get("payment_attempts", 0) + 1
        
        if payment_attempts >= 3:
            # Bloquear usuario después de 3 intentos
            await bloquear_usuario_interno(user_email, "Fallos de pago repetidos")
            return {"success": False, "message": "Usuario bloqueado por fallos de pago"}
        else:
            # Registrar intento fallido
            await db.users.update_one(
                {"email": user_email},
                {
                    "$set": {
                        "payment_attempts": payment_attempts,
                        "last_payment_error": str(e.user_message),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            logger.warning(f"Fallo de pago {payment_attempts}/3 para {user_email}: {e.user_message}")
            
            return {
                "success": False, 
                "message": f"Error de pago: {e.user_message}",
                "attempts": payment_attempts
            }

# ===========================================
# BLOQUEO DE USUARIO
# ===========================================

async def bloquear_usuario_interno(email: str, motivo: str):
    """Función interna para bloquear usuario"""
    now = datetime.now(timezone.utc)
    
    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        return
    
    # Cancelar suscripción de Stripe si existe
    if user_doc.get("stripe_subscription_id"):
        try:
            stripe.Subscription.delete(user_doc["stripe_subscription_id"])
        except stripe.error.StripeError:
            pass
    
    # Actualizar estado del usuario
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "estado": "blocked",
                "blocked_at": now.isoformat(),
                "blocked_reason": motivo,
                "updated_at": now.isoformat()
            }
        }
    )
    
    # Registrar en colección de bloqueados
    await db.blocked_users.insert_one({
        "email": email,
        "ip_hash": user_doc.get("ip_registro"),
        "card_hash": user_doc.get("card_hash"),
        "motivo": motivo,
        "blocked_at": now.isoformat()
    })
    
    # Eliminar sesiones activas
    await db.sessions.delete_many({"user_email": email})
    
    logger.info(f"Usuario bloqueado: {email}, motivo: {motivo}")

@router.post("/bloquear/{user_email}")
async def bloquear_usuario(
    user_email: str,
    motivo: str = "Incumplimiento de términos",
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Bloquear usuario (solo admin)"""
    user = await get_current_user(request, session_token)
    if not user or user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    await bloquear_usuario_interno(user_email, motivo)
    
    return {"success": True, "message": f"Usuario {user_email} bloqueado"}

# ===========================================
# CRON JOB - REVISIÓN DIARIA
# ===========================================

@router.post("/cron/revisar-trials")
async def revisar_trial_usuarios(request: Request):
    """
    Revisar usuarios en trial y periodo de gracia.
    Ejecutar diariamente via cron job.
    """
    # En producción, verificar que es una llamada autorizada del cron
    
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()
    
    resultados = {
        "procesados": 0,
        "cobros_exitosos": 0,
        "cobros_fallidos": 0,
        "bloqueados": 0,
        "errores": []
    }
    
    # Buscar usuarios con trial activo que ha expirado
    trial_expirados = await db.users.find({
        "estado": "trial_active",
        "trial_end": {"$lte": now_str}
    }).to_list(length=1000)
    
    for user in trial_expirados:
        resultados["procesados"] += 1
        email = user.get("email")
        
        try:
            if user.get("plan_type") == "basic_trial":
                # Plan básico - bloquear directamente
                await bloquear_usuario_interno(email, "Trial básico expirado")
                resultados["bloqueados"] += 1
                logger.info(f"Usuario básico bloqueado por trial expirado: {email}")
            else:
                # Plan de pago - intentar cobrar
                if user.get("stripe_subscription_id"):
                    # El cobro se maneja automáticamente por Stripe
                    # Solo actualizamos el estado
                    await db.users.update_one(
                        {"email": email},
                        {
                            "$set": {
                                "estado": "active",
                                "updated_at": now_str
                            }
                        }
                    )
                    resultados["cobros_exitosos"] += 1
                else:
                    # Sin suscripción de Stripe - bloquear
                    await bloquear_usuario_interno(email, "Sin método de pago configurado")
                    resultados["bloqueados"] += 1
                    
        except Exception as e:
            resultados["errores"].append(f"{email}: {str(e)}")
            logger.error(f"Error procesando trial de {email}: {e}")
    
    # Buscar usuarios en periodo de gracia que ha expirado
    grace_expirados = await db.users.find({
        "estado": "grace_period",
        "grace_end": {"$lte": now_str}
    }).to_list(length=1000)
    
    for user in grace_expirados:
        resultados["procesados"] += 1
        email = user.get("email")
        
        try:
            await bloquear_usuario_interno(email, "Periodo de gracia expirado")
            resultados["bloqueados"] += 1
            logger.info(f"Usuario bloqueado por gracia expirada: {email}")
        except Exception as e:
            resultados["errores"].append(f"{email}: {str(e)}")
    
    logger.info(f"Revisión de trials completada: {resultados}")
    
    return {
        "success": True,
        "timestamp": now_str,
        "resultados": resultados
    }

# ===========================================
# CONSULTAS DE ESTADO
# ===========================================

@router.get("/mi-suscripcion")
async def obtener_mi_suscripcion(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener estado de suscripción del usuario actual"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    user_doc = await db.users.find_one(
        {"email": user.email},
        {"_id": 0, "password_hash": 0, "ip_registro": 0, "card_hash": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Calcular días restantes de trial
    dias_restantes = None
    if user_doc.get("estado") == "trial_active" and user_doc.get("trial_end"):
        trial_end = datetime.fromisoformat(user_doc["trial_end"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        dias_restantes = max(0, (trial_end - now).days)
    
    # Calcular días de gracia restantes
    dias_gracia = None
    if user_doc.get("estado") == "grace_period" and user_doc.get("grace_end"):
        grace_end = datetime.fromisoformat(user_doc["grace_end"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        dias_gracia = max(0, (grace_end - now).days)
    
    return {
        "email": user_doc.get("email"),
        "nombre": user_doc.get("nombre"),
        "plan_type": user_doc.get("plan_type"),
        "plan_period": user_doc.get("plan_period"),
        "estado": user_doc.get("estado"),
        "trial_end": user_doc.get("trial_end"),
        "dias_restantes_trial": dias_restantes,
        "grace_end": user_doc.get("grace_end"),
        "dias_restantes_gracia": dias_gracia,
        "features": user_doc.get("features", []),
        "max_users": user_doc.get("max_users", 1),
        "card_last4": user_doc.get("card_last4"),
        "card_brand": user_doc.get("card_brand"),
        "created_at": user_doc.get("created_at")
    }

@router.get("/planes")
async def obtener_planes():
    """Obtener información de todos los planes disponibles"""
    planes = []
    
    for plan_id, info in PLAN_FEATURES.items():
        plan_data = {
            "id": plan_id,
            "name": info["name"],
            "max_users": info["max_users"],
            "trial_days": info["trial_days"],
            "requires_card": info["requires_card"],
            "features": info["features"]
        }
        
        # Añadir precios para planes de pago
        if plan_id in STRIPE_PRICES:
            plan_data["precio_mensual"] = STRIPE_PRICES[plan_id]["amount_monthly"]
            plan_data["precio_anual"] = STRIPE_PRICES[plan_id]["amount_yearly"]
            plan_data["ahorro_anual"] = round(
                (STRIPE_PRICES[plan_id]["amount_monthly"] * 12) - STRIPE_PRICES[plan_id]["amount_yearly"], 
                2
            )
        
        planes.append(plan_data)
    
    return {"planes": planes}
