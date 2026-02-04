"""
ManoProtect - AI Customer Support Service
Provides intelligent responses to customer queries via WhatsApp/Chat
Uses Emergent LLM integration with GPT-4o-mini for cost-effective responses
"""
import os
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv

load_dotenv()

# System prompt for the AI assistant
MANOPROTECT_SYSTEM_PROMPT = """Eres el asistente virtual de soporte de ManoProtect, una aplicación de protección familiar.

TU PERSONALIDAD:
- Amable, profesional y empático
- Respondes siempre en español
- Usas un tono cercano pero profesional
- Eres conciso pero completo

SOBRE MANOPROTECT:
ManoProtect es una app de seguridad familiar con dos funciones principales:

1. PROTECCIÓN FAMILIAR (SOS):
- Botón SOS de emergencia con cuenta atrás de 3 segundos
- Envía ubicación GPS exacta a familiares
- Notificaciones push + SMS de emergencia
- Sirena de alerta en dispositivos de familiares
- Zonas seguras (geofencing) con alertas de entrada/salida
- Ideal para: niños, ancianos, personas que viven solas

2. PROTECCIÓN ANTI-ESTAFAS:
- Detección de phishing (emails falsos)
- Detección de smishing (SMS fraudulentos)
- Bloqueo de vishing (llamadas fraudulentas)
- Verificador de enlaces sospechosos

PLANES Y PRECIOS:
- Plan Gratuito: Funciones básicas, 1 zona segura
- Plan Familiar Mensual: 4.99€/mes - Hasta 5 familiares, zonas ilimitadas
- Plan Familiar Anual: 49.99€/año - 2 meses gratis, todas las funciones

RESPUESTAS A PREGUNTAS COMUNES:

P: ¿Cómo funciona el botón SOS?
R: Cuando pulsas el botón SOS, tienes 3 segundos para cancelar. Si no lo cancelas, se envía automáticamente tu ubicación exacta por SMS y notificación push a todos tus contactos de emergencia.

P: ¿Funciona sin internet?
R: El botón SOS envía tanto notificación push (requiere internet) como SMS (funciona sin internet). Siempre hay una forma de alertar a tu familia.

P: ¿Qué son las zonas seguras?
R: Son áreas que defines en el mapa (casa, colegio, trabajo). Recibes alertas cuando un familiar entra o sale de estas zonas.

P: ¿Cómo añado familiares?
R: Ve a "Mi Familia" → "Añadir familiar" → Introduce su número de teléfono → Ellos recibirán una invitación.

INSTRUCCIONES ESPECIALES:
- Si el usuario tiene un problema técnico complejo, ofrece escalar a soporte humano
- Si preguntan algo que no sabes, di que lo consultarás con el equipo
- Nunca inventes información sobre precios o características
- Si detectas una emergencia real, indica que llamen al 112

ESCALAMIENTO A HUMANO:
Si el usuario pide hablar con una persona o tienes dudas, responde:
"Entiendo. Voy a pasarte con un agente de soporte. Por favor, deja tu mensaje y te contactaremos lo antes posible por WhatsApp o llámanos al +34 601 510 950."
"""

# In-memory chat history (for simple implementation)
# In production, this should be stored in MongoDB
_chat_sessions = {}


async def get_ai_response(user_message: str, session_id: str, db=None) -> dict:
    """
    Get AI response for a customer support query
    
    Args:
        user_message: The user's message
        session_id: Unique session identifier (phone number or user_id)
        db: MongoDB database connection (optional, for persistence)
    
    Returns:
        dict with 'response', 'session_id', 'escalate_to_human'
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return {
            "response": "Lo siento, el servicio de chat no está disponible en este momento. Por favor, contacta con soporte al +34 601 510 950.",
            "session_id": session_id,
            "escalate_to_human": True
        }
    
    try:
        # Initialize chat with system prompt - use unique session per message for stateless
        chat = LlmChat(
            api_key=api_key,
            session_id=f"{session_id}_{uuid.uuid4().hex[:6]}",
            system_message=MANOPROTECT_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o-mini")
        
        # Send the message
        user_msg = UserMessage(text=user_message)
        response = await chat.send_message(user_msg)
        
        # Check if we should escalate to human
        escalate_keywords = ["hablar con persona", "agente humano", "soporte real", "no entiendes", "quiero quejarme"]
        should_escalate = any(kw in user_message.lower() for kw in escalate_keywords)
        
        # Store in database if available
        if db:
            await db.chat_history.insert_one({
                "chat_id": f"chat_{uuid.uuid4().hex[:12]}",
                "session_id": session_id,
                "user_message": user_message,
                "ai_response": response,
                "escalated": should_escalate,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        return {
            "response": response,
            "session_id": session_id,
            "escalate_to_human": should_escalate
        }
        
    except Exception as e:
        print(f"AI Support Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "response": "Disculpa, estoy teniendo problemas técnicos. ¿Puedes reformular tu pregunta o contactar con soporte al +34 601 510 950?",
            "session_id": session_id,
            "escalate_to_human": True,
            "error": str(e)
        }


def get_quick_responses() -> list:
    """
    Returns a list of quick response options for the chat widget
    """
    return [
        {
            "id": "sos",
            "text": "¿Cómo funciona el botón SOS?",
            "icon": "🆘"
        },
        {
            "id": "zones",
            "text": "¿Qué son las zonas seguras?",
            "icon": "📍"
        },
        {
            "id": "pricing",
            "text": "¿Cuánto cuesta el plan familiar?",
            "icon": "💰"
        },
        {
            "id": "family",
            "text": "¿Cómo añado familiares?",
            "icon": "👨‍👩‍👧"
        },
        {
            "id": "scam",
            "text": "¿Cómo detecta estafas?",
            "icon": "🛡️"
        }
    ]


def clear_session(session_id: str):
    """Clear chat history for a session"""
    if session_id in _chat_sessions:
        del _chat_sessions[session_id]
