"""
ManoBank - Módulo Bancario Integrado en ManoProtect
Funcionalidades: Cuentas, Saldos, Transferencias SEPA/Bizum, Alertas antifraude
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import random

router = APIRouter(prefix="/manobank", tags=["ManoBank"])

# Database connection
_db = None

def init_manobank_routes(database):
    global _db
    _db = database

def get_db():
    return _db

# ============================================
# AUTH HELPER
# ============================================

async def get_current_user_simple(request: Request, session_token: Optional[str] = None):
    """Simple auth check - get user from session"""
    db = get_db()
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return user

# ============================================
# PYDANTIC MODELS
# ============================================

class BankAccountCreate(BaseModel):
    bank_name: str
    account_holder: str
    iban: str
    swift_bic: Optional[str] = None
    currency: str = "EUR"
    alias: Optional[str] = None

class TransferRequest(BaseModel):
    from_account_id: str
    to_iban: str
    to_name: str
    amount: float = Field(..., gt=0, le=50000)
    concept: str
    transfer_type: str = "sepa"  # sepa, bizum, instant

class BizumRequest(BaseModel):
    from_account_id: str
    to_phone: str
    to_name: Optional[str] = None
    amount: float = Field(..., gt=0, le=1000)
    concept: Optional[str] = None

class ScheduledPaymentCreate(BaseModel):
    from_account_id: str
    to_iban: str
    to_name: str
    amount: float = Field(..., gt=0)
    concept: str
    frequency: str  # once, weekly, monthly, yearly
    start_date: str
    end_date: Optional[str] = None

class AlertSettingsUpdate(BaseModel):
    high_amount_threshold: Optional[float] = None
    notify_all_transactions: Optional[bool] = None
    notify_international: Optional[bool] = None
    notify_new_recipients: Optional[bool] = None
    daily_limit: Optional[float] = None

# ============================================
# DASHBOARD & SUMMARY
# ============================================

@router.get("/dashboard")
async def get_manobank_dashboard(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get ManoBank dashboard with accounts, balances and recent activity"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Check if user has premium access
    user_plan = user.get("plan", "free")
    user_role = user.get("role", "")
    
    # Admins and superadmins always have access
    has_manobank_access = user_role in ["admin", "superadmin"] or user_plan in [
        "family-monthly", "family-quarterly", "family-yearly",
        "enterprise", "enterprise-monthly", "enterprise-yearly"
    ]
    
    if not has_manobank_access:
        return {
            "has_access": False,
            "message": "ManoBank está disponible para planes Familiar Premium y Enterprise",
            "upgrade_url": "/pricing"
        }
    
    # Get user's bank accounts
    accounts = await db.manobank_accounts.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(10)
    
    # Get recent transactions
    transactions = await db.manobank_transactions.find(
        {"user_id": user["user_id"]}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Clean transactions for response
    clean_transactions = []
    for tx in transactions:
        tx.pop("_id", None)
        clean_transactions.append(tx)
    
    # Get pending transfers
    pending = await db.manobank_transfers.find(
        {"user_id": user["user_id"], "status": "pending"},
        {"_id": 0}
    ).to_list(10)
    
    # Get scheduled payments
    scheduled = await db.manobank_scheduled.find(
        {"user_id": user["user_id"], "is_active": True},
        {"_id": 0}
    ).to_list(10)
    
    # Get fraud alerts
    alerts = await db.manobank_alerts.find(
        {"user_id": user["user_id"], "is_resolved": False},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Calculate totals
    total_balance = sum(acc.get("balance", 0) for acc in accounts)
    
    # Get monthly stats
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_income = 0
    monthly_expenses = 0
    
    for tx in clean_transactions:
        tx_date = tx.get("created_at")
        if isinstance(tx_date, str):
            try:
                tx_date = datetime.fromisoformat(tx_date.replace('Z', '+00:00'))
            except:
                continue
        
        if tx_date and tx_date >= month_start:
            amount = tx.get("amount", 0)
            if amount > 0:
                monthly_income += amount
            else:
                monthly_expenses += abs(amount)
    
    return {
        "has_access": True,
        "accounts": accounts,
        "total_balance": round(total_balance, 2),
        "monthly_summary": {
            "income": round(monthly_income, 2),
            "expenses": round(monthly_expenses, 2),
            "net": round(monthly_income - monthly_expenses, 2)
        },
        "recent_transactions": clean_transactions[:10],
        "pending_transfers": pending,
        "scheduled_payments": scheduled,
        "fraud_alerts": alerts,
        "stats": {
            "total_accounts": len(accounts),
            "pending_count": len(pending),
            "scheduled_count": len(scheduled),
            "alert_count": len(alerts)
        }
    }

# ============================================
# ACCOUNT MANAGEMENT
# ============================================

@router.get("/accounts")
async def get_accounts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all connected bank accounts"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    accounts = await db.manobank_accounts.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(20)
    
    return {"accounts": accounts}

@router.post("/accounts")
async def add_account(
    data: BankAccountCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add a new bank account"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Validate IBAN
    iban = data.iban.replace(" ", "").upper()
    if len(iban) < 15 or len(iban) > 34:
        raise HTTPException(status_code=400, detail="IBAN inválido")
    
    # Check for duplicates
    existing = await db.manobank_accounts.find_one({
        "user_id": user["user_id"],
        "iban": iban
    })
    if existing:
        raise HTTPException(status_code=400, detail="Esta cuenta ya está registrada")
    
    # Create account with simulated balance
    account_id = f"acc_{uuid.uuid4().hex[:12]}"
    initial_balance = round(random.uniform(500, 15000), 2)
    
    account = {
        "id": account_id,
        "user_id": user["user_id"],
        "bank_name": data.bank_name,
        "account_holder": data.account_holder,
        "iban": iban,
        "iban_masked": iban[:4] + " **** **** " + iban[-4:],
        "swift_bic": data.swift_bic.upper() if data.swift_bic else None,
        "currency": data.currency,
        "alias": data.alias or data.bank_name,
        "balance": initial_balance,
        "available_balance": initial_balance,
        "is_primary": False,
        "is_verified": True,  # Simulated
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_sync": datetime.now(timezone.utc).isoformat()
    }
    
    # Set as primary if first account
    existing_count = await db.manobank_accounts.count_documents({"user_id": user["user_id"]})
    if existing_count == 0:
        account["is_primary"] = True
    
    await db.manobank_accounts.insert_one(account)
    
    # Generate some sample transactions
    await _generate_sample_transactions(db, user["user_id"], account_id)
    
    account.pop("_id", None)
    return {
        "message": "Cuenta añadida correctamente",
        "account": account
    }

@router.delete("/accounts/{account_id}")
async def delete_account(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete a bank account"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    result = await db.manobank_accounts.delete_one({
        "id": account_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    return {"message": "Cuenta eliminada correctamente"}

@router.patch("/accounts/{account_id}/primary")
async def set_primary_account(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Set account as primary"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Remove primary from all accounts
    await db.manobank_accounts.update_many(
        {"user_id": user["user_id"]},
        {"$set": {"is_primary": False}}
    )
    
    # Set new primary
    result = await db.manobank_accounts.update_one(
        {"id": account_id, "user_id": user["user_id"]},
        {"$set": {"is_primary": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    return {"message": "Cuenta establecida como principal"}

# ============================================
# TRANSACTIONS
# ============================================

@router.get("/transactions")
async def get_transactions(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    account_id: Optional[str] = None,
    days: int = 30,
    limit: int = 50
):
    """Get transaction history"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    query = {"user_id": user["user_id"]}
    if account_id:
        query["account_id"] = account_id
    
    transactions = await db.manobank_transactions.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Categorize transactions
    categories = {}
    for tx in transactions:
        cat = tx.get("category", "otros")
        if cat not in categories:
            categories[cat] = {"count": 0, "total": 0}
        categories[cat]["count"] += 1
        categories[cat]["total"] += abs(tx.get("amount", 0))
    
    return {
        "transactions": transactions,
        "total": len(transactions),
        "categories": categories
    }

