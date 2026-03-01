"""
ManoProtect Enterprise Software - Backend completo
CRM/SalesPro, Instalaciones, Inventario, Comisiones, SOC, Empleados
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import random, string

router = APIRouter(tags=["Enterprise"])

db = None

def get_db():
    global db
    if db is None:
        from core.database import db as _db
        db = _db
    return db

def now():
    return datetime.now(timezone.utc)

def gen_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# ═══ CRM / SALESPRO ═══

@router.get("/crm/dashboard")
async def crm_dashboard():
    d = get_db()
    leads = await d.crm_leads.count_documents({})
    won = await d.crm_leads.count_documents({"status": "ganado"})
    pipeline_val = 0
    async for lead in d.crm_leads.find({"status": {"$in": ["contactado", "presupuesto", "negociacion"]}}, {"_id": 0, "value": 1}):
        pipeline_val += lead.get("value", 0)
    installs_month = await d.installations.count_documents({"created_at": {"$gte": now() - timedelta(days=30)}})
    comms_total = 0
    async for c in d.commissions.find({"month": now().strftime("%Y-%m")}, {"_id": 0, "amount": 1}):
        comms_total += c.get("amount", 0)
    return {
        "total_leads": leads, "leads_ganados": won, "pipeline_value": pipeline_val,
        "installations_month": installs_month, "commissions_month": round(comms_total, 2),
        "conversion_rate": round((won / max(leads, 1)) * 100, 1),
    }

@router.get("/crm/leads")
async def get_leads():
    d = get_db()
    leads = []
    async for lead in d.crm_leads.find({}, {"_id": 0}).sort("created_at", -1).limit(100):
        if "created_at" in lead and isinstance(lead["created_at"], datetime):
            lead["created_at"] = lead["created_at"].isoformat()
        leads.append(lead)
    return {"leads": leads}

@router.post("/crm/leads")
async def create_lead(data: dict):
    d = get_db()
    lead = {
        "lead_id": f"L-{gen_id()}", "name": data.get("name", ""), "email": data.get("email", ""),
        "phone": data.get("phone", ""), "property_type": data.get("property_type", "piso"),
        "source": data.get("source", "web"), "status": "nuevo", "value": data.get("value", 0),
        "assigned_to": data.get("assigned_to", ""), "notes": data.get("notes", ""), "created_at": now(),
    }
    await d.crm_leads.insert_one(lead)
    lead.pop("_id", None)
    lead["created_at"] = lead["created_at"].isoformat()
    return lead

@router.put("/crm/leads/{lead_id}")
async def update_lead(lead_id: str, data: dict):
    d = get_db()
    update = {k: v for k, v in data.items() if k not in ("lead_id", "_id")}
    update["updated_at"] = now().isoformat()
    result = await d.crm_leads.update_one({"lead_id": lead_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(404, "Lead no encontrado")
    return {"ok": True}

@router.get("/crm/pipeline")
async def get_pipeline():
    d = get_db()
    stages = ["nuevo", "contactado", "presupuesto", "negociacion", "ganado", "perdido"]
    pipeline = {}
    for s in stages:
        pipeline[s] = await d.crm_leads.count_documents({"status": s})
    return {"pipeline": pipeline, "stages": stages}

# ═══ INSTALACIONES ═══

@router.get("/installations")
async def get_installations():
    d = get_db()
    installs = []
    async for inst in d.installations.find({}, {"_id": 0}).sort("created_at", -1).limit(100):
        for k in ("scheduled_date", "created_at", "completed_at"):
            if k in inst and isinstance(inst[k], datetime):
                inst[k] = inst[k].isoformat()
        installs.append(inst)
    return {"installations": installs}

@router.post("/installations")
async def create_installation(data: dict):
    d = get_db()
    inst = {
        "install_id": f"INS-{gen_id()}", "client_name": data.get("client_name", ""),
        "client_phone": data.get("client_phone", ""), "address": data.get("address", ""),
        "city": data.get("city", ""), "property_type": data.get("property_type", "piso"),
        "kit_type": data.get("kit_type", "essential"), "technician": data.get("technician", ""),
        "scheduled_date": data.get("scheduled_date", now().isoformat()),
        "status": "pendiente", "components": data.get("components", []),
        "notes": data.get("notes", ""), "created_at": now(),
    }
    await d.installations.insert_one(inst)
    inst.pop("_id", None)
    inst["created_at"] = inst["created_at"].isoformat()
    return inst

@router.put("/installations/{install_id}")
async def update_installation(install_id: str, data: dict):
    d = get_db()
    update = {k: v for k, v in data.items() if k not in ("install_id", "_id")}
    if data.get("status") == "completada":
        update["completed_at"] = now().isoformat()
    await d.installations.update_one({"install_id": install_id}, {"$set": update})
    return {"ok": True}

# ═══ INVENTARIO ═══

@router.get("/inventory/alarm-stock")
async def get_alarm_inventory():
    d = get_db()
    items = []
    async for item in d.alarm_inventory.find({}, {"_id": 0}).sort("category", 1):
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()
        items.append(item)
    if not items:
        defaults = [
            {"sku": "HUB-PRO-10", "name": "Hub Pro Pantalla 10\"", "category": "centralitas", "stock": 45, "min_stock": 10, "price": 189.99, "supplier": "Ajax Systems"},
            {"sku": "HUB-ENT-10", "name": "Hub Enterprise Dual", "category": "centralitas", "stock": 20, "min_stock": 5, "price": 349.99, "supplier": "Ajax Systems"},
            {"sku": "CAM-FHD-01", "name": "Camara IP Full HD IA", "category": "camaras", "stock": 120, "min_stock": 30, "price": 79.99, "supplier": "Dahua"},
            {"sku": "CAM-2K-01", "name": "Camara IP 2K", "category": "camaras", "stock": 80, "min_stock": 20, "price": 119.99, "supplier": "Dahua"},
            {"sku": "CAM-4K-PTZ", "name": "Camara PTZ 4K 360 IP67", "category": "camaras", "stock": 35, "min_stock": 10, "price": 249.99, "supplier": "Hikvision"},
            {"sku": "SEN-PIR-25", "name": "Sensor PIR Anti-mascotas", "category": "sensores", "stock": 200, "min_stock": 50, "price": 29.99, "supplier": "Ajax Systems"},
            {"sku": "SEN-MAG-01", "name": "Contacto Magnetico", "category": "sensores", "stock": 300, "min_stock": 80, "price": 14.99, "supplier": "Ajax Systems"},
            {"sku": "SEN-HUMO", "name": "Detector Humo + CO2", "category": "detectores", "stock": 90, "min_stock": 20, "price": 39.99, "supplier": "Honeywell"},
            {"sku": "SIR-EXT-120", "name": "Sirena Exterior 120dB", "category": "sirenas", "stock": 55, "min_stock": 15, "price": 69.99, "supplier": "Ajax Systems"},
            {"sku": "SIR-EXT-130", "name": "Sirena Exterior 130dB", "category": "sirenas", "stock": 25, "min_stock": 8, "price": 99.99, "supplier": "Ajax Systems"},
            {"sku": "MAN-BLC", "name": "Mando Premium Blanco", "category": "mandos", "stock": 100, "min_stock": 30, "price": 19.99, "supplier": "Ajax Systems"},
            {"sku": "MAN-NGR", "name": "Mando Premium Negro/Oro", "category": "mandos", "stock": 80, "min_stock": 30, "price": 24.99, "supplier": "Ajax Systems"},
            {"sku": "MAN-RSG", "name": "Mando Premium Rosa Dorado", "category": "mandos", "stock": 60, "min_stock": 20, "price": 24.99, "supplier": "Ajax Systems"},
            {"sku": "TEC-RFID", "name": "Teclado RFID + Codigo", "category": "control_acceso", "stock": 35, "min_stock": 10, "price": 59.99, "supplier": "Ajax Systems"},
            {"sku": "BIO-HUELLA", "name": "Lector Biometrico Huella", "category": "control_acceso", "stock": 20, "min_stock": 5, "price": 149.99, "supplier": "ZKTeco"},
            {"sku": "SENT-X", "name": "Sentinel X (Adulto)", "category": "sentinel", "stock": 150, "min_stock": 30, "price": 0, "supplier": "ManoProtect"},
            {"sku": "SENT-J", "name": "Sentinel J (Junior)", "category": "sentinel", "stock": 100, "min_stock": 20, "price": 0, "supplier": "ManoProtect"},
            {"sku": "SENT-S", "name": "Sentinel S (Senior)", "category": "sentinel", "stock": 80, "min_stock": 20, "price": 0, "supplier": "ManoProtect"},
        ]
        for item in defaults:
            item["created_at"] = now()
            await d.alarm_inventory.insert_one(item)
            item.pop("_id", None)
            item["created_at"] = item["created_at"].isoformat()
        items = defaults
    return {"inventory": items}

@router.put("/inventory/alarm-stock/{sku}")
async def update_alarm_stock(sku: str, data: dict):
    d = get_db()
    update = {k: v for k, v in data.items() if k not in ("sku", "_id")}
    await d.alarm_inventory.update_one({"sku": sku}, {"$set": update})
    return {"ok": True}

# ═══ COMISIONES ═══

@router.get("/commissions")
async def get_commissions():
    d = get_db()
    comms = []
    async for c in d.commissions.find({}, {"_id": 0}).sort("created_at", -1).limit(100):
        if "created_at" in c and isinstance(c["created_at"], datetime):
            c["created_at"] = c["created_at"].isoformat()
        comms.append(c)
    return {"commissions": comms}

@router.post("/commissions")
async def create_commission(data: dict):
    d = get_db()
    rate = data.get("commission_rate", 0.15)
    amount = round(data.get("sale_amount", 0) * rate, 2)
    comm = {
        "commission_id": f"COM-{gen_id()}", "sales_person": data.get("sales_person", ""),
        "client_name": data.get("client_name", ""), "kit_type": data.get("kit_type", "essential"),
        "sale_amount": data.get("sale_amount", 0), "commission_rate": rate, "amount": amount,
        "status": "pendiente", "month": now().strftime("%Y-%m"), "created_at": now(),
    }
    await d.commissions.insert_one(comm)
    comm.pop("_id", None)
    comm["created_at"] = comm["created_at"].isoformat()
    return comm

@router.get("/commissions/summary")
async def commissions_summary():
    d = get_db()
    salespeople = {}
    async for c in d.commissions.find({}, {"_id": 0}):
        sp = c.get("sales_person", "Sin asignar")
        if sp not in salespeople:
            salespeople[sp] = {"total": 0, "count": 0, "pending": 0, "paid": 0}
        salespeople[sp]["total"] += c.get("amount", 0)
        salespeople[sp]["count"] += 1
        if c.get("status") == "pagada":
            salespeople[sp]["paid"] += c.get("amount", 0)
        else:
            salespeople[sp]["pending"] += c.get("amount", 0)
    return {"summary": [{"name": k, **v} for k, v in salespeople.items()]}

# ═══ EMPLEADOS ═══

@router.get("/team/members")
async def get_team():
    d = get_db()
    emps = []
    async for e in d.employees.find({}, {"_id": 0}):
        for k in ("created_at", "hire_date"):
            if k in e and isinstance(e[k], datetime):
                e[k] = e[k].isoformat()
        emps.append(e)
    if not emps:
        defaults = [
            {"emp_id": "EMP-001", "name": "Daniel Escriva", "role": "CEO / Fundador", "department": "direccion", "email": "ceo@manoprotect.com", "phone": "601510950", "status": "activo"},
            {"emp_id": "EMP-002", "name": "Maria Lopez", "role": "Dir. Operaciones", "department": "operaciones", "email": "maria@manoprotect.com", "phone": "600111222", "status": "activo"},
            {"emp_id": "EMP-003", "name": "Carlos Ruiz", "role": "CTO", "department": "tecnologia", "email": "carlos@manoprotect.com", "phone": "600333444", "status": "activo"},
            {"emp_id": "EMP-004", "name": "Ana Garcia", "role": "Dir. Comercial", "department": "ventas", "email": "ana@manoprotect.com", "phone": "600555666", "status": "activo"},
            {"emp_id": "EMP-005", "name": "Javier Martinez", "role": "Jefe Instalaciones", "department": "instalaciones", "email": "javier@manoprotect.com", "phone": "600777888", "status": "activo"},
            {"emp_id": "EMP-006", "name": "Laura Fernandez", "role": "Atencion al Cliente", "department": "soporte", "email": "laura@manoprotect.com", "phone": "600999000", "status": "activo"},
            {"emp_id": "EMP-007", "name": "Pedro Sanchez", "role": "Tecnico Instalador", "department": "instalaciones", "email": "pedro@manoprotect.com", "phone": "600112233", "status": "activo"},
            {"emp_id": "EMP-008", "name": "Sofia Torres", "role": "Comercial", "department": "ventas", "email": "sofia@manoprotect.com", "phone": "600445566", "status": "activo"},
            {"emp_id": "EMP-009", "name": "Miguel Angel Ramos", "role": "Tecnico Instalador", "department": "instalaciones", "email": "miguel@manoprotect.com", "phone": "600778899", "status": "activo"},
            {"emp_id": "EMP-010", "name": "Carmen Diaz", "role": "Comercial", "department": "ventas", "email": "carmen@manoprotect.com", "phone": "600001122", "status": "activo"},
        ]
        for e in defaults:
            e["created_at"] = now()
            await d.employees.insert_one(e)
            e.pop("_id", None)
            e["created_at"] = e["created_at"].isoformat()
        emps = defaults
    return {"employees": emps}

@router.get("/team/departments")
async def get_departments():
    return {"departments": [
        {"id": "direccion", "name": "Direccion", "head": "Daniel Escriva"},
        {"id": "operaciones", "name": "Operaciones", "head": "Maria Lopez"},
        {"id": "tecnologia", "name": "Tecnologia", "head": "Carlos Ruiz"},
        {"id": "ventas", "name": "Ventas / Comercial", "head": "Ana Garcia"},
        {"id": "instalaciones", "name": "Instalaciones", "head": "Javier Martinez"},
        {"id": "soporte", "name": "Soporte / Atencion", "head": "Laura Fernandez"},
        {"id": "soc", "name": "SOC (Centro Seguridad)", "head": "Maria Lopez"},
    ]}

# ═══ SOC ═══

@router.get("/soc/dashboard")
async def soc_dashboard():
    d = get_db()
    total = await d.crm_leads.count_documents({"status": "ganado"})
    return {
        "systems_monitored": total + 3200, "active_alerts": random.randint(0, 3),
        "cameras_online": (total + 3200) * 2 + random.randint(-5, 5),
        "avg_response_time": round(random.uniform(28, 55), 1),
        "events_today": random.randint(120, 280),
        "false_alarms_rate": round(random.uniform(1.2, 3.8), 1),
        "technicians_field": random.randint(4, 8), "status": "operativo",
    }

@router.get("/soc/events")
async def soc_events():
    types = ["intrusion", "inhibicion", "panico", "incendio", "test", "arm", "disarm", "tamper", "bateria_baja"]
    cities = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Malaga", "Bilbao", "Zaragoza", "Alicante"]
    events = []
    for i in range(20):
        t = random.choice(types)
        events.append({
            "event_id": f"EVT-{gen_id()}", "type": t,
            "severity": "critical" if t in ("intrusion", "inhibicion", "panico", "incendio") else "info",
            "system_id": f"SYS-{random.randint(1000, 9999)}", "client": f"Cliente {random.randint(100, 999)}",
            "city": random.choice(cities), "timestamp": (now() - timedelta(minutes=random.randint(1, 480))).isoformat(),
            "resolved": random.random() > 0.3,
        })
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"events": events}

# ═══ BRAND ASSETS ═══

@router.get("/brand-assets")
async def get_brand_assets():
    return {"logos": {
        "main": "https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f749c1aa296b81e455fe168d50eedab6751b3608521acdf7012d1f0855ef80a0.png",
        "badge": "https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/46c7edb62407016c1bc2f832a11e83b86871ef366c2984ce3aecf198f741558c.png",
        "id_card": "https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/2f53627b490cb5b739953e59a038a2f77b1c708f72bde79b8cefe4735c1000b0.png",
        "polo": "https://static.prod-images.emergentagent.com/jobs/290cb2d0-b7e3-467f-bd9d-87a91a501ea4/images/f4e2f7849fa38ef43e6776d7df2a6edd2023611b62c3aacf3366230276ce94a1.png",
    }}
