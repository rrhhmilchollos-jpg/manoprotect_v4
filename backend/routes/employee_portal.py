"""
ManoProtect - Employee Portal Routes
Secure employee management system with director-managed invitations
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import secrets
import hashlib

router = APIRouter(prefix="/employee-portal", tags=["Employee Portal"])

# Database reference - will be initialized
db = None

def set_database(database):
    global db
    db = database

# ============================================
# MODELS
# ============================================

class EmployeeInvite(BaseModel):
    """Model for creating employee invitations"""
    email: EmailStr
    name: str
    role: str = "employee"  # employee, manager, director
    department: Optional[str] = None

class EmployeeRegister(BaseModel):
    """Model for employee registration using invite token"""
    token: str
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None

class EmployeeLogin(BaseModel):
    """Model for employee login"""
    email: EmailStr
    password: str

class EmployeeUpdate(BaseModel):
    """Model for updating employee data"""
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# ============================================
# HELPER FUNCTIONS
# ============================================

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain) == hashed

def generate_token() -> str:
    """Generate secure random token"""
    return secrets.token_urlsafe(32)

def generate_temp_password() -> str:
    """Generate temporary password for invite"""
    return secrets.token_urlsafe(12)

async def get_current_employee(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current authenticated employee"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.employees.find_one(
        {"session_token": session_token, "is_active": True},
        {"_id": 0, "password_hash": 0}
    )
    
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee

async def require_director(request: Request, session_token: Optional[str] = Cookie(None)):
    """Require director role"""
    employee = await get_current_employee(request, session_token)
    
    if employee.get("role") not in ["director", "superadmin"]:
        raise HTTPException(status_code=403, detail="Solo el director puede realizar esta acción")
    
    return employee

# ============================================
# DIRECTOR ENDPOINTS (Create invitations)
# ============================================

@router.post("/invites")
async def create_employee_invite(
    invite: EmployeeInvite,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Director creates an invitation for a new employee.
    Generates temporary credentials that are sent via email.
    """
    director = await require_director(request, session_token)
    
    # Check if email already exists
    existing = await db.employees.find_one({"email": invite.email})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un empleado con este email")
    
    # Check for pending invite
    pending = await db.employee_invites.find_one({
        "email": invite.email,
        "status": "pending",
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    })
    if pending:
        raise HTTPException(status_code=400, detail="Ya hay una invitación pendiente para este email")
    
    # Generate invitation
    invite_token = generate_token()
    temp_password = generate_temp_password()
    
    invite_doc = {
        "invite_id": f"inv_{uuid.uuid4().hex[:12]}",
        "email": invite.email,
        "name": invite.name,
        "role": invite.role,
        "department": invite.department,
        "token": invite_token,
        "temp_password": temp_password,  # Will be sent via email
        "status": "pending",
        "created_by": director.get("employee_id"),
        "created_by_name": director.get("name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    }
    
    await db.employee_invites.insert_one(invite_doc)
    
    # TODO: Send email with credentials using SendGrid
    # For now, return the credentials (in production, only send via email)
    
    return {
        "success": True,
        "message": f"Invitación creada para {invite.email}",
        "invite_id": invite_doc["invite_id"],
        "email": invite.email,
        "temp_password": temp_password,  # Remove this in production
        "registration_url": f"/empleados/registro?token={invite_token}",
        "expires_at": invite_doc["expires_at"],
        "note": "En producción, estas credenciales se enviarán por email"
    }

@router.get("/invites")
async def list_invites(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None
):
    """List all employee invitations (director only)"""
    await require_director(request, session_token)
    
    query = {}
    if status:
        query["status"] = status
    
    invites = await db.employee_invites.find(
        query,
        {"_id": 0, "token": 0, "temp_password": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "invites": invites,
        "total": len(invites)
    }

@router.delete("/invites/{invite_id}")
async def cancel_invite(
    invite_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Cancel a pending invitation (director only)"""
    await require_director(request, session_token)
    
    result = await db.employee_invites.update_one(
        {"invite_id": invite_id, "status": "pending"},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Invitación no encontrada o ya procesada")
    
    return {"success": True, "message": "Invitación cancelada"}

# ============================================
# EMPLOYEE REGISTRATION (Using invite)
# ============================================

@router.post("/register")
async def register_employee(data: EmployeeRegister):
    """
    Employee registers using the invitation token and temp password.
    Sets their own permanent password.
    """
    # Find valid invite
    invite = await db.employee_invites.find_one({
        "token": data.token,
        "status": "pending",
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    })
    
    if not invite:
        raise HTTPException(
            status_code=400, 
            detail="Token de invitación inválido o expirado. Contacta al director para una nueva invitación."
        )
    
    # Create employee account
    employee_id = f"emp_{uuid.uuid4().hex[:12]}"
    session_token = generate_token()
    
    employee_doc = {
        "employee_id": employee_id,
        "email": invite["email"],
        "name": invite["name"],
        "role": invite["role"],
        "department": invite.get("department"),
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "session_token": session_token,
        "is_active": True,
        "invited_by": invite.get("created_by"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": datetime.now(timezone.utc).isoformat()
    }
    
    await db.employees.insert_one(employee_doc)
    
    # Mark invite as used
    await db.employee_invites.update_one(
        {"invite_id": invite["invite_id"]},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "employee_id": employee_id
        }}
    )
    
    return {
        "success": True,
        "message": "Registro completado exitosamente",
        "employee_id": employee_id,
        "name": invite["name"],
        "role": invite["role"],
        "session_token": session_token
    }

@router.get("/verify-invite/{token}")
async def verify_invite_token(token: str):
    """Verify if an invitation token is valid"""
    invite = await db.employee_invites.find_one({
        "token": token,
        "status": "pending",
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    }, {"_id": 0, "token": 0, "temp_password": 0})
    
    if not invite:
        raise HTTPException(status_code=400, detail="Token de invitación inválido o expirado")
    
    return {
        "valid": True,
        "email": invite["email"],
        "name": invite["name"],
        "role": invite["role"],
        "expires_at": invite["expires_at"]
    }

# ============================================
# EMPLOYEE LOGIN
# ============================================

@router.post("/login")
async def employee_login(data: EmployeeLogin, response: Response):
    """Employee login"""
    employee = await db.employees.find_one({"email": data.email})
    
    if not employee:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not employee.get("is_active"):
        raise HTTPException(status_code=401, detail="Cuenta desactivada. Contacta al director.")
    
    if not verify_password(data.password, employee.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Generate new session token
    session_token = generate_token()
    
    await db.employees.update_one(
        {"employee_id": employee["employee_id"]},
        {"$set": {
            "session_token": session_token,
            "last_login": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Set session cookie for browser requests
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    
    return {
        "success": True,
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "email": employee["email"],
        "role": employee["role"],
        "department": employee.get("department"),
        "session_token": session_token
    }

@router.post("/logout")
async def employee_logout(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Employee logout"""
    if session_token:
        await db.employees.update_one(
            {"session_token": session_token},
            {"$set": {"session_token": None}}
        )
    
    return {"success": True, "message": "Sesión cerrada"}

@router.get("/me")
async def get_current_employee_info(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current employee info"""
    employee = await get_current_employee(request, session_token)
    return employee

# ============================================
# EMPLOYEE MANAGEMENT (Director only)
# ============================================

@router.get("/employees")
async def list_employees(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List all employees (director only)"""
    await require_director(request, session_token)
    
    employees = await db.employees.find(
        {},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {
        "employees": employees,
        "total": len(employees)
    }

@router.get("/employees/{employee_id}")
async def get_employee(
    employee_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get employee details (director only)"""
    await require_director(request, session_token)
    
    employee = await db.employees.find_one(
        {"employee_id": employee_id},
        {"_id": 0, "password_hash": 0, "session_token": 0}
    )
    
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return employee

@router.patch("/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update employee (director only)"""
    director = await require_director(request, session_token)
    
    # Can't change own role
    if employee_id == director.get("employee_id") and data.role:
        raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = director.get("employee_id")
    
    result = await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return {"success": True, "message": "Empleado actualizado"}

@router.delete("/employees/{employee_id}")
async def deactivate_employee(
    employee_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Deactivate employee (director only)"""
    director = await require_director(request, session_token)
    
    if employee_id == director.get("employee_id"):
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    
    result = await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "is_active": False,
            "session_token": None,
            "deactivated_at": datetime.now(timezone.utc).isoformat(),
            "deactivated_by": director.get("employee_id")
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    return {"success": True, "message": "Empleado desactivado"}

# ============================================
# DASHBOARD STATS
# ============================================

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get dashboard statistics for employees"""
    employee = await get_current_employee(request, session_token)
    
    # Get counts based on role
    is_director = employee.get("role") in ["director", "superadmin"]
    
    stats = {
        "total_users": await db.users.count_documents({}),
        "premium_users": await db.users.count_documents({"plan": {"$ne": "free"}}),
        "total_threats": await db.threats.count_documents({}),
        "total_orders": await db.shipments.count_documents({}),
        "pending_orders": await db.shipments.count_documents({"status": "pending"})
    }
    
    if is_director:
        stats["total_employees"] = await db.employees.count_documents({})
        stats["active_employees"] = await db.employees.count_documents({"is_active": True})
        stats["pending_invites"] = await db.employee_invites.count_documents({"status": "pending"})
    
    return stats

# ============================================
# SITE CONTENT MANAGEMENT
# ============================================

@router.get("/content")
async def list_site_content(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List all editable site content"""
    await get_current_employee(request, session_token)
    
    content = await db.site_content.find({}, {"_id": 0}).to_list(100)
    return {"content": content}

@router.post("/content")
async def create_content(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new site content"""
    employee = await get_current_employee(request, session_token)
    body = await request.json()
    
    content_doc = {
        "content_id": f"cnt_{uuid.uuid4().hex[:12]}",
        "key": body.get("key"),
        "title": body.get("title"),
        "content": body.get("content"),
        "type": body.get("type", "text"),  # text, html, json
        "created_by": employee.get("employee_id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.site_content.insert_one(content_doc)
    
    return {"success": True, "content_id": content_doc["content_id"]}

@router.patch("/content/{content_id}")
async def update_content(
    content_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update site content"""
    employee = await get_current_employee(request, session_token)
    body = await request.json()
    
    update_data = {
        "updated_by": employee.get("employee_id"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if "title" in body:
        update_data["title"] = body["title"]
    if "content" in body:
        update_data["content"] = body["content"]
    
    result = await db.site_content.update_one(
        {"content_id": content_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    
    return {"success": True, "message": "Contenido actualizado"}

@router.delete("/content/{content_id}")
async def delete_content(
    content_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete site content"""
    await require_director(request, session_token)
    
    result = await db.site_content.delete_one({"content_id": content_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    
    return {"success": True, "message": "Contenido eliminado"}
