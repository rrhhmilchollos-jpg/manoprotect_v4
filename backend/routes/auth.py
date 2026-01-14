"""
MANO - Authentication Routes
Handles user registration, login, logout, and session management
"""
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from typing import Optional
from datetime import datetime, timezone, timedelta
import httpx

from core.config import (
    db, hash_password, verify_password, 
    generate_session_token, get_current_user
)
from models.schemas import User, UserRegister, UserLogin, SessionData

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register_user(data: UserRegister, response: Response):
    """Register new user with email/password"""
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user = User(
        email=data.email,
        name=data.name,
        auth_provider="email",
        password_hash=hash_password(data.password)
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    session_token = generate_session_token()
    session = SessionData(
        user_id=user.user_id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_doc = session.model_dump()
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "plan": user.plan
    }


@router.post("/login")
async def login_user(data: UserLogin, response: Response):
    """Login with email/password"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    session_token = generate_session_token()
    session = SessionData(
        user_id=user["user_id"],
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_doc = session.model_dump()
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "user"),
        "plan": user.get("plan", "free"),
        "picture": user.get("picture")
    }


@router.post("/google/session")
async def google_session(request: Request, response: Response):
    """Exchange Google OAuth session_id for local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requerido")
    
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Sesión de Google inválida")
    
    google_data = auth_response.json()
    email = google_data.get("email")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "name": name,
                "picture": picture,
                "auth_provider": "google"
            }}
        )
        user_id = existing_user["user_id"]
        role = existing_user.get("role", "user")
        plan = existing_user.get("plan", "free")
    else:
        user = User(
            email=email,
            name=name,
            picture=picture,
            auth_provider="google"
        )
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        await db.users.insert_one(user_doc)
        user_id = user.user_id
        role = user.role
        plan = user.plan
    
    session_token = generate_session_token()
    session = SessionData(
        user_id=user_id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_doc = session.model_dump()
    session_doc['expires_at'] = session_doc['expires_at'].isoformat()
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": role,
        "plan": plan,
        "session_token": session_token
    }


@router.get("/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current authenticated user"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "role": user.role,
        "plan": user.plan,
        "phone": user.phone,
        "dark_mode": user.dark_mode,
        "notifications_enabled": user.notifications_enabled,
        "auto_block": user.auto_block
    }


@router.post("/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout - clear session"""
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Sesión cerrada correctamente"}
