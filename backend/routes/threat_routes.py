"""
MANO - Threat Analysis Routes
AI-powered threat detection and analysis
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone
import logging
import uuid
import csv
import io
import re
import json

from models.all_schemas import ThreatAnalysis, AnalyzeRequest, FalsePositiveReport, ShareRequest, CommunityAlert
from core.auth import get_current_user, require_auth

router = APIRouter(tags=["Threats"])

# Database and LLM references
_db = None
_llm_key = None
_LlmChat = None
_UserMessage = None


def init_threat_routes(db, llm_key, LlmChat, UserMessage):
    """Initialize routes with dependencies"""
    global _db, _llm_key, _LlmChat, _UserMessage
    _db = db
    _llm_key = llm_key
    _LlmChat = LlmChat
    _UserMessage = UserMessage


async def analyze_threat(content: str, content_type: str) -> dict:
    """Analyze content for threats using AI"""
    try:
        chat = _LlmChat(
            api_key=_llm_key,
            session_id=f"fraud-analysis-{uuid.uuid4()}",
            system_message="""Eres un experto en detección de fraudes y amenazas digitales.
Analiza el contenido proporcionado y determina si es una amenaza potencial.
Identifica: phishing, smishing, vishing, estafas, suplantación de identidad.
IMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin texto adicional:
{"is_threat": true/false, "risk_level": "low"/"medium"/"high"/"critical", "threat_types": [], "recommendation": "texto", "analysis": "texto"}"""
        ).with_model("openai", "gpt-4o")
        
        user_message = _UserMessage(
            text=f"Tipo de contenido: {content_type}\n\nContenido a analizar:\n{content}"
        )
        
        response = await chat.send_message(user_message)
        
        logging.info(f"LLM Response (first 200 chars): {response[:200] if response else 'EMPTY'}")
        
        clean_response = response.strip()
        if clean_response.startswith("```"):
            lines = clean_response.split("\n")
            clean_lines = [l for l in lines if not l.startswith("```")]
            clean_response = "\n".join(clean_lines).strip()
        
        try:
            result = json.loads(clean_response)
            return result
        except json.JSONDecodeError:
            json_match = re.search(r'\{[^{}]*"is_threat"[^{}]*\}', clean_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return result
            raise ValueError(f"No valid JSON found in response: {clean_response[:100]}")
            
    except Exception as e:
        logging.error(f"Error in threat analysis: {e}")
        content_lower = content.lower()
        suspicious_keywords = ['gratis', 'premio', 'ganado', 'urgente', 'click', 'clic', 'bit.ly', 'banco', 'verificar cuenta', 'contraseña', 'tarjeta']
        found_keywords = [k for k in suspicious_keywords if k in content_lower]
        
        if found_keywords:
            return {
                "is_threat": True,
                "risk_level": "high" if len(found_keywords) > 2 else "medium",
                "threat_types": ["posible_estafa", "phishing"],
                "recommendation": "Este mensaje contiene palabras sospechosas. No hagas clic en enlaces y no proporciones datos personales.",
                "analysis": f"Análisis básico: Se detectaron palabras sospechosas ({', '.join(found_keywords)}). Se recomienda precaución."
            }
        
        return {
            "is_threat": False,
            "risk_level": "low",
            "threat_types": [],
            "recommendation": "No se detectaron amenazas evidentes, pero mantén precaución.",
            "analysis": f"Análisis completado con método alternativo. Error original: {str(e)}"
        }


@router.get("/")
async def root():
    return {"message": "MANO API - Protección contra fraudes"}


@router.post("/analyze", response_model=ThreatAnalysis)
async def analyze_content(
    data: AnalyzeRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze content for potential threats"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    analysis_result = await analyze_threat(data.content, data.content_type)
    
    threat_obj = ThreatAnalysis(
        user_id=user_id,
        content=data.content,
        content_type=data.content_type,
        risk_level=analysis_result["risk_level"],
        is_threat=analysis_result["is_threat"],
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result["recommendation"],
        analysis=analysis_result["analysis"]
    )
    
    doc = threat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await _db.threats.insert_one(doc)
    
    if threat_obj.is_threat and threat_obj.risk_level in ["critical", "high"]:
        community_alert = CommunityAlert(
            threat_type=", ".join(threat_obj.threat_types[:2]) if threat_obj.threat_types else "Amenaza detectada",
            description=threat_obj.recommendation[:100],
            severity=threat_obj.risk_level,
            affected_users=1
        )
        alert_doc = community_alert.model_dump()
        alert_doc['created_at'] = alert_doc['created_at'].isoformat()
        await _db.community_alerts.insert_one(alert_doc)
    
    return threat_obj


@router.get("/threats")
async def get_threats(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get user's threat history"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    threats = await _db.threats.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return threats


@router.post("/threats/{threat_id}/share")
async def share_threat(
    threat_id: str,
    data: ShareRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Share a threat alert"""
    user = await require_auth(request, session_token)
    
    threat = await _db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    await _db.threats.update_one(
        {"id": threat_id},
        {"$inc": {"shared_count": 1}}
    )
    
    share_text = f"⚠️ ALERTA DE SEGURIDAD - {threat.get('threat_types', ['Amenaza'])[0] if threat.get('threat_types') else 'Amenaza detectada'}\n\n{threat.get('recommendation', 'Posible amenaza detectada')}\n\nProtégete con MANO: mano-protect.com"
    
    if data.share_type == "whatsapp":
        share_url = f"https://wa.me/?text={share_text}"
    elif data.share_type == "email":
        share_url = f"mailto:{data.recipient or ''}?subject=Alerta de seguridad MANO&body={share_text}"
    else:
        share_url = None
    
    return {
        "message": "Compartido correctamente",
        "share_url": share_url,
        "share_text": share_text
    }


