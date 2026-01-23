"""
ManoBank S.A. - Regulatory Reporting Service
Automated reports for SEPBLAC and Banco de España
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid
import json


class ReportType(str, Enum):
    # SEPBLAC Reports
    DAILY_CASH = "daily_cash"  # Cash transactions over €1,000
    MONTHLY_OPERATIONS = "monthly_operations"  # Monthly activity summary
    QUARTERLY_STATS = "quarterly_stats"  # Quarterly statistics
    SUSPICIOUS_ACTIVITY = "suspicious_activity"  # SAR
    
    # Banco de España Reports
    BALANCE_SHEET = "balance_sheet"
    LIQUIDITY = "liquidity"
    CAPITAL_ADEQUACY = "capital_adequacy"
    LARGE_EXPOSURES = "large_exposures"
    
    # Internal Reports
    AUDIT_TRAIL = "audit_trail"
    KYC_SUMMARY = "kyc_summary"
    AML_SUMMARY = "aml_summary"
    RISK_ASSESSMENT = "risk_assessment"


class ReportStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    REJECTED = "rejected"


# Database reference
_db = None

# Regulatory thresholds
CASH_REPORTING_THRESHOLD = 1000  # EUR
LARGE_TRANSACTION_THRESHOLD = 10000  # EUR


def init_reporting_service(db):
    """Initialize reporting service with database connection"""
    global _db
    _db = db
    print("✅ Reporting Service initialized")


async def generate_daily_cash_report(
    report_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Generate daily cash transaction report for SEPBLAC.
    All cash transactions over €1,000 must be reported.
    """
    if _db is None:
        raise RuntimeError("Reporting service not initialized")
    
    if report_date is None:
        report_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    next_day = report_date + timedelta(days=1)
    
    # Get cash transactions over threshold
    cash_transactions = await _db.ledger.find({
        "timestamp": {
            "$gte": report_date.isoformat(),
            "$lt": next_day.isoformat()
        },
        "entry_type": {"$in": ["DEPOSIT", "WITHDRAWAL"]},
        "amount": {"$gte": CASH_REPORTING_THRESHOLD}
    }, {"_id": 0}).to_list(1000)
    
    # Aggregate by customer
    customer_totals = {}
    for tx in cash_transactions:
        acc_id = tx.get("account_id")
        if acc_id not in customer_totals:
            customer_totals[acc_id] = {"deposits": 0, "withdrawals": 0, "transactions": []}
        
        if tx.get("entry_type") == "DEPOSIT":
            customer_totals[acc_id]["deposits"] += tx.get("amount", 0)
        else:
            customer_totals[acc_id]["withdrawals"] += tx.get("amount", 0)
        
        customer_totals[acc_id]["transactions"].append(tx)
    
    report = {
        "report_id": f"DCR_{report_date.strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}",
        "report_type": ReportType.DAILY_CASH.value,
        "report_date": report_date.isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": ReportStatus.DRAFT.value,
        "regulator": "SEPBLAC",
        "entity": {
            "name": "ManoBank S.A.",
            "cif": "B19427723"
        },
        "summary": {
            "total_transactions": len(cash_transactions),
            "total_deposits": sum(tx.get("amount", 0) for tx in cash_transactions if tx.get("entry_type") == "DEPOSIT"),
            "total_withdrawals": sum(tx.get("amount", 0) for tx in cash_transactions if tx.get("entry_type") == "WITHDRAWAL"),
            "accounts_involved": len(customer_totals)
        },
        "details": {
            "by_account": customer_totals,
            "transactions": cash_transactions
        },
        "submission": {
            "submitted_at": None,
            "submitted_by": None,
            "acknowledgment_number": None
        }
    }
    
    await _db.regulatory_reports.insert_one(report)
    
    return {k: v for k, v in report.items() if k not in ["_id", "details"]}


