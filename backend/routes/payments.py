"""
MANO - Payment Routes
Stripe payment integration
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone

from core.config import db, require_auth, STRIPE_API_KEY, SUBSCRIPTION_PACKAGES
from models.schemas import CheckoutRequest, PaymentTransaction

router = APIRouter(tags=["Payments"])


@router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    user = await require_auth(request, session_token)
    
    package = SUBSCRIPTION_PACKAGES.get(data.plan_type)
    if not package:
        raise HTTPException(status_code=400, detail="Plan no válido")
    
    transaction = PaymentTransaction(
        session_id="pending",
        user_id=user.user_id,
        email=user.email,
        plan_type=data.plan_type,
        amount=package["amount"],
        metadata={
            "plan_type": data.plan_type,
            "plan_name": package["name"]
        }
    )
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency="eur",
        product_name=f"MANO {package['name']}",
        product_description=f"Protección contra fraudes - {package['period']}",
        success_url=f"{data.origin_url}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{data.origin_url}/pricing?payment=cancelled",
        customer_email=user.email,
        metadata={"plan_name": package["name"], "plan_period": package["period"]}
    )
    
    checkout_session = stripe_checkout.create_checkout_session(checkout_request)
    
    transaction.session_id = checkout_session.session_id
    tx_doc = transaction.model_dump()
    tx_doc['created_at'] = tx_doc['created_at'].isoformat()
    tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(tx_doc)
    
    return {
        "checkout_url": checkout_session.checkout_url,
        "session_id": checkout_session.session_id
    }


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Check Stripe checkout status"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    existing_tx = await db.payment_transactions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    
    if existing_tx and existing_tx.get("payment_status") == "paid":
        return {
            "status": "paid",
            "plan": existing_tx.get("plan_type"),
            "already_processed": True
        }
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
    status = stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "completed",
                "payment_status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        tx = await db.payment_transactions.find_one({"session_id": session_id})
        if tx:
            plan_type = tx.get("plan_type", "premium")
            plan_name = "personal" if "weekly" in plan_type or "monthly" in plan_type else plan_type
            if "family" in plan_type:
                plan_name = "family"
            
            await db.users.update_one(
                {"user_id": tx["user_id"]},
                {"$set": {
                    "plan": plan_name,
                    "subscription_status": "active",
                    "plan_updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {
        "status": status.payment_status,
        "plan": existing_tx.get("plan_type") if existing_tx else None,
        "amount_paid": status.amount_total
    }
