"""
ManoBank S.A. - Compliance & Audit Service
Regulatory compliance for Spanish banking requirements (Banco de España)
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
import hashlib
import json
import os


class AuditEventType(str, Enum):
    # User Account Events
    USER_CREATED = "USER_CREATED"
    USER_UPDATED = "USER_UPDATED"
    USER_DELETED = "USER_DELETED"
    USER_LOGIN = "USER_LOGIN"
    USER_LOGOUT = "USER_LOGOUT"
    USER_PASSWORD_CHANGE = "USER_PASSWORD_CHANGE"
    
    # KYC Events
    KYC_INITIATED = "KYC_INITIATED"
    KYC_DOCUMENT_UPLOADED = "KYC_DOCUMENT_UPLOADED"
    KYC_VIDEO_CALL_STARTED = "KYC_VIDEO_CALL_STARTED"
    KYC_VIDEO_CALL_COMPLETED = "KYC_VIDEO_CALL_COMPLETED"
    KYC_APPROVED = "KYC_APPROVED"
    KYC_REJECTED = "KYC_REJECTED"
    
    # Transaction Events
    TRANSACTION_CREATED = "TRANSACTION_CREATED"
    TRANSACTION_APPROVED = "TRANSACTION_APPROVED"
    TRANSACTION_REJECTED = "TRANSACTION_REJECTED"
    TRANSFER_INITIATED = "TRANSFER_INITIATED"
    TRANSFER_COMPLETED = "TRANSFER_COMPLETED"
    
    # Account Events
    ACCOUNT_OPENED = "ACCOUNT_OPENED"
    ACCOUNT_CLOSED = "ACCOUNT_CLOSED"
    ACCOUNT_FROZEN = "ACCOUNT_FROZEN"
    ACCOUNT_UNFROZEN = "ACCOUNT_UNFROZEN"
    
    # Card Events
    CARD_ISSUED = "CARD_ISSUED"
    CARD_BLOCKED = "CARD_BLOCKED"
    CARD_UNBLOCKED = "CARD_UNBLOCKED"
    CARD_SHIPPED = "CARD_SHIPPED"
    
    # Loan Events
    LOAN_APPLICATION = "LOAN_APPLICATION"
    LOAN_APPROVED = "LOAN_APPROVED"
    LOAN_REJECTED = "LOAN_REJECTED"
    LOAN_DISBURSED = "LOAN_DISBURSED"
    LOAN_PAYMENT = "LOAN_PAYMENT"
    
    # AML Events
    AML_ALERT_GENERATED = "AML_ALERT_GENERATED"
    AML_ALERT_REVIEWED = "AML_ALERT_REVIEWED"
    AML_ALERT_ESCALATED = "AML_ALERT_ESCALATED"
    SAR_FILED = "SAR_FILED"  # Suspicious Activity Report
    
    # Employee Events
    EMPLOYEE_CREATED = "EMPLOYEE_CREATED"
    EMPLOYEE_ROLE_CHANGED = "EMPLOYEE_ROLE_CHANGED"
    EMPLOYEE_TERMINATED = "EMPLOYEE_TERMINATED"
    
    # System Events
    CONFIG_CHANGED = "CONFIG_CHANGED"
    POLICY_UPDATED = "POLICY_UPDATED"
    SYSTEM_ACCESS = "SYSTEM_ACCESS"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Database reference
_db = None

# Regulatory configuration from environment
REGULATOR = os.environ.get("REGULATOR", "Banco de España")
LICENSE_TYPE = os.environ.get("LICENSE_TYPE", "Entidad de Dinero Electrónico")
ENTITY_NAME = os.environ.get("ENTITY_NAME", "ManoBank S.A.")
ENTITY_CIF = os.environ.get("ENTITY_CIF", "B19427723")


def init_compliance_service(db):
    """Initialize compliance service with database connection"""
    global _db
    _db = db
    print("✅ Compliance Service initialized")


async def create_audit_log(
    event_type: AuditEventType,
    actor_id: str,
    actor_email: str,
    target_type: str,
    target_id: str,
    ip_address: str,
    user_agent: str,
    details: Optional[Dict[str, Any]] = None,
    risk_level: RiskLevel = RiskLevel.LOW,
    regulatory_reference: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create an immutable audit log entry for regulatory compliance.
    All entries are cryptographically hashed for integrity verification.
    """
    if not _db:
        raise RuntimeError("Compliance service not initialized")
    
    timestamp = datetime.now(timezone.utc)
    
    # Create the audit entry
    audit_entry = {
        "audit_id": f"AUD_{timestamp.strftime('%Y%m%d%H%M%S')}_{hashlib.md5(f'{actor_id}{target_id}{timestamp.isoformat()}'.encode()).hexdigest()[:8]}",
        "timestamp": timestamp.isoformat(),
        "event_type": event_type.value,
        "actor": {
            "id": actor_id,
            "email": actor_email,
            "ip_address": ip_address,
            "user_agent": user_agent
        },
        "target": {
            "type": target_type,
            "id": target_id
        },
        "details": details or {},
        "risk_level": risk_level.value,
        "regulatory": {
            "regulator": REGULATOR,
            "license_type": LICENSE_TYPE,
            "entity": ENTITY_NAME,
            "cif": ENTITY_CIF,
            "reference": regulatory_reference
        },
        "integrity_hash": "",  # Will be calculated below
        "immutable": True
    }
    
    # Calculate integrity hash (excludes the hash field itself)
    hash_content = json.dumps({k: v for k, v in audit_entry.items() if k != "integrity_hash"}, sort_keys=True)
    audit_entry["integrity_hash"] = hashlib.sha256(hash_content.encode()).hexdigest()
    
    # Store in MongoDB (compliance_audit_logs collection)
    await _db.compliance_audit_logs.insert_one(audit_entry)
    
    # Return without _id for API response
    return {k: v for k, v in audit_entry.items() if k != "_id"}


