"""
ManoProtect - DNA Digital & Advanced Security Routes
Revolutionary cybersecurity API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from datetime import datetime, timedelta
from typing import List, Optional
import hashlib
import secrets
import re
from bson import ObjectId

from models.security_advanced import (
    DNADigitalCreate, DNADigitalResponse, DNADigitalType, DNADigitalStatus,
    DNAVerificationRequest, DNAVerificationResponse,
    TrustSealCreate, TrustSealResponse, TrustSealTier, TrustSealVerifyRequest,
    UniversalVerifyRequest, UniversalVerifyResponse, VerificationType,
    VoiceAnalysisRequest, VoiceAnalysisResponse, ManipulationTactic,
    DeepfakeAnalysisRequest, DeepfakeAnalysisResponse,
    VaultItemCreate, VaultItemResponse, InheritanceConfig,
    PanicModeConfig, PanicAlertResponse, PanicTriggerType,
    SmartZoneCreate, BehaviorPattern, SmartZoneType,
    PhishingSimulationCreate, PhishingSimulationResult,
    TransactionVerifyRequest, TransactionVerifyResponse,
    ScamPrediction, ScamAlertCreate
)

router = APIRouter(prefix="/api/shield", tags=["ManoProtect Shield"])

# Database reference (will be set from server.py)
db = None

def set_database(database):
    global db
    db = database

def generate_dna_code():
    """Generate unique DNA Digital code"""
    random_part = secrets.token_hex(4).upper()
    return f"MP-DNA-{random_part}"

def generate_seal_code():
    """Generate unique Trust Seal code"""
    random_part = secrets.token_hex(6).upper()
    return f"SEAL-{random_part}"

# ============================================
# DNA DIGITAL ENDPOINTS
# ============================================

@router.post("/dna/register", response_model=DNADigitalResponse)
async def register_dna_digital(data: DNADigitalCreate):
    """Register a new DNA Digital identity"""
    
    # Check if already exists
    existing = await db.dna_digital.find_one({
        "$or": [
            {"email": data.email},
            {"phone": data.phone} if data.phone else {"_id": None}
        ]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="DNA Digital already exists for this email/phone")
    
    dna_code = generate_dna_code()
    
    dna_record = {
        "dna_code": dna_code,
        "owner_name": data.owner_name,
        "owner_type": data.owner_type,
        "email": data.email,
        "phone": data.phone,
        "company_name": data.company_name,
        "company_cif": data.company_cif,
        "website": data.website,
        "status": DNADigitalStatus.PENDING,
        "trust_score": 50,  # Start at 50
        "created_at": datetime.utcnow(),
        "verified_at": None,
        "verification_count": 0,
        "last_verified": None
    }
    
    result = await db.dna_digital.insert_one(dna_record)
    dna_record["id"] = str(result.inserted_id)
    
    return DNADigitalResponse(**dna_record)

@router.post("/dna/verify", response_model=DNAVerificationResponse)
async def verify_dna_digital(data: DNAVerificationRequest):
    """Verify if a contact (phone/email/website) has valid DNA Digital"""
    
    query = {}
    if data.dna_code:
        query["dna_code"] = data.dna_code
    elif data.phone:
        query["phone"] = data.phone
    elif data.email:
        query["email"] = data.email.lower()
    elif data.website:
        # Normalize website
        website = data.website.lower().replace("https://", "").replace("http://", "").rstrip("/")
        query["website"] = {"$regex": website, "$options": "i"}
    else:
        raise HTTPException(status_code=400, detail="Provide dna_code, phone, email, or website")
    
    dna_record = await db.dna_digital.find_one(query)
    
    if not dna_record:
        # Check if it's a known scammer
        scam_record = await db.scam_reports.find_one({
            "$or": [
                {"phone": data.phone} if data.phone else {"_id": None},
                {"email": data.email} if data.email else {"_id": None},
                {"website": data.website} if data.website else {"_id": None}
            ]
        })
        
        warning = None
        if scam_record:
            warning = f"⚠️ ALERTA: Este contacto ha sido reportado como FRAUDULENTO {scam_record.get('report_count', 1)} veces"
        
        return DNAVerificationResponse(
            verified=False,
            is_legitimate=False,
            warning_message=warning or "No se encontró DNA Digital verificado para este contacto",
            verification_timestamp=datetime.utcnow()
        )
    
    # Update verification count
    await db.dna_digital.update_one(
        {"_id": dna_record["_id"]},
        {
            "$inc": {"verification_count": 1},
            "$set": {"last_verified": datetime.utcnow()}
        }
    )
    
    is_verified = dna_record.get("status") == DNADigitalStatus.VERIFIED
    
    return DNAVerificationResponse(
        verified=is_verified,
        dna_code=dna_record.get("dna_code"),
        owner_name=dna_record.get("owner_name"),
        owner_type=dna_record.get("owner_type"),
        trust_score=dna_record.get("trust_score", 0),
        is_legitimate=is_verified,
        warning_message=None if is_verified else "DNA Digital pendiente de verificación",
        verification_timestamp=datetime.utcnow()
    )

@router.get("/dna/{dna_code}", response_model=DNADigitalResponse)
async def get_dna_digital(dna_code: str):
    """Get DNA Digital details by code"""
    
    dna_record = await db.dna_digital.find_one({"dna_code": dna_code})
    
    if not dna_record:
        raise HTTPException(status_code=404, detail="DNA Digital not found")
    
    dna_record["id"] = str(dna_record["_id"])
    return DNADigitalResponse(**dna_record)

# ============================================
# TRUST SEAL ENDPOINTS
# ============================================

@router.post("/seal/create", response_model=TrustSealResponse)
async def create_trust_seal(data: TrustSealCreate):
    """Create a Trust Seal for a business"""
    
    # Check if website already has a seal
    existing = await db.trust_seals.find_one({"website": {"$regex": data.website, "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="This website already has a Trust Seal")
    
    seal_code = generate_seal_code()
    verification_url = f"https://manoprotect.com/verify/{seal_code}"
    
    # Generate embed code
    embed_code = f'''<!-- ManoProtect Trust Seal -->
<div id="manoprotect-seal-{seal_code}"></div>
<script src="https://manoprotect.com/seal.js" data-seal="{seal_code}"></script>'''
    
    seal_record = {
        "seal_code": seal_code,
        "business_name": data.business_name,
        "business_cif": data.business_cif,
        "website": data.website,
        "email": data.email,
        "phone": data.phone,
        "tier": data.tier,
        "trust_score": 70,  # Start at 70 for businesses
        "verified": False,
        "issued_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=365),
        "embed_code": embed_code,
        "verification_url": verification_url,
        "monthly_verifications": 0
    }
    
    result = await db.trust_seals.insert_one(seal_record)
    seal_record["id"] = str(result.inserted_id)
    
    return TrustSealResponse(**seal_record)

@router.post("/seal/verify")
async def verify_trust_seal(data: TrustSealVerifyRequest):
    """Verify a Trust Seal (called when users check a website)"""
    
    seal = await db.trust_seals.find_one({"seal_code": data.seal_code})
    
    if not seal:
        return {
            "valid": False,
            "message": "Sello no encontrado - Esta web NO está verificada por ManoProtect"
        }
    
    # Check if expired
    if seal.get("expires_at") and seal["expires_at"] < datetime.utcnow():
        return {
            "valid": False,
            "message": "Sello expirado - La verificación de esta web ha caducado"
        }
    
    # Update verification count
    await db.trust_seals.update_one(
        {"_id": seal["_id"]},
        {"$inc": {"monthly_verifications": 1}}
    )
    
    return {
        "valid": True,
        "verified": seal.get("verified", False),
        "business_name": seal.get("business_name"),
        "tier": seal.get("tier"),
        "trust_score": seal.get("trust_score"),
        "issued_at": seal.get("issued_at"),
        "message": "✅ Empresa verificada por ManoProtect" if seal.get("verified") else "⏳ Verificación en proceso"
    }

@router.get("/seal/{seal_code}")
async def get_seal_badge(seal_code: str):
    """Get seal badge data for embedding"""
    
    seal = await db.trust_seals.find_one({"seal_code": seal_code})
    
    if not seal:
        return {"error": "Seal not found"}
    
    return {
        "seal_code": seal_code,
        "business_name": seal.get("business_name"),
        "verified": seal.get("verified", False),
        "tier": seal.get("tier"),
        "trust_score": seal.get("trust_score"),
        "badge_color": "#10B981" if seal.get("verified") else "#F59E0B"
    }

# ============================================
# UNIVERSAL VERIFIER
# ============================================

@router.post("/verify/universal", response_model=UniversalVerifyResponse)
async def universal_verify(data: UniversalVerifyRequest):
    """Universal verification for URLs, phones, emails, businesses"""
    
    risk_score = 0
    warnings = []
    recommendations = []
    details = {}
    known_reports = 0
    
    content = data.content.strip()
    
    # Check community reports
    scam_reports = await db.scam_reports.find({
        "$or": [
            {"phone": content},
            {"email": content.lower()},
            {"website": {"$regex": content, "$options": "i"}},
            {"content": {"$regex": content[:50], "$options": "i"}}
        ]
    }).to_list(100)
    
    known_reports = len(scam_reports)
    community_warnings = [r.get("description", "Reportado como sospechoso") for r in scam_reports[:3]]
    
    if known_reports > 0:
        risk_score += min(known_reports * 15, 60)
        warnings.append(f"Reportado {known_reports} veces por la comunidad")
    
    # Type-specific checks
    if data.verification_type == VerificationType.URL:
        # URL analysis
        details["url"] = content
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r"login.*bank", r"verify.*account", r"urgent.*action",
            r"\.ru$", r"\.cn$", r"bit\.ly", r"tinyurl",
            r"[0-9]{5,}", r"paypal.*\.(?!com)", r"amazon.*\.(?!com|es)"
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, content.lower()):
                risk_score += 20
                warnings.append(f"Patrón sospechoso detectado")
                break
        
        # Check if has Trust Seal
        seal = await db.trust_seals.find_one({"website": {"$regex": content, "$options": "i"}})
        if seal and seal.get("verified"):
            risk_score = max(0, risk_score - 30)
            details["trust_seal"] = True
            details["business_name"] = seal.get("business_name")
    
    elif data.verification_type == VerificationType.PHONE:
        # Phone analysis
        details["phone"] = content
        
        # Check DNA Digital
        dna = await db.dna_digital.find_one({"phone": content})
        if dna and dna.get("status") == DNADigitalStatus.VERIFIED:
            risk_score = max(0, risk_score - 40)
            details["dna_verified"] = True
            details["owner_name"] = dna.get("owner_name")
        
        # Check if international
        if content.startswith("+") and not content.startswith("+34"):
            risk_score += 10
            warnings.append("Número internacional")
    
    elif data.verification_type == VerificationType.EMAIL:
        # Email analysis
        details["email"] = content.lower()
        
        # Check DNA Digital
        dna = await db.dna_digital.find_one({"email": content.lower()})
        if dna and dna.get("status") == DNADigitalStatus.VERIFIED:
            risk_score = max(0, risk_score - 40)
            details["dna_verified"] = True
            details["owner_name"] = dna.get("owner_name")
        
        # Check suspicious email patterns
        suspicious_email_patterns = [
            r"\.ru$", r"@temp", r"@fake", r"@test",
            r"support.*@(?!.*oficial)", r"banco.*@gmail"
        ]
        
        for pattern in suspicious_email_patterns:
            if re.search(pattern, content.lower()):
                risk_score += 25
                warnings.append("Dominio de email sospechoso")
                break
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "critical"
        recommendations.append("NO interactúes con este contacto")
        recommendations.append("Reporta este contacto en ManoProtect")
    elif risk_score >= 50:
        risk_level = "high"
        recommendations.append("Extrema precaución - verifica por otros medios")
    elif risk_score >= 30:
        risk_level = "medium"
        recommendations.append("Procede con cautela")
    elif risk_score >= 10:
        risk_level = "low"
        recommendations.append("Parece seguro pero mantén la alerta")
    else:
        risk_level = "safe"
        recommendations.append("No se detectaron amenazas")
    
    return UniversalVerifyResponse(
        is_safe=risk_score < 30,
        risk_level=risk_level,
        risk_score=risk_score,
        verification_type=data.verification_type,
        details=details,
        recommendations=recommendations,
        known_reports=known_reports,
        community_warnings=community_warnings
    )

# ============================================
# VOICE SHIELD AI
# ============================================

@router.post("/voice/analyze", response_model=VoiceAnalysisResponse)
async def analyze_voice_call(data: VoiceAnalysisRequest):
    """Analyze a phone call for manipulation tactics"""
    
    detected_tactics = []
    warnings = []
    risk_score = 0
    
    # Analyze transcript for manipulation patterns
    if data.transcript:
        transcript_lower = data.transcript.lower()
        
        # Urgency detection
        urgency_patterns = [
            "urgente", "inmediatamente", "ahora mismo", "últimas horas",
            "caduca hoy", "última oportunidad", "no espere", "actúe ya"
        ]
        if any(p in transcript_lower for p in urgency_patterns):
            detected_tactics.append(ManipulationTactic.URGENCY)
            warnings.append("⚠️ Detectada TÁCTICA DE URGENCIA - No te dejes presionar")
            risk_score += 25
        
        # Authority detection
        authority_patterns = [
            "policía", "hacienda", "banco", "seguridad social",
            "juzgado", "ministerio", "gobierno", "autoridad"
        ]
        if any(p in transcript_lower for p in authority_patterns):
            detected_tactics.append(ManipulationTactic.AUTHORITY)
            warnings.append("⚠️ Se hacen pasar por AUTORIDAD - Verifica llamando tú al número oficial")
            risk_score += 20
        
        # Fear detection
        fear_patterns = [
            "deuda", "embargo", "detención", "multa", "bloqueo",
            "suspender", "cancelar", "demanda", "cárcel"
        ]
        if any(p in transcript_lower for p in fear_patterns):
            detected_tactics.append(ManipulationTactic.FEAR)
            warnings.append("⚠️ Detectada TÁCTICA DE MIEDO - Las entidades oficiales no amenazan por teléfono")
            risk_score += 30
        
        # Data request detection
        data_patterns = [
            "contraseña", "pin", "código", "tarjeta", "cuenta",
            "transferir", "bizum", "verificar datos"
        ]
        if any(p in transcript_lower for p in data_patterns):
            warnings.append("🚨 SOLICITAN DATOS SENSIBLES - NUNCA des datos por teléfono")
            risk_score += 40
        
        # Greed detection
        greed_patterns = [
            "premio", "ganado", "lotería", "herencia", "inversión",
            "rentabilidad", "duplicar", "millón"
        ]
        if any(p in transcript_lower for p in greed_patterns):
            detected_tactics.append(ManipulationTactic.GREED)
            warnings.append("⚠️ Detectada TÁCTICA DE AVARICIA - Si suena demasiado bueno, es estafa")
            risk_score += 25
    
    # Check caller DNA Digital
    caller_verified = False
    caller_dna = None
    
    if data.caller_number:
        dna = await db.dna_digital.find_one({
            "phone": data.caller_number,
            "status": DNADigitalStatus.VERIFIED
        })
        if dna:
            caller_verified = True
            caller_dna = dna.get("dna_code")
            risk_score = max(0, risk_score - 30)
    
    # Determine recommendation
    if risk_score >= 60:
        recommendation = "🚨 CUELGA INMEDIATAMENTE - Muy probable estafa"
    elif risk_score >= 40:
        recommendation = "⚠️ Alta probabilidad de estafa - No proporciones ningún dato"
    elif risk_score >= 20:
        recommendation = "⚡ Procede con cautela - Verifica la identidad del llamante"
    else:
        recommendation = "✅ No se detectaron señales de alarma evidentes"
    
    return VoiceAnalysisResponse(
        is_suspicious=risk_score >= 30,
        risk_score=min(risk_score, 100),
        detected_tactics=detected_tactics,
        warnings=warnings,
        caller_verified=caller_verified,
        caller_dna=caller_dna,
        recommendation=recommendation,
        real_time_alerts=[{"type": "warning", "message": w} for w in warnings]
    )

# ============================================
# TRANSACTION VERIFIER
# ============================================

@router.post("/transaction/verify", response_model=TransactionVerifyResponse)
async def verify_transaction(data: TransactionVerifyRequest):
    """Verify a transaction before execution"""
    
    risk_score = 0
    checks_passed = []
    checks_failed = []
    warnings = []
    
    # Amount check
    if data.amount > 10000:
        risk_score += 15
        warnings.append(f"Transacción de alto valor: {data.amount}€")
    elif data.amount > 1000:
        risk_score += 5
    checks_passed.append("Importe analizado")
    
    # IBAN country check
    if data.recipient_iban:
        iban_country = data.recipient_iban[:2].upper()
        high_risk_countries = ["RU", "NG", "GH", "CI", "BF"]
        medium_risk_countries = ["CN", "IN", "BR", "MX"]
        
        if iban_country in high_risk_countries:
            risk_score += 40
            checks_failed.append(f"País de alto riesgo: {iban_country}")
            warnings.append("⚠️ Destinatario en país de alto riesgo para fraudes")
        elif iban_country in medium_risk_countries:
            risk_score += 15
            warnings.append(f"País de riesgo medio: {iban_country}")
            checks_passed.append("País verificado con precaución")
        else:
            checks_passed.append(f"País verificado: {iban_country}")
    
    # Check recipient in scam database
    if data.recipient_iban:
        scam = await db.scam_reports.find_one({"iban": data.recipient_iban})
        if scam:
            risk_score += 80
            checks_failed.append("IBAN en lista negra de estafadores")
            warnings.append("🚨 ESTE IBAN HA SIDO REPORTADO COMO FRAUDULENTO")
    
    # Check if recipient has DNA Digital
    recipient_verified = False
    recipient_dna = None
    
    if data.recipient_name:
        dna = await db.dna_digital.find_one({
            "owner_name": {"$regex": data.recipient_name, "$options": "i"},
            "status": DNADigitalStatus.VERIFIED
        })
        if dna:
            recipient_verified = True
            recipient_dna = dna.get("dna_code")
            risk_score = max(0, risk_score - 20)
            checks_passed.append("Destinatario verificado con DNA Digital")
    
    # Determine risk level
    if risk_score >= 60:
        risk_level = "critical"
        recommendation = "🚨 NO REALICES ESTA TRANSFERENCIA - Alto riesgo de fraude"
    elif risk_score >= 40:
        risk_level = "high"
        recommendation = "⚠️ Transacción de alto riesgo - Verifica el destinatario por otros medios"
    elif risk_score >= 20:
        risk_level = "medium"
        recommendation = "⚡ Procede con cautela - Confirma los datos del destinatario"
    else:
        risk_level = "safe"
        recommendation = "✅ Transacción aparentemente segura"
    
    return TransactionVerifyResponse(
        is_safe=risk_score < 40,
        risk_level=risk_level,
        risk_score=min(risk_score, 100),
        checks_passed=checks_passed,
        checks_failed=checks_failed,
        warnings=warnings,
        recipient_verified=recipient_verified,
        recipient_dna=recipient_dna,
        recommendation=recommendation
    )

# ============================================
# SCAM REPORTS (Community)
# ============================================

@router.post("/scam/report")
async def report_scam(data: ScamAlertCreate):
    """Report a scam to the community database"""
    
    report = {
        "scam_type": data.scam_type,
        "description": data.description,
        "evidence": data.evidence,
        "contact_info": data.contact_info,
        "amount_lost": data.amount_lost,
        "reported_at": datetime.utcnow(),
        "verified": False,
        "report_count": 1
    }
    
    # Extract phone/email/website from contact_info
    if data.contact_info:
        if "@" in data.contact_info:
            report["email"] = data.contact_info.lower()
        elif data.contact_info.startswith("+") or data.contact_info[0].isdigit():
            report["phone"] = data.contact_info
        elif "." in data.contact_info:
            report["website"] = data.contact_info
    
    # Check if already reported
    existing = await db.scam_reports.find_one({"contact_info": data.contact_info})
    if existing:
        await db.scam_reports.update_one(
            {"_id": existing["_id"]},
            {"$inc": {"report_count": 1}}
        )
        return {"message": "Reporte añadido - Este contacto ya había sido reportado", "total_reports": existing.get("report_count", 1) + 1}
    
    await db.scam_reports.insert_one(report)
    return {"message": "Gracias por tu reporte - Ayudas a proteger a la comunidad", "total_reports": 1}

@router.get("/scam/trending")
async def get_trending_scams():
    """Get trending scam alerts"""
    
    # Get most reported scams in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    scams = await db.scam_reports.find({
        "reported_at": {"$gte": week_ago}
    }).sort("report_count", -1).limit(10).to_list(10)
    
    return {
        "trending_scams": [
            {
                "type": s.get("scam_type"),
                "description": s.get("description"),
                "reports": s.get("report_count", 1),
                "first_reported": s.get("reported_at")
            }
            for s in scams
        ]
    }

# ============================================
# SILENT PANIC MODE
# ============================================

@router.post("/panic/trigger")
async def trigger_panic_mode(
    user_id: str,
    trigger_type: PanicTriggerType,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
):
    """Trigger silent panic mode"""
    
    alert = {
        "user_id": user_id,
        "trigger_type": trigger_type,
        "triggered_at": datetime.utcnow(),
        "location": {"latitude": latitude, "longitude": longitude} if latitude else None,
        "status": "active",
        "notified_contacts": [],
        "recording_url": None
    }
    
    result = await db.panic_alerts.insert_one(alert)
    alert_id = str(result.inserted_id)
    
    # Get user's emergency contacts
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        contacts = user.get("emergency_contacts", [])
        alert["notified_contacts"] = contacts
        
        # Here we would send notifications to contacts
        # For now, just log it
        print(f"🚨 PANIC ALERT triggered for user {user_id}")
    
    return PanicAlertResponse(
        alert_id=alert_id,
        triggered_at=alert["triggered_at"],
        trigger_type=trigger_type,
        location=alert["location"],
        notified_contacts=alert["notified_contacts"],
        emergency_called=False
    )

@router.get("/panic/status/{alert_id}")
async def get_panic_status(alert_id: str):
    """Get status of a panic alert"""
    
    alert = await db.panic_alerts.find_one({"_id": ObjectId(alert_id)})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {
        "alert_id": alert_id,
        "status": alert.get("status"),
        "triggered_at": alert.get("triggered_at"),
        "location": alert.get("location"),
        "notified_contacts": alert.get("notified_contacts", [])
    }

# ============================================
# SMART ZONES
# ============================================

@router.post("/zones/create")
async def create_smart_zone(user_id: str, data: SmartZoneCreate):
    """Create a smart zone for behavior learning"""
    
    zone = {
        "user_id": user_id,
        "name": data.name,
        "zone_type": data.zone_type,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "radius_meters": data.radius_meters,
        "schedule": data.schedule,
        "alert_on_enter": data.alert_on_enter,
        "alert_on_exit": data.alert_on_exit,
        "alert_on_anomaly": data.alert_on_anomaly,
        "created_at": datetime.utcnow()
    }
    
    result = await db.smart_zones.insert_one(zone)
    zone["id"] = str(result.inserted_id)
    
    return zone

@router.get("/zones/{user_id}")
async def get_user_zones(user_id: str):
    """Get all smart zones for a user"""
    
    zones = await db.smart_zones.find({"user_id": user_id}).to_list(100)
    
    for zone in zones:
        zone["id"] = str(zone["_id"])
        del zone["_id"]
    
    return {"zones": zones}

# ============================================
# ENTERPRISE PHISHING SIMULATION
# ============================================

@router.post("/enterprise/phishing/create")
async def create_phishing_simulation(data: PhishingSimulationCreate):
    """Create a phishing simulation for employee training"""
    
    simulation = {
        "company_id": data.company_id,
        "template_type": data.template_type,
        "target_employees": data.target_employees,
        "difficulty": data.difficulty,
        "scheduled_at": data.schedule or datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "status": "scheduled",
        "results": {
            "clicked": 0,
            "reported": 0,
            "no_action": len(data.target_employees)
        }
    }
    
    result = await db.phishing_simulations.insert_one(simulation)
    
    return {
        "simulation_id": str(result.inserted_id),
        "status": "scheduled",
        "target_count": len(data.target_employees)
    }

@router.get("/enterprise/phishing/{simulation_id}/results")
async def get_simulation_results(simulation_id: str):
    """Get results of a phishing simulation"""
    
    sim = await db.phishing_simulations.find_one({"_id": ObjectId(simulation_id)})
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    results = sim.get("results", {})
    total = len(sim.get("target_employees", []))
    
    return PhishingSimulationResult(
        simulation_id=simulation_id,
        company_id=sim.get("company_id"),
        total_targets=total,
        clicked=results.get("clicked", 0),
        reported=results.get("reported", 0),
        no_action=results.get("no_action", 0),
        click_rate=results.get("clicked", 0) / total * 100 if total > 0 else 0,
        report_rate=results.get("reported", 0) / total * 100 if total > 0 else 0,
        risk_score=int(results.get("clicked", 0) / total * 100) if total > 0 else 0,
        recommendations=[
            "Realizar formación adicional en ciberseguridad",
            "Implementar autenticación de dos factores",
            "Revisar políticas de seguridad de email"
        ]
    )
