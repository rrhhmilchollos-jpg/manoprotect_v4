"""
ManoBank Admin - Sistema de Administración Bancaria Completo
Similar a BBVA/CaixaBank para gestión interna del banco
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from enum import Enum
import uuid
import random

from core.auth import require_auth

router = APIRouter(prefix="/manobank/admin", tags=["ManoBank Admin"])

_db = None

def init_manobank_admin_routes(database):
    global _db
    _db = database

def get_db():
    return _db

# ============================================
# ENUMS
# ============================================

class EmployeeRole(str, Enum):
    DIRECTOR = "director"
    GERENTE = "gerente"
    SUBDIRECTOR = "subdirector"
    ANALISTA_RIESGOS = "analista_riesgos"
    GESTOR_COMERCIAL = "gestor_comercial"
    CAJERO = "cajero"
    ATENCION_CLIENTE = "atencion_cliente"

class AccountStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    BLOCKED = "blocked"
    CLOSED = "closed"

class LoanStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    PAID = "paid"
    DEFAULTED = "defaulted"

class LoanType(str, Enum):
    PERSONAL = "personal"
    HIPOTECARIO = "hipotecario"
    VEHICULO = "vehiculo"
    EMPRESARIAL = "empresarial"
    ESTUDIOS = "estudios"
    RAPIDO = "rapido"

class CardType(str, Enum):
    DEBITO = "debito"
    CREDITO = "credito"
    PREPAGO = "prepago"
    BUSINESS = "business"
    PLATINUM = "platinum"
    BLACK = "black"

# ============================================
# PYDANTIC MODELS
# ============================================

class EmployeeCreate(BaseModel):
    email: str
    name: str
    role: EmployeeRole
    department: Optional[str] = None
    phone: Optional[str] = None
    salary: Optional[float] = None

class AccountOpeningRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_dni: str
    account_type: str = "corriente"  # corriente, ahorro, nomina, empresa
    initial_deposit: float = 0
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None

class LoanApplication(BaseModel):
    customer_id: str
    loan_type: LoanType
    amount: float = Field(..., gt=0, le=500000)
    term_months: int = Field(..., ge=3, le=360)
    purpose: str
    monthly_income: float
    employment_status: str
    guarantor_name: Optional[str] = None
    guarantor_dni: Optional[str] = None
    collateral_description: Optional[str] = None

class CardRequest(BaseModel):
    customer_id: str
    account_id: str
    card_type: CardType
    credit_limit: Optional[float] = None  # Solo para crédito

class LoanDecision(BaseModel):
    decision: str  # approved, rejected
    interest_rate: Optional[float] = None
    notes: Optional[str] = None

# ============================================
# AUTH HELPERS
# ============================================

async def require_bank_employee(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require user to be a bank employee"""
    user = await require_auth(request, session_token)
    db = get_db()
    
    employee = await db.manobank_employees.find_one(
        {"user_id": user.user_id, "is_active": True},
        {"_id": 0}
    )
    
    if not employee:
        # Check if superadmin
        if getattr(user, "role", "") == "superadmin":
            return user, {"role": "director", "is_superadmin": True}
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo empleados del banco.")
    
    return user, employee

