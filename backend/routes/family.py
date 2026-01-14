"""
MANO - Family Routes
Family plan management and member administration
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone
import uuid

from core.config import db, require_auth
from models.schemas import FamilyMemberInvite

router = APIRouter(prefix="/family", tags=["Family"])


@router.get("/members")
async def get_family_members(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family members"""
    user = await require_auth(request, session_token)
    
    if not user.plan or not user.plan.startswith("family"):
        raise HTTPException(status_code=403, detail="Se requiere plan familiar")
    
    members = await db.family_members.find(
        {"owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    return {"members": members}


@router.post("/invite")
async def invite_family_member(
    data: FamilyMemberInvite,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Invite a family member"""
    user = await require_auth(request, session_token)
    
    if not user.plan or not user.plan.startswith("family"):
        raise HTTPException(status_code=403, detail="Se requiere plan familiar")
    
    member_count = await db.family_members.count_documents({"owner_id": user.user_id})
    if member_count >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros alcanzado")
    
    existing = await db.family_members.find_one({
        "owner_id": user.user_id,
        "email": data.email
    })
    if existing:
        raise HTTPException(status_code=400, detail="Este miembro ya está invitado")
    
    member = {
        "id": str(uuid.uuid4()),
        "owner_id": user.user_id,
        "email": data.email,
        "name": data.name,
        "relationship": data.relationship,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.family_members.insert_one(member)
    
    return {
        "message": "Invitación enviada",
        "member_id": member["id"]
    }


@router.delete("/members/{member_id}")
async def remove_family_member(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Remove a family member"""
    user = await require_auth(request, session_token)
    
    result = await db.family_members.delete_one({
        "id": member_id,
        "owner_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro eliminado"}


@router.get("/dashboard")
async def get_family_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get family protection dashboard"""
    user = await require_auth(request, session_token)
    
    members = await db.family_members.find(
        {"owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    total_threats = 0
    for member in members:
        if member.get("user_id"):
            count = await db.threat_analysis.count_documents({
                "user_id": member["user_id"],
                "is_threat": True
            })
            total_threats += count
    
    return {
        "members": members,
        "member_count": len(members),
        "max_members": 5,
        "total_threats_blocked": total_threats,
        "has_family_plan": user.plan and user.plan.startswith("family")
    }
