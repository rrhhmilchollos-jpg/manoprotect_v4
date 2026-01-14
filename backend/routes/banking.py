"""
MANO - Banking Routes
Banking integration and transaction monitoring
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional

from core.config import db, require_auth
from services.banking_service import banking_service

router = APIRouter(prefix="/banking", tags=["Banking"])


@router.get("/supported-banks")
async def get_supported_banks():
    """Get list of supported banks"""
    return {"banks": banking_service.supported_banks}


@router.get("/accounts")
async def get_bank_accounts(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's connected bank accounts"""
    user = await require_auth(request, session_token)
    accounts = await banking_service.get_accounts(user.user_id)
    return {"accounts": accounts}


@router.post("/connect")
async def connect_bank(request: Request, session_token: Optional[str] = Cookie(None)):
    """Connect a new bank account"""
    user = await require_auth(request, session_token)
    body = await request.json()
    
    bank_name = body.get("bank_name")
    account_type = body.get("account_type", "checking")
    
    if not bank_name:
        raise HTTPException(status_code=400, detail="bank_name es requerido")
    
    result = await banking_service.connect_bank_account(user.user_id, bank_name, account_type)
    return result


@router.get("/transactions")
async def get_transactions(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    account_id: Optional[str] = None,
    days: int = 30,
    suspicious_only: bool = False
):
    """Get user's transactions"""
    user = await require_auth(request, session_token)
    transactions = await banking_service.get_transactions(
        user.user_id, account_id, days, suspicious_only
    )
    return {"transactions": transactions}


@router.post("/analyze-transaction")
async def analyze_transaction(request: Request, session_token: Optional[str] = Cookie(None)):
    """Analyze a transaction for fraud"""
    user = await require_auth(request, session_token)
    body = await request.json()
    
    amount = body.get("amount")
    description = body.get("description", "")
    merchant = body.get("merchant")
    account_id = body.get("account_id")
    
    if amount is None:
        raise HTTPException(status_code=400, detail="amount es requerido")
    
    result = await banking_service.analyze_transaction(
        user.user_id, float(amount), description, merchant, account_id
    )
    return result


@router.post("/transactions/{transaction_id}/block")
async def block_transaction(
    transaction_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Block a suspicious transaction"""
    user = await require_auth(request, session_token)
    result = await banking_service.block_transaction(user.user_id, transaction_id)
    return result


@router.post("/transactions/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Approve a flagged transaction"""
    user = await require_auth(request, session_token)
    result = await banking_service.approve_transaction(user.user_id, transaction_id)
    return result


@router.get("/summary")
async def get_banking_summary(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get banking summary for user"""
    user = await require_auth(request, session_token)
    summary = await banking_service.get_account_summary(user.user_id)
    return summary
