"""
MANO - User Profile and Contacts Routes
User profile management and trusted contacts
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional

from models.all_schemas import UserUpdate, TrustedContact, TrustedContactCreate
from core.auth import require_auth

router = APIRouter(tags=["Profile & Contacts"])

_db = None


def init_profile_routes(db):
    """Initialize routes with database connection"""
    global _db
    _db = db


# ============================================
# USER PROFILE ROUTES
# ============================================

@router.get("/profile")
async def get_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user profile"""
    user = await require_auth(request, session_token)
    
    total_analyzed = await _db.threats.count_documents({"user_id": user.user_id})
    threats_blocked = await _db.threats.count_documents({"user_id": user.user_id, "is_threat": True})
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "phone": user.phone,
        "plan": user.plan,
        "role": user.role,
        "dark_mode": user.dark_mode,
        "notifications_enabled": user.notifications_enabled,
        "auto_block": user.auto_block,
        "stats": {
            "total_analyzed": total_analyzed,
            "threats_blocked": threats_blocked
        }
    }


@router.patch("/profile")
async def update_profile(
    data: UserUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user profile"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        await _db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_data}
        )
    
    return {"message": "Perfil actualizado correctamente"}


# ============================================
# CONTACTS ROUTES
# ============================================

@router.post("/contacts", response_model=TrustedContact)
async def create_contact(
    contact: TrustedContactCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create trusted contact"""
    user = await require_auth(request, session_token)
    
    contact_obj = TrustedContact(
        user_id=user.user_id,
        name=contact.name,
        phone=contact.phone,
        relationship=contact.relationship,
        is_emergency=contact.is_emergency,
        receive_alerts=contact.receive_alerts
    )
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await _db.contacts.insert_one(doc)
    
    return contact_obj


@router.get("/contacts")
async def get_contacts(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's trusted contacts"""
    user = await require_auth(request, session_token)
    
    contacts = await _db.contacts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    return contacts


@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete trusted contact"""
    user = await require_auth(request, session_token)
    
    result = await _db.contacts.delete_one({
        "id": contact_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    return {"message": "Contacto eliminado"}


@router.patch("/contacts/{contact_id}")
async def update_contact(
    contact_id: str,
    data: TrustedContactCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update trusted contact"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    result = await _db.contacts.update_one(
        {"id": contact_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    return {"message": "Contacto actualizado"}
