"""
ManoProtect - AI Voice Shield
Real-time voice call fraud detection using AI
Detects manipulation tactics, urgency patterns, and scam indicators
"""
import os
import re
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, List, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/voice-shield", tags=["AI Voice Shield"])
logger = logging.getLogger(__name__)

# Database reference
db = None

def set_database(database):
    global db
    db = database


# ====================================
# MODELS
# ====================================

class VoiceAnalysisRequest(BaseModel):
    transcript: str
    caller_number: Optional[str] = None
    call_duration_seconds: Optional[int] = None
    language: str = "es"

class LiveCallAnalysisRequest(BaseModel):
    audio_chunk: str  # Base64 encoded audio
    session_id: str
    caller_number: Optional[str] = None


# ====================================
# FRAUD DETECTION PATTERNS (Spanish + English)
# ====================================

URGENCY_PATTERNS = [
    # Spanish
    (r"urgente|inmediato|ahora mismo|sin demora|cuanto antes|ya mismo", "Presión de urgencia detectada", 25),
    (r"última oportunidad|oferta limitada|solo hoy|expira|caduca", "Táctica de escasez/presión temporal", 20),
    (r"debe actuar|tiene que|es obligatorio|si no lo hace", "Presión para actuar", 20),
    
    # English
    (r"urgent|immediately|right now|without delay|asap", "Urgency pressure detected", 25),
    (r"last chance|limited offer|today only|expires|deadline", "Scarcity/time pressure tactic", 20),
]

AUTHORITY_IMPERSONATION = [
    # Spanish - Banks
    (r"banco|caixabank|santander|bbva|bankia|sabadell|ing|openbank", "Mención de entidad bancaria", 15),
    (r"su cuenta.*bloqueada|cuenta.*suspendida|movimiento sospechoso", "Falsa alerta de seguridad bancaria", 40),
    (r"verificar.*identidad|confirmar.*datos|actualizar.*información", "Solicitud de verificación sospechosa", 30),
    
    # Spanish - Government
    (r"hacienda|agencia tributaria|seguridad social|policia|guardia civil", "Suplantación de autoridad gubernamental", 35),
    (r"multa|sanción|deuda.*pendiente|embargo", "Amenaza de consecuencias legales", 30),
    
    # Spanish - Tech Support
    (r"soporte técnico|microsoft|apple|google.*support|virus.*ordenador", "Posible estafa de soporte técnico", 35),
    (r"hemos detectado.*virus|su ordenador.*infectado|acceso remoto", "Estafa de soporte técnico falso", 45),
    
    # English equivalents
    (r"bank|account.*blocked|suspicious.*activity", "Bank security alert (possible scam)", 30),
    (r"irs|tax|social security|police|fbi", "Government impersonation", 35),
    (r"tech support|microsoft|apple support|virus.*computer", "Tech support scam indicators", 35),
]

FINANCIAL_PRESSURE = [
    # Spanish
    (r"transferencia|bizum|enviar dinero|pagar ahora", "Solicitud de transferencia de dinero", 35),
    (r"tarjeta.*crédito|número.*tarjeta|cvv|pin|clave", "Solicitud de datos de tarjeta", 50),
    (r"premio|lotería|herencia|has ganado", "Estafa de premio/lotería", 40),
    (r"inversión.*garantizada|rentabilidad.*asegurada|bitcoin.*gratis", "Estafa de inversión", 45),
    
    # English
    (r"transfer|send money|pay now|wire transfer", "Money transfer request", 35),
    (r"credit card|card number|cvv|pin|password", "Card data request", 50),
    (r"prize|lottery|inheritance|you won", "Prize/lottery scam", 40),
]

EMOTIONAL_MANIPULATION = [
    # Spanish
    (r"familiar.*accidente|hijo.*hospital|emergencia familiar", "Manipulación emocional (familiar en peligro)", 40),
    (r"ayuda.*inmediata|no le cuentes.*nadie|secreto", "Táctica de aislamiento", 35),
    (r"confía.*mi|soy.*amigo|solo quiero ayudar", "Construcción de falsa confianza", 20),
    
    # English
    (r"family.*accident|son.*hospital|family emergency", "Emotional manipulation (family in danger)", 40),
    (r"immediate help|don't tell anyone|secret", "Isolation tactic", 35),
]

PERSONAL_INFO_REQUEST = [
    # Spanish
    (r"número.*dni|nie|pasaporte|fecha.*nacimiento", "Solicitud de documento de identidad", 30),
    (r"dirección|domicilio|donde vive", "Solicitud de dirección", 25),
    (r"contraseña|clave.*acceso|código.*verificación", "Solicitud de credenciales", 45),
    
    # English
    (r"social security number|ssn|id number|passport", "ID document request", 30),
    (r"address|where do you live", "Address request", 25),
    (r"password|access code|verification code", "Credentials request", 45),
]


# ====================================
# ANALYSIS FUNCTIONS
# ====================================

