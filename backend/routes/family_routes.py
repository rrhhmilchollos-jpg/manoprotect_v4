"""
Family Protection Routes - ManoProtect
Routes for managing family members and family protection features
"""
from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr

from core.auth import require_auth

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db


class FamilyMemberCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: str = "familiar"
    is_senior: bool = False
    simplified_mode: bool = False
    alert_level: str = "medium"


class FamilyMember(BaseModel):
    id: str = None
    family_owner_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str = "familiar"
    is_senior: bool = False
    simplified_mode: bool = False
    alert_level: str = "medium"
    created_at: datetime = None
    last_activity: Optional[datetime] = None
    threats_count: int = 0
    is_protected: bool = True
    
    def __init__(self, **data):
        import uuid
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = datetime.now(timezone.utc)
        super().__init__(**data)


@router.get("/family/dashboard")
async def get_family_dashboard(request: Request):
    """Get family protection dashboard"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    # Check if user has family plan or enterprise plan
    has_family_features = user.plan and (user.plan.startswith("family") or user.plan in ["enterprise", "business"])
    
    # Get family members
    members = await _db.family_members.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get family alerts
    alerts = await _db.family_alerts.find(
        {"family_owner_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Calculate stats
    total_threats = sum(m.get("threats_count", 0) for m in members)
    senior_members = len([m for m in members if m.get("is_senior")])
    unread_alerts = len([a for a in alerts if not a.get("is_read")])
    
    return {
        "members": members,
        "alerts": alerts,
        "stats": {
            "total_members": len(members),
            "senior_members": senior_members,
            "total_threats_blocked": total_threats,
            "unread_alerts": unread_alerts,
            "protection_active": True
        },
        "has_family_plan": has_family_features,
        "user_plan": user.plan
    }


@router.post("/family/members")
async def add_family_member(data: FamilyMemberCreate, request: Request):
    """Add a family member to protection"""
    session_token = request.cookies.get("session_token")
    user = await _require_auth(request, session_token)
    
    # Check member limit (5 for family plan)
    existing_count = await _db.family_members.count_documents({"family_owner_id": user.user_id})
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="Límite de 5 miembros familiares alcanzado")
    
    member = FamilyMember(
        family_owner_id=user.user_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        relationship=data.relationship,
        is_senior=data.is_senior,
        simplified_mode=data.simplified_mode or data.is_senior,
        alert_level=data.alert_level
    )
    
    doc = member.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_activity'):
        doc['last_activity'] = doc['last_activity'].isoformat()
    await _db.family_members.insert_one(doc)
    
    return {"message": "Miembro familiar añadido", "member_id": member.id}


@router.patch("/family/members/{member_id}")
async def update_family_member(member_id: str, data: FamilyMemberCreate, request: Request):
    """Update family member settings"""
    session_token = request.cookies.get("session_token")
    user = await _require_auth(request, session_token)
    
    update_data = data.model_dump(exclude_unset=True)
    result = await _db.family_members.update_one(
        {"id": member_id, "family_owner_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro actualizado"}


@router.delete("/family/members/{member_id}")
async def remove_family_member(member_id: str, request: Request):
    """Remove family member from protection"""
    session_token = request.cookies.get("session_token")
    user = await _require_auth(request, session_token)
    
    result = await _db.family_members.delete_one({
        "id": member_id,
        "family_owner_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro eliminado"}


@router.get("/family/members/{member_id}/activity")
async def get_member_activity(member_id: str, request: Request):
    """Get activity history for a family member"""
    session_token = request.cookies.get("session_token")
    user = await _require_auth(request, session_token)
    
    member = await _db.family_members.find_one(
        {"id": member_id, "family_owner_id": user.user_id},
        {"_id": 0}
    )
    
    if not member:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    # Get member's alerts
    alerts = await _db.family_alerts.find(
        {"member_id": member_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return {
        "member": member,
        "activity": alerts,
        "stats": {
            "total_alerts": len(alerts),
            "threats_blocked": member.get("threats_count", 0)
        }
    }


@router.post("/family/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, request: Request):
    """Mark family alert as read"""
    session_token = request.cookies.get("session_token")
    user = await _require_auth(request, session_token)
    
    await _db.family_alerts.update_one(
        {"id": alert_id, "family_owner_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Alerta marcada como leída"}
