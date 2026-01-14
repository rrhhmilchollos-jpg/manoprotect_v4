"""
MANO - Threat Analyzer Service
LLM-powered threat analysis using OpenAI GPT-5.2 via Emergent Integrations
"""
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
from core.config import db, EMERGENT_LLM_KEY
from services.fraud_detection import fraud_service


class ThreatAnalyzerService:
    """
    LLM-powered threat analysis service
    Uses GPT-5.2 for intelligent threat detection
    """
    
    def __init__(self):
        self.model = "gpt-5.2"  # OpenAI GPT-5.2
        self.system_prompt = """Eres MANO, un sistema experto en ciberseguridad especializado en detectar fraudes, estafas, phishing, smishing, vishing y otras amenazas digitales en español.

Tu trabajo es analizar contenido (mensajes, emails, URLs, llamadas) y determinar:
1. Si es una amenaza (is_threat: true/false)
2. El nivel de riesgo (risk_level: "critical", "high", "medium", "low")
3. Los tipos de amenaza detectados (threat_types: lista)
4. Un análisis detallado explicando por qué
5. Una recomendación clara para el usuario

Amenazas a detectar:
- Phishing: Intentos de robar credenciales mediante emails/webs falsas
- Smishing: Phishing por SMS
- Vishing: Estafas por llamadas telefónicas
- Fraude bancario: Intentos de robar dinero o datos bancarios
- Suplantación de identidad: Hacerse pasar por entidades legítimas
- Estafas de premios: Falsos sorteos, loterías, herencias
- Ingeniería social: Manipulación psicológica
- Malware: Enlaces a software malicioso
- Scam: Estafas generales

Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
    "is_threat": boolean,
    "risk_level": "critical" | "high" | "medium" | "low",
    "risk_score": number (0-100),
    "threat_types": ["tipo1", "tipo2"],
    "analysis": "Análisis detallado en español",
    "recommendation": "Recomendación clara para el usuario",
    "patterns_detected": ["patrón1", "patrón2"],
    "confidence": number (0-1)
}"""
    
    async def analyze_content(
        self, 
        content: str, 
        content_type: str,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Analyze content for threats using LLM + ML hybrid approach
        """
        # First, get ML-based analysis
        ml_score, ml_patterns, ml_confidence = fraud_service.calculate_text_risk_score(content)
        
        # Check for URLs and analyze them
        url_risk = 0
        url_factors = []
        import re
        urls = re.findall(r'https?://[^\s]+', content)
        for url in urls:
            url_score, factors = fraud_service.analyze_url_risk(url)
            url_risk = max(url_risk, url_score)
            url_factors.extend(factors)
        
        # Combine ML score with URL risk
        combined_ml_score = min(100, ml_score + url_risk * 0.5)
        
        # If ML score is very high or we don't have LLM key, use ML-only analysis
        if not EMERGENT_LLM_KEY or combined_ml_score >= 80:
            return self._generate_ml_response(
                content, content_type, combined_ml_score, 
                ml_patterns + url_factors, ml_confidence
            )
        
        # Use LLM for more nuanced analysis
        try:
            llm_result = await self._analyze_with_llm(content, content_type)
            
            # Combine LLM and ML results
            final_score = (llm_result.get("risk_score", 0) * 0.7 + combined_ml_score * 0.3)
            final_confidence = (llm_result.get("confidence", 0.5) + ml_confidence) / 2
            
            # Merge patterns
            all_patterns = list(set(
                llm_result.get("patterns_detected", []) + ml_patterns + url_factors
            ))
            
            return {
                "is_threat": llm_result.get("is_threat", final_score >= 50),
                "risk_level": fraud_service.get_risk_level(final_score),
                "risk_score": round(final_score, 1),
                "threat_types": llm_result.get("threat_types", []),
                "analysis": llm_result.get("analysis", ""),
                "recommendation": llm_result.get("recommendation", ""),
                "patterns_detected": all_patterns,
                "confidence": round(final_confidence, 2),
                "analysis_method": "hybrid_llm_ml"
            }
            
        except Exception as e:
            print(f"LLM analysis failed: {e}, falling back to ML")
            return self._generate_ml_response(
                content, content_type, combined_ml_score,
                ml_patterns + url_factors, ml_confidence
            )
    
    async def _analyze_with_llm(self, content: str, content_type: str) -> Dict:
        """Analyze content using LLM"""
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            model=self.model,
            system_message=self.system_prompt
        )
        
        user_prompt = f"""Analiza el siguiente contenido de tipo "{content_type}" y determina si es una amenaza:

CONTENIDO A ANALIZAR:
{content}

Responde SOLO con el JSON, sin texto adicional."""
        
        response = await chat.send_message(
            messages=[UserMessage(content=user_prompt)]
        )
        
        # Parse JSON response
        response_text = response.content.strip()
        
        # Clean up response if needed
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        return json.loads(response_text.strip())
    
    def _generate_ml_response(
        self, 
        content: str, 
        content_type: str,
        risk_score: float,
        patterns: List[str],
        confidence: float
    ) -> Dict:
        """Generate response using ML-only analysis"""
        is_threat = risk_score >= 50
        risk_level = fraud_service.get_risk_level(risk_score)
        
        # Determine threat types from patterns
        threat_types = []
        pattern_str = " ".join(patterns).lower()
        
        if "financial" in pattern_str or "bank" in pattern_str:
            threat_types.append("fraude_bancario")
        if "phishing" in pattern_str or "url" in pattern_str:
            threat_types.append("phishing")
        if content_type == "sms":
            threat_types.append("smishing")
        if content_type == "call":
            threat_types.append("vishing")
        if "impersonation" in pattern_str:
            threat_types.append("suplantación")
        if "prize" in pattern_str:
            threat_types.append("estafa_premio")
        if "urgent" in pattern_str:
            threat_types.append("ingeniería_social")
        
        if not threat_types and is_threat:
            threat_types.append("sospechoso")
        
        # Generate analysis
        if is_threat:
            if risk_level == "critical":
                analysis = f"⚠️ ALERTA CRÍTICA: Este {content_type} presenta múltiples indicadores de fraude. Se han detectado {len(patterns)} patrones sospechosos incluyendo: {', '.join(patterns[:5])}. Este mensaje tiene todas las características de una estafa activa."
                recommendation = "🚫 NO INTERACTÚES con este mensaje. No hagas clic en ningún enlace, no proporciones datos personales y bloquea al remitente inmediatamente. Si ya has proporcionado información, contacta a tu banco de inmediato."
            elif risk_level == "high":
                analysis = f"⚠️ ALERTA ALTA: Se han detectado {len(patterns)} indicadores de posible fraude en este {content_type}. Patrones detectados: {', '.join(patterns[:3])}."
                recommendation = "⚠️ Extrema precaución. No proporciones información personal ni bancaria. Verifica la fuente por canales oficiales antes de cualquier acción."
            else:
                analysis = f"⚠️ PRECAUCIÓN: Este {content_type} contiene algunos elementos sospechosos. Patrones detectados: {', '.join(patterns[:2])}."
                recommendation = "Verifica la autenticidad del mensaje contactando directamente a la supuesta fuente por sus canales oficiales."
        else:
            analysis = f"✅ Este {content_type} no presenta indicadores claros de amenaza. El análisis no ha detectado patrones de fraude conocidos."
            recommendation = "Aunque parece seguro, mantén siempre la precaución ante solicitudes de información personal o financiera."
        
        return {
            "is_threat": is_threat,
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1),
            "threat_types": threat_types,
            "analysis": analysis,
            "recommendation": recommendation,
            "patterns_detected": patterns,
            "confidence": round(confidence, 2),
            "analysis_method": "ml_only"
        }
    
    async def save_analysis(self, user_id: str, content: str, content_type: str, result: Dict) -> str:
        """Save analysis result to database"""
        from models.schemas import ThreatAnalysis
        
        analysis = ThreatAnalysis(
            user_id=user_id,
            content=content[:500],  # Truncate for storage
            content_type=content_type,
            risk_level=result["risk_level"],
            risk_score=result["risk_score"],
            is_threat=result["is_threat"],
            threat_types=result["threat_types"],
            recommendation=result["recommendation"],
            analysis=result["analysis"],
            ml_confidence=result.get("confidence", 0),
            patterns_detected=result.get("patterns_detected", [])
        )
        
        doc = analysis.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.threat_history.insert_one(doc)
        
        # Update user stats
        await self._update_user_stats(user_id, result["is_threat"])
        
        return analysis.id
    
    async def _update_user_stats(self, user_id: str, is_threat: bool):
        """Update user's protection statistics"""
        update = {"$inc": {"total_analyzed": 1}}
        if is_threat:
            update["$inc"]["threats_blocked"] = 1
        
        await db.users.update_one(
            {"user_id": user_id},
            update
        )


# Global instance
threat_analyzer = ThreatAnalyzerService()
