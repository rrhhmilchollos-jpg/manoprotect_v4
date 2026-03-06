"""
ManoProtect - Sistema de Gestión Profesional (CRA-Inspired)
Backend central para apps de Comerciales, Instaladores y Administración.
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import jwt
import os

router = APIRouter(prefix="/gestion", tags=["Gestion CRA"])

_db = None
JWT_SECRET = None

def init_gestion(db):
    global _db, JWT_SECRET
    _db = db
    JWT_SECRET = os.environ.get("JWT_SECRET", "mano_secure_jwt_secret_2025_production")


# ============================================
# MODELS
# ============================================

class GestionUserCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "comercial"  # comercial | instalador | admin

class GestionUserUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None

class GestionLogin(BaseModel):
    email: str
    password: str

class StockCreate(BaseModel):
    nombre: str
    producto_tipo: str = "sensor"  # sensor_pir, camera, panel, sentinel_lock, siren, keypad, etc.
    cantidad_disponible: int = 0
    ubicacion: str = ""
    precio_unitario: float = 0.0
    descripcion: str = ""

class StockUpdate(BaseModel):
    nombre: Optional[str] = None
    cantidad_disponible: Optional[int] = None
    ubicacion: Optional[str] = None
    precio_unitario: Optional[float] = None
    descripcion: Optional[str] = None

class PedidoCreate(BaseModel):
    cliente_nombre: str
    cliente_telefono: str = ""
    cliente_email: str = ""
    cliente_direccion: str = ""
    productos: List[dict] = []  # [{"producto_id": "...", "cantidad": 1}]
    notas: str = ""

class PedidoUpdate(BaseModel):
    estado: Optional[str] = None  # pendiente | confirmado | enviado | instalado | cancelado
    notas: Optional[str] = None

class InstalacionCreate(BaseModel):
    pedido_id: str
    direccion: str
    cliente_nombre: str
    cliente_telefono: str = ""
    fecha_programada: str = ""
    notas: str = ""

class InstalacionUpdate(BaseModel):
    estado: Optional[str] = None  # asignado | en_progreso | completado | cancelado
    notas: Optional[str] = None
    fecha_completado: Optional[str] = None


# ============================================
# AUTH HELPERS
# ============================================

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def _create_token(user_id: str, rol: str, nombre: str) -> str:
    payload = {
        "sub": user_id,
        "rol": rol,
        "nombre": nombre,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def _get_current_gestion_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    token = auth.split(" ")[1]
    payload = _decode_token(token)
    user = await _db.gestion_usuarios.find_one({"user_id": payload["sub"], "activo": True}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
    return user

async def _require_admin(request: Request) -> dict:
    user = await _get_current_gestion_user(request)
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado - se requiere rol admin")
    return user

async def _require_comercial_or_admin(request: Request) -> dict:
    user = await _get_current_gestion_user(request)
    if user["rol"] not in ("comercial", "admin"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return user

async def _require_instalador_or_admin(request: Request) -> dict:
    user = await _get_current_gestion_user(request)
    if user["rol"] not in ("instalador", "admin"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return user

async def _log_action(user_id: str, nombre: str, accion: str, detalle: str = ""):
    await _db.gestion_logs.insert_one({
        "log_id": str(uuid.uuid4()),
        "usuario_id": user_id,
        "nombre_usuario": nombre,
        "accion": accion,
        "detalle": detalle,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


# ============================================
# AUTH ENDPOINTS
# ============================================

@router.post("/auth/login")
async def gestion_login(data: GestionLogin):
    """Login para el sistema de gestión"""
    user = await _db.gestion_usuarios.find_one({"email": data.email.lower().strip(), "activo": True}, {"_id": 0})
    if not user or user["password_hash"] != _hash(data.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = _create_token(user["user_id"], user["rol"], user["nombre"])
    await _log_action(user["user_id"], user["nombre"], "login", f"Inicio de sesión desde {user['rol']}")
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "nombre": user["nombre"],
            "email": user["email"],
            "rol": user["rol"]
        }
    }

@router.get("/auth/me")
async def gestion_me(request: Request):
    """Obtener datos del usuario actual"""
    user = await _get_current_gestion_user(request)
    return {
        "user_id": user["user_id"],
        "nombre": user["nombre"],
        "email": user["email"],
        "rol": user["rol"]
    }

@router.post("/auth/refresh")
async def gestion_refresh(request: Request):
    """Renovar token JWT"""
    user = await _get_current_gestion_user(request)
    token = _create_token(user["user_id"], user["rol"], user["nombre"])
    return {"token": token}


# ============================================
# USERS MANAGEMENT (ADMIN ONLY)
# ============================================

@router.get("/usuarios")
async def list_usuarios(request: Request):
    """Listar todos los usuarios (solo admin)"""
    await _require_admin(request)
    users = await _db.gestion_usuarios.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return {"usuarios": users, "total": len(users)}

@router.post("/usuarios")
async def create_usuario(data: GestionUserCreate, request: Request):
    """Registrar nuevo usuario (solo admin)"""
    admin = await _require_admin(request)
    email = data.email.lower().strip()
    existing = await _db.gestion_usuarios.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if data.rol not in ("comercial", "instalador", "admin"):
        raise HTTPException(status_code=400, detail="Rol inválido")
    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "nombre": data.nombre,
        "email": email,
        "password_hash": _hash(data.password),
        "rol": data.rol,
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin["user_id"]
    }
    await _db.gestion_usuarios.insert_one(user_doc)
    await _log_action(admin["user_id"], admin["nombre"], "crear_usuario", f"Creó usuario {data.nombre} ({data.rol})")
    return {"message": "Usuario creado", "user_id": user_id}

@router.put("/usuarios/{uid}")
async def update_usuario(uid: str, data: GestionUserUpdate, request: Request):
    """Actualizar usuario (solo admin)"""
    admin = await _require_admin(request)
    update = {}
    if data.nombre is not None:
        update["nombre"] = data.nombre
    if data.email is not None:
        update["email"] = data.email.lower().strip()
    if data.rol is not None:
        if data.rol not in ("comercial", "instalador", "admin"):
            raise HTTPException(status_code=400, detail="Rol inválido")
        update["rol"] = data.rol
    if data.activo is not None:
        update["activo"] = data.activo
    if not update:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    result = await _db.gestion_usuarios.update_one({"user_id": uid}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await _log_action(admin["user_id"], admin["nombre"], "actualizar_usuario", f"Actualizó usuario {uid}")
    return {"message": "Usuario actualizado"}

@router.delete("/usuarios/{uid}")
async def delete_usuario(uid: str, request: Request):
    """Eliminar usuario (solo admin)"""
    admin = await _require_admin(request)
    result = await _db.gestion_usuarios.update_one({"user_id": uid}, {"$set": {"activo": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    await _log_action(admin["user_id"], admin["nombre"], "eliminar_usuario", f"Desactivó usuario {uid}")
    return {"message": "Usuario desactivado"}


# ============================================
# STOCK MANAGEMENT
# ============================================

@router.get("/stock")
async def list_stock(request: Request):
    """Listar todo el stock"""
    await _get_current_gestion_user(request)
    items = await _db.gestion_stock.find({}, {"_id": 0}).sort("nombre", 1).to_list(1000)
    return {"stock": items, "total": len(items)}

@router.get("/stock/{producto_id}")
async def get_stock_item(producto_id: str, request: Request):
    """Detalle de un producto"""
    await _get_current_gestion_user(request)
    item = await _db.gestion_stock.find_one({"producto_id": producto_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return item

@router.post("/stock")
async def create_stock(data: StockCreate, request: Request):
    """Crear producto en stock (solo admin)"""
    admin = await _require_admin(request)
    producto_id = str(uuid.uuid4())
    doc = {
        "producto_id": producto_id,
        "nombre": data.nombre,
        "producto_tipo": data.producto_tipo,
        "cantidad_disponible": data.cantidad_disponible,
        "ubicacion": data.ubicacion,
        "precio_unitario": data.precio_unitario,
        "descripcion": data.descripcion,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "ultimo_update": datetime.now(timezone.utc).isoformat()
    }
    await _db.gestion_stock.insert_one(doc)
    await _log_action(admin["user_id"], admin["nombre"], "crear_stock", f"Creó producto {data.nombre}")
    return {"message": "Producto creado", "producto_id": producto_id}

@router.put("/stock/{producto_id}")
async def update_stock(producto_id: str, data: StockUpdate, request: Request):
    """Actualizar stock (solo admin)"""
    admin = await _require_admin(request)
    update = {"ultimo_update": datetime.now(timezone.utc).isoformat()}
    if data.nombre is not None:
        update["nombre"] = data.nombre
    if data.cantidad_disponible is not None:
        update["cantidad_disponible"] = data.cantidad_disponible
    if data.ubicacion is not None:
        update["ubicacion"] = data.ubicacion
    if data.precio_unitario is not None:
        update["precio_unitario"] = data.precio_unitario
    if data.descripcion is not None:
        update["descripcion"] = data.descripcion
    result = await _db.gestion_stock.update_one({"producto_id": producto_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    await _log_action(admin["user_id"], admin["nombre"], "actualizar_stock", f"Actualizó producto {producto_id}")
    # Auto-notify comerciales if stock is low
    if data.cantidad_disponible is not None and data.cantidad_disponible < 5:
        item = await _db.gestion_stock.find_one({"producto_id": producto_id}, {"_id": 0})
        await _send_notification(destinatario_rol="comercial", tipo="stock_bajo", titulo="Stock bajo", mensaje=f"{item['nombre'] if item else producto_id}: solo {data.cantidad_disponible} uds disponibles")
    return {"message": "Stock actualizado"}

@router.delete("/stock/{producto_id}")
async def delete_stock(producto_id: str, request: Request):
    """Eliminar producto del stock (solo admin)"""
    admin = await _require_admin(request)
    result = await _db.gestion_stock.delete_one({"producto_id": producto_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    await _log_action(admin["user_id"], admin["nombre"], "eliminar_stock", f"Eliminó producto {producto_id}")
    return {"message": "Producto eliminado"}


# ============================================
# PEDIDOS (ORDERS)
# ============================================

@router.get("/pedidos")
async def list_pedidos(request: Request):
    """Listar pedidos (filtrado por rol)"""
    user = await _get_current_gestion_user(request)
    query = {}
    if user["rol"] == "comercial":
        query["comercial_id"] = user["user_id"]
    elif user["rol"] == "instalador":
        query["estado"] = {"$in": ["confirmado", "enviado"]}
    pedidos = await _db.gestion_pedidos.find(query, {"_id": 0}).sort("fecha_creacion", -1).to_list(500)
    return {"pedidos": pedidos, "total": len(pedidos)}

@router.get("/pedidos/{pedido_id}")
async def get_pedido(pedido_id: str, request: Request):
    """Detalle de un pedido"""
    await _get_current_gestion_user(request)
    pedido = await _db.gestion_pedidos.find_one({"pedido_id": pedido_id}, {"_id": 0})
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido

@router.post("/pedidos")
async def create_pedido(data: PedidoCreate, request: Request):
    """Crear pedido (comercial o admin)"""
    user = await _require_comercial_or_admin(request)
    pedido_id = f"PED-{uuid.uuid4().hex[:8].upper()}"
    doc = {
        "pedido_id": pedido_id,
        "comercial_id": user["user_id"],
        "comercial_nombre": user["nombre"],
        "cliente_nombre": data.cliente_nombre,
        "cliente_telefono": data.cliente_telefono,
        "cliente_email": data.cliente_email,
        "cliente_direccion": data.cliente_direccion,
        "productos": data.productos,
        "estado": "pendiente",
        "notas": data.notas,
        "fecha_creacion": datetime.now(timezone.utc).isoformat(),
        "fecha_actualizacion": datetime.now(timezone.utc).isoformat()
    }
    await _db.gestion_pedidos.insert_one(doc)
    await _log_action(user["user_id"], user["nombre"], "crear_pedido", f"Pedido {pedido_id} para {data.cliente_nombre}")
    # Notify admin about new order
    await _send_notification(destinatario_rol="admin", tipo="nuevo_pedido", titulo="Nuevo pedido creado", mensaje=f"{pedido_id} por {user['nombre']} - Cliente: {data.cliente_nombre}")
    return {"message": "Pedido creado", "pedido_id": pedido_id}

@router.put("/pedidos/{pedido_id}")
async def update_pedido(pedido_id: str, data: PedidoUpdate, request: Request):
    """Actualizar estado del pedido"""
    user = await _get_current_gestion_user(request)
    update = {"fecha_actualizacion": datetime.now(timezone.utc).isoformat()}
    if data.estado is not None:
        valid = ["pendiente", "confirmado", "enviado", "instalado", "cancelado"]
        if data.estado not in valid:
            raise HTTPException(status_code=400, detail=f"Estado inválido. Valores: {', '.join(valid)}")
        update["estado"] = data.estado
    if data.notas is not None:
        update["notas"] = data.notas
    result = await _db.gestion_pedidos.update_one({"pedido_id": pedido_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    await _log_action(user["user_id"], user["nombre"], "actualizar_pedido", f"Pedido {pedido_id} -> {data.estado or 'notas'}")
    return {"message": "Pedido actualizado"}


# ============================================
# INSTALACIONES
# ============================================

@router.get("/instalaciones")
async def list_instalaciones(request: Request):
    """Listar instalaciones (filtrado por rol)"""
    user = await _get_current_gestion_user(request)
    query = {}
    if user["rol"] == "instalador":
        query["instalador_id"] = user["user_id"]
    instalaciones = await _db.gestion_instalaciones.find(query, {"_id": 0}).sort("fecha_asignacion", -1).to_list(500)
    return {"instalaciones": instalaciones, "total": len(instalaciones)}

@router.get("/instalaciones/{instalacion_id}")
async def get_instalacion(instalacion_id: str, request: Request):
    """Detalle de una instalación"""
    await _get_current_gestion_user(request)
    inst = await _db.gestion_instalaciones.find_one({"instalacion_id": instalacion_id}, {"_id": 0})
    if not inst:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")
    return inst

@router.post("/instalaciones")
async def create_instalacion(data: InstalacionCreate, request: Request):
    """Crear orden de instalación (admin o comercial)"""
    user = await _require_comercial_or_admin(request)
    instalacion_id = f"INS-{uuid.uuid4().hex[:8].upper()}"
    doc = {
        "instalacion_id": instalacion_id,
        "pedido_id": data.pedido_id,
        "instalador_id": "",
        "instalador_nombre": "",
        "direccion": data.direccion,
        "cliente_nombre": data.cliente_nombre,
        "cliente_telefono": data.cliente_telefono,
        "estado": "pendiente",
        "fecha_programada": data.fecha_programada,
        "notas": data.notas,
        "fecha_asignacion": datetime.now(timezone.utc).isoformat(),
        "fecha_completado": ""
    }
    await _db.gestion_instalaciones.insert_one(doc)
    await _log_action(user["user_id"], user["nombre"], "crear_instalacion", f"Instalación {instalacion_id} para pedido {data.pedido_id}")
    return {"message": "Instalación creada", "instalacion_id": instalacion_id}

@router.put("/instalaciones/{instalacion_id}")
async def update_instalacion(instalacion_id: str, data: InstalacionUpdate, request: Request):
    """Actualizar estado de instalación"""
    user = await _get_current_gestion_user(request)
    update = {}
    if data.estado is not None:
        valid = ["pendiente", "asignado", "en_progreso", "completado", "cancelado"]
        if data.estado not in valid:
            raise HTTPException(status_code=400, detail=f"Estado inválido. Valores: {', '.join(valid)}")
        update["estado"] = data.estado
        if data.estado == "completado":
            update["fecha_completado"] = datetime.now(timezone.utc).isoformat()
    if data.notas is not None:
        update["notas"] = data.notas
    if not update:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    result = await _db.gestion_instalaciones.update_one({"instalacion_id": instalacion_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")
    await _log_action(user["user_id"], user["nombre"], "actualizar_instalacion", f"Instalación {instalacion_id} -> {data.estado or 'notas'}")
    return {"message": "Instalación actualizada"}

@router.put("/instalaciones/{instalacion_id}/asignar")
async def asignar_instalador(instalacion_id: str, request: Request):
    """Asignar un instalador a una instalación (admin)"""
    admin = await _require_admin(request)
    body = await request.json()
    instalador_id = body.get("instalador_id", "")
    if not instalador_id:
        raise HTTPException(status_code=400, detail="instalador_id requerido")
    instalador = await _db.gestion_usuarios.find_one({"user_id": instalador_id, "rol": "instalador", "activo": True}, {"_id": 0})
    if not instalador:
        raise HTTPException(status_code=404, detail="Instalador no encontrado")
    result = await _db.gestion_instalaciones.update_one(
        {"instalacion_id": instalacion_id},
        {"$set": {"instalador_id": instalador_id, "instalador_nombre": instalador["nombre"], "estado": "asignado"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")
    await _log_action(admin["user_id"], admin["nombre"], "asignar_instalador", f"Asignó {instalador['nombre']} a instalación {instalacion_id}")
    # Notify the installer about new assignment
    inst = await _db.gestion_instalaciones.find_one({"instalacion_id": instalacion_id}, {"_id": 0})
    await _send_notification(destinatario_id=instalador_id, tipo="nueva_instalacion", titulo="Nueva instalación asignada", mensaje=f"Instalación {instalacion_id} - {inst.get('cliente_nombre', '')} en {inst.get('direccion', '')}")
    return {"message": f"Instalador {instalador['nombre']} asignado"}


# ============================================
# LOGS (AUDIT - ADMIN ONLY)
# ============================================

@router.get("/logs")
async def list_logs(request: Request, limit: int = 100, usuario_id: str = ""):
    """Logs de auditoría (solo admin)"""
    await _require_admin(request)
    query = {}
    if usuario_id:
        query["usuario_id"] = usuario_id
    logs = await _db.gestion_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return {"logs": logs, "total": len(logs)}


# ============================================
# DASHBOARD / STATS
# ============================================

@router.get("/dashboard/stats")
async def dashboard_stats(request: Request):
    """Estadísticas generales del sistema"""
    user = await _get_current_gestion_user(request)
    total_usuarios = await _db.gestion_usuarios.count_documents({"activo": True})
    total_comerciales = await _db.gestion_usuarios.count_documents({"rol": "comercial", "activo": True})
    total_instaladores = await _db.gestion_usuarios.count_documents({"rol": "instalador", "activo": True})
    total_stock = await _db.gestion_stock.count_documents({})
    total_pedidos = await _db.gestion_pedidos.count_documents({})
    pedidos_pendientes = await _db.gestion_pedidos.count_documents({"estado": "pendiente"})
    pedidos_confirmados = await _db.gestion_pedidos.count_documents({"estado": "confirmado"})
    total_instalaciones = await _db.gestion_instalaciones.count_documents({})
    inst_pendientes = await _db.gestion_instalaciones.count_documents({"estado": {"$in": ["pendiente", "asignado"]}})
    inst_completadas = await _db.gestion_instalaciones.count_documents({"estado": "completado"})

    # Stock bajo (menos de 5 unidades)
    low_stock = await _db.gestion_stock.find({"cantidad_disponible": {"$lt": 5}}, {"_id": 0}).to_list(50)

    return {
        "total_usuarios": total_usuarios,
        "total_comerciales": total_comerciales,
        "total_instaladores": total_instaladores,
        "total_stock": total_stock,
        "total_pedidos": total_pedidos,
        "pedidos_pendientes": pedidos_pendientes,
        "pedidos_confirmados": pedidos_confirmados,
        "total_instalaciones": total_instalaciones,
        "instalaciones_pendientes": inst_pendientes,
        "instalaciones_completadas": inst_completadas,
        "stock_bajo": low_stock,
        "user_rol": user["rol"]
    }


# ============================================
# SEED DEFAULT ADMIN
# ============================================

@router.post("/seed-admin")
async def seed_admin():
    """Crear admin por defecto si no existe (solo una vez)"""
    existing = await _db.gestion_usuarios.find_one({"email": "admin@manoprotect.com"})
    if existing:
        return {"message": "Admin ya existe", "seeded": False}
    admin_id = str(uuid.uuid4())
    await _db.gestion_usuarios.insert_one({
        "user_id": admin_id,
        "nombre": "Administrador ManoProtect",
        "email": "admin@manoprotect.com",
        "password_hash": _hash("ManoAdmin2025!"),
        "rol": "admin",
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": "system"
    })
    # Seed demo comercial
    com_id = str(uuid.uuid4())
    await _db.gestion_usuarios.insert_one({
        "user_id": com_id,
        "nombre": "Carlos Comercial",
        "email": "comercial@manoprotect.com",
        "password_hash": _hash("Comercial2025!"),
        "rol": "comercial",
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin_id
    })
    # Seed demo instalador
    ins_id = str(uuid.uuid4())
    await _db.gestion_usuarios.insert_one({
        "user_id": ins_id,
        "nombre": "Miguel Instalador",
        "email": "instalador@manoprotect.com",
        "password_hash": _hash("Instalador2025!"),
        "rol": "instalador",
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin_id
    })
    # Seed demo stock
    stock_items = [
        {"nombre": "Panel Central ManoProtect", "producto_tipo": "panel", "cantidad_disponible": 25, "ubicacion": "Almacén Madrid", "precio_unitario": 199.99},
        {"nombre": "Sensor PIR Movimiento", "producto_tipo": "sensor_pir", "cantidad_disponible": 120, "ubicacion": "Almacén Madrid", "precio_unitario": 29.99},
        {"nombre": "Cámara IP Interior HD", "producto_tipo": "camera", "cantidad_disponible": 45, "ubicacion": "Almacén Madrid", "precio_unitario": 89.99},
        {"nombre": "Cámara IP Exterior 4K", "producto_tipo": "camera", "cantidad_disponible": 30, "ubicacion": "Almacén Madrid", "precio_unitario": 149.99},
        {"nombre": "Sirena Interior 110dB", "producto_tipo": "siren", "cantidad_disponible": 60, "ubicacion": "Almacén Madrid", "precio_unitario": 39.99},
        {"nombre": "Teclado Panel Alarma", "producto_tipo": "keypad", "cantidad_disponible": 35, "ubicacion": "Almacén Madrid", "precio_unitario": 49.99},
        {"nombre": "Sentinel Lock Pro", "producto_tipo": "sentinel_lock", "cantidad_disponible": 15, "ubicacion": "Almacén Barcelona", "precio_unitario": 299.99},
        {"nombre": "Sensor Puerta/Ventana", "producto_tipo": "sensor_magnetico", "cantidad_disponible": 200, "ubicacion": "Almacén Madrid", "precio_unitario": 19.99},
        {"nombre": "Detector de Humo", "producto_tipo": "detector_humo", "cantidad_disponible": 80, "ubicacion": "Almacén Valencia", "precio_unitario": 24.99},
        {"nombre": "Mando a Distancia", "producto_tipo": "mando", "cantidad_disponible": 3, "ubicacion": "Almacén Madrid", "precio_unitario": 14.99},
    ]
    for item in stock_items:
        await _db.gestion_stock.insert_one({
            "producto_id": str(uuid.uuid4()),
            "nombre": item["nombre"],
            "producto_tipo": item["producto_tipo"],
            "cantidad_disponible": item["cantidad_disponible"],
            "ubicacion": item["ubicacion"],
            "precio_unitario": item["precio_unitario"],
            "descripcion": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ultimo_update": datetime.now(timezone.utc).isoformat()
        })
    await _log_action(admin_id, "System", "seed", "Sistema inicializado con admin, comercial, instalador y stock demo")
    return {
        "message": "Sistema inicializado",
        "seeded": True,
        "credenciales": {
            "admin": {"email": "admin@manoprotect.com", "password": "ManoAdmin2025!"},
            "comercial": {"email": "comercial@manoprotect.com", "password": "Comercial2025!"},
            "instalador": {"email": "instalador@manoprotect.com", "password": "Instalador2025!"}
        }
    }



# ============================================
# NOTIFICATIONS SYSTEM
# ============================================

@router.get("/notificaciones")
async def list_notificaciones(request: Request, limit: int = 30):
    """Obtener notificaciones del usuario actual"""
    user = await _get_current_gestion_user(request)
    query = {"$or": [{"destinatario_id": user["user_id"]}, {"destinatario_rol": user["rol"]}, {"destinatario_rol": "todos"}]}
    notifs = await _db.gestion_notificaciones.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    unread = await _db.gestion_notificaciones.count_documents({**query, "leida": False})
    return {"notificaciones": notifs, "no_leidas": unread}

@router.put("/notificaciones/leer")
async def mark_all_read(request: Request):
    """Marcar todas las notificaciones como leídas"""
    user = await _get_current_gestion_user(request)
    query = {"$or": [{"destinatario_id": user["user_id"]}, {"destinatario_rol": user["rol"]}, {"destinatario_rol": "todos"}]}
    await _db.gestion_notificaciones.update_many(query, {"$set": {"leida": True}})
    return {"message": "Notificaciones marcadas como leídas"}

@router.put("/notificaciones/{notif_id}/leer")
async def mark_one_read(notif_id: str, request: Request):
    """Marcar una notificación como leída"""
    await _get_current_gestion_user(request)
    await _db.gestion_notificaciones.update_one({"notif_id": notif_id}, {"$set": {"leida": True}})
    return {"message": "Notificación leída"}

async def _send_notification(destinatario_id: str = "", destinatario_rol: str = "", tipo: str = "info", titulo: str = "", mensaje: str = "", datos: dict = None):
    """Enviar notificación interna"""
    await _db.gestion_notificaciones.insert_one({
        "notif_id": str(uuid.uuid4()),
        "destinatario_id": destinatario_id,
        "destinatario_rol": destinatario_rol,
        "tipo": tipo,
        "titulo": titulo,
        "mensaje": mensaje,
        "datos": datos or {},
        "leida": False,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


# ============================================
# APP VERSION CONTROL & AUTO-UPDATE
# ============================================

class AppVersionCheck(BaseModel):
    app_name: str  # comerciales | instaladores | admin
    current_version: str  # e.g. "1.0.0"
    current_build: int = 1

@router.get("/app-versions")
async def get_app_versions(request: Request):
    """Obtener versiones actuales de todas las apps"""
    await _get_current_gestion_user(request)
    versions = await _db.gestion_app_versions.find({}, {"_id": 0}).to_list(10)
    if not versions:
        defaults = [
            {"app_name": "comerciales", "version_name": "1.0.0", "version_code": 1, "release_notes": "Lanzamiento inicial", "min_version": "1.0.0", "force_update": False, "download_url": "", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"app_name": "instaladores", "version_name": "1.0.0", "version_code": 1, "release_notes": "Lanzamiento inicial", "min_version": "1.0.0", "force_update": False, "download_url": "", "updated_at": datetime.now(timezone.utc).isoformat()},
            {"app_name": "admin", "version_name": "1.0.0", "version_code": 1, "release_notes": "Lanzamiento inicial", "min_version": "1.0.0", "force_update": False, "download_url": "", "updated_at": datetime.now(timezone.utc).isoformat()},
        ]
        for d in defaults:
            await _db.gestion_app_versions.insert_one(d)
        versions = defaults
    return {"versions": versions}

@router.post("/app-versions/check")
async def check_app_version(data: AppVersionCheck):
    """Verificar si hay actualización disponible (público, desde la app)"""
    ver = await _db.gestion_app_versions.find_one({"app_name": data.app_name}, {"_id": 0})
    if not ver:
        return {"update_available": False, "force_update": False}
    server_parts = [int(x) for x in ver["version_name"].split(".")]
    client_parts = [int(x) for x in data.current_version.split(".")]
    update_available = server_parts > client_parts or ver["version_code"] > data.current_build
    min_parts = [int(x) for x in ver.get("min_version", "1.0.0").split(".")]
    force = client_parts < min_parts or ver.get("force_update", False)
    return {
        "update_available": update_available,
        "force_update": force and update_available,
        "latest_version": ver["version_name"],
        "latest_build": ver["version_code"],
        "release_notes": ver.get("release_notes", ""),
        "download_url": ver.get("download_url", "")
    }

@router.put("/app-versions/{app_name}")
async def update_app_version(app_name: str, request: Request):
    """Actualizar versión de una app (solo admin)"""
    admin = await _require_admin(request)
    body = await request.json()
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    for k in ["version_name", "version_code", "release_notes", "min_version", "force_update", "download_url"]:
        if k in body:
            update[k] = body[k]
    await _db.gestion_app_versions.update_one({"app_name": app_name}, {"$set": update}, upsert=True)
    # Notify all users of that role about the update
    rol = "comercial" if app_name == "comerciales" else ("instalador" if app_name == "instaladores" else "admin")
    await _send_notification(
        destinatario_rol=rol,
        tipo="update",
        titulo=f"Nueva versión disponible: {body.get('version_name', '')}",
        mensaje=body.get("release_notes", "Actualización disponible"),
        datos={"app_name": app_name, "version": body.get("version_name", "")}
    )
    await _log_action(admin["user_id"], admin["nombre"], "actualizar_version", f"App {app_name} -> {body.get('version_name', '')}")
    return {"message": "Versión actualizada"}