@router.get("/transactions/{transaction_id}")
async def get_transaction_details(
    transaction_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get transaction details"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    transaction = await db.manobank_transactions.find_one(
        {"id": transaction_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    return transaction

# ============================================
# TRANSFERS (SEPA & BIZUM)
# ============================================

@router.post("/transfers/sepa")
async def create_sepa_transfer(
    data: TransferRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a SEPA transfer"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Verify source account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user["user_id"]
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta origen no encontrada")
    
    if account.get("available_balance", 0) < data.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    # Validate destination IBAN
    to_iban = data.to_iban.replace(" ", "").upper()
    if len(to_iban) < 15 or len(to_iban) > 34:
        raise HTTPException(status_code=400, detail="IBAN destino inválido")
    
    # Check for fraud patterns
    fraud_check = await _check_transfer_fraud(db, user["user_id"], data.amount, to_iban)
    
    transfer_id = f"tr_{uuid.uuid4().hex[:12]}"
    
    transfer = {
        "id": transfer_id,
        "user_id": user["user_id"],
        "from_account_id": data.from_account_id,
        "from_iban": account["iban"],
        "to_iban": to_iban,
        "to_iban_masked": to_iban[:4] + " **** " + to_iban[-4:],
        "to_name": data.to_name,
        "amount": data.amount,
        "currency": account.get("currency", "EUR"),
        "concept": data.concept,
        "transfer_type": data.transfer_type,
        "status": "pending" if fraud_check["is_suspicious"] else "completed",
        "fraud_score": fraud_check["risk_score"],
        "requires_verification": fraud_check["is_suspicious"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "estimated_arrival": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    }
    
    await db.manobank_transfers.insert_one(transfer)
    
    # If not suspicious, process immediately
    if not fraud_check["is_suspicious"]:
        # Deduct from account
        await db.manobank_accounts.update_one(
            {"id": data.from_account_id},
            {"$inc": {"balance": -data.amount, "available_balance": -data.amount}}
        )
        
        # Create transaction record
        await db.manobank_transactions.insert_one({
            "id": f"tx_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "account_id": data.from_account_id,
            "transfer_id": transfer_id,
            "amount": -data.amount,
            "description": f"Transferencia a {data.to_name}",
            "category": "transferencias",
            "to_name": data.to_name,
            "to_iban": to_iban,
            "concept": data.concept,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        # Create fraud alert
        await db.manobank_alerts.insert_one({
            "id": f"alert_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "transfer_id": transfer_id,
            "alert_type": "suspicious_transfer",
            "severity": "high" if fraud_check["risk_score"] > 70 else "medium",
            "title": "Transferencia sospechosa detectada",
            "description": f"Transferencia de {data.amount}€ a {data.to_name} requiere verificación",
            "risk_factors": fraud_check["risk_factors"],
            "is_resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    transfer.pop("_id", None)
    return {
        "message": "Transferencia procesada" if not fraud_check["is_suspicious"] else "Transferencia pendiente de verificación",
        "transfer": transfer,
        "fraud_check": fraud_check
    }

@router.post("/transfers/bizum")
async def send_bizum(
    data: BizumRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send money via Bizum"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Verify source account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user["user_id"]
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta origen no encontrada")
    
    if account.get("available_balance", 0) < data.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    # Bizum limit check
    if data.amount > 1000:
        raise HTTPException(status_code=400, detail="El límite de Bizum es 1.000€")
    
    # Validate phone
    phone = data.to_phone.replace(" ", "").replace("+", "")
    if not phone.isdigit() or len(phone) < 9:
        raise HTTPException(status_code=400, detail="Número de teléfono inválido")
    
    transfer_id = f"bz_{uuid.uuid4().hex[:12]}"
    
    # Process immediately (Bizum is instant)
    await db.manobank_accounts.update_one(
        {"id": data.from_account_id},
        {"$inc": {"balance": -data.amount, "available_balance": -data.amount}}
    )
    
    # Create transaction
    transaction = {
        "id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "account_id": data.from_account_id,
        "transfer_id": transfer_id,
        "amount": -data.amount,
        "description": f"Bizum a {data.to_phone}",
        "category": "bizum",
        "to_phone": data.to_phone,
        "to_name": data.to_name,
        "concept": data.concept or "Bizum",
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_transactions.insert_one(transaction)
    
    # Save Bizum record
    bizum = {
        "id": transfer_id,
        "user_id": user["user_id"],
        "from_account_id": data.from_account_id,
        "to_phone": data.to_phone,
        "to_name": data.to_name,
        "amount": data.amount,
        "concept": data.concept,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_bizum.insert_one(bizum)
    
    return {
        "message": f"Bizum de {data.amount}€ enviado correctamente",
        "bizum_id": transfer_id,
        "status": "completed"
    }

@router.post("/transfers/{transfer_id}/verify")
async def verify_transfer(
    transfer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Verify a pending transfer (for suspicious ones)"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    transfer = await db.manobank_transfers.find_one({
        "id": transfer_id,
        "user_id": user["user_id"],
        "status": "pending"
    })
    
    if not transfer:
        raise HTTPException(status_code=404, detail="Transferencia no encontrada o ya procesada")
    
    # Process the transfer
    await db.manobank_accounts.update_one(
        {"id": transfer["from_account_id"]},
        {"$inc": {"balance": -transfer["amount"], "available_balance": -transfer["amount"]}}
    )
    
    # Update transfer status
    await db.manobank_transfers.update_one(
        {"id": transfer_id},
        {"$set": {"status": "completed", "verified_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create transaction record
    await db.manobank_transactions.insert_one({
        "id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "account_id": transfer["from_account_id"],
        "transfer_id": transfer_id,
        "amount": -transfer["amount"],
        "description": f"Transferencia a {transfer['to_name']}",
        "category": "transferencias",
        "concept": transfer.get("concept"),
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Resolve alert
    await db.manobank_alerts.update_one(
        {"transfer_id": transfer_id},
        {"$set": {"is_resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Transferencia verificada y procesada", "status": "completed"}

@router.post("/transfers/{transfer_id}/cancel")
async def cancel_transfer(
    transfer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel a pending transfer"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    result = await db.manobank_transfers.update_one(
        {"id": transfer_id, "user_id": user["user_id"], "status": "pending"},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transferencia no encontrada o ya procesada")
    
    # Resolve alert
    await db.manobank_alerts.update_one(
        {"transfer_id": transfer_id},
        {"$set": {"is_resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Transferencia cancelada"}

# ============================================
# SCHEDULED PAYMENTS
# ============================================

@router.get("/scheduled")
async def get_scheduled_payments(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all scheduled payments"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    scheduled = await db.manobank_scheduled.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(50)
    
    return {"scheduled_payments": scheduled}

@router.post("/scheduled")
async def create_scheduled_payment(
    data: ScheduledPaymentCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a scheduled/recurring payment"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    # Verify account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user["user_id"]
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    scheduled_id = f"sch_{uuid.uuid4().hex[:12]}"
    
    scheduled = {
        "id": scheduled_id,
        "user_id": user["user_id"],
        "from_account_id": data.from_account_id,
        "to_iban": data.to_iban.replace(" ", "").upper(),
        "to_name": data.to_name,
        "amount": data.amount,
        "concept": data.concept,
        "frequency": data.frequency,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "next_execution": data.start_date,
        "is_active": True,
        "executions_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_scheduled.insert_one(scheduled)
    
    return {
        "message": "Pago programado creado",
        "scheduled_payment": {k: v for k, v in scheduled.items() if k != "_id"}
    }

@router.delete("/scheduled/{scheduled_id}")
async def delete_scheduled_payment(
    scheduled_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete a scheduled payment"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    result = await db.manobank_scheduled.delete_one({
        "id": scheduled_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pago programado no encontrado")
    
    return {"message": "Pago programado eliminado"}

@router.patch("/scheduled/{scheduled_id}/toggle")
async def toggle_scheduled_payment(
    scheduled_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Activate/deactivate a scheduled payment"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    scheduled = await db.manobank_scheduled.find_one({
        "id": scheduled_id,
        "user_id": user["user_id"]
    })
    
    if not scheduled:
        raise HTTPException(status_code=404, detail="Pago programado no encontrado")
    
    new_status = not scheduled.get("is_active", True)
    
    await db.manobank_scheduled.update_one(
        {"id": scheduled_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {
        "message": f"Pago {'activado' if new_status else 'desactivado'}",
        "is_active": new_status
    }

# ============================================
# ALERTS & NOTIFICATIONS
# ============================================

@router.get("/alerts")
async def get_alerts(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    include_resolved: bool = False
):
    """Get fraud alerts"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    query = {"user_id": user["user_id"]}
    if not include_resolved:
        query["is_resolved"] = False
    
    alerts = await db.manobank_alerts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"alerts": alerts}

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Mark an alert as resolved"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    result = await db.manobank_alerts.update_one(
        {"id": alert_id, "user_id": user["user_id"]},
        {"$set": {"is_resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return {"message": "Alerta resuelta"}

@router.get("/settings")
async def get_alert_settings(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's alert settings"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    settings = await db.manobank_settings.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not settings:
        settings = {
            "user_id": user["user_id"],
            "high_amount_threshold": 500,
            "notify_all_transactions": False,
            "notify_international": True,
            "notify_new_recipients": True,
            "daily_limit": 3000
        }
    
    return settings

@router.patch("/settings")
async def update_alert_settings(
    data: AlertSettingsUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update alert settings"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["user_id"] = user["user_id"]
    
    await db.manobank_settings.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Configuración actualizada"}

# ============================================
# RECIPIENTS
# ============================================

@router.get("/recipients")
async def get_saved_recipients(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get saved recipients for quick transfers"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    recipients = await db.manobank_recipients.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).to_list(50)
    
    return {"recipients": recipients}

@router.post("/recipients")
async def add_recipient(
    name: str,
    iban: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Save a new recipient"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    iban = iban.replace(" ", "").upper()
    
    recipient = {
        "id": f"rec_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "name": name,
        "iban": iban,
        "iban_masked": iban[:4] + " **** " + iban[-4:],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_recipients.insert_one(recipient)
    
    return {"message": "Destinatario guardado", "recipient": {k: v for k, v in recipient.items() if k != "_id"}}

@router.delete("/recipients/{recipient_id}")
async def delete_recipient(
    recipient_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete a saved recipient"""
    user = await get_current_user_simple(request, session_token)
    db = get_db()
    
    result = await db.manobank_recipients.delete_one({
        "id": recipient_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Destinatario no encontrado")
    
    return {"message": "Destinatario eliminado"}

# ============================================
# HELPER FUNCTIONS
# ============================================

async def _check_transfer_fraud(db, user_id: str, amount: float, to_iban: str) -> Dict[str, Any]:
    """Check transfer for fraud patterns"""
    risk_score = 0
    risk_factors = []
    
    # Check 1: High amount
    if amount > 1000:
        risk_score += 20
        risk_factors.append("Importe superior a 1.000€")
    if amount > 5000:
        risk_score += 30
        risk_factors.append("Importe superior a 5.000€")
    
    # Check 2: New recipient
    existing = await db.manobank_recipients.find_one({
        "user_id": user_id,
        "iban": to_iban
    })
    if not existing:
        risk_score += 15
        risk_factors.append("Destinatario nuevo")
    
    # Check 3: International transfer
    if not to_iban.startswith("ES"):
        risk_score += 25
        risk_factors.append("Transferencia internacional")
    
    # Check 4: Recent high activity
    recent_transfers = await db.manobank_transfers.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}
    })
    if recent_transfers > 5:
        risk_score += 20
        risk_factors.append("Alta actividad en las últimas 24h")
    
    return {
        "risk_score": risk_score,
        "is_suspicious": risk_score >= 50,
        "risk_factors": risk_factors
    }

async def _generate_sample_transactions(db, user_id: str, account_id: str):
    """Generate sample transactions for demo"""
    merchants = [
        ("Mercadona", "supermercado", -67.45),
        ("Netflix", "entretenimiento", -12.99),
        ("Spotify", "entretenimiento", -9.99),
        ("Amazon.es", "compras", -89.99),
        ("Nómina Empresa", "ingresos", 2150.00),
        ("Gasolinera Repsol", "transporte", -55.00),
        ("Restaurante El Bodegón", "restaurantes", -42.50),
        ("Vodafone", "telecomunicaciones", -45.00),
        ("Endesa", "suministros", -78.30),
        ("Transferencia recibida", "transferencias", 150.00),
    ]
    
    for merchant, category, amount in merchants:
        days_ago = random.randint(1, 30)
        tx = {
            "id": f"tx_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "account_id": account_id,
            "amount": amount,
            "description": merchant,
            "category": category,
            "status": "completed",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
        }
        await db.manobank_transactions.insert_one(tx)
