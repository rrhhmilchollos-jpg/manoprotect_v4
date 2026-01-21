"""
ManoBank Admin - Sistema de Administración Bancaria Completo
Similar a BBVA/CaixaBank para gestión interna del banco
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from enum import Enum
import uuid
import random
import io

from core.auth import require_auth
from services.contract_generator import generate_account_contract, generate_card_contract

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
    COMPLIANCE = "compliance"
    TESORERIA = "tesoreria"
    RRHH = "rrhh"
    IT = "it"

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
    # Débito
    VISA_DEBITO = "visa_debito"
    MASTERCARD_DEBITO = "mastercard_debito"
    VISA_GOLD_DEBITO = "visa_gold_debito"
    VISA_PLATINUM_DEBITO = "visa_platinum_debito"
    # Crédito
    VISA_CREDITO = "visa_credito"
    MASTERCARD_CREDITO = "mastercard_credito"
    VISA_GOLD_CREDITO = "visa_gold_credito"
    VISA_PLATINUM_CREDITO = "visa_platinum_credito"
    # Otros
    PREPAGO = "prepago"
    BUSINESS = "business"

# ============================================
# PYDANTIC MODELS
# ============================================

class EmployeeCreate(BaseModel):
    email: str
    name: str
    role: EmployeeRole
    roles: Optional[list[str]] = None  # Multiple roles support
    department: Optional[str] = None
    phone: Optional[str] = None
    salary: Optional[float] = None

class AccountOpeningRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_dni: str
    # Dirección completa
    address_street: str  # Calle y número
    address_city: str  # Ciudad/Población
    address_postal_code: str  # Código postal
    address_province: str  # Provincia
    address_country: str = "España"
    # Otros datos
    account_type: str = "corriente"  # corriente, ahorro, nomina, empresa
    initial_deposit: float = 0
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = "Española"

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
    account_id: Optional[str] = None  # Optional - will use primary account if not provided
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
    
    # First try to find employee by email (most reliable)
    employee = await db.manobank_employees.find_one(
        {"email": user.email, "is_active": True},
        {"_id": 0}
    )
    
    # If not found by email, try by user_id
    if not employee:
        employee = await db.manobank_employees.find_one(
            {"user_id": user.user_id, "is_active": True},
            {"_id": 0}
        )
    
    # If still not found and user is superadmin, allow access with minimal data
    if not employee:
        if getattr(user, "role", "") == "superadmin":
            return user, {
                "role": "director", 
                "is_superadmin": True, 
                "name": user.name, 
                "email": user.email,
                "phone": "+34600000000"
            }
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
            "department": employee.get("department"),
            "phone": employee.get("phone", "+34600000000"),
            "email": employee.get("email", user.email)
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
    """Crear nuevo empleado del banco - Solo Director General"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    # Verify only Director General can create employees
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(
            status_code=403, 
            detail="Solo el Director General puede crear nuevos empleados"
        )
    
    # Check if email already exists - allow update if same person with different role
    existing = await db.manobank_employees.find_one({"email": data.email})
    
    employee_id = f"emp_{uuid.uuid4().hex[:12]}"
    
    # Build roles list (primary role + additional roles)
    all_roles = [data.role.value]
    if data.roles:
        for r in data.roles:
            if r not in all_roles:
                all_roles.append(r)
    
    if existing:
        # Update existing employee with new/additional roles
        existing_roles = existing.get("roles", [existing.get("role", "")])
        if isinstance(existing_roles, str):
            existing_roles = [existing_roles]
        
        # Merge roles
        merged_roles = list(set(existing_roles + all_roles))
        
        await db.manobank_employees.update_one(
            {"email": data.email},
            {
                "$set": {
                    "roles": merged_roles,
                    "role": data.role.value,  # Primary role
                    "department": data.department or existing.get("department"),
                    "phone": data.phone or existing.get("phone"),
                    "salary": data.salary or existing.get("salary"),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "updated_by": user.user_id
                }
            }
        )
        
        updated = await db.manobank_employees.find_one({"email": data.email}, {"_id": 0})
        return {
            "message": f"Empleado actualizado con roles: {', '.join(merged_roles)}", 
            "employee": updated
        }
    
    new_employee = {
        "id": employee_id,
        "email": data.email,
        "name": data.name,
        "role": data.role.value,
        "roles": all_roles,
        "department": data.department or _get_department_for_role(data.role.value),
        "phone": data.phone,
        "salary": data.salary,
        "employee_number": f"MB{random.randint(10000, 99999)}",
        "is_active": True,
        "hired_date": datetime.now(timezone.utc).isoformat(),
        "created_by": user.user_id,
        "authorized_by": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_employees.insert_one(new_employee)
    new_employee.pop("_id", None)
    
    return {"message": "Empleado creado y autorizado correctamente", "employee": new_employee}

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


@router.delete("/employees/{employee_id}/permanent")
async def delete_employee_permanent(
    employee_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Eliminar empleado permanentemente - Solo Director General"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    # Verify only Director General can permanently delete
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(
            status_code=403, 
            detail="Solo el Director General puede eliminar empleados permanentemente"
        )
    
    # Don't allow deleting yourself
    target = await db.manobank_employees.find_one({"id": employee_id})
    if target and target.get("email") == user.email:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    result = await db.manobank_employees.delete_one({"id": employee_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Log the action
    await db.security_audit_log.insert_one({
        "event_type": "employee_deleted",
        "employee_id": employee_id,
        "deleted_by": user.user_id,
        "deleted_by_name": employee.get("name"),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Empleado eliminado permanentemente"}


# ============================================
# ALERTAS DE FRAUDE
# ============================================

@router.get("/fraud-alerts")
async def get_fraud_alerts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener alertas de fraude"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    alerts = await db.manobank_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    return {"alerts": alerts}


@router.post("/fraud-alerts")
async def create_fraud_alert(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Crear alerta de fraude - Solo Director o Compliance"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    body = await request.json()
    
    alert = {
        "id": f"alert_{uuid.uuid4().hex[:12]}",
        "type": body.get("type", "suspicious_activity"),
        "severity": body.get("severity", "medium"),  # low, medium, high, critical
        "customer_id": body.get("customer_id"),
        "customer_name": body.get("customer_name"),
        "account_id": body.get("account_id"),
        "description": body.get("description", ""),
        "amount": body.get("amount"),
        "is_resolved": False,
        "created_by": user.user_id,
        "created_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_alerts.insert_one(alert)
    alert.pop("_id", None)
    
    return {"message": "Alerta creada", "alert": alert}


@router.patch("/fraud-alerts/{alert_id}")
async def update_fraud_alert(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Actualizar/Resolver alerta de fraude"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    body = await request.json()
    
    update_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user.user_id
    }
    
    if "is_resolved" in body:
        update_data["is_resolved"] = body["is_resolved"]
        if body["is_resolved"]:
            update_data["resolved_at"] = datetime.now(timezone.utc).isoformat()
            update_data["resolved_by"] = employee.get("name", user.name)
    
    if "notes" in body:
        update_data["notes"] = body["notes"]
    
    if "severity" in body:
        update_data["severity"] = body["severity"]
    
    result = await db.manobank_alerts.update_one(
        {"id": alert_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return {"message": "Alerta actualizada"}


@router.delete("/fraud-alerts/{alert_id}")
async def delete_fraud_alert(
    alert_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Eliminar alerta de fraude - Solo Director"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    result = await db.manobank_alerts.delete_one({"id": alert_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return {"message": "Alerta eliminada"}


# ============================================
# DIRECTOR GENERAL - SUPER POWERS
# ============================================

@router.post("/director/modify-customer")
async def director_modify_customer(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Director General - Modificar cualquier dato de cliente"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Solo Director General")
    
    body = await request.json()
    customer_id = body.get("customer_id")
    updates = body.get("updates", {})
    
    if not customer_id or not updates:
        raise HTTPException(status_code=400, detail="customer_id y updates requeridos")
    
    # Remove protected fields
    protected = ["id", "created_at", "_id"]
    for field in protected:
        updates.pop(field, None)
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["updated_by_director"] = user.user_id
    
    result = await db.manobank_customers.update_one(
        {"id": customer_id},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Audit log
    await db.security_audit_log.insert_one({
        "event_type": "director_customer_modify",
        "customer_id": customer_id,
        "changes": updates,
        "modified_by": user.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Cliente modificado por Director General"}


@router.post("/director/modify-account")
async def director_modify_account(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Director General - Modificar cualquier cuenta"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Solo Director General")
    
    body = await request.json()
    account_id = body.get("account_id")
    updates = body.get("updates", {})
    
    if not account_id or not updates:
        raise HTTPException(status_code=400, detail="account_id y updates requeridos")
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["updated_by_director"] = user.user_id
    
    result = await db.manobank_accounts.update_one(
        {"id": account_id},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    await db.security_audit_log.insert_one({
        "event_type": "director_account_modify",
        "account_id": account_id,
        "changes": updates,
        "modified_by": user.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Cuenta modificada por Director General"}


@router.delete("/director/delete-customer/{customer_id}")
async def director_delete_customer(
    customer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Director General - Eliminar cliente"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Solo Director General")
    
    # Get customer info before deletion
    customer = await db.manobank_customers.find_one({"id": customer_id})
    
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Delete all related data
    await db.manobank_accounts.delete_many({"customer_id": customer_id})
    await db.manobank_cards.delete_many({"customer_id": customer_id})
    await db.manobank_transactions.delete_many({"customer_id": customer_id})
    await db.manobank_customers.delete_one({"id": customer_id})
    
    await db.security_audit_log.insert_one({
        "event_type": "director_customer_delete",
        "customer_id": customer_id,
        "customer_name": customer.get("name"),
        "deleted_by": user.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Cliente y todos sus datos eliminados"}


@router.post("/director/update-phone")
async def director_update_customer_phone(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Director General - Cambiar teléfono de cliente (para 2FA)"""
    user, employee = await require_bank_director(request, session_token)
    db = get_db()
    
    if employee.get("role") != "director" and not employee.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Solo Director General puede cambiar teléfonos")
    
    body = await request.json()
    customer_id = body.get("customer_id")
    new_phone = body.get("new_phone")
    reason = body.get("reason", "")
    
    if not customer_id or not new_phone:
        raise HTTPException(status_code=400, detail="customer_id y new_phone requeridos")
    
    # Update customer phone
    result = await db.manobank_customers.update_one(
        {"id": customer_id},
        {
            "$set": {
                "phone": new_phone,
                "phone_updated_at": datetime.now(timezone.utc).isoformat(),
                "phone_updated_by": user.user_id
            }
        }
    )
    
    # Also update in users collection if exists
    customer = await db.manobank_customers.find_one({"id": customer_id})
    if customer and customer.get("email"):
        await db.users.update_one(
            {"email": customer["email"]},
            {"$set": {"phone": new_phone}}
        )
    
    await db.security_audit_log.insert_one({
        "event_type": "director_phone_change",
        "customer_id": customer_id,
        "new_phone": new_phone,
        "reason": reason,
        "changed_by": user.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Teléfono actualizado a {new_phone}"}


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
        # Dirección completa
        "address_street": data.address_street,
        "address_city": data.address_city,
        "address_postal_code": data.address_postal_code,
        "address_province": data.address_province,
        "address_country": data.address_country,
        # Otros datos
        "account_type": data.account_type,
        "initial_deposit": data.initial_deposit,
        "occupation": data.occupation,
        "monthly_income": data.monthly_income,
        "date_of_birth": data.date_of_birth,
        "nationality": data.nationality,
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
            # Dirección completa
            "address_street": acc_request.get("address_street"),
            "address_city": acc_request.get("address_city"),
            "address_postal_code": acc_request.get("address_postal_code"),
            "address_province": acc_request.get("address_province"),
            "address_country": acc_request.get("address_country", "España"),
            # Otros datos
            "occupation": acc_request.get("occupation"),
            "monthly_income": acc_request.get("monthly_income"),
            "date_of_birth": acc_request.get("date_of_birth"),
            "nationality": acc_request.get("nationality", "Española"),
            "kyc_verified": True,
            "risk_level": "bajo",
            "status": "active",
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

@router.post("/open-account-direct")
async def open_account_directly(
    data: AccountOpeningRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Apertura directa de cuenta (sin pasar por solicitud) - genera contrato PDF"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Check if customer already exists
    existing_customer = await db.manobank_customers.find_one({"dni": data.customer_dni})
    
    if existing_customer:
        customer_id = existing_customer["id"]
    else:
        # Create new customer
        customer_id = f"cust_{uuid.uuid4().hex[:12]}"
        customer = {
            "id": customer_id,
            "name": data.customer_name,
            "email": data.customer_email,
            "phone": data.customer_phone,
            "dni": data.customer_dni,
            "address_street": data.address_street,
            "address_city": data.address_city,
            "address_postal_code": data.address_postal_code,
            "address_province": data.address_province,
            "address_country": data.address_country,
            "occupation": data.occupation,
            "monthly_income": data.monthly_income,
            "date_of_birth": data.date_of_birth,
            "nationality": data.nationality,
            "kyc_verified": True,
            "risk_level": "bajo",
            "status": "active",
            "created_by": user.user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.manobank_customers.insert_one(customer)
    
    # Generate IBAN
    bank_code = "9999"
    branch_code = "0001"
    check_digits = str(random.randint(10, 99))
    account_number = ''.join([str(random.randint(0, 9)) for _ in range(10)])
    iban = f"ES{random.randint(10, 99)}{bank_code}{branch_code}{check_digits}{account_number}"
    
    # Create account
    account_id = f"acc_{uuid.uuid4().hex[:12]}"
    account = {
        "id": account_id,
        "customer_id": customer_id,
        "user_id": None,  # Will be linked when customer creates user account
        "iban": iban,
        "iban_masked": iban[:4] + " **** **** " + iban[-4:],
        "account_type": data.account_type,
        "currency": "EUR",
        "balance": data.initial_deposit + 10.0,  # Welcome bonus
        "available_balance": data.initial_deposit + 10.0,
        "account_holder": data.customer_name,
        "alias": f"Cuenta {data.account_type.title()}",
        "status": "active",
        "is_primary": True,
        "opened_by": user.user_id,
        "opened_by_name": employee.get("name", user.name),
        "contract_signed": True,
        "contract_date": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.manobank_accounts.insert_one(account)
    
    # Generate welcome transaction
    await db.manobank_transactions.insert_one({
        "id": f"tx_{uuid.uuid4().hex[:12]}",
        "account_id": account_id,
        "customer_id": customer_id,
        "type": "credit",
        "amount": 10.0,
        "balance_after": data.initial_deposit + 10.0,
        "concept": "Bono de bienvenida ManoBank",
        "transaction_type": "bonus",
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    if data.initial_deposit > 0:
        await db.manobank_transactions.insert_one({
            "id": f"tx_{uuid.uuid4().hex[:12]}",
            "account_id": account_id,
            "customer_id": customer_id,
            "type": "credit",
            "amount": data.initial_deposit,
            "balance_after": data.initial_deposit + 10.0,
            "concept": "Depósito inicial apertura de cuenta",
            "transaction_type": "deposit",
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Store customer data and account data for response
    customer_data = {
        "customer_name": data.customer_name,
        "customer_email": data.customer_email,
        "customer_phone": data.customer_phone,
        "customer_dni": data.customer_dni,
        "address_street": data.address_street,
        "address_city": data.address_city,
        "address_postal_code": data.address_postal_code,
        "address_province": data.address_province,
        "address_country": data.address_country,
        "occupation": data.occupation,
        "nationality": data.nationality,
        "date_of_birth": data.date_of_birth
    }
    
    account_data = {
        "id": account_id,
        "iban": iban,
        "account_type": data.account_type,
        "initial_deposit": data.initial_deposit,
        "balance": data.initial_deposit + 10.0
    }
    
    employee_data = {
        "name": employee.get("name", user.name),
        "role": employee.get("role", "Empleado")
    }
    
    # Store contract info in database
    contract_id = f"cont_{uuid.uuid4().hex[:12]}"
    await db.manobank_contracts.insert_one({
        "id": contract_id,
        "customer_id": customer_id,
        "account_id": account_id,
        "contract_type": "account_opening",
        "customer_data": customer_data,
        "account_data": account_data,
        "employee_data": employee_data,
        "signed": False,
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "message": "Cuenta abierta correctamente",
        "customer_id": customer_id,
        "account_id": account_id,
        "iban": iban,
        "contract_id": contract_id,
        "balance": data.initial_deposit + 10.0
    }

@router.get("/contracts/{contract_id}/pdf")
async def get_contract_pdf(
    contract_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Descargar contrato en PDF"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    contract = await db.manobank_contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    # Generate PDF
    if contract.get("contract_type") == "card":
        pdf_bytes = generate_card_contract(contract.get("customer_data", {}), contract.get("card_data", {}))
    else:
        pdf_bytes = generate_account_contract(
            contract.get("customer_data", {}),
            contract.get("account_data", {}),
            contract.get("employee_data", {})
        )
    
    filename = f"contrato_{contract_id}.pdf"
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/contracts/{contract_id}/sign")
async def sign_contract(
    contract_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Marcar contrato como firmado"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    result = await db.manobank_contracts.update_one(
        {"id": contract_id},
        {"$set": {
            "signed": True,
            "signed_at": datetime.now(timezone.utc).isoformat(),
            "signed_by_employee": user.user_id
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    return {"message": "Contrato firmado correctamente"}

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
    card_type: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    """Listar todas las tarjetas emitidas con paginación"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Limit max to 100 for performance
    limit = min(limit, 100)
    skip = (page - 1) * limit
    
    query = {}
    if card_type:
        query["card_type"] = card_type
    
    total_count = await db.manobank_cards.count_documents(query)
    
    cards = await db.manobank_cards.find(
        query,
        {"_id": 0, "cvv": 0}  # Never expose CVV
    ).skip(skip).limit(limit).to_list(limit)
    
    return {
        "cards": cards,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "total_pages": (total_count + limit - 1) // limit
        }
    }

@router.post("/cards")
async def issue_card(
    data: CardRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Emitir tarjeta para un cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Verify customer
    customer = await db.manobank_customers.find_one({"id": data.customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Get account - use provided or find primary account
    if data.account_id:
        account = await db.manobank_accounts.find_one({"id": data.account_id, "customer_id": data.customer_id})
        if not account:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada o no pertenece al cliente")
    else:
        # Find primary account for customer
        account = await db.manobank_accounts.find_one({"customer_id": data.customer_id, "is_primary": True})
        if not account:
            # Try any account
            account = await db.manobank_accounts.find_one({"customer_id": data.customer_id})
        if not account:
            raise HTTPException(status_code=404, detail="El cliente no tiene cuenta bancaria. Crea una cuenta primero.")
    
    # Generate card - Determine if VISA (4) or Mastercard (5)
    visa_types = [CardType.VISA_DEBITO, CardType.VISA_CREDITO, CardType.VISA_GOLD_DEBITO, 
                  CardType.VISA_GOLD_CREDITO, CardType.VISA_PLATINUM_DEBITO, CardType.VISA_PLATINUM_CREDITO, CardType.PREPAGO]
    mastercard_types = [CardType.MASTERCARD_DEBITO, CardType.MASTERCARD_CREDITO, CardType.BUSINESS]
    
    card_prefix = "4" if data.card_type in visa_types else "5"
    card_brand = "VISA" if data.card_type in visa_types else "Mastercard"
    
    card_number = card_prefix + ''.join([str(random.randint(0, 9)) for _ in range(15)])
    cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    pin = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    
    expiry_month = datetime.now().month
    expiry_year = datetime.now().year + 5
    expiry = f"{str(expiry_month).zfill(2)}/{str(expiry_year)[-2:]}"
    expiry_full = f"{str(expiry_month).zfill(2)}/{expiry_year}"
    
    # Determine card category (debit/credit) and set limits
    debit_types = [CardType.VISA_DEBITO, CardType.MASTERCARD_DEBITO, CardType.VISA_GOLD_DEBITO, CardType.VISA_PLATINUM_DEBITO, CardType.PREPAGO]
    is_debit = data.card_type in debit_types
    
    # Credit limits based on card type
    credit_limits = {
        "visa_debito": 0, "mastercard_debito": 0, "visa_gold_debito": 0, "visa_platinum_debito": 0,
        "visa_credito": data.credit_limit or 3000,
        "mastercard_credito": data.credit_limit or 3000,
        "visa_gold_credito": data.credit_limit or 10000,
        "visa_platinum_credito": data.credit_limit or 25000,
        "prepago": 0,
        "business": data.credit_limit or 15000
    }
    
    # Daily/Monthly limits
    daily_limits = {
        "visa_debito": 2500, "mastercard_debito": 2500, "prepago": 1000,
        "visa_credito": 3000, "mastercard_credito": 3000,
        "visa_gold_debito": 5000, "visa_gold_credito": 7500,
        "visa_platinum_debito": 10000, "visa_platinum_credito": 15000,
        "business": 20000
    }
    
    monthly_limits = {
        "visa_debito": 10000, "mastercard_debito": 10000, "prepago": 3000,
        "visa_credito": 15000, "mastercard_credito": 15000,
        "visa_gold_debito": 25000, "visa_gold_credito": 35000,
        "visa_platinum_debito": 50000, "visa_platinum_credito": 75000,
        "business": 100000
    }
    
    # Card display name
    card_display_names = {
        "visa_debito": "VISA Débito",
        "mastercard_debito": "Mastercard Débito",
        "visa_credito": "VISA Crédito",
        "mastercard_credito": "Mastercard Crédito",
        "visa_gold_debito": "VISA Gold Débito",
        "visa_gold_credito": "VISA Gold Crédito",
        "visa_platinum_debito": "VISA Platinum Débito",
        "visa_platinum_credito": "VISA Platinum Crédito",
        "prepago": "Prepago",
        "business": "Business"
    }
    
    card_id = f"card_{uuid.uuid4().hex[:12]}"
    
    card = {
        "id": card_id,
        "customer_id": data.customer_id,
        "customer_name": customer["name"],
        "customer_email": customer.get("email"),
        "account_id": account["id"],
        "card_number": card_number,
        "card_number_masked": card_number[:4] + " •••• •••• " + card_number[-4:],
        "cvv": cvv,
        "pin": pin,
        "expiry": expiry,
        "expiry_full": expiry_full,
        "expiry_month": str(expiry_month).zfill(2),
        "expiry_year": str(expiry_year),
        "holder_name": customer["name"].upper(),
        "card_type": data.card_type.value,
        "card_type_display": card_display_names.get(data.card_type.value, data.card_type.value),
        "card_brand": card_brand,
        "card_category": "debito" if is_debit else "credito",
        "credit_limit": credit_limits.get(data.card_type.value, 0),
        "available_credit": credit_limits.get(data.card_type.value, 0),
        "daily_limit": daily_limits.get(data.card_type.value, 2500),
        "monthly_limit": monthly_limits.get(data.card_type.value, 10000),
        "status": "active",
        "is_frozen": False,
        "pin_set": True,
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



# ============================================
# SISTEMA DE VERIFICACIÓN KYC POR VIDEOLLAMADA
# ============================================

class KYCVerificationRequest(BaseModel):
    request_id: str
    meeting_link: str  # Zoom meeting link
    scheduled_time: str  # ISO datetime
    notes: Optional[str] = None

class KYCVerificationComplete(BaseModel):
    verification_status: str  # "approved", "rejected", "pending_documents"
    identity_verified: bool
    document_type: str  # DNI, Pasaporte, NIE
    document_number: str
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None

@router.get("/kyc-verifications")
async def get_kyc_verifications(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Listar verificaciones KYC pendientes y completadas"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if status:
        query["status"] = status
    
    verifications = await db.manobank_kyc_verifications.find(
        query,
        {"_id": 0}
    ).sort("scheduled_time", -1).to_list(100)
    
    return {"verifications": verifications}

@router.post("/kyc-verifications/schedule")
async def schedule_kyc_verification(
    data: KYCVerificationRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Programar verificación KYC por videollamada"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get the account request
    acc_request = await db.manobank_account_requests.find_one({"id": data.request_id})
    if not acc_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    verification_id = f"kyc_{uuid.uuid4().hex[:12]}"
    
    verification = {
        "id": verification_id,
        "request_id": data.request_id,
        "customer_name": acc_request["customer_name"],
        "customer_email": acc_request["customer_email"],
        "customer_phone": acc_request["customer_phone"],
        "customer_dni": acc_request["customer_dni"],
        "meeting_link": data.meeting_link,
        "scheduled_time": data.scheduled_time,
        "notes": data.notes,
        "status": "scheduled",
        "scheduled_by": user.user_id,
        "scheduled_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_kyc_verifications.insert_one(verification)
    
    # Update account request status
    await db.manobank_account_requests.update_one(
        {"id": data.request_id},
        {"$set": {
            "status": "kyc_scheduled",
            "kyc_verification_id": verification_id,
            "kyc_meeting_link": data.meeting_link,
            "kyc_scheduled_time": data.scheduled_time
        }}
    )
    
    verification.pop("_id", None)
    
    return {
        "message": "Verificación KYC programada",
        "verification": verification
    }

@router.post("/kyc-verifications/{verification_id}/complete")
async def complete_kyc_verification(
    verification_id: str,
    data: KYCVerificationComplete,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Completar verificación KYC después de la videollamada"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    verification = await db.manobank_kyc_verifications.find_one({"id": verification_id})
    if not verification:
        raise HTTPException(status_code=404, detail="Verificación no encontrada")
    
    update_data = {
        "status": data.verification_status,
        "identity_verified": data.identity_verified,
        "document_type": data.document_type,
        "document_number": data.document_number,
        "verification_notes": data.notes,
        "rejection_reason": data.rejection_reason,
        "completed_by": user.user_id,
        "completed_by_name": employee.get("name", user.name),
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.manobank_kyc_verifications.update_one(
        {"id": verification_id},
        {"$set": update_data}
    )
    
    # Update account request based on verification result
    if data.verification_status == "approved":
        await db.manobank_account_requests.update_one(
            {"id": verification["request_id"]},
            {"$set": {
                "status": "kyc_verified",
                "kyc_verified": True,
                "kyc_document_type": data.document_type,
                "kyc_document_number": data.document_number
            }}
        )
        message = "Verificación KYC completada - Cliente verificado"
    else:
        await db.manobank_account_requests.update_one(
            {"id": verification["request_id"]},
            {"$set": {
                "status": "kyc_rejected" if data.verification_status == "rejected" else "pending_documents",
                "kyc_rejection_reason": data.rejection_reason
            }}
        )
        message = f"Verificación KYC: {data.verification_status}"
    
    return {"message": message}

@router.get("/kyc-verifications/pending")
async def get_pending_kyc_verifications(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener verificaciones KYC pendientes para hoy"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get scheduled verifications
    verifications = await db.manobank_kyc_verifications.find(
        {"status": "scheduled"},
        {"_id": 0}
    ).sort("scheduled_time", 1).to_list(50)
    
    return {"pending_verifications": verifications}


# ============================================
# GESTIÓN DE CUENTAS (BLOQUEAR/DESBLOQUEAR)
# ============================================

class AccountStatusUpdate(BaseModel):
    status: str  # active, blocked, frozen, closed
    reason: str
    notify_customer: bool = True

@router.get("/accounts")
async def list_accounts(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    """Listar todas las cuentas del banco con paginación"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Limit max to 100 for performance
    limit = min(limit, 100)
    skip = (page - 1) * limit
    
    query = {}
    if status:
        query["status"] = status
    if customer_id:
        query["customer_id"] = customer_id
    
    # Get total count for pagination info
    total_count = await db.manobank_accounts.count_documents(query)
    
    accounts = await db.manobank_accounts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "accounts": accounts,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_count,
            "total_pages": (total_count + limit - 1) // limit
        }
    }

@router.get("/accounts/{account_id}")
async def get_account_details(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Obtener detalles completos de una cuenta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    account = await db.manobank_accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    # Get customer info
    customer = await db.manobank_customers.find_one(
        {"id": account["customer_id"]}, 
        {"_id": 0}
    )
    
    # Get recent transactions
    transactions = await db.manobank_transactions.find(
        {"$or": [{"from_account_id": account_id}, {"to_account_id": account_id}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Get cards linked to account
    cards = await db.manobank_cards.find(
        {"account_id": account_id},
        {"_id": 0, "card_number": 0, "cvv": 0}
    ).to_list(10)
    
    return {
        "account": account,
        "customer": customer,
        "recent_transactions": transactions,
        "cards": cards
    }

@router.patch("/accounts/{account_id}/status")
async def update_account_status(
    account_id: str,
    data: AccountStatusUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Bloquear, desbloquear o congelar una cuenta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    account = await db.manobank_accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    old_status = account.get("status", "active")
    
    # Update account status
    await db.manobank_accounts.update_one(
        {"id": account_id},
        {"$set": {
            "status": data.status,
            "status_reason": data.reason,
            "status_updated_by": user.user_id,
            "status_updated_by_name": employee.get("name", user.name),
            "status_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log the action
    log_entry = {
        "id": f"log_{uuid.uuid4().hex[:12]}",
        "account_id": account_id,
        "action": f"status_change_{data.status}",
        "old_status": old_status,
        "new_status": data.status,
        "reason": data.reason,
        "performed_by": user.user_id,
        "performed_by_name": employee.get("name", user.name),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.manobank_account_logs.insert_one(log_entry)
    
    status_labels = {
        "active": "Activada",
        "blocked": "Bloqueada",
        "frozen": "Congelada",
        "closed": "Cerrada"
    }
    
    return {
        "message": f"Cuenta {status_labels.get(data.status, data.status)}",
        "account_id": account_id,
        "new_status": data.status
    }

# ============================================
# ENVÍO DE TARJETAS A DOMICILIO
# ============================================

class CardShipmentRequest(BaseModel):
    shipping_address_street: Optional[str] = None
    shipping_address_city: Optional[str] = None
    shipping_address_postal_code: Optional[str] = None
    shipping_address_province: Optional[str] = None
    shipping_method: str = "standard"  # standard, express, 24h
    notes: Optional[str] = None
    send_sms_notification: bool = True

@router.post("/cards/{card_id}/ship")
async def ship_card_to_customer(
    card_id: str,
    data: CardShipmentRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Enviar tarjeta física al domicilio del cliente via SEUR"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    # Get card
    card = await db.manobank_cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Check if card already has pending shipment
    existing_shipment = await db.manobank_card_shipments.find_one({
        "card_id": card_id,
        "status": {"$nin": ["delivered", "returned", "cancelled"]}
    })
    if existing_shipment:
        raise HTTPException(status_code=400, detail="Esta tarjeta ya tiene un envío pendiente")
    
    # Get customer
    customer = await db.manobank_customers.find_one({"id": card["customer_id"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Build recipient address
    recipient_address = {
        "street": data.shipping_address_street or customer.get('address_street', ''),
        "city": data.shipping_address_city or customer.get('address_city', ''),
        "postal_code": data.shipping_address_postal_code or customer.get('address_postal_code', ''),
        "province": data.shipping_address_province or customer.get('address_province', ''),
        "country": customer.get('address_country', 'España')
    }
    
    # Validate address
    if not recipient_address["street"] or not recipient_address["city"] or not recipient_address["postal_code"]:
        raise HTTPException(status_code=400, detail="Dirección de envío incompleta. Actualice los datos del cliente.")
    
    # Get shipping config
    shipping_config = await db.manobank_config.find_one({"type": "shipping_config"})
    sender_address = {
        "name": "ManoBank S.A.",
        "street": shipping_config.get("sender_address", "Calle Sor Isabel de Villena 82 bajo") if shipping_config else "Calle Sor Isabel de Villena 82 bajo",
        "city": shipping_config.get("sender_city", "Novelda") if shipping_config else "Novelda",
        "postal_code": shipping_config.get("sender_postal_code", "46819") if shipping_config else "46819",
        "province": shipping_config.get("sender_province", "Valencia") if shipping_config else "Valencia",
        "country": "España"
    }
    
    # Calculate delivery dates based on shipping method
    delivery_days = {"standard": 5, "express": 2, "24h": 1}
    days = delivery_days.get(data.shipping_method, 5)
    estimated_delivery = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    
    shipment_id = f"ship_{uuid.uuid4().hex[:12]}"
    # SEUR-style tracking number
    tracking_number = f"MANO{datetime.now().strftime('%y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    
    shipment = {
        "id": shipment_id,
        "card_id": card_id,
        "customer_id": card["customer_id"],
        "customer_name": customer["name"],
        "customer_phone": customer.get("phone", ""),
        "customer_email": customer.get("email", ""),
        "card_type": card.get("card_type"),
        "card_type_display": card.get("card_type_display", card.get("card_type")),
        "card_masked": card["card_number_masked"],
        
        # SEUR Info
        "carrier": "SEUR",
        "pickup_point_id": shipping_config.get("pickup_point_id", "ES29153") if shipping_config else "ES29153",
        "shipping_method": data.shipping_method,
        "tracking_number": tracking_number,
        
        # Addresses
        "sender_address": sender_address,
        "recipient_address": recipient_address,
        "full_recipient_address": f"{recipient_address['street']}, {recipient_address['postal_code']} {recipient_address['city']}, {recipient_address['province']}",
        
        # Status
        "status": "pending",
        "status_history": [{
            "status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": "Envío creado",
            "updated_by": employee.get("name", user.name)
        }],
        
        # Dates
        "estimated_delivery": estimated_delivery,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "shipped_at": None,
        "delivered_at": None,
        
        # Additional
        "notes": data.notes,
        "created_by": user.user_id,
        "created_by_name": employee.get("name", user.name),
        "sms_notifications_enabled": data.send_sms_notification,
        "signature_required": True
    }
    
    await db.manobank_card_shipments.insert_one(shipment)
    
    # Update card status
    await db.manobank_cards.update_one(
        {"id": card_id},
        {"$set": {
            "physical_card_status": "pending_shipment",
            "shipment_id": shipment_id,
            "tracking_number": tracking_number
        }}
    )
    
    # Send SMS notification if enabled
    if data.send_sms_notification and customer.get("phone"):
        try:
            from services.twilio_sms import send_sms
            await send_sms(
                customer["phone"],
                f"ManoBank: Tu tarjeta {card.get('card_type_display', 'bancaria')} está siendo preparada para envío. Tracking: {tracking_number}"
            )
        except Exception as e:
            print(f"Error sending SMS: {e}")
    
    shipment.pop("_id", None)
    
    return {
        "message": "Envío de tarjeta creado correctamente",
        "shipment": shipment,
        "tracking_number": tracking_number
    }

@router.get("/card-shipments")
async def list_card_shipments(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """Listar todos los envíos de tarjetas"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    query = {}
    if status:
        query["status"] = status
    
    shipments = await db.manobank_card_shipments.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"shipments": shipments}

@router.patch("/card-shipments/{shipment_id}/status")
async def update_shipment_status(
    shipment_id: str,
    status: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    note: Optional[str] = None
):
    """Actualizar estado del envío de tarjeta"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    valid_statuses = ["pending", "preparing", "ready", "shipped", "in_transit", "out_for_delivery", "delivered", "failed", "returned"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Usar: {', '.join(valid_statuses)}")
    
    shipment = await db.manobank_card_shipments.find_one({"id": shipment_id})
    if not shipment:
        raise HTTPException(status_code=404, detail="Envío no encontrado")
    
    # Add to status history
    status_entry = {
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": note or "",
        "updated_by": employee.get("name", user.name)
    }
    
    update_data = {
        "status": status,
        "updated_by": user.user_id,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update specific dates based on status
    if status == "shipped":
        update_data["shipped_at"] = datetime.now(timezone.utc).isoformat()
    elif status == "delivered":
        update_data["delivered_at"] = datetime.now(timezone.utc).isoformat()
        # Activate the card
        await db.manobank_cards.update_one(
            {"id": shipment["card_id"]},
            {"$set": {"physical_card_status": "delivered", "status": "active"}}
        )
    elif status == "failed" or status == "returned":
        await db.manobank_cards.update_one(
            {"id": shipment["card_id"]},
            {"$set": {"physical_card_status": status}}
        )
    
    await db.manobank_card_shipments.update_one(
        {"id": shipment_id},
        {
            "$set": update_data,
            "$push": {"status_history": status_entry}
        }
    )
    
    # Send SMS notification for important status changes
    sms_statuses = ["shipped", "out_for_delivery", "delivered", "failed"]
    if status in sms_statuses and shipment.get("sms_notifications_enabled") and shipment.get("customer_phone"):
        try:
            from services.twilio_sms import send_sms
            sms_messages = {
                "shipped": f"ManoBank: Tu tarjeta ha sido enviada. Tracking: {shipment['tracking_number']}. Entrega estimada: {shipment.get('estimated_delivery', 'próximos días')[:10]}",
                "out_for_delivery": f"ManoBank: Tu tarjeta está en reparto hoy. Tracking: {shipment['tracking_number']}",
                "delivered": f"ManoBank: Tu tarjeta ha sido entregada. ¡Actívala en tu área de cliente!",
                "failed": f"ManoBank: No pudimos entregar tu tarjeta. Contacta con nosotros: 900 123 456"
            }
            await send_sms(shipment["customer_phone"], sms_messages.get(status, ""))
        except Exception as e:
            print(f"Error sending SMS: {e}")
    
    status_labels = {
        "pending": "Pendiente",
        "preparing": "Preparando",
        "ready": "Listo para enviar",
        "shipped": "Enviado",
        "in_transit": "En tránsito",
        "out_for_delivery": "En reparto",
        "delivered": "Entregado",
        "failed": "Fallido",
        "returned": "Devuelto"
    }
    
    return {"message": f"Estado actualizado: {status_labels.get(status, status)}", "status": status}

# ============================================
# GESTIÓN DE CLIENTES
# ============================================

@router.patch("/customers/{customer_id}")
async def update_customer(
    customer_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    name: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    address_street: Optional[str] = None,
    address_city: Optional[str] = None,
    address_postal_code: Optional[str] = None,
    address_province: Optional[str] = None,
    status: Optional[str] = None
):
    """Actualizar datos de un cliente"""
    user, employee = await require_bank_employee(request, session_token)
    db = get_db()
    
    update_data = {}
    if name: update_data["name"] = name
    if phone: update_data["phone"] = phone
    if email: update_data["email"] = email
    if address_street: update_data["address_street"] = address_street
    if address_city: update_data["address_city"] = address_city
    if address_postal_code: update_data["address_postal_code"] = address_postal_code
    if address_province: update_data["address_province"] = address_province
    if status: update_data["status"] = status
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user.user_id
    
    result = await db.manobank_customers.update_one(
        {"id": customer_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    return {"message": "Cliente actualizado correctamente"}
