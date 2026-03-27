"""
ManoProtect — Back Office Routes
Gestion de usuarios (comerciales/instaladores), pipeline CRM, auditoria
Estilo Securitas Direct / Verisure
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
import secrets
import string
import bcrypt

router = APIRouter(prefix="/backoffice", tags=["Back Office"])

_db = None

def init_backoffice(db):
    global _db
    _db = db


def _gen_temp_password(length=10):
    chars = string.ascii_letters + string.digits + "!@#$"
    return ''.join(secrets.choice(chars) for _ in range(length))

def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


# ============================================
# HELPER: require admin
# ============================================
async def _require_backoffice_admin(request: Request) -> dict:
    import jwt, os
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    try:
        secret = os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production")
        payload = jwt.decode(auth.split(" ")[1], secret, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Token invalido")
    user = await _db.gestion_usuarios.find_one({"user_id": payload.get("sub") or payload.get("user_id")}, {"_id": 0})
    if not user or user.get("rol") not in ("admin", "superadmin"):
        raise HTTPException(403, "Solo administradores pueden acceder al Back Office")
    return user


# ============================================
# 1. ALTA DE USUARIOS (Comerciales / Instaladores)
# ============================================

@router.post("/usuarios")
async def crear_usuario(request: Request):
    """Alta de nuevo comercial o instalador con contrasena temporal"""
    admin = await _require_backoffice_admin(request)
    body = await request.json()

    nombre = body.get("nombre", "").strip()
    email = body.get("email", "").lower().strip()
    telefono = body.get("telefono", "").strip()
    rol = body.get("rol", "")
    zona = body.get("zona", "")
    contrato_verificado = body.get("contrato_verificado", False)
    documentacion_validada = body.get("documentacion_validada", False)

    if not nombre or not email or rol not in ("comercial", "instalador"):
        raise HTTPException(400, "Nombre, email y rol (comercial/instalador) son requeridos")

    existing = await _db.gestion_usuarios.find_one({"email": email})
    if existing:
        raise HTTPException(409, f"Ya existe un usuario con email {email}")

    temp_password = _gen_temp_password()
    user_id = str(uuid.uuid4())

    new_user = {
        "user_id": user_id,
        "nombre": nombre,
        "email": email,
        "telefono": telefono,
        "rol": rol,
        "zona": zona,
        "password_hash": _hash_pw(temp_password),
        "password_temporal": True,
        "activo": True,
        "contrato_verificado": contrato_verificado,
        "documentacion_validada": documentacion_validada,
        "formacion_completada": False,
        "creado_por": admin["user_id"],
        "creado_por_nombre": admin["nombre"],
        "fecha_creacion": datetime.now(timezone.utc).isoformat(),
        "ultimo_login": None,
        "login_count": 0,
    }
    await _db.gestion_usuarios.insert_one(new_user)

    # Log audit
    await _db.backoffice_audit.insert_one({
        "id": str(uuid.uuid4()),
        "accion": "alta_usuario",
        "admin_id": admin["user_id"],
        "admin_nombre": admin["nombre"],
        "usuario_id": user_id,
        "usuario_nombre": nombre,
        "detalles": f"Alta de {rol}: {nombre} ({email})",
        "fecha": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "message": f"Usuario {rol} creado correctamente",
        "user_id": user_id,
        "email": email,
        "password_temporal": temp_password,
        "rol": rol,
        "instrucciones": f"Envie estas credenciales al usuario. En su primer login debera cambiar la contrasena.",
    }


@router.get("/usuarios")
async def listar_usuarios(request: Request):
    """Listar todos los usuarios del sistema (comerciales + instaladores)"""
    await _require_backoffice_admin(request)
    rol_filter = request.query_params.get("rol", "")
    query = {}
    if rol_filter:
        query["rol"] = rol_filter
    usuarios = await _db.gestion_usuarios.find(query, {"_id": 0, "password_hash": 0}).sort("fecha_creacion", -1).to_list(200)
    stats = {
        "total": len(usuarios),
        "comerciales": sum(1 for u in usuarios if u.get("rol") == "comercial"),
        "instaladores": sum(1 for u in usuarios if u.get("rol") == "instalador"),
        "admins": sum(1 for u in usuarios if u.get("rol") in ("admin", "superadmin")),
        "activos": sum(1 for u in usuarios if u.get("activo", True)),
        "pendientes_activacion": sum(1 for u in usuarios if u.get("password_temporal")),
    }
    return {"usuarios": usuarios, "stats": stats}


@router.get("/usuarios/{user_id}")
async def get_usuario(user_id: str, request: Request):
    """Detalle de un usuario"""
    await _require_backoffice_admin(request)
    user = await _db.gestion_usuarios.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    # Get audit log
    audit = await _db.backoffice_audit.find({"usuario_id": user_id}, {"_id": 0}).sort("fecha", -1).to_list(50)
    # Get login history
    logins = await _db.backoffice_logins.find({"user_id": user_id}, {"_id": 0}).sort("fecha", -1).to_list(20)
    return {**user, "audit_log": audit, "login_history": logins}


@router.put("/usuarios/{user_id}")
async def actualizar_usuario(user_id: str, request: Request):
    """Actualizar datos de un usuario"""
    admin = await _require_backoffice_admin(request)
    body = await request.json()
    update = {}
    for key in ["nombre", "telefono", "zona", "activo", "contrato_verificado", "documentacion_validada", "formacion_completada"]:
        if key in body:
            update[key] = body[key]
    if not update:
        raise HTTPException(400, "Nada que actualizar")

    result = await _db.gestion_usuarios.update_one({"user_id": user_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Usuario no encontrado")

    await _db.backoffice_audit.insert_one({
        "id": str(uuid.uuid4()),
        "accion": "actualizar_usuario",
        "admin_id": admin["user_id"],
        "admin_nombre": admin["nombre"],
        "usuario_id": user_id,
        "detalles": f"Campos actualizados: {list(update.keys())}",
        "fecha": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "Usuario actualizado"}


@router.put("/usuarios/{user_id}/desactivar")
async def desactivar_usuario(user_id: str, request: Request):
    """Desactivar/bloquear un usuario"""
    admin = await _require_backoffice_admin(request)
    result = await _db.gestion_usuarios.update_one(
        {"user_id": user_id},
        {"$set": {"activo": False, "fecha_desactivacion": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Usuario no encontrado")
    await _db.backoffice_audit.insert_one({
        "id": str(uuid.uuid4()),
        "accion": "desactivar_usuario",
        "admin_id": admin["user_id"],
        "admin_nombre": admin["nombre"],
        "usuario_id": user_id,
        "detalles": "Usuario desactivado",
        "fecha": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "Usuario desactivado"}


@router.put("/usuarios/{user_id}/resetear-password")
async def resetear_password(user_id: str, request: Request):
    """Generar nueva contrasena temporal"""
    admin = await _require_backoffice_admin(request)
    temp_password = _gen_temp_password()
    result = await _db.gestion_usuarios.update_one(
        {"user_id": user_id},
        {"$set": {"password_hash": _hash_pw(temp_password), "password_temporal": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Usuario no encontrado")
    await _db.backoffice_audit.insert_one({
        "id": str(uuid.uuid4()),
        "accion": "resetear_password",
        "admin_id": admin["user_id"],
        "admin_nombre": admin["nombre"],
        "usuario_id": user_id,
        "detalles": "Password reseteado",
        "fecha": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "Password reseteado", "password_temporal": temp_password}


# ============================================
# 2. PRIMER LOGIN: Cambio de contrasena obligatorio
# ============================================

@router.post("/cambiar-password")
async def cambiar_password(request: Request):
    """Cambiar contrasena (usado en primer login)"""
    import jwt, os
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requerido")
    try:
        payload = jwt.decode(auth.split(" ")[1], os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production"), algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Token invalido")
    body = await request.json()
    new_password = body.get("new_password", "")
    if len(new_password) < 8:
        raise HTTPException(400, "La contrasena debe tener minimo 8 caracteres")

    result = await _db.gestion_usuarios.update_one(
        {"user_id": payload.get("sub") or payload.get("user_id")},
        {"$set": {"password_hash": _hash_pw(new_password), "password_temporal": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Usuario no encontrado")
    return {"message": "Contrasena actualizada correctamente"}


# ============================================
# 3. PIPELINE CRM (Flujo comercial Securitas Direct)
# ============================================

PIPELINE_STAGES = [
    "lead",            # 1. Captura de lead
    "contacto",        # 2. Contacto y confirmacion
    "estudio",         # 3. Estudio de seguridad
    "propuesta",       # 4. Propuesta personalizada
    "contrato",        # 5. Firma de contrato
    "instalacion",     # 6. Instalacion programada
    "activacion",      # 7. Activacion CRA + App cliente
    "activo",          # 8. Servicio continuado
    "cancelado",       # Stage terminal
]

STAGE_LABELS = {
    "lead": "Lead captado",
    "contacto": "En contacto",
    "estudio": "Estudio seguridad",
    "propuesta": "Propuesta enviada",
    "contrato": "Contrato firmado",
    "instalacion": "Instalacion programada",
    "activacion": "Activando sistema",
    "activo": "Cliente activo",
    "cancelado": "Cancelado",
}

@router.post("/pipeline")
async def crear_lead_pipeline(request: Request):
    """Captura de nuevo lead en el pipeline"""
    import jwt, os
    auth = request.headers.get("Authorization", "")
    comercial_id = "web"
    comercial_nombre = "Web/Auto"
    if auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth.split(" ")[1], os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production"), algorithms=["HS256"])
            user = await _db.gestion_usuarios.find_one({"user_id": payload.get("sub") or payload.get("user_id")}, {"_id": 0})
            if user:
                comercial_id = user["user_id"]
                comercial_nombre = user["nombre"]
        except Exception:
            pass

    body = await request.json()
    nombre = body.get("nombre", "").strip()
    email = body.get("email", "").strip()
    telefono = body.get("telefono", "").strip()
    direccion = body.get("direccion", "").strip()
    tipo_inmueble = body.get("tipo_inmueble", "piso")
    canal = body.get("canal", "web")
    notas = body.get("notas", "")

    if not nombre or not telefono:
        raise HTTPException(400, "Nombre y telefono son requeridos")

    lead_id = f"LEAD-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    lead = {
        "lead_id": lead_id,
        "nombre": nombre,
        "email": email,
        "telefono": telefono,
        "direccion": direccion,
        "tipo_inmueble": tipo_inmueble,
        "canal": canal,
        "notas": notas,
        "etapa": "lead",
        "etapa_anterior": None,
        "comercial_id": comercial_id,
        "comercial_nombre": comercial_nombre,
        "fecha_creacion": now,
        "fecha_etapa": now,
        "historial_etapas": [{"etapa": "lead", "fecha": now, "por": comercial_nombre}],
        "estudio_seguridad": None,
        "propuesta": None,
        "contrato": None,
        "instalacion_id": None,
        "client_user_id": None,
        "activo": True,
    }
    await _db.pipeline_leads.insert_one(lead)
    return {"message": "Lead creado", "lead_id": lead_id, "etapa": "lead"}


@router.get("/pipeline")
async def listar_pipeline(request: Request):
    """Listar todos los leads del pipeline con filtros"""
    import jwt, os
    auth = request.headers.get("Authorization", "")
    user = None
    if auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth.split(" ")[1], os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production"), algorithms=["HS256"])
            user = await _db.gestion_usuarios.find_one({"user_id": payload.get("sub") or payload.get("user_id")}, {"_id": 0})
        except Exception:
            pass

    etapa = request.query_params.get("etapa", "")
    query = {"activo": True}
    if etapa:
        query["etapa"] = etapa
    if user and user.get("rol") == "comercial":
        query["comercial_id"] = user["user_id"]

    leads = await _db.pipeline_leads.find(query, {"_id": 0}).sort("fecha_etapa", -1).to_list(200)

    # Pipeline stats
    all_leads = await _db.pipeline_leads.find({"activo": True}, {"_id": 0, "etapa": 1}).to_list(1000)
    stage_counts = {}
    for s in PIPELINE_STAGES:
        stage_counts[s] = sum(1 for l in all_leads if l.get("etapa") == s)

    return {
        "leads": leads,
        "stages": PIPELINE_STAGES,
        "stage_labels": STAGE_LABELS,
        "stage_counts": stage_counts,
        "total": len(leads),
    }


@router.get("/pipeline/{lead_id}")
async def get_lead_pipeline(lead_id: str, request: Request):
    """Detalle de un lead del pipeline"""
    lead = await _db.pipeline_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(404, "Lead no encontrado")
    return lead


@router.put("/pipeline/{lead_id}/avanzar")
async def avanzar_etapa(lead_id: str, request: Request):
    """Avanzar lead a la siguiente etapa del pipeline"""
    import jwt, os
    auth = request.headers.get("Authorization", "")
    operator = "sistema"
    if auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth.split(" ")[1], os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production"), algorithms=["HS256"])
            u = await _db.gestion_usuarios.find_one({"user_id": payload.get("sub") or payload.get("user_id")}, {"_id": 0})
            if u:
                operator = u["nombre"]
        except Exception:
            pass

    body = await request.json()
    nueva_etapa = body.get("etapa", "")
    notas = body.get("notas", "")

    if nueva_etapa not in PIPELINE_STAGES:
        raise HTTPException(400, f"Etapa invalida. Validas: {PIPELINE_STAGES}")

    lead = await _db.pipeline_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(404, "Lead no encontrado")

    now = datetime.now(timezone.utc).isoformat()
    historial = lead.get("historial_etapas", [])
    historial.append({"etapa": nueva_etapa, "fecha": now, "por": operator, "notas": notas})

    update = {
        "etapa_anterior": lead["etapa"],
        "etapa": nueva_etapa,
        "fecha_etapa": now,
        "historial_etapas": historial,
    }

    # Extra data depending on stage
    if nueva_etapa == "estudio" and body.get("estudio"):
        update["estudio_seguridad"] = body["estudio"]
    if nueva_etapa == "propuesta" and body.get("propuesta"):
        update["propuesta"] = body["propuesta"]
    if nueva_etapa == "contrato":
        update["contrato"] = {
            "firmado": True,
            "fecha_firma": now,
            "duracion_meses": body.get("duracion_meses", 24),
            "cuota_mensual": body.get("cuota_mensual", 0),
        }

    await _db.pipeline_leads.update_one({"lead_id": lead_id}, {"$set": update})
    return {"message": f"Lead avanzado a: {STAGE_LABELS.get(nueva_etapa, nueva_etapa)}", "etapa": nueva_etapa}


@router.put("/pipeline/{lead_id}/estudio")
async def guardar_estudio(lead_id: str, request: Request):
    """Guardar estudio de seguridad del inmueble"""
    body = await request.json()
    estudio = {
        "tipo_inmueble": body.get("tipo_inmueble", "piso"),
        "metros_cuadrados": body.get("metros", 0),
        "num_accesos": body.get("accesos", 1),
        "num_ventanas": body.get("ventanas", 0),
        "garaje": body.get("garaje", False),
        "jardin": body.get("jardin", False),
        "mascotas": body.get("mascotas", False),
        "puntos_vulnerables": body.get("puntos_vulnerables", ""),
        "equipamiento_recomendado": body.get("equipamiento", []),
        "notas_tecnico": body.get("notas", ""),
        "fecha": datetime.now(timezone.utc).isoformat(),
    }
    await _db.pipeline_leads.update_one({"lead_id": lead_id}, {"$set": {"estudio_seguridad": estudio}})
    return {"message": "Estudio de seguridad guardado"}


@router.put("/pipeline/{lead_id}/propuesta")
async def guardar_propuesta(lead_id: str, request: Request):
    """Guardar propuesta personalizada"""
    body = await request.json()
    propuesta = {
        "equipos": body.get("equipos", []),
        "cuota_mensual": body.get("cuota_mensual", 0),
        "coste_instalacion": body.get("coste_instalacion", 0),
        "duracion_contrato_meses": body.get("duracion_meses", 24),
        "descuento_aplicado": body.get("descuento", 0),
        "total_primer_pago": body.get("total_primer_pago", 0),
        "notas": body.get("notas", ""),
        "fecha": datetime.now(timezone.utc).isoformat(),
    }
    await _db.pipeline_leads.update_one({"lead_id": lead_id}, {"$set": {"propuesta": propuesta}})
    return {"message": "Propuesta guardada"}


@router.put("/pipeline/{lead_id}/activar-cliente")
async def activar_cliente(lead_id: str, request: Request):
    """Activar cliente: crear credenciales app + vincular CRA"""
    admin = await _require_backoffice_admin(request)
    lead = await _db.pipeline_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(404, "Lead no encontrado")
    if lead["etapa"] not in ("instalacion", "activacion", "activo"):
        raise HTTPException(400, "El lead debe estar en etapa de instalacion o posterior")

    email = lead.get("email", "").lower().strip()
    if not email:
        raise HTTPException(400, "El lead necesita un email para crear cuenta de cliente")

    # Check if already activated
    existing = await _db.client_app_users.find_one({"email": email})
    if existing:
        raise HTTPException(409, "Este cliente ya tiene cuenta activa")

    temp_pass = _gen_temp_password()
    await _db.client_app_users.insert_one({
        "email": email,
        "nombre": lead.get("nombre", ""),
        "telefono": lead.get("telefono", ""),
        "password_hash": _hash_pw(temp_pass),
        "activo": True,
        "lead_id": lead_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    now = datetime.now(timezone.utc).isoformat()
    historial = lead.get("historial_etapas", [])
    historial.append({"etapa": "activo", "fecha": now, "por": admin["nombre"], "notas": "Cliente activado"})

    await _db.pipeline_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "etapa": "activo",
            "etapa_anterior": lead["etapa"],
            "fecha_etapa": now,
            "historial_etapas": historial,
            "client_user_id": email,
        }}
    )

    return {
        "message": "Cliente activado correctamente",
        "email": email,
        "password_temporal": temp_pass,
        "instrucciones": "Envie estas credenciales al cliente para acceder a la App ManoProtect.",
    }


# ============================================
# 4. AUDITORIA
# ============================================

@router.get("/auditoria")
async def listar_auditoria(request: Request):
    """Historial de auditoria del Back Office"""
    await _require_backoffice_admin(request)
    limit = int(request.query_params.get("limit", "100"))
    logs = await _db.backoffice_audit.find({}, {"_id": 0}).sort("fecha", -1).to_list(limit)
    return {"logs": logs, "total": len(logs)}


@router.get("/logins")
async def listar_logins(request: Request):
    """Historial de logins del sistema"""
    await _require_backoffice_admin(request)
    limit = int(request.query_params.get("limit", "100"))
    logins = await _db.backoffice_logins.find({}, {"_id": 0}).sort("fecha", -1).to_list(limit)
    return {"logins": logins, "total": len(logins)}