def analyze_transcript(transcript: str, language: str = "es") -> Dict[str, Any]:
    """
    Analyze voice transcript for fraud indicators
    Returns risk assessment with detailed breakdown
    """
    transcript_lower = transcript.lower()
    
    result = {
        "risk_score": 0,
        "risk_level": "LOW",
        "alerts": [],
        "manipulation_tactics": [],
        "recommendations": [],
        "analysis_timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    all_patterns = [
        ("urgency", URGENCY_PATTERNS),
        ("authority_impersonation", AUTHORITY_IMPERSONATION),
        ("financial_pressure", FINANCIAL_PRESSURE),
        ("emotional_manipulation", EMOTIONAL_MANIPULATION),
        ("personal_info_request", PERSONAL_INFO_REQUEST),
    ]
    
    detected_categories = set()
    
    for category, patterns in all_patterns:
        for pattern, description, score in patterns:
            if re.search(pattern, transcript_lower):
                result["risk_score"] += score
                result["alerts"].append({
                    "category": category,
                    "description": description,
                    "severity": "HIGH" if score >= 35 else "MEDIUM" if score >= 20 else "LOW"
                })
                detected_categories.add(category)
                
                # Add specific manipulation tactic
                if category not in [t["type"] for t in result["manipulation_tactics"]]:
                    result["manipulation_tactics"].append({
                        "type": category,
                        "description": description,
                        "confidence": min(score * 2, 100)
                    })
    
    # Cap risk score at 100
    result["risk_score"] = min(result["risk_score"], 100)
    
    # Determine risk level
    if result["risk_score"] >= 70:
        result["risk_level"] = "CRITICAL"
        result["recommendations"] = [
            "CUELGA INMEDIATAMENTE - Alto riesgo de estafa",
            "NO proporciones ningún dato personal o bancario",
            "Llama directamente a la entidad oficial usando números verificados",
            "Reporta este número a las autoridades"
        ]
    elif result["risk_score"] >= 50:
        result["risk_level"] = "HIGH"
        result["recommendations"] = [
            "Termina la llamada con precaución",
            "No compartas información sensible",
            "Verifica la identidad del llamante por canales oficiales"
        ]
    elif result["risk_score"] >= 30:
        result["risk_level"] = "MEDIUM"
        result["recommendations"] = [
            "Procede con cautela",
            "No tomes decisiones apresuradas",
            "Verifica cualquier información antes de actuar"
        ]
    else:
        result["risk_level"] = "LOW"
        result["recommendations"] = [
            "Conversación aparentemente normal",
            "Mantén precauciones estándar"
        ]
    
    # Add summary
    if detected_categories:
        result["summary"] = f"Detectadas {len(detected_categories)} categorías de alerta: {', '.join(detected_categories)}"
    else:
        result["summary"] = "No se detectaron patrones de estafa conocidos"
    
    return result


def analyze_caller_behavior(transcript: str, call_duration: int) -> Dict[str, Any]:
    """
    Analyze caller behavior patterns
    """
    behavior = {
        "speech_patterns": [],
        "red_flags": []
    }
    
    # Check for rapid speech/pressure
    words = len(transcript.split())
    words_per_second = words / max(call_duration, 1)
    
    if words_per_second > 3:  # Very fast speech
        behavior["red_flags"].append({
            "type": "rapid_speech",
            "description": "El llamante habla muy rápido (posible táctica de presión)"
        })
    
    # Check for interruption patterns (multiple questions without pause)
    question_count = transcript.count("?")
    if question_count > 5 and call_duration < 120:
        behavior["red_flags"].append({
            "type": "excessive_questions",
            "description": "Demasiadas preguntas en poco tiempo"
        })
    
    # Check for emotional escalation words
    escalation_words = ["por favor", "le ruego", "es urgente", "necesito", "tiene que"]
    escalation_count = sum(1 for word in escalation_words if word in transcript.lower())
    
    if escalation_count >= 3:
        behavior["red_flags"].append({
            "type": "emotional_pressure",
            "description": "Uso excesivo de palabras de presión emocional"
        })
    
    return behavior


# ====================================
# API ENDPOINTS
# ====================================

@router.post("/analyze-transcript")
async def analyze_voice_transcript(request: VoiceAnalysisRequest):
    """
    Analyze a voice call transcript for fraud indicators
    Uses AI pattern matching to detect manipulation tactics
    """
    if not request.transcript or len(request.transcript) < 10:
        raise HTTPException(status_code=400, detail="Transcript too short for analysis")
    
    # Main analysis
    analysis = analyze_transcript(request.transcript, request.language)
    
    # Behavior analysis if duration provided
    if request.call_duration_seconds:
        behavior = analyze_caller_behavior(request.transcript, request.call_duration_seconds)
        analysis["behavior_analysis"] = behavior
        
        # Add behavior red flags to risk score
        for flag in behavior["red_flags"]:
            analysis["risk_score"] = min(analysis["risk_score"] + 10, 100)
            analysis["alerts"].append({
                "category": "behavior",
                "description": flag["description"],
                "severity": "MEDIUM"
            })
    
    # Check caller number against community database
    if request.caller_number and db is not None:
        try:
            known_scam = await db.scam_reports.find_one({
                "contact_info": {"$regex": request.caller_number.replace("+", "\\+"), "$options": "i"},
                "type": "phone"
            })
            
            if known_scam:
                analysis["caller_known_scam"] = True
                analysis["risk_score"] = min(analysis["risk_score"] + 30, 100)
                analysis["alerts"].append({
                    "category": "known_scammer",
                    "description": f"Este número ha sido reportado {known_scam.get('report_count', 1)} veces",
                    "severity": "CRITICAL"
                })
                
                # Recalculate risk level
                if analysis["risk_score"] >= 70:
                    analysis["risk_level"] = "CRITICAL"
        except Exception as e:
            logger.error(f"Database check error: {e}")
    
    # Log analysis
    try:
        await db.voice_analysis_logs.insert_one({
            "transcript_length": len(request.transcript),
            "caller_number": request.caller_number,
            "risk_score": analysis["risk_score"],
            "risk_level": analysis["risk_level"],
            "alerts_count": len(analysis["alerts"]),
            "analyzed_at": datetime.now(timezone.utc)
        })
    except:
        pass
    
    return analysis


