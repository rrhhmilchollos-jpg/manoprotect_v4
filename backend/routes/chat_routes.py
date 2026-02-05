"""
ManoProtect - Chat Routes
AI-powered customer support chat endpoints
"""
from fastapi import APIRouter, Request, Cookie
from typing import Optional
from pydantic import BaseModel
import uuid

router = APIRouter(tags=["Chat"])

_db = None


def init_chat_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/chat/message")
async def send_chat_message(
    data: ChatMessage,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send a message to the AI support assistant"""
    from services.ai_support import get_ai_response
    from core.auth import get_current_user
    
    # Get user if authenticated (optional for chat)
    user = await get_current_user(request, session_token)
    
    # Use user_id as session if authenticated, otherwise use provided or generate
    session_id = data.session_id
    if not session_id:
        if user:
            session_id = user.user_id
        else:
            session_id = f"anon_{uuid.uuid4().hex[:8]}"
    
    # Get AI response
    result = await get_ai_response(
        user_message=data.message,
        session_id=session_id,
        db=_db
    )
    
    return {
        "success": True,
        "response": result["response"],
        "session_id": result["session_id"],
        "escalate_to_human": result.get("escalate_to_human", False)
    }


@router.get("/chat/quick-responses")
async def get_quick_responses():
    """Get quick response options for the chat widget"""
    from services.ai_support import get_quick_responses
    return {"responses": get_quick_responses()}


@router.delete("/chat/session/{session_id}")
async def clear_chat_session(
    session_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Clear chat history for a session"""
    from services.ai_support import clear_session
    clear_session(session_id)
    return {"success": True, "message": "Sesión limpiada"}
