"""
MANO - Payment Routes (Stripe Integration)
Handles subscription plans, checkout sessions, and webhooks
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import logging
import stripe
import os

from core.database import db, get_current_user, STRIPE_API_KEY
from models.all_schemas import CheckoutRequest, PaymentTransaction
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)

# Configure Stripe
stripe.api_key = STRIPE_API_KEY

router = APIRouter(tags=["Payments"])

# Fixed subscription pricing packages (amounts in EUR) - SINCRONIZADO CON FRONTEND
SUBSCRIPTION_PACKAGES = {
    # Plan de Prueba 7 días (TRIAL - verificación de tarjeta 0€)
    "trial-7days": {"amount": 0, "name": "Prueba 7 días", "period": "7 días", "max_users": 2, "is_trial": True, "trial_days": 7, "after_trial_plan": "monthly"},
    # Planes CRO Landing (sincronizados con HighConversionLanding.js)
    "cro-monthly": {"amount": 9.99, "name": "Plan Mensual", "period": "mes", "max_users": 5},
    "cro-yearly": {"amount": 99.99, "name": "Plan Anual", "period": "año", "max_users": 5},
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
    # Planes Alarmas Hogar y Empresa
    "alarm-essential": {"amount": 24.99, "name": "Alarma Essential", "period": "mes", "max_users": 1, "is_alarm": True, "alarm_type": "essential"},
    "alarm-essential-regular": {"amount": 34.99, "name": "Alarma Essential", "period": "mes", "max_users": 1, "is_alarm": True, "alarm_type": "essential"},
    "alarm-premium": {"amount": 39.99, "name": "Alarma Premium", "period": "mes", "max_users": 1, "is_alarm": True, "alarm_type": "premium"},
    "alarm-premium-regular": {"amount": 49.99, "name": "Alarma Premium", "period": "mes", "max_users": 1, "is_alarm": True, "alarm_type": "premium"},
    "alarm-business": {"amount": 54.99, "name": "Alarma Business", "period": "mes", "max_users": 3, "is_alarm": True, "alarm_type": "business"},
    "alarm-business-regular": {"amount": 69.99, "name": "Alarma Business", "period": "mes", "max_users": 3, "is_alarm": True, "alarm_type": "business"},
}


@router.get("/alarm-plans")
async def get_alarm_plans():
    """Get alarm subscription plans for viviendas y empresas"""
    return {
        "plans": [
            {
                "id": "alarm-essential",
                "name": "ManoProtect Essential",
                "target": "Pisos y apartamentos",
                "promo_price": 24.99,
                "regular_price": 34.99,
                "promo_plan_id": "alarm-essential",
                "regular_plan_id": "alarm-essential-regular",
                "equipment_count": 8,
                "camera_count": 2,
                "sentinel_count": 1,
            },
            {
                "id": "alarm-premium",
                "name": "ManoProtect Premium",
                "target": "Chalets, adosados y casas",
                "promo_price": 39.99,
                "regular_price": 49.99,
                "promo_plan_id": "alarm-premium",
                "regular_plan_id": "alarm-premium-regular",
                "equipment_count": 10,
                "camera_count": 6,
                "sentinel_count": 2,
                "popular": True,
            },
            {
                "id": "alarm-business",
                "name": "ManoProtect Business",
                "target": "Locales, naves y oficinas",
                "promo_price": 54.99,
                "regular_price": 69.99,
                "promo_plan_id": "alarm-business",
                "regular_plan_id": "alarm-business-regular",
                "equipment_count": 10,
                "camera_count": 10,
                "sentinel_count": 3,
            },
        ]
    }

@router.post("/budget-calculator")
async def calculate_budget(data: dict):
    """Calculate personalized alarm budget based on property details"""
    space_type = data.get("space_type", "piso")
    sqm = data.get("sqm", 80)
    accesses = data.get("accesses", 2)
    floors = data.get("floors", 1)
    cameras_extra = data.get("cameras_extra", 0)
    has_garden = data.get("has_garden", False)

    if space_type in ["piso", "apartamento"]:
        base_plan = "alarm-essential"
        base_price = 24.99
        regular_price = 34.99
        plan_name = "Essential"
    elif space_type in ["chalet", "adosado", "casa"]:
        base_plan = "alarm-premium"
        base_price = 39.99
        regular_price = 49.99
        plan_name = "Premium"
    else:
        base_plan = "alarm-business"
        base_price = 54.99
        regular_price = 69.99
        plan_name = "Business"

    sensors = max(3, accesses + floors)
    cameras = 2 if sqm < 120 else (4 if sqm < 250 else 6)
    cameras += cameras_extra
    sirens = 1 if sqm < 150 else 2
    if has_garden:
        cameras += 1
        sirens += 1

    return {
        "recommended_plan": plan_name,
        "plan_id": base_plan,
        "promo_price": base_price,
        "regular_price": regular_price,
        "details": {
            "sensors": sensors,
            "cameras": cameras,
            "sirens": sirens,
            "contacts": accesses,
            "sentinel_included": 1 if base_plan == "alarm-essential" else (2 if base_plan == "alarm-premium" else 3),
        },
        "savings_vs_securitas": round((39.89 - base_price) * 12, 2) if base_plan == "alarm-essential" else round((48.90 - base_price) * 12, 2),
    }



@router.get("/plans")
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
    
    # Planes familiares
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
    
    return {
        "individual_plans": individual_plans,
        "family_plans": family_plans,
        "business_plans": business_plans,
        "currency": "EUR",
        "billing_options": ["weekly", "monthly", "quarterly", "yearly"],
        "discounts": {
            "quarterly": 17,
            "yearly": 31
        }
    }


@router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout session"""
    user = await get_current_user(http_request, session_token)
    user_id = user.user_id if user else "anonymous"
    user_email = user.email if user else "anonymous@mano.com"
    
    try:
        package = SUBSCRIPTION_PACKAGES.get(data.plan_type)
        if not package:
            raise HTTPException(status_code=400, detail="Plan de suscripción no válido")
        
        # Redirigir a página de éxito personalizada
        success_url = f"{data.origin_url}/gracias?success=true&session_id={{CHECKOUT_SESSION_ID}}&product=suscripcion&plan={data.plan_type}"
        cancel_url = f"{data.origin_url}/pricing?canceled=true"
        
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        checkout_request = CheckoutSessionRequest(
            amount=package["amount"],
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "email": user_email,
                "plan_type": data.plan_type,
                "plan_name": package["name"]
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        transaction = PaymentTransaction(
            session_id=session.session_id,
            user_id=user_id,
            email=user_email,
            plan_type=data.plan_type,
            amount=package["amount"],
            currency="eur",
            status="pending",
            payment_status="initiated",
            metadata={"plan_name": package["name"], "plan_period": package["period"]}
        )
        
        tx_doc = transaction.model_dump()
        tx_doc['created_at'] = tx_doc['created_at'].isoformat()
        tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
        await db.payment_transactions.insert_one(tx_doc)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al crear sesión de pago: {str(e)}")


@router.get("/checkout/status/{session_id}")
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
                "already_processed": True,
                "metadata": existing_tx.get("metadata", {})
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
            await db.users.update_one(
                {"user_id": existing_tx.get("user_id")},
                {"$set": {
                    "plan": existing_tx.get("plan_type"),
                    "subscription_status": "active",
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
        
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


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks including trial subscription events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("Stripe-Signature")
        
        # Get webhook secret from env (if configured)
        webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
        
        event = None
        
        # Verify webhook signature if secret is configured
        if webhook_secret:
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, webhook_secret
                )
            except stripe.error.SignatureVerificationError as e:
                logging.error(f"Webhook signature verification failed: {e}")
                raise HTTPException(status_code=400, detail="Invalid signature")
        else:
            # Parse event without signature verification (development mode)
            import json
            event = stripe.Event.construct_from(
                json.loads(payload), stripe.api_key
            )
        
        event_type = event.type
        event_data = event.data.object
        
        logging.info(f"Stripe webhook received: {event_type}")
        
        # Import email service
        from services.email_service import email_service
        
        # Handle different event types
        if event_type == 'customer.subscription.created':
            # New subscription created (trial started)
            subscription_id = event_data.id
            customer_id = event_data.customer
            trial_end = event_data.trial_end
            
            # Find trial record
            trial = await db.trial_subscriptions.find_one({"customer_id": customer_id})
            if trial:
                trial_end_date = datetime.fromtimestamp(trial_end, tz=timezone.utc) if trial_end else None
                await db.trial_subscriptions.update_one(
                    {"customer_id": customer_id},
                    {"$set": {
                        "stripe_subscription_id": subscription_id,
                        "status": "trialing",
                        "trial_end": trial_end_date.isoformat() if trial_end_date else None,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Send trial started email
                await email_service.send_trial_started_email(
                    user_id=trial.get("user_id"),
                    email=trial.get("email"),
                    trial_data={
                        "trial_end": trial_end_date.strftime("%d de %B de %Y") if trial_end_date else "en 7 días",
                        "plan_name": trial.get("plan_after_trial", "Premium Mensual"),
                        "plan_price": str(trial.get("plan_amount", 29.99))
                    }
                )
                
                # Update user plan
                await db.users.update_one(
                    {"user_id": trial.get("user_id")},
                    {"$set": {
                        "plan": "trial-7days",
                        "subscription_status": "trialing",
                        "trial_end": trial_end_date.isoformat() if trial_end_date else None
                    }}
                )
        
        elif event_type == 'customer.subscription.trial_will_end':
            # Trial ending in 3 days (Stripe sends this automatically)
            subscription_id = event_data.id
            customer_id = event_data.customer
            trial_end = event_data.trial_end
            
            trial = await db.trial_subscriptions.find_one({"stripe_subscription_id": subscription_id})
            if trial:
                trial_end_date = datetime.fromtimestamp(trial_end, tz=timezone.utc) if trial_end else None
                now = datetime.now(timezone.utc)
                days_left = (trial_end_date - now).days if trial_end_date else 3
                
                # Send trial ending soon email
                await email_service.send_trial_ending_soon_email(
                    user_id=trial.get("user_id"),
                    email=trial.get("email"),
                    trial_data={
                        "days_left": days_left,
                        "trial_end": trial_end_date.strftime("%d de %B de %Y") if trial_end_date else "pronto",
                        "plan_name": trial.get("plan_after_trial", "Premium Mensual"),
                        "plan_price": str(trial.get("plan_amount", 29.99))
                    }
                )
        
        elif event_type == 'customer.subscription.updated':
            # Subscription updated (could be trial ended -> active)
            subscription_id = event_data.id
            status = event_data.status
            
            if status == 'active':
                # Trial ended, subscription is now active
                trial = await db.trial_subscriptions.find_one({"stripe_subscription_id": subscription_id})
                if trial and trial.get("status") == "trialing":
                    current_period_end = event_data.current_period_end
                    next_billing = datetime.fromtimestamp(current_period_end, tz=timezone.utc) if current_period_end else None
                    
                    await db.trial_subscriptions.update_one(
                        {"stripe_subscription_id": subscription_id},
                        {"$set": {
                            "status": "active",
                            "subscription_started_at": datetime.now(timezone.utc).isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    
                    # Update user to paid plan
                    plan_type = trial.get("plan_after_trial", "monthly")
                    await db.users.update_one(
                        {"user_id": trial.get("user_id")},
                        {"$set": {
                            "plan": plan_type,
                            "subscription_status": "active",
                            "trial_end": None
                        }}
                    )
                    
                    # Send subscription active email
                    await email_service.send_trial_ended_email(
                        user_id=trial.get("user_id"),
                        email=trial.get("email"),
                        trial_data={
                            "plan_name": trial.get("plan_after_trial", "Premium Mensual"),
                            "plan_price": str(trial.get("plan_amount", 29.99)),
                            "next_billing": next_billing.strftime("%d de %B de %Y") if next_billing else "en 30 días"
                        }
                    )
        
        elif event_type == 'customer.subscription.deleted':
            # Subscription canceled
            subscription_id = event_data.id
            
            trial = await db.trial_subscriptions.find_one({"stripe_subscription_id": subscription_id})
            if trial:
                await db.trial_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {
                        "status": "canceled",
                        "canceled_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Update user to free plan
                await db.users.update_one(
                    {"user_id": trial.get("user_id")},
                    {"$set": {
                        "plan": "free",
                        "subscription_status": "canceled",
                        "trial_end": None
                    }}
                )
                
                # Send canceled email
                await email_service.send_trial_canceled_email(
                    user_id=trial.get("user_id"),
                    email=trial.get("email"),
                    trial_data={}
                )
        
        elif event_type == 'invoice.payment_succeeded':
            # Payment successful
            subscription_id = event_data.subscription
            if subscription_id:
                await db.trial_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {
                        "last_payment_at": datetime.now(timezone.utc).isoformat(),
                        "payment_status": "paid"
                    }}
                )
        
        elif event_type == 'invoice.payment_failed':
            # Payment failed
            subscription_id = event_data.subscription
            if subscription_id:
                await db.trial_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {
                        "payment_status": "failed",
                        "payment_failed_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
        
        # Also handle checkout.session.completed for regular payments
        elif event_type == 'checkout.session.completed':
            session_id = event_data.id
            payment_status = event_data.payment_status
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "completed",
                    "payment_status": payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            if payment_status == "paid":
                tx = await db.payment_transactions.find_one(
                    {"session_id": session_id},
                    {"_id": 0}
                )
                if tx:
                    await db.users.update_one(
                        {"user_id": tx.get("user_id")},
                        {"$set": {
                            "plan": tx.get("plan_type"),
                            "subscription_status": "active"
                        }},
                        upsert=True
                    )
        
        return {"status": "success", "event_type": event_type}
    
    except stripe.error.StripeError as e:
        logging.error(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# TRIAL SUBSCRIPTION ENDPOINTS (7 días gratis)
# ============================================

class TrialSubscriptionRequest(BaseModel):
    plan_after_trial: str = "monthly"  # Plan a cobrar después del trial
    origin_url: str

@router.post("/create-trial-subscription")
async def create_trial_subscription(
    data: TrialSubscriptionRequest,
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Crear suscripción de prueba de 7 días
    - Verifica la tarjeta con cargo de 0€
    - Después de 7 días, cobra automáticamente el plan seleccionado
    - El cliente puede cancelar antes de los 7 días sin cargo
    """
    user = await get_current_user(http_request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Debe iniciar sesión para activar el trial")
    
    user_id = user.user_id
    user_email = user.email
    
    try:
        # Verificar que el plan después del trial existe
        after_trial_package = SUBSCRIPTION_PACKAGES.get(data.plan_after_trial)
        if not after_trial_package or after_trial_package.get("amount", 0) == 0:
            raise HTTPException(status_code=400, detail="Plan de suscripción no válido para después del trial")
        
        # Verificar si el usuario ya tiene un trial activo
        existing_trial = await db.trial_subscriptions.find_one({
            "user_id": user_id,
            "status": {"$in": ["trialing", "active"]}
        })
        if existing_trial:
            raise HTTPException(status_code=400, detail="Ya tienes un trial activo o una suscripción vigente")
        
        # Crear o buscar cliente en Stripe
        existing_customers = stripe.Customer.list(email=user_email, limit=1)
        if existing_customers.data:
            customer = existing_customers.data[0]
        else:
            customer = stripe.Customer.create(
                email=user_email,
                metadata={
                    "user_id": user_id,
                    "source": "manoprotect_trial"
                }
            )
        
        # Crear precio para la suscripción
        amount_cents = int(after_trial_package["amount"] * 100)
        
        # Determinar el intervalo de facturación
        interval = "month"
        interval_count = 1
        if "yearly" in data.plan_after_trial or "annual" in data.plan_after_trial:
            interval = "year"
        elif "quarterly" in data.plan_after_trial:
            interval = "month"
            interval_count = 3
        elif "weekly" in data.plan_after_trial:
            interval = "week"
        
        # Crear un producto y precio en Stripe
        product = stripe.Product.create(
            name=f"ManoProtect - {after_trial_package['name']}",
            metadata={"plan_type": data.plan_after_trial}
        )
        
        price = stripe.Price.create(
            product=product.id,
            unit_amount=amount_cents,
            currency="eur",
            recurring={
                "interval": interval,
                "interval_count": interval_count
            }
        )
        
        # Crear sesión de checkout con trial de 7 días
        success_url = f"{data.origin_url}/trial-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{data.origin_url}/pricing?trial_canceled=true"
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": price.id,
                "quantity": 1
            }],
            subscription_data={
                "trial_period_days": 7,
                "metadata": {
                    "user_id": user_id,
                    "plan_type": data.plan_after_trial,
                    "is_trial": "true"
                }
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "email": user_email,
                "plan_type": data.plan_after_trial,
                "is_trial": "true",
                "trial_days": "7"
            }
        )
        
        # Guardar información del trial en la base de datos
        trial_record = {
            "session_id": checkout_session.id,
            "user_id": user_id,
            "email": user_email,
            "customer_id": customer.id,
            "plan_after_trial": data.plan_after_trial,
            "plan_amount": after_trial_package["amount"],
            "trial_days": 7,
            "trial_start": None,  # Se actualiza cuando Stripe confirma
            "trial_end": None,
            "status": "pending_verification",
            "stripe_subscription_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.trial_subscriptions.insert_one(trial_record)
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "trial_days": 7,
            "plan_after_trial": after_trial_package["name"],
            "amount_after_trial": after_trial_package["amount"],
            "message": f"Verificación de tarjeta (0,00€). Después de 7 días: {after_trial_package['amount']}€/{after_trial_package['period']}"
        }
    
    except stripe.error.StripeError as e:
        logging.error(f"Stripe error creating trial: {e}")
        raise HTTPException(status_code=400, detail=f"Error de Stripe: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating trial subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Error al crear trial: {str(e)}")


@router.get("/trial/status/{session_id}")
async def get_trial_status(session_id: str, http_request: Request):
    """Obtener estado de la suscripción trial"""
    try:
        trial = await db.trial_subscriptions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if not trial:
            raise HTTPException(status_code=404, detail="Trial no encontrado")
        
        # Obtener información actualizada de Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        response = {
            "status": trial.get("status"),
            "plan_after_trial": trial.get("plan_after_trial"),
            "amount_after_trial": trial.get("plan_amount"),
            "trial_days": trial.get("trial_days"),
            "trial_start": trial.get("trial_start"),
            "trial_end": trial.get("trial_end"),
            "checkout_status": checkout_session.status,
            "payment_status": checkout_session.payment_status
        }
        
        # Si el checkout fue completado, actualizar estado
        if checkout_session.status == "complete" and trial.get("status") == "pending_verification":
            subscription_id = checkout_session.subscription
            if subscription_id:
                subscription = stripe.Subscription.retrieve(subscription_id)
                trial_end = datetime.fromtimestamp(subscription.trial_end, tz=timezone.utc) if subscription.trial_end else None
                trial_start = datetime.fromtimestamp(subscription.current_period_start, tz=timezone.utc)
                
                await db.trial_subscriptions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "status": "trialing",
                        "stripe_subscription_id": subscription_id,
                        "trial_start": trial_start.isoformat() if trial_start else None,
                        "trial_end": trial_end.isoformat() if trial_end else None,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Actualizar plan del usuario a trial
                await db.users.update_one(
                    {"user_id": trial.get("user_id")},
                    {"$set": {
                        "plan": "trial-7days",
                        "subscription_status": "trialing",
                        "trial_end": trial_end.isoformat() if trial_end else None,
                        "plan_after_trial": trial.get("plan_after_trial"),
                        "stripe_subscription_id": subscription_id
                    }}
                )
                
                response["status"] = "trialing"
                response["trial_start"] = trial_start.isoformat() if trial_start else None
                response["trial_end"] = trial_end.isoformat() if trial_end else None
                response["message"] = f"Trial activado. Tu tarjeta será cargada el {trial_end.strftime('%d/%m/%Y') if trial_end else 'N/A'} si no cancelas antes."
        
        return response
    
    except stripe.error.StripeError as e:
        logging.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting trial status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trial/cancel")
async def cancel_trial(
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancelar trial antes de que termine (sin cargo)"""
    user = await get_current_user(http_request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    try:
        # Buscar trial activo del usuario
        trial = await db.trial_subscriptions.find_one({
            "user_id": user.user_id,
            "status": "trialing"
        })
        
        if not trial:
            raise HTTPException(status_code=404, detail="No tienes un trial activo para cancelar")
        
        subscription_id = trial.get("stripe_subscription_id")
        if subscription_id:
            # Cancelar suscripción en Stripe inmediatamente
            stripe.Subscription.cancel(subscription_id)
        
        # Actualizar estado en base de datos
        await db.trial_subscriptions.update_one(
            {"_id": trial["_id"]},
            {"$set": {
                "status": "canceled",
                "canceled_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Actualizar usuario a plan gratuito
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "plan": "free",
                "subscription_status": "canceled",
                "trial_end": None,
                "stripe_subscription_id": None
            }}
        )
        
        return {
            "success": True,
            "message": "Trial cancelado exitosamente. No se realizará ningún cargo.",
            "new_plan": "free"
        }
    
    except stripe.error.StripeError as e:
        logging.error(f"Stripe error canceling trial: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error canceling trial: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trial/info")
async def get_user_trial_info(
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener información del trial del usuario actual"""
    user = await get_current_user(http_request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    trial = await db.trial_subscriptions.find_one(
        {"user_id": user.user_id, "status": {"$in": ["trialing", "pending_verification"]}},
        {"_id": 0}
    )
    
    if not trial:
        return {
            "has_trial": False,
            "can_start_trial": True,
            "message": "Puedes iniciar tu periodo de prueba de 7 días gratis"
        }
    
    # Calcular días restantes
    days_remaining = 0
    if trial.get("trial_end"):
        trial_end = datetime.fromisoformat(trial["trial_end"].replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        days_remaining = max(0, (trial_end - now).days)
    
    return {
        "has_trial": True,
        "can_start_trial": False,
        "status": trial.get("status"),
        "trial_end": trial.get("trial_end"),
        "days_remaining": days_remaining,
        "plan_after_trial": trial.get("plan_after_trial"),
        "amount_after_trial": trial.get("plan_amount"),
        "message": f"Trial activo. {days_remaining} días restantes antes del cargo."
    }



# ============================================
# SENTINEL X PRE-ORDER ENDPOINT
# ============================================

class SentinelXPreorderRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    address: str
    city: str
    postalCode: str
    country: str = "ES"
    paymentType: str = "full"
    amount: float
    product: str = "SENTINEL X"
    selectedProduct: Optional[str] = None
    subscriptionPlan: Optional[str] = None

# Subscription pricing for Basic watch service plan
BASIC_SUBSCRIPTION_PRICES = {
    "mensual": {"amount": 999, "interval": "month", "label": "Mensual", "display": "9,99€/mes"},
    "anual": {"amount": 9999, "interval": "year", "label": "Anual", "display": "99,99€/año"},
}

@router.post("/checkout/sentinel-x")
async def create_sentinel_x_checkout(
    data: SentinelXPreorderRequest,
    http_request: Request
):
    """
    Create Stripe checkout session for SENTINEL X orders.
    - subscription: Basic watch with mandatory family service plan (recurring + shipping)
    - shipping_only: Basic/Junior products shipping only (one-time)
    - full_payment: Fundadores/Premium full payment (one-time)
    """
    try:
        host_url = str(http_request.headers.get('origin', 'https://manoprotect.com'))
        sentinel_img = 'https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png'

        # --- SUBSCRIPTION MODE: Basic watch with mandatory family plan ---
        if data.paymentType == "subscription":
            plan_key = data.subscriptionPlan or "mensual"
            plan = BASIC_SUBSCRIPTION_PRICES.get(plan_key, BASIC_SUBSCRIPTION_PRICES["mensual"])

            success_url = f"{host_url}/gracias?success=true&session_id={{CHECKOUT_SESSION_ID}}&product=sentinel-x-basic&type=subscription&plan={plan_key}"
            cancel_url = f"{host_url}/sentinel-x?canceled=true"

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'eur',
                            'product_data': {
                                'name': f'Plan Familiar ManoProtect ({plan["label"]})',
                                'description': 'Servicio de seguridad familiar: GPS tracking, alertas SOS, localización en tiempo real, zonas seguras.',
                                'images': [sentinel_img],
                            },
                            'unit_amount': plan['amount'],
                            'recurring': {'interval': plan['interval']},
                        },
                        'quantity': 1,
                    },
                    {
                        'price_data': {
                            'currency': 'eur',
                            'product_data': {
                                'name': 'Envío Sentinel X Basic',
                                'description': 'Gastos de envío del dispositivo Sentinel X Basic. Entrega estimada: 90-120 días.',
                            },
                            'unit_amount': 995,
                        },
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=data.email,
                metadata={
                    'product': 'sentinel-x-basic',
                    'payment_type': 'subscription',
                    'subscription_plan': plan_key,
                    'customer_name': data.name,
                    'customer_phone': data.phone,
                    'shipping_address': data.address,
                    'shipping_city': data.city,
                    'shipping_postal_code': data.postalCode,
                    'shipping_country': data.country,
                },
                allow_promotion_codes=True,
            )

            preorder_doc = {
                "session_id": checkout_session.id,
                "product": "sentinel-x-basic",
                "customer_name": data.name,
                "customer_email": data.email,
                "customer_phone": data.phone,
                "shipping_address": {"address": data.address, "city": data.city, "postal_code": data.postalCode, "country": data.country},
                "payment_type": "subscription",
                "subscription_plan": plan_key,
                "subscription_price": plan['display'],
                "shipping_amount": 9.95,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sentinel_x_preorders.insert_one(preorder_doc)
            logging.info(f"SENTINEL X Basic subscription checkout created: {checkout_session.id} for {data.email}, plan: {plan_key}")
            return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

        # --- SHIPPING ONLY: Basic/Junior without subscription (fallback) ---
        if data.paymentType == "shipping_only":
            amount = data.amount if data.amount > 0 else 9.95
            product_name = f"{data.product} (Solo envío)"
            success_url = f"{host_url}/gracias?success=true&session_id={{CHECKOUT_SESSION_ID}}&product={data.selectedProduct or 'sentinel-x-basic'}&amount={amount}"
            cancel_url = f"{host_url}/sentinel-x?canceled=true"

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': product_name,
                            'description': 'Gastos de envío. Entrega estimada: 90-120 días.',
                            'images': [sentinel_img],
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=data.email,
                metadata={
                    'product': data.selectedProduct or 'sentinel-x-basic',
                    'payment_type': 'shipping_only',
                    'customer_name': data.name,
                    'customer_phone': data.phone,
                    'shipping_address': data.address,
                    'shipping_city': data.city,
                    'shipping_postal_code': data.postalCode,
                    'shipping_country': data.country,
                },
            )

            preorder_doc = {
                "session_id": checkout_session.id,
                "product": data.selectedProduct or "sentinel-x-basic",
                "customer_name": data.name,
                "customer_email": data.email,
                "customer_phone": data.phone,
                "shipping_address": {"address": data.address, "city": data.city, "postal_code": data.postalCode, "country": data.country},
                "payment_type": "shipping_only",
                "amount_paid": amount,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sentinel_x_preorders.insert_one(preorder_doc)
            logging.info(f"SENTINEL X shipping-only checkout created: {checkout_session.id} for {data.email}")
            return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

        # --- FULL PAYMENT: Fundadores/Premium ---
        if data.paymentType == "full_payment":
            amount = data.amount
        elif data.paymentType == "full":
            amount = 149.00
        elif data.paymentType == "partial":
            amount = 29.99
        else:
            raise HTTPException(status_code=400, detail="Tipo de pago no válido")

        product_name = data.product or "SENTINEL X"
        success_url = f"{host_url}/gracias?success=true&session_id={{CHECKOUT_SESSION_ID}}&product=sentinel-x&amount={amount}"
        cancel_url = f"{host_url}/sentinel-x?canceled=true"

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product_name,
                        'description': 'Smartwatch de seguridad ManoProtect SENTINEL X. Envío GRATIS. Entrega estimada: 90-120 días.',
                        'images': [sentinel_img],
                    },
                    'unit_amount': int(amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=data.email,
            metadata={
                'product': data.selectedProduct or 'sentinel-x',
                'payment_type': data.paymentType,
                'customer_name': data.name,
                'customer_phone': data.phone,
                'shipping_address': data.address,
                'shipping_city': data.city,
                'shipping_postal_code': data.postalCode,
                'shipping_country': data.country,
            },
            shipping_address_collection={
                'allowed_countries': ['ES', 'PT', 'FR', 'DE', 'IT', 'NL', 'BE', 'AT']
            },
        )

        preorder_doc = {
            "session_id": checkout_session.id,
            "product": data.selectedProduct or "sentinel-x",
            "customer_name": data.name,
            "customer_email": data.email,
            "customer_phone": data.phone,
            "shipping_address": {"address": data.address, "city": data.city, "postal_code": data.postalCode, "country": data.country},
            "payment_type": data.paymentType,
            "amount_paid": amount,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.sentinel_x_preorders.insert_one(preorder_doc)
        logging.info(f"SENTINEL X checkout created: {checkout_session.id} for {data.email}")
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}

    except stripe.error.StripeError as e:
        logging.error(f"Stripe error creating SENTINEL X checkout: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error creating SENTINEL X checkout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentinel-x/preorders")
async def get_sentinel_x_preorders(
    http_request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all SENTINEL X pre-orders (admin only)"""
    user = await get_current_user(http_request, session_token)
    if not user or user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    preorders = await db.sentinel_x_preorders.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=500)
    
    # Calculate totals
    total_preorders = len(preorders)
    total_paid = sum(p.get("amount_paid", 0) for p in preorders if p.get("status") == "paid")
    total_pending = sum(p.get("amount_pending", 0) for p in preorders if p.get("status") == "paid")
    
    return {
        "preorders": preorders,
        "summary": {
            "total_preorders": total_preorders,
            "total_paid": total_paid,
            "total_pending_collection": total_pending,
            "estimated_total_revenue": total_preorders * 149
        }
    }


@router.get("/sentinel-x/count")
async def get_sentinel_x_reservation_count():
    """Get the count of SENTINEL X pre-orders (public endpoint for counter)"""
    try:
        count = await db.sentinel_x_preorders.count_documents({"status": {"$in": ["pending", "paid"]}})
        return {"count": count}
    except Exception as e:
        logging.error(f"Error getting SENTINEL X count: {e}")
        return {"count": 0}
