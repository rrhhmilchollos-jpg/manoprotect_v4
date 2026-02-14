"""
ManoProtect - Two-Factor Authentication (2FA) for Enterprise Employees
Uses TOTP (Time-based One-Time Password) compatible with Google Authenticator
"""
from fastapi import APIRouter, HTTPException, Cookie, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import pyotp
import qrcode
import io
import base64

router = APIRouter(prefix="/2fa", tags=["2FA"])

db = None

def set_database(database):
    global db
    db = database
    print(f"✅ 2FA routes initialized: {db is not None}")


class Enable2FARequest(BaseModel):
    verification_code: str


class Verify2FARequest(BaseModel):
    code: str


async def get_enterprise_employee(enterprise_session: Optional[str] = Cookie(None)):
    """Get current enterprise employee"""
    if not enterprise_session:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": enterprise_session},
        {"_id": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee


@router.get("/setup")
async def setup_2fa(enterprise_session: Optional[str] = Cookie(None)):
    """
    Generate 2FA setup data including QR code
    Returns a secret and QR code for the authenticator app
    """
    employee = await get_enterprise_employee(enterprise_session)
    employee_id = employee.get("employee_id")
    email = employee.get("email")
    
    # Check if 2FA is already enabled
    if employee.get("two_factor_enabled"):
        raise HTTPException(
            status_code=400,
            detail="2FA ya está activado en tu cuenta"
        )
    
    # Generate a new secret
    secret = pyotp.random_base32()
    
    # Create TOTP URI for authenticator apps
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=email,
        issuer_name="ManoProtect Admin"
    )
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Store temporary secret (not yet verified)
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "two_factor_secret_pending": secret,
            "two_factor_setup_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "manual_entry_key": secret,
        "instructions": "Escanea el código QR con Google Authenticator o introduce la clave manualmente"
    }


@router.post("/enable")
async def enable_2fa(
    data: Enable2FARequest,
    enterprise_session: Optional[str] = Cookie(None)
):
    """
    Verify the code and enable 2FA
    The user must enter a valid code from their authenticator app
    """
    employee = await get_enterprise_employee(enterprise_session)
    employee_id = employee.get("employee_id")
    
    # Get pending secret
    pending_secret = employee.get("two_factor_secret_pending")
    if not pending_secret:
        raise HTTPException(
            status_code=400,
            detail="No hay configuración de 2FA pendiente. Inicia el proceso desde /setup"
        )
    
    # Verify the code
    totp = pyotp.TOTP(pending_secret)
    if not totp.verify(data.verification_code, valid_window=1):
        raise HTTPException(
            status_code=400,
            detail="Código inválido. Asegúrate de introducir el código actual de tu app"
        )
    
    # Enable 2FA
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {
            "$set": {
                "two_factor_enabled": True,
                "two_factor_secret": pending_secret,
                "two_factor_enabled_at": datetime.now(timezone.utc).isoformat()
            },
            "$unset": {
                "two_factor_secret_pending": "",
                "two_factor_setup_at": ""
            }
        }
    )
    
    # Generate backup codes
    backup_codes = [pyotp.random_base32()[:8] for _ in range(6)]
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"two_factor_backup_codes": backup_codes}}
    )
    
    return {
        "success": True,
        "message": "2FA activado correctamente",
        "backup_codes": backup_codes,
        "warning": "Guarda estos códigos de respaldo en un lugar seguro. Solo se mostrarán una vez."
    }


@router.post("/verify")
async def verify_2fa(
    data: Verify2FARequest,
    enterprise_session: Optional[str] = Cookie(None)
):
    """
    Verify a 2FA code during login
    Also accepts backup codes
    """
    employee = await get_enterprise_employee(enterprise_session)
    employee_id = employee.get("employee_id")
    
    if not employee.get("two_factor_enabled"):
        raise HTTPException(
            status_code=400,
            detail="2FA no está activado en esta cuenta"
        )
    
    secret = employee.get("two_factor_secret")
    backup_codes = employee.get("two_factor_backup_codes", [])
    
    # Check if it's a backup code
    if data.code in backup_codes:
        # Remove used backup code
        backup_codes.remove(data.code)
        await db.enterprise_employees.update_one(
            {"employee_id": employee_id},
            {"$set": {"two_factor_backup_codes": backup_codes}}
        )
        
        return {
            "success": True,
            "method": "backup_code",
            "remaining_backup_codes": len(backup_codes),
            "warning": f"Has usado un código de respaldo. Te quedan {len(backup_codes)} códigos."
        }
    
    # Verify TOTP code
    totp = pyotp.TOTP(secret)
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(
            status_code=400,
            detail="Código inválido"
        )
    
    # Mark 2FA as verified for this session
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "two_factor_verified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "method": "totp"
    }


@router.post("/disable")
async def disable_2fa(
    data: Verify2FARequest,
    enterprise_session: Optional[str] = Cookie(None)
):
    """
    Disable 2FA (requires current code verification)
    """
    employee = await get_enterprise_employee(enterprise_session)
    employee_id = employee.get("employee_id")
    
    if not employee.get("two_factor_enabled"):
        raise HTTPException(
            status_code=400,
            detail="2FA no está activado"
        )
    
    # Verify the code first
    secret = employee.get("two_factor_secret")
    totp = pyotp.TOTP(secret)
    
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(
            status_code=400,
            detail="Código inválido. Introduce el código actual de tu app"
        )
    
    # Disable 2FA
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {
            "$set": {
                "two_factor_enabled": False,
                "two_factor_disabled_at": datetime.now(timezone.utc).isoformat()
            },
            "$unset": {
                "two_factor_secret": "",
                "two_factor_backup_codes": "",
                "two_factor_verified_at": ""
            }
        }
    )
    
    return {
        "success": True,
        "message": "2FA desactivado correctamente"
    }


@router.get("/status")
async def get_2fa_status(enterprise_session: Optional[str] = Cookie(None)):
    """Get current 2FA status for the employee"""
    employee = await get_enterprise_employee(enterprise_session)
    
    return {
        "enabled": employee.get("two_factor_enabled", False),
        "enabled_at": employee.get("two_factor_enabled_at"),
        "backup_codes_remaining": len(employee.get("two_factor_backup_codes", []))
    }


@router.post("/regenerate-backup-codes")
async def regenerate_backup_codes(
    data: Verify2FARequest,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Regenerate backup codes (requires 2FA verification)"""
    employee = await get_enterprise_employee(enterprise_session)
    employee_id = employee.get("employee_id")
    
    if not employee.get("two_factor_enabled"):
        raise HTTPException(status_code=400, detail="2FA no está activado")
    
    # Verify current code
    secret = employee.get("two_factor_secret")
    totp = pyotp.TOTP(secret)
    
    if not totp.verify(data.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Código inválido")
    
    # Generate new backup codes
    backup_codes = [pyotp.random_base32()[:8] for _ in range(6)]
    
    await db.enterprise_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {
            "two_factor_backup_codes": backup_codes,
            "backup_codes_regenerated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "backup_codes": backup_codes,
        "warning": "Los códigos anteriores ya no son válidos. Guarda estos nuevos códigos."
    }
