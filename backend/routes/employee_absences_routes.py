"""
ManoProtect - Employee Absences/Vacations Management API
Sistema completo de gestión de ausencias y vacaciones
"""
from fastapi import APIRouter, HTTPException, Request, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta, date
import uuid

router = APIRouter(prefix="/enterprise/absences", tags=["Employee Absences"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Employee Absences DB initialized: {db is not None}")

# ============================================
# MODELS
# ============================================

class AbsenceRequest(BaseModel):
    type: str = Field(..., description="vacation, personal, sick_leave, other")
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD")
    reason: Optional[str] = None

class AbsenceReject(BaseModel):
    rejection_reason: str

# ============================================
# UTILITY FUNCTIONS
# ============================================

def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

async def get_current_employee(request: Request):
    """Get current logged in employee from session"""
    token = request.cookies.get("enterprise_session")
    if not token:
        token = request.headers.get("X-Session-Token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": token},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee

def is_admin(employee: dict) -> bool:
    """Check if employee is admin or super_admin"""
    return employee.get("role") in ["super_admin", "admin", "ceo"]

async def calculate_working_days(start_date: date, end_date: date, region: str = None) -> int:
    """Calculate working days excluding weekends and holidays"""
    # Get holidays in range
    holidays_cursor = db.holidays.find({
        "date": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}
    })
    holiday_dates = set()
    async for h in holidays_cursor:
        holiday_dates.add(h["date"])
    
    working_days = 0
    current = start_date
    while current <= end_date:
        # Exclude weekends (5=Saturday, 6=Sunday)
        if current.weekday() < 5 and current.isoformat() not in holiday_dates:
            working_days += 1
        current += timedelta(days=1)
    
    return working_days

async def create_notification(employee_id: str, type: str, title: str, message: str, reference_type: str = None, reference_id: str = None):
    """Create a notification for an employee"""
    notification = {
        "notification_id": generate_id("notif_"),
        "employee_id": employee_id,
        "type": type,
        "title": title,
        "message": message,
        "is_read": False,
        "reference_type": reference_type,
        "reference_id": reference_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.employee_notifications.insert_one(notification)
    return notification

# ============================================
# ENDPOINTS
# ============================================

@router.get("")
async def get_absences(
    request: Request,
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = Query(50, le=100),
    skip: int = 0
):
    """Get absence requests - employees see their own, admins see all"""
    current_employee = await get_current_employee(request)
    
    query = {}
    
    # Non-admins can only see their own absences
    if not is_admin(current_employee):
        query["employee_id"] = current_employee["employee_id"]
    elif employee_id:
        query["employee_id"] = employee_id
    
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    if year:
        query["start_date"] = {"$regex": f"^{year}"}
    
    cursor = db.absence_requests.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    absences = await cursor.to_list(length=limit)
    
    # Count pending
    pending_count = await db.absence_requests.count_documents({"status": "pending"})
    total = await db.absence_requests.count_documents(query)
    
    return {
        "absences": absences,
        "total": total,
        "pending_count": pending_count
    }

@router.get("/my-balance")
async def get_my_balance(request: Request):
    """Get vacation balance for current employee"""
    current_employee = await get_current_employee(request)
    
    total = current_employee.get("vacation_days_total", 22)
    used = current_employee.get("vacation_days_used", 0)
    pending = current_employee.get("vacation_days_pending", 0)
    
    return {
        "total": total,
        "used": used,
        "pending": pending,
        "available": total - used - pending
    }

@router.get("/calendar")
async def get_calendar(
    request: Request,
    year: int = Query(...),
    month: int = Query(...),
    department: Optional[str] = None
):
    """Get team calendar with approved absences"""
    await get_current_employee(request)
    
    # Calculate date range for the month
    start_date = f"{year}-{month:02d}-01"
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
    
    query = {
        "status": "approved",
        "start_date": {"$lt": end_date},
        "end_date": {"$gte": start_date}
    }
    
    cursor = db.absence_requests.find(query, {"_id": 0})
    absences = await cursor.to_list(length=100)
    
    # Get holidays
    holidays_cursor = db.holidays.find({
        "date": {"$gte": start_date, "$lt": end_date}
    }, {"_id": 0})
    holidays = await holidays_cursor.to_list(length=50)
    
    return {
        "absences": absences,
        "holidays": holidays
    }

@router.get("/{request_id}")
async def get_absence_detail(request_id: str, request: Request):
    """Get absence request detail"""
    current_employee = await get_current_employee(request)
    
    absence = await db.absence_requests.find_one(
        {"request_id": request_id},
        {"_id": 0}
    )
    
    if not absence:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Non-admins can only see their own
    if not is_admin(current_employee) and absence["employee_id"] != current_employee["employee_id"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    return absence

@router.post("")
async def create_absence_request(
    data: AbsenceRequest,
    request: Request,
    background_tasks: BackgroundTasks
):
    """Create a new absence request"""
    current_employee = await get_current_employee(request)
    
    # Validate dates
    try:
        start = datetime.strptime(data.start_date, "%Y-%m-%d").date()
        end = datetime.strptime(data.end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    
    if end < start:
        raise HTTPException(status_code=400, detail="La fecha de fin debe ser posterior a la de inicio")
    
    if start < date.today():
        raise HTTPException(status_code=400, detail="No se pueden solicitar ausencias en el pasado")
    
    # Calculate working days
    working_days = await calculate_working_days(start, end)
    
    # Check vacation balance (only for vacation type)
    if data.type == "vacation":
        total = current_employee.get("vacation_days_total", 22)
        used = current_employee.get("vacation_days_used", 0)
        pending = current_employee.get("vacation_days_pending", 0)
        available = total - used - pending
        
        if working_days > available:
            raise HTTPException(
                status_code=400, 
                detail=f"No tienes suficientes días de vacaciones. Disponibles: {available}, Solicitados: {working_days}"
            )
    
    # Create request
    absence = {
        "request_id": generate_id("abs_"),
        "employee_id": current_employee["employee_id"],
        "employee_name": current_employee.get("name", ""),
        "employee_email": current_employee.get("email", ""),
        "type": data.type,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "working_days": working_days,
        "reason": data.reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.absence_requests.insert_one(absence)
    
    # Update pending vacation days
    if data.type == "vacation":
        await db.enterprise_employees.update_one(
            {"employee_id": current_employee["employee_id"]},
            {"$inc": {"vacation_days_pending": working_days}}
        )
    
    # Create notification for admins
    admins_cursor = db.enterprise_employees.find(
        {"role": {"$in": ["super_admin", "admin", "ceo"]}},
        {"employee_id": 1}
    )
    async for admin in admins_cursor:
        await create_notification(
            employee_id=admin["employee_id"],
            type="absence_request",
            title="Nueva solicitud de ausencia",
            message=f"{current_employee.get('name')} ha solicitado {working_days} días de {data.type}",
            reference_type="absence_request",
            reference_id=absence["request_id"]
        )
    
    # Remove _id for response
    absence.pop("_id", None)
    
    return {
        "success": True,
        "request_id": absence["request_id"],
        "working_days": working_days,
        "absence": absence
    }

@router.patch("/{request_id}/approve")
async def approve_absence(request_id: str, request: Request, background_tasks: BackgroundTasks):
    """Approve an absence request (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden aprobar solicitudes")
    
    absence = await db.absence_requests.find_one({"request_id": request_id})
    if not absence:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if absence["status"] != "pending":
        raise HTTPException(status_code=400, detail="Esta solicitud ya ha sido procesada")
    
    # Update absence status
    await db.absence_requests.update_one(
        {"request_id": request_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_by": current_employee["employee_id"],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Update employee vacation days
    if absence["type"] == "vacation":
        await db.enterprise_employees.update_one(
            {"employee_id": absence["employee_id"]},
            {
                "$inc": {
                    "vacation_days_used": absence["working_days"],
                    "vacation_days_pending": -absence["working_days"]
                }
            }
        )
    
    # Create notification for employee
    await create_notification(
        employee_id=absence["employee_id"],
        type="absence_approved",
        title="Solicitud aprobada",
        message=f"Tu solicitud de {absence['type']} del {absence['start_date']} al {absence['end_date']} ha sido aprobada",
        reference_type="absence_request",
        reference_id=request_id
    )
    
    return {"success": True, "message": "Solicitud aprobada"}

@router.patch("/{request_id}/reject")
async def reject_absence(
    request_id: str,
    data: AbsenceReject,
    request: Request,
    background_tasks: BackgroundTasks
):
    """Reject an absence request (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden rechazar solicitudes")
    
    absence = await db.absence_requests.find_one({"request_id": request_id})
    if not absence:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if absence["status"] != "pending":
        raise HTTPException(status_code=400, detail="Esta solicitud ya ha sido procesada")
    
    # Update absence status
    await db.absence_requests.update_one(
        {"request_id": request_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_by": current_employee["employee_id"],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "rejection_reason": data.rejection_reason,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Restore pending vacation days
    if absence["type"] == "vacation":
        await db.enterprise_employees.update_one(
            {"employee_id": absence["employee_id"]},
            {"$inc": {"vacation_days_pending": -absence["working_days"]}}
        )
    
    # Create notification for employee
    await create_notification(
        employee_id=absence["employee_id"],
        type="absence_rejected",
        title="Solicitud rechazada",
        message=f"Tu solicitud de {absence['type']} ha sido rechazada. Motivo: {data.rejection_reason}",
        reference_type="absence_request",
        reference_id=request_id
    )
    
    return {"success": True, "message": "Solicitud rechazada"}

@router.delete("/{request_id}")
async def cancel_absence(request_id: str, request: Request):
    """Cancel own pending absence request"""
    current_employee = await get_current_employee(request)
    
    absence = await db.absence_requests.find_one({"request_id": request_id})
    if not absence:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Only own requests or admins
    if absence["employee_id"] != current_employee["employee_id"] and not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="No autorizado")
    
    if absence["status"] != "pending":
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar solicitudes pendientes")
    
    # Delete the request
    await db.absence_requests.delete_one({"request_id": request_id})
    
    # Restore pending vacation days
    if absence["type"] == "vacation":
        await db.enterprise_employees.update_one(
            {"employee_id": absence["employee_id"]},
            {"$inc": {"vacation_days_pending": -absence["working_days"]}}
        )
    
    return {"success": True, "message": "Solicitud cancelada"}
