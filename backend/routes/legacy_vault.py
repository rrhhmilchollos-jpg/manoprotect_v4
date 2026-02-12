"""
Digital Legacy Vault API - Secure encrypted document storage
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional, List
import os
import hashlib
import base64
from datetime import datetime
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

router = APIRouter(prefix="/legacy-vault", tags=["Legacy Vault"])

# In-memory storage (in production, use encrypted database)
vault_storage = {}
master_keys = {}

class UnlockRequest(BaseModel):
    master_password: str

class DocumentCreate(BaseModel):
    title: str
    type: str
    content: str
    notes: Optional[str] = ""
    beneficiary_ids: Optional[List[str]] = []

class BeneficiaryCreate(BaseModel):
    name: str
    email: str
    relationship: str

def derive_key(password: str, salt: bytes) -> bytes:
    """Derive encryption key from password using PBKDF2"""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_content(content: str, key: bytes) -> str:
    """Encrypt content using Fernet (AES-128-CBC)"""
    f = Fernet(key)
    return f.encrypt(content.encode()).decode()

def decrypt_content(encrypted: str, key: bytes) -> str:
    """Decrypt content using Fernet"""
    f = Fernet(key)
    return f.decrypt(encrypted.encode()).decode()

def get_user_id():
    """Placeholder for user authentication - in production use JWT"""
    return "default_user"

@router.post("/unlock")
async def unlock_vault(request: UnlockRequest):
    """Unlock the vault with master password"""
    user_id = get_user_id()
    
    if len(request.master_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    
    # Generate or verify master key
    password_hash = hashlib.sha256(request.master_password.encode()).hexdigest()
    
    if user_id in vault_storage:
        # Verify existing password
        stored_hash = vault_storage[user_id].get("password_hash")
        if stored_hash and stored_hash != password_hash:
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    else:
        # First time - create vault
        salt = os.urandom(16)
        vault_storage[user_id] = {
            "password_hash": password_hash,
            "salt": salt,
            "documents": [],
            "beneficiaries": [],
            "created_at": datetime.now().isoformat()
        }
    
    # Store derived key in memory for session
    salt = vault_storage[user_id].get("salt", os.urandom(16))
    master_keys[user_id] = derive_key(request.master_password, salt)
    
    return {"success": True, "message": "Bóveda desbloqueada"}

@router.get("/documents")
async def list_documents(x_master_password: str = Header(None)):
    """List all documents in the vault"""
    user_id = get_user_id()
    
    if user_id not in vault_storage:
        return {"documents": []}
    
    if user_id not in master_keys:
        raise HTTPException(status_code=401, detail="Bóveda bloqueada")
    
    key = master_keys[user_id]
    documents = []
    
    for doc in vault_storage[user_id].get("documents", []):
        try:
            decrypted_content = decrypt_content(doc["encrypted_content"], key)
            documents.append({
                "id": doc["id"],
                "title": doc["title"],
                "type": doc["type"],
                "content": decrypted_content,
                "notes": doc.get("notes", ""),
                "beneficiary_ids": doc.get("beneficiary_ids", []),
                "created_at": doc["created_at"]
            })
        except Exception as e:
            # Skip documents that can't be decrypted
            continue
    
    return {"documents": documents}

@router.post("/documents")
async def create_document(doc: DocumentCreate, x_master_password: str = Header(None)):
    """Create a new encrypted document"""
    user_id = get_user_id()
    
    if user_id not in vault_storage:
        raise HTTPException(status_code=401, detail="Bóveda no inicializada")
    
    if user_id not in master_keys:
        raise HTTPException(status_code=401, detail="Bóveda bloqueada")
    
    key = master_keys[user_id]
    encrypted_content = encrypt_content(doc.content, key)
    
    new_doc = {
        "id": f"doc_{datetime.now().timestamp()}_{os.urandom(4).hex()}",
        "title": doc.title,
        "type": doc.type,
        "encrypted_content": encrypted_content,
        "notes": doc.notes,
        "beneficiary_ids": doc.beneficiary_ids,
        "created_at": datetime.now().isoformat()
    }
    
    vault_storage[user_id]["documents"].append(new_doc)
    
    return {"success": True, "id": new_doc["id"], "message": "Documento guardado"}

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, x_master_password: str = Header(None)):
    """Delete a document from the vault"""
    user_id = get_user_id()
    
    if user_id not in vault_storage:
        raise HTTPException(status_code=404, detail="Bóveda no encontrada")
    
    if user_id not in master_keys:
        raise HTTPException(status_code=401, detail="Bóveda bloqueada")
    
    documents = vault_storage[user_id].get("documents", [])
    vault_storage[user_id]["documents"] = [d for d in documents if d["id"] != doc_id]
    
    return {"success": True, "message": "Documento eliminado"}

@router.get("/beneficiaries")
async def list_beneficiaries():
    """List beneficiaries"""
    user_id = get_user_id()
    
    if user_id not in vault_storage:
        return {"beneficiaries": []}
    
    return {"beneficiaries": vault_storage[user_id].get("beneficiaries", [])}

@router.post("/beneficiaries")
async def add_beneficiary(beneficiary: BeneficiaryCreate):
    """Add a beneficiary"""
    user_id = get_user_id()
    
    if user_id not in vault_storage:
        raise HTTPException(status_code=401, detail="Bóveda no inicializada")
    
    new_beneficiary = {
        "id": f"ben_{datetime.now().timestamp()}_{os.urandom(4).hex()}",
        "name": beneficiary.name,
        "email": beneficiary.email,
        "relationship": beneficiary.relationship,
        "created_at": datetime.now().isoformat()
    }
    
    if "beneficiaries" not in vault_storage[user_id]:
        vault_storage[user_id]["beneficiaries"] = []
    
    vault_storage[user_id]["beneficiaries"].append(new_beneficiary)
    
    return {"success": True, "id": new_beneficiary["id"]}
