"""
ManoBank - Módulo Bancario Integrado en ManoProtect
Funcionalidades: Cuentas, Saldos, Transferencias SEPA/Bizum, Alertas antifraude
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
import uuid
import random
import io

# Import auth from core
from core.auth import require_auth

# PDF generation imports
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

router = APIRouter(prefix="/manobank", tags=["ManoBank"])

# Database connection
_db = None

def init_manobank_routes(database):
    global _db
    _db = database

def get_db():
    return _db

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
    transfer_type: str = "normal"  # normal, immediate, scheduled, internal
    scheduled_date: Optional[str] = None  # ISO date for scheduled transfers

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
    user = await require_auth(request, session_token)
    db = get_db()
    
    # ManoBank is now available to ALL users
    user_id = user.user_id
    
    # Get user's bank accounts
    accounts = await db.manobank_accounts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get recent transactions
    transactions = await db.manobank_transactions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Clean transactions for response
    clean_transactions = []
    for tx in transactions:
        tx.pop("_id", None)
        clean_transactions.append(tx)
    
    # Get pending transfers
    pending = await db.manobank_transfers.find(
        {"user_id": user.user_id, "status": "pending"},
        {"_id": 0}
    ).to_list(10)
    
    # Get scheduled payments
    scheduled = await db.manobank_scheduled.find(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    ).to_list(10)
    
    # Get fraud alerts
    alerts = await db.manobank_alerts.find(
        {"user_id": user.user_id, "is_resolved": False},
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

@router.post("/create-account")
async def create_manobank_account(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a ManoBank account with Spanish IBAN"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Check if user already has a ManoBank account
    existing = await db.manobank_accounts.find_one({
        "user_id": user.user_id,
        "bank_name": "ManoBank"
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes una cuenta ManoBank")
    
    # Generate Spanish IBAN (ES + 2 check digits + 4 bank code + 4 branch + 2 check + 10 account)
    import random
    bank_code = "9999"  # ManoBank code
    branch_code = "0001"
    check_digits = str(random.randint(10, 99))
    account_number = ''.join([str(random.randint(0, 9)) for _ in range(10)])
    
    # Calculate IBAN check digits
    base_number = f"{bank_code}{branch_code}{check_digits}{account_number}ES00"
    # Convert letters to numbers (E=14, S=28)
    numeric_string = base_number.replace('E', '14').replace('S', '28')
    remainder = int(numeric_string) % 97
    iban_check = str(98 - remainder).zfill(2)
    
    iban = f"ES{iban_check}{bank_code}{branch_code}{check_digits}{account_number}"
    
    account_id = f"mano_{uuid.uuid4().hex[:12]}"
    
    account = {
        "id": account_id,
        "user_id": user.user_id,
        "bank_name": "ManoBank",
        "account_holder": user.name or user.email.split('@')[0],
        "iban": iban,
        "iban_masked": iban[:4] + " **** **** " + iban[-4:],
        "swift_bic": "MANOES2X",
        "currency": "EUR",
        "alias": "Cuenta ManoBank",
        "balance": 0.0,
        "available_balance": 0.0,
        "is_primary": True,
        "is_manobank": True,
        "is_verified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_sync": datetime.now(timezone.utc).isoformat()
    }
    
    # Make other accounts non-primary
    await db.manobank_accounts.update_many(
        {"user_id": user.user_id},
        {"$set": {"is_primary": False}}
    )
    
    await db.manobank_accounts.insert_one(account)
    
    # Create welcome bonus transaction
    welcome_tx = {
        "id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "account_id": account_id,
        "amount": 10.00,
        "description": "Bono de bienvenida ManoBank",
        "category": "promociones",
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.manobank_transactions.insert_one(welcome_tx)
    
    # Update balance with welcome bonus
    await db.manobank_accounts.update_one(
        {"id": account_id},
        {"$set": {"balance": 10.00, "available_balance": 10.00}}
    )
    
    account.pop("_id", None)
    account["balance"] = 10.00
    account["available_balance"] = 10.00
    
    return {
        "message": "Cuenta ManoBank creada correctamente",
        "account": account,
        "iban": iban,
        "welcome_bonus": 10.00
    }

@router.get("/card")
async def get_virtual_card(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's virtual card"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    card = await db.manobank_cards.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not card:
        return {"card": None}
    
    # Mask sensitive data
    card["card_number_masked"] = card["card_number"][:4] + " •••• •••• " + card["card_number"][-4:]
    card.pop("cvv", None)  # Never expose CVV
    
    return {"card": card}

@router.post("/card/create")
async def create_virtual_card(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a virtual debit card"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Check if user has a ManoBank account
    mano_account = await db.manobank_accounts.find_one({
        "user_id": user.user_id,
        "bank_name": "ManoBank"
    })
    
    if not mano_account:
        raise HTTPException(status_code=400, detail="Necesitas una cuenta ManoBank para crear una tarjeta")
    
    # Check if user already has a card
    existing = await db.manobank_cards.find_one({"user_id": user.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes una tarjeta virtual")
    
    import random
    
    # Generate card number (Visa starts with 4)
    card_number = "4" + ''.join([str(random.randint(0, 9)) for _ in range(15)])
    cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    
    # Expiry: 5 years from now
    expiry_month = datetime.now().month
    expiry_year = datetime.now().year + 5
    expiry = f"{str(expiry_month).zfill(2)}/{str(expiry_year)[-2:]}"
    
    card = {
        "id": f"card_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "account_id": mano_account["id"],
        "card_number": card_number,
        "card_number_masked": card_number[:4] + " •••• •••• " + card_number[-4:],
        "cvv": cvv,
        "expiry": expiry,
        "holder_name": (user.name or user.email.split('@')[0]).upper(),
        "card_type": "virtual",
        "card_brand": "Visa",
        "status": "active",
        "daily_limit": 2500.00,
        "monthly_limit": 10000.00,
        "is_frozen": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_cards.insert_one(card)
    
    # Don't return CVV in response
    response_card = {**card}
    response_card.pop("_id", None)
    response_card.pop("cvv", None)
    
    return {
        "message": "Tarjeta virtual creada correctamente",
        "card": response_card
    }

@router.patch("/card/freeze")
async def toggle_card_freeze(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Freeze/unfreeze virtual card"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    card = await db.manobank_cards.find_one({"user_id": user.user_id})
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    new_status = not card.get("is_frozen", False)
    
    await db.manobank_cards.update_one(
        {"user_id": user.user_id},
        {"$set": {"is_frozen": new_status}}
    )
    
    return {
        "message": f"Tarjeta {'congelada' if new_status else 'activada'}",
        "is_frozen": new_status
    }


# ============================================
# GESTIÓN DE TARJETAS DEL CLIENTE
# ============================================

@router.get("/my-cards")
async def get_my_cards(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener todas las tarjetas del cliente (datos básicos)"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Buscar por user_id o por customer asociado
    cards = await db.manobank_cards.find(
        {"$or": [
            {"user_id": user.user_id},
            {"customer_email": user.email}
        ]},
        {"_id": 0, "card_number": 0, "cvv": 0, "pin": 0}  # Ocultar datos sensibles
    ).to_list(10)
    
    return {"cards": cards}


@router.get("/my-cards/{card_id}/details")
async def get_card_full_details(
    card_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener detalles completos de una tarjeta (incluye número, CVV, PIN)
    Solo el titular puede ver estos datos"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Buscar tarjeta que pertenezca al usuario
    card = await db.manobank_cards.find_one({
        "id": card_id,
        "$or": [
            {"user_id": user.user_id},
            {"customer_email": user.email}
        ]
    })
    
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada o no tienes acceso")
    
    # Formatear número de tarjeta para mostrar
    card_number = card.get("card_number", "")
    card_number_formatted = " ".join([card_number[i:i+4] for i in range(0, len(card_number), 4)])
    
    # Devolver todos los detalles
    return {
        "card": {
            "id": card.get("id"),
            "card_number": card_number,
            "card_number_formatted": card_number_formatted,
            "card_number_masked": card.get("card_number_masked"),
            "cvv": card.get("cvv"),
            "pin": card.get("pin"),
            "expiry": card.get("expiry"),
            "expiry_month": card.get("expiry_month"),
            "expiry_year": card.get("expiry_year"),
            "holder_name": card.get("holder_name"),
            "card_type": card.get("card_type"),
            "card_brand": card.get("card_brand"),
            "status": card.get("status"),
            "is_frozen": card.get("is_frozen", False),
            "credit_limit": card.get("credit_limit"),
            "available_credit": card.get("available_credit"),
            "daily_limit": card.get("daily_limit"),
            "monthly_limit": card.get("monthly_limit"),
            "contactless_enabled": card.get("contactless_enabled"),
            "online_purchases_enabled": card.get("online_purchases_enabled"),
            "created_at": card.get("created_at")
        }
    }


@router.post("/my-cards/{card_id}/change-pin")
async def change_card_pin(
    card_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    new_pin: str = None
):
    """Cambiar PIN de la tarjeta"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Validar PIN
    if not new_pin or len(new_pin) != 4 or not new_pin.isdigit():
        raise HTTPException(status_code=400, detail="El PIN debe ser de 4 dígitos numéricos")
    
    # Buscar tarjeta
    card = await db.manobank_cards.find_one({
        "id": card_id,
        "$or": [
            {"user_id": user.user_id},
            {"customer_email": user.email}
        ]
    })
    
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Actualizar PIN
    await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": {
            "pin": new_pin,
            "pin_changed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "PIN actualizado correctamente"}


