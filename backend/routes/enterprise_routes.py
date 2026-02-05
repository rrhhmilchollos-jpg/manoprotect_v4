"""
ManoProtect - Enterprise Dashboard Routes
Dashboard y reportes para planes Enterprise/Business
"""
from fastapi import APIRouter, Request, Cookie, HTTPException
from typing import Optional
from datetime import datetime, timezone, timedelta

router = APIRouter(tags=["Enterprise"])

_db = None

def init_enterprise_routes(db):
    """Initialize routes with database"""
    global _db
    _db = db


@router.get("/enterprise/dashboard")
async def get_enterprise_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get enterprise dashboard with advanced metrics"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Aggregation for total counts and risk distribution
    stats_pipeline = [
        {"$match": {"user_id": user.user_id}},
        {"$group": {
            "_id": None,
            "total_threats": {"$sum": 1},
            "threats_blocked": {"$sum": {"$cond": [{"$eq": ["$is_threat", True]}, 1, 0]}},
            "critical": {"$sum": {"$cond": [{"$eq": ["$risk_level", "critical"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}},
            "medium": {"$sum": {"$cond": [{"$eq": ["$risk_level", "medium"]}, 1, 0]}},
            "low": {"$sum": {"$cond": [{"$eq": ["$risk_level", "low"]}, 1, 0]}}
        }}
    ]
    stats_result = await _db.threat_analysis.aggregate(stats_pipeline).to_list(1)
    
    if stats_result:
        stats = stats_result[0]
        total_threats = stats.get("total_threats", 0)
        threats_blocked = stats.get("threats_blocked", 0)
        risk_counts = {
            "critical": stats.get("critical", 0),
            "high": stats.get("high", 0),
            "medium": stats.get("medium", 0),
            "low": stats.get("low", 0)
        }
    else:
        total_threats = 0
        threats_blocked = 0
        risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    # Aggregation for threat types
    threat_types_pipeline = [
        {"$match": {"user_id": user.user_id}},
        {"$unwind": "$threat_types"},
        {"$group": {"_id": "$threat_types", "count": {"$sum": 1}}},
        {"$limit": 20}
    ]
    threat_types_result = await _db.threat_analysis.aggregate(threat_types_pipeline).to_list(20)
    threat_types_count = {item["_id"]: item["count"] for item in threat_types_result}
    
    # Aggregation for daily trends (last 30 days)
    daily_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }}
    ]
    daily_result = await _db.threat_analysis.aggregate(daily_pipeline).to_list(30)
    daily_threats = {item["_id"]: item["count"] for item in daily_result if item["_id"]}
    
    # Calculate money saved (estimated €500 per blocked threat)
    money_saved = threats_blocked * 500
    
    # Generate last 30 days trend
    trend_data = []
    for i in range(30):
        day = (now - timedelta(days=29-i)).strftime("%Y-%m-%d")
        trend_data.append({
            "date": day,
            "threats": daily_threats.get(day, 0)
        })
    
    # Simulated departments
    departments = [
        {"name": "Dirección", "employee_count": 5, "threats_blocked": int(threats_blocked * 0.1), "risk_score": 2.3},
        {"name": "Finanzas", "employee_count": 12, "threats_blocked": int(threats_blocked * 0.35), "risk_score": 4.7},
        {"name": "Comercial", "employee_count": 25, "threats_blocked": int(threats_blocked * 0.3), "risk_score": 3.8},
        {"name": "IT", "employee_count": 8, "threats_blocked": int(threats_blocked * 0.15), "risk_score": 2.1},
        {"name": "RRHH", "employee_count": 6, "threats_blocked": int(threats_blocked * 0.1), "risk_score": 3.2}
    ]
    
    # Get recent alerts
    recent_alerts = await _db.threat_analysis.find(
        {"user_id": user.user_id, "is_threat": True}, 
        {"_id": 0, "content": 1, "risk_level": 1, "threat_types": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "summary": {
            "total_analyzed": total_threats,
            "threats_blocked": threats_blocked,
            "protection_rate": round((threats_blocked / total_threats * 100) if total_threats > 0 else 100, 1),
            "money_saved": money_saved,
            "active_employees": sum(d["employee_count"] for d in departments)
        },
        "risk_distribution": risk_counts,
        "threat_types": threat_types_count,
        "trend_data": trend_data,
        "departments": departments,
        "recent_alerts": recent_alerts
    }


@router.get("/enterprise/reports")
async def get_enterprise_reports(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    period: str = "month"
):
    """Get enterprise reports for specified period"""
    from core.auth import require_auth
    user = await require_auth(request, session_token)
    
    now = datetime.now(timezone.utc)
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=365)
    
    stats_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": start_date}}},
        {"$group": {
            "_id": None,
            "total_threats": {"$sum": 1},
            "blocked": {"$sum": {"$cond": [{"$eq": ["$is_threat", True]}, 1, 0]}},
            "critical": {"$sum": {"$cond": [{"$eq": ["$risk_level", "critical"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}},
            "medium": {"$sum": {"$cond": [{"$eq": ["$risk_level", "medium"]}, 1, 0]}},
            "low": {"$sum": {"$cond": [{"$eq": ["$risk_level", "low"]}, 1, 0]}}
        }}
    ]
    stats_result = await _db.threat_analysis.aggregate(stats_pipeline).to_list(1)
    
    if stats_result:
        stats = stats_result[0]
        total_threats = stats.get("total_threats", 0)
        blocked = stats.get("blocked", 0)
        by_risk = {
            "critical": stats.get("critical", 0),
            "high": stats.get("high", 0),
            "medium": stats.get("medium", 0),
            "low": stats.get("low", 0)
        }
    else:
        total_threats = 0
        blocked = 0
        by_risk = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    
    types_pipeline = [
        {"$match": {"user_id": user.user_id, "created_at": {"$gte": start_date}}},
        {"$unwind": "$threat_types"},
        {"$group": {"_id": "$threat_types", "count": {"$sum": 1}}},
        {"$limit": 20}
    ]
    types_result = await _db.threat_analysis.aggregate(types_pipeline).to_list(20)
    by_type = {item["_id"]: item["count"] for item in types_result}
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat(),
        "total_threats": total_threats,
        "blocked": blocked,
        "by_type": by_type,
        "by_risk": by_risk,
        "generated_at": now.isoformat()
    }
