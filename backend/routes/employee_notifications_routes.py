"""
ManoProtect - Employee Notifications API
Sistema de notificaciones para empleados
"""
from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/enterprise/notifications", tags=["Employee Notifications"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Employee Notifications DB initialized: {db is not None}")

# ============================================
# UTILITY FUNCTIONS
# ============================================

def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

async def get_current_employee(request: Request):
    """Get current logged in employee from session"""
    token = request.cookies.get("enterprise_session")
    if not token:
        token = request.headers.get("X-Session-Token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": token},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee

# ============================================
# ENDPOINTS
# ============================================

@router.get("")
async def get_notifications(
    request: Request,
    unread_only: bool = False,
    limit: int = Query(20, le=50)
):
    """Get notifications for current employee"""
    current_employee = await get_current_employee(request)
    
    query = {"employee_id": current_employee["employee_id"]}
    
    if unread_only:
        query["is_read"] = False
    
    cursor = db.employee_notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    # Count unread
    unread_count = await db.employee_notifications.count_documents({
        "employee_id": current_employee["employee_id"],
        "is_read": False
    })
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.get("/unread-count")
async def get_unread_count(request: Request):
    """Get unread notifications count"""
    current_employee = await get_current_employee(request)
    
    count = await db.employee_notifications.count_documents({
        "employee_id": current_employee["employee_id"],
        "is_read": False
    })
    
    return {"unread_count": count}

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str, request: Request):
    """Mark a notification as read"""
    current_employee = await get_current_employee(request)
    
    result = await db.employee_notifications.update_one(
        {
            "notification_id": notification_id,
            "employee_id": current_employee["employee_id"]
        },
        {
            "$set": {
                "is_read": True,
                "read_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    return {"success": True}

@router.patch("/read-all")
async def mark_all_as_read(request: Request):
    """Mark all notifications as read"""
    current_employee = await get_current_employee(request)
    
    result = await db.employee_notifications.update_many(
        {
            "employee_id": current_employee["employee_id"],
            "is_read": False
        },
        {
            "$set": {
                "is_read": True,
                "read_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"success": True, "marked_count": result.modified_count}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, request: Request):
    """Delete a notification"""
    current_employee = await get_current_employee(request)
    
    result = await db.employee_notifications.delete_one({
        "notification_id": notification_id,
        "employee_id": current_employee["employee_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    return {"success": True}