async def generate_monthly_operations_report(
    year: int,
    month: int
) -> Dict[str, Any]:
    """
    Generate monthly operations summary report.
    """
    if _db is None:
        raise RuntimeError("Reporting service not initialized")
    
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    
    # Get all transactions in period
    transactions = await _db.ledger.find({
        "timestamp": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    }, {"_id": 0}).to_list(10000)
    
    # Aggregate by type
    by_type = {}
    for tx in transactions:
        t = tx.get("entry_type", "UNKNOWN")
        if t not in by_type:
            by_type[t] = {"count": 0, "total_amount": 0}
        by_type[t]["count"] += 1
        by_type[t]["total_amount"] += abs(tx.get("amount", 0))
    
    # Get active accounts
    active_accounts = len(set(tx.get("account_id") for tx in transactions))
    
    # New customers
    new_customers = await _db.manobank_customers.count_documents({
        "created_at": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    })
    
    # KYC completions
    kyc_approvals = await _db.kyc_processes.count_documents({
        "status": "approved",
        "approved_at": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    })
    
    # AML alerts
    aml_alerts = await _db.aml_alerts.count_documents({
        "created_at": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    })
    
    report = {
        "report_id": f"MOR_{year}{month:02d}_{uuid.uuid4().hex[:8]}",
        "report_type": ReportType.MONTHLY_OPERATIONS.value,
        "period": {
            "year": year,
            "month": month,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": ReportStatus.DRAFT.value,
        "entity": {
            "name": "ManoBank S.A.",
            "cif": "B19427723"
        },
        "operations": {
            "total_transactions": len(transactions),
            "by_type": by_type,
            "active_accounts": active_accounts
        },
        "customers": {
            "new_registrations": new_customers,
            "kyc_approvals": kyc_approvals
        },
        "compliance": {
            "aml_alerts_generated": aml_alerts
        }
    }
    
    await _db.regulatory_reports.insert_one(report)
    
    return {k: v for k, v in report.items() if k != "_id"}


async def generate_audit_trail_report(
    start_date: datetime,
    end_date: datetime,
    event_types: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generate audit trail report for internal or external auditors.
    """
    if _db is None:
        raise RuntimeError("Reporting service not initialized")
    
    query = {
        "timestamp": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }
    
    if event_types:
        query["event_type"] = {"$in": event_types}
    
    audit_logs = await _db.compliance_audit_logs.find(
        query,
        {"_id": 0}
    ).sort("timestamp", 1).to_list(10000)
    
    # Aggregate by event type
    by_type = {}
    by_actor = {}
    by_risk = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    
    for log in audit_logs:
        # By type
        t = log.get("event_type", "UNKNOWN")
        by_type[t] = by_type.get(t, 0) + 1
        
        # By actor
        actor = log.get("actor", {}).get("email", "SYSTEM")
        by_actor[actor] = by_actor.get(actor, 0) + 1
        
        # By risk
        risk = log.get("risk_level", "low")
        if risk in by_risk:
            by_risk[risk] += 1
    
    report = {
        "report_id": f"AUD_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}",
        "report_type": ReportType.AUDIT_TRAIL.value,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": ReportStatus.DRAFT.value,
        "entity": {
            "name": "ManoBank S.A.",
            "cif": "B19427723"
        },
        "summary": {
            "total_events": len(audit_logs),
            "by_event_type": by_type,
            "by_actor": by_actor,
            "by_risk_level": by_risk
        },
        "events": audit_logs
    }
    
    await _db.regulatory_reports.insert_one(report)
    
    return {k: v for k, v in report.items() if k not in ["_id", "events"]}


async def submit_report(
    report_id: str,
    operator_id: str
) -> Dict[str, Any]:
    """
    Mark a report as submitted to regulator.
    In production: This would integrate with SEPBLAC API.
    """
    if _db is None:
        raise RuntimeError("Reporting service not initialized")
    
    result = await _db.regulatory_reports.update_one(
        {"report_id": report_id},
        {
            "$set": {
                "status": ReportStatus.SUBMITTED.value,
                "submission.submitted_at": datetime.now(timezone.utc).isoformat(),
                "submission.submitted_by": operator_id,
                "submission.acknowledgment_number": f"ACK_{uuid.uuid4().hex[:12]}"  # Would come from regulator
            }
        }
    )
    
    if result.matched_count == 0:
        raise ValueError(f"Report not found: {report_id}")
    
    return {
        "report_id": report_id,
        "status": ReportStatus.SUBMITTED.value,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }


async def get_pending_reports() -> List[Dict[str, Any]]:
    """Get reports pending submission"""
    if _db is None:
        return []
    
    reports = await _db.regulatory_reports.find(
        {"status": {"$in": [ReportStatus.DRAFT.value, ReportStatus.PENDING_REVIEW.value]}},
        {"_id": 0, "details": 0, "events": 0}
    ).sort("generated_at", -1).to_list(100)
    
    return reports


async def get_reporting_dashboard() -> Dict[str, Any]:
    """Get reporting dashboard statistics"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    # Count by status
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await _db.regulatory_reports.aggregate(pipeline).to_list(10)
    
    # Count by type
    pipeline = [
        {"$group": {"_id": "$report_type", "count": {"$sum": 1}}}
    ]
    type_counts = await _db.regulatory_reports.aggregate(pipeline).to_list(20)
    
    # Recent submissions
    recent = await _db.regulatory_reports.find(
        {"status": ReportStatus.SUBMITTED.value},
        {"_id": 0, "details": 0, "events": 0}
    ).sort("submission.submitted_at", -1).limit(10).to_list(10)
    
    return {
        "by_status": {item["_id"]: item["count"] for item in status_counts},
        "by_type": {item["_id"]: item["count"] for item in type_counts},
        "recent_submissions": recent,
        "total_reports": await _db.regulatory_reports.count_documents({}),
        "pending_submission": await _db.regulatory_reports.count_documents({
            "status": {"$in": ["draft", "pending_review"]}
        }),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


async def export_report_xml(report_id: str) -> str:
    """
    Export report in XML format for regulatory submission.
    """
    if _db is None:
        raise RuntimeError("Reporting service not initialized")
    
    report = await _db.regulatory_reports.find_one({"report_id": report_id}, {"_id": 0})
    
    if not report:
        raise ValueError(f"Report not found: {report_id}")
    
    # Simple XML generation (in production: use proper XML library with schema validation)
    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<RegulatoryReport xmlns="urn:sepblac:reporting:v1">',
        f'  <ReportHeader>',
        f'    <ReportId>{report["report_id"]}</ReportId>',
        f'    <ReportType>{report["report_type"]}</ReportType>',
        f'    <GeneratedAt>{report["generated_at"]}</GeneratedAt>',
        f'    <Entity>',
        f'      <Name>{report["entity"]["name"]}</Name>',
        f'      <CIF>{report["entity"]["cif"]}</CIF>',
        f'    </Entity>',
        f'  </ReportHeader>',
        f'  <ReportBody>',
    ]
    
    # Add summary data
    if "summary" in report:
        xml_parts.append('    <Summary>')
        for key, value in report["summary"].items():
            if isinstance(value, dict):
                xml_parts.append(f'      <{key}>')
                for k, v in value.items():
                    xml_parts.append(f'        <Item key="{k}">{v}</Item>')
                xml_parts.append(f'      </{key}>')
            else:
                xml_parts.append(f'      <{key}>{value}</{key}>')
        xml_parts.append('    </Summary>')
    
    xml_parts.extend([
        f'  </ReportBody>',
        f'</RegulatoryReport>'
    ])
    
    return '\n'.join(xml_parts)
