"""
ManoProtect - Subscription Management & User Blocking System
Handles:
- Trial period management (7 days)
- Auto-charge after trial expiration
- User blocking (email, IP, device_id)
- Basic plan limitations (one-time trial opportunity)
- Automatic user cleanup for expired trials
"""
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import stripe
from pymongo import MongoClient

router = APIRouter(prefix="/subscription-manager", tags=["Subscription Manager"])

# Stripe Configuration
stripe.api_key = os.environ.get("STRIPE_API_KEY")

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# ==================== MODELS ====================

class BlockUserRequest(BaseModel):
    user_id: str
    reason: str = "trial_expired_no_payment"

class CheckBlockRequest(BaseModel):
    email: Optional[str] = None
    ip_address: Optional[str] = None
    device_id: Optional[str] = None

# ==================== BLOCKED USERS COLLECTION ====================
"""
blocked_users collection schema:
{
    "user_id": str,
    "email": str,
    "ip_address": str,
    "device_id": str,
    "reason": str,  # "trial_expired_no_payment", "fraud", "abuse"
    "second_chance_given": bool,  # True if user already had one more opportunity
    "second_chance_used_at": datetime,  # When they used their second chance
    "blocked_at": datetime,
    "expires_at": datetime or None  # None = permanent
}
"""

# ==================== TRIAL TRACKING COLLECTION ====================
"""
user_trials collection schema:
{
    "user_id": str,
    "email": str,
    "plan_id": str,  # "basic", "individual", "family"
    "trial_start": datetime,
    "trial_end": datetime,
    "card_on_file": bool,
    "stripe_customer_id": str or None,
    "stripe_subscription_id": str or None,
    "status": str,  # "active_trial", "converted", "expired", "blocked"
    "conversion_reminder_sent": bool,
    "second_chance_sent": bool,
    "created_at": datetime,
    "updated_at": datetime
}
"""

# ==================== HELPER FUNCTIONS ====================

