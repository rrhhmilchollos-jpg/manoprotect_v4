"""
ManoProtect - Enterprise Employee Portal API Routes
Complete backend for scalable employee management system
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie, Query, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import json
import os
import stripe

from models.enterprise_portal import (
    EmployeeRole, EmployeeStatus, RiskLevel, SOSStatus, SOSPriority,
    AlertType, PaymentStatus, DeviceOrderStatus,
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    SOSResponse, DashboardStats, ROLE_PERMISSIONS
)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_API_KEY')

# ============================================
# 2FA RATE LIMITING CONFIGURATION
# ============================================
MAX_2FA_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

router = APIRouter(prefix="/enterprise", tags=["Enterprise Portal"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Enterprise Portal DB initialized: {db is not None}")

# ============================================
# UTILITY FUNCTIONS
# ============================================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

async def get_current_employee(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current logged in employee from session"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": session_token},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee

def check_permission(employee: dict, required_permission: str) -> bool:
    """Check if employee has required permission"""
    role = employee.get("role", "operator")
    permissions = ROLE_PERMISSIONS.get(EmployeeRole(role), [])
    
    if "all" in permissions:
        return True
    
    return required_permission in permissions or required_permission in employee.get("permissions", [])

async def create_audit_log(
    employee: dict,
    action: str,
    resource_type: str,
    resource_id: str,
    details: dict = {},
    request: Request = None
):
    """Create audit log entry"""
    log = {
        "log_id": generate_id("log_"),
        "employee_id": employee.get("employee_id"),
        "employee_name": employee.get("name"),
        "employee_role": employee.get("role"),
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details,
        "ip_address": request.client.host if request else None,
        "user_agent": request.headers.get("user-agent") if request else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.audit_logs.insert_one(log)

# ============================================
# AUTHENTICATION
# ============================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Login2FARequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: str

@router.post("/auth/login")
async def enterprise_login(data: LoginRequest, response: Response, request: Request):
    """Enterprise employee login - Step 1: Validate credentials and send SMS code if 2FA enabled"""
    from services.sms_service import sms_service
    
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    employee = await db.enterprise_employees.find_one({"email": data.email.lower()})
    
    if not employee:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if employee.get("status") != "active":
        raise HTTPException(status_code=403, detail="Cuenta suspendida o inactiva")
    
    if hash_password(data.password) != employee.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Check if 2FA is enabled
    if employee.get("two_factor_enabled", False):
        phone = employee.get("phone")
        
        if not phone:
            # No phone configured, allow login without 2FA
            pass
        else:
            # Generate and send SMS code
            code = sms_service.generate_code(6)
            code_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)
            
            # Store code in database
            await db.enterprise_employees.update_one(
                {"employee_id": employee["employee_id"]},
                {"$set": {
                    "sms_verification_code": code,
                    "sms_code_expiry": code_expiry.isoformat(),
                    "sms_code_attempts": 0
                }}
            )
            
            # Send SMS
            sms_result = await sms_service.send_verification_code(phone, code)
            
            if sms_result.get("success"):
                return {
                    "success": False,
                    "requires_2fa": True,
                    "two_factor_method": "sms",
                    "employee_id": employee["employee_id"],
                    "name": employee["name"],
                    "phone_masked": sms_result.get("phone_masked", f"***{phone[-4:]}"),
                    "message": "Se ha enviado un código de verificación a tu teléfono"
                }
            else:
                # SMS failed, log error but allow alternative
                print(f"[SMS] Failed to send code: {sms_result.get('error')}")
                return {
                    "success": False,
                    "requires_2fa": True,
                    "two_factor_method": "sms",
                    "employee_id": employee["employee_id"],
                    "name": employee["name"],
                    "phone_masked": f"***{phone[-4:]}",
                    "message": "Error al enviar SMS. Usa un código de respaldo o contacta IT.",
                    "sms_error": True
                }
    
    # No 2FA - proceed with normal login
    session_token = uuid.uuid4().hex
    
    # Update login info
    await db.enterprise_employees.update_one(
        {"employee_id": employee["employee_id"]},
        {"$set": {
            "session_token": session_token,
            "last_login": datetime.now(timezone.utc).isoformat(),
            "last_ip": request.client.host
        },
        "$push": {
            "login_history": {
                "$each": [{
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "ip": request.client.host,
                    "user_agent": request.headers.get("user-agent")
                }],
                "$slice": -50  # Keep last 50 logins
            }
        }}
    )
    
    # Set cookie
    response.set_cookie(
        key="enterprise_session",
        value=session_token,
        httponly=True,
        max_age=86400 * 7,  # 7 days
        samesite="lax"
    )
    
    # Audit log
    await create_audit_log(employee, "login", "auth", employee["employee_id"], request=request)
    
    return {
        "success": True,
        "requires_2fa": False,
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "email": employee["email"],
        "role": employee["role"],
        "permissions": ROLE_PERMISSIONS.get(EmployeeRole(employee["role"]), []),
        "session_token": session_token
    }

@router.post("/auth/login-2fa")
async def enterprise_login_with_2fa(data: Login2FARequest, response: Response, request: Request, background_tasks: BackgroundTasks):
    """Enterprise employee login - Step 2: Verify SMS code or backup code with brute force protection"""
    from services.email_service import email_service
    
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    employee = await db.enterprise_employees.find_one({"email": data.email.lower()})
    
    if not employee:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if employee.get("status") != "active":
        raise HTTPException(status_code=403, detail="Cuenta suspendida o inactiva")
    
    if hash_password(data.password) != employee.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    if not employee.get("two_factor_enabled"):
        raise HTTPException(status_code=400, detail="2FA no está habilitado para esta cuenta")
    
    # ============================================
    # 2FA BRUTE FORCE PROTECTION
    # ============================================
    failed_attempts = employee.get("two_factor_failed_attempts", 0)
    lockout_until = employee.get("two_factor_lockout_until")
    
    # Check if account is currently locked
    if lockout_until:
        lockout_time = datetime.fromisoformat(lockout_until.replace("Z", "+00:00"))
        if datetime.now(timezone.utc) < lockout_time:
            remaining_minutes = int((lockout_time - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=429, 
                detail=f"Cuenta bloqueada temporalmente. Demasiados intentos fallidos. Inténtalo de nuevo en {remaining_minutes} minutos."
            )
        else:
            # Lockout expired, reset counters
            await db.enterprise_employees.update_one(
                {"employee_id": employee["employee_id"]},
                {"$set": {"two_factor_failed_attempts": 0}, "$unset": {"two_factor_lockout_until": ""}}
            )
            failed_attempts = 0
    
    # Verify code - SMS code, backup code, or TOTP (legacy)
    backup_codes = employee.get("two_factor_backup_codes", [])
    sms_code = employee.get("sms_verification_code")
    sms_expiry = employee.get("sms_code_expiry")
    code_valid = False
    
    # Check if it's a backup code
    if data.totp_code in backup_codes:
        # Remove used backup code and reset failed attempts
        backup_codes.remove(data.totp_code)
        await db.enterprise_employees.update_one(
            {"employee_id": employee["employee_id"]},
            {"$set": {"two_factor_backup_codes": backup_codes, "two_factor_failed_attempts": 0},
             "$unset": {"sms_verification_code": "", "sms_code_expiry": ""}}
        )
        code_valid = True
    # Check SMS code
    elif sms_code and data.totp_code == sms_code:
        # Verify SMS code hasn't expired
        if sms_expiry:
            expiry_time = datetime.fromisoformat(sms_expiry.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > expiry_time:
                raise HTTPException(status_code=401, detail="Código SMS expirado. Inicia sesión de nuevo para recibir un nuevo código.")
        
        # Clear SMS code after successful use
        await db.enterprise_employees.update_one(
            {"employee_id": employee["employee_id"]},
            {"$set": {"two_factor_failed_attempts": 0},
             "$unset": {"sms_verification_code": "", "sms_code_expiry": ""}}
        )
        code_valid = True
    else:
        # Try legacy TOTP verification as fallback
        try:
            import pyotp
            secret = employee.get("two_factor_secret")
            if secret:
                totp = pyotp.TOTP(secret)
                if totp.verify(data.totp_code, valid_window=1):
                    await db.enterprise_employees.update_one(
                        {"employee_id": employee["employee_id"]},
                        {"$set": {"two_factor_failed_attempts": 0},
                         "$unset": {"sms_verification_code": "", "sms_code_expiry": ""}}
                    )
                    code_valid = True
        except:
            pass
    
    if not code_valid:
        # Increment failed attempts
        new_failed_attempts = failed_attempts + 1
        update_data = {"two_factor_failed_attempts": new_failed_attempts}
        
        # Check if we need to lock the account
        if new_failed_attempts >= MAX_2FA_ATTEMPTS:
            lockout_time = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            update_data["two_factor_lockout_until"] = lockout_time.isoformat()
            
            await db.enterprise_employees.update_one(
                {"employee_id": employee["employee_id"]},
                {"$set": update_data}
            )
            
            # Log the lockout
            await create_audit_log(employee, "2fa_lockout", "security", employee["employee_id"], 
                                  {"failed_attempts": new_failed_attempts, "lockout_minutes": LOCKOUT_DURATION_MINUTES}, request)
            
            raise HTTPException(
                status_code=429,
                detail=f"Cuenta bloqueada por {LOCKOUT_DURATION_MINUTES} minutos debido a {MAX_2FA_ATTEMPTS} intentos fallidos."
            )
        
        await db.enterprise_employees.update_one(
            {"employee_id": employee["employee_id"]},
            {"$set": update_data}
        )
        
        remaining_attempts = MAX_2FA_ATTEMPTS - new_failed_attempts
        raise HTTPException(
            status_code=401, 
            detail=f"Código inválido. Te quedan {remaining_attempts} intentos."
        )
    
    # 2FA verified - complete login
    session_token = uuid.uuid4().hex
    current_ip = request.client.host
    current_user_agent = request.headers.get("user-agent", "")
    
    # Check if this is a new IP or device
    login_history = employee.get("login_history", [])
    known_ips = set(entry.get("ip") for entry in login_history if entry.get("ip"))
    known_agents = set(entry.get("user_agent", "")[:50] for entry in login_history if entry.get("user_agent"))
    
    is_new_ip = current_ip not in known_ips
    is_new_device = current_user_agent[:50] not in known_agents
    
    await db.enterprise_employees.update_one(
        {"employee_id": employee["employee_id"]},
        {"$set": {
            "session_token": session_token,
            "last_login": datetime.now(timezone.utc).isoformat(),
            "last_ip": current_ip,
            "two_factor_verified_at": datetime.now(timezone.utc).isoformat()
        },
        "$push": {
            "login_history": {
                "$each": [{
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "ip": current_ip,
                    "user_agent": current_user_agent,
                    "method": "2fa"
                }],
                "$slice": -50
            }
        }}
    )
    
    response.set_cookie(
        key="enterprise_session",
        value=session_token,
        httponly=True,
        max_age=86400 * 7,
        samesite="lax"
    )
    
    await create_audit_log(employee, "login_2fa", "auth", employee["employee_id"], request=request)
    
    # Send security alert email if new IP or device detected
    if is_new_ip or is_new_device:
        login_alert_data = {
            "employee_name": employee.get("name", "Usuario"),
            "ip_address": current_ip,
            "user_agent": current_user_agent,
            "timestamp": datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M'),
            "is_new_ip": is_new_ip,
            "is_new_device": is_new_device,
            "login_successful": True
        }
        
        # Send email in background to not block the response
        background_tasks.add_task(
            email_service.send_2fa_login_alert,
            employee["employee_id"],
            employee["email"],
            login_alert_data
        )
    
    return {
        "success": True,
        "requires_2fa": False,
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "email": employee["email"],
        "role": employee["role"],
        "permissions": ROLE_PERMISSIONS.get(EmployeeRole(employee["role"]), []),
        "session_token": session_token
    }

@router.post("/auth/logout")
async def enterprise_logout(
    response: Response,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Enterprise employee logout"""
    if enterprise_session:
        employee = await db.enterprise_employees.find_one({"session_token": enterprise_session})
        if employee:
            await db.enterprise_employees.update_one(
                {"employee_id": employee["employee_id"]},
                {"$unset": {"session_token": ""}}
            )
            await create_audit_log(employee, "logout", "auth", employee["employee_id"], request=request)
    
    response.delete_cookie("enterprise_session")
    return {"success": True, "message": "Sesión cerrada"}

