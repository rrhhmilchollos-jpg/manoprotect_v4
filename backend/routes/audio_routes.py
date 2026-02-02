"""
Audio Storage Routes - ManoProtect
Endpoints for storing and managing SOS audio recordings per user/family
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Depends
from fastapi.responses import FileResponse
from datetime import datetime, timezone
from typing import Optional, List
import os
import uuid
import shutil

from core.auth import get_current_user
from models.all_schemas import User

router = APIRouter()
_db = None

# Base directory for audio storage
AUDIO_BASE_DIR = "/app/backend/uploads/audio"

def init_db(db):
    global _db
    _db = db
    # Ensure base directory exists
    os.makedirs(AUDIO_BASE_DIR, exist_ok=True)

def get_user_audio_dir(user_id: str) -> str:
    """Get or create user's audio directory"""
    user_dir = os.path.join(AUDIO_BASE_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

def get_family_audio_dir(user_id: str, family_id: str) -> str:
    """Get or create family's audio directory within user folder"""
    family_dir = os.path.join(AUDIO_BASE_DIR, user_id, f"family_{family_id}")
    os.makedirs(family_dir, exist_ok=True)
    return family_dir

@router.post("/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    sos_id: Optional[str] = None,
    family_id: Optional[str] = None,
    description: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Upload an audio recording"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    # Validate file type
    allowed_types = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {file.content_type}")
    
    # Generate unique filename
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    audio_id = f"audio_{uuid.uuid4().hex[:8]}"
    extension = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
    filename = f"{timestamp}_{audio_id}.{extension}"
    
    # Determine storage directory
    if family_id:
        audio_dir = get_family_audio_dir(user.user_id, family_id)
    else:
        audio_dir = get_user_audio_dir(user.user_id)
    
    filepath = os.path.join(audio_dir, filename)
    
    # Save file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar archivo: {str(e)}")
    
    # Get file size
    file_size = os.path.getsize(filepath)
    
    # Save metadata to database
    audio_record = {
        "audio_id": audio_id,
        "user_id": user.user_id,
        "family_id": family_id,
        "sos_id": sos_id,
        "filename": filename,
        "filepath": filepath,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "description": description,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by_name": user.name,
        "created_by_email": user.email
    }
    
    await _db.audio_recordings.insert_one(audio_record)
    
    # Return without _id
    audio_record.pop('_id', None)
    
    return {
        "message": "Audio subido correctamente",
        "audio": audio_record
    }

@router.get("/audio/list")
async def list_user_audios(
    family_id: Optional[str] = None,
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """List user's audio recordings"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    query = {"user_id": user.user_id}
    if family_id:
        query["family_id"] = family_id
    
    audios = await _db.audio_recordings.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=limit)
    
    return {"audios": audios, "total": len(audios)}

@router.get("/audio/{audio_id}")
async def get_audio(audio_id: str, user: User = Depends(get_current_user)):
    """Get audio file"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    # Find audio record
    audio = await _db.audio_recordings.find_one(
        {"audio_id": audio_id},
        {"_id": 0}
    )
    
    if not audio:
        raise HTTPException(status_code=404, detail="Audio no encontrado")
    
    # Check permission (owner or admin)
    if audio["user_id"] != user.user_id and user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este audio")
    
    # Return file
    if not os.path.exists(audio["filepath"]):
        raise HTTPException(status_code=404, detail="Archivo no encontrado en el servidor")
    
    return FileResponse(
        audio["filepath"],
        media_type=audio["content_type"],
        filename=audio["original_filename"]
    )

@router.delete("/audio/{audio_id}")
async def delete_audio(audio_id: str, user: User = Depends(get_current_user)):
    """Delete audio recording"""
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    # Find audio record
    audio = await _db.audio_recordings.find_one({"audio_id": audio_id})
    
    if not audio:
        raise HTTPException(status_code=404, detail="Audio no encontrado")
    
    # Check permission (owner or admin)
    if audio["user_id"] != user.user_id and user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este audio")
    
    # Delete file
    if os.path.exists(audio["filepath"]):
        os.remove(audio["filepath"])
    
    # Delete record
    await _db.audio_recordings.delete_one({"audio_id": audio_id})
    
    return {"message": "Audio eliminado correctamente"}

# ============================================
# ADMIN ENDPOINTS
# ============================================

@router.get("/admin/audio/all")
async def admin_list_all_audios(
    user_id: Optional[str] = None,
    family_id: Optional[str] = None,
    limit: int = 100,
    user: User = Depends(get_current_user)
):
    """Admin: List all audio recordings"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if family_id:
        query["family_id"] = family_id
    
    audios = await _db.audio_recordings.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=limit)
    
    # Get storage stats
    total_size = sum(a.get("file_size", 0) for a in audios)
    
    return {
        "audios": audios,
        "total": len(audios),
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2)
    }

@router.get("/admin/audio/stats")
async def admin_audio_stats(user: User = Depends(get_current_user)):
    """Admin: Get audio storage statistics"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Count total audios
    total_audios = await _db.audio_recordings.count_documents({})
    
    # Get all audios for size calculation
    all_audios = await _db.audio_recordings.find({}, {"file_size": 1, "user_id": 1}).to_list(length=10000)
    
    total_size = sum(a.get("file_size", 0) for a in all_audios)
    unique_users = len(set(a.get("user_id") for a in all_audios))
    
    # Get directory size on disk
    disk_size = 0
    for dirpath, dirnames, filenames in os.walk(AUDIO_BASE_DIR):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if os.path.exists(fp):
                disk_size += os.path.getsize(fp)
    
    return {
        "total_audios": total_audios,
        "total_users_with_audios": unique_users,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "disk_size_mb": round(disk_size / (1024 * 1024), 2),
        "storage_path": AUDIO_BASE_DIR
    }

@router.get("/admin/audio/users")
async def admin_audio_by_users(user: User = Depends(get_current_user)):
    """Admin: Get audio count grouped by users"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    pipeline = [
        {
            "$group": {
                "_id": "$user_id",
                "count": {"$sum": 1},
                "total_size": {"$sum": "$file_size"},
                "latest": {"$max": "$created_at"},
                "user_name": {"$first": "$created_by_name"},
                "user_email": {"$first": "$created_by_email"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    results = await _db.audio_recordings.aggregate(pipeline).to_list(length=1000)
    
    return {"users": results}

@router.delete("/admin/audio/user/{user_id}")
async def admin_delete_user_audios(user_id: str, user: User = Depends(get_current_user)):
    """Admin: Delete all audios for a specific user"""
    if not user or user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Get all audio records for user
    audios = await _db.audio_recordings.find({"user_id": user_id}).to_list(length=10000)
    
    # Delete files
    deleted_count = 0
    for audio in audios:
        if os.path.exists(audio.get("filepath", "")):
            os.remove(audio["filepath"])
            deleted_count += 1
    
    # Delete records
    result = await _db.audio_recordings.delete_many({"user_id": user_id})
    
    # Try to remove user directory if empty
    user_dir = os.path.join(AUDIO_BASE_DIR, user_id)
    if os.path.exists(user_dir):
        try:
            shutil.rmtree(user_dir)
        except:
            pass
    
    return {
        "message": f"Eliminados {result.deleted_count} audios del usuario",
        "files_deleted": deleted_count
    }
