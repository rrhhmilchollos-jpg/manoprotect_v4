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


@router.post("/members")
async def add_family_member(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a family member directly (for owners)"""
    user = await require_auth(request, session_token)
    
    if not user.plan or not user.plan.startswith("family"):
        raise HTTPException(status_code=403, detail="Se requiere plan familiar")
    
    data = await request.json()
    
    member_count = await db.family_members.count_documents({"owner_id": user.user_id})
    if member_count >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros alcanzado")
    
    # Check if email already exists
    if data.get("email"):
        existing = await db.family_members.find_one({
            "owner_id": user.user_id,
            "email": data["email"]
        })
        if existing:
            raise HTTPException(status_code=400, detail="Este miembro ya existe")
    
    member = {
        "id": str(uuid.uuid4()),
        "owner_id": user.user_id,
        "family_group_id": user.user_id,  # Link to family group
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "relationship": data.get("relationship", "familiar"),
        "is_senior": data.get("is_senior", False),
        "simplified_mode": data.get("simplified_mode", False),
        "alert_level": data.get("alert_level", "all"),
        "status": "active",
        "user_id": None,  # Will be linked when member registers
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.family_members.insert_one(member)
    
    return {
        "message": "Miembro añadido correctamente",
        "member": {k: v for k, v in member.items() if k != "_id"}
    }


@router.put("/members/{member_id}")
async def update_family_member(
    member_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update a family member's settings"""
    user = await require_auth(request, session_token)
    
    data = await request.json()
    
    # Only allow updating certain fields
    allowed_fields = ["name", "phone", "relationship", "is_senior", "simplified_mode", "alert_level"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.family_members.update_one(
        {"id": member_id, "owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro actualizado", "updated": True}


@router.post("/join/{invite_code}")
async def join_family(
    invite_code: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Allow a user to join a family using invite code or email"""
    user = await require_auth(request, session_token)
    
    # Find pending invitation by email
    invitation = await db.family_members.find_one({
        "email": user.email.lower(),
        "status": "pending"
    })
    
    if not invitation:
        # Try by invite code
        invitation = await db.family_members.find_one({
            "id": invite_code,
            "status": "pending"
        })
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación no encontrada o ya aceptada")
    
    # Link the user to the family member record
    await db.family_members.update_one(
        {"id": invitation["id"]},
        {"$set": {
            "user_id": user.user_id,
            "status": "active",
            "joined_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update user's family group
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "family_group_id": invitation["owner_id"],
            "is_family_member": True
        }}
    )
    
    return {
        "message": "Te has unido al grupo familiar",
        "family_owner_id": invitation["owner_id"]
    }


@router.get("/my-family")
async def get_my_family_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check if current user belongs to a family group"""
    user = await require_auth(request, session_token)
    
    # Check if user is a family owner
    if user.plan and user.plan.startswith("family"):
        members = await db.family_members.find(
            {"owner_id": user.user_id},
            {"_id": 0}
        ).to_list(10)
        return {
            "is_owner": True,
            "is_member": False,
            "members": members,
            "member_count": len(members)
        }
    
    # Check if user is a family member
    membership = await db.family_members.find_one({
        "user_id": user.user_id,
        "status": "active"
    })
    
    if membership:
        owner = await db.users.find_one({"user_id": membership["owner_id"]})
        return {
            "is_owner": False,
            "is_member": True,
            "family_owner": owner.get("name", "Administrador") if owner else "Desconocido",
            "my_role": membership.get("relationship", "miembro")
        }
    
    # Check pending invitations
    pending = await db.family_members.find_one({
        "email": user.email.lower(),
        "status": "pending"
    })
    
    if pending:
        return {
            "is_owner": False,
            "is_member": False,
            "has_pending_invite": True,
            "invite_id": pending["id"]
        }
    
    return {
        "is_owner": False,
        "is_member": False,
        "has_pending_invite": False
    }


@router.get("/linked-members")
async def get_linked_family_members(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get all family members with their protection status"""
    user = await require_auth(request, session_token)
    
    # Get members for this family
    if user.plan and user.plan.startswith("family"):
        owner_id = user.user_id
    else:
        # Check if user is a member
        membership = await db.family_members.find_one({
            "user_id": user.user_id,
            "status": "active"
        })
        if membership:
            owner_id = membership["owner_id"]
        else:
            return {"members": [], "is_linked": False}
    
    members = await db.family_members.find(
        {"owner_id": owner_id, "status": "active"},
        {"_id": 0}
    ).to_list(10)
    
    # Enrich with user data and stats
    enriched_members = []
    for member in members:
        member_data = {**member}
        if member.get("user_id"):
            # Get user info
            member_user = await db.users.find_one({"user_id": member["user_id"]})
            if member_user:
                member_data["account_name"] = member_user.get("name", member["name"])
                member_data["last_active"] = member_user.get("last_login")
            
            # Get threat stats
            threats = await db.threat_analysis.count_documents({
                "user_id": member["user_id"],
                "is_threat": True
            })
            member_data["threats_blocked"] = threats
        else:
            member_data["threats_blocked"] = 0
            member_data["account_linked"] = False
        
        enriched_members.append(member_data)
    
    return {
        "members": enriched_members,
        "is_linked": True,
        "total_members": len(enriched_members)
    }

