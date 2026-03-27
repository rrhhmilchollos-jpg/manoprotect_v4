"""
ManoProtect - Trial, Anti-Abuse & Subscription System
Sistema completo de registro, trial 7 dias, anti-abuso y suscripciones Stripe
Solo para AppCliente
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone, timedelta
import hashlib
import uuid
import jwt
import os
import bcrypt

router = APIRouter(prefix="/client-trial", tags=["Client Trial & Subscription"])

_db = None
_JWT_SECRET = None

def init_client_trial(db):
    global _db, _JWT_SECRET
    _db = db
    _JWT_SECRET = os.environ.get("JWT_SECRET")

TRIAL_DAYS = 7
MONTHLY_PRICE = 9.99
ABUSE_SCORE_THRESHOLD = 80


# ============ MODELS ============

class RegisterRequest(BaseModel):
    email: str
    password: str
    nombre: Optional[str] = ""

class LoginRequest(BaseModel):
    email: str
    password: str
    fingerprint: Optional[str] = ""

class FingerprintData(BaseModel):
    fingerprint: str


# ============ HELPERS ============

def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def _verify_pw(password: str, stored_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), stored_hash.encode())
    except (ValueError, AttributeError):
        return False

def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def _make_token(email: str, user_id: str, trial_status: str, sub_status: str) -> str:
    return jwt.encode({
        "sub": email,
        "user_id": user_id,
        "type": "client_trial",
        "trial_status": trial_status,
        "subscription_status": sub_status,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc),
    }, _JWT_SECRET, algorithm="HS256")

async def _get_user_from_token(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    try:
        payload = jwt.decode(auth.split(" ")[1], _JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "client_trial":
            raise HTTPException(401, "Token invalido")
        user = await _db.trial_users.find_one({"email": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(401, "Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalido")


# ============ ANTI-ABUSE ENGINE ============

async def _calculate_abuse_score(ip: str, fingerprint: str, email: str) -> int:
    score = 0
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(hours=24)

    # Check device fingerprint reuse
    if fingerprint:
        device = await _db.trial_devices.find_one({"fingerprint": fingerprint}, {"_id": 0})
        if device:
            score += 80

    # Check IP registrations in last 24h
    ip_count = await _db.trial_users.count_documents({
        "registration_ip": ip,
        "created_at": {"$gte": day_ago.isoformat()}
    })
    if ip_count >= 3:
        score += 40
    elif ip_count >= 2:
        score += 20

    # Log abuse check
    await _db.abuse_logs.insert_one({
        "fingerprint": fingerprint,
        "ip": ip,
        "email": email,
        "score": score,
        "created_at": now.isoformat(),
    })

    return score


# ============ REGISTRATION ============

@router.post("/register")
async def register_client(req: RegisterRequest, request: Request):
    email = req.email.lower().strip()
    if not email or not req.password or len(req.password) < 6:
        raise HTTPException(400, "Email y contrasena (min 6 caracteres) requeridos")

    existing = await _db.trial_users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "Este email ya esta registrado. Inicia sesion.")

    ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    fingerprint = req.nombre  # Will be replaced by actual fingerprint from frontend

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    trial_end = now + timedelta(days=TRIAL_DAYS)

    user_doc = {
        "user_id": user_id,
        "email": email,
        "nombre": req.nombre or email.split("@")[0],
        "password_hash": _hash_pw(req.password),
        "created_at": now.isoformat(),
        "registration_ip": ip,
        "user_agent": user_agent,
        "trial_started": now.isoformat(),
        "trial_expires": trial_end.isoformat(),
        "trial_used": True,
        "subscription_status": "trial",
        "stripe_customer_id": None,
        "referral_code": user_id[:8].upper(),
        "referred_by": None,
        "last_login": now.isoformat(),
    }

    await _db.trial_users.insert_one(user_doc)
    del user_doc["_id"]

    # Create trial record
    await _db.trials.insert_one({
        "user_id": user_id,
        "started_at": now.isoformat(),
        "expires_at": trial_end.isoformat(),
        "is_active": True,
    })

    token = _make_token(email, user_id, "trial", "trial")

    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": email,
            "nombre": user_doc["nombre"],
            "subscription_status": "trial",
            "trial_expires": trial_end.isoformat(),
            "trial_days_left": TRIAL_DAYS,
            "referral_code": user_doc["referral_code"],
        }
    }


# ============ LOGIN ============

@router.post("/login")
async def login_client(req: LoginRequest, request: Request):
    email = req.email.lower().strip()
    user = await _db.trial_users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(401, "Usuario no encontrado. Registrate primero.")
    if not _verify_pw(req.password, user.get("password_hash", "")):
        raise HTTPException(401, "Contrasena incorrecta")

    ip = _get_client_ip(request)
    now = datetime.now(timezone.utc)

    # Save device fingerprint
    if req.fingerprint:
        await _db.trial_devices.update_one(
            {"fingerprint": req.fingerprint, "user_id": user["user_id"]},
            {"$set": {
                "last_seen": now.isoformat(),
                "ip": ip,
                "user_agent": request.headers.get("user-agent", ""),
            }, "$setOnInsert": {
                "fingerprint": req.fingerprint,
                "user_id": user["user_id"],
                "first_seen": now.isoformat(),
            }},
            upsert=True,
        )

    # Update last login
    await _db.trial_users.update_one(
        {"email": email},
        {"$set": {"last_login": now.isoformat()}}
    )

    # Calculate trial/subscription status
    sub_status = user.get("subscription_status", "trial")
    trial_expires = user.get("trial_expires", "")
    trial_days_left = 0

    if sub_status == "trial" and trial_expires:
        expires_dt = datetime.fromisoformat(trial_expires).replace(tzinfo=timezone.utc) if trial_expires else now
        delta = expires_dt - now
        trial_days_left = max(0, delta.days)
        if trial_days_left <= 0:
            sub_status = "expired"
            await _db.trial_users.update_one(
                {"email": email},
                {"$set": {"subscription_status": "expired"}}
            )

    token = _make_token(email, user["user_id"], sub_status, sub_status)

    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": email,
            "nombre": user.get("nombre", ""),
            "subscription_status": sub_status,
            "trial_expires": trial_expires,
            "trial_days_left": trial_days_left,
            "referral_code": user.get("referral_code", ""),
        }
    }


# ============ TRIAL STATUS ============

@router.get("/status")
async def get_trial_status(request: Request):
    user = await _get_user_from_token(request)
    now = datetime.now(timezone.utc)
    sub_status = user.get("subscription_status", "trial")
    trial_expires = user.get("trial_expires", "")
    trial_days_left = 0

    if sub_status == "trial" and trial_expires:
        expires_dt = datetime.fromisoformat(trial_expires).replace(tzinfo=timezone.utc)
        delta = expires_dt - now
        trial_days_left = max(0, delta.days)
        if trial_days_left <= 0:
            sub_status = "expired"
            await _db.trial_users.update_one(
                {"email": user["email"]},
                {"$set": {"subscription_status": "expired"}}
            )

    show_warning = sub_status == "trial" and trial_days_left <= 2

    return {
        "subscription_status": sub_status,
        "trial_expires": trial_expires,
        "trial_days_left": trial_days_left,
        "show_expiry_warning": show_warning,
        "price_monthly": MONTHLY_PRICE,
    }


# ============ STRIPE SUBSCRIPTION ============

@router.post("/checkout")
async def create_checkout(request: Request):
    user = await _get_user_from_token(request)
    body = await request.json()
    origin_url = body.get("origin_url", "")

    if not origin_url:
        raise HTTPException(400, "origin_url requerido")

    stripe_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_key:
        raise HTTPException(500, "Stripe no configurado")

    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    success_url = f"{origin_url}/app-cliente?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/app-cliente"

    checkout_req = CheckoutSessionRequest(
        amount=MONTHLY_PRICE,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "email": user["email"],
            "type": "manoprotect_subscription",
        }
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    # Record transaction
    await _db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "amount": MONTHLY_PRICE,
        "currency": "eur",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/checkout/status/{session_id}")
async def check_checkout_status(session_id: str, request: Request):
    user = await _get_user_from_token(request)
    stripe_key = os.environ.get("STRIPE_API_KEY")

    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction
    tx = await _db.payment_transactions.find_one({"session_id": session_id})
    if tx and tx.get("payment_status") != "paid":
        new_status = status.payment_status
        await _db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": status.status, "payment_status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        # Activate subscription on successful payment
        if new_status == "paid":
            await _db.trial_users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {
                    "subscription_status": "active",
                    "subscription_started": datetime.now(timezone.utc).isoformat(),
                }}
            )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }


# ============ REFERRAL SYSTEM ============

@router.post("/referral/apply")
async def apply_referral(request: Request):
    user = await _get_user_from_token(request)
    body = await request.json()
    code = body.get("code", "").upper().strip()

    if not code:
        raise HTTPException(400, "Codigo de referido requerido")

    # Find referrer
    referrer = await _db.trial_users.find_one({"referral_code": code}, {"_id": 0})
    if not referrer:
        raise HTTPException(404, "Codigo de referido no valido")
    if referrer["user_id"] == user["user_id"]:
        raise HTTPException(400, "No puedes usar tu propio codigo")

    if user.get("referred_by"):
        raise HTTPException(400, "Ya has usado un codigo de referido")

    # Apply referral - extend trial by 3 days for both
    now = datetime.now(timezone.utc)
    bonus_days = 3

    # Extend invitee trial
    current_expires = datetime.fromisoformat(user["trial_expires"]).replace(tzinfo=timezone.utc)
    new_expires = current_expires + timedelta(days=bonus_days)
    await _db.trial_users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"trial_expires": new_expires.isoformat(), "referred_by": code}}
    )

    # Extend referrer trial
    ref_expires = datetime.fromisoformat(referrer["trial_expires"]).replace(tzinfo=timezone.utc)
    ref_new_expires = ref_expires + timedelta(days=bonus_days)
    await _db.trial_users.update_one(
        {"user_id": referrer["user_id"]},
        {"$set": {"trial_expires": ref_new_expires.isoformat()}}
    )

    # Log referral
    await _db.referrals.insert_one({
        "referrer_id": referrer["user_id"],
        "invitee_id": user["user_id"],
        "code": code,
        "bonus_days": bonus_days,
        "created_at": now.isoformat(),
    })

    return {"message": f"Codigo aplicado. +{bonus_days} dias de trial para ti y tu amigo.", "new_trial_expires": new_expires.isoformat()}


# ============ ANTI-ABUSE CHECK ============

@router.post("/check-abuse")
async def check_device_abuse(req: FingerprintData, request: Request):
    ip = _get_client_ip(request)
    score = await _calculate_abuse_score(ip, req.fingerprint, "")

    return {
        "allowed": score < ABUSE_SCORE_THRESHOLD,
        "score": score,
    }
