"""
Admin Routes - User Management for ManoProtect
Endpoints for superadmin/admin to manage users
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db

class UserUpdate(BaseModel):
    plan: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    name: Optional[str] = None
    phone: Optional[str] = None

@router.get("/admin/users")
async def get_all_users(request: Request, user: User = None):
    """Get all users - Admin only"""
    user = await get_current_user(request)
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    users = await _db.users.find(
        {},
        {"_id": 0, "password_hash": 0}
    ).to_list(length=10000)
    
    return {"users": users, "total": len(users)}

@router.get("/admin/users/{user_id}")
async def get_user_detail(user_id: str, request: Request):
    """Get single user details - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    user = await _db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get additional user data
    emergency_contacts = await _db.emergency_contacts.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=100)
    
    sessions = await _db.user_sessions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=100)
    
    return {
        "user": user,
        "emergency_contacts": emergency_contacts,
        "active_sessions": len(sessions)
    }

@router.put("/admin/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate, request: Request):
    """Update user - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Find user
    user = await _db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Build update dict
    updates = {}
    if data.plan is not None:
        updates["plan"] = data.plan
        updates["plan_updated_at"] = datetime.now(timezone.utc).isoformat()
        updates["plan_updated_by"] = f"admin_{current_user.user_id}"
    if data.role is not None:
        # Only superadmin can change roles
        if current_user.role != 'superadmin':
            raise HTTPException(status_code=403, detail="Solo superadmin puede cambiar roles")
        updates["role"] = data.role
    if data.is_active is not None:
        updates["is_active"] = data.is_active
    if data.name is not None:
        updates["name"] = data.name
    if data.phone is not None:
        updates["phone"] = data.phone
    
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        updates["updated_by"] = current_user.user_id
        
        await _db.users.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
    
    # Get updated user
    updated_user = await _db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0}
    )
    
    return {"message": "Usuario actualizado", "user": updated_user}

@router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    """Delete user completely - Admin only"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Find user
    user = await _db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Prevent self-deletion
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    # Delete user data
    await _db.users.delete_one({"user_id": user_id})
    await _db.emergency_contacts.delete_many({"user_id": user_id})
    await _db.user_sessions.delete_many({"user_id": user_id})
    await _db.locations.delete_many({"user_id": user_id})
    await _db.sos_alerts.delete_many({"user_id": user_id})
    await _db.deletion_requests.delete_many({"user_id": user_id})
    
    # Log deletion
    await _db.admin_logs.insert_one({
        "action": "user_deleted",
        "target_user_id": user_id,
        "target_email": user.get("email"),
        "performed_by": current_user.user_id,
        "timestamp": datetime.now(timezone.utc)
    })
    
    return {"message": "Usuario eliminado correctamente", "user_id": user_id}

@router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get admin dashboard stats"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    total_users = await _db.users.count_documents({})
    active_users = await _db.users.count_documents({"is_active": {"$ne": False}})
    free_users = await _db.users.count_documents({"plan": "free"})
    premium_users = await _db.users.count_documents({"plan": "premium"})
    enterprise_users = await _db.users.count_documents({"plan": "enterprise"})
    pending_deletions = await _db.deletion_requests.count_documents({"status": "pending"})
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "free_users": free_users,
        "premium_users": premium_users,
        "enterprise_users": enterprise_users,
        "pending_deletions": pending_deletions
    }

@router.get("/admin/deletion-requests")
async def get_deletion_requests(request: Request):
    """Get pending deletion requests"""
    current_user = await get_current_user(request)
    if not current_user or current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    requests = await _db.deletion_requests.find(
        {},
        {"_id": 0}
    ).sort("requested_at", -1).to_list(length=100)
    
    return {"requests": requests}