@router.post("/my-cards/{card_id}/toggle-contactless")
async def toggle_contactless(
    card_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Activar/desactivar pagos contactless"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    card = await db.manobank_cards.find_one({
        "id": card_id,
        "$or": [{"user_id": user.user_id}, {"customer_email": user.email}]
    })
    
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    new_status = not card.get("contactless_enabled", True)
    
    await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": {"contactless_enabled": new_status}}
    )
    
    return {"message": f"Contactless {'activado' if new_status else 'desactivado'}", "contactless_enabled": new_status}


@router.post("/my-cards/{card_id}/toggle-online")
async def toggle_online_purchases(
    card_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Activar/desactivar compras online"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    card = await db.manobank_cards.find_one({
        "id": card_id,
        "$or": [{"user_id": user.user_id}, {"customer_email": user.email}]
    })
    
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    new_status = not card.get("online_purchases_enabled", True)
    
    await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": {"online_purchases_enabled": new_status}}
    )
    
    return {"message": f"Compras online {'activadas' if new_status else 'desactivadas'}", "online_purchases_enabled": new_status}


# ============================================
# SOLICITUD PÚBLICA DE CUENTA (SIN AUTH)
# ============================================

class PublicAccountRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_dni: str
    address_street: str
    address_city: str
    address_postal_code: str
    address_province: str
    address_country: str = "España"
    account_type: str = "corriente"
    initial_deposit: float = 0
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None
    date_of_birth: Optional[str] = None
    nationality: str = "Española"


