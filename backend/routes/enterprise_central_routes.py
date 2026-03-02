"""
ManoProtect - Enterprise Central System
Company management + Sales commercial tools
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/enterprise-central", tags=["Enterprise Central"])

_db = None

def init_enterprise_central(db):
    global _db
    _db = db


# ============================================
# MODELS
# ============================================

class SalesLead(BaseModel):
    name: str
    email: str
    phone: str = ""
    source: str = "web"
    interest: str = ""
    notes: str = ""
    neighborhood: str = ""

class SalesUpdate(BaseModel):
    status: str = ""
    notes: str = ""
    assigned_to: str = ""

class InstallationSchedule(BaseModel):
    client_name: str
    address: str
    phone: str
    plan_type: str
    scheduled_date: str
    technician_id: str = ""
    notes: str = ""


# ============================================
# COMPANY DASHBOARD
# ============================================

@router.get("/dashboard")
async def enterprise_dashboard():
    """Central company dashboard - all key metrics"""
    now = datetime.now(timezone.utc)
    month = (now - timedelta(days=30)).isoformat()
    week = (now - timedelta(days=7)).isoformat()

    total_users = await _db.users.count_documents({})
    active_subs = await _db.subscriptions.count_documents({"status": "active"})
    monthly_leads = await _db.sales_leads.count_documents({"created_at": {"$gte": month}})
    weekly_leads = await _db.sales_leads.count_documents({"created_at": {"$gte": week}})
    pending_installs = await _db.installations.count_documents({"status": "pending"})
    employees = await _db.employees.count_documents({"is_active": True})
    newsletter_subs = await _db.newsletter_subscribers.count_documents({"active": True})

    # Revenue estimates
    vecinal_subs = await _db.subscriptions.count_documents({"plan_type": "vecinal-anual", "status": "active"})
    alarm_subs = await _db.subscriptions.count_documents({"plan_type": {"$regex": "^alarm"}, "status": "active"})
    family_subs = await _db.subscriptions.count_documents({"plan_type": {"$regex": "^family"}, "status": "active"})

    est_monthly_revenue = (vecinal_subs * 25) + (alarm_subs * 35) + (family_subs * 10)

    # Lead pipeline
    leads_new = await _db.sales_leads.count_documents({"status": "new", "created_at": {"$gte": month}})
    leads_contacted = await _db.sales_leads.count_documents({"status": "contacted"})
    leads_qualified = await _db.sales_leads.count_documents({"status": "qualified"})
    leads_closed = await _db.sales_leads.count_documents({"status": "closed", "created_at": {"$gte": month}})

    return {
        "overview": {
            "total_users": total_users,
            "active_subscriptions": active_subs,
            "active_employees": employees,
            "newsletter_subscribers": newsletter_subs,
        },
        "revenue": {
            "estimated_monthly": est_monthly_revenue,
            "vecinal_subscribers": vecinal_subs,
            "alarm_subscribers": alarm_subs,
            "family_subscribers": family_subs,
        },
        "sales": {
            "leads_this_month": monthly_leads,
            "leads_this_week": weekly_leads,
            "pipeline": {
                "new": leads_new,
                "contacted": leads_contacted,
                "qualified": leads_qualified,
                "closed_this_month": leads_closed,
            },
        },
        "operations": {
            "pending_installations": pending_installs,
        },
        "generated_at": now.isoformat(),
    }


# ============================================
# SALES CRM
# ============================================

@router.post("/leads")
async def create_lead(data: SalesLead):
    """Create a new sales lead"""
    lead_id = f"lead_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    lead = {
        "lead_id": lead_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "source": data.source,
        "interest": data.interest,
        "notes": data.notes,
        "neighborhood": data.neighborhood,
        "status": "new",
        "assigned_to": "",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "history": [{"action": "created", "at": now.isoformat()}],
    }

    await _db.sales_leads.insert_one(lead)
    return {"lead_id": lead_id, "status": "new", "message": "Lead creado correctamente"}


@router.get("/leads")
async def get_leads(status: str = "", limit: int = 50):
    """Get sales leads with optional status filter"""
    query = {}
    if status:
        query["status"] = status

    leads = await _db.sales_leads.find(
        query, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)

    total = await _db.sales_leads.count_documents(query)
    return {"leads": leads, "total": total}


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, data: SalesUpdate):
    """Update a sales lead status/notes"""
    update = {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}

    if data.status:
        update["$set"]["status"] = data.status
        update["$push"] = {"history": {"action": f"status_changed_to_{data.status}", "at": datetime.now(timezone.utc).isoformat()}}
    if data.notes:
        update["$set"]["notes"] = data.notes
    if data.assigned_to:
        update["$set"]["assigned_to"] = data.assigned_to

    result = await _db.sales_leads.update_one({"lead_id": lead_id}, update)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    return {"message": "Lead actualizado", "lead_id": lead_id}


@router.get("/leads/pipeline")
async def get_sales_pipeline():
    """Get sales pipeline overview"""
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    stats = await _db.sales_leads.aggregate(pipeline).to_list(20)

    return {
        "pipeline": {s["_id"]: s["count"] for s in stats if s["_id"]},
        "stages": ["new", "contacted", "qualified", "proposal", "negotiation", "closed", "lost"],
    }


# ============================================
# INSTALLATIONS MANAGEMENT
# ============================================

@router.post("/installations")
async def schedule_installation(data: InstallationSchedule):
    """Schedule a new installation"""
    install_id = f"inst_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    installation = {
        "install_id": install_id,
        "client_name": data.client_name,
        "address": data.address,
        "phone": data.phone,
        "plan_type": data.plan_type,
        "scheduled_date": data.scheduled_date,
        "technician_id": data.technician_id,
        "notes": data.notes,
        "status": "pending",
        "created_at": now.isoformat(),
    }

    await _db.installations.insert_one(installation)
    return {"install_id": install_id, "status": "pending", "message": "Instalacion programada"}


@router.get("/installations")
async def get_installations(status: str = "", limit: int = 50):
    """Get installations list"""
    query = {}
    if status:
        query["status"] = status

    installs = await _db.installations.find(
        query, {"_id": 0}
    ).sort("scheduled_date", -1).limit(limit).to_list(limit)

    return {"installations": installs, "total": len(installs)}


@router.patch("/installations/{install_id}")
async def update_installation(install_id: str, status: str = ""):
    """Update installation status"""
    if not status:
        raise HTTPException(status_code=400, detail="Status requerido")

    result = await _db.installations.update_one(
        {"install_id": install_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Instalacion no encontrada")

    return {"message": f"Instalacion actualizada a {status}"}
