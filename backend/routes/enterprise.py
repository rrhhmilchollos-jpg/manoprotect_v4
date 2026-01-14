"""
MANO - Enterprise Routes
Enterprise dashboard and corporate features
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional
from datetime import datetime, timezone, timedelta

from core.config import db, require_auth

router = APIRouter(prefix="/enterprise", tags=["Enterprise"])


@router.get("/dashboard")
async def get_enterprise_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get enterprise dashboard stats"""
    user = await require_auth(request, session_token)
    
    if user.plan not in ["business", "enterprise"]:
        raise HTTPException(status_code=403, detail="Se requiere plan Business o Enterprise")
    
    company_users = await db.users.find(
        {"company_id": user.user_id},
        {"_id": 0, "password_hash": 0}
    ).to_list(100)
    
    total_threats = await db.threat_analysis.count_documents({
        "user_id": {"$in": [u["user_id"] for u in company_users] + [user.user_id]}
    })
    
    blocked_threats = await db.threat_analysis.count_documents({
        "user_id": {"$in": [u["user_id"] for u in company_users] + [user.user_id]},
        "is_threat": True
    })
    
    recent_alerts = await db.threat_analysis.find(
        {
            "user_id": {"$in": [u["user_id"] for u in company_users] + [user.user_id]},
            "is_threat": True
        },
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "stats": {
            "total_employees": len(company_users) + 1,
            "total_analyzed": total_threats,
            "threats_blocked": blocked_threats,
            "protection_rate": round((blocked_threats / max(total_threats, 1)) * 100, 1)
        },
        "employees": company_users,
        "recent_alerts": recent_alerts
    }


@router.post("/invite-employee")
async def invite_employee(request: Request, session_token: Optional[str] = Cookie(None)):
    """Invite an employee to the enterprise plan"""
    user = await require_auth(request, session_token)
    body = await request.json()
    
    if user.plan not in ["business", "enterprise"]:
        raise HTTPException(status_code=403, detail="Se requiere plan Business o Enterprise")
    
    email = body.get("email")
    name = body.get("name")
    department = body.get("department", "General")
    
    if not email or not name:
        raise HTTPException(status_code=400, detail="email y name son requeridos")
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    import uuid
    from core.config import hash_password
    from models.schemas import User
    
    temp_password = f"temp_{uuid.uuid4().hex[:8]}"
    
    new_user = User(
        email=email,
        name=name,
        password_hash=hash_password(temp_password),
        plan=user.plan
    )
    
    user_doc = new_user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['company_id'] = user.user_id
    user_doc['department'] = department
    
    await db.users.insert_one(user_doc)
    
    return {
        "message": "Empleado invitado",
        "user_id": new_user.user_id,
        "temp_password": temp_password
    }


@router.get("/threat-report")
async def get_threat_report(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    days: int = 30
):
    """Get enterprise threat report"""
    user = await require_auth(request, session_token)
    
    if user.plan not in ["business", "enterprise"]:
        raise HTTPException(status_code=403, detail="Se requiere plan Business o Enterprise")
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    company_users = await db.users.find(
        {"company_id": user.user_id},
        {"user_id": 1}
    ).to_list(100)
    
    user_ids = [u["user_id"] for u in company_users] + [user.user_id]
    
    pipeline = [
        {
            "$match": {
                "user_id": {"$in": user_ids},
                "created_at": {"$gte": start_date.isoformat()}
            }
        },
        {
            "$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},
                "total": {"$sum": 1},
                "threats": {"$sum": {"$cond": ["$is_threat", 1, 0]}}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    daily_stats = await db.threat_analysis.aggregate(pipeline).to_list(100)
    
    threat_types = await db.threat_analysis.aggregate([
        {
            "$match": {
                "user_id": {"$in": user_ids},
                "is_threat": True
            }
        },
        {"$unwind": "$threat_types"},
        {"$group": {"_id": "$threat_types", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(10)
    
    return {
        "period_days": days,
        "daily_stats": daily_stats,
        "threat_types": threat_types,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