@router.post("/public/request-account")
async def public_request_account(data: PublicAccountRequest):
    """
    Endpoint público para solicitar apertura de cuenta
    NO requiere autenticación - es para nuevos clientes
    Después de esto, el cliente debe pasar por videoverificación KYC
    """
    db = get_db()
    
    # Validar DNI único
    existing = await db.manobank_customers.find_one({"dni": data.customer_dni})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este DNI")
    
    existing_request = await db.manobank_account_requests.find_one({
        "customer_dni": data.customer_dni,
        "status": {"$in": ["pending", "kyc_video_pending"]}
    })
    if existing_request:
        raise HTTPException(status_code=400, detail="Ya existe una solicitud pendiente con este DNI")
    
    # Validar email único
    existing_email = await db.manobank_customers.find_one({"email": data.customer_email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este email")
    
    # Crear solicitud
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    
    account_request = {
        "id": request_id,
        "customer_name": data.customer_name,
        "customer_email": data.customer_email,
        "customer_phone": data.customer_phone,
        "customer_dni": data.customer_dni,
        "address_street": data.address_street,
        "address_city": data.address_city,
        "address_postal_code": data.address_postal_code,
        "address_province": data.address_province,
        "address_country": data.address_country,
        "account_type": data.account_type,
        "initial_deposit": data.initial_deposit,
        "occupation": data.occupation,
        "monthly_income": data.monthly_income,
        "date_of_birth": data.date_of_birth,
        "nationality": data.nationality,
        "status": "pending",  # pending -> kyc_video_pending -> kyc_verified -> account_created OR kyc_rejected
        "kyc_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source": "online_public_form"
    }
    
    await db.manobank_account_requests.insert_one(account_request)
    
    return {
        "request_id": request_id,
        "message": "Solicitud recibida. Proceda con la videoverificación para activar su cuenta.",
        "next_step": "kyc_video_verification"
    }


@router.get("/public/bank-info")
async def get_public_bank_info():
    """Información pública del banco"""
    db = get_db()
    
    bank_info = await db.manobank_config.find_one({"type": "bank_info"}, {"_id": 0})
    
    if not bank_info:
        return {
            "bank_name": "ManoBank S.A.",
            "legal_name": "ManoBank Sociedad Anónima",
            "cif": "A12345678",
            "bank_code": "9999",
            "swift_bic": "MANOES2XXXX",
            "address": "Calle Gran Vía, 28, 28013 Madrid, España",
            "phone": "+34 900 123 456",
            "email": "info@manobank.es",
            "license": "Entidad de dinero electrónico autorizada por el Banco de España",
            "deposit_guarantee": "Fondo de Garantía de Depósitos hasta 100.000€"
        }
    
    # Remove internal fields
    bank_info.pop("type", None)
    bank_info.pop("updated_at", None)
    
    return bank_info


@router.get("/accounts")
async def get_accounts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all connected bank accounts"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    accounts = await db.manobank_accounts.find(
        {"user_id": user.user_id},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Validate IBAN
    iban = data.iban.replace(" ", "").upper()
    if len(iban) < 15 or len(iban) > 34:
        raise HTTPException(status_code=400, detail="IBAN inválido")
    
    # Check for duplicates
    existing = await db.manobank_accounts.find_one({
        "user_id": user.user_id,
        "iban": iban
    })
    if existing:
        raise HTTPException(status_code=400, detail="Esta cuenta ya está registrada")
    
    # Create account with simulated balance
    account_id = f"acc_{uuid.uuid4().hex[:12]}"
    initial_balance = round(random.uniform(500, 15000), 2)
    
    account = {
        "id": account_id,
        "user_id": user.user_id,
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
    existing_count = await db.manobank_accounts.count_documents({"user_id": user.user_id})
    if existing_count == 0:
        account["is_primary"] = True
    
    await db.manobank_accounts.insert_one(account)
    
    # Generate some sample transactions
    await _generate_sample_transactions(db, user.user_id, account_id)
    
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    result = await db.manobank_accounts.delete_one({
        "id": account_id,
        "user_id": user.user_id
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Remove primary from all accounts
    await db.manobank_accounts.update_many(
        {"user_id": user.user_id},
        {"$set": {"is_primary": False}}
    )
    
    # Set new primary
    result = await db.manobank_accounts.update_one(
        {"id": account_id, "user_id": user.user_id},
        {"$set": {"is_primary": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    return {"message": "Cuenta establecida como principal"}


@router.get("/accounts/{account_id}/transactions")
async def get_account_transactions(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get transactions for a specific account with full details"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # First verify the account belongs to this user
    account = await db.manobank_accounts.find_one({
        "id": account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    # Get transactions for this account
    transactions = await db.manobank_transactions.find(
        {"account_id": account_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # If no transactions, return empty list with account info
    return {
        "account_id": account_id,
        "iban": account.get("iban"),
        "bic": account.get("swift_bic", "MNBKESMMXXX"),
        "account_number": account.get("account_number", account_id),
        "transactions": transactions
    }


@router.get("/accounts/{account_id}/statement/pdf")
async def generate_account_statement_pdf(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    days: int = 30
):
    """Generate PDF statement for a specific account"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Verify account belongs to user
    account = await db.manobank_accounts.find_one({
        "id": account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    # Get transactions for the period
    date_from = datetime.now(timezone.utc) - timedelta(days=days)
    transactions = await db.manobank_transactions.find(
        {
            "account_id": account_id,
            "created_at": {"$gte": date_from.isoformat()}
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='BankTitle', fontSize=18, textColor=colors.HexColor('#1e40af'), spaceAfter=20, alignment=TA_CENTER, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=12, textColor=colors.HexColor('#1e40af'), spaceBefore=15, spaceAfter=10, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='AccountInfo', fontSize=10, spaceBefore=5, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER))
    
    elements = []
    
    # Header
    elements.append(Paragraph("ManoBank", styles['BankTitle']))
    elements.append(Paragraph("Extracto de Cuenta", styles['SectionTitle']))
    elements.append(Spacer(1, 10))
    
    # Account info
    elements.append(Paragraph(f"<b>Titular:</b> {account.get('account_holder', user.name)}", styles['AccountInfo']))
    elements.append(Paragraph(f"<b>IBAN:</b> {account.get('iban', 'N/A')}", styles['AccountInfo']))
    elements.append(Paragraph(f"<b>BIC/SWIFT:</b> {account.get('swift_bic', 'MNBKESMMXXX')}", styles['AccountInfo']))
    elements.append(Paragraph(f"<b>Divisa:</b> {account.get('currency', 'EUR')}", styles['AccountInfo']))
    elements.append(Paragraph(f"<b>Saldo actual:</b> {account.get('balance', 0):.2f} €", styles['AccountInfo']))
    elements.append(Paragraph(f"<b>Período:</b> Últimos {days} días ({date_from.strftime('%d/%m/%Y')} - {datetime.now().strftime('%d/%m/%Y')})", styles['AccountInfo']))
    elements.append(Spacer(1, 20))
    
    # Transactions table
    elements.append(Paragraph("Movimientos", styles['SectionTitle']))
    
    if transactions:
        table_data = [['Fecha', 'Concepto', 'Importe', 'Saldo']]
        
        for tx in transactions:
            tx_date = tx.get('created_at', '')
            if isinstance(tx_date, str):
                try:
                    tx_date = datetime.fromisoformat(tx_date.replace('Z', '+00:00')).strftime('%d/%m/%Y')
                except:
                    tx_date = 'N/A'
            
            amount = tx.get('amount', 0)
            amount_str = f"{'+' if amount > 0 else ''}{amount:.2f} €"
            balance = tx.get('balance_after', '-')
            balance_str = f"{balance:.2f} €" if isinstance(balance, (int, float)) else '-'
            
            table_data.append([
                tx_date,
                tx.get('description', tx.get('concept', 'Movimiento'))[:40],
                amount_str,
                balance_str
            ])
        
        table = Table(table_data, colWidths=[2.5*cm, 9*cm, 2.5*cm, 2.5*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWHEIGHTS', (0, 0), (-1, -1), 20),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("No hay movimientos en el período seleccionado.", styles['AccountInfo']))
    
    elements.append(Spacer(1, 30))
    
    # Footer
    elements.append(Paragraph(f"Documento generado el {datetime.now().strftime('%d/%m/%Y a las %H:%M')}", styles['Footer']))
    elements.append(Paragraph("ManoBank S.A. - CIF: A12345678 - C/ Gran Vía 28, 28013 Madrid", styles['Footer']))
    elements.append(Paragraph("Este documento es meramente informativo y no tiene valor contractual.", styles['Footer']))
    
    doc.build(elements)
    buffer.seek(0)
    
    # Generate filename
    filename = f"extracto_manobank_{account_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


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
    user = await require_auth(request, session_token)
    db = get_db()
    
    query = {"user_id": user.user_id}
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    transaction = await db.manobank_transactions.find_one(
        {"id": transaction_id, "user_id": user.user_id},
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
    """Create a SEPA transfer - supports normal, immediate, and internal transfers"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Verify source account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta origen no encontrada")
    
    if account.get("available_balance", 0) < data.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    # Validate destination IBAN
    to_iban = data.to_iban.replace(" ", "").upper()
    if len(to_iban) < 15 or len(to_iban) > 34:
        raise HTTPException(status_code=400, detail="IBAN destino inválido")
    
    # Check if destination is a ManoBank account (internal transfer)
    dest_account = await db.manobank_accounts.find_one({"iban": to_iban})
    is_internal = dest_account is not None
    
    # Determine transfer type and timing
    transfer_type = data.transfer_type or "normal"
    if is_internal:
        transfer_type = "internal"
        estimated_arrival = datetime.now(timezone.utc).isoformat()  # Instant for internal
    elif transfer_type == "immediate":
        estimated_arrival = datetime.now(timezone.utc).isoformat()
    elif transfer_type == "scheduled" and data.scheduled_date:
        estimated_arrival = data.scheduled_date
    else:
        estimated_arrival = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    
    # Check for fraud patterns
    fraud_check = await _check_transfer_fraud(db, user.user_id, data.amount, to_iban)
    
    transfer_id = f"tr_{uuid.uuid4().hex[:12]}"
    
    # Determine initial status
    if transfer_type == "scheduled" and data.scheduled_date:
        status = "scheduled"
    elif fraud_check["is_suspicious"]:
        status = "pending_verification"
    else:
        status = "completed"
    
    transfer = {
        "id": transfer_id,
        "user_id": user.user_id,
        "from_account_id": data.from_account_id,
        "from_iban": account["iban"],
        "to_iban": to_iban,
        "to_iban_masked": to_iban[:4] + " **** " + to_iban[-4:],
        "to_name": data.to_name,
        "to_account_id": dest_account["id"] if dest_account else None,
        "amount": data.amount,
        "currency": account.get("currency", "EUR"),
        "concept": data.concept,
        "transfer_type": transfer_type,
        "is_internal": is_internal,
        "status": status,
        "fraud_score": fraud_check["risk_score"],
        "requires_verification": fraud_check["is_suspicious"],
        "scheduled_date": data.scheduled_date if transfer_type == "scheduled" else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "estimated_arrival": estimated_arrival
    }
    
    await db.manobank_transfers.insert_one(transfer)
    
    # Process transfer if not pending or scheduled
    if status == "completed":
        # Deduct from source account
        new_source_balance = account.get("balance", 0) - data.amount
        await db.manobank_accounts.update_one(
            {"id": data.from_account_id},
            {"$set": {
                "balance": new_source_balance,
                "available_balance": new_source_balance
            }}
        )
        
        # Create outgoing transaction record
        await db.manobank_transactions.insert_one({
            "id": f"tx_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "account_id": data.from_account_id,
            "transfer_id": transfer_id,
            "type": "debit",
            "amount": data.amount,
            "balance_after": new_source_balance,
            "concept": data.concept or f"Transferencia a {data.to_name}",
            "to_name": data.to_name,
            "to_iban": to_iban,
            "transaction_type": "transfer_out",
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # If internal transfer, credit the destination account
        if is_internal and dest_account:
            new_dest_balance = dest_account.get("balance", 0) + data.amount
            await db.manobank_accounts.update_one(
                {"id": dest_account["id"]},
                {"$set": {
                    "balance": new_dest_balance,
                    "available_balance": new_dest_balance
                }}
            )
            
            # Create incoming transaction for destination
            await db.manobank_transactions.insert_one({
                "id": f"tx_{uuid.uuid4().hex[:12]}",
                "user_id": dest_account.get("user_id"),
                "account_id": dest_account["id"],
                "transfer_id": transfer_id,
                "type": "credit",
                "amount": data.amount,
                "balance_after": new_dest_balance,
                "concept": data.concept or f"Transferencia de {account.get('account_holder', 'ManoBank')}",
                "from_name": account.get("account_holder", user.name),
                "from_iban": account["iban"],
                "transaction_type": "transfer_in",
                "status": "completed",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Update transfer as credited
            await db.manobank_transfers.update_one(
                {"id": transfer_id},
                {"$set": {"credited_at": datetime.now(timezone.utc).isoformat()}}
            )
    elif status == "pending_verification":
        # Create fraud alert
        await db.manobank_alerts.insert_one({
            "id": f"alert_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
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
    
    message = {
        "completed": "Transferencia realizada correctamente",
        "scheduled": f"Transferencia programada para {data.scheduled_date}",
        "pending_verification": "Transferencia pendiente de verificación por seguridad"
    }.get(status, "Transferencia procesada")
    
    return {
        "message": message,
        "transfer": transfer,
        "is_internal": is_internal,
        "fraud_check": fraud_check
    }

@router.post("/transfers/bizum")
async def send_bizum(
    data: BizumRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Send money via Bizum"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Verify source account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user.user_id
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
        "user_id": user.user_id,
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
        "user_id": user.user_id,
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    transfer = await db.manobank_transfers.find_one({
        "id": transfer_id,
        "user_id": user.user_id,
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
        "user_id": user.user_id,
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    result = await db.manobank_transfers.update_one(
        {"id": transfer_id, "user_id": user.user_id, "status": "pending"},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    scheduled = await db.manobank_scheduled.find(
        {"user_id": user.user_id},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    # Verify account
    account = await db.manobank_accounts.find_one({
        "id": data.from_account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    scheduled_id = f"sch_{uuid.uuid4().hex[:12]}"
    
    scheduled = {
        "id": scheduled_id,
        "user_id": user.user_id,
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    result = await db.manobank_scheduled.delete_one({
        "id": scheduled_id,
        "user_id": user.user_id
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    scheduled = await db.manobank_scheduled.find_one({
        "id": scheduled_id,
        "user_id": user.user_id
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    query = {"user_id": user.user_id}
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    result = await db.manobank_alerts.update_one(
        {"id": alert_id, "user_id": user.user_id},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    settings = await db.manobank_settings.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not settings:
        settings = {
            "user_id": user.user_id,
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["user_id"] = user.user_id
    
    await db.manobank_settings.update_one(
        {"user_id": user.user_id},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    recipients = await db.manobank_recipients.find(
        {"user_id": user.user_id},
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    iban = iban.replace(" ", "").upper()
    
    recipient = {
        "id": f"rec_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
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
    user = await require_auth(request, session_token)
    db = get_db()
    
    result = await db.manobank_recipients.delete_one({
        "id": recipient_id,
        "user_id": user.user_id
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


# ============================================
# VERIFICACIÓN PÚBLICA DE ESTAFAS (FIREBASE FIRESTORE - CLOUD)
# Base de datos en tiempo real conectada a Google Cloud
# Cualquier usuario puede verificar si un número/email está reportado
# ============================================

# Import Firebase fraud service - DISABLED (user chose MongoDB)
# Firebase requires paid plan, using MongoDB fallback instead
FIREBASE_AVAILABLE = False
print("[ManoBank] Using MongoDB for scam database (Firebase disabled)")


@router.get("/public/verify-scam")
async def verify_scam_public(
    value: str,
    type: str = "phone"
):
    """
    Verificar si un número de teléfono o email está en la base de datos de estafas.
    Este endpoint es PÚBLICO - no requiere autenticación.
    AHORA CON FIREBASE FIRESTORE - Base de datos en tiempo real en la nube.
    """
    if not value:
        raise HTTPException(status_code=400, detail="El valor es requerido")
    
    # Use Firebase Firestore if available
    if FIREBASE_AVAILABLE:
        result = await verify_scam(value, type)
        return result
    
    # Fallback to MongoDB if Firebase not available
    db = get_db()
    
    # Normalize value
    search_value = value.strip()
    if type == "phone":
        search_value = search_value.replace(" ", "").replace("-", "")
        if not search_value.startswith("+"):
            search_value = "+34" + search_value.lstrip("0")
    elif type == "email":
        search_value = search_value.lower()
    
    # Search in database
    report = await db.scam_database.find_one(
        {"value": search_value, "type": type},
        {"_id": 0, "reports": 0, "created_by": 0}
    )
    
    if report:
        return {
            "found": True,
            "is_scam": True,
            "severity": report.get("severity", "unknown"),
            "category": report.get("category", "unknown"),
            "status": report.get("status", "pending"),
            "report_count": report.get("report_count", 1),
            "first_reported": report.get("created_at"),
            "warning": "⚠️ ATENCIÓN: Este número/email ha sido reportado como posible estafa. NO proporcione datos personales ni realice pagos.",
            "advice": [
                "No responda a llamadas o mensajes de este número/email",
                "No proporcione datos bancarios ni personales",
                "No realice ningún tipo de pago o transferencia",
                "Denuncie a las autoridades si ha sido víctima",
                "Contacte con ManoBank si tiene dudas: 900 123 456"
            ]
        }
    
    return {
        "found": False,
        "is_scam": False,
        "message": "Este número/email NO está en nuestra base de datos de estafas conocidas.",
        "disclaimer": "Esto no garantiza que sea seguro. Siempre verifique la identidad de quien le contacta.",
        "tips": [
            "ManoBank nunca le pedirá contraseñas por teléfono o email",
            "Verifique siempre la URL oficial: manobank.es",
            "En caso de duda, contacte directamente con nosotros"
        ]
    }


@router.post("/public/report-scam")
async def report_scam_public(request: Request):
    """
    Reportar un posible número/email fraudulento - PÚBLICO
    Los reportes públicos quedan pendientes de verificación.
    AHORA CON FIREBASE FIRESTORE - Datos guardados en la nube en tiempo real.
    """
    body = await request.json()
    
    report_type = body.get("type", "phone")
    value = body.get("value", "").strip()
    description = body.get("description", "")
    reporter_email = body.get("reporter_email", "")
    category = body.get("category", "unknown")
    
    if not value:
        raise HTTPException(status_code=400, detail="El valor es requerido")
    
    # Use Firebase Firestore if available
    if FIREBASE_AVAILABLE:
        result = await report_scam(
            value=value,
            scam_type=report_type,
            description=description,
            category=category,
            reporter_email=reporter_email,
            source="public"
        )
        return result
    
    # Fallback to MongoDB
    db = get_db()
    
    # Normalize
    if report_type == "phone":
        value = value.replace(" ", "").replace("-", "")
        if not value.startswith("+"):
            value = "+34" + value.lstrip("0")
    elif report_type == "email":
        value = value.lower()
    
    # Check if exists
    existing = await db.scam_database.find_one({"value": value, "type": report_type})
    
    if existing:
        await db.scam_database.update_one(
            {"value": value, "type": report_type},
            {
                "$inc": {"report_count": 1, "public_reports": 1},
                "$push": {
                    "reports": {
                        "reported_by": "Usuario público",
                        "reporter_email": reporter_email,
                        "reason": description,
                        "source": "public",
                        "date": datetime.now(timezone.utc).isoformat()
                    }
                },
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        return {
            "success": True,
            "message": "Gracias por tu reporte. Este número/email ya estaba en nuestra base de datos.",
            "already_reported": True
        }
    
    report = {
        "id": f"scam_{uuid.uuid4().hex[:12]}",
        "type": report_type,
        "value": value,
        "severity": "medium",
        "category": category,
        "description": description,
        "source": "public",
        "status": "pending",
        "report_count": 1,
        "public_reports": 1,
        "reports": [{
            "reported_by": "Usuario público",
            "reporter_email": reporter_email,
            "reason": description,
            "source": "public",
            "date": datetime.now(timezone.utc).isoformat()
        }],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.scam_database.insert_one(report)
    
    return {
        "success": True,
        "message": "Gracias por tu reporte. Nuestro equipo lo revisará pronto.",
        "already_reported": False
    }


@router.get("/public/scam-stats")
async def get_scam_stats_public():
    """
    Estadísticas públicas de la base de datos de estafas.
    AHORA CON FIREBASE FIRESTORE - Estadísticas en tiempo real de la nube.
    """
    # Use Firebase Firestore if available
    if FIREBASE_AVAILABLE:
        stats = await get_scam_stats()
        return stats
    
    # Fallback to MongoDB
    db = get_db()
    
    total = await db.scam_database.count_documents({})
    phones = await db.scam_database.count_documents({"type": "phone"})
    emails = await db.scam_database.count_documents({"type": "email"})
    verified = await db.scam_database.count_documents({"status": "verified"})
    critical = await db.scam_database.count_documents({"severity": "critical"})
    
    # Recent (last 24h)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent = await db.scam_database.count_documents({
        "created_at": {"$gte": yesterday.isoformat()}
    })
    
    return {
        "total_reports": total,
        "phone_scams": phones,
        "email_scams": emails,
        "verified": verified,
        "critical_threats": critical,
        "last_24h": recent,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


# ============================================
# ALGORITMO DE DETECCIÓN DE FRAUDE AUTOMÁTICO
# Analiza patrones sospechosos en tiempo real
# ============================================

@router.post("/fraud/analyze-transaction")
async def analyze_transaction_fraud(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Analizar una transacción para detectar fraude automáticamente.
    Usa el algoritmo de detección de fraude con Firebase.
    """
    user = await require_auth(request, session_token)
    
    if not FIREBASE_AVAILABLE:
        return {"risk_score": 0, "risk_factors": [], "action": "allow", "error": "Firebase not available"}
    
    body = await request.json()
    
    fraud_algo = get_fraud_algorithm()
    result = await fraud_algo.analyze_transaction(
        user_id=user.user_id,
        amount=body.get("amount", 0),
        destination=body.get("destination", ""),
        ip_address=request.client.host if request.client else "unknown",
        transaction_type=body.get("transaction_type", "transfer")
    )
    
    return result


@router.get("/fraud/alerts")
async def get_fraud_alerts_endpoint(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """
    Obtener alertas de fraude automáticas (para empleados del banco).
    """
    user = await require_auth(request, session_token)
    
    if not FIREBASE_AVAILABLE:
        return {"alerts": [], "error": "Firebase not available"}
    
    fraud_algo = get_fraud_algorithm()
    alerts = await fraud_algo.get_fraud_alerts(limit=limit)
    
    return {"alerts": alerts}


@router.post("/fraud/alerts/{alert_id}/resolve")
async def resolve_fraud_alert_endpoint(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Resolver una alerta de fraude.
    """
    user = await require_auth(request, session_token)
    
    if not FIREBASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Firebase not available")
    
    body = await request.json()
    resolution = body.get("resolution", "resolved")
    
    fraud_algo = get_fraud_algorithm()
    success = await fraud_algo.resolve_alert(
        alert_id=alert_id,
        resolution=resolution,
        resolved_by=user.user_id
    )
    
    if success:
        return {"message": "Alerta resuelta correctamente"}
    else:
        raise HTTPException(status_code=500, detail="Error al resolver alerta")
