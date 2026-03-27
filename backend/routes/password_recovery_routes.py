"""
ManoProtect - Password Recovery System
Supports both Email and SMS recovery methods
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import secrets
import hashlib
import os

router = APIRouter(prefix="/recovery", tags=["Password Recovery"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

def generate_code(length: int = 6) -> str:
    """Generate numeric code for SMS"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])

def generate_token() -> str:
    """Generate secure token for email links"""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """Hash token for storage"""
    return hashlib.sha256(token.encode()).hexdigest()


# ============================================
# REQUEST MODELS
# ============================================

class RecoveryRequestEmail(BaseModel):
    email: EmailStr

class RecoveryRequestSMS(BaseModel):
    phone: str

class VerifySMSCode(BaseModel):
    phone: str
    code: str

class ResetPasswordWithToken(BaseModel):
    token: str
    new_password: str

class ResetPasswordWithCode(BaseModel):
    phone: str
    code: str
    new_password: str


# ============================================
# EMAIL RECOVERY - Users (manoprotectt.com)
# ============================================

@router.post("/user/email")
async def request_user_recovery_email(data: RecoveryRequestEmail, background_tasks: BackgroundTasks):
    """
    Request password recovery via email for regular users
    Sends a link to reset password
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Find user
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    # Always return success to prevent email enumeration
    if not user:
        return {
            "success": True,
            "message": "Si el email existe en nuestro sistema, recibirás un correo con instrucciones"
        }
    
    # Generate token
    token = generate_token()
    token_hash = hash_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store recovery request
    await db.password_recovery.delete_many({"email": data.email.lower(), "type": "user"})
    await db.password_recovery.insert_one({
        "email": data.email.lower(),
        "user_id": user.get("user_id"),
        "token_hash": token_hash,
        "type": "user",
        "method": "email",
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })
    
    # Send email
    try:
        from services.email_service import email_service
        
        reset_url = f"https://manoprotectt.com/recuperar-password?token={token}"
        
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ManoProtect</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Recuperación de Contraseña</p>
            </div>
            <div style="padding: 40px 30px; background: #ffffff; border: 1px solid #e5e7eb;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    Hola <strong>{user.get('name', 'Usuario')}</strong>,
                </p>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ManoProtect.
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="{reset_url}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Restablecer Contraseña
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                    Este enlace expirará en <strong>1 hora</strong>.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 13px;">
                    Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.
                </p>
            </div>
            <div style="padding: 20px; text-align: center; background: #f9fafb; border-radius: 0 0 12px 12px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © 2025 ManoProtect - Protegiendo a las familias españolas
                </p>
            </div>
        </div>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to_email=data.email,
            subject="Recuperar Contraseña - ManoProtect",
            html_content=email_html
        )
    except Exception as e:
        print(f"[Recovery] Email send error: {e}")
    
    return {
        "success": True,
        "message": "Si el email existe en nuestro sistema, recibirás un correo con instrucciones",
        "method": "email"
    }


@router.post("/user/sms")
async def request_user_recovery_sms(data: RecoveryRequestSMS):
    """
    Request password recovery via SMS for regular users
    Sends a 6-digit code
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Normalize phone
    phone = data.phone.replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = f"+34{phone}" if not phone.startswith("34") else f"+{phone}"
    
    # Find user by phone
    user = await db.users.find_one({"phone": {"$regex": phone[-9:]}}, {"_id": 0})
    
    if not user:
        # Return success to prevent enumeration, but don't send SMS
        return {
            "success": True,
            "message": "Si el teléfono está registrado, recibirás un código SMS",
            "phone_masked": f"***{phone[-4:]}"
        }
    
    # Generate 6-digit code
    code = generate_code(6)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Store recovery request
    await db.password_recovery.delete_many({"phone": phone, "type": "user"})
    await db.password_recovery.insert_one({
        "phone": phone,
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "code": code,
        "type": "user",
        "method": "sms",
        "attempts": 0,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })
    
    # Send SMS
    sms_sent = False
    try:
        from services.sms_service import sms_service
        result = await sms_service.send_verification_code(phone, code)
        sms_sent = result.get("success", False)
    except Exception as e:
        print(f"[Recovery] SMS send error: {e}")
    
    return {
        "success": True,
        "message": "Si el teléfono está registrado, recibirás un código SMS",
        "phone_masked": f"***{phone[-4:]}",
        "sms_sent": sms_sent,
        "expires_in_minutes": 10
    }


