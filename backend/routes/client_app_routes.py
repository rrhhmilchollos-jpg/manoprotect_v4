"""
ManoProtect - Client App Routes
Dashboard personalizado para clientes — Armado/Desarmado, Camaras, Eventos, Claves
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/client-app", tags=["Client App"])

_db = None

def init_client_app(db):
    global _db
    _db = db


# ============================================
# MODELS
# ============================================

class AccessCodeUpdate(BaseModel):
    old_code: str
    new_code: str

class UserAccessCreate(BaseModel):
    installation_id: str
    user_email: str
    user_name: str = ""
    role: str = "user"  # owner, admin, user, guest

class CameraRequest(BaseModel):
    installation_id: str
    camera_id: str = ""


# ============================================
# CLIENT DASHBOARD
# ============================================

@router.get("/my-installations")
async def my_installations(request: Request):
    """Get all installations for the authenticated user"""
    email = request.headers.get("x-user-email", "")
    if not email:
        raise HTTPException(401, "No autenticado")

    accesses = await _db.client_app_access.find({"user_email": email}, {"_id": 0}).to_list(20)
    installations = []
    for acc in accesses:
        inst = await _db.cra_installations.find_one(
            {"id": acc["installation_id"]},
            {"_id": 0, "access_code": 0, "duress_code": 0}
        )
        if inst:
            inst["user_role"] = acc.get("role", "user")
            # Count devices
            device_count = await _db.cra_devices.count_documents({"installation_id": inst["id"]})
            inst["device_count"] = device_count
            installations.append(inst)

    return {"installations": installations}

@router.get("/installation/{install_id}")
async def get_my_installation(install_id: str, request: Request):
    email = request.headers.get("x-user-email", "")
    if not email:
        raise HTTPException(401, "No autenticado")

    # Verify access
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id}, {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Sin acceso a esta instalacion")

    inst = await _db.cra_installations.find_one(
        {"id": install_id},
        {"_id": 0, "duress_code": 0}
    )
    if not inst:
        raise HTTPException(404, "Instalacion no encontrada")

    # Get devices
    devices = await _db.cra_devices.find({"installation_id": install_id}, {"_id": 0}).to_list(50)
    inst["devices"] = devices
    inst["user_role"] = access.get("role", "user")

    return inst


# ============================================
# ARM / DISARM
# ============================================

@router.post("/installation/{install_id}/arm")
async def client_arm(install_id: str, request: Request):
    email = request.headers.get("x-user-email", "")
    body = await request.json()
    mode = body.get("mode", "total")
    code = body.get("code", "")

    # Verify access
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id}, {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Sin acceso")

    inst = await _db.cra_installations.find_one({"id": install_id}, {"_id": 0})
    if not inst:
        raise HTTPException(404, "Instalacion no encontrada")

    # Verify code
    if code and code != inst.get("access_code", ""):
        raise HTTPException(403, "Codigo incorrecto")

    await _db.cra_installations.update_one(
        {"id": install_id},
        {"$set": {"armed_status": mode, "armed_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Log event
    await _db.cra_alarm_events.insert_one({
        "id": str(uuid.uuid4()),
        "installation_id": install_id,
        "event_type": f"arm_{mode}",
        "zone": "",
        "severity": "low",
        "description": f"Cliente {'armo' if mode != 'disarmed' else 'desarmo'} via app — {mode}",
        "status": "resolved",
        "operator_id": None,
        "action_log": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"status": "ok", "armed_status": mode}


# ============================================
# EVENTS HISTORY
# ============================================

@router.get("/installation/{install_id}/events")
async def get_events(install_id: str, request: Request, limit: int = 50):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id}, {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Sin acceso")

    events = await _db.cra_alarm_events.find(
        {"installation_id": install_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)

    return {"events": events, "total": len(events)}


# ============================================
# CAMERAS (simulated — placeholder for real integration)
# ============================================

@router.get("/installation/{install_id}/cameras")
async def get_cameras(install_id: str, request: Request):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id}, {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Sin acceso")

    cameras = await _db.cra_devices.find(
        {"installation_id": install_id, "device_type": "camera"},
        {"_id": 0}
    ).to_list(20)

    # Add streaming URLs (placeholder)
    for cam in cameras:
        cam["stream_url"] = f"/api/client-app/stream/{cam['id']}"
        cam["snapshot_url"] = f"/api/client-app/snapshot/{cam['id']}"

    return {"cameras": cameras}


# ============================================
# ACCESS CODES & USERS MANAGEMENT
# ============================================

@router.post("/installation/{install_id}/change-code")
async def change_access_code(install_id: str, data: AccessCodeUpdate, request: Request):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id, "role": {"$in": ["owner", "admin"]}},
        {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Solo propietarios/admins pueden cambiar codigos")

    inst = await _db.cra_installations.find_one({"id": install_id}, {"_id": 0})
    if not inst or inst.get("access_code") != data.old_code:
        raise HTTPException(403, "Codigo actual incorrecto")

    await _db.cra_installations.update_one(
        {"id": install_id},
        {"$set": {"access_code": data.new_code}}
    )
    return {"status": "code_changed"}

@router.get("/installation/{install_id}/users")
async def list_users(install_id: str, request: Request):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id, "role": {"$in": ["owner", "admin"]}},
        {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Solo propietarios/admins pueden ver usuarios")

    users = await _db.client_app_access.find(
        {"installation_id": install_id},
        {"_id": 0}
    ).to_list(50)
    return {"users": users}

@router.post("/installation/{install_id}/users")
async def add_user(install_id: str, data: UserAccessCreate, request: Request):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id, "role": {"$in": ["owner", "admin"]}},
        {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Solo propietarios/admins pueden anadir usuarios")

    new_access = {
        "id": str(uuid.uuid4()),
        "user_email": data.user_email,
        "user_name": data.user_name,
        "installation_id": install_id,
        "role": data.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.client_app_access.insert_one(new_access)
    new_access.pop("_id", None)
    return new_access

@router.delete("/installation/{install_id}/users/{user_id}")
async def remove_user(install_id: str, user_id: str, request: Request):
    email = request.headers.get("x-user-email", "")
    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id, "role": "owner"},
        {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Solo el propietario puede eliminar usuarios")

    result = await _db.client_app_access.delete_one({"id": user_id, "installation_id": install_id, "role": {"$ne": "owner"}})
    if result.deleted_count == 0:
        raise HTTPException(400, "No se puede eliminar (propietario o no encontrado)")
    return {"status": "removed"}
