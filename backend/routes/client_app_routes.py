"""
ManoProtect - Client App Routes
Dashboard personalizado para clientes — Armado/Desarmado, Camaras, Eventos, Claves
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import jwt
import os
import hashlib

router = APIRouter(prefix="/client-app", tags=["Client App"])

_db = None
_JWT_SECRET = None

def init_client_app(db):
    global _db, _JWT_SECRET
    _db = db
    _JWT_SECRET = os.environ.get("JWT_SECRET")


def _hash_client_pw(password: str) -> str:
    import bcrypt
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def _verify_client_pw(password: str, stored_hash: str) -> bool:
    import bcrypt
    try:
        return bcrypt.checkpw(password.encode(), stored_hash.encode())
    except (ValueError, AttributeError):
        pass
    return hashlib.sha256(password.encode()).hexdigest() == stored_hash


async def get_client_email(request: Request) -> str:
    """Extract user email from Bearer JWT, x-user-email header, or session cookie"""
    # 1. Try Bearer token (JWT from client-app login)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            payload = jwt.decode(auth_header.split(" ")[1], _JWT_SECRET, algorithms=["HS256"])
            if payload.get("type") == "client_app":
                return payload.get("sub", "")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            pass
    # 2. Try x-user-email header
    email = request.headers.get("x-user-email", "")
    if email:
        return email
    # 3. Fallback: try session cookie
    session_token = request.cookies.get("session_token")
    if session_token and _db is not None:
        session = await _db.user_sessions.find_one(
            {"session_token": session_token, "is_active": True}, {"_id": 0, "user_id": 1}
        )
        if session:
            user = await _db.users.find_one(
                {"user_id": session["user_id"]}, {"_id": 0, "email": 1}
            )
            if user:
                return user.get("email", "")
    return ""


# ============================================
# CLIENT LOGIN
# ============================================

@router.post("/login")
async def client_app_login(request: Request):
    """Login para la app de clientes — devuelve JWT + datos instalacion"""
    body = await request.json()
    email = body.get("email", "").lower().strip()
    password = body.get("password", "")
    if not email or not password:
        raise HTTPException(400, "Email y contraseña requeridos")

    # Find client account
    client = await _db.client_app_users.find_one({"email": email}, {"_id": 0})
    if not client:
        raise HTTPException(401, "Cliente no encontrado. Contacte con su instalador.")
    if not client.get("activo", True):
        raise HTTPException(401, "Cuenta desactivada")
    if not _verify_client_pw(password, client.get("password_hash", "")):
        raise HTTPException(401, "Contraseña incorrecta")

    # Find their installation access
    access = await _db.client_app_access.find_one({"user_email": email}, {"_id": 0})
    installation_id = access.get("installation_id") if access else None

    token = jwt.encode({
        "sub": email,
        "type": "client_app",
        "installation_id": installation_id or "",
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc),
    }, _JWT_SECRET, algorithm="HS256")

    return {
        "token": token,
        "user": {
            "email": email,
            "nombre": client.get("nombre", ""),
            "telefono": client.get("telefono", ""),
            "installation_id": installation_id,
        }
    }


async def seed_client_demo():
    """Seed demo client + installation for testing"""
    demo_email = "cliente@demo.manoprotectt.com"
    existing = await _db.client_app_users.find_one({"email": demo_email})
    if existing:
        return

    # Create demo client user
    await _db.client_app_users.insert_one({
        "email": demo_email,
        "nombre": "Juan Garcia Martinez",
        "telefono": "612 345 678",
        "password_hash": _hash_client_pw("Cliente2025!"),
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Create demo installation
    install_id = "demo-install-001"
    existing_inst = await _db.cra_installations.find_one({"id": install_id})
    if not existing_inst:
        await _db.cra_installations.insert_one({
            "id": install_id,
            "client_name": "Juan Garcia Martinez",
            "client_email": demo_email,
            "client_phone": "612 345 678",
            "address": "Calle Mayor 15, 3A",
            "city": "Madrid",
            "postal_code": "28013",
            "plan_type": "alarm-premium",
            "access_code": "1234",
            "duress_code": "9999",
            "emergency_contacts": [
                {"name": "Maria Garcia", "phone": "634 567 890", "relation": "Pareja"},
                {"name": "Pedro Garcia", "phone": "656 789 012", "relation": "Padre"},
            ],
            "notes": "Piso 3, ascensor disponible",
            "status": "active",
            "armed_status": "disarmed",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_event_at": None,
        })

    # Create client access
    existing_access = await _db.client_app_access.find_one({"user_email": demo_email, "installation_id": install_id})
    if not existing_access:
        await _db.client_app_access.insert_one({
            "id": str(uuid.uuid4()),
            "user_email": demo_email,
            "installation_id": install_id,
            "access_code": "1234",
            "role": "owner",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Create demo devices
    existing_devices = await _db.cra_devices.count_documents({"installation_id": install_id})
    if existing_devices == 0:
        demo_devices = [
            {"device_type": "panel", "model": "ManoProtect Hub Pro 10\"", "zone": "Entrada", "location_desc": "Recibidor principal", "battery_level": 100},
            {"device_type": "sensor_door", "model": "Sensor Magnetico v3", "zone": "Entrada principal", "location_desc": "Puerta entrada", "battery_level": 95},
            {"device_type": "sensor_pir", "model": "PIR Anti-mascotas", "zone": "Salon", "location_desc": "Esquina salon-comedor", "battery_level": 88},
            {"device_type": "smoke_detector", "model": "Detector Humo Pro", "zone": "Cocina", "location_desc": "Techo cocina", "battery_level": 72},
            {"device_type": "sensor_door", "model": "Sensor Magnetico v3", "zone": "Dormitorio", "location_desc": "Ventana dormitorio", "battery_level": 91},
            {"device_type": "sensor_pir", "model": "PIR Anti-mascotas", "zone": "Garaje", "location_desc": "Acceso garaje", "battery_level": 65},
            {"device_type": "camera", "model": "Cam Exterior 4K", "zone": "Jardin", "location_desc": "Fachada principal", "battery_level": 100},
            {"device_type": "camera", "model": "Cam Interior HD", "zone": "Salon", "location_desc": "Rincon TV", "battery_level": 100},
            {"device_type": "siren", "model": "Sirena Exterior 120dB", "zone": "Exterior", "location_desc": "Fachada lateral", "battery_level": 100},
            {"device_type": "keypad", "model": "Teclado RFID Pro", "zone": "Entrada", "location_desc": "Junto a puerta", "battery_level": 100},
        ]
        for d in demo_devices:
            await _db.cra_devices.insert_one({
                "id": str(uuid.uuid4()),
                "installation_id": install_id,
                "serial_number": f"MP-{uuid.uuid4().hex[:8].upper()}",
                "status": "online",
                "last_check": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                **d,
            })

    # Seed a few alarm events
    existing_events = await _db.cra_alarm_events.count_documents({"installation_id": install_id})
    if existing_events == 0:
        now = datetime.now(timezone.utc)
        events = [
            {"event_type": "arm_total", "zone": "", "severity": "low", "description": "Sistema armado total via app", "status": "resolved", "resolved_at": (now - timedelta(hours=12)).isoformat()},
            {"event_type": "arm_disarmed", "zone": "", "severity": "low", "description": "Sistema desarmado via app", "status": "resolved", "resolved_at": (now - timedelta(hours=8)).isoformat()},
            {"event_type": "test", "zone": "Todas", "severity": "low", "description": "Test periodico completado — OK", "status": "resolved", "resolved_at": (now - timedelta(days=1)).isoformat()},
        ]
        for i, ev in enumerate(events):
            await _db.cra_alarm_events.insert_one({
                "id": str(uuid.uuid4()),
                "installation_id": install_id,
                "operator_id": None,
                "action_log": [],
                "created_at": (now - timedelta(hours=12-i*4)).isoformat(),
                **ev,
            })


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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
# SOS PANIC BUTTON
# ============================================

@router.post("/installation/{install_id}/sos")
async def client_sos(install_id: str, request: Request):
    email = await get_client_email(request)
    body = await request.json()
    sos_type = body.get("type", "panic")

    access = await _db.client_app_access.find_one(
        {"user_email": email, "installation_id": install_id}, {"_id": 0}
    )
    if not access:
        raise HTTPException(403, "Sin acceso")

    # Create high-priority alarm event
    event_id = str(uuid.uuid4())
    event_data = {
        "id": event_id,
        "installation_id": install_id,
        "event_type": "panic",
        "zone": "SOS",
        "severity": "critical",
        "description": f"ALERTA SOS activada por {email} — Tipo: {sos_type}",
        "status": "pending",
        "operator_id": None,
        "action_log": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.cra_alarm_events.insert_one(event_data)

    # Emit real-time to CRA operators
    try:
        from services.websocket_manager import sio
        inst = await _db.cra_installations.find_one({"id": install_id}, {"_id": 0, "client_name": 1, "address": 1})
        emit = {**event_data}
        emit.pop("_id", None)
        if inst:
            emit["client_name"] = inst.get("client_name", "")
            emit["address"] = inst.get("address", "")
        await sio.emit('cra_alarm_event', emit)
    except Exception:
        pass

    return {"status": "ok", "event_id": event_id, "message": "Alerta SOS enviada a la CRA"}



# ============================================
# ACCESS CODES & USERS MANAGEMENT
# ============================================

@router.post("/installation/{install_id}/change-code")
async def change_access_code(install_id: str, data: AccessCodeUpdate, request: Request):
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
    email = await get_client_email(request)
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