async def get_audit_logs(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    event_types: Optional[List[str]] = None,
    actor_id: Optional[str] = None,
    target_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[Dict[str, Any]]:
    """
    Retrieve audit logs with filtering.
    For regulatory reporting and internal audits.
    """
    if not _db:
        return []
    
    query = {}
    
    if start_date or end_date:
        query["timestamp"] = {}
        if start_date:
            query["timestamp"]["$gte"] = start_date.isoformat()
        if end_date:
            query["timestamp"]["$lte"] = end_date.isoformat()
    
    if event_types:
        query["event_type"] = {"$in": event_types}
    
    if actor_id:
        query["actor.id"] = actor_id
    
    if target_id:
        query["target.id"] = target_id
    
    if risk_level:
        query["risk_level"] = risk_level
    
    logs = await _db.compliance_audit_logs.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    
    return logs


async def verify_audit_integrity(audit_id: str) -> Dict[str, Any]:
    """
    Verify the integrity of an audit log entry.
    Returns verification status and any discrepancies.
    """
    if not _db:
        return {"verified": False, "error": "Service not initialized"}
    
    entry = await _db.compliance_audit_logs.find_one({"audit_id": audit_id}, {"_id": 0})
    
    if not entry:
        return {"verified": False, "error": "Audit entry not found"}
    
    # Recalculate hash
    stored_hash = entry.get("integrity_hash", "")
    hash_content = json.dumps({k: v for k, v in entry.items() if k != "integrity_hash"}, sort_keys=True)
    calculated_hash = hashlib.sha256(hash_content.encode()).hexdigest()
    
    return {
        "verified": stored_hash == calculated_hash,
        "audit_id": audit_id,
        "stored_hash": stored_hash,
        "calculated_hash": calculated_hash,
        "tampered": stored_hash != calculated_hash
    }


async def generate_regulatory_report(
    report_type: str,
    start_date: datetime,
    end_date: datetime
) -> Dict[str, Any]:
    """
    Generate regulatory compliance report.
    Supports: AML, KYC, TRANSACTIONS, ACCOUNTS
    """
    if not _db:
        return {"error": "Service not initialized"}
    
    report = {
        "report_id": f"REP_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "report_type": report_type,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "entity": {
            "name": ENTITY_NAME,
            "cif": ENTITY_CIF,
            "regulator": REGULATOR
        },
        "data": {}
    }
    
    if report_type == "AML":
        # Anti-Money Laundering report
        aml_events = await _db.compliance_audit_logs.find({
            "timestamp": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
            "event_type": {"$in": ["AML_ALERT_GENERATED", "AML_ALERT_REVIEWED", "AML_ALERT_ESCALATED", "SAR_FILED"]}
        }, {"_id": 0}).to_list(1000)
        
        report["data"] = {
            "total_alerts": len(aml_events),
            "alerts_by_type": {},
            "high_risk_count": len([e for e in aml_events if e.get("risk_level") in ["high", "critical"]]),
            "events": aml_events
        }
        
    elif report_type == "KYC":
        # Know Your Customer report
        kyc_events = await _db.compliance_audit_logs.find({
            "timestamp": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
            "event_type": {"$regex": "^KYC_"}
        }, {"_id": 0}).to_list(1000)
        
        report["data"] = {
            "total_verifications": len([e for e in kyc_events if e.get("event_type") in ["KYC_APPROVED", "KYC_REJECTED"]]),
            "approved": len([e for e in kyc_events if e.get("event_type") == "KYC_APPROVED"]),
            "rejected": len([e for e in kyc_events if e.get("event_type") == "KYC_REJECTED"]),
            "pending": len([e for e in kyc_events if e.get("event_type") == "KYC_INITIATED"]),
            "events": kyc_events
        }
        
    elif report_type == "TRANSACTIONS":
        # Transaction monitoring report
        tx_events = await _db.compliance_audit_logs.find({
            "timestamp": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
            "event_type": {"$in": ["TRANSACTION_CREATED", "TRANSFER_INITIATED", "TRANSFER_COMPLETED"]}
        }, {"_id": 0}).to_list(1000)
        
        report["data"] = {
            "total_transactions": len(tx_events),
            "events": tx_events
        }
    
    # Store the report
    await _db.compliance_reports.insert_one(report)
    
    return {k: v for k, v in report.items() if k != "_id"}


