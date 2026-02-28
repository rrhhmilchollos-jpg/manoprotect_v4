"""
Location Lock & Document Generation Routes - ManoProtect
- Parental lock: Once activated, location settings become hidden and locked
- PDF generation: Welcome PDF (post-purchase) and Setup Complete PDF (post-config)
- WhatsApp sharing: Generate shareable links for documents
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
import logging

from core.auth import require_auth

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db


# ========================================
# LOCATION LOCK (PARENTAL CONTROL)
# ========================================

class LocationLockRequest(BaseModel):
    target_user_id: Optional[str] = None

class LocationUnlockRequest(BaseModel):
    target_user_id: str
    dni_verified: bool = False
    reason: str = ""


@router.post("/location/lock")
async def lock_location_settings(data: LocationLockRequest, request: Request):
    """
    Lock location settings after initial setup.
    Once locked, the child/user cannot see or modify location permissions.
    Only admin can unlock with DNI verification.
    """
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    target_id = data.target_user_id or user.user_id
    
    now = datetime.now(timezone.utc).isoformat()
    
    await _db.users.update_one(
        {"user_id": target_id},
        {"$set": {
            "location_locked": True,
            "location_locked_by": user.user_id,
            "location_locked_at": now,
            "location_setup_completed": True,
            "background_tracking_active": True
        }}
    )
    
    # Audit log
    await _db.audit_logs.insert_one({
        "action": "location_lock",
        "target_user_id": target_id,
        "performed_by": user.user_id,
        "timestamp": now,
        "details": "Location settings locked by parent/guardian after initial setup"
    })
    
    logging.info(f"Location locked for user {target_id} by {user.user_id}")
    
    return {
        "success": True,
        "message": "Configuración de ubicación bloqueada. Solo se puede desbloquear contactando con ManoProtect.",
        "locked_at": now,
        "locked_by": user.user_id
    }


@router.get("/location/status")
async def get_location_lock_status(request: Request):
    """Check if location settings are locked for current user"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    user_doc = await _db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "location_locked": 1, "location_locked_by": 1, "location_locked_at": 1, 
         "location_setup_completed": 1, "background_tracking_active": 1}
    )
    
    if not user_doc:
        return {"locked": False, "setup_completed": False, "tracking_active": False}
    
    return {
        "locked": user_doc.get("location_locked", False),
        "locked_by": user_doc.get("location_locked_by"),
        "locked_at": user_doc.get("location_locked_at"),
        "setup_completed": user_doc.get("location_setup_completed", False),
        "tracking_active": user_doc.get("background_tracking_active", False)
    }


@router.post("/admin/unlock-location")
async def admin_unlock_location(data: LocationUnlockRequest, request: Request):
    """
    Admin-only: Unlock location settings for a user.
    Requires DNI verification and reason.
    """
    session_token = request.cookies.get("session_token")
    admin = await require_auth(request, session_token)
    
    # Verify admin role
    admin_doc = await _db.users.find_one({"user_id": admin.user_id}, {"_id": 0, "role": 1})
    if not admin_doc or admin_doc.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden desbloquear la ubicación")
    
    if not data.dni_verified:
        raise HTTPException(status_code=400, detail="Se requiere verificación de DNI antes de desbloquear")
    
    if not data.reason:
        raise HTTPException(status_code=400, detail="Se requiere un motivo para desbloquear")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await _db.users.update_one(
        {"user_id": data.target_user_id},
        {"$set": {
            "location_locked": False,
            "location_unlocked_by": admin.user_id,
            "location_unlocked_at": now
        }}
    )
    
    # Audit log
    await _db.audit_logs.insert_one({
        "action": "location_unlock",
        "target_user_id": data.target_user_id,
        "performed_by": admin.user_id,
        "timestamp": now,
        "dni_verified": True,
        "reason": data.reason,
        "details": f"Location unlocked by admin {admin.user_id}. Reason: {data.reason}"
    })
    
    logging.info(f"Location UNLOCKED for user {data.target_user_id} by admin {admin.user_id}. Reason: {data.reason}")
    
    return {
        "success": True,
        "message": f"Ubicación desbloqueada para usuario {data.target_user_id}",
        "unlocked_at": now
    }


# ========================================
# HEARTBEAT LOCATION UPDATE
# ========================================

class LocationUpdate(BaseModel):
    user_id: Optional[str] = None
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    bearing: Optional[float] = None
    timestamp: Optional[str] = None
    isBackground: bool = False