@router.get("/auth/me")
async def get_current_user(request: Request, enterprise_session: Optional[str] = Cookie(None)):
    """Get current logged in employee"""
    employee = await get_current_employee(request, enterprise_session)
    employee["permissions"] = ROLE_PERMISSIONS.get(EmployeeRole(employee["role"]), [])
    return employee

# ============================================
# DASHBOARD
# ============================================

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get dashboard statistics"""
    employee = await get_current_employee(request, enterprise_session)
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today_start.replace(day=1)
    
    # Employees stats
    total_employees = await db.enterprise_employees.count_documents({})
    active_employees = await db.enterprise_employees.count_documents({"status": "active"})
    employees_at_risk = await db.enterprise_employees.count_documents({"risk_level": {"$in": ["high", "critical"]}})
    
    # Clients stats
    total_clients = await db.users.count_documents({})
    premium_clients = await db.users.count_documents({"plan": {"$ne": "free"}})
    trial_clients = await db.users.count_documents({"is_trial": True})
    
    # SOS stats
    pending_sos = await db.sos_events.count_documents({"status": {"$in": ["pending", "in_progress"]}})
    resolved_sos_today = await db.sos_events.count_documents({
        "status": "resolved",
        "resolved_at": {"$gte": today_start.isoformat()}
    })
    
    # Get average response time
    pipeline = [
        {"$match": {"response_time_seconds": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$response_time_seconds"}}}
    ]
    avg_response = await db.sos_events.aggregate(pipeline).to_list(1)
    avg_response_time = int(avg_response[0]["avg"]) if avg_response else 0
    
    # Alerts stats
    total_alerts_today = await db.security_alerts.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    blocked_threats_today = await db.security_alerts.count_documents({
        "created_at": {"$gte": today_start.isoformat()},
        "blocked": True
    })
    
    # Revenue stats
    revenue_pipeline_today = [
        {"$match": {"status": "completed", "created_at": {"$gte": today_start.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_today_result = await db.payments.aggregate(revenue_pipeline_today).to_list(1)
    revenue_today = revenue_today_result[0]["total"] if revenue_today_result else 0
    
    revenue_pipeline_month = [
        {"$match": {"status": "completed", "created_at": {"$gte": month_start.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_month_result = await db.payments.aggregate(revenue_pipeline_month).to_list(1)
    revenue_month = revenue_month_result[0]["total"] if revenue_month_result else 0
    
    # Device orders stats
    pending_device_orders = await db.device_orders.count_documents({"status": {"$in": ["pending", "processing"]}})
    shipped_device_orders = await db.device_orders.count_documents({"status": "shipped"})
    
    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "employees_at_risk": employees_at_risk,
        "total_clients": total_clients,
        "premium_clients": premium_clients,
        "trial_clients": trial_clients,
        "pending_sos": pending_sos,
        "resolved_sos_today": resolved_sos_today,
        "avg_response_time": avg_response_time,
        "total_alerts_today": total_alerts_today,
        "blocked_threats_today": blocked_threats_today,
        "revenue_today": revenue_today,
        "revenue_month": revenue_month,
        "pending_device_orders": pending_device_orders,
        "shipped_device_orders": shipped_device_orders
    }

@router.get("/dashboard/charts")
async def get_dashboard_charts(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    days: int = Query(7, ge=1, le=30)
):
    """Get chart data for dashboard"""
    employee = await get_current_employee(request, enterprise_session)
    
    # Generate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    # Phishing clicks trend
    phishing_pipeline = [
        {"$match": {"alert_type": "phishing", "created_at": {"$gte": start_date.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    phishing_trend = await db.security_alerts.aggregate(phishing_pipeline).to_list(100)
    
    # SOS events trend
    sos_pipeline = [
        {"$match": {"created_at": {"$gte": start_date.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    sos_trend = await db.sos_events.aggregate(sos_pipeline).to_list(100)
    
    # Revenue trend
    revenue_pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": start_date.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"_id": 1}}
    ]
    revenue_trend = await db.payments.aggregate(revenue_pipeline).to_list(100)
    
    # Users registration trend
    users_pipeline = [
        {"$match": {"created_at": {"$gte": start_date.isoformat()}}},
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    users_trend = await db.users.aggregate(users_pipeline).to_list(100)
    
    # Risk by department
    risk_pipeline = [
        {"$match": {"department": {"$exists": True, "$ne": None}}},
        {"$group": {
            "_id": "$department",
            "count": {"$sum": 1},
            "avg_risk": {"$avg": "$risk_score"},
            "high_risk": {"$sum": {"$cond": [{"$in": ["$risk_level", ["high", "critical"]]}, 1, 0]}}
        }}
    ]
    risk_by_dept = await db.enterprise_employees.aggregate(risk_pipeline).to_list(100)
    
    return {
        "phishing_trend": [{"date": p["_id"], "count": p["count"]} for p in phishing_trend],
        "sos_trend": [{"date": s["_id"], "count": s["count"]} for s in sos_trend],
        "revenue_trend": [{"date": r["_id"], "amount": r["total"]} for r in revenue_trend],
        "users_trend": [{"date": u["_id"], "count": u["count"]} for u in users_trend],
        "risk_by_department": [
            {
                "department": d["_id"],
                "employee_count": d["count"],
                "avg_risk_score": round(d["avg_risk"], 1) if d["avg_risk"] else 0,
                "high_risk_count": d["high_risk"]
            }
            for d in risk_by_dept
        ]
    }

# ============================================
# EMPLOYEES MANAGEMENT
# ============================================

@router.get("/employees")
async def list_employees(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    search: Optional[str] = None,
    status: Optional[str] = None,
    role: Optional[str] = None,
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    """List all employees with filters"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos para ver empleados")
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}}
        ]
    if status:
        query["status"] = status
    if role:
        query["role"] = role
    if department:
        query["department"] = department
    if risk_level:
        query["risk_level"] = risk_level
    
    # Count and paginate
    total = await db.enterprise_employees.count_documents(query)
    skip = (page - 1) * limit
    
    sort_direction = -1 if sort_order == "desc" else 1
    
    employees = await db.enterprise_employees.find(
        query,
        {"_id": 0, "password_hash": 0, "session_token": 0}
    ).sort(sort_by, sort_direction).skip(skip).limit(limit).to_list(limit)
    
    return {
        "employees": employees,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "limit": limit
    }

