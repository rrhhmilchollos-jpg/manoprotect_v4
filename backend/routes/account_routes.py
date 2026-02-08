"""
ManoProtect - Account Deletion Request Routes
Endpoint para procesar solicitudes de eliminación de cuenta (requerido por Google Play)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from typing import Optional
import uuid

router = APIRouter(prefix="/account", tags=["Account Management"])

_db = None

def init_account_routes(db):
    global _db
    _db = db

class DeleteAccountRequest(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    reason: str

class DeleteRequestResponse(BaseModel):
    success: bool
    message: str
    request_id: str
    estimated_completion: str

@router.post("/delete-request", response_model=DeleteRequestResponse)
async def request_account_deletion(request: DeleteAccountRequest):
    """
    Solicitar eliminación de cuenta.
    Google Play requiere que las apps ofrezcan una forma de solicitar eliminación de datos.
    La solicitud se procesa manualmente por el equipo de soporte.
    """
    request_id = f"DEL_{uuid.uuid4().hex[:12].upper()}"
    
    deletion_request = {
        "request_id": request_id,
        "email": request.email.lower(),
        "full_name": request.full_name,
        "phone": request.phone,
        "reason": request.reason,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "processed_at": None,
        "processed_by": None,
        "notes": None
    }
    
    if _db is not None:
        try:
            # Check if there's already a pending request
            existing = await _db.deletion_requests.find_one({
                "email": request.email.lower(),
                "status": "pending"
            })
            
            if existing:
                return DeleteRequestResponse(
                    success=True,
                    message="Ya existe una solicitud pendiente para este email. Te contactaremos pronto.",
                    request_id=existing["request_id"],
                    estimated_completion="30 días hábiles"
                )
            
            # Save request
            await _db.deletion_requests.insert_one(deletion_request)
            
            # TODO: Send confirmation email to user
            # TODO: Send notification to admin
            
        except Exception as e:
            print(f"Error saving deletion request: {e}")
    
    return DeleteRequestResponse(
        success=True,
        message="Tu solicitud ha sido recibida. Nuestro equipo la procesará en un plazo máximo de 30 días hábiles.",
        request_id=request_id,
        estimated_completion="30 días hábiles"
    )

@router.get("/delete-request/{request_id}")
async def get_deletion_request_status(request_id: str):
    """
    Consultar el estado de una solicitud de eliminación.
    """
    if _db is None:
        raise HTTPException(status_code=503, detail="Servicio no disponible")
    
    request_doc = await _db.deletion_requests.find_one(
        {"request_id": request_id},
        {"_id": 0}
    )
    
    if not request_doc:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    return {
        "request_id": request_doc["request_id"],
        "status": request_doc["status"],
        "created_at": request_doc["created_at"],
        "processed_at": request_doc.get("processed_at"),
        "estimated_completion": "30 días hábiles" if request_doc["status"] == "pending" else None
    }