async def require_bank_director(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require user to be bank director or gerente"""
    user, employee = await require_bank_employee(request, session_token)
    
    if employee.get("role") not in ["director", "gerente", "subdirector"] and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Acceso denegado. Se requiere rol de dirección.")
    
    return user, employee

# ============================================
# DASHBOARD BANCARIO
# ============================================

@router.get("/dashboard")
async def get_admin_dashboard(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Dashboard principal para administración del banco"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Estadísticas generales
    total_customers = await db.manobank_customers.count_documents({})
    total_accounts = await db.manobank_accounts.count_documents({})
    total_employees = await db.manobank_employees.count_documents({"is_active": True})
    
    # Cuentas pendientes de aprobación
    pending_accounts = await db.manobank_account_requests.count_documents({"status": "pending"})
    
    # Préstamos
    total_loans = await db.manobank_loans.count_documents({})
    pending_loans = await db.manobank_loans.count_documents({"status": "pending"})
    active_loans = await db.manobank_loans.count_documents({"status": "active"})
    
    # Calcular volumen de préstamos activos
    active_loans_cursor = db.manobank_loans.find({"status": "active"}, {"amount": 1})
    loans_volume = sum([loan.get("amount", 0) async for loan in active_loans_cursor])
    
    # Tarjetas emitidas
    total_cards = await db.manobank_cards.count_documents({})
    
    # Saldo total en cuentas
    accounts_cursor = db.manobank_accounts.find({}, {"balance": 1})
    total_deposits = sum([acc.get("balance", 0) async for acc in accounts_cursor])
    
    # Transacciones del día
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_transactions = await db.manobank_transactions.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    # Alertas de fraude pendientes
    fraud_alerts = await db.manobank_alerts.count_documents({"is_resolved": False})
    
    return {
        "employee": {
            "name": employee.get("name", user.name),
            "role": employee.get("role", "director"),
            "department": employee.get("department")
        },
        "stats": {
            "total_customers": total_customers,
            "total_accounts": total_accounts,
            "total_employees": total_employees,
            "total_cards": total_cards,
            "total_deposits": round(total_deposits, 2),
            "loans_volume": round(loans_volume, 2)
        },
        "pending": {
            "account_requests": pending_accounts,
            "loan_applications": pending_loans,
            "fraud_alerts": fraud_alerts
        },
        "loans": {
            "total": total_loans,
            "pending": pending_loans,
            "active": active_loans
        },
        "today": {
            "transactions": today_transactions
        }
    }

# ============================================
# GESTIÓN DE EMPLEADOS
# ============================================

@router.get("/employees")
async def get_employees(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Listar todos los empleados del banco"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    employees = await db.manobank_employees.find(
        {},
        {"_id": 0}
    ).to_list(100)
    
    return {"employees": employees}

@router.post("/employees")
async def create_employee(
    data: EmployeeCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Crear nuevo empleado del banco"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    # Check if email already exists
    existing = await db.manobank_employees.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un empleado con este email")
    
    employee_id = f"emp_{uuid.uuid4().hex[:12]}"
    
    new_employee = {
        "id": employee_id,
        "email": data.email,
        "name": data.name,
        "role": data.role.value,
        "department": data.department or _get_department_for_role(data.role.value),
        "phone": data.phone,
        "salary": data.salary,
        "employee_number": f"MB{random.randint(10000, 99999)}",
        "is_active": True,
        "hired_date": datetime.now(timezone.utc).isoformat(),
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_employees.insert_one(new_employee)
    new_employee.pop("_id", None)
    
    return {"message": "Empleado creado correctamente", "employee": new_employee}

@router.patch("/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    role: Optional[str] = None,
    department: Optional[str] = None,
    is_active: Optional[bool] = None,
    salary: Optional[float] = None
):
    """Actualizar empleado"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    update_data = {}
    if role:
        update_data["role"] = role
    if department:
        update_data["department"] = department
    if is_active is not None:
        update_data["is_active"] = is_active
    if salary:
        update_data["salary"] = salary
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user.user_id
    
    result = await db.manobank_employees.update_one(
        {"id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return {"message": "Empleado actualizado"}

@router.delete("/employees/{employee_id}")
async def deactivate_employee(
    employee_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Desactivar empleado (no eliminar)"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    result = await db.manobank_employees.update_one(
        {"id": employee_id},
        {"$set": {
            "is_active": False,
            "deactivated_at": datetime.now(timezone.utc).isoformat(),
            "deactivated_by": user.user_id
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return {"message": "Empleado desactivado"}

# ============================================
# APERTURA DE CUENTAS (CLIENTES)
# ============================================

@router.get("/account-requests")
async def get_account_requests(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Listar solicitudes de apertura de cuenta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.manobank_account_requests.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"requests": requests}

@router.post("/account-requests")
async def create_account_request(
    data: AccountOpeningRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Crear solicitud de apertura de cuenta para un cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    
    account_request = {
        "id": request_id,
        "customer_name": data.customer_name,
        "customer_email": data.customer_email,
        "customer_phone": data.customer_phone,
        "customer_dni": data.customer_dni,
        "account_type": data.account_type,
        "initial_deposit": data.initial_deposit,
        "occupation": data.occupation,
        "monthly_income": data.monthly_income,
        "status": "pending",
        "created_by": user.user_id,
        "created_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_account_requests.insert_one(account_request)
    account_request.pop("_id", None)
    
    return {"message": "Solicitud creada", "request": account_request}

@router.post("/account-requests/{request_id}/approve")
async def approve_account_request(
    request_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Aprobar solicitud de apertura de cuenta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get the request
    acc_request = await db.manobank_account_requests.find_one({"id": request_id})
    if not acc_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if acc_request.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue procesada")
    
    # Create customer if doesn't exist
    customer = await db.manobank_customers.find_one({"dni": acc_request["customer_dni"]})
    
    if not customer:
        customer_id = f"cust_{uuid.uuid4().hex[:12]}"
        customer = {
            "id": customer_id,
            "name": acc_request["customer_name"],
            "email": acc_request["customer_email"],
            "phone": acc_request["customer_phone"],
            "dni": acc_request["customer_dni"],
            "occupation": acc_request.get("occupation"),
            "monthly_income": acc_request.get("monthly_income"),
            "kyc_verified": True,
            "risk_level": "bajo",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.manobank_customers.insert_one(customer)
        customer_id = customer["id"]
    else:
        customer_id = customer["id"]
    
    # Generate IBAN
    bank_code = "9999"
    branch_code = "0001"
    check_digits = str(random.randint(10, 99))
    account_number = ''.join([str(random.randint(0, 9)) for _ in range(10)])
    iban = f"ES{random.randint(10, 99)}{bank_code}{branch_code}{check_digits}{account_number}"
    
    # Create the account
    account_id = f"acc_{uuid.uuid4().hex[:12]}"
    account = {
        "id": account_id,
        "customer_id": customer_id,
        "user_id": None,  # Will be linked when customer registers
        "bank_name": "ManoBank",
        "account_holder": acc_request["customer_name"],
        "account_type": acc_request["account_type"],
        "iban": iban,
        "iban_masked": iban[:4] + " **** **** " + iban[-4:],
        "swift_bic": "MANOES2X",
        "currency": "EUR",
        "balance": acc_request.get("initial_deposit", 0),
        "available_balance": acc_request.get("initial_deposit", 0),
        "is_primary": True,
        "is_manobank": True,
        "is_verified": True,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "approved_by": user.user_id,
        "approved_by_name": employee.get("name", user.name)
    }
    
    await db.manobank_accounts.insert_one(account)
    
    # Update request status
    await db.manobank_account_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "approved",
            "customer_id": customer_id,
            "account_id": account_id,
            "iban": iban,
            "approved_by": user.user_id,
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Cuenta aprobada y creada",
        "customer_id": customer_id,
        "account_id": account_id,
        "iban": iban
    }

@router.post("/account-requests/{request_id}/reject")
async def reject_account_request(
    request_id: str,
    reason: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Rechazar solicitud de apertura de cuenta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    result = await db.manobank_account_requests.update_one(
        {"id": request_id, "status": "pending"},
        {"$set": {
            "status": "rejected",
            "rejection_reason": reason,
            "rejected_by": user.user_id,
            "rejected_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada o ya procesada")
    
    return {"message": "Solicitud rechazada"}

# ============================================
# GESTIÓN DE CLIENTES
# ============================================

@router.get("/customers")
async def get_customers(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    search: Optional[str] = None,
    limit: int = 50
):
    """Listar clientes del banco"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"dni": {"$regex": search, "$options": "i"}}
        ]
    
    customers = await db.manobank_customers.find(
        query,
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    return {"customers": customers}

@router.get("/customers/{customer_id}")
async def get_customer_detail(
    customer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Ver detalle de un cliente con todas sus cuentas, préstamos, tarjetas"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    customer = await db.manobank_customers.find_one(
        {"id": customer_id},
        {"_id": 0}
    )
    
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Get accounts
    accounts = await db.manobank_accounts.find(
        {"customer_id": customer_id},
        {"_id": 0}
    ).to_list(20)
    
    # Get loans
    loans = await db.manobank_loans.find(
        {"customer_id": customer_id},
        {"_id": 0}
    ).to_list(20)
    
    # Get cards
    cards = await db.manobank_cards.find(
        {"customer_id": customer_id},
        {"_id": 0, "cvv": 0, "card_number": 0}
    ).to_list(10)
    
    return {
        "customer": customer,
        "accounts": accounts,
        "loans": loans,
        "cards": cards
    }

# ============================================
# SISTEMA DE PRÉSTAMOS
# ============================================

@router.get("/loans")
async def get_loans(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    loan_type: Optional[str] = None
):
    """Listar préstamos"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if status:
        query["status"] = status
    if loan_type:
        query["loan_type"] = loan_type
    
    loans = await db.manobank_loans.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"loans": loans}

@router.post("/loans")
async def create_loan_application(
    data: LoanApplication,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Crear solicitud de préstamo para un cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Verify customer exists
    customer = await db.manobank_customers.find_one({"id": data.customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Calculate base interest rate based on loan type
    base_rates = {
        "personal": 7.5,
        "hipotecario": 2.5,
        "vehiculo": 5.5,
        "empresarial": 6.0,
        "estudios": 4.0,
        "rapido": 15.0
    }
    
    suggested_rate = base_rates.get(data.loan_type.value, 8.0)
    
    # Calculate monthly payment (simplified)
    monthly_rate = suggested_rate / 100 / 12
    if monthly_rate > 0:
        monthly_payment = data.amount * (monthly_rate * (1 + monthly_rate) ** data.term_months) / ((1 + monthly_rate) ** data.term_months - 1)
    else:
        monthly_payment = data.amount / data.term_months
    
    loan_id = f"loan_{uuid.uuid4().hex[:12]}"
    
    loan = {
        "id": loan_id,
        "customer_id": data.customer_id,
        "customer_name": customer["name"],
        "loan_type": data.loan_type.value,
        "amount": data.amount,
        "term_months": data.term_months,
        "purpose": data.purpose,
        "monthly_income": data.monthly_income,
        "employment_status": data.employment_status,
        "guarantor_name": data.guarantor_name,
        "guarantor_dni": data.guarantor_dni,
        "collateral_description": data.collateral_description,
        "suggested_rate": suggested_rate,
        "suggested_monthly_payment": round(monthly_payment, 2),
        "status": "pending",
        "risk_score": _calculate_risk_score(data),
        "created_by": user.user_id,
        "created_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_loans.insert_one(loan)
    loan.pop("_id", None)
    
    return {"message": "Solicitud de préstamo creada", "loan": loan}

@router.post("/loans/{loan_id}/decide")
async def decide_loan(
    loan_id: str,
    data: LoanDecision,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Aprobar o rechazar préstamo (requiere rol de analista o superior)"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Check role
    if employee.get("role") not in ["director", "gerente", "subdirector", "analista_riesgos"] and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="No tienes permiso para aprobar préstamos")
    
    loan = await db.manobank_loans.find_one({"id": loan_id})
    if not loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    
    if loan.get("status") not in ["pending", "in_review"]:
        raise HTTPException(status_code=400, detail="Este préstamo ya fue procesado")
    
    if data.decision == "approved":
        interest_rate = data.interest_rate or loan.get("suggested_rate", 8.0)
        
        # Recalculate with final rate
        monthly_rate = interest_rate / 100 / 12
        term = loan["term_months"]
        amount = loan["amount"]
        
        if monthly_rate > 0:
            monthly_payment = amount * (monthly_rate * (1 + monthly_rate) ** term) / ((1 + monthly_rate) ** term - 1)
        else:
            monthly_payment = amount / term
        
        total_interest = (monthly_payment * term) - amount
        
        update_data = {
            "status": "approved",
            "interest_rate": interest_rate,
            "monthly_payment": round(monthly_payment, 2),
            "total_interest": round(total_interest, 2),
            "total_amount": round(amount + total_interest, 2),
            "decision_notes": data.notes,
            "approved_by": user.user_id,
            "approved_by_name": employee.get("name", user.name),
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=30*term)).isoformat()
        }
        
        message = "Préstamo aprobado"
    else:
        update_data = {
            "status": "rejected",
            "decision_notes": data.notes,
            "rejected_by": user.user_id,
            "rejected_by_name": employee.get("name", user.name),
            "rejected_at": datetime.now(timezone.utc).isoformat()
        }
        message = "Préstamo rechazado"
    
    await db.manobank_loans.update_one(
        {"id": loan_id},
        {"$set": update_data}
    )
    
    return {"message": message}

@router.post("/loans/{loan_id}/disburse")
async def disburse_loan(
    loan_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Desembolsar préstamo aprobado a la cuenta del cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    loan = await db.manobank_loans.find_one({"id": loan_id, "status": "approved"})
    if not loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado o no aprobado")
    
    # Get customer's primary account
    account = await db.manobank_accounts.find_one({
        "customer_id": loan["customer_id"],
        "is_primary": True
    })
    
    if not account:
        raise HTTPException(status_code=400, detail="El cliente no tiene cuenta para recibir el desembolso")
    
    # Add funds to account
    await db.manobank_accounts.update_one(
        {"id": account["id"]},
        {"$inc": {"balance": loan["amount"], "available_balance": loan["amount"]}}
    )
    
    # Create transaction
    await db.manobank_transactions.insert_one({
        "id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": account.get("user_id"),
        "customer_id": loan["customer_id"],
        "account_id": account["id"],
        "loan_id": loan_id,
        "amount": loan["amount"],
        "description": f"Desembolso préstamo {loan['loan_type']}",
        "category": "prestamos",
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Update loan status
    await db.manobank_loans.update_one(
        {"id": loan_id},
        {"$set": {
            "status": "active",
            "disbursed_at": datetime.now(timezone.utc).isoformat(),
            "disbursed_by": user.user_id,
            "disbursed_to_account": account["id"],
            "remaining_amount": loan.get("total_amount", loan["amount"]),
            "next_payment_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }}
    )
    
    return {
        "message": f"Préstamo desembolsado. {loan['amount']}€ transferidos a cuenta {account['iban_masked']}",
        "account_id": account["id"]
    }

# ============================================
# GESTIÓN DE TARJETAS
# ============================================

@router.get("/cards")
async def get_all_cards(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    card_type: Optional[str] = None
):
    """Listar todas las tarjetas emitidas"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if card_type:
        query["card_type"] = card_type
    
    cards = await db.manobank_cards.find(
        query,
        {"_id": 0, "cvv": 0}  # Never expose CVV
    ).to_list(200)
    
    return {"cards": cards}

@router.post("/cards")
async def issue_card(
    data: CardRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Emitir tarjeta para un cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Verify customer and account
    customer = await db.manobank_customers.find_one({"id": data.customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    account = await db.manobank_accounts.find_one({"id": data.account_id, "customer_id": data.customer_id})
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada o no pertenece al cliente")
    
    # Generate card
    card_prefix = "4" if data.card_type in [CardType.DEBITO, CardType.PREPAGO] else "5"  # Visa vs Mastercard
    card_number = card_prefix + ''.join([str(random.randint(0, 9)) for _ in range(15)])
    cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    
    expiry_month = datetime.now().month
    expiry_year = datetime.now().year + 5
    expiry = f"{str(expiry_month).zfill(2)}/{str(expiry_year)[-2:]}"
    
    # Set credit limit based on card type
    credit_limits = {
        "debito": 0,
        "credito": data.credit_limit or 3000,
        "prepago": 0,
        "business": data.credit_limit or 10000,
        "platinum": data.credit_limit or 15000,
        "black": data.credit_limit or 50000
    }
    
    card_id = f"card_{uuid.uuid4().hex[:12]}"
    
    card = {
        "id": card_id,
        "customer_id": data.customer_id,
        "customer_name": customer["name"],
        "account_id": data.account_id,
        "card_number": card_number,
        "card_number_masked": card_number[:4] + " •••• •••• " + card_number[-4:],
        "cvv": cvv,
        "expiry": expiry,
        "holder_name": customer["name"].upper(),
        "card_type": data.card_type.value,
        "card_brand": "Visa" if card_prefix == "4" else "Mastercard",
        "credit_limit": credit_limits.get(data.card_type.value, 0),
        "available_credit": credit_limits.get(data.card_type.value, 0),
        "daily_limit": 2500 if data.card_type == CardType.DEBITO else 5000,
        "monthly_limit": 10000 if data.card_type == CardType.DEBITO else 25000,
        "status": "active",
        "is_frozen": False,
        "pin_set": False,
        "contactless_enabled": True,
        "online_purchases_enabled": True,
        "issued_by": user.user_id,
        "issued_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_cards.insert_one(card)
    
    # Return without sensitive data
    card.pop("_id", None)
    card.pop("cvv", None)
    card.pop("card_number", None)
    
    return {"message": f"Tarjeta {data.card_type.value} emitida", "card": card}

@router.patch("/cards/{card_id}/block")
async def block_card(
    card_id: str,
    reason: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Bloquear tarjeta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    result = await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": {
            "status": "blocked",
            "blocked_reason": reason,
            "blocked_by": user.user_id,
            "blocked_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    return {"message": "Tarjeta bloqueada"}

@router.patch("/cards/{card_id}/unblock")
async def unblock_card(
    card_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Desbloquear tarjeta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    result = await db.manobank_cards.update_one(
        {"id": card_id, "status": "blocked"},
        {"$set": {
            "status": "active",
            "unblocked_by": user.user_id,
            "unblocked_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada o no bloqueada")
    
    return {"message": "Tarjeta desbloqueada"}

@router.patch("/cards/{card_id}/limit")
async def update_card_limit(
    card_id: str,
    credit_limit: Optional[float] = None,
    daily_limit: Optional[float] = None,
    monthly_limit: Optional[float] = None,
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Actualizar límites de tarjeta"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    update_data = {}
    if credit_limit is not None:
        update_data["credit_limit"] = credit_limit
        update_data["available_credit"] = credit_limit
    if daily_limit is not None:
        update_data["daily_limit"] = daily_limit
    if monthly_limit is not None:
        update_data["monthly_limit"] = monthly_limit
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay límites para actualizar")
    
    update_data["limits_updated_by"] = user.user_id
    update_data["limits_updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    return {"message": "Límites actualizados"}

# ============================================
# HELPER FUNCTIONS
# ============================================

def _get_department_for_role(role: str) -> str:
    departments = {
        "director": "Dirección General",
        "gerente": "Dirección General",
        "subdirector": "Dirección General",
        "analista_riesgos": "Análisis de Riesgos",
        "gestor_comercial": "Comercial",
        "cajero": "Operaciones",
        "atencion_cliente": "Atención al Cliente"
    }
    return departments.get(role, "General")

def _calculate_risk_score(loan: LoanApplication) -> int:
    """Calculate loan risk score (0-100, lower is better)"""
    score = 50  # Base score
    
    # Income to loan ratio
    if loan.monthly_income > 0:
        ratio = loan.amount / (loan.monthly_income * 12)
        if ratio < 2:
            score -= 15
        elif ratio > 5:
            score += 20
    
    # Loan type risk
    type_risk = {
        "hipotecario": -10,
        "vehiculo": 0,
        "personal": 5,
        "empresarial": 10,
        "estudios": -5,
        "rapido": 25
    }
    score += type_risk.get(loan.loan_type.value, 0)
    
    # Has guarantor
    if loan.guarantor_name:
        score -= 10
    
    # Has collateral
    if loan.collateral_description:
        score -= 15
    
    # Employment
    if loan.employment_status == "funcionario":
        score -= 10
    elif loan.employment_status == "autonomo":
        score += 5
    elif loan.employment_status == "desempleado":
        score += 30
    
    return max(0, min(100, score))