@router.post("/family/location/update")
async def update_location(data: LocationUpdate, request: Request):
    """Receive periodic location heartbeat from device"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    now = datetime.now(timezone.utc).isoformat()
    
    location_doc = {
        "user_id": user.user_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "altitude": data.altitude,
        "speed": data.speed,
        "bearing": data.bearing,
        "timestamp": data.timestamp or now,
        "is_background": data.isBackground,
        "updated_at": now
    }
    
    # Update latest location in user profile
    await _db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "last_location": location_doc,
            "last_location_at": now
        }}
    )
    
    # Store in location history (keep last 100 per user)
    await _db.location_history.insert_one(location_doc)
    count = await _db.location_history.count_documents({"user_id": user.user_id})
    if count > 100:
        oldest = await _db.location_history.find(
            {"user_id": user.user_id}
        ).sort("timestamp", 1).limit(count - 100).to_list(count - 100)
        if oldest:
            ids = [doc["_id"] for doc in oldest]
            await _db.location_history.delete_many({"_id": {"$in": ids}})
    
    return {"success": True}


@router.get("/family/member/{member_id}/location")
async def get_member_location(member_id: str, request: Request):
    """Get last known location of a family member and notify the parent"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    member_user = await _db.users.find_one(
        {"user_id": member_id},
        {"_id": 0, "last_location": 1, "last_location_at": 1, "name": 1, "email": 1}
    )
    
    if not member_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    location = member_user.get("last_location")
    if not location:
        return {"found": False, "message": "No hay ubicación disponible para este usuario"}
    
    # Create push notification for the requesting parent
    now = datetime.now(timezone.utc).isoformat()
    notification = {
        "user_id": user.user_id,
        "type": "location_request_success",
        "title": "Ubicación recibida",
        "message": f"La ubicación de {member_user.get('name', 'familiar')} ha sido recibida correctamente. GPS activo{'(segundo plano)' if location.get('is_background') else ''}.",
        "data": {
            "member_id": member_id,
            "member_name": member_user.get("name", ""),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "maps_url": f"https://maps.google.com/?q={location.get('latitude')},{location.get('longitude')}",
            "is_background": location.get("is_background", False)
        },
        "read": False,
        "created_at": now
    }
    await _db.notifications.insert_one(notification)
    
    return {
        "found": True,
        "name": member_user.get("name", ""),
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "accuracy": location.get("accuracy"),
        "is_background": location.get("is_background", False),
        "last_updated": member_user.get("last_location_at"),
        "maps_url": f"https://maps.google.com/?q={location.get('latitude')},{location.get('longitude')}"
    }


class LocationRequestNotify(BaseModel):
    target_user_id: str


@router.post("/family/request-location")
async def request_family_location(data: LocationRequestNotify, request: Request):
    """
    Parent requests a child's location.
    Creates notification for parent confirming request was sent.
    Returns latest known location + stores the request in audit log.
    """
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Get target user's last location
    target = await _db.users.find_one(
        {"user_id": data.target_user_id},
        {"_id": 0, "last_location": 1, "last_location_at": 1, "name": 1, "location_locked": 1, "background_tracking_active": 1}
    )
    
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    location = target.get("last_location")
    target_name = target.get("name", "familiar")
    tracking_active = target.get("background_tracking_active", False)
    locked = target.get("location_locked", False)
    
    # Audit log the request
    await _db.audit_logs.insert_one({
        "action": "location_request",
        "requester_id": user.user_id,
        "target_user_id": data.target_user_id,
        "timestamp": now,
        "location_found": location is not None,
        "tracking_active": tracking_active,
        "location_locked": locked
    })
    
    # Notification for the requesting parent
    if location:
        maps_url = f"https://maps.google.com/?q={location.get('latitude')},{location.get('longitude')}"
        notif = {
            "user_id": user.user_id,
            "type": "location_found",
            "title": f"Ubicación de {target_name}",
            "message": f"{target_name} localizado/a correctamente. GPS {'en segundo plano' if location.get('is_background') else 'activo'}. Pulsa para ver en el mapa.",
            "data": {
                "member_id": data.target_user_id,
                "member_name": target_name,
                "latitude": location.get("latitude"),
                "longitude": location.get("longitude"),
                "maps_url": maps_url,
                "is_background": location.get("is_background", False),
                "tracking_active": tracking_active,
                "location_locked": locked
            },
            "read": False,
            "created_at": now
        }
        await _db.notifications.insert_one(notif)
        
        return {
            "success": True,
            "found": True,
            "name": target_name,
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "accuracy": location.get("accuracy"),
            "maps_url": maps_url,
            "is_background": location.get("is_background", False),
            "tracking_active": tracking_active,
            "location_locked": locked,
            "last_updated": target.get("last_location_at"),
            "notification_sent": True
        }
    else:
        notif = {
            "user_id": user.user_id,
            "type": "location_not_found",
            "title": f"Ubicación de {target_name} no disponible",
            "message": f"No se pudo obtener la ubicación de {target_name}. {'El GPS en segundo plano está activo, se recibirá pronto.' if tracking_active else 'El GPS no está activado.'}",
            "data": {
                "member_id": data.target_user_id,
                "member_name": target_name,
                "tracking_active": tracking_active
            },
            "read": False,
            "created_at": now
        }
        await _db.notifications.insert_one(notif)
        
        return {
            "success": True,
            "found": False,
            "name": target_name,
            "tracking_active": tracking_active,
            "message": f"No hay ubicación disponible para {target_name}" + (" pero el GPS en segundo plano está activo." if tracking_active else ". Pide que active el GPS."),
            "notification_sent": True
        }