def get_client_ip(request: Request) -> str:
    """Get client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def is_user_blocked(email: str = None, ip_address: str = None, device_id: str = None) -> dict:
    """Check if user is blocked by email, IP, or device ID"""
    query = {"$or": []}
    
    if email:
        query["$or"].append({"email": email.lower()})
    if ip_address:
        query["$or"].append({"ip_address": ip_address})
    if device_id:
        query["$or"].append({"device_id": device_id})
    
    if not query["$or"]:
        return {"blocked": False}
    
    block = db.blocked_users.find_one(query)
    
    if block:
        # Check if block has expired
        if block.get("expires_at") and block["expires_at"] < datetime.now(timezone.utc):
            return {"blocked": False}
        
        # Check if user has a second chance
        if not block.get("second_chance_given"):
            return {
                "blocked": True,
                "reason": block.get("reason"),
                "has_second_chance": True,
                "message": "Tu período de prueba expiró. Tienes una última oportunidad para suscribirte."
            }
        
        return {
            "blocked": True,
            "reason": block.get("reason"),
            "has_second_chance": False,
            "message": "Esta cuenta ha sido bloqueada permanentemente por no completar la suscripción."
        }
    
    return {"blocked": False}

def block_user(user_id: str, email: str, ip_address: str = None, device_id: str = None, 
               reason: str = "trial_expired_no_payment", permanent: bool = False):
    """Block a user by email, IP and device ID"""
    block_data = {
        "user_id": user_id,
        "email": email.lower(),
        "ip_address": ip_address,
        "device_id": device_id,
        "reason": reason,
        "second_chance_given": False,
        "blocked_at": datetime.now(timezone.utc),
        "expires_at": None if permanent else datetime.now(timezone.utc) + timedelta(days=365)
    }
    
    # Check if already blocked
    existing = db.blocked_users.find_one({"email": email.lower()})
    if existing:
        # User already had first block, now giving second chance or permanent block
        if existing.get("second_chance_given"):
            # Already used second chance, make permanent
            db.blocked_users.update_one(
                {"email": email.lower()},
                {"$set": {"expires_at": None, "reason": "permanent_block_no_conversion"}}
            )
        else:
            # Mark as second chance given
            db.blocked_users.update_one(
                {"email": email.lower()},
                {"$set": {"second_chance_given": True, "second_chance_used_at": datetime.now(timezone.utc)}}
            )
    else:
        db.blocked_users.insert_one(block_data)

def unblock_user(email: str):
    """Unblock a user (when they convert to paid)"""
    db.blocked_users.delete_one({"email": email.lower()})

def create_trial(user_id: str, email: str, plan_id: str, has_card: bool = False, 
                 stripe_customer_id: str = None, stripe_subscription_id: str = None):
    """Create a trial record for a user"""
    trial_end = datetime.now(timezone.utc) + timedelta(days=7)
    
    trial_data = {
        "user_id": user_id,
        "email": email.lower(),
        "plan_id": plan_id,
        "trial_start": datetime.now(timezone.utc),
        "trial_end": trial_end,
        "card_on_file": has_card,
        "stripe_customer_id": stripe_customer_id,
        "stripe_subscription_id": stripe_subscription_id,
        "status": "active_trial",
        "conversion_reminder_sent": False,
        "second_chance_sent": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    # Update or insert
    db.user_trials.update_one(
        {"user_id": user_id},
        {"$set": trial_data},
        upsert=True
    )
    
    return trial_data

def mark_trial_converted(user_id: str):
    """Mark a trial as converted (user paid)"""
    db.user_trials.update_one(
        {"user_id": user_id},
        {"$set": {
            "status": "converted",
            "converted_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Also unblock if they were blocked
    trial = db.user_trials.find_one({"user_id": user_id})
    if trial:
        unblock_user(trial["email"])

# ==================== API ENDPOINTS ====================

@router.post("/check-blocked")
async def check_if_blocked(data: CheckBlockRequest, request: Request):
    """Check if a user is blocked before allowing registration"""
    ip = data.ip_address or get_client_ip(request)
    
    result = is_user_blocked(
        email=data.email,
        ip_address=ip,
        device_id=data.device_id
    )
    
    return result

@router.get("/trial-status/{user_id}")
async def get_trial_status(user_id: str):
    """Get trial status for a user"""
    trial = db.user_trials.find_one({"user_id": user_id}, {"_id": 0})
    
    if not trial:
        return {"status": "no_trial", "message": "Usuario no tiene trial activo"}
    
    # Convert datetime objects to ISO strings
    for key in ["trial_start", "trial_end", "created_at", "updated_at", "converted_at", "second_chance_used_at"]:
        if key in trial and trial[key]:
            trial[key] = trial[key].isoformat()
    
    # Check if expired
    trial_end = datetime.fromisoformat(trial["trial_end"].replace("Z", "+00:00")) if isinstance(trial["trial_end"], str) else trial["trial_end"]
    now = datetime.now(timezone.utc)
    
    if trial["status"] == "active_trial" and trial_end < now:
        trial["status"] = "expired"
        trial["days_remaining"] = 0
    else:
        trial["days_remaining"] = max(0, (trial_end - now).days) if trial_end > now else 0
    
    return trial

@router.post("/process-expired-trials")
async def process_expired_trials():
    """
    CRON endpoint - Process expired trials
    Called by a scheduled job every hour
    
    For trials WITH card on file (paid plans):
    - Stripe handles auto-charge automatically
    - We just update status in our DB
    
    For trials WITHOUT card (basic plan):
    - First expiry: Give 3 more days grace period + send reminder
    - After grace period: Block user, give ONE more chance
    - If they don't convert: Permanent block
    """
    now = datetime.now(timezone.utc)
    
    # Find expired trials that haven't been processed
    expired_trials = list(db.user_trials.find({
        "status": "active_trial",
        "trial_end": {"$lt": now}
    }))
    
    results = {
        "processed": 0,
        "converted_with_card": 0,
        "grace_period_given": 0,
        "blocked_first_time": 0,
        "blocked_permanent": 0,
        "errors": []
    }
    
    for trial in expired_trials:
        try:
            user_id = trial["user_id"]
            email = trial["email"]
            has_card = trial.get("card_on_file", False)
            plan_id = trial.get("plan_id", "basic")
            
            if has_card and trial.get("stripe_subscription_id"):
                # Paid plan with card - Stripe handles auto-charge
                # Check subscription status in Stripe
                try:
                    subscription = stripe.Subscription.retrieve(trial["stripe_subscription_id"])
                    if subscription.status in ["active", "trialing"]:
                        # Successfully converted
                        mark_trial_converted(user_id)
                        results["converted_with_card"] += 1
                    elif subscription.status in ["past_due", "unpaid"]:
                        # Payment failed - block user
                        block_user(user_id, email, reason="payment_failed")
                        db.user_trials.update_one(
                            {"user_id": user_id},
                            {"$set": {"status": "blocked", "updated_at": now}}
                        )
                        results["blocked_first_time"] += 1
                except Exception as e:
                    results["errors"].append(f"Stripe error for {user_id}: {str(e)}")
            
            else:
                # Basic plan WITHOUT card
                # Check if already in grace period
                grace_end = trial.get("grace_period_end")
                
                if not grace_end:
                    # First expiry - give 3 days grace period
                    grace_end = now + timedelta(days=3)
                    db.user_trials.update_one(
                        {"user_id": user_id},
                        {"$set": {
                            "grace_period_end": grace_end,
                            "status": "grace_period",
                            "updated_at": now
                        }}
                    )
                    results["grace_period_given"] += 1
                    
                    # TODO: Send email reminder to user
                    
                elif grace_end < now:
                    # Grace period also expired
                    blocked = db.blocked_users.find_one({"email": email.lower()})
                    
                    if not blocked:
                        # First block - give one more chance
                        block_user(user_id, email, reason="trial_expired_no_payment")
                        db.user_trials.update_one(
                            {"user_id": user_id},
                            {"$set": {"status": "blocked", "updated_at": now}}
                        )
                        results["blocked_first_time"] += 1
                        
                    elif blocked.get("second_chance_given"):
                        # Already used second chance - permanent block
                        db.blocked_users.update_one(
                            {"email": email.lower()},
                            {"$set": {"expires_at": None}}
                        )
                        
                        # Delete user account
                        db.users.delete_one({"_id": user_id})
                        db.user_trials.update_one(
                            {"user_id": user_id},
                            {"$set": {"status": "deleted", "deleted_at": now}}
                        )
                        results["blocked_permanent"] += 1
            
            results["processed"] += 1
            
        except Exception as e:
            results["errors"].append(f"Error processing {trial.get('user_id')}: {str(e)}")
    
    return results

@router.post("/use-second-chance")
async def use_second_chance(email: str, request: Request):
    """
    User wants to use their second (and last) chance to subscribe
    This temporarily unblocks them to allow checkout, but they MUST complete payment
    """
    block = db.blocked_users.find_one({"email": email.lower()})
    
    if not block:
        return {"success": False, "message": "Usuario no está bloqueado"}
    
    if block.get("second_chance_given"):
        raise HTTPException(
            status_code=403, 
            detail="Ya utilizaste tu segunda oportunidad. Esta cuenta está bloqueada permanentemente."
        )
    
    # Mark second chance as used
    db.blocked_users.update_one(
        {"email": email.lower()},
        {"$set": {
            "second_chance_given": True,
            "second_chance_used_at": datetime.now(timezone.utc),
            # Give them 24 hours to complete payment
            "temporary_unblock_until": datetime.now(timezone.utc) + timedelta(hours=24)
        }}
    )
    
    return {
        "success": True,
        "message": "Tienes 24 horas para completar tu suscripción. Esta es tu última oportunidad.",
        "expires_in_hours": 24
    }

@router.get("/stats")
async def get_subscription_stats():
    """Get subscription and trial statistics"""
    now = datetime.now(timezone.utc)
    
    stats = {
        "total_trials": db.user_trials.count_documents({}),
        "active_trials": db.user_trials.count_documents({"status": "active_trial"}),
        "grace_period": db.user_trials.count_documents({"status": "grace_period"}),
        "converted": db.user_trials.count_documents({"status": "converted"}),
        "blocked": db.user_trials.count_documents({"status": "blocked"}),
        "deleted": db.user_trials.count_documents({"status": "deleted"}),
        "total_blocked_users": db.blocked_users.count_documents({}),
        "permanent_blocks": db.blocked_users.count_documents({"expires_at": None}),
        "second_chances_given": db.blocked_users.count_documents({"second_chance_given": True})
    }
    
    return stats

# ==================== VALIDATE CARD ENDPOINT ====================

@router.post("/validate-card")
async def validate_card_type(payment_method_id: str):
    """
    Validate that a card is NOT prepaid
    Called during checkout to reject prepaid cards
    """
    try:
        pm = stripe.PaymentMethod.retrieve(payment_method_id)
        
        if pm.card:
            funding_type = pm.card.funding
            
            if funding_type == "prepaid":
                return {
                    "valid": False,
                    "reason": "prepaid_card",
                    "message": "No aceptamos tarjetas prepago. Por favor, usa una tarjeta de débito o crédito."
                }
            
            return {
                "valid": True,
                "card_type": funding_type,  # "credit", "debit", "unknown"
                "brand": pm.card.brand,
                "last4": pm.card.last4
            }
        
        return {"valid": False, "reason": "no_card", "message": "Método de pago no válido"}
        
    except Exception as e:
        return {"valid": False, "reason": "error", "message": str(e)}