@router.post("/threats/{threat_id}/report")
async def report_false_positive(
    threat_id: str,
    data: FalsePositiveReport,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Report a threat as false positive"""
    user = await require_auth(request, session_token)
    
    threat = await _db.threats.find_one({"id": threat_id}, {"_id": 0})
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    await _db.threats.update_one(
        {"id": threat_id},
        {"$set": {"reported_false_positive": True}}
    )
    
    await _db.false_positive_reports.insert_one({
        "threat_id": threat_id,
        "user_id": user.user_id,
        "reason": data.reason,
        "additional_info": data.additional_info,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Reporte de falso positivo registrado. Gracias por ayudarnos a mejorar."}


@router.get("/export/threats")
async def export_threats(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    format: str = "csv"
):
    """Export threat history"""
    user = await require_auth(request, session_token)
    
    threats = await _db.threats.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    if format == "csv":
        if not threats:
            return {"data": "", "format": "csv", "filename": "mano_threats_export.csv"}
        
        output = io.StringIO()
        fieldnames = ["id", "content_type", "risk_level", "is_threat", "recommendation", "created_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(threats)
        
        return {
            "data": output.getvalue(),
            "format": "csv",
            "filename": f"mano_threats_{user.user_id}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    else:
        return {
            "data": threats,
            "format": "json",
            "filename": f"mano_threats_{user.user_id}_{datetime.now().strftime('%Y%m%d')}.json"
        }


@router.get("/stats")
async def get_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user statistics"""
    user = await get_current_user(request, session_token)
    user_id = user.user_id if user else "anonymous"
    
    total = await _db.threats.count_documents({"user_id": user_id})
    threats_blocked = await _db.threats.count_documents({"user_id": user_id, "is_threat": True})
    
    critical = await _db.threats.count_documents({"user_id": user_id, "risk_level": "critical"})
    high = await _db.threats.count_documents({"user_id": user_id, "risk_level": "high"})
    medium = await _db.threats.count_documents({"user_id": user_id, "risk_level": "medium"})
    low = await _db.threats.count_documents({"user_id": user_id, "risk_level": "low"})
    
    return {
        "total_analyzed": total,
        "threats_blocked": threats_blocked,
        "protection_rate": round((threats_blocked / total * 100) if total > 0 else 100, 1),
        "risk_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        }
    }
