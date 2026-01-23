"""
ManoBank S.A. - Banking Core Routes
Ledger, AML, KYC, and Regulatory Reporting APIs
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

router = APIRouter(tags=["Banking Core"])

# Service references
_db = None
_require_admin = None
_ledger_service = None
_aml_service = None
_kyc_service = None
_reporting_service = None


def init_banking_core_routes(db, require_admin_func):
    """Initialize banking core routes with services"""
    global _db, _require_admin, _ledger_service, _aml_service, _kyc_service, _reporting_service
    _db = db
    _require_admin = require_admin_func
    
    # Import and initialize services
    from ledger.ledger_service import init_ledger_service
    from compliance.aml.aml_service import init_aml_service
    from compliance.kyc.kyc_service import init_kyc_service
    from compliance.reporting.reporting_service import init_reporting_service
    
    init_ledger_service(db)
    init_aml_service(db)
    init_kyc_service(db)
    init_reporting_service(db)
    
    # Store service modules
    import ledger.ledger_service as ledger_mod
    import compliance.aml.aml_service as aml_mod
    import compliance.kyc.kyc_service as kyc_mod
    import compliance.reporting.reporting_service as reporting_mod
    
    _ledger_service = ledger_mod
    _aml_service = aml_mod
    _kyc_service = kyc_mod
    _reporting_service = reporting_mod


# ============================================
# LEDGER ROUTES
# ============================================

@router.get("/ledger/summary")
async def ledger_summary(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get ledger summary statistics - Admin only"""
    await _require_admin(request, session_token)
    return await _ledger_service.get_ledger_summary()


