"""
ManoProtect - Newsletter Subscription Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

_db = None

def init_newsletter(db):
    global _db
    _db = db


class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: str = ""


@router.post("/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
    """Subscribe to ManoProtect newsletter"""
    existing = await _db.newsletter_subscribers.find_one(
        {"email": data.email}, {"_id": 0}
    )
    if existing:
        return {"status": "ok", "message": "Ya estas suscrito a nuestro newsletter"}

    await _db.newsletter_subscribers.insert_one({
        "email": data.email,
        "name": data.name,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "active": True,
        "source": "website_footer",
    })

    return {"status": "ok", "message": "Suscripcion confirmada. Recibiras nuestras novedades."}


@router.delete("/unsubscribe")
async def unsubscribe_newsletter(email: str):
    """Unsubscribe from newsletter"""
    result = await _db.newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"active": False, "unsubscribed_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email no encontrado")
    return {"status": "ok", "message": "Te has dado de baja del newsletter"}


@router.get("/stats")
async def newsletter_stats():
    """Get newsletter stats (admin)"""
    total = await _db.newsletter_subscribers.count_documents({})
    active = await _db.newsletter_subscribers.count_documents({"active": True})
    return {"total_subscribers": total, "active_subscribers": active}
