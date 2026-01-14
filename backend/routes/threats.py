"""
MANO - Threat Analysis Routes
Handles threat detection, analysis, and reporting
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone

from core.config import db, require_auth, EMERGENT_LLM_KEY
from models.schemas import ThreatAnalysis, AnalyzeRequest

router = APIRouter(tags=["Threats"])


async def analyze_threat(content: str, content_type: str) -> dict:
    """Analyze content for potential threats using AI"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Analiza el siguiente contenido ({content_type}) y determina si es una amenaza de seguridad:

CONTENIDO:
{content}

Responde en JSON con este formato exacto:
{{
    "is_threat": true/false,
    "risk_level": "low/medium/high/critical",
    "threat_types": ["lista de tipos de amenaza detectados"],
    "recommendation": "recomendación para el usuario",
    "analysis": "explicación detallada del análisis"
}}

Identifica: phishing, smishing, vishing, estafas, suplantación de identidad."""

    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY)
        response = await chat.send_async(
            model="gpt-4o-mini",
            messages=[UserMessage(text=prompt)]
        )
        
        import json
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        return json.loads(response_text)
    except Exception as e:
        return {
            "is_threat": False,
            "risk_level": "low",
            "threat_types": [],
            "recommendation": "No se pudo analizar el contenido",
            "analysis": f"Error en el análisis: {str(e)}"
        }


@router.post("/analyze", response_model=ThreatAnalysis)
async def analyze_content(
    data: AnalyzeRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze content for potential threats"""
    user = await require_auth(request, session_token)
    
    analysis_result = await analyze_threat(data.content, data.content_type)
    
    threat = ThreatAnalysis(
        user_id=user.user_id,
        content=data.content[:500],
        content_type=data.content_type,
        risk_level=analysis_result.get("risk_level", "low"),
        is_threat=analysis_result.get("is_threat", False),
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result.get("recommendation", ""),
        analysis=analysis_result.get("analysis", "")
    )
    
    threat_doc = threat.model_dump()
    threat_doc['created_at'] = threat_doc['created_at'].isoformat()
    await db.threat_analysis.insert_one(threat_doc)
    
    await db.threat_stats.update_one(
        {"date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        {
            "$inc": {
                "total_analyzed": 1,
                "threats_detected": 1 if threat.is_threat else 0
            }
        },
        upsert=True
    )
    
    return threat


@router.get("/threats")
async def get_threats(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 20
):
    """Get user's threat history"""
    user = await require_auth(request, session_token)
    
    threats = await db.threat_analysis.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return threats


@router.post("/threats/{threat_id}/share")
async def share_threat(
    threat_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Share a threat alert"""
    user = await require_auth(request, session_token)
    body = await request.json()
    share_type = body.get("share_type", "link")
    
    threat = await db.threat_analysis.find_one(
        {"id": threat_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    await db.threat_analysis.update_one(
        {"id": threat_id},
        {"$inc": {"shared_count": 1}}
    )
    
    share_link = f"https://mano-protect.com/alert/{threat_id}"
    
    return {
        "message": "Alerta compartida",
        "share_link": share_link,
        "share_type": share_type
    }


@router.post("/threats/{threat_id}/report")
async def report_false_positive(
    threat_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Report a false positive"""
    user = await require_auth(request, session_token)
    body = await request.json()
    
    threat = await db.threat_analysis.find_one(
        {"id": threat_id, "user_id": user.user_id}
    )
    
    if not threat:
        raise HTTPException(status_code=404, detail="Amenaza no encontrada")
    
    await db.threat_analysis.update_one(
        {"id": threat_id},
        {"$set": {"reported_false_positive": True}}
    )
    
    await db.false_positive_reports.insert_one({
        "threat_id": threat_id,
        "user_id": user.user_id,
        "reason": body.get("reason", ""),
        "additional_info": body.get("additional_info"),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Reporte enviado. Gracias por ayudarnos a mejorar."}


@router.get("/stats")
async def get_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's protection statistics"""
    user = await require_auth(request, session_token)
    
    total_analyzed = await db.threat_analysis.count_documents({"user_id": user.user_id})
    threats_blocked = await db.threat_analysis.count_documents({
        "user_id": user.user_id,
        "is_threat": True
    })
    
    protection_rate = (threats_blocked / max(total_analyzed, 1)) * 100
    
    return {
        "total_analyzed": total_analyzed,
        "threats_blocked": threats_blocked,
        "protection_rate": round(protection_rate, 1),
        "plan": user.plan,
        "member_since": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at)
    }