@router.get("/ledger/account/{account_id}/statement")
async def account_statement(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get account statement from ledger - Admin only"""
    await _require_admin(request, session_token)
    
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    return await _ledger_service.get_account_statement(
        account_id=account_id,
        start_date=start_dt,
        end_date=end_dt,
        limit=limit
    )


@router.get("/ledger/verify")
async def verify_ledger(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    start_sequence: int = 1,
    end_sequence: Optional[int] = None
):
    """Verify ledger integrity (blockchain-style check) - Admin only"""
    await _require_admin(request, session_token)
    return await _ledger_service.verify_ledger_integrity(start_sequence, end_sequence)


# ============================================
# AML ROUTES
# ============================================

@router.get("/aml/dashboard")
async def aml_dashboard(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get AML dashboard statistics - Admin only"""
    await _require_admin(request, session_token)
    return await _aml_service.get_aml_dashboard()


@router.get("/aml/alerts")
async def list_aml_alerts(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get pending AML alerts for review - Admin only"""
    await _require_admin(request, session_token)
    alerts = await _aml_service.get_pending_alerts(limit)
    return {"alerts": alerts, "count": len(alerts)}


class AMLAlertUpdate(BaseModel):
    status: str
    resolution: Optional[str] = None


@router.patch("/aml/alerts/{alert_id}")
async def update_aml_alert(
    alert_id: str,
    data: AMLAlertUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update AML alert status - Admin only"""
    admin = await _require_admin(request, session_token)
    
    from compliance.aml.aml_service import AMLAlertStatus
    
    try:
        status = AMLAlertStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")
    
    return await _aml_service.update_alert_status(
        alert_id=alert_id,
        new_status=status,
        resolution=data.resolution,
        operator_id=admin.user_id
    )


class SARRequest(BaseModel):
    customer_id: str
    narrative: str


@router.post("/aml/alerts/{alert_id}/sar")
async def file_sar_report(
    alert_id: str,
    data: SARRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """File a Suspicious Activity Report - Admin only"""
    admin = await _require_admin(request, session_token)
    
    return await _aml_service.file_sar(
        alert_id=alert_id,
        customer_id=data.customer_id,
        narrative=data.narrative,
        operator_id=admin.user_id
    )


class CustomerScreenRequest(BaseModel):
    customer_id: str
    full_name: str
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    document_number: Optional[str] = None


@router.post("/aml/screen-customer")
async def screen_customer(
    data: CustomerScreenRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Screen a customer for AML - Admin only"""
    await _require_admin(request, session_token)
    
    return await _aml_service.screen_customer(
        customer_id=data.customer_id,
        full_name=data.full_name,
        date_of_birth=data.date_of_birth,
        nationality=data.nationality,
        document_number=data.document_number
    )


# ============================================
# KYC ROUTES
# ============================================

@router.get("/kyc/dashboard")
async def kyc_dashboard(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get KYC dashboard statistics - Admin only"""
    await _require_admin(request, session_token)
    return await _kyc_service.get_kyc_dashboard()


@router.get("/kyc/pending")
async def list_pending_kyc(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = 50
):
    """Get pending KYC reviews - Admin only"""
    await _require_admin(request, session_token)
    kycs = await _kyc_service.get_pending_kyc_reviews(limit)
    return {"kyc_processes": kycs, "count": len(kycs)}


@router.get("/kyc/{kyc_id}")
async def get_kyc_details(
    kyc_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get KYC process details - Admin only"""
    await _require_admin(request, session_token)
    return await _kyc_service.get_kyc_status(kyc_id)


class KYCInitRequest(BaseModel):
    customer_id: str
    customer_name: str
    customer_email: str
    verification_level: str = "standard"


@router.post("/kyc/initiate")
async def initiate_kyc(
    data: KYCInitRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Initiate KYC process for a customer - Admin only"""
    await _require_admin(request, session_token)
    
    from compliance.kyc.kyc_service import VerificationLevel
    
    try:
        level = VerificationLevel(data.verification_level)
    except ValueError:
        level = VerificationLevel.STANDARD
    
    return await _kyc_service.initiate_kyc(
        customer_id=data.customer_id,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        verification_level=level
    )


class KYCApproveRequest(BaseModel):
    notes: Optional[str] = None


@router.post("/kyc/{kyc_id}/approve")
async def approve_kyc(
    kyc_id: str,
    data: KYCApproveRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Approve KYC process - Admin only"""
    admin = await _require_admin(request, session_token)
    
    return await _kyc_service.approve_kyc(
        kyc_id=kyc_id,
        operator_id=admin.user_id,
        notes=data.notes
    )


class KYCRejectRequest(BaseModel):
    reason: str


@router.post("/kyc/{kyc_id}/reject")
async def reject_kyc(
    kyc_id: str,
    data: KYCRejectRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Reject KYC process - Admin only"""
    admin = await _require_admin(request, session_token)
    
    return await _kyc_service.reject_kyc(
        kyc_id=kyc_id,
        operator_id=admin.user_id,
        reason=data.reason
    )


# ============================================
# REGULATORY REPORTING ROUTES
# ============================================

@router.get("/reporting/dashboard")
async def reporting_dashboard(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get reporting dashboard - Admin only"""
    await _require_admin(request, session_token)
    return await _reporting_service.get_reporting_dashboard()


@router.get("/reporting/pending")
async def list_pending_reports(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get reports pending submission - Admin only"""
    await _require_admin(request, session_token)
    reports = await _reporting_service.get_pending_reports()
    return {"reports": reports, "count": len(reports)}


class DailyCashReportRequest(BaseModel):
    report_date: Optional[str] = None


@router.post("/reporting/daily-cash")
async def generate_daily_cash_report(
    data: DailyCashReportRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Generate daily cash transactions report - Admin only"""
    await _require_admin(request, session_token)
    
    report_date = None
    if data.report_date:
        report_date = datetime.fromisoformat(data.report_date.replace('Z', '+00:00'))
    
    return await _reporting_service.generate_daily_cash_report(report_date)


class MonthlyReportRequest(BaseModel):
    year: int
    month: int


@router.post("/reporting/monthly-operations")
async def generate_monthly_report(
    data: MonthlyReportRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Generate monthly operations report - Admin only"""
    await _require_admin(request, session_token)
    
    return await _reporting_service.generate_monthly_operations_report(
        year=data.year,
        month=data.month
    )


class AuditReportRequest(BaseModel):
    start_date: str
    end_date: str
    event_types: Optional[List[str]] = None


@router.post("/reporting/audit-trail")
async def generate_audit_report(
    data: AuditReportRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Generate audit trail report - Admin only"""
    await _require_admin(request, session_token)
    
    return await _reporting_service.generate_audit_trail_report(
        start_date=datetime.fromisoformat(data.start_date.replace('Z', '+00:00')),
        end_date=datetime.fromisoformat(data.end_date.replace('Z', '+00:00')),
        event_types=data.event_types
    )


@router.post("/reporting/{report_id}/submit")
async def submit_report(
    report_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Submit report to regulator - Admin only"""
    admin = await _require_admin(request, session_token)
    
    return await _reporting_service.submit_report(
        report_id=report_id,
        operator_id=admin.user_id
    )


@router.get("/reporting/{report_id}/export")
async def export_report(
    report_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Export report as XML - Admin only"""
    await _require_admin(request, session_token)
    
    from fastapi.responses import Response
    
    xml_content = await _reporting_service.export_report_xml(report_id)
    
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{report_id}.xml"'
        }
    )
