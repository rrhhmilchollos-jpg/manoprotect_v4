"""
ManoProtect - Export Reports System
Generates CSV and PDF reports for Enterprise Portal
"""
from fastapi import APIRouter, HTTPException, Query, Cookie, Response
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime, timezone, timedelta
import io
import csv

router = APIRouter(prefix="/export", tags=["Export Reports"])

db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Export routes initialized: {db is not None}")


async def get_enterprise_employee(enterprise_session: Optional[str] = Cookie(None)):
    """Verify enterprise employee authentication"""
    if not enterprise_session:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": enterprise_session},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee


@router.get("/users/csv")
async def export_users_csv(
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    days: int = Query(365, description="Export users from last N days")
):
    """Export users list as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    if plan:
        query["plan"] = plan
    
    # Date filter
    date_limit = datetime.now(timezone.utc) - timedelta(days=days)
    query["created_at"] = {"$gte": date_limit.isoformat()}
    
    # Get users
    users = await db.users.find(
        query,
        {"_id": 0, "password_hash": 0, "session_token": 0}
    ).sort("created_at", -1).to_list(10000)
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Nombre", "Email", "Plan", "Estado", 
        "Teléfono", "Ciudad", "Fecha Registro"
    ])
    
    # Data rows
    for user in users:
        writer.writerow([
            user.get("user_id", ""),
            user.get("name", ""),
            user.get("email", ""),
            user.get("plan", "free"),
            user.get("status", "active"),
            user.get("phone", ""),
            user.get("city", ""),
            user.get("created_at", "")[:10] if user.get("created_at") else ""
        ])
    
    # Return CSV response
    output.seek(0)
    filename = f"usuarios_manoprotect_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/alerts/csv")
async def export_alerts_csv(
    enterprise_session: Optional[str] = Cookie(None),
    severity: Optional[str] = Query(None),
    days: int = Query(30, description="Export alerts from last N days")
):
    """Export security alerts as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    # Build query
    query = {}
    if severity:
        query["severity"] = severity
    
    date_limit = datetime.now(timezone.utc) - timedelta(days=days)
    query["created_at"] = {"$gte": date_limit.isoformat()}
    
    # Get alerts
    alerts = await db.security_alerts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Tipo", "Severidad", "Usuario Email", 
        "Mensaje", "Estado", "Fecha"
    ])
    
    for alert in alerts:
        writer.writerow([
            alert.get("alert_id", ""),
            alert.get("type", ""),
            alert.get("severity", ""),
            alert.get("user_email", ""),
            alert.get("message", "")[:100],  # Truncate long messages
            alert.get("status", ""),
            alert.get("created_at", "")[:19] if alert.get("created_at") else ""
        ])
    
    output.seek(0)
    filename = f"alertas_seguridad_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/sos/csv")
async def export_sos_csv(
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = Query(None),
    days: int = Query(30, description="Export SOS events from last N days")
):
    """Export SOS events as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    query = {}
    if status:
        query["status"] = status
    
    date_limit = datetime.now(timezone.utc) - timedelta(days=days)
    query["created_at"] = {"$gte": date_limit.isoformat()}
    
    events = await db.sos_events.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Usuario", "Email", "Teléfono",
        "Ubicación", "Estado", "Prioridad", "Fecha"
    ])
    
    for event in events:
        location = event.get("location", {})
        loc_str = f"{location.get('lat', '')}, {location.get('lng', '')}" if location else ""
        
        writer.writerow([
            event.get("sos_id", ""),
            event.get("user_name", ""),
            event.get("user_email", ""),
            event.get("user_phone", ""),
            loc_str,
            event.get("status", ""),
            event.get("priority", ""),
            event.get("created_at", "")[:19] if event.get("created_at") else ""
        ])
    
    output.seek(0)
    filename = f"eventos_sos_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/payments/csv")
async def export_payments_csv(
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = Query(None),
    days: int = Query(90, description="Export payments from last N days")
):
    """Export payments/transactions as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    query = {}
    if status:
        query["status"] = status
    
    date_limit = datetime.now(timezone.utc) - timedelta(days=days)
    query["created_at"] = {"$gte": date_limit.isoformat()}
    
    payments = await db.payments.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Usuario Email", "Concepto", "Importe (EUR)",
        "Estado", "Método Pago", "Fecha"
    ])
    
    for payment in payments:
        amount = payment.get("amount", 0)
        if isinstance(amount, (int, float)):
            amount_str = f"{amount/100:.2f}" if amount > 100 else f"{amount:.2f}"
        else:
            amount_str = str(amount)
        
        writer.writerow([
            payment.get("payment_id", ""),
            payment.get("user_email", ""),
            payment.get("description", payment.get("plan", "")),
            amount_str,
            payment.get("status", ""),
            payment.get("payment_method", "stripe"),
            payment.get("created_at", "")[:19] if payment.get("created_at") else ""
        ])
    
    output.seek(0)
    filename = f"pagos_manoprotect_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/reviews/csv")
async def export_reviews_csv(
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = Query(None)
):
    """Export user reviews as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    query = {}
    if status:
        query["status"] = status
    
    reviews = await db.user_reviews.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Usuario", "Email", "Plan",
        "Estrellas", "Título", "Comentario", "Estado", "Fecha"
    ])
    
    for review in reviews:
        writer.writerow([
            review.get("review_id", ""),
            review.get("display_name", ""),
            review.get("user_email", ""),
            review.get("user_plan_display", ""),
            review.get("rating", ""),
            review.get("title", ""),
            review.get("comment", "")[:200],  # Truncate
            review.get("status", ""),
            review.get("created_at", "")[:19] if review.get("created_at") else ""
        ])
    
    output.seek(0)
    filename = f"valoraciones_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/dashboard-summary/csv")
async def export_dashboard_summary(
    enterprise_session: Optional[str] = Cookie(None),
    days: int = Query(30)
):
    """Export dashboard summary statistics as CSV"""
    await get_enterprise_employee(enterprise_session)
    
    date_limit = datetime.now(timezone.utc) - timedelta(days=days)
    date_filter = {"$gte": date_limit.isoformat()}
    
    # Gather stats
    total_users = await db.users.count_documents({})
    new_users = await db.users.count_documents({"created_at": date_filter})
    total_alerts = await db.security_alerts.count_documents({})
    recent_alerts = await db.security_alerts.count_documents({"created_at": date_filter})
    total_sos = await db.sos_events.count_documents({})
    recent_sos = await db.sos_events.count_documents({"created_at": date_filter})
    total_reviews = await db.user_reviews.count_documents({"status": "approved"})
    
    # Revenue calculation
    payments = await db.payments.find(
        {"status": "completed", "created_at": date_filter},
        {"_id": 0, "amount": 1}
    ).to_list(10000)
    
    total_revenue = sum(p.get("amount", 0) for p in payments)
    if total_revenue > 1000:
        total_revenue = total_revenue / 100  # Convert cents to euros
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Métrica", f"Total", f"Últimos {days} días"])
    writer.writerow(["Usuarios Registrados", total_users, new_users])
    writer.writerow(["Alertas de Seguridad", total_alerts, recent_alerts])
    writer.writerow(["Eventos SOS", total_sos, recent_sos])
    writer.writerow(["Valoraciones Aprobadas", total_reviews, "-"])
    writer.writerow(["Ingresos (EUR)", "-", f"{total_revenue:.2f}"])
    writer.writerow([])
    writer.writerow(["Generado", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    
    output.seek(0)
    filename = f"resumen_dashboard_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
