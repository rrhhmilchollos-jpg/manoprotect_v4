"""
ManoProtect - CRA Operations Module
Central Receptora de Alarmas - Real-time alarm monitoring for security operators
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/cra", tags=["CRA Operations"])

_db = None
_sio = None
_send_push = None

def init_cra(db):
    global _db, _sio, _send_push
    _db = db
    try:
        from services.websocket_manager import sio
        _sio = sio
    except ImportError:
        pass
    try:
        from routes.notification_routes import send_alarm_alert
        _send_push = send_alarm_alert
    except ImportError:
        pass

async def _emit_cra_event(event_data: dict):
    """Emit alarm event to all CRA operators via Socket.IO"""
    if _sio:
        try:
            await _sio.emit('cra_alarm_event', event_data)
        except Exception:
            pass


# ============================================
# MODELS
# ============================================

class AlarmEvent(BaseModel):
    installation_id: str
    event_type: str  # intrusion, panic, sabotage, fire, medical, test
    zone: str = ""
    severity: str = "high"  # critical, high, medium, low
    description: str = ""

class AlarmActionLog(BaseModel):
    action: str  # verify_video, call_client, call_police, call_fire, dispatch_acuda, false_alarm, resolved
    notes: str = ""

class DeviceCreate(BaseModel):
    installation_id: str
    device_type: str  # panel, sensor_pir, sensor_door, camera, siren, sentinel_lock, keypad, smoke_detector
    model: str = ""
    serial_number: str = ""
    zone: str = ""
    location_desc: str = ""

class InstallationCreate(BaseModel):
    client_name: str
    client_email: str
    client_phone: str
    address: str
    city: str = ""
    postal_code: str = ""
    plan_type: str = ""
    access_code: str = ""
    duress_code: str = ""
    emergency_contacts: List[dict] = []
    notes: str = ""


# ============================================
# INSTALLATIONS MANAGEMENT
# ============================================

@router.get("/installations")
async def list_installations(status: str = "all"):
    query = {}
    if status != "all":
        query["status"] = status
    items = await _db.cra_installations.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"installations": items, "total": len(items)}

@router.get("/installations/{install_id}")
async def get_installation(install_id: str):
    inst = await _db.cra_installations.find_one({"id": install_id}, {"_id": 0})
    if not inst:
        raise HTTPException(404, "Instalacion no encontrada")
    devices = await _db.cra_devices.find({"installation_id": install_id}, {"_id": 0}).to_list(100)
    events = await _db.cra_alarm_events.find(
        {"installation_id": install_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    inst["devices"] = devices
    inst["recent_events"] = events
    return inst

@router.post("/installations")
async def create_installation(data: InstallationCreate):
    inst = {
        "id": str(uuid.uuid4()),
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "address": data.address,
        "city": data.city,
        "postal_code": data.postal_code,
        "plan_type": data.plan_type,
        "access_code": data.access_code,
        "duress_code": data.duress_code,
        "emergency_contacts": data.emergency_contacts,
        "notes": data.notes,
        "status": "active",
        "armed_status": "disarmed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_event_at": None,
    }
    await _db.cra_installations.insert_one(inst)
    inst.pop("_id", None)
    return inst


# ============================================
# ALARM EVENTS — Real-time monitoring
# ============================================

@router.get("/alarms")
async def list_alarms(status: str = "all", severity: str = "all", limit: int = 50):
    query = {}
    if status != "all":
        query["status"] = status
    if severity != "all":
        query["severity"] = severity
    events = await _db.cra_alarm_events.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    # Enrich with installation data
    for ev in events:
        inst = await _db.cra_installations.find_one({"id": ev.get("installation_id")}, {"_id": 0, "client_name": 1, "address": 1, "city": 1, "plan_type": 1})
        if inst:
            ev["client_name"] = inst.get("client_name", "")
            ev["address"] = inst.get("address", "")
            ev["city"] = inst.get("city", "")
    return {"alarms": events, "total": len(events)}

@router.post("/alarms")
async def create_alarm(data: AlarmEvent):
    event = {
        "id": str(uuid.uuid4()),
        "installation_id": data.installation_id,
        "event_type": data.event_type,
        "zone": data.zone,
        "severity": data.severity,
        "description": data.description,
        "status": "pending",
        "operator_id": None,
        "action_log": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": None,
    }
    await _db.cra_alarm_events.insert_one(event)
    event.pop("_id", None)
    # Update installation last_event
    await _db.cra_installations.update_one(
        {"id": data.installation_id},
        {"$set": {"last_event_at": event["created_at"]}}
    )
    # Emit real-time event to CRA operators
    inst = await _db.cra_installations.find_one({"id": data.installation_id}, {"_id": 0, "client_name": 1, "address": 1, "city": 1})
    emit_data = {**event}
    if inst:
        emit_data["client_name"] = inst.get("client_name", "")
        emit_data["address"] = inst.get("address", "")
    await _emit_cra_event(emit_data)

    # Send push notification to client
    if _send_push and inst:
        client_email = inst.get("client_email", "")
        if client_email:
            trial_user = await _db.trial_users.find_one({"email": client_email}, {"_id": 0, "user_id": 1})
            if trial_user:
                severity_msgs = {
                    "intrusion": f"Intrusion detectada en {data.zone or 'tu propiedad'}",
                    "panic": "Boton de panico activado. Asistencia en camino.",
                    "fire": f"Detector de humo activado en {data.zone or 'tu propiedad'}",
                    "sabotage": f"Manipulacion detectada en sensor {data.zone}",
                    "medical": "Alerta medica activada. Contactando servicios.",
                }
                msg = severity_msgs.get(data.event_type, data.description or f"Evento de alarma: {data.event_type}")
                await _send_push(trial_user["user_id"], data.event_type, msg, _db)

    return event

@router.patch("/alarms/{alarm_id}/assign")
async def assign_alarm(alarm_id: str, request: Request):
    body = await request.json()
    operator_id = body.get("operator_id", "operator-1")
    result = await _db.cra_alarm_events.update_one(
        {"id": alarm_id, "status": "pending"},
        {"$set": {"status": "in_progress", "operator_id": operator_id, "assigned_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(400, "Alarma no disponible para asignar")
    return {"status": "assigned", "operator_id": operator_id}

@router.post("/alarms/{alarm_id}/action")
async def log_alarm_action(alarm_id: str, data: AlarmActionLog):
    action_entry = {
        "action": data.action,
        "notes": data.notes,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    # If resolving, update status
    update = {"$push": {"action_log": action_entry}}
    if data.action in ["false_alarm", "resolved"]:
        update["$set"] = {"status": "resolved", "resolved_at": datetime.now(timezone.utc).isoformat()}
    elif data.action == "call_police":
        update["$set"] = {"status": "police_dispatched"}
    elif data.action == "dispatch_acuda":
        update["$set"] = {"status": "acuda_dispatched"}

    result = await _db.cra_alarm_events.update_one({"id": alarm_id}, update)
    if result.modified_count == 0:
        raise HTTPException(404, "Alarma no encontrada")

    # Send push notification to client about CRA action
    if _send_push:
        alarm = await _db.cra_alarm_events.find_one({"id": alarm_id}, {"_id": 0})
        if alarm:
            inst = await _db.cra_installations.find_one({"id": alarm.get("installation_id")}, {"_id": 0, "client_email": 1})
            if inst and inst.get("client_email"):
                trial_user = await _db.trial_users.find_one({"email": inst["client_email"]}, {"_id": 0, "user_id": 1})
                if trial_user:
                    action_msgs = {
                        "call_police": "Policia contactada. En camino a tu domicilio.",
                        "call_fire": "Bomberos contactados. En camino.",
                        "dispatch_acuda": "Vigilante ACUDA enviado a tu domicilio.",
                        "false_alarm": "Alarma verificada como falsa alarma. Sin peligro.",
                        "resolved": "Incidencia resuelta por la CRA.",
                        "verify_video": "Operador CRA verificando camaras.",
                        "call_client": "Operador CRA intentando contactarte.",
                    }
                    msg = action_msgs.get(data.action, f"Accion CRA: {data.action}")
                    alert_type = "panic" if data.action in ("call_police", "call_fire", "dispatch_acuda") else "arm"
                    await _send_push(trial_user["user_id"], alert_type, msg, _db)

    return {"status": "action_logged", "action": data.action}


# ============================================
# DEVICES MANAGEMENT
# ============================================

@router.get("/devices/{installation_id}")
async def list_devices(installation_id: str):
    devices = await _db.cra_devices.find({"installation_id": installation_id}, {"_id": 0}).to_list(100)
    return {"devices": devices, "total": len(devices)}

@router.post("/devices")
async def create_device(data: DeviceCreate):
    device = {
        "id": str(uuid.uuid4()),
        "installation_id": data.installation_id,
        "device_type": data.device_type,
        "model": data.model,
        "serial_number": data.serial_number,
        "zone": data.zone,
        "location_desc": data.location_desc,
        "status": "online",
        "battery_level": 100,
        "last_check": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.cra_devices.insert_one(device)
    device.pop("_id", None)
    return device


# ============================================
# PROTOCOLS — Step-by-step action guides
# ============================================

@router.get("/protocols")
async def get_protocols():
    return {"protocols": [
        {
            "id": "intrusion",
            "name": "Protocolo de Intrusion",
            "steps": [
                {"num": 1, "action": "Verificar senal", "desc": "Comprobar tipo de sensor y zona activada en el panel"},
                {"num": 2, "action": "Video-verificacion", "desc": "Acceder a camaras de la instalacion para confirmar visualmente"},
                {"num": 3, "action": "Contactar titular", "desc": "Llamar al titular para solicitar palabra clave de verificacion"},
                {"num": 4, "action": "Verificar palabra clave", "desc": "Si la palabra clave es correcta: falsa alarma. Si no contesta o da palabra de coaccion: alerta real"},
                {"num": 5, "action": "Avisar a FCSE", "desc": "Contactar Policia Nacional / Guardia Civil con datos del abonado y ubicacion"},
                {"num": 6, "action": "Despachar Acuda", "desc": "Enviar vigilante de seguridad al domicilio (SLA: 10 min)"},
                {"num": 7, "action": "Seguimiento", "desc": "Mantener comunicacion abierta hasta resolucion. Documentar todo"},
                {"num": 8, "action": "Cierre", "desc": "Registrar resolucion, notificar cliente, rearmar sistema"},
            ]
        },
        {
            "id": "panic",
            "name": "Protocolo de Panico / SOS",
            "steps": [
                {"num": 1, "action": "Alerta inmediata", "desc": "Boton de panico activado. Prioridad CRITICA"},
                {"num": 2, "action": "Contactar titular", "desc": "Llamar inmediatamente. Si no contesta en 30s, asumir emergencia real"},
                {"num": 3, "action": "Avisar a 112", "desc": "Contactar servicios de emergencia con ubicacion GPS exacta"},
                {"num": 4, "action": "Avisar a FCSE", "desc": "Contactar Policia con toda la informacion disponible"},
                {"num": 5, "action": "Contactos de emergencia", "desc": "Avisar a los contactos de emergencia del titular"},
                {"num": 6, "action": "Seguimiento", "desc": "Mantener linea abierta y documentar"},
            ]
        },
        {
            "id": "sabotage",
            "name": "Protocolo de Sabotaje",
            "steps": [
                {"num": 1, "action": "Detectar sabotaje", "desc": "Senal de inhibicion, corte de linea o apertura de panel detectada"},
                {"num": 2, "action": "Verificar estado", "desc": "Comprobar comunicacion con todos los dispositivos de la instalacion"},
                {"num": 3, "action": "Video-verificacion", "desc": "Si hay camaras operativas, verificar visualmente"},
                {"num": 4, "action": "Contactar titular", "desc": "Informar de posible manipulacion del sistema"},
                {"num": 5, "action": "Avisar a FCSE", "desc": "Si se confirma sabotaje: avisar a Policia como intento de intrusion"},
                {"num": 6, "action": "Enviar tecnico", "desc": "Programar revision tecnica urgente de la instalacion"},
            ]
        },
        {
            "id": "fire",
            "name": "Protocolo de Incendio",
            "steps": [
                {"num": 1, "action": "Alerta de humo/calor", "desc": "Detector de incendio activado"},
                {"num": 2, "action": "Contactar titular", "desc": "Verificar si es falsa alarma (cocina, etc.)"},
                {"num": 3, "action": "Llamar a Bomberos", "desc": "Si no se puede verificar: avisar a 112/Bomberos inmediatamente"},
                {"num": 4, "action": "Avisar a emergencias", "desc": "Coordinar con servicios de emergencia"},
                {"num": 5, "action": "Documentar", "desc": "Registrar timeline completa del evento"},
            ]
        },
    ]}


# ============================================
# CRA DASHBOARD STATS
# ============================================

@router.get("/dashboard")
async def cra_dashboard():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    total_installations = await _db.cra_installations.count_documents({"status": "active"})
    total_devices = await _db.cra_devices.count_documents({})
    pending_alarms = await _db.cra_alarm_events.count_documents({"status": "pending"})
    in_progress = await _db.cra_alarm_events.count_documents({"status": "in_progress"})
    today_events = await _db.cra_alarm_events.count_documents({"created_at": {"$gte": today_start}})
    resolved_today = await _db.cra_alarm_events.count_documents({"status": "resolved", "resolved_at": {"$gte": today_start}})

    # Recent alarms
    recent = await _db.cra_alarm_events.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    for ev in recent:
        inst = await _db.cra_installations.find_one({"id": ev.get("installation_id")}, {"_id": 0, "client_name": 1, "address": 1})
        if inst:
            ev["client_name"] = inst.get("client_name", "")
            ev["address"] = inst.get("address", "")

    return {
        "total_installations": total_installations,
        "total_devices": total_devices,
        "pending_alarms": pending_alarms,
        "in_progress": in_progress,
        "today_events": today_events,
        "resolved_today": resolved_today,
        "recent_alarms": recent,
    }


# ============================================
# ARM/DISARM (for client app integration)
# ============================================

@router.post("/installations/{install_id}/arm")
async def arm_installation(install_id: str, request: Request):
    body = await request.json()
    mode = body.get("mode", "total")  # total, partial, disarmed
    code = body.get("code", "")

    inst = await _db.cra_installations.find_one({"id": install_id}, {"_id": 0})
    if not inst:
        raise HTTPException(404, "Instalacion no encontrada")

    # Verify access code
    if code and code != inst.get("access_code", ""):
        raise HTTPException(403, "Codigo de acceso incorrecto")

    await _db.cra_installations.update_one(
        {"id": install_id},
        {"$set": {"armed_status": mode, "armed_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Log event
    event = {
        "id": str(uuid.uuid4()),
        "installation_id": install_id,
        "event_type": f"arm_{mode}",
        "zone": "",
        "severity": "low",
        "description": f"Sistema {'armado' if mode != 'disarmed' else 'desarmado'} — modo {mode}",
        "status": "resolved",
        "operator_id": None,
        "action_log": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.cra_alarm_events.insert_one(event)

    # Emit real-time event to CRA operators
    await _emit_cra_event({**event, "client_name": inst.get("client_name", ""), "address": inst.get("address", "")})

    return {"status": "ok", "armed_status": mode}


# ============================================
# AUTO-PROVISION from CRM
# ============================================

@router.post("/provision-from-crm")
async def provision_from_crm(request: Request):
    """When a CRM lead is closed as won, auto-create CRA installation + client access"""
    body = await request.json()
    client_name = body.get("client_name", "")
    client_email = body.get("client_email", "")
    client_phone = body.get("client_phone", "")
    address = body.get("address", "")
    plan_type = body.get("plan_type", "")

    # Create installation
    install_id = str(uuid.uuid4())
    access_code = str(uuid.uuid4())[:6].upper()
    inst = {
        "id": install_id,
        "client_name": client_name,
        "client_email": client_email,
        "client_phone": client_phone,
        "address": address,
        "city": body.get("city", ""),
        "postal_code": body.get("postal_code", ""),
        "plan_type": plan_type,
        "access_code": access_code,
        "duress_code": "",
        "emergency_contacts": [],
        "notes": f"Auto-provisionado desde CRM",
        "status": "active",
        "armed_status": "disarmed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_event_at": None,
    }
    await _db.cra_installations.insert_one(inst)

    # Create client app access
    client_access = {
        "id": str(uuid.uuid4()),
        "user_email": client_email,
        "installation_id": install_id,
        "access_code": access_code,
        "role": "owner",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.client_app_access.insert_one(client_access)

    return {
        "status": "provisioned",
        "installation_id": install_id,
        "access_code": access_code,
    }
