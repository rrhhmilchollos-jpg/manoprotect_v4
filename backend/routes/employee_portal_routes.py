"""
ManoProtect - Employee Portal Routes
Messaging, employee tracking, and real-time status
"""
from fastapi import APIRouter, Request, Cookie, HTTPException, WebSocket, WebSocketDisconnect
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid
import json

router = APIRouter(tags=["Employee Portal"])

_db = None

# Connected employees (in-memory for real-time)
connected_employees: Dict[str, dict] = {}
# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


def init_employee_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


# Models
class EmployeeLogin(BaseModel):
    employee_id: str
    device_info: str = "Web Browser"
    app_version: str = "2.0.0"


class EmployeeMessage(BaseModel):
    recipient_id: str
    message: str
    message_type: str = "text"  # text, alert, file


class EmployeeStatus(BaseModel):
    status: str  # online, away, busy, offline


# ==========================================
# EMPLOYEE CONNECTION MANAGEMENT
# ==========================================

@router.post("/employees/connect")
async def employee_connect(
    data: EmployeeLogin,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Register employee as connected"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    # Verify employee role
    if user.role not in ['employee', 'admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso solo para empleados")
    
    connection_id = f"conn_{uuid.uuid4().hex[:12]}"
    
    # Store connection
    employee_data = {
        "connection_id": connection_id,
        "employee_id": data.employee_id or user.user_id,
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "status": "online",
        "device": data.device_info,
        "app_version": data.app_version,
        "connected_at": datetime.now(timezone.utc).isoformat(),
        "last_activity": datetime.now(timezone.utc).isoformat()
    }
    
    connected_employees[user.user_id] = employee_data
    
    # Store in database for persistence
    await _db.employee_connections.update_one(
        {"user_id": user.user_id},
        {"$set": employee_data},
        upsert=True
    )
    
    return {
        "success": True,
        "connection_id": connection_id,
        "message": "Conectado al portal de empleados"
    }


@router.post("/employees/disconnect")
async def employee_disconnect(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Disconnect employee"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.user_id in connected_employees:
        del connected_employees[user.user_id]
    
    await _db.employee_connections.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "status": "offline",
            "disconnected_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Desconectado"}


@router.patch("/employees/status")
async def update_employee_status(
    data: EmployeeStatus,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update employee status"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    valid_statuses = ['online', 'away', 'busy', 'offline']
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    if user.user_id in connected_employees:
        connected_employees[user.user_id]["status"] = data.status
        connected_employees[user.user_id]["last_activity"] = datetime.now(timezone.utc).isoformat()
    
    await _db.employee_connections.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "status": data.status,
            "last_activity": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "status": data.status}


@router.get("/employees/connected")
async def get_connected_employees(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get list of connected employees"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.role not in ['employee', 'admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso solo para empleados")
    
    # Get from database (more reliable than in-memory)
    employees = await _db.employee_connections.find(
        {"status": {"$ne": "offline"}},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with in-memory data if available
    for emp in employees:
        if emp["user_id"] in connected_employees:
            emp.update(connected_employees[emp["user_id"]])
    
    return {
        "employees": employees,
        "total": len(employees),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ==========================================
# MESSAGING SYSTEM
# ==========================================

@router.post("/employees/messages/send")
async def send_employee_message(
    data: EmployeeMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send message to another employee"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.role not in ['employee', 'admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso solo para empleados")
    
    message = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "sender_id": user.user_id,
        "sender_name": user.name,
        "recipient_id": data.recipient_id,
        "message": data.message,
        "message_type": data.message_type,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.employee_messages.insert_one(message)
    
    # Try to send via WebSocket if recipient is connected
    if data.recipient_id in active_connections:
        try:
            await active_connections[data.recipient_id].send_json({
                "type": "new_message",
                "message": {k: v for k, v in message.items() if k != "_id"}
            })
        except:
            pass
    
    return {
        "success": True,
        "message_id": message["message_id"],
        "sent_at": message["created_at"]
    }


@router.get("/employees/messages")
async def get_employee_messages(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    with_user: Optional[str] = None,
    limit: int = 50
):
    """Get messages for employee"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    query = {
        "$or": [
            {"sender_id": user.user_id},
            {"recipient_id": user.user_id}
        ]
    }
    
    if with_user:
        query = {
            "$or": [
                {"sender_id": user.user_id, "recipient_id": with_user},
                {"sender_id": with_user, "recipient_id": user.user_id}
            ]
        }
    
    messages = await _db.employee_messages.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Mark as read
    if with_user:
        await _db.employee_messages.update_many(
            {"sender_id": with_user, "recipient_id": user.user_id, "read": False},
            {"$set": {"read": True}}
        )
    
    return {
        "messages": list(reversed(messages)),
        "total": len(messages)
    }


@router.get("/employees/messages/unread")
async def get_unread_messages_count(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get unread messages count"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    count = await _db.employee_messages.count_documents({
        "recipient_id": user.user_id,
        "read": False
    })
    
    return {"unread_count": count}


@router.post("/employees/messages/{message_id}/read")
async def mark_message_read(
    message_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark message as read"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    await _db.employee_messages.update_one(
        {"message_id": message_id, "recipient_id": user.user_id},
        {"$set": {"read": True}}
    )
    
    return {"success": True}


# ==========================================
# BROADCAST MESSAGES
# ==========================================

@router.post("/employees/broadcast")
async def broadcast_message(
    data: dict,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send broadcast message to all employees (admin only)"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    message = data.get("message", "")
    priority = data.get("priority", "normal")  # normal, high, urgent
    
    broadcast = {
        "broadcast_id": f"bc_{uuid.uuid4().hex[:12]}",
        "sender_id": user.user_id,
        "sender_name": user.name,
        "message": message,
        "priority": priority,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.employee_broadcasts.insert_one(broadcast)
    
    # Send to all connected employees via WebSocket
    for emp_id, ws in active_connections.items():
        try:
            await ws.send_json({
                "type": "broadcast",
                "message": {k: v for k, v in broadcast.items() if k != "_id"}
            })
        except:
            pass
    
    return {
        "success": True,
        "broadcast_id": broadcast["broadcast_id"],
        "recipients": len(active_connections)
    }


@router.get("/employees/broadcasts")
async def get_broadcasts(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 20
):
    """Get recent broadcast messages"""
    from core.auth import require_auth
    await require_auth(request, session_token)
    
    broadcasts = await _db.employee_broadcasts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"broadcasts": broadcasts}


# ==========================================
# VERSION MANAGEMENT
# ==========================================

@router.get("/employees/versions")
async def get_employee_versions(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get app versions of connected employees"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    # Get all connections with version info
    connections = await _db.employee_connections.find(
        {},
        {"_id": 0, "user_id": 1, "name": 1, "app_version": 1, "device": 1, "status": 1, "last_activity": 1}
    ).to_list(100)
    
    # Group by version
    versions = {}
    for conn in connections:
        ver = conn.get("app_version", "unknown")
        if ver not in versions:
            versions[ver] = []
        versions[ver].append(conn)
    
    # Latest version (could be from config)
    latest_version = "2.0.0"
    
    return {
        "employees": connections,
        "versions_summary": {v: len(e) for v, e in versions.items()},
        "latest_version": latest_version,
        "outdated_count": sum(1 for c in connections if c.get("app_version") != latest_version)
    }


@router.post("/employees/update-request")
async def request_employee_update(
    data: dict,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Request employee to update their app"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    employee_id = data.get("employee_id")
    
    # Send update notification
    if employee_id in active_connections:
        try:
            await active_connections[employee_id].send_json({
                "type": "update_request",
                "message": "Tu aplicación necesita actualizarse",
                "latest_version": "2.0.0",
                "download_url": "/portal-empleados"
            })
            return {"success": True, "message": "Solicitud de actualización enviada"}
        except:
            pass
    
    return {"success": False, "message": "Empleado no conectado"}