async def get_compliance_summary() -> Dict[str, Any]:
    """
    Get compliance dashboard summary.
    """
    if not _db:
        return {"error": "Service not initialized"}
    
    now = datetime.now(timezone.utc)
    
    # Last 24 hours
    last_24h = (now.replace(hour=0, minute=0, second=0, microsecond=0)).isoformat()
    
    # Last 30 days
    last_30d = (now.replace(day=1)).isoformat()
    
    # Count events
    total_events = await _db.compliance_audit_logs.count_documents({})
    events_today = await _db.compliance_audit_logs.count_documents({"timestamp": {"$gte": last_24h}})
    high_risk_events = await _db.compliance_audit_logs.count_documents({"risk_level": {"$in": ["high", "critical"]}})
    
    # Get recent high-risk events
    recent_high_risk = await _db.compliance_audit_logs.find(
        {"risk_level": {"$in": ["high", "critical"]}},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    return {
        "entity": {
            "name": ENTITY_NAME,
            "cif": ENTITY_CIF,
            "regulator": REGULATOR,
            "license_type": LICENSE_TYPE
        },
        "stats": {
            "total_audit_events": total_events,
            "events_today": events_today,
            "high_risk_events": high_risk_events
        },
        "recent_high_risk": recent_high_risk,
        "generated_at": now.isoformat()
    }