@router.get("/notifications")
async def get_notifications(request: Request):
    """Get user's push notifications (location requests, etc.)"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    notifications = await _db.notifications.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    unread = sum(1 for n in notifications if not n.get("read"))
    
    return {"notifications": notifications, "unread_count": unread}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(request: Request):
    """Mark all notifications as read"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    await _db.notifications.update_many(
        {"user_id": user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"success": True}


# ========================================
# PDF GENERATION
# ========================================

def _create_welcome_pdf(order_data: dict) -> BytesIO:
    """Generate Welcome PDF after purchase"""
    from fpdf import FPDF
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Header - Green gradient bar
    pdf.set_fill_color(16, 185, 129)
    pdf.rect(0, 0, 210, 40, 'F')
    pdf.set_fill_color(5, 150, 105)
    pdf.rect(0, 35, 210, 5, 'F')
    
    # Logo text
    pdf.set_font("Helvetica", 'B', 28)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(15, 8)
    pdf.cell(0, 12, "ManoProtect", align='L')
    pdf.set_font("Helvetica", '', 12)
    pdf.set_xy(15, 22)
    pdf.cell(0, 8, "Proteccion familiar inteligente", align='L')
    
    # Welcome title
    pdf.set_text_color(17, 24, 39)
    pdf.set_font("Helvetica", 'B', 22)
    pdf.set_xy(15, 55)
    pdf.cell(0, 10, "Bienvenido/a a ManoProtect!", align='C')
    
    pdf.set_font("Helvetica", '', 12)
    pdf.set_text_color(75, 85, 99)
    pdf.set_xy(15, 70)
    pdf.multi_cell(180, 6, "Gracias por confiar en nosotros para la seguridad de tu familia. Tu dispositivo esta siendo preparado con el maximo cuidado.", align='C')
    
    # Order details box
    pdf.set_xy(15, 90)
    pdf.set_fill_color(243, 244, 246)
    pdf.set_draw_color(209, 213, 219)
    pdf.rect(15, 90, 180, 50, 'DF')
    
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.set_xy(20, 95)
    pdf.cell(0, 8, "Detalles de tu pedido")
    
    pdf.set_font("Helvetica", '', 11)
    pdf.set_text_color(55, 65, 81)
    y = 107
    details = [
        ("Producto:", order_data.get("product_name", "Sentinel X")),
        ("Plan:", order_data.get("plan_name", "Plan Familiar ManoProtect")),
        ("N. Pedido:", order_data.get("order_number", "MP-XXXXXXXX")),
        ("Email:", order_data.get("email", "")),
    ]
    for label, value in details:
        pdf.set_xy(25, y)
        pdf.set_font("Helvetica", 'B', 10)
        pdf.cell(40, 6, label)
        pdf.set_font("Helvetica", '', 10)
        pdf.cell(0, 6, str(value))
        y += 7
    
    # Setup steps
    pdf.set_xy(15, 150)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 10, "Pasos para configurar tu dispositivo:")
    
    steps = [
        "1. Descarga la app ManoProtect desde Google Play o App Store",
        "2. Crea una cuenta o inicia sesion con tu email",
        "3. Ve a Modo Familiar y pulsa 'Activar proteccion GPS'",
        "4. Concede TODOS los permisos de ubicacion (incluido 'Siempre')",
        "5. En Android: desactiva la optimizacion de bateria para ManoProtect",
        "6. Anade tus contactos de emergencia",
        "7. Prueba el boton SOS para verificar que funciona",
    ]
    
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(55, 65, 81)
    y = 165
    for step in steps:
        pdf.set_xy(20, y)
        pdf.multi_cell(170, 6, step)
        y += 9
    
    # Important note
    pdf.set_xy(15, y + 5)
    pdf.set_fill_color(254, 243, 199)
    pdf.set_draw_color(252, 211, 77)
    pdf.rect(15, y + 5, 180, 25, 'DF')
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_text_color(146, 64, 14)
    pdf.set_xy(20, y + 8)
    pdf.cell(0, 6, "IMPORTANTE:")
    pdf.set_font("Helvetica", '', 9)
    pdf.set_xy(20, y + 16)
    pdf.multi_cell(170, 5, "Los permisos de ubicacion se bloquearan automaticamente despues de la configuracion inicial para la seguridad del usuario. Solo se pueden modificar contactando con ManoProtect.")
    
    # Contact info
    y_contact = y + 40
    pdf.set_xy(15, y_contact)
    pdf.set_font("Helvetica", 'B', 12)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 8, "Contacto y soporte:")
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(55, 65, 81)
    pdf.set_xy(20, y_contact + 10)
    pdf.cell(0, 6, "Web: www.manoprotect.com")
    pdf.set_xy(20, y_contact + 17)
    pdf.cell(0, 6, "Email: soporte@manoprotect.com")
    pdf.set_xy(20, y_contact + 24)
    pdf.cell(0, 6, "WhatsApp: +34 XXX XXX XXX")
    
    # Footer
    pdf.set_xy(0, 280)
    pdf.set_font("Helvetica", '', 8)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(210, 5, f"ManoProtect - Documento generado el {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC", align='C')
    
    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    return buffer


