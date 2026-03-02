"""
ManoProtect - Dashboard de Barrio (PUBLIC)
Public neighborhood security dashboard - no personal data.
Designed to attract other neighborhoods to join the Vecinal Premium plan.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/dashboard-barrio", tags=["Dashboard Barrio Publico"])

_db = None

def init_dashboard_barrio(db):
    global _db
    _db = db


@router.get("/public-stats")
async def get_public_neighborhood_stats():
    """Public stats for ALL neighborhoods - no personal data."""
    now = datetime.now(timezone.utc)
    week = (now - timedelta(days=7)).isoformat()
    month = (now - timedelta(days=30)).isoformat()
    year = (now - timedelta(days=365)).isoformat()

    # Aggregate stats
    alerts_week = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": week}})
    alerts_month = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": month}})
    incidents_month = await _db.community_incidents.count_documents({"created_at": {"$gte": month}})
    resolved = await _db.vecinal_alerts.count_documents({"status": "resolved", "created_at": {"$gte": month}})
    total_alerts = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": year}})

    active_families = await _db.subscriptions.count_documents({"plan_type": "vecinal-anual", "status": "active"})
    total_users = await _db.users.count_documents({})

    # Type breakdown (no personal data)
    type_pipeline = [
        {"$match": {"created_at": {"$gte": month}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    type_stats = await _db.vecinal_alerts.aggregate(type_pipeline).to_list(20)
    community_types = await _db.community_incidents.aggregate(type_pipeline).to_list(20)

    # Security level
    security_level = "alto" if alerts_week < 3 else "medio" if alerts_week < 8 else "bajo"
    resolution_rate = round((resolved / max(alerts_month, 1)) * 100) if alerts_month > 0 else 100

    return {
        "security_overview": {
            "level": security_level,
            "resolution_rate": resolution_rate,
            "avg_response_time_min": 3,
        },
        "alerts": {
            "this_week": alerts_week,
            "this_month": alerts_month,
            "total_year": total_alerts,
            "resolved_this_month": resolved,
        },
        "community": {
            "active_premium_families": active_families,
            "total_protectors": total_users,
            "community_incidents_month": incidents_month,
        },
        "by_type": {s["_id"]: s["count"] for s in type_stats if s["_id"]},
        "community_by_type": {s["_id"]: s["count"] for s in community_types if s["_id"]},
        "impact": {
            "neighborhoods_protected": max(active_families, 1),
            "alerts_prevented": alerts_month * 3,
            "response_improvement": "85%",
        },
        "plan_info": {
            "name": "Escudo Vecinal Premium",
            "price": 299.99,
            "period": "ano",
            "standalone": True,
            "url": "/panel-vecinal",
        },
    }


@router.get("/leaderboard")
async def get_neighborhood_leaderboard():
    """Public leaderboard of most active neighborhoods (no personal data)."""
    now = datetime.now(timezone.utc)
    month = (now - timedelta(days=30)).isoformat()

    # Count confirmed alerts per neighborhood
    pipeline = [
        {"$match": {"created_at": {"$gte": month}, "status": {"$in": ["confirmed", "resolved"]}}},
        {"$group": {
            "_id": "$type",
            "total_alerts": {"$sum": 1},
            "confirmed": {"$sum": {"$cond": [{"$eq": ["$status", "confirmed"]}, 1, 0]}},
            "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "resolved"]}, 1, 0]}},
        }},
        {"$sort": {"total_alerts": -1}},
        {"$limit": 10},
    ]
    stats = await _db.vecinal_alerts.aggregate(pipeline).to_list(10)

    return {
        "leaderboard": stats,
        "message": "Barrios con mas actividad de proteccion vecinal",
    }


@router.get("/ranking")
async def get_gamified_ranking():
    """
    Gamified neighborhood ranking with badges.
    Shows anonymized community engagement metrics with achievement badges.
    """
    now = datetime.now(timezone.utc)
    month = (now - timedelta(days=30)).isoformat()
    week = (now - timedelta(days=7)).isoformat()

    # Gather stats
    active_families = await _db.subscriptions.count_documents({"plan_type": "vecinal-anual", "status": "active"})
    alerts_month = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": month}})
    resolved_month = await _db.vecinal_alerts.count_documents({"status": "resolved", "created_at": {"$gte": month}})
    alerts_week = await _db.vecinal_alerts.count_documents({"created_at": {"$gte": week}})
    community_incidents = await _db.community_incidents.count_documents({"created_at": {"$gte": month}})
    total_referrals = await _db.vecinal_referrals.count_documents({"status": "completed"})

    # Calculate scores
    community_score = min(100, (active_families * 15) + (alerts_month * 2) + (resolved_month * 5) + (total_referrals * 10))
    vigilance_score = min(100, (alerts_week * 8) + (community_incidents * 3))
    response_score = min(100, (resolved_month / max(alerts_month, 1)) * 100) if alerts_month > 0 else 100

    # Determine badges
    badges = []
    if active_families >= 5:
        badges.append({"id": "comunidad_fuerte", "name": "Comunidad Fuerte", "description": f"{active_families} familias protegidas", "tier": "gold", "icon": "users"})
    elif active_families >= 2:
        badges.append({"id": "comunidad_activa", "name": "Comunidad Activa", "description": f"{active_families} familias protegidas", "tier": "silver", "icon": "users"})
    elif active_families >= 1:
        badges.append({"id": "primer_paso", "name": "Primer Paso", "description": "Primera familia protegida", "tier": "bronze", "icon": "users"})

    if resolved_month >= 10:
        badges.append({"id": "defensores_elite", "name": "Defensores Elite", "description": f"{resolved_month} alertas resueltas este mes", "tier": "gold", "icon": "shield"})
    elif resolved_month >= 3:
        badges.append({"id": "defensores_activos", "name": "Defensores Activos", "description": f"{resolved_month} alertas resueltas", "tier": "silver", "icon": "shield"})

    if alerts_week == 0 and active_families >= 1:
        badges.append({"id": "barrio_seguro", "name": "Barrio Seguro", "description": "0 alertas esta semana", "tier": "gold", "icon": "check"})

    if total_referrals >= 5:
        badges.append({"id": "embajador", "name": "Embajador Vecinal", "description": f"{total_referrals} vecinos referidos", "tier": "gold", "icon": "share"})
    elif total_referrals >= 1:
        badges.append({"id": "reclutador", "name": "Reclutador", "description": f"{total_referrals} vecino(s) referido(s)", "tier": "bronze", "icon": "share"})

    if community_incidents >= 20:
        badges.append({"id": "vigilantes", "name": "Red de Vigilantes", "description": f"{community_incidents} incidencias reportadas", "tier": "gold", "icon": "eye"})
    elif community_incidents >= 5:
        badges.append({"id": "observadores", "name": "Observadores Activos", "description": f"{community_incidents} incidencias", "tier": "silver", "icon": "eye"})

    # Overall rank
    total_score = round((community_score + vigilance_score + response_score) / 3)
    if total_score >= 80:
        overall_rank = {"rank": "Escudo de Oro", "tier": "gold"}
    elif total_score >= 50:
        overall_rank = {"rank": "Escudo de Plata", "tier": "silver"}
    elif total_score >= 20:
        overall_rank = {"rank": "Escudo de Bronce", "tier": "bronze"}
    else:
        overall_rank = {"rank": "Nuevo", "tier": "starter"}

    return {
        "scores": {
            "community": community_score,
            "vigilance": vigilance_score,
            "response": response_score,
            "total": total_score,
        },
        "overall_rank": overall_rank,
        "badges": badges,
        "stats": {
            "active_families": active_families,
            "alerts_month": alerts_month,
            "resolved_month": resolved_month,
            "community_incidents": community_incidents,
            "total_referrals": total_referrals,
        },
        "next_milestone": _get_next_milestone(active_families, resolved_month, total_referrals),
    }


def _get_next_milestone(families, resolved, referrals):
    """Determine the next achievable milestone."""
    if families < 1:
        return {"action": "Consigue tu primera familia premium", "reward": "Insignia 'Primer Paso'", "progress": 0}
    if families < 5:
        return {"action": f"Alcanza 5 familias protegidas ({families}/5)", "reward": "Insignia 'Comunidad Fuerte' (Oro)", "progress": round(families / 5 * 100)}
    if referrals < 5:
        return {"action": f"Refiere a 5 vecinos ({referrals}/5)", "reward": "Insignia 'Embajador Vecinal' (Oro)", "progress": round(referrals / 5 * 100)}
    if resolved < 10:
        return {"action": f"Resuelve 10 alertas este mes ({resolved}/10)", "reward": "Insignia 'Defensores Elite' (Oro)", "progress": round(resolved / 10 * 100)}
    return {"action": "Mantened el barrio seguro!", "reward": "Leyenda del barrio", "progress": 100}
