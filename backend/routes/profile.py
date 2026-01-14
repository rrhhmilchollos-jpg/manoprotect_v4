"""
MANO - Profile Routes
User profile management
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional

from core.config import db, require_auth
from models.schemas import UserUpdate

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("")
async def get_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user profile"""
    user = await require_auth(request, session_token)
    
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
        "auto_block": user.auto_block
    }


@router.patch("")
async def update_profile(
    data: UserUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user profile"""
    user = await require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": update_data}
    )
    
    return {"message": "Perfil actualizado", "updated": update_data}
