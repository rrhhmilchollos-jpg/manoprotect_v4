"""
Device Management Routes - ManoProtect
Endpoints for device tracking, IP management, and blocking
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel
import hashlib

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

def init_db(db):
    global _db
    _db = db

class BlockDeviceRequest(BaseModel):
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    reason: str
    duration_hours: Optional[int] = None  # None = permanent

class UnblockRequest(BaseModel):
    block_id: str

def generate_device_fingerprint(request: Request) -> str:
    """Generate a fingerprint from request headers"""
    user_agent = request.headers.get("user-agent", "")
    accept_lang = request.headers.get("accept-language", "")
    accept_enc = request.headers.get("accept-encoding", "")
    
    fingerprint_data = f"{user_agent}|{accept_lang}|{accept_enc}"
    return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:16]

def get_client_ip(request: Request) -> str:
    """Get real client IP address"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# ============================================
# DEVICE TRACKING
# ============================================

@router.post("/device/register")
async def register_device(request: Request, user: User = Depends(get_current_user)):
    """Register/update device for current user"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    ip_address = get_client_ip(request)
    device_fingerprint = generate_device_fingerprint(request)
    user_agent = request.headers.get("user-agent", "")
    
    device_data = {
        "device_id": f"dev_{device_fingerprint}",
        "user_id": user.user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "fingerprint": device_fingerprint,
        "last_seen": datetime.now(timezone.utc).isoformat(),
        "first_seen": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    # Check if device exists
    existing = await _db.user_devices.find_one({
        "user_id": user.user_id,
        "fingerprint": device_fingerprint
    })
    
    if existing:
        await _db.user_devices.update_one(
            {"user_id": user.user_id, "fingerprint": device_fingerprint},
            {"$set": {
                "ip_address": ip_address,
                "user_agent": user_agent,
                "last_seen": datetime.now(timezone.utc).isoformat()
            }}
        )
        device_data["first_seen"] = existing.get("first_seen")
    else:
        await _db.user_devices.insert_one(device_data)
    
    return {"message": "Dispositivo registrado", "device_id": device_data["device_id"]}

@router.get("/device/my-devices")
async def get_my_devices(user: User = Depends(get_current_user)):
    """Get all devices for current user"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    devices = await _db.user_devices.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("last_seen", -1).to_list(length=50)
    
    return {"devices": devices}

# ============================================
# IP & DEVICE BLOCKING (ADMIN)
# ============================================

@router.post("/admin/device/block")
async def block_device_or_ip(data: BlockDeviceRequest, request: Request, user: User = Depends(get_current_user)):
    """Admin: Block a device or IP address"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    if not data.device_id and not data.ip_address:
        raise HTTPException(status_code=400, detail="Debes proporcionar device_id o ip_address")
    
    block_id = f"block_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{hashlib.md5((data.device_id or data.ip_address or '').encode()).hexdigest()[:8]}"
    
    expires_at = None
    if data.duration_hours:
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=data.duration_hours)).isoformat()
    
    block_record = {
        "block_id": block_id,
        "device_id": data.device_id,
        "ip_address": data.ip_address,
        "reason": data.reason,
        "blocked_by": user.user_id,
        "blocked_by_email": user.email,
        "blocked_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "is_active": True,
        "block_type": "device" if data.device_id else "ip"
    }
    
    await _db.blocked_devices.insert_one(block_record)
    
    # Log the action
    await _db.admin_logs.insert_one({
        "action": "device_blocked",
        "target": data.device_id or data.ip_address,
        "reason": data.reason,
        "performed_by": user.user_id,
        "timestamp": datetime.now(timezone.utc)
    })
    
    return {"message": "Dispositivo/IP bloqueado", "block": {k: v for k, v in block_record.items() if k != '_id'}}

@router.post("/admin/device/unblock")
async def unblock_device_or_ip(data: UnblockRequest, user: User = Depends(get_current_user)):
    """Admin: Unblock a device or IP"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    result = await _db.blocked_devices.update_one(
        {"block_id": data.block_id},
        {"$set": {
            "is_active": False,
            "unblocked_by": user.user_id,
            "unblocked_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bloqueo no encontrado")
    
    return {"message": "Dispositivo/IP desbloqueado"}

@router.get("/admin/device/blocked")
async def get_blocked_list(user: User = Depends(get_current_user)):
    """Admin: Get all blocked devices/IPs"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    blocked = await _db.blocked_devices.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("blocked_at", -1).to_list(length=500)
    
    # Check for expired blocks
    now = datetime.now(timezone.utc).isoformat()
    active_blocks = []
    for block in blocked:
        if block.get("expires_at") and block["expires_at"] < now:
            # Auto-expire
            await _db.blocked_devices.update_one(
                {"block_id": block["block_id"]},
                {"$set": {"is_active": False, "expired": True}}
            )
        else:
            active_blocks.append(block)
    
    return {"blocked": active_blocks, "total": len(active_blocks)}

@router.get("/admin/device/all")
async def get_all_devices(
    user_id: Optional[str] = None,
    limit: int = 100,
    user: User = Depends(get_current_user)
):
    """Admin: Get all registered devices"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    devices = await _db.user_devices.find(
        query,
        {"_id": 0}
    ).sort("last_seen", -1).to_list(length=limit)
    
    return {"devices": devices, "total": len(devices)}

