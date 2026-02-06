"""
ManoProtect Fraud API - Endpoints compartidos para integración con ManoBank
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/fraud", tags=["Fraud API"])

_db = None

def init_fraud_routes(db):
    global _db
    _db = db

# Models
class FraudCheckRequest(BaseModel):
    type: str  # login, registration, transfer
    email: Optional[str] = None
    dni: Optional[str] = None
    phone: Optional[str] = None
    user_id: Optional[str] = None
    amount: Optional[float] = None
    destination_iban: Optional[str] = None
    destination_name: Optional[str] = None

class FraudReport(BaseModel):
    type: str
    email: Optional[str] = None
    user_id: Optional[str] = None
    amount: Optional[float] = None
    destination: Optional[str] = None
    reason: Optional[str] = None
    timestamp: Optional[str] = None

# ============================================
# PUBLIC ENDPOINTS (for ManoBank integration)
# ============================================

@router.post("/check")
async def check_fraud(data: FraudCheckRequest):
    """
    Verifica si una operación es potencialmente fraudulenta.
    Usado por ManoBank para verificar transacciones.
    """
    risk_score = 0
    reasons = []
    
    # Check email against known scammers
    if data.email and _db is not None:
        scammer = await _db.known_scammers.find_one({
            "email": data.email.lower()
        })
        if scammer:
            risk_score += 100
            reasons.append(f"Email en lista de estafadores conocidos")
    
    # Check phone against known scammers
    if data.phone and _db is not None:
        scammer = await _db.known_scammers.find_one({
            "phone": data.phone
        })
        if scammer:
            risk_score += 80
            reasons.append(f"Teléfono reportado como fraudulento")
    
    # Check DNI
    if data.dni and _db is not None:
        scammer = await _db.known_scammers.find_one({
            "dni": data.dni.upper()
        })
        if scammer:
            risk_score += 100
            reasons.append(f"DNI en lista de estafadores")
    
    # Check destination IBAN for transfers
    if data.destination_iban and _db is not None:
        flagged_iban = await _db.flagged_ibans.find_one({
            "iban": data.destination_iban.replace(" ", "").upper()
        })
        if flagged_iban:
            risk_score += 90
            reasons.append(f"IBAN destino marcado como sospechoso")
    
    # Check for unusual amounts
    if data.amount:
        if data.amount > 5000:
            risk_score += 20
            reasons.append("Importe elevado")
        if data.amount > 10000:
            risk_score += 30
            reasons.append("Importe muy elevado - requiere verificación adicional")
    
    # Cap risk score at 100
    risk_score = min(risk_score, 100)
    
    return {
        "is_fraud": risk_score >= 80,
        "risk_score": risk_score,
        "reasons": reasons,
        "reason": reasons[0] if reasons else None,
        "recommendation": "block" if risk_score >= 80 else "review" if risk_score >= 50 else "allow"
    }

@router.post("/report")
async def report_fraud(data: FraudReport):
    """
    Reporta actividad sospechosa desde ManoBank.
    """
    if _db is None:
        return {"message": "Reporte recibido (DB no disponible)"}
    
    report = {
        "report_id": f"fr_{uuid.uuid4().hex[:12]}",
        "type": data.type,
        "email": data.email,
        "user_id": data.user_id,
        "amount": data.amount,
        "destination": data.destination,
        "reason": data.reason,
        "source": "manobank",
        "status": "pending_review",
        "created_at": data.timestamp or datetime.now(timezone.utc).isoformat()
    }
    
    await _db.fraud_reports.insert_one(report)
    
    return {
        "message": "Reporte recibido correctamente",
        "report_id": report["report_id"]
    }

@router.get("/alerts/{user_id}")
async def get_user_alerts(user_id: str):
    """
    Obtiene alertas de fraude para un usuario específico.
    """
    if _db is None:
        return {"alerts": []}
    
    # Get recent fraud alerts related to this user
    alerts = await _db.fraud_alerts.find({
        "$or": [
            {"user_id": user_id},
            {"affected_users": user_id}
        ],
        "is_active": True
    }, {"_id": 0}).sort("created_at", -1).to_list(10)
    
    return {"alerts": alerts}

@router.get("/public/scam-stats")
async def get_scam_stats():
    """
    Estadísticas públicas de estafas detectadas.
    Solo datos REALES - sin números inflados para cumplir Google Play.
    """
    if _db is None:
        return {
            "total_reports": 0,
            "phone_scams": 0,
            "email_scams": 0,
            "verified": 0
        }
    
    try:
        # Count REAL data only
        total_reports = await _db.fraud_reports.count_documents({})
        public_reports = await _db.public_fraud_reports.count_documents({})
        
        phone_scams = await _db.known_scammers.count_documents({"phone": {"$exists": True, "$ne": None}})
        phone_reports = await _db.public_fraud_reports.count_documents({"type": "phone"})
        
        email_scams = await _db.known_scammers.count_documents({"email": {"$exists": True, "$ne": None}})
        email_reports = await _db.public_fraud_reports.count_documents({"type": "email"})
        
        verified = await _db.known_scammers.count_documents({})
        
        return {
            "total_reports": total_reports + public_reports,
            "phone_scams": phone_scams + phone_reports,
            "email_scams": email_scams + email_reports,
            "verified": verified
        }
    except Exception as e:
        print(f"Error getting scam stats: {e}")
        return {
            "total_reports": 0,
            "phone_scams": 0,
            "email_scams": 0,
            "verified": 0
        }

@router.get("/public/verify-scam")
async def verify_scam(value: str, type: str = "phone"):
    """
    Verifica si un número de teléfono o email está en la base de datos de estafadores.
    Returns fields expected by VerificarEstafa.js frontend.
    """
    # Clean input
    clean_value = value.strip()
    if type == "phone":
        clean_value = clean_value.replace(" ", "").replace("-", "")
    elif type == "email":
        clean_value = clean_value.lower()
    
    scammer = None
    public_reports = 0
    
    if _db is not None:
        try:
            query = {}
            if type == "phone":
                query = {"phone": clean_value}
            elif type == "email":
                query = {"email": clean_value}
            
            scammer = await _db.known_scammers.find_one(query, {"_id": 0})
            
            # Also check public reports
            public_query = {"value": clean_value, "type": type}
            public_reports = await _db.public_fraud_reports.count_documents(public_query)
        except Exception as e:
            print(f"Error checking scam: {e}")
    
    if scammer or public_reports > 0:
        report_count = (scammer.get("report_count", 0) if scammer else 0) + public_reports
        category = scammer.get("category", "phishing") if scammer else "sospechoso"
        
        # Determine severity based on report count
        if report_count >= 10:
            severity = "critical"
        elif report_count >= 5:
            severity = "high"
        elif report_count >= 2:
            severity = "medium"
        else:
            severity = "low"
        
        return {
            "is_scam": True,
            "warning": f"Este {'número' if type == 'phone' else 'email'} ha sido reportado como fraudulento por {report_count} usuario(s)",
            "category": category,
            "severity": severity,
            "report_count": report_count,
            "advice": [
                "No respondas a llamadas ni mensajes de este contacto",
                "Bloquea este número/email en tu dispositivo",
                "Si ya compartiste datos personales, contacta con tu banco inmediatamente",
                "Reporta el incidente a la Policía Nacional o Guardia Civil"
            ]
        }
    
    return {
        "is_scam": False,
        "message": f"No hemos encontrado reportes de fraude para este {'número' if type == 'phone' else 'email'}",
        "disclaimer": "Esto no garantiza que sea seguro. Siempre mantén precaución con contactos desconocidos.",
        "tips": [
            "No compartas datos bancarios ni contraseñas por teléfono o email",
            "Desconfía de ofertas demasiado buenas para ser verdad",
            "Verifica siempre la identidad del remitente antes de actuar",
            "Si tienes dudas, contacta directamente con la entidad oficial"
        ]
    }

@router.post("/public/report-scam")
async def public_report_scam(request: Request):
    """
    Permite a usuarios reportar estafas públicamente.
    """
    body = await request.json()
    
    report = {
        "report_id": f"pub_{uuid.uuid4().hex[:12]}",
        "value": body.get("value"),
        "type": body.get("type", "phone"),
        "category": body.get("category", "other"),
        "description": body.get("description"),
        "reporter_email": body.get("reporter_email"),
        "source": "public",
        "status": "pending_verification",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if _db is not None:
        try:
            await _db.public_fraud_reports.insert_one(report)
        except Exception as e:
            print(f"Error saving report: {e}")
    
    return {
        "success": True,
        "message": "Gracias por tu reporte. Será revisado por nuestro equipo antifraude.",
        "report_id": report["report_id"]
    }
