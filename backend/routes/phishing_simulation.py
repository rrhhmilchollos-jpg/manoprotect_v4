"""
Phishing Simulation API - B2B Enterprise Feature
Simulates phishing attacks for employee training
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime
import random
import string

router = APIRouter(prefix="/phishing", tags=["Phishing Simulation"])

# In-memory storage (in production, use database)
phishing_storage = {
    "campaigns": [],
    "employees": [],
    "results": []
}

class CampaignCreate(BaseModel):
    name: str
    template_id: str
    target_department: str = "all"
    scheduled_date: Optional[str] = None

class EmployeeBulkAdd(BaseModel):
    emails: List[str]

class ClickEvent(BaseModel):
    campaign_id: str
    employee_id: str
    action: str  # "opened", "clicked", "submitted", "reported"

def generate_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))

@router.get("/campaigns")
async def list_campaigns():
    """List all phishing campaigns"""
    return {"campaigns": phishing_storage["campaigns"]}

@router.post("/campaigns")
async def create_campaign(campaign: CampaignCreate):
    """Create a new phishing campaign"""
    new_campaign = {
        "id": f"camp_{generate_id()}",
        "name": campaign.name,
        "template_id": campaign.template_id,
        "target_department": campaign.target_department,
        "scheduled_date": campaign.scheduled_date,
        "status": "draft",
        "progress": 0,
        "created_at": datetime.now().isoformat(),
        "stats": {
            "sent": 0,
            "opened": 0,
            "clicked": 0,
            "submitted": 0,
            "reported": 0
        }
    }
    
    phishing_storage["campaigns"].append(new_campaign)
    return {"success": True, "id": new_campaign["id"], "campaign": new_campaign}

@router.post("/campaigns/{campaign_id}/launch")
async def launch_campaign(campaign_id: str):
    """Launch a phishing campaign"""
    for campaign in phishing_storage["campaigns"]:
        if campaign["id"] == campaign_id:
            if campaign["status"] != "draft":
                raise HTTPException(status_code=400, detail="La campaña ya fue lanzada")
            
            campaign["status"] = "running"
            campaign["launched_at"] = datetime.now().isoformat()
            
            # Simulate sending to employees
            target_employees = phishing_storage["employees"]
            if campaign["target_department"] != "all":
                target_employees = [e for e in target_employees if e.get("department") == campaign["target_department"]]
            
            campaign["stats"]["sent"] = len(target_employees)
            campaign["progress"] = 10  # Initial progress
            
            return {"success": True, "message": f"Campaña lanzada a {len(target_employees)} empleados"}
    
    raise HTTPException(status_code=404, detail="Campaña no encontrada")

@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    """Get campaign details"""
    for campaign in phishing_storage["campaigns"]:
        if campaign["id"] == campaign_id:
            return campaign
    raise HTTPException(status_code=404, detail="Campaña no encontrada")

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str):
    """Delete a campaign"""
    phishing_storage["campaigns"] = [c for c in phishing_storage["campaigns"] if c["id"] != campaign_id]
    return {"success": True}

@router.get("/employees")
async def list_employees():
    """List all employees"""
    return {"employees": phishing_storage["employees"]}

@router.post("/employees/bulk")
async def add_employees_bulk(data: EmployeeBulkAdd):
    """Add multiple employees at once"""
    added = 0
    existing_emails = {e["email"] for e in phishing_storage["employees"]}
    
    for email in data.emails:
        email = email.strip().lower()
        if email and "@" in email and email not in existing_emails:
            phishing_storage["employees"].append({
                "id": f"emp_{generate_id()}",
                "email": email,
                "department": None,
                "clicked_count": 0,
                "reported_count": 0,
                "added_at": datetime.now().isoformat()
            })
            existing_emails.add(email)
            added += 1
    
    return {"success": True, "added": added, "total": len(phishing_storage["employees"])}

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Remove an employee"""
    phishing_storage["employees"] = [e for e in phishing_storage["employees"] if e["id"] != employee_id]
    return {"success": True}

@router.post("/track")
async def track_click(event: ClickEvent):
    """Track employee interaction with phishing email"""
    # Find campaign
    campaign = None
    for c in phishing_storage["campaigns"]:
        if c["id"] == event.campaign_id:
            campaign = c
            break
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    # Find employee
    employee = None
    for e in phishing_storage["employees"]:
        if e["id"] == event.employee_id:
            employee = e
            break
    
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Update stats
    if event.action in campaign["stats"]:
        campaign["stats"][event.action] += 1
    
    # Update employee record
    if event.action == "clicked":
        employee["clicked_count"] += 1
    elif event.action == "reported":
        employee["reported_count"] += 1
    
    # Record event
    phishing_storage["results"].append({
        "campaign_id": event.campaign_id,
        "employee_id": event.employee_id,
        "action": event.action,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"success": True}

@router.get("/stats")
async def get_overall_stats():
    """Get overall phishing simulation statistics"""
    total_sent = sum(c["stats"]["sent"] for c in phishing_storage["campaigns"])
    total_clicked = sum(c["stats"]["clicked"] for c in phishing_storage["campaigns"])
    total_reported = sum(c["stats"]["reported"] for c in phishing_storage["campaigns"])
    
    click_rate = round((total_clicked / total_sent * 100), 1) if total_sent > 0 else 0
    report_rate = round((total_reported / total_sent * 100), 1) if total_sent > 0 else 0
    
    return {
        "total_campaigns": len(phishing_storage["campaigns"]),
        "total_employees": len(phishing_storage["employees"]),
        "total_sent": total_sent,
        "total_clicked": total_clicked,
        "total_reported": total_reported,
        "click_rate": click_rate,
        "report_rate": report_rate
    }

@router.get("/templates")
async def list_templates():
    """List available phishing templates"""
    templates = [
        {
            "id": "bank_alert",
            "name": "Alerta Bancaria",
            "subject": "Actividad sospechosa en su cuenta",
            "category": "financial",
            "difficulty": "medium"
        },
        {
            "id": "it_password",
            "name": "Cambio de Contraseña IT",
            "subject": "Su contraseña expira en 24 horas",
            "category": "corporate",
            "difficulty": "easy"
        },
        {
            "id": "ceo_urgent",
            "name": "CEO Urgente",
            "subject": "Necesito tu ayuda urgente",
            "category": "social",
            "difficulty": "hard"
        },
        {
            "id": "invoice_attached",
            "name": "Factura Adjunta",
            "subject": "Factura pendiente de pago",
            "category": "financial",
            "difficulty": "medium"
        },
        {
            "id": "microsoft_365",
            "name": "Microsoft 365 Login",
            "subject": "Su sesión ha expirado",
            "category": "tech",
            "difficulty": "hard"
        }
    ]
    return {"templates": templates}