def _create_setup_complete_pdf(user_data: dict) -> BytesIO:
    """Generate Setup Complete / Thank You PDF after device configuration"""
    from fpdf import FPDF
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Header
    pdf.set_fill_color(6, 182, 212)
    pdf.rect(0, 0, 210, 40, 'F')
    pdf.set_fill_color(8, 145, 178)
    pdf.rect(0, 35, 210, 5, 'F')
    
    pdf.set_font("Helvetica", 'B', 28)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(15, 8)
    pdf.cell(0, 12, "ManoProtect", align='L')
    pdf.set_font("Helvetica", '', 12)
    pdf.set_xy(15, 22)
    pdf.cell(0, 8, "Configuracion completada con exito", align='L')
    
    # Congrats
    pdf.set_text_color(17, 24, 39)
    pdf.set_font("Helvetica", 'B', 22)
    pdf.set_xy(15, 55)
    pdf.cell(0, 10, "Felicidades, tu familia esta protegida!", align='C')
    
    pdf.set_font("Helvetica", '', 12)
    pdf.set_text_color(75, 85, 99)
    pdf.set_xy(15, 70)
    pdf.multi_cell(180, 6, f"Hola {user_data.get('name', '')}! Tu dispositivo {user_data.get('product_name', 'Sentinel')} ha sido configurado correctamente. La proteccion GPS en segundo plano esta activa.", align='C')
    
    # Protection status box
    pdf.set_xy(15, 95)
    pdf.set_fill_color(236, 253, 245)
    pdf.set_draw_color(52, 211, 153)
    pdf.rect(15, 95, 180, 55, 'DF')
    
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(6, 95, 70)
    pdf.set_xy(20, 100)
    pdf.cell(0, 8, "Estado de proteccion: ACTIVA")
    
    protections = [
        "GPS en segundo plano: Activo (funciona con app cerrada)",
        "Boton SOS: Configurado y listo",
        "Contactos de emergencia: Configurados",
        "Ubicacion bloqueada: Activada (no modificable por el usuario)",
        "Optimizacion bateria: Desactivada para ManoProtect",
    ]
    
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(21, 128, 61)
    y = 112
    for p in protections:
        pdf.set_xy(25, y)
        pdf.cell(0, 6, f"  {p}")
        y += 7
    
    # What happens now
    y = 160
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(17, 24, 39)
    pdf.set_xy(15, y)
    pdf.cell(0, 10, "Que sucede ahora?")
    
    items = [
        "Tu familia puede localizarte en caso de emergencia, incluso con el telefono bloqueado",
        "El boton SOS envia tu ubicacion GPS exacta a todos tus contactos de emergencia",
        "La ubicacion se actualiza automaticamente cada 5 minutos (heartbeat)",
        "Los permisos de ubicacion estan bloqueados y no se pueden desactivar accidentalmente",
        "Para cualquier cambio en la configuracion, contacta con ManoProtect",
    ]
    
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(55, 65, 81)
    y += 12
    for item in items:
        pdf.set_xy(20, y)
        pdf.multi_cell(170, 5, f"  {item}")
        y += 10
    
    # Contact
    y += 5
    pdf.set_xy(15, y)
    pdf.set_fill_color(239, 246, 255)
    pdf.set_draw_color(96, 165, 250)
    pdf.rect(15, y, 180, 30, 'DF')
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(30, 64, 175)
    pdf.set_xy(20, y + 5)
    pdf.cell(0, 6, "Necesitas ayuda?")
    pdf.set_font("Helvetica", '', 10)
    pdf.set_text_color(55, 65, 81)
    pdf.set_xy(20, y + 13)
    pdf.cell(0, 6, "Web: www.manoprotect.com | Email: soporte@manoprotect.com")
    pdf.set_xy(20, y + 20)
    pdf.cell(0, 6, "Para desbloquear configuracion: contactar con verificacion de DNI")
    
    # Footer
    pdf.set_xy(0, 280)
    pdf.set_font("Helvetica", '', 8)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(210, 5, f"ManoProtect - {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC", align='C')
    
    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    return buffer