@router.get("/employees/{employee_id}")
async def get_employee(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get employee details"""
    current = await get_current_employee(request, enterprise_session)
    
    # Allow viewing own profile
    if current["employee_id"] != employee_id and not check_permission(current, "view_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    employee = await db.enterprise_employees.find_one(
        {"employee_id": employee_id},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    )
    
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return employee

@router.post("/employees")
async def create_employee(
    data: EmployeeCreate,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Create new employee"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos para crear empleados")
    
    # Check email exists
    existing = await db.enterprise_employees.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    employee = {
        "employee_id": generate_id("emp_"),
        "company_id": current.get("company_id", "manoprotect"),
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone,
        "department": data.department,
        "role": data.role.value,
        "status": data.status.value,
        "password_hash": hash_password(data.password),
        "permissions": data.permissions,
        "avatar_url": None,
        "risk_score": 0,
        "risk_level": "low",
        "failed_simulations": 0,
        "phishing_clicks": 0,
        "devices": [],
        "two_factor_enabled": False,
        "last_login": None,
        "last_ip": None,
        "login_history": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.enterprise_employees.insert_one(employee)
    await create_audit_log(current, "create", "employee", employee["employee_id"], 
                          {"name": data.name, "role": data.role.value}, request)
    
    del employee["password_hash"]
    if "_id" in employee:
        del employee["_id"]
    
    return {"success": True, "employee": employee}

@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Update employee"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if "role" in update_data:
        update_data["role"] = update_data["role"].value
    if "status" in update_data:
        update_data["status"] = update_data["status"].value
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    await create_audit_log(current, "update", "employee", employee_id, update_data, request)
    
    return {"success": True, "message": "Empleado actualizado"}

@router.patch("/employees/{employee_id}/suspend")
async def suspend_employee(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Suspend employee"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    result = await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"status": "suspended", "updated_at": datetime.now(timezone.utc).isoformat()},
         "$unset": {"session_token": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    await create_audit_log(current, "suspend", "employee", employee_id, {}, request)
    
    return {"success": True, "message": "Empleado suspendido"}

@router.patch("/employees/{employee_id}/activate")
async def activate_employee(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Activate employee"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    result = await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"status": "active", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await create_audit_log(current, "activate", "employee", employee_id, {}, request)
    
    return {"success": True, "message": "Empleado activado"}

@router.post("/employees/{employee_id}/reset-password")
async def reset_employee_password(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Reset employee password"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    import secrets
    new_password = secrets.token_urlsafe(12)
    
    result = await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "password_hash": hash_password(new_password),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        "$unset": {"session_token": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    await create_audit_log(current, "reset_password", "employee", employee_id, {}, request)
    
    return {"success": True, "temporary_password": new_password}

@router.post("/employees/{employee_id}/force-logout")
async def force_logout_employee(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Force logout employee"""
    current = await get_current_employee(request, enterprise_session)
    
    if not check_permission(current, "manage_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$unset": {"session_token": ""}}
    )
    
    await create_audit_log(current, "force_logout", "employee", employee_id, {}, request)
    
    return {"success": True, "message": "Sesión cerrada forzadamente"}

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Delete employee (only super_admin and admin)"""
    current = await get_current_employee(request, enterprise_session)
    
    if current["role"] not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar empleados")
    
    # Prevent self-deletion
    if current["employee_id"] == employee_id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    employee = await db.enterprise_employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    await db.enterprise_employees.delete_one({"employee_id": employee_id})
    await create_audit_log(current, "delete", "employee", employee_id, 
                          {"deleted_name": employee["name"]}, request)
    
    return {"success": True, "message": "Empleado eliminado"}

@router.get("/employees/{employee_id}/activity")
async def get_employee_activity(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Get employee activity history"""
    current = await get_current_employee(request, enterprise_session)
    
    if current["employee_id"] != employee_id and not check_permission(current, "view_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    # Get audit logs for this employee
    logs = await db.audit_logs.find(
        {"employee_id": employee_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Get login history
    employee = await db.enterprise_employees.find_one(
        {"employee_id": employee_id},
        {"login_history": 1}
    )
    
    return {
        "activity_logs": logs,
        "login_history": employee.get("login_history", []) if employee else []
    }

@router.get("/employees/{employee_id}/security")
async def get_employee_security(
    employee_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get employee security metrics"""
    current = await get_current_employee(request, enterprise_session)
    
    if current["employee_id"] != employee_id and not check_permission(current, "view_employees"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    employee = await db.enterprise_employees.find_one(
        {"employee_id": employee_id},
        {"_id": 0, "risk_score": 1, "risk_level": 1, "failed_simulations": 1, 
         "phishing_clicks": 1, "two_factor_enabled": 1, "devices": 1}
    )
    
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Get phishing simulation results
    simulations = await db.phishing_simulations.find(
        {"employee_id": employee_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Security recommendations
    recommendations = []
    if not employee.get("two_factor_enabled"):
        recommendations.append("Activar autenticación de dos factores")
    if employee.get("risk_score", 0) > 50:
        recommendations.append("Completar formación de seguridad adicional")
    if employee.get("phishing_clicks", 0) > 2:
        recommendations.append("Revisar guía de detección de phishing")
    
    return {
        **employee,
        "simulations": simulations,
        "recommendations": recommendations
    }

# ============================================
# CLIENTS MANAGEMENT  
# ============================================

@router.get("/clients")
async def list_clients(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    search: Optional[str] = None,
    plan: Optional[str] = None,
    status: Optional[str] = None,
    has_sos_button: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List all clients"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_clients"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    if plan:
        query["plan"] = plan
    if status:
        query["subscription_status"] = status
    if has_sos_button is not None:
        query["sos_button_requested"] = has_sos_button
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    
    clients = await db.users.find(
        query,
        {"_id": 0, "password_hash": 0, "session_token": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "clients": clients,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/clients/{client_id}")
async def get_client(
    client_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get client details with real payment history"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_clients"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    # Try to find by user_id first, then by email
    client = await db.users.find_one(
        {"user_id": client_id},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    )
    
    if not client:
        # Try finding by email as fallback
        client = await db.users.find_one(
            {"email": client_id},
            {"_id": 0, "password_hash": 0, "session_token": 0}
        )
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    user_id = client.get("user_id")
    user_email = client.get("email")
    
    # Get SOS events count
    sos_count = await db.sos_events.count_documents({
        "$or": [{"client_id": user_id}, {"user_id": user_id}]
    }) if user_id else 0
    
    # Get alerts count
    alerts_count = await db.security_alerts.count_documents({
        "$or": [{"client_id": user_id}, {"user_id": user_id}]
    }) if user_id else 0
    
    # Get REAL payments - from multiple possible collections and fields
    payments = []
    
    # Search in payments collection with multiple field combinations
    payment_queries = [
        {"client_id": user_id},
        {"user_id": user_id},
        {"email": user_email},
        {"client_email": user_email}
    ]
    
    for query in payment_queries:
        if query.get("client_id") or query.get("user_id") or query.get("email") or query.get("client_email"):
            found_payments = await db.payments.find(
                query,
                {"_id": 0}
            ).sort("created_at", -1).limit(50).to_list(50)
            
            for p in found_payments:
                # Check if payment already exists (avoid duplicates)
                payment_id = p.get("payment_id") or p.get("stripe_payment_id") or p.get("id")
                if not any(existing.get("payment_id") == payment_id or 
                          existing.get("stripe_payment_id") == payment_id for existing in payments):
                    # Normalize payment data
                    normalized = {
                        "payment_id": payment_id or f"pay_{len(payments)}",
                        "amount": p.get("amount", 0),
                        "status": p.get("status", "unknown"),
                        "plan": p.get("plan") or p.get("product") or p.get("description") or "N/A",
                        "created_at": p.get("created_at") or p.get("date") or p.get("timestamp"),
                        "currency": p.get("currency", "EUR"),
                        "payment_method": p.get("payment_method") or p.get("method") or "card",
                        "stripe_session_id": p.get("stripe_session_id"),
                        "invoice_id": p.get("invoice_id")
                    }
                    payments.append(normalized)
    
    # Also check stripe_payments collection if exists
    try:
        stripe_payments = await db.stripe_payments.find(
            {"$or": [{"email": user_email}, {"customer_email": user_email}]},
            {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        for sp in stripe_payments:
            payment_id = sp.get("payment_id") or sp.get("stripe_payment_id")
            if not any(existing.get("payment_id") == payment_id for existing in payments):
                payments.append({
                    "payment_id": payment_id,
                    "amount": sp.get("amount", 0),
                    "status": sp.get("status", "unknown"),
                    "plan": sp.get("plan") or sp.get("description") or "Stripe",
                    "created_at": sp.get("created_at"),
                    "currency": sp.get("currency", "EUR"),
                    "payment_method": "stripe",
                    "stripe_session_id": sp.get("session_id")
                })
    except Exception:
        pass  # Collection might not exist
    
    # Sort payments by date (newest first)
    payments.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    
    # Limit to most recent 20 real payments
    payments = payments[:20]
    
    # Get device orders
    device_order = await db.device_orders.find_one(
        {"$or": [{"client_id": user_id}, {"user_id": user_id}, {"user_email": user_email}]},
        {"_id": 0}
    )
    
    # Also check sos_orders collection
    sos_order = await db.sos_orders.find_one(
        {"$or": [{"user_id": user_id}, {"email": user_email}]},
        {"_id": 0}
    )
    
    return {
        **client,
        "sos_events_count": sos_count,
        "alerts_count": alerts_count,
        "payment_history": payments,  # Real payment history
        "total_payments": len(payments),
        "device_order": device_order or sos_order
    }

# ============================================
# SOS EVENTS MANAGEMENT
# ============================================

@router.get("/sos")
async def list_sos_events(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List SOS events"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_sos"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_operator_id"] = assigned_to
    
    total = await db.sos_events.count_documents(query)
    skip = (page - 1) * limit
    
    events = await db.sos_events.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "events": events,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/sos/pending")
async def get_pending_sos(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get pending SOS events (real-time view)"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_sos"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    events = await db.sos_events.find(
        {"status": {"$in": ["pending", "in_progress"]}},
        {"_id": 0}
    ).sort([("priority", -1), ("created_at", 1)]).to_list(100)
    
    return {"events": events, "count": len(events)}

@router.get("/sos/{sos_id}")
async def get_sos_event(
    sos_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get SOS event details"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_sos"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    event = await db.sos_events.find_one(
        {"sos_id": sos_id},
        {"_id": 0}
    )
    
    if not event:
        raise HTTPException(status_code=404, detail="Evento SOS no encontrado")
    
    # Get client info
    client = await db.users.find_one(
        {"user_id": event["client_id"]},
        {"_id": 0, "name": 1, "phone": 1, "email": 1, "emergency_contacts": 1}
    )
    
    return {**event, "client_details": client}

@router.post("/sos/{sos_id}/respond")
async def respond_to_sos(
    sos_id: str,
    data: SOSResponse,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Respond to SOS event"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "respond_sos"):
        raise HTTPException(status_code=403, detail="Sin permisos para responder SOS")
    
    event = await db.sos_events.find_one({"sos_id": sos_id})
    if not event:
        raise HTTPException(status_code=404, detail="Evento SOS no encontrado")
    
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.action == "assign":
        update["assigned_operator_id"] = employee["employee_id"]
        update["assigned_operator_name"] = employee["name"]
        update["status"] = "in_progress"
        if not event.get("response_time_seconds"):
            created = datetime.fromisoformat(event["created_at"].replace("Z", "+00:00"))
            update["response_time_seconds"] = int((datetime.now(timezone.utc) - created).total_seconds())
    
    elif data.action == "call_emergency":
        update["emergency_service_called"] = True
        update["emergency_service_type"] = data.emergency_service
        update["$push"] = {
            "notes": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "author": employee["name"],
                "content": f"Contactado servicio de emergencia: {data.emergency_service}"
            }
        }
    
    elif data.action == "add_note":
        update["$push"] = {
            "notes": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "author": employee["name"],
                "content": data.note
            }
        }
    
    elif data.action == "resolve":
        update["status"] = data.status.value if data.status else "resolved"
        update["resolved_at"] = datetime.now(timezone.utc).isoformat()
        created = datetime.fromisoformat(event["created_at"].replace("Z", "+00:00"))
        update["resolution_time_seconds"] = int((datetime.now(timezone.utc) - created).total_seconds())
    
    elif data.action == "escalate":
        update["status"] = "escalated"
        update["priority"] = "critical"
    
    # Handle $push separately
    push_data = update.pop("$push", None)
    
    await db.sos_events.update_one(
        {"sos_id": sos_id},
        {"$set": update, **({"$push": push_data} if push_data else {})}
    )
    
    await create_audit_log(employee, f"sos_{data.action}", "sos", sos_id, 
                          {"action": data.action}, request)
    
    return {"success": True, "message": f"Acción '{data.action}' ejecutada"}

# ============================================
# DEVICE ORDERS
# ============================================

@router.get("/device-orders")
async def list_device_orders(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List device orders"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_device_orders"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if status:
        query["status"] = status
    
    total = await db.device_orders.count_documents(query)
    skip = (page - 1) * limit
    
    orders = await db.device_orders.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.patch("/device-orders/{order_id}")
async def update_device_order(
    order_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    tracking_number: Optional[str] = None,
    shipping_carrier: Optional[str] = None,
    notes: Optional[str] = None
):
    """Update device order"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "manage_device_orders"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    update = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if status:
        update["status"] = status
        if status == "shipped":
            update["shipped_at"] = datetime.now(timezone.utc).isoformat()
        elif status == "delivered":
            update["delivered_at"] = datetime.now(timezone.utc).isoformat()
    if tracking_number:
        update["tracking_number"] = tracking_number
    if shipping_carrier:
        update["shipping_carrier"] = shipping_carrier
    if notes:
        update["notes"] = notes
    
    await db.device_orders.update_one(
        {"order_id": order_id},
        {"$set": update}
    )
    
    await create_audit_log(employee, "update", "device_order", order_id, update, request)
    
    return {"success": True, "message": "Pedido actualizado"}

# ============================================
# PAYMENTS / CASH FLOW
# ============================================

@router.get("/payments")
async def list_payments(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List payments"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_payments"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if status:
        query["status"] = status
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        query.setdefault("created_at", {})["$lte"] = end_date
    
    total = await db.payments.count_documents(query)
    skip = (page - 1) * limit
    
    payments = await db.payments.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Calculate totals
    total_pipeline = [
        {"$match": {**query, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_result = await db.payments.aggregate(total_pipeline).to_list(1)
    total_amount = total_result[0]["total"] if total_result else 0
    
    return {
        "payments": payments,
        "total": total,
        "total_amount": total_amount,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/payments/summary")
async def get_payments_summary(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get payments summary"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_payments"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Today's revenue
    today_pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": today.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    today_result = await db.payments.aggregate(today_pipeline).to_list(1)
    
    # Week revenue
    week_pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": week_ago.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    week_result = await db.payments.aggregate(week_pipeline).to_list(1)
    
    # Month revenue
    month_pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": month_ago.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    month_result = await db.payments.aggregate(month_pipeline).to_list(1)
    
    # By plan
    plan_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": "$plan", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    plan_result = await db.payments.aggregate(plan_pipeline).to_list(100)
    
    return {
        "today": {
            "amount": today_result[0]["total"] if today_result else 0,
            "count": today_result[0]["count"] if today_result else 0
        },
        "week": {
            "amount": week_result[0]["total"] if week_result else 0,
            "count": week_result[0]["count"] if week_result else 0
        },
        "month": {
            "amount": month_result[0]["total"] if month_result else 0,
            "count": month_result[0]["count"] if month_result else 0
        },
        "by_plan": [{"plan": p["_id"], "amount": p["total"], "count": p["count"]} for p in plan_result]
    }

# ============================================
# SECURITY ALERTS
# ============================================

@router.get("/alerts")
async def list_alerts(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """List security alerts"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_alerts"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if alert_type:
        query["alert_type"] = alert_type
    if severity:
        query["severity"] = severity
    
    total = await db.security_alerts.count_documents(query)
    skip = (page - 1) * limit
    
    alerts = await db.security_alerts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "alerts": alerts,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.patch("/alerts/{alert_id}/review")
async def review_alert(
    alert_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    false_positive: bool = False
):
    """Mark alert as reviewed"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "manage_alerts"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    await db.security_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {
            "reviewed_by": employee["employee_id"],
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "false_positive": false_positive
        }}
    )
    
    return {"success": True}

# ============================================
# AUDIT LOGS
# ============================================

@router.get("/audit-logs")
async def list_audit_logs(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    employee_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """List audit logs"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_audit_logs"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    
    total = await db.audit_logs.count_documents(query)
    skip = (page - 1) * limit
    
    logs = await db.audit_logs.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "logs": logs,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

# ============================================
# BULK OPERATIONS
# ============================================

class BulkEmployeeAction(BaseModel):
    employee_ids: List[str]
    action: str  # suspend, activate, delete, assign_role
    role: Optional[str] = None

@router.post("/employees/bulk")
async def bulk_employee_action(
    data: BulkEmployeeAction,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Bulk actions on employees"""
    employee = await get_current_employee(request, enterprise_session)
    
    if employee["role"] not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    updated = 0
    
    for emp_id in data.employee_ids:
        if emp_id == employee["employee_id"]:
            continue  # Skip self
        
        if data.action == "suspend":
            await db.enterprise_employees.update_one(
                {"employee_id": emp_id},
                {"$set": {"status": "suspended"}, "$unset": {"session_token": ""}}
            )
        elif data.action == "activate":
            await db.enterprise_employees.update_one(
                {"employee_id": emp_id},
                {"$set": {"status": "active"}}
            )
        elif data.action == "delete":
            await db.enterprise_employees.delete_one({"employee_id": emp_id})
        elif data.action == "assign_role" and data.role:
            await db.enterprise_employees.update_one(
                {"employee_id": emp_id},
                {"$set": {"role": data.role}}
            )
        
        updated += 1
    
    await create_audit_log(employee, f"bulk_{data.action}", "employee", 
                          ",".join(data.employee_ids[:5]), {"count": updated}, request)
    
    return {"success": True, "updated": updated}

# ============================================
# EXPORT
# ============================================

@router.get("/export/employees")
async def export_employees(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Export employees to CSV format"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "export_data"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    employees = await db.enterprise_employees.find(
        {},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    ).to_list(10000)
    
    # Convert to CSV format
    if not employees:
        return {"csv": "", "count": 0}
    
    headers = ["employee_id", "name", "email", "phone", "department", "role", "status", "risk_level", "created_at"]
    rows = [headers]
    
    for emp in employees:
        rows.append([str(emp.get(h, "")) for h in headers])
    
    csv_content = "\n".join([",".join(row) for row in rows])
    
    return {"csv": csv_content, "count": len(employees)}

@router.get("/roles")
async def get_available_roles(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Get available roles and permissions"""
    employee = await get_current_employee(request, enterprise_session)
    
    return {
        "roles": [
            {"id": "super_admin", "name": "Super Administrador", "level": 100},
            {"id": "admin", "name": "Administrador", "level": 80},
            {"id": "supervisor", "name": "Supervisor", "level": 60},
            {"id": "operator", "name": "Operador", "level": 40},
            {"id": "auditor", "name": "Auditor", "level": 30},
            {"id": "emergency_service", "name": "Servicio de Emergencia", "level": 20}
        ],
        "permissions": ROLE_PERMISSIONS
    }

# ============================================
# STRIPE PAYMENT LOOKUP & REFUNDS
# ============================================

class RefundRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Motivo del reembolso")
    amount: Optional[float] = Field(None, description="Monto parcial a reembolsar (opcional)")

@router.get("/admin/payments/{payment_id}")
async def get_stripe_payment_details(
    payment_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """
    Retrieve payment details from Stripe.
    Access restricted to admin and finance roles.
    """
    employee = await get_current_employee(request, enterprise_session)
    
    # Check permissions - only admin, super_admin, or finance roles
    if employee["role"] not in ["super_admin", "admin", "finance", "supervisor"]:
        raise HTTPException(status_code=403, detail="Sin permisos. Solo administradores y finanzas.")
    
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe no está configurado")
    
    try:
        # Try to retrieve as PaymentIntent first
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            # Get customer details if available
            customer_info = None
            if payment_intent.customer:
                try:
                    customer = stripe.Customer.retrieve(payment_intent.customer)
                    customer_info = {
                        "id": customer.id,
                        "email": customer.email,
                        "name": customer.name,
                        "phone": customer.phone
                    }
                except:
                    pass
            
            # Check if already refunded
            refunds_list = []
            if payment_intent.latest_charge:
                try:
                    charge = stripe.Charge.retrieve(payment_intent.latest_charge)
                    if charge.refunds and charge.refunds.data:
                        for refund in charge.refunds.data:
                            refunds_list.append({
                                "refund_id": refund.id,
                                "amount": refund.amount / 100,
                                "status": refund.status,
                                "reason": refund.reason,
                                "created": datetime.fromtimestamp(refund.created, tz=timezone.utc).isoformat()
                            })
                except:
                    pass
            
            # Calculate refundable amount
            amount_received = payment_intent.amount_received / 100
            total_refunded = sum(r["amount"] for r in refunds_list)
            refundable_amount = amount_received - total_refunded
            
            # Log the lookup
            await create_audit_log(
                employee, "payment_lookup", "payment", payment_id,
                {"type": "payment_intent", "amount": amount_received},
                request
            )
            
            return {
                "success": True,
                "payment_type": "payment_intent",
                "payment_id": payment_intent.id,
                "amount": payment_intent.amount / 100,
                "amount_received": amount_received,
                "currency": payment_intent.currency.upper(),
                "status": payment_intent.status,
                "description": payment_intent.description,
                "customer": customer_info,
                "metadata": dict(payment_intent.metadata) if payment_intent.metadata else {},
                "payment_method": payment_intent.payment_method_types[0] if payment_intent.payment_method_types else None,
                "created": datetime.fromtimestamp(payment_intent.created, tz=timezone.utc).isoformat(),
                "refunds": refunds_list,
                "total_refunded": total_refunded,
                "refundable_amount": refundable_amount,
                "is_refundable": payment_intent.status == "succeeded" and refundable_amount > 0,
                "charge_id": payment_intent.latest_charge
            }
            
        except stripe.error.InvalidRequestError:
            # Try as Charge
            charge = stripe.Charge.retrieve(payment_id)
            
            customer_info = None
            if charge.customer:
                try:
                    customer = stripe.Customer.retrieve(charge.customer)
                    customer_info = {
                        "id": customer.id,
                        "email": customer.email,
                        "name": customer.name,
                        "phone": customer.phone
                    }
                except:
                    pass
            
            refunds_list = []
            if charge.refunds and charge.refunds.data:
                for refund in charge.refunds.data:
                    refunds_list.append({
                        "refund_id": refund.id,
                        "amount": refund.amount / 100,
                        "status": refund.status,
                        "reason": refund.reason,
                        "created": datetime.fromtimestamp(refund.created, tz=timezone.utc).isoformat()
                    })
            
            amount_captured = charge.amount_captured / 100
            total_refunded = sum(r["amount"] for r in refunds_list)
            refundable_amount = amount_captured - total_refunded
            
            await create_audit_log(
                employee, "payment_lookup", "payment", payment_id,
                {"type": "charge", "amount": amount_captured},
                request
            )
            
            return {
                "success": True,
                "payment_type": "charge",
                "payment_id": charge.id,
                "amount": charge.amount / 100,
                "amount_received": amount_captured,
                "currency": charge.currency.upper(),
                "status": "succeeded" if charge.paid else charge.status,
                "description": charge.description,
                "customer": customer_info,
                "metadata": dict(charge.metadata) if charge.metadata else {},
                "payment_method": charge.payment_method_details.type if charge.payment_method_details else None,
                "created": datetime.fromtimestamp(charge.created, tz=timezone.utc).isoformat(),
                "refunds": refunds_list,
                "total_refunded": total_refunded,
                "refundable_amount": refundable_amount,
                "is_refundable": charge.paid and not charge.refunded and refundable_amount > 0,
                "charge_id": charge.id
            }
            
    except stripe.error.InvalidRequestError as e:
        raise HTTPException(status_code=404, detail=f"Pago no encontrado: {str(e)}")
    except stripe.error.AuthenticationError:
        raise HTTPException(status_code=500, detail="Error de autenticación con Stripe")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Error de Stripe: {str(e)}")

@router.post("/admin/payments/{payment_id}/refund")
async def process_stripe_refund(
    payment_id: str,
    data: RefundRequest,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """
    Process a refund for a Stripe payment.
    Access restricted to admin and finance roles.
    Creates audit trail in payment_logs collection.
    """
    employee = await get_current_employee(request, enterprise_session)
    
    # Check permissions - only admin, super_admin, or finance roles
    if employee["role"] not in ["super_admin", "admin", "finance"]:
        raise HTTPException(status_code=403, detail="Sin permisos. Solo administradores y finanzas pueden procesar reembolsos.")
    
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe no está configurado")
    
    # Rate limiting check - max 10 refunds per employee per hour
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    recent_refunds = await db.payment_logs.count_documents({
        "employee_id": employee["employee_id"],
        "action": "refund",
        "created_at": {"$gte": one_hour_ago.isoformat()}
    })
    
    if recent_refunds >= 10:
        raise HTTPException(
            status_code=429, 
            detail="Has alcanzado el límite de 10 reembolsos por hora. Espera un momento antes de continuar."
        )
    
    try:
        # First, get the payment to validate
        charge_id = None
        original_amount = 0
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            if payment_intent.status != "succeeded":
                raise HTTPException(status_code=400, detail="Solo se pueden reembolsar pagos completados (succeeded)")
            
            charge_id = payment_intent.latest_charge
            original_amount = payment_intent.amount_received / 100
            
        except stripe.error.InvalidRequestError:
            # Try as Charge
            charge = stripe.Charge.retrieve(payment_id)
            
            if not charge.paid:
                raise HTTPException(status_code=400, detail="Solo se pueden reembolsar pagos completados")
            
            charge_id = charge.id
            original_amount = charge.amount_captured / 100
        
        if not charge_id:
            raise HTTPException(status_code=400, detail="No se encontró el cargo asociado al pago")
        
        # Calculate refund amount
        refund_amount = data.amount if data.amount else None
        
        if refund_amount:
            if refund_amount <= 0:
                raise HTTPException(status_code=400, detail="El monto del reembolso debe ser mayor a 0")
            if refund_amount > original_amount:
                raise HTTPException(status_code=400, detail=f"El monto del reembolso no puede ser mayor al pago original (€{original_amount:.2f})")
        
        # Create the refund
        refund_params = {
            "charge": charge_id,
            "reason": "requested_by_customer",
            "metadata": {
                "employee_id": employee["employee_id"],
                "employee_name": employee["name"],
                "reason": data.reason,
                "processed_at": datetime.now(timezone.utc).isoformat()
            }
        }
        
        if refund_amount:
            refund_params["amount"] = int(refund_amount * 100)  # Convert to cents
        
        refund = stripe.Refund.create(**refund_params)
        
        # Log to payment_logs collection
        log_entry = {
            "log_id": generate_id("refund_"),
            "payment_id": payment_id,
            "charge_id": charge_id,
            "refund_id": refund.id,
            "action": "refund",
            "original_amount": original_amount,
            "refund_amount": refund.amount / 100,
            "currency": refund.currency.upper(),
            "reason": data.reason,
            "status": refund.status,
            "employee_id": employee["employee_id"],
            "employee_name": employee["name"],
            "employee_role": employee["role"],
            "ip_address": request.client.host,
            "user_agent": request.headers.get("user-agent"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_logs.insert_one(log_entry)
        
        # Create audit log
        await create_audit_log(
            employee, "payment_refund", "payment", payment_id,
            {
                "refund_id": refund.id,
                "amount": refund.amount / 100,
                "reason": data.reason
            },
            request
        )
        
        return {
            "success": True,
            "message": "Reembolso procesado correctamente",
            "refund": {
                "refund_id": refund.id,
                "payment_id": payment_id,
                "amount": refund.amount / 100,
                "currency": refund.currency.upper(),
                "status": refund.status,
                "reason": data.reason,
                "processed_by": employee["name"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        }
        
    except stripe.error.InvalidRequestError as e:
        error_msg = str(e)
        if "already been refunded" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Este pago ya ha sido reembolsado completamente")
        raise HTTPException(status_code=400, detail=f"Error al procesar reembolso: {error_msg}")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Error de Stripe: {str(e)}")

@router.get("/admin/payment-logs")
async def get_payment_logs(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    action: Optional[str] = None
):
    """
    Get payment audit logs.
    Access restricted to admin and finance roles.
    """
    employee = await get_current_employee(request, enterprise_session)
    
    if employee["role"] not in ["super_admin", "admin", "finance", "auditor"]:
        raise HTTPException(status_code=403, detail="Sin permisos para ver logs de pagos")
    
    query = {}
    if action:
        query["action"] = action
    
    skip = (page - 1) * limit
    
    logs = await db.payment_logs.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.payment_logs.count_documents(query)
    
    return {
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