@router.post("/user/verify-sms")
async def verify_user_sms_code(data: VerifySMSCode):
    """
    Verify SMS code and return a reset token
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    phone = data.phone.replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = f"+34{phone}" if not phone.startswith("34") else f"+{phone}"
    
    # Find recovery request
    recovery = await db.password_recovery.find_one({
        "phone": phone,
        "type": "user",
        "method": "sms",
        "used": False
    })
    
    if not recovery:
        raise HTTPException(status_code=400, detail="No hay solicitud de recuperación pendiente")
    
    # Check expiration
    expires_at = recovery.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")
    
    # Check attempts
    attempts = recovery.get("attempts", 0)
    if attempts >= 5:
        raise HTTPException(status_code=429, detail="Demasiados intentos. Solicita un nuevo código.")
    
    # Verify code
    if recovery.get("code") != data.code:
        await db.password_recovery.update_one(
            {"_id": recovery["_id"]},
            {"$inc": {"attempts": 1}}
        )
        remaining = 4 - attempts
        raise HTTPException(status_code=400, detail=f"Código incorrecto. Te quedan {remaining} intentos.")
    
    # Code is valid - generate reset token
    reset_token = generate_token()
    token_hash = hash_token(reset_token)
    
    await db.password_recovery.update_one(
        {"_id": recovery["_id"]},
        {"$set": {
            "sms_verified": True,
            "reset_token_hash": token_hash,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(minutes=15)
        }}
    )
    
    return {
        "success": True,
        "message": "Código verificado correctamente",
        "reset_token": reset_token,
        "expires_in_minutes": 15
    }


@router.post("/user/reset")
async def reset_user_password(data: ResetPasswordWithToken):
    """
    Reset password using token (from email link or SMS verification)
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    
    token_hash = hash_token(data.token)
    
    # Find by email token or SMS verified token
    recovery = await db.password_recovery.find_one({
        "$or": [
            {"token_hash": token_hash, "used": False},
            {"reset_token_hash": token_hash, "sms_verified": True, "used": False}
        ],
        "type": "user"
    })
    
    if not recovery:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    # Check expiration
    expires_field = "token_expires_at" if recovery.get("sms_verified") else "expires_at"
    expires_at = recovery.get(expires_field)
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="El enlace ha expirado. Solicita uno nuevo.")
    
    # Update password
    password_hash = hashlib.sha256(data.new_password.encode()).hexdigest()
    
    user_id = recovery.get("user_id")
    email = recovery.get("email")
    
    result = await db.users.update_one(
        {"$or": [{"user_id": user_id}, {"email": email}]},
        {"$set": {
            "password": password_hash,
            "password_updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Mark as used
    await db.password_recovery.update_one(
        {"_id": recovery["_id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    return {
        "success": True,
        "message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
    }


# ============================================
# EMPLOYEE RECOVERY - Enterprise Portal
# ============================================

@router.post("/employee/email")
async def request_employee_recovery_email(data: RecoveryRequestEmail, background_tasks: BackgroundTasks):
    """
    Request password recovery via email for employees
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    employee = await db.enterprise_employees.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not employee:
        return {
            "success": True,
            "message": "Si el email existe, recibirás un correo con instrucciones"
        }
    
    token = generate_token()
    token_hash = hash_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_recovery.delete_many({"email": data.email.lower(), "type": "employee"})
    await db.password_recovery.insert_one({
        "email": data.email.lower(),
        "employee_id": employee.get("employee_id"),
        "token_hash": token_hash,
        "type": "employee",
        "method": "email",
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })
    
    # Send email
    try:
        from services.email_service import email_service
        
        reset_url = f"https://admin.manoprotectt.com/reset-password?token={token}"
        
        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10b981; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">Portal de Empleados</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 5px;">ManoProtect</p>
            </div>
            <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1e293b;">Recuperar Contraseña</h2>
                <p style="color: #64748b;">Hola {employee.get('name', 'Usuario')},</p>
                <p style="color: #64748b;">Hemos recibido una solicitud para restablecer tu contraseña del Portal de Empleados.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Restablecer Contraseña
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 14px;">Este enlace expirará en 1 hora.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                <p style="color: #94a3b8; font-size: 13px;">
                    Si no solicitaste este cambio, contacta inmediatamente con IT: +34 601 510 950
                </p>
            </div>
        </div>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to_email=data.email,
            subject="Recuperar Contraseña - Portal Empleados ManoProtect",
            html_content=email_html
        )
    except Exception as e:
        print(f"[Recovery] Employee email error: {e}")
    
    return {
        "success": True,
        "message": "Si el email existe, recibirás un correo con instrucciones",
        "method": "email"
    }


@router.post("/employee/sms")
async def request_employee_recovery_sms(data: RecoveryRequestSMS):
    """
    Request password recovery via SMS for employees
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    phone = data.phone.replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = f"+34{phone}" if not phone.startswith("34") else f"+{phone}"
    
    employee = await db.enterprise_employees.find_one({"phone": {"$regex": phone[-9:]}}, {"_id": 0})
    
    if not employee:
        return {
            "success": True,
            "message": "Si el teléfono está registrado, recibirás un código SMS",
            "phone_masked": f"***{phone[-4:]}"
        }
    
    code = generate_code(6)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db.password_recovery.delete_many({"phone": phone, "type": "employee"})
    await db.password_recovery.insert_one({
        "phone": phone,
        "employee_id": employee.get("employee_id"),
        "email": employee.get("email"),
        "code": code,
        "type": "employee",
        "method": "sms",
        "attempts": 0,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })
    
    # Send SMS
    sms_sent = False
    try:
        from services.sms_service import sms_service
        result = await sms_service.send_verification_code(phone, code)
        sms_sent = result.get("success", False)
    except Exception as e:
        print(f"[Recovery] Employee SMS error: {e}")
    
    return {
        "success": True,
        "message": "Si el teléfono está registrado, recibirás un código SMS",
        "phone_masked": f"***{phone[-4:]}",
        "sms_sent": sms_sent,
        "expires_in_minutes": 10
    }


@router.post("/employee/verify-sms")
async def verify_employee_sms_code(data: VerifySMSCode):
    """
    Verify SMS code for employee recovery
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    phone = data.phone.replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = f"+34{phone}" if not phone.startswith("34") else f"+{phone}"
    
    recovery = await db.password_recovery.find_one({
        "phone": phone,
        "type": "employee",
        "method": "sms",
        "used": False
    })
    
    if not recovery:
        raise HTTPException(status_code=400, detail="No hay solicitud de recuperación pendiente")
    
    expires_at = recovery.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")
    
    attempts = recovery.get("attempts", 0)
    if attempts >= 5:
        raise HTTPException(status_code=429, detail="Demasiados intentos. Solicita un nuevo código.")
    
    if recovery.get("code") != data.code:
        await db.password_recovery.update_one(
            {"_id": recovery["_id"]},
            {"$inc": {"attempts": 1}}
        )
        remaining = 4 - attempts
        raise HTTPException(status_code=400, detail=f"Código incorrecto. Te quedan {remaining} intentos.")
    
    reset_token = generate_token()
    token_hash = hash_token(reset_token)
    
    await db.password_recovery.update_one(
        {"_id": recovery["_id"]},
        {"$set": {
            "sms_verified": True,
            "reset_token_hash": token_hash,
            "token_expires_at": datetime.now(timezone.utc) + timedelta(minutes=15)
        }}
    )
    
    return {
        "success": True,
        "message": "Código verificado correctamente",
        "reset_token": reset_token,
        "expires_in_minutes": 15
    }


@router.post("/employee/reset")
async def reset_employee_password(data: ResetPasswordWithToken):
    """
    Reset employee password using token
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    
    token_hash = hash_token(data.token)
    
    recovery = await db.password_recovery.find_one({
        "$or": [
            {"token_hash": token_hash, "used": False},
            {"reset_token_hash": token_hash, "sms_verified": True, "used": False}
        ],
        "type": "employee"
    })
    
    if not recovery:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    expires_field = "token_expires_at" if recovery.get("sms_verified") else "expires_at"
    expires_at = recovery.get(expires_field)
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="El enlace ha expirado. Solicita uno nuevo.")
    
    password_hash = hashlib.sha256(data.new_password.encode()).hexdigest()
    
    employee_id = recovery.get("employee_id")
    email = recovery.get("email")
    
    result = await db.enterprise_employees.update_one(
        {"$or": [{"employee_id": employee_id}, {"email": email}]},
        {"$set": {
            "password_hash": password_hash,
            "password_updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    await db.password_recovery.update_one(
        {"_id": recovery["_id"]},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    return {
        "success": True,
        "message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
    }
