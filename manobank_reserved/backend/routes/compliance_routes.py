"""
ManoBank S.A. - Compliance Routes
Regulatory compliance endpoints for audit logs and reporting
"""
from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from services.compliance_service import (
    create_audit_log,
    get_audit_logs,
    verify_audit_integrity,
    generate_regulatory_report,
    get_compliance_summary,
    AuditEventType,
    RiskLevel
)

router = APIRouter(tags=["Compliance"])

# Database reference
_db = None
_require_admin = None


def init_compliance_routes(db, require_admin_func):
    """Initialize compliance routes with database and admin check"""
    global _db, _require_admin
    _db = db
    _require_admin = require_admin_func


class AuditLogRequest(BaseModel):
    event_type: str
    target_type: str
    target_id: str
    details: Optional[dict] = None
    risk_level: Optional[str] = "low"
    regulatory_reference: Optional[str] = None


class ReportRequest(BaseModel):
    report_type: str  # AML, KYC, TRANSACTIONS
    start_date: str  # ISO format
    end_date: str  # ISO format


@router.get("/compliance/summary")
async def compliance_summary(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get compliance dashboard summary - Admin only"""
    await _require_admin(request, session_token)
    return await get_compliance_summary()


@router.get("/compliance/audit-logs")
async def list_audit_logs(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    event_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    actor_id: Optional[str] = None,
    target_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """
    List audit logs with filtering - Admin only
    Required for regulatory audits
    """
    await _require_admin(request, session_token)
    
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Parse event types
    event_types = [event_type] if event_type else None
    
    logs = await get_audit_logs(
        start_date=start_dt,
        end_date=end_dt,
        event_types=event_types,
        actor_id=actor_id,
        target_id=target_id,
        risk_level=risk_level,
        limit=limit,
        skip=skip
    )
    
    return {
        "logs": logs,
        "count": len(logs),
        "limit": limit,
        "skip": skip
    }


@router.get("/compliance/audit-logs/{audit_id}")
async def get_audit_log_detail(
    audit_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get specific audit log with integrity verification - Admin only"""
    await _require_admin(request, session_token)
    
    # Verify integrity
    verification = await verify_audit_integrity(audit_id)
    
    if not verification.get("verified"):
        raise HTTPException(
            status_code=404 if "not found" in verification.get("error", "") else 500,
            detail=verification.get("error", "Verification failed")
        )
    
    # Get the log entry
    logs = await get_audit_logs(limit=1)
    log = await _db.compliance_audit_logs.find_one({"audit_id": audit_id}, {"_id": 0})
    
    return {
        "log": log,
        "integrity": verification
    }


@router.post("/compliance/audit-logs")
async def create_manual_audit_log(
    data: AuditLogRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Create manual audit log entry - Admin only
    For recording manual compliance events
    """
    admin = await _require_admin(request, session_token)
    
    # Get client info
    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    if "," in ip:
        ip = ip.split(",")[0].strip()
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Validate event type
    try:
        event_type = AuditEventType(data.event_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid event type: {data.event_type}")
    
    # Validate risk level
    try:
        risk = RiskLevel(data.risk_level)
    except ValueError:
        risk = RiskLevel.LOW
    
    entry = await create_audit_log(
        event_type=event_type,
        actor_id=admin.user_id,
        actor_email=admin.email,
        target_type=data.target_type,
        target_id=data.target_id,
        ip_address=ip,
        user_agent=user_agent,
        details=data.details,
        risk_level=risk,
        regulatory_reference=data.regulatory_reference
    )
    
    return {"message": "Audit log created", "audit_id": entry["audit_id"]}


@router.post("/compliance/reports")
async def generate_report(
    data: ReportRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Generate regulatory compliance report - Admin only
    Types: AML, KYC, TRANSACTIONS, ACCOUNTS
    """
    await _require_admin(request, session_token)
    
    valid_types = ["AML", "KYC", "TRANSACTIONS", "ACCOUNTS"]
    if data.report_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid report type. Valid types: {', '.join(valid_types)}"
        )
    
    try:
        start_date = datetime.fromisoformat(data.start_date.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data.end_date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")
    
    report = await generate_regulatory_report(
        report_type=data.report_type,
        start_date=start_date,
        end_date=end_date
    )
    
    return report


@router.get("/compliance/reports")
async def list_reports(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    report_type: Optional[str] = None,
    limit: int = 20
):
    """List generated compliance reports - Admin only"""
    await _require_admin(request, session_token)
    
    query = {}
    if report_type:
        query["report_type"] = report_type
    
    reports = await _db.compliance_reports.find(
        query,
        {"_id": 0, "data": 0}  # Exclude large data field in list
    ).sort("generated_at", -1).limit(limit).to_list(limit)
    
    return {"reports": reports}


@router.get("/compliance/reports/{report_id}")
async def get_report(
    report_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get full compliance report by ID - Admin only"""
    await _require_admin(request, session_token)
    
    report = await _db.compliance_reports.find_one({"report_id": report_id}, {"_id": 0})
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.get("/compliance/policies")
async def list_policies(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List available compliance policy documents - Admin only"""
    await _require_admin(request, session_token)
    
    import os
    from pathlib import Path
    
    policies_dir = Path("/app/backend/policies")
    policies = []
    
    if policies_dir.exists():
        for file in policies_dir.glob("*.md"):
            policies.append({
                "name": file.stem.replace("_", " ").title(),
                "filename": file.name,
                "path": f"/api/manobank/admin/compliance/policies/{file.stem}"
            })
    
    return {"policies": policies}


@router.get("/compliance/policies/{policy_name}")
async def get_policy(
    policy_name: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get policy document content - Admin only"""
    await _require_admin(request, session_token)
    
    from pathlib import Path
    
    policy_file = Path(f"/app/backend/policies/{policy_name}.md")
    
    if not policy_file.exists():
        # Try with _policy suffix
        policy_file = Path(f"/app/backend/policies/{policy_name}_policy.md")
    
    if not policy_file.exists():
        raise HTTPException(status_code=404, detail="Policy not found")
    
    with open(policy_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return {
        "name": policy_name.replace("_", " ").title(),
        "content": content
    }


@router.get("/compliance/event-types")
async def list_event_types(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """List all available audit event types - Admin only"""
    await _require_admin(request, session_token)
    
    return {
        "event_types": [e.value for e in AuditEventType],
        "risk_levels": [r.value for r in RiskLevel]
    }
