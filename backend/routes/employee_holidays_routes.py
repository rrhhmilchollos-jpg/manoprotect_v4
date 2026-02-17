"""
ManoProtect - Holidays Management API
Gestión de días festivos para cálculo de ausencias
"""
from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/enterprise/holidays", tags=["Holidays"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Holidays DB initialized: {db is not None}")

# ============================================
# MODELS
# ============================================

class HolidayCreate(BaseModel):
    date: str  # YYYY-MM-DD
    name: str
    type: str = "national"  # national, regional, local
    region: Optional[str] = None

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

# ============================================
# ENDPOINTS
# ============================================

@router.get("")
async def get_holidays(
    request: Request,
    year: Optional[int] = None,
    region: Optional[str] = None
):
    """Get holidays"""
    await get_current_employee(request)
    
    query = {}
    
    if year:
        query["date"] = {"$regex": f"^{year}"}
    
    if region:
        query["$or"] = [
            {"region": None},
            {"region": region}
        ]
    
    cursor = db.holidays.find(query, {"_id": 0}).sort("date", 1)
    holidays = await cursor.to_list(length=100)
    
    return {"holidays": holidays}

@router.get("/{year}")
async def get_holidays_by_year(year: int, request: Request):
    """Get all holidays for a specific year"""
    await get_current_employee(request)
    
    cursor = db.holidays.find(
        {"date": {"$regex": f"^{year}"}},
        {"_id": 0}
    ).sort("date", 1)
    holidays = await cursor.to_list(length=100)
    
    return {"holidays": holidays, "year": year}

@router.post("")
async def create_holiday(data: HolidayCreate, request: Request):
    """Create a new holiday (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear festivos")
    
    # Validate date format
    try:
        datetime.strptime(data.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    
    # Check for duplicate
    existing = await db.holidays.find_one({"date": data.date, "region": data.region})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un festivo para esta fecha")
    
    year = int(data.date.split("-")[0])
    
    holiday = {
        "holiday_id": generate_id("hol_"),
        "year": year,
        "date": data.date,
        "name": data.name,
        "type": data.type,
        "region": data.region,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.holidays.insert_one(holiday)
    holiday.pop("_id", None)
    
    return {"success": True, "holiday": holiday}

@router.post("/init-spain-{year}")
async def init_spain_holidays(year: int, request: Request):
    """Initialize Spanish national holidays for a year (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear festivos")
    
    # Spanish national holidays
    spain_holidays = [
        (f"{year}-01-01", "Año Nuevo"),
        (f"{year}-01-06", "Día de Reyes"),
        (f"{year}-05-01", "Día del Trabajo"),
        (f"{year}-08-15", "Asunción de la Virgen"),
        (f"{year}-10-12", "Fiesta Nacional de España"),
        (f"{year}-11-01", "Día de Todos los Santos"),
        (f"{year}-12-06", "Día de la Constitución"),
        (f"{year}-12-08", "Inmaculada Concepción"),
        (f"{year}-12-25", "Navidad"),
    ]
    
    created = 0
    for date, name in spain_holidays:
        existing = await db.holidays.find_one({"date": date, "type": "national"})
        if not existing:
            await db.holidays.insert_one({
                "holiday_id": generate_id("hol_"),
                "year": year,
                "date": date,
                "name": name,
                "type": "national",
                "region": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            created += 1
    
    return {
        "success": True,
        "message": f"Festivos nacionales de España {year} inicializados",
        "created": created
    }

@router.delete("/{holiday_id}")
async def delete_holiday(holiday_id: str, request: Request):
    """Delete a holiday (admin only)"""
    current_employee = await get_current_employee(request)
    
    if not is_admin(current_employee):
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar festivos")
    
    result = await db.holidays.delete_one({"holiday_id": holiday_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Festivo no encontrado")
    
    return {"success": True, "message": "Festivo eliminado"}
