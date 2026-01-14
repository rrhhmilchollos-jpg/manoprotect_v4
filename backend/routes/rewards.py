"""
MANO - Rewards Routes
Gamification and rewards system
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional

from core.config import db, require_auth
from services.rewards_service import rewards_service

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("")
async def get_rewards_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's rewards status"""
    user = await require_auth(request, session_token)
    status = await rewards_service.get_user_status(user.user_id)
    return status


@router.post("/claim-daily")
async def claim_daily_reward(request: Request, session_token: Optional[str] = Cookie(None)):
    """Claim daily login reward"""
    user = await require_auth(request, session_token)
    result = await rewards_service.claim_daily_reward(user.user_id)
    return result


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get rewards leaderboard"""
    leaderboard = await rewards_service.get_leaderboard(limit)
    return {"leaderboard": leaderboard}


@router.get("/badges")
async def get_available_badges():
    """Get all available badges"""
    return {"badges": rewards_service.badges}


@router.post("/action/{action}")
async def record_action(
    action: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Record a reward-earning action"""
    user = await require_auth(request, session_token)
    
    valid_actions = ["analyze", "share", "report", "invite"]
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail="Acción no válida")
    
    result = await rewards_service.add_points(user.user_id, action)
    return result
