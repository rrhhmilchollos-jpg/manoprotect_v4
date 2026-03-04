"""
ManoProtect - Enterprise Central System
Company management + Sales commercial tools + Professional CRM
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
    assigned_to: str = ""

class SalesUpdate(BaseModel):
    status: str = ""
    notes: str = ""
    assigned_to: str = ""
    pipeline_stage: str = ""
    next_action: str = ""
    next_action_date: str = ""

class InstallationSchedule(BaseModel):
    client_name: str
    address: str
    phone: str
    plan_type: str
    scheduled_date: str
    technician_id: str = ""
    notes: str = ""

class CalendarEvent(BaseModel):
    title: str
    event_type: str = "visit"  # visit, security_study, proposal, installation, follow_up
    lead_id: str = ""
    date: str
    time: str = ""
    duration_min: int = 60
    assigned_to: str = ""
    address: str = ""
    notes: str = ""

class StockItem(BaseModel):
    product_type: str  # sentinel_lock, panel, sensor_pir, camera, siren, keypad
    model: str = ""
    serial_number: str = ""
    status: str = "available"  # available, reserved, sold, installed, defective
    reserved_for: str = ""
    notes: str = ""

class CommercialTarget(BaseModel):
    commercial_id: str
    commercial_name: str
    month: str  # YYYY-MM
    target_leads: int = 20
    target_closed: int = 5
    commission_rate: float = 0.1  # 10%


# ============================================
# COMPANY DASHBOARD (CEO)
# ============================================

@router.get("/dashboard")
async def enterprise_dashboard():
    """Central company dashboard - all key metrics"""
    now = datetime.now(timezone.utc)
    month = (now - timedelta(days=30)).isoformat()
    week = (now - timedelta(days=7)).isoformat()
    current_month = now.strftime("%Y-%m")

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
    leads_proposal = await _db.sales_leads.count_documents({"status": "proposal"})
    leads_negotiation = await _db.sales_leads.count_documents({"status": "negotiation"})
    leads_closed = await _db.sales_leads.count_documents({"status": "closed", "created_at": {"$gte": month}})
    leads_lost = await _db.sales_leads.count_documents({"status": "lost", "created_at": {"$gte": month}})
    total_month_leads = monthly_leads or 1
    conversion_rate = round((leads_closed / total_month_leads) * 100, 1)

    # Stock summary
    stock_available = await _db.crm_stock.count_documents({"status": "available"})
    stock_reserved = await _db.crm_stock.count_documents({"status": "reserved"})
    stock_sold = await _db.crm_stock.count_documents({"status": "sold"})

    # Commercial performance
    commercials = await _db.crm_targets.find({"month": current_month}, {"_id": 0}).to_list(20)

    # Upcoming calendar events
    today = now.replace(hour=0, minute=0, second=0).isoformat()
    upcoming_events = await _db.crm_calendar.find(
        {"date": {"$gte": today[:10]}}, {"_id": 0}
    ).sort("date", 1).to_list(10)

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
            "conversion_rate": conversion_rate,
            "pipeline": {
                "new": leads_new,
                "contacted": leads_contacted,
                "qualified": leads_qualified,
                "proposal": leads_proposal,
                "negotiation": leads_negotiation,
                "closed_this_month": leads_closed,
                "lost_this_month": leads_lost,
            },
        },
        "operations": {
            "pending_installations": pending_installs,
        },
        "stock": {
            "available": stock_available,
            "reserved": stock_reserved,
            "sold": stock_sold,
        },
        "commercials": commercials,
        "upcoming_events": upcoming_events,
        "generated_at": now.isoformat(),
    }


# ============================================
# SALES CRM — Enhanced Pipeline
# ============================================

PIPELINE_STAGES = [
    "primer_contacto", "visita_realizada", "estudio_seguridad",
    "propuesta_enviada", "negociacion", "cierre_contrato", "perdido"
]
STAGE_LABELS_MAP = {
    "new": "primer_contacto", "contacted": "visita_realizada",
    "qualified": "estudio_seguridad", "proposal": "propuesta_enviada",
    "negotiation": "negociacion", "closed": "cierre_contrato", "lost": "perdido"
}

@router.post("/leads")
async def create_lead(data: SalesLead):
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
        "pipeline_stage": "primer_contacto",
        "assigned_to": data.assigned_to,
        "next_action": "",
        "next_action_date": "",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "history": [{"action": "created", "at": now.isoformat()}],
    }
    await _db.sales_leads.insert_one(lead)
    return {"lead_id": lead_id, "status": "new", "message": "Lead creado correctamente"}


@router.get("/leads")
async def get_leads(status: str = "", assigned_to: str = "", limit: int = 100):
    query = {}
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    leads = await _db.sales_leads.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    total = await _db.sales_leads.count_documents(query)
    return {"leads": leads, "total": total}


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, data: SalesUpdate):
    update = {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}

    if data.status:
        update["$set"]["status"] = data.status
        update["$set"]["pipeline_stage"] = STAGE_LABELS_MAP.get(data.status, data.status)
        if "$push" not in update:
            update["$push"] = {}
        update["$push"]["history"] = {"action": f"status_changed_to_{data.status}", "at": datetime.now(timezone.utc).isoformat()}
    if data.notes:
        update["$set"]["notes"] = data.notes
    if data.assigned_to:
        update["$set"]["assigned_to"] = data.assigned_to
    if data.next_action:
        update["$set"]["next_action"] = data.next_action
    if data.next_action_date:
        update["$set"]["next_action_date"] = data.next_action_date

    result = await _db.sales_leads.update_one({"lead_id": lead_id}, update)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    # AUTO-PROVISION to CRA when closed
    if data.status == "closed":
        lead = await _db.sales_leads.find_one({"lead_id": lead_id}, {"_id": 0})
        if lead:
            try:
                from routes.cra_operations_routes import _db as cra_db
                install_id = str(uuid.uuid4())
                access_code = str(uuid.uuid4())[:6].upper()
                inst = {
                    "id": install_id,
                    "client_name": lead.get("name", ""),
                    "client_email": lead.get("email", ""),
                    "client_phone": lead.get("phone", ""),
                    "address": lead.get("neighborhood", ""),
                    "city": "", "postal_code": "",
                    "plan_type": lead.get("interest", ""),
                    "access_code": access_code, "duress_code": "",
                    "emergency_contacts": [],
                    "notes": f"Auto-provisionado desde CRM — Lead {lead_id}",
                    "status": "active", "armed_status": "disarmed",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "last_event_at": None,
                }
                await _db.cra_installations.insert_one(inst)
                await _db.client_app_access.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_email": lead.get("email", ""),
                    "installation_id": install_id,
                    "access_code": access_code,
                    "role": "owner",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            except Exception as e:
                print(f"CRA auto-provision failed: {e}")

    return {"message": "Lead actualizado", "lead_id": lead_id}


@router.get("/leads/pipeline")
async def get_sales_pipeline():
    pipeline_agg = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    stats = await _db.sales_leads.aggregate(pipeline_agg).to_list(20)
    return {
        "pipeline": {s["_id"]: s["count"] for s in stats if s["_id"]},
        "stages": ["new", "contacted", "qualified", "proposal", "negotiation", "closed", "lost"],
    }


# ============================================
# CALENDAR — Visit scheduling
# ============================================

@router.get("/calendar")
async def get_calendar_events(month: str = "", assigned_to: str = ""):
    query = {}
    if month:
        query["date"] = {"$regex": f"^{month}"}
    if assigned_to:
        query["assigned_to"] = assigned_to
    events = await _db.crm_calendar.find(query, {"_id": 0}).sort("date", 1).to_list(200)
    return {"events": events, "total": len(events)}

@router.post("/calendar")
async def create_calendar_event(data: CalendarEvent):
    event = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "event_type": data.event_type,
        "lead_id": data.lead_id,
        "date": data.date,
        "time": data.time,
        "duration_min": data.duration_min,
        "assigned_to": data.assigned_to,
        "address": data.address,
        "notes": data.notes,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.crm_calendar.insert_one(event)
    event.pop("_id", None)
    return event

@router.patch("/calendar/{event_id}")
async def update_calendar_event(event_id: str, request: Request):
    body = await request.json()
    result = await _db.crm_calendar.update_one(
        {"id": event_id},
        {"$set": {**body, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Evento no encontrado")
    return {"status": "updated"}

@router.delete("/calendar/{event_id}")
async def delete_calendar_event(event_id: str):
    result = await _db.crm_calendar.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Evento no encontrado")
    return {"status": "deleted"}


# ============================================
# COMMISSIONS & TARGETS
# ============================================

@router.get("/commercials")
async def get_commercials():
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    targets = await _db.crm_targets.find({"month": current_month}, {"_id": 0}).to_list(20)

    # Enrich with actual performance
    for t in targets:
        cid = t.get("commercial_id", "")
        t["actual_leads"] = await _db.sales_leads.count_documents({"assigned_to": cid, "created_at": {"$regex": f"^{current_month}"}})
        t["actual_closed"] = await _db.sales_leads.count_documents({"assigned_to": cid, "status": "closed", "created_at": {"$regex": f"^{current_month}"}})
        t["commission_earned"] = round(t["actual_closed"] * 249 * t.get("commission_rate", 0.1), 2)
        t["target_progress"] = round((t["actual_closed"] / max(t.get("target_closed", 1), 1)) * 100, 1)

    return {"commercials": targets}

@router.post("/commercials/targets")
async def set_commercial_target(data: CommercialTarget):
    target = {
        "id": str(uuid.uuid4()),
        "commercial_id": data.commercial_id,
        "commercial_name": data.commercial_name,
        "month": data.month,
        "target_leads": data.target_leads,
        "target_closed": data.target_closed,
        "commission_rate": data.commission_rate,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.crm_targets.update_one(
        {"commercial_id": data.commercial_id, "month": data.month},
        {"$set": target},
        upsert=True
    )
    return {"status": "target_set"}


# ============================================
# STOCK / INVENTORY — Sentinel Lock + Devices
# ============================================

@router.get("/stock")
async def get_stock(product_type: str = "", status: str = ""):
    query = {}
    if product_type:
        query["product_type"] = product_type
    if status:
        query["status"] = status
    items = await _db.crm_stock.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)

    # Summary by type
    summary_agg = [
        {"$group": {"_id": {"type": "$product_type", "status": "$status"}, "count": {"$sum": 1}}},
    ]
    summary_raw = await _db.crm_stock.aggregate(summary_agg).to_list(100)
    summary = {}
    for s in summary_raw:
        ptype = s["_id"]["type"]
        pstatus = s["_id"]["status"]
        if ptype not in summary:
            summary[ptype] = {}
        summary[ptype][pstatus] = s["count"]

    return {"items": items, "total": len(items), "summary": summary}

@router.post("/stock")
async def add_stock_item(data: StockItem):
    item = {
        "id": str(uuid.uuid4()),
        "product_type": data.product_type,
        "model": data.model,
        "serial_number": data.serial_number,
        "status": data.status,
        "reserved_for": data.reserved_for,
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.crm_stock.insert_one(item)
    item.pop("_id", None)
    return item

@router.patch("/stock/{item_id}")
async def update_stock_item(item_id: str, request: Request):
    body = await request.json()
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await _db.crm_stock.update_one({"id": item_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(404, "Item no encontrado")
    return {"status": "updated"}


# ============================================
# INSTALLATIONS MANAGEMENT
# ============================================

@router.post("/installations")
async def schedule_installation(data: InstallationSchedule):
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
    query = {}
    if status:
        query["status"] = status
    installs = await _db.installations.find(query, {"_id": 0}).sort("scheduled_date", -1).limit(limit).to_list(limit)
    return {"installations": installs, "total": len(installs)}


@router.patch("/installations/{install_id}")
async def update_installation(install_id: str, status: str = ""):
    if not status:
        raise HTTPException(status_code=400, detail="Status requerido")
    result = await _db.installations.update_one(
        {"install_id": install_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Instalacion no encontrada")
    return {"message": f"Instalacion actualizada a {status}"}
