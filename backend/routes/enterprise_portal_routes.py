"""
ManoProtect - Enterprise Employee Portal API Routes
Complete backend for scalable employee management system
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie, Query, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import json

from models.enterprise_portal import (
    EmployeeRole, EmployeeStatus, RiskLevel, SOSStatus, SOSPriority,
    AlertType, PaymentStatus, DeviceOrderStatus,
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    SOSResponse, DashboardStats, ROLE_PERMISSIONS
)

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

@router.post("/auth/login")
async def enterprise_login(data: LoginRequest, response: Response, request: Request):
    """Enterprise employee login"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    employee = await db.enterprise_employees.find_one({"email": data.email.lower()})
    
    if not employee:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas - usuario no encontrado")
    
    if employee.get("status") != "active":
        raise HTTPException(status_code=403, detail="Cuenta suspendida o inactiva")
    
    computed_hash = hash_password(data.password)
    stored_hash = employee.get("password_hash")
    
    if computed_hash != stored_hash:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas - password incorrecto")
    
    # Generate session
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
        "risk_by_department": [
            {
                "department": d["_id"],
                "employee_count": d["count"],
                "avg_risk_score": round(d["avg_risk"], 1),
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
    """Get client details"""
    employee = await get_current_employee(request, enterprise_session)
    
    if not check_permission(employee, "view_clients"):
        raise HTTPException(status_code=403, detail="Sin permisos")
    
    client = await db.users.find_one(
        {"user_id": client_id},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    )
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Get additional data
    sos_count = await db.sos_events.count_documents({"client_id": client_id})
    alerts_count = await db.security_alerts.count_documents({"client_id": client_id})
    payments = await db.payments.find(
        {"client_id": client_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    device_order = await db.device_orders.find_one(
        {"client_id": client_id},
        {"_id": 0}
    )
    
    return {
        **client,
        "sos_events_count": sos_count,
        "alerts_count": alerts_count,
        "recent_payments": payments,
        "device_order": device_order
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