@router.post("/real-time-alert")
async def get_real_time_alert(request: VoiceAnalysisRequest):
    """
    Quick real-time analysis for live call monitoring
    Returns immediate alerts during active calls
    """
    transcript_lower = request.transcript.lower()
    
    # Quick critical pattern check
    critical_patterns = [
        (r"transferir.*dinero|enviar.*bizum", "ALERTA: Solicitud de transferencia de dinero"),
        (r"tarjeta.*número|cvv|pin", "ALERTA: Solicitud de datos de tarjeta"),
        (r"cuenta.*bloqueada|acceso.*suspendido", "ALERTA: Posible falsa alerta de seguridad"),
        (r"soporte.*técnico.*virus|ordenador.*infectado", "ALERTA: Posible estafa de soporte técnico"),
        (r"premio|lotería|herencia", "ALERTA: Posible estafa de premio/lotería"),
        (r"hijo.*hospital|familiar.*accidente", "ALERTA: Posible estafa emocional"),
    ]
    
    alerts = []
    for pattern, alert_message in critical_patterns:
        if re.search(pattern, transcript_lower):
            alerts.append(alert_message)
    
    if alerts:
        return {
            "should_alert": True,
            "alerts": alerts,
            "recommendation": "PRECAUCIÓN - Se detectaron señales de posible fraude",
            "action": "Considera terminar la llamada"
        }
    
    return {
        "should_alert": False,
        "alerts": [],
        "recommendation": "Continuar con precaución normal"
    }


@router.get("/scam-phrases/{language}")
async def get_common_scam_phrases(language: str = "es"):
    """
    Get list of common scam phrases for user education
    """
    phrases = {
        "es": [
            {"phrase": "Su cuenta ha sido bloqueada", "category": "Falsa alerta bancaria", "danger": "ALTO"},
            {"phrase": "Ha ganado un premio", "category": "Estafa de lotería", "danger": "ALTO"},
            {"phrase": "Soporte técnico de Microsoft", "category": "Estafa de soporte", "danger": "ALTO"},
            {"phrase": "Su familiar ha tenido un accidente", "category": "Manipulación emocional", "danger": "CRÍTICO"},
            {"phrase": "Necesito que me envíe dinero urgente", "category": "Estafa financiera", "danger": "CRÍTICO"},
            {"phrase": "Debe actualizar sus datos bancarios", "category": "Phishing telefónico", "danger": "ALTO"},
            {"phrase": "Hacienda le va a embargar", "category": "Suplantación de autoridad", "danger": "ALTO"},
            {"phrase": "Inversión garantizada sin riesgo", "category": "Estafa de inversión", "danger": "ALTO"},
        ],
        "en": [
            {"phrase": "Your account has been blocked", "category": "Fake bank alert", "danger": "HIGH"},
            {"phrase": "You've won a prize", "category": "Lottery scam", "danger": "HIGH"},
            {"phrase": "Microsoft tech support calling", "category": "Tech support scam", "danger": "HIGH"},
            {"phrase": "Your family member had an accident", "category": "Emotional manipulation", "danger": "CRITICAL"},
            {"phrase": "I need you to send money urgently", "category": "Financial scam", "danger": "CRITICAL"},
        ]
    }
    
    return {
        "language": language,
        "phrases": phrases.get(language, phrases["es"]),
        "tip": "Si escuchas alguna de estas frases, cuelga inmediatamente"
    }


@router.get("/stats")
async def get_voice_shield_stats():
    """
    Get Voice Shield usage statistics
    """
    try:
        total_analyses = await db.voice_analysis_logs.count_documents({})
        
        critical_count = await db.voice_analysis_logs.count_documents({"risk_level": "CRITICAL"})
        high_count = await db.voice_analysis_logs.count_documents({"risk_level": "HIGH"})
        
        return {
            "total_analyses": total_analyses,
            "threats_detected": {
                "critical": critical_count,
                "high": high_count
            },
            "status": "ACTIVE",
            "ai_version": "1.0.0"
        }
    except:
        return {
            "total_analyses": 0,
            "threats_detected": {"critical": 0, "high": 0},
            "status": "ACTIVE",
            "ai_version": "1.0.0"
        }
