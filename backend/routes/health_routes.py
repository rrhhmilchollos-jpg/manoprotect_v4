"""
Health Profile Routes - ManoProtect
Endpoints for user health information (emergency medical data)
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, Depends
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db

class HealthProfile(BaseModel):
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    emergency_medical_notes: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    hospital_preference: Optional[str] = None
    organ_donor: Optional[bool] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    date_of_birth: Optional[str] = None

class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str

@router.get("/health/profile")
async def get_health_profile(user: User = Depends(get_current_user)):
    """Get user's health profile"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    profile = await _db.health_profiles.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not profile:
        # Return empty profile structure
        return {
            "user_id": user.user_id,
            "blood_type": None,
            "allergies": [],
            "chronic_conditions": [],
            "medications": [],
            "emergency_medical_notes": None,
            "doctor_name": None,
            "doctor_phone": None,
            "hospital_preference": None,
            "organ_donor": None,
            "height_cm": None,
            "weight_kg": None,
            "date_of_birth": None,
            "created_at": None,
            "updated_at": None
        }
    
    return profile

@router.put("/health/profile")
async def update_health_profile(data: HealthProfile, user: User = Depends(get_current_user)):
    """Update user's health profile"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    profile_data = {
        "user_id": user.user_id,
        "blood_type": data.blood_type,
        "allergies": data.allergies or [],
        "chronic_conditions": data.chronic_conditions or [],
        "medications": data.medications or [],
        "emergency_medical_notes": data.emergency_medical_notes,
        "doctor_name": data.doctor_name,
        "doctor_phone": data.doctor_phone,
        "hospital_preference": data.hospital_preference,
        "organ_donor": data.organ_donor,
        "height_cm": data.height_cm,
        "weight_kg": data.weight_kg,
        "date_of_birth": data.date_of_birth,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if profile exists
    existing = await _db.health_profiles.find_one({"user_id": user.user_id})
    
    if existing:
        await _db.health_profiles.update_one(
            {"user_id": user.user_id},
            {"$set": profile_data}
        )
    else:
        profile_data["created_at"] = datetime.now(timezone.utc).isoformat()
        await _db.health_profiles.insert_one(profile_data)
    
    # Get updated profile
    updated_profile = await _db.health_profiles.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    return {"message": "Perfil de salud actualizado", "profile": updated_profile}

@router.get("/health/emergency-card/{user_id}")
async def get_emergency_card(user_id: str):
    """
    Get emergency health card for a user (public endpoint for emergencies)
    Only returns essential medical info for first responders
    """
    # Get health profile
    profile = await _db.health_profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    # Get user basic info
    user = await _db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0, "stripe_customer_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Get emergency contacts
    contacts = await _db.emergency_contacts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(length=5)
    
    return {
        "name": user.get("name"),
        "phone": user.get("phone"),
        "blood_type": profile.get("blood_type") if profile else None,
        "allergies": profile.get("allergies", []) if profile else [],
        "chronic_conditions": profile.get("chronic_conditions", []) if profile else [],
        "medications": profile.get("medications", []) if profile else [],
        "emergency_medical_notes": profile.get("emergency_medical_notes") if profile else None,
        "doctor_name": profile.get("doctor_name") if profile else None,
        "doctor_phone": profile.get("doctor_phone") if profile else None,
        "hospital_preference": profile.get("hospital_preference") if profile else None,
        "organ_donor": profile.get("organ_donor") if profile else None,
        "emergency_contacts": contacts
    }

@router.delete("/health/profile")
async def delete_health_profile(user: User = Depends(get_current_user)):
    """Delete user's health profile"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    await _db.health_profiles.delete_one({"user_id": user.user_id})
    
    return {"message": "Perfil de salud eliminado"}
