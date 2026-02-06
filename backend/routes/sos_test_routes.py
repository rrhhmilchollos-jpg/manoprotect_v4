"""
ENDPOINT DE PRUEBA SOS - ManoProtect
Permite probar el flujo completo de alertas sin afectar a usuarios reales
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/sos-test", tags=["SOS Test"])

# Store test alerts in memory
test_alerts = {}

class TestSOSRequest(BaseModel):
    sender_name: str = "Usuario Prueba"
    sender_email: str = "test@manoprotect.com"
    latitude: float = 40.4168  # Madrid
    longitude: float = -3.7038
    message: Optional[str] = "Esto es una prueba del sistema SOS"
    # Si se proporciona, envía a este número real (para testing)
    test_phone: Optional[str] = None
    # Si se proporciona, envía push a este token
    test_fcm_token: Optional[str] = None

class AcknowledgeRequest(BaseModel):
    alert_id: str
    acknowledged_by: str = "Familiar Prueba"

@router.post("/send-alert")
async def test_send_sos_alert(request: TestSOSRequest):
    """
    Simula el envío de una alerta SOS.
    NO envía mensajes reales a menos que se proporcione test_phone o test_fcm_token.
    """
    alert_id = f"test_sos_{uuid.uuid4().hex[:8]}"
    
    alert_data = {
        "alert_id": alert_id,
        "sender_name": request.sender_name,
        "sender_email": request.sender_email,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "message": request.message,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "acknowledged": False,
        "acknowledged_by": None
    }
    
    # Store in memory
    test_alerts[alert_id] = alert_data
    
    result = {
        "success": True,
        "alert_id": alert_id,
        "alert_data": alert_data,
        "channels": {
            "push_sent": False,
            "sms_sent": False
        },
        "message": "Alerta de prueba creada (sin envío real)"
    }
    
    # Si se proporciona FCM token, enviar push real
    if request.test_fcm_token:
        try:
            from services.emergency_notifications import send_sos_critical_alert
            fcm_result = await send_sos_critical_alert(
                fcm_tokens=[request.test_fcm_token],
                alert_id=alert_id,
                sender_name=request.sender_name,
                sender_email=request.sender_email,
                latitude=request.latitude,
                longitude=request.longitude,
                message=request.message
            )
            result["channels"]["push_sent"] = fcm_result.get("success", 0) > 0
            result["channels"]["push_result"] = fcm_result
        except Exception as e:
            result["channels"]["push_error"] = str(e)
    
    # Si se proporciona teléfono, enviar SMS real
    if request.test_phone:
        try:
            from services.infobip_sms import send_sos_alert
            location_url = f"https://maps.google.com/?q={request.latitude},{request.longitude}"
            sms_result = await send_sos_alert(
                phone_number=request.test_phone,
                sender_name=request.sender_name,
                location_url=location_url,
                message=request.message
            )
            result["channels"]["sms_sent"] = sms_result.get("success", False)
            result["channels"]["sms_result"] = sms_result
        except Exception as e:
            result["channels"]["sms_error"] = str(e)
    
    return result

@router.post("/acknowledge")
async def test_acknowledge_alert(request: AcknowledgeRequest):
    """
    Simula que un familiar confirma haber visto la alerta.
    """
    if request.alert_id not in test_alerts:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    alert = test_alerts[request.alert_id]
    
    if alert["acknowledged"]:
        return {
            "success": False,
            "message": f"Alerta ya fue confirmada por {alert['acknowledged_by']}"
        }
    
    # Mark as acknowledged
    alert["acknowledged"] = True
    alert["acknowledged_by"] = request.acknowledged_by
    alert["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
    alert["status"] = "resolved"
    
    return {
        "success": True,
        "alert_id": request.alert_id,
        "acknowledged_by": request.acknowledged_by,
        "message": f"Alerta confirmada. {request.acknowledged_by} está atendiendo.",
        "alert_data": alert
    }

@router.get("/alerts")
async def get_test_alerts():
    """
    Lista todas las alertas de prueba activas.
    """
    return {
        "total": len(test_alerts),
        "alerts": list(test_alerts.values())
    }

@router.get("/alerts/{alert_id}")
async def get_test_alert(alert_id: str):
    """
    Obtiene el estado de una alerta específica.
    """
    if alert_id not in test_alerts:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return test_alerts[alert_id]

@router.delete("/alerts")
async def clear_test_alerts():
    """
    Limpia todas las alertas de prueba.
    """
    count = len(test_alerts)
    test_alerts.clear()
    return {"success": True, "cleared": count}

@router.get("/simulate-flow")
async def simulate_complete_flow():
    """
    Simula el flujo completo SOS sin enviar mensajes reales.
    Útil para entender cómo funciona el sistema.
    """
    # 1. Crear alerta
    alert_id = f"demo_{uuid.uuid4().hex[:6]}"
    
    flow = {
        "step_1_user_activates": {
            "action": "Usuario pulsa botón SOS",
            "result": {
                "alert_id": alert_id,
                "location": {"lat": 40.4168, "lng": -3.7038},
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        },
        "step_2_server_processes": {
            "action": "Servidor registra emergencia",
            "channels": [
                "Firebase Push (alta prioridad)",
                "SMS via Infobip (backup)"
            ],
            "message_sent": {
                "title": "Aviso de Usuario Prueba",
                "body": "Usuario Prueba te necesita",
                "disclaimer": "Este es un aviso personal, no oficial"
            }
        },
        "step_3_family_receives": {
            "action": "Familiares reciben notificación",
            "devices": ["Móvil A", "Móvil B", "Móvil C"],
            "ui_shown": "Pantalla con mapa y botón ENTERADO"
        },
        "step_4_family_acknowledges": {
            "action": "Un familiar pulsa ENTERADO",
            "acknowledged_by": "Familiar B",
            "result": "Notificación a todos: 'Familiar B está atendiendo'"
        },
        "step_5_alert_resolved": {
            "action": "Alerta marcada como resuelta",
            "notifications_stopped": True,
            "user_notified": "Tu familiar está en camino"
        }
    }
    
    return {
        "title": "Flujo Completo SOS - Simulación",
        "note": "Este es un ejemplo del flujo, no se enviaron mensajes reales",
        "flow": flow
    }