@router.get("/documents/welcome-pdf")
async def generate_welcome_pdf(request: Request):
    """Generate welcome PDF for the user's latest order"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    # Get user's latest order
    order = await _db.sentinel_x_preorders.find_one(
        {"customer_email": user.email},
        {"_id": 0}
    )
    
    order_data = {
        "product_name": order.get("product", "Sentinel X") if order else "Sentinel X",
        "plan_name": f"Plan Familiar ({order.get('subscription_plan', 'Mensual')})" if order else "Plan Familiar",
        "order_number": f"MP-{order.get('session_id', 'XXXXXXXX')[-8:].upper()}" if order else "MP-NUEVO",
        "email": user.email,
        "name": user.name if hasattr(user, 'name') else ""
    }
    
    pdf_buffer = _create_welcome_pdf(order_data)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ManoProtect_Bienvenida_{order_data['order_number']}.pdf"}
    )


@router.get("/documents/setup-complete-pdf")
async def generate_setup_complete_pdf(request: Request):
    """Generate setup completion / thank you PDF"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    order = await _db.sentinel_x_preorders.find_one(
        {"customer_email": user.email},
        {"_id": 0}
    )
    
    user_data = {
        "name": order.get("customer_name", "") if order else "",
        "product_name": order.get("product", "Sentinel X") if order else "Sentinel X",
        "email": user.email
    }
    
    pdf_buffer = _create_setup_complete_pdf(user_data)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ManoProtect_Configuracion_Completada.pdf"}
    )


@router.get("/documents/whatsapp-share/{doc_type}")
async def get_whatsapp_share_link(doc_type: str, request: Request):
    """Generate WhatsApp share link for welcome or setup-complete documents"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    host = request.headers.get("origin", "https://manoprotect.com")
    
    if doc_type == "welcome":
        text = (
            f"Hola! Ya tengo mi dispositivo ManoProtect Sentinel. "
            f"Descarga tu PDF de bienvenida aqui: {host}/api/documents/welcome-pdf "
            f"Mas info en www.manoprotect.com"
        )
    elif doc_type == "setup-complete":
        text = (
            f"Mi ManoProtect ya esta configurado! "
            f"GPS en segundo plano activo, boton SOS listo. "
            f"Mi familia esta protegida. Mas info: www.manoprotect.com"
        )
    else:
        raise HTTPException(status_code=400, detail="Tipo de documento no valido")
    
    import urllib.parse
    whatsapp_url = f"https://wa.me/?text={urllib.parse.quote(text)}"
    
    return {"whatsapp_url": whatsapp_url, "text": text}