@router.get("/admin/device/stats")
async def get_device_stats(user: User = Depends(get_current_user)):
    """Admin: Get device statistics"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    total_devices = await _db.user_devices.count_documents({})
    active_blocks = await _db.blocked_devices.count_documents({"is_active": True})
    blocked_ips = await _db.blocked_devices.count_documents({"is_active": True, "block_type": "ip"})
    blocked_devices = await _db.blocked_devices.count_documents({"is_active": True, "block_type": "device"})
    
    # Unique IPs
    pipeline = [{"$group": {"_id": "$ip_address"}}, {"$count": "total"}]
    unique_ips_result = await _db.user_devices.aggregate(pipeline).to_list(length=1)
    unique_ips = unique_ips_result[0]["total"] if unique_ips_result else 0
    
    # Recent activity (last 24h)
    yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent_activity = await _db.user_devices.count_documents({"last_seen": {"$gte": yesterday}})
    
    return {
        "total_devices": total_devices,
        "unique_ips": unique_ips,
        "active_blocks": active_blocks,
        "blocked_ips": blocked_ips,
        "blocked_devices": blocked_devices,
        "recent_activity_24h": recent_activity
    }

@router.get("/admin/device/ip-history/{ip_address}")
async def get_ip_history(ip_address: str, user: User = Depends(get_current_user)):
    """Admin: Get all activity from a specific IP"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Get devices from this IP
    devices = await _db.user_devices.find(
        {"ip_address": ip_address},
        {"_id": 0}
    ).to_list(length=100)
    
    # Get users who used this IP
    user_ids = list(set(d.get("user_id") for d in devices))
    users = await _db.users.find(
        {"user_id": {"$in": user_ids}},
        {"_id": 0, "password_hash": 0}
    ).to_list(length=100)
    
    # Get login attempts from this IP
    login_attempts = await _db.login_attempts.find(
        {"ip_address": ip_address},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(length=50)
    
    # Check if blocked
    block = await _db.blocked_devices.find_one(
        {"ip_address": ip_address, "is_active": True},
        {"_id": 0}
    )
    
    return {
        "ip_address": ip_address,
        "devices": devices,
        "users": users,
        "login_attempts": login_attempts,
        "is_blocked": block is not None,
        "block_info": block
    }

# ============================================
# CHECK IF BLOCKED (for middleware)
# ============================================

async def is_blocked(ip_address: str, device_fingerprint: str = None) -> tuple:
    """Check if IP or device is blocked. Returns (is_blocked, reason)"""
    if _db is None:
        return False, None
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Check IP block
    ip_block = await _db.blocked_devices.find_one({
        "ip_address": ip_address,
        "is_active": True,
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": now}}
        ]
    })
    
    if ip_block:
        return True, f"IP bloqueada: {ip_block.get('reason', 'Sin razón especificada')}"
    
    # Check device block
    if device_fingerprint:
        device_block = await _db.blocked_devices.find_one({
            "device_id": f"dev_{device_fingerprint}",
            "is_active": True,
            "$or": [
                {"expires_at": None},
                {"expires_at": {"$gt": now}}
            ]
        })
        
        if device_block:
            return True, f"Dispositivo bloqueado: {device_block.get('reason', 'Sin razón especificada')}"
    
    return False, None
