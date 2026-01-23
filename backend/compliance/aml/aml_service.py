"""
ManoBank S.A. - AML (Anti-Money Laundering) Service
Screening, monitoring, and reporting for SEPBLAC compliance
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum
import hashlib
import uuid
import re


class AMLAlertType(str, Enum):
    HIGH_VALUE_TRANSACTION = "HIGH_VALUE_TRANSACTION"
    UNUSUAL_PATTERN = "UNUSUAL_PATTERN"
    SANCTIONS_HIT = "SANCTIONS_HIT"
    PEP_MATCH = "PEP_MATCH"
    STRUCTURING = "STRUCTURING"  # Breaking up transactions
    VELOCITY = "VELOCITY"  # Too many transactions
    GEOGRAPHIC_RISK = "GEOGRAPHIC_RISK"
    DORMANT_ACTIVATION = "DORMANT_ACTIVATION"
    CASH_INTENSIVE = "CASH_INTENSIVE"
    ROUND_AMOUNTS = "ROUND_AMOUNTS"
    RAPID_MOVEMENT = "RAPID_MOVEMENT"  # Money in and out quickly


class AMLAlertStatus(str, Enum):
    NEW = "new"
    UNDER_REVIEW = "under_review"
    ESCALATED = "escalated"
    CLEARED = "cleared"
    SAR_FILED = "sar_filed"  # Suspicious Activity Report
    ACCOUNT_BLOCKED = "account_blocked"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# High-risk countries (FATF grey/black list - simplified)
HIGH_RISK_COUNTRIES = [
    "AF", "BY", "CF", "CD", "CU", "GN", "IR", "IQ", "KP", "LY", 
    "ML", "MM", "NI", "PK", "RU", "SO", "SS", "SD", "SY", "VE", "YE", "ZW"
]

# Database reference
_db = None

# Thresholds (configurable)
HIGH_VALUE_THRESHOLD = 10000  # EUR - requires enhanced due diligence
SAR_THRESHOLD = 50000  # EUR - automatic SAR consideration
VELOCITY_THRESHOLD = 10  # transactions per day
STRUCTURING_THRESHOLD = 9000  # Just under reporting threshold


def init_aml_service(db):
    """Initialize AML service with database connection"""
    global _db
    _db = db
    print("✅ AML Service initialized")


async def screen_transaction(
    transaction_id: str,
    account_id: str,
    amount: float,
    currency: str,
    transaction_type: str,
    counterparty_country: Optional[str] = None,
    counterparty_name: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Screen a transaction for AML red flags.
    Returns risk assessment and any generated alerts.
    """
    if _db is None:
        raise RuntimeError("AML service not initialized")
    
    alerts = []
    risk_score = 0
    risk_factors = []
    
    # 1. High value check
    if amount >= HIGH_VALUE_THRESHOLD:
        risk_score += 30
        risk_factors.append(f"High value transaction: €{amount:,.2f}")
        if amount >= SAR_THRESHOLD:
            alerts.append(await _create_alert(
                AMLAlertType.HIGH_VALUE_TRANSACTION,
                account_id,
                transaction_id,
                f"Transaction €{amount:,.2f} exceeds SAR threshold",
                RiskLevel.HIGH
            ))
    
    # 2. Geographic risk
    if counterparty_country and counterparty_country.upper() in HIGH_RISK_COUNTRIES:
        risk_score += 40
        risk_factors.append(f"High-risk country: {counterparty_country}")
        alerts.append(await _create_alert(
            AMLAlertType.GEOGRAPHIC_RISK,
            account_id,
            transaction_id,
            f"Transaction with high-risk jurisdiction: {counterparty_country}",
            RiskLevel.HIGH
        ))
    
    # 3. Structuring detection (multiple transactions just under threshold)
    recent_transactions = await _get_recent_transactions(account_id, hours=24)
    recent_total = sum(t.get("amount", 0) for t in recent_transactions)
    
    if amount < HIGH_VALUE_THRESHOLD and (recent_total + amount) >= HIGH_VALUE_THRESHOLD:
        near_threshold_count = len([t for t in recent_transactions if STRUCTURING_THRESHOLD <= t.get("amount", 0) < HIGH_VALUE_THRESHOLD])
        if near_threshold_count >= 2:
            risk_score += 50
            risk_factors.append("Potential structuring detected")
            alerts.append(await _create_alert(
                AMLAlertType.STRUCTURING,
                account_id,
                transaction_id,
                f"Multiple transactions near threshold. 24h total: €{recent_total + amount:,.2f}",
                RiskLevel.HIGH
            ))
    
    # 4. Velocity check
    if len(recent_transactions) >= VELOCITY_THRESHOLD:
        risk_score += 25
        risk_factors.append(f"High transaction velocity: {len(recent_transactions)} in 24h")
        alerts.append(await _create_alert(
            AMLAlertType.VELOCITY,
            account_id,
            transaction_id,
            f"{len(recent_transactions)} transactions in 24 hours",
            RiskLevel.MEDIUM
        ))
    
    # 5. Round amount check
    if amount >= 1000 and amount % 1000 == 0:
        risk_score += 10
        risk_factors.append("Round amount transaction")
    
    # 6. Dormant account activation
    account = await _db.manobank_accounts.find_one({"id": account_id}, {"_id": 0})
    if account:
        last_movement = account.get("last_movement")
        if last_movement:
            try:
                last_date = datetime.fromisoformat(last_movement.replace('Z', '+00:00'))
                if (datetime.now(timezone.utc) - last_date).days > 180:
                    risk_score += 30
                    risk_factors.append("Dormant account suddenly active")
                    alerts.append(await _create_alert(
                        AMLAlertType.DORMANT_ACTIVATION,
                        account_id,
                        transaction_id,
                        f"Account dormant for {(datetime.now(timezone.utc) - last_date).days} days now active",
                        RiskLevel.MEDIUM
                    ))
            except:
                pass
    
    # Determine overall risk level
    if risk_score >= 80:
        overall_risk = RiskLevel.CRITICAL
    elif risk_score >= 50:
        overall_risk = RiskLevel.HIGH
    elif risk_score >= 25:
        overall_risk = RiskLevel.MEDIUM
    else:
        overall_risk = RiskLevel.LOW
    
    # Store screening result
    screening = {
        "screening_id": f"SCR_{uuid.uuid4().hex[:12]}",
        "transaction_id": transaction_id,
        "account_id": account_id,
        "amount": amount,
        "risk_score": risk_score,
        "risk_level": overall_risk.value,
        "risk_factors": risk_factors,
        "alerts_generated": len(alerts),
        "screened_at": datetime.now(timezone.utc).isoformat(),
        "passed": overall_risk in [RiskLevel.LOW, RiskLevel.MEDIUM]
    }
    
    await _db.aml_screenings.insert_one(screening)
    
    return {
        "screening_id": screening["screening_id"],
        "transaction_id": transaction_id,
        "risk_score": risk_score,
        "risk_level": overall_risk.value,
        "risk_factors": risk_factors,
        "alerts": [a["alert_id"] for a in alerts],
        "action_required": overall_risk in [RiskLevel.HIGH, RiskLevel.CRITICAL],
        "passed": screening["passed"]
    }


async def _get_recent_transactions(account_id: str, hours: int = 24) -> List[Dict]:
    """Get recent transactions for an account"""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    
    transactions = await _db.ledger.find({
        "account_id": account_id,
        "timestamp": {"$gte": cutoff}
    }, {"_id": 0, "amount": 1, "timestamp": 1}).to_list(100)
    
    return transactions


async def _create_alert(
    alert_type: AMLAlertType,
    account_id: str,
    transaction_id: str,
    description: str,
    risk_level: RiskLevel
) -> Dict[str, Any]:
    """Create an AML alert"""
    alert = {
        "alert_id": f"AML_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}",
        "alert_type": alert_type.value,
        "account_id": account_id,
        "transaction_id": transaction_id,
        "description": description,
        "risk_level": risk_level.value,
        "status": AMLAlertStatus.NEW.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "assigned_to": None,
        "resolution": None,
        "resolved_at": None
    }
    
    await _db.aml_alerts.insert_one(alert)
    
    return {k: v for k, v in alert.items() if k != "_id"}


async def screen_customer(
    customer_id: str,
    full_name: str,
    date_of_birth: Optional[str] = None,
    nationality: Optional[str] = None,
    document_number: Optional[str] = None
) -> Dict[str, Any]:
    """
    Screen a customer against sanctions lists and PEP databases.
    """
    if _db is None:
        raise RuntimeError("AML service not initialized")
    
    risk_score = 0
    risk_factors = []
    alerts = []
    
    # 1. Nationality check
    if nationality and nationality.upper() in HIGH_RISK_COUNTRIES:
        risk_score += 40
        risk_factors.append(f"High-risk nationality: {nationality}")
    
    # 2. Sanctions list check (simplified - in production use external API)
    sanctions_hit = await _check_sanctions_list(full_name)
    if sanctions_hit:
        risk_score += 100
        risk_factors.append("Sanctions list match")
        alerts.append(await _create_customer_alert(
            AMLAlertType.SANCTIONS_HIT,
            customer_id,
            f"Potential sanctions match: {full_name}",
            RiskLevel.CRITICAL
        ))
    
    # 3. PEP check (simplified)
    pep_match = await _check_pep_database(full_name)
    if pep_match:
        risk_score += 50
        risk_factors.append("Politically Exposed Person match")
        alerts.append(await _create_customer_alert(
            AMLAlertType.PEP_MATCH,
            customer_id,
            f"PEP match: {full_name}",
            RiskLevel.HIGH
        ))
    
    # Determine risk level
    if risk_score >= 80:
        overall_risk = RiskLevel.CRITICAL
    elif risk_score >= 50:
        overall_risk = RiskLevel.HIGH
    elif risk_score >= 25:
        overall_risk = RiskLevel.MEDIUM
    else:
        overall_risk = RiskLevel.LOW
    
    # Store screening
    screening = {
        "screening_id": f"CUS_{uuid.uuid4().hex[:12]}",
        "customer_id": customer_id,
        "full_name": full_name,
        "risk_score": risk_score,
        "risk_level": overall_risk.value,
        "risk_factors": risk_factors,
        "sanctions_checked": True,
        "pep_checked": True,
        "screened_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.aml_customer_screenings.insert_one(screening)
    
    # Update customer risk level
    await _db.manobank_customers.update_one(
        {"id": customer_id},
        {"$set": {
            "aml_risk_level": overall_risk.value,
            "last_aml_screening": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "screening_id": screening["screening_id"],
        "customer_id": customer_id,
        "risk_score": risk_score,
        "risk_level": overall_risk.value,
        "risk_factors": risk_factors,
        "sanctions_hit": sanctions_hit,
        "pep_match": pep_match,
        "alerts": [a["alert_id"] for a in alerts],
        "onboarding_allowed": overall_risk != RiskLevel.CRITICAL
    }


async def _check_sanctions_list(name: str) -> bool:
    """Check name against sanctions list (simplified)"""
    # In production: Call Refinitiv World-Check, Dow Jones, or similar
    # This is a placeholder that checks against a local list
    
    sanctioned_names = await _db.sanctions_list.find(
        {"$text": {"$search": name}},
        {"_id": 0}
    ).limit(5).to_list(5)
    
    return len(sanctioned_names) > 0


async def _check_pep_database(name: str) -> bool:
    """Check if person is a Politically Exposed Person (simplified)"""
    # In production: Call external PEP database API
    
    pep_matches = await _db.pep_list.find(
        {"$text": {"$search": name}},
        {"_id": 0}
    ).limit(5).to_list(5)
    
    return len(pep_matches) > 0


async def _create_customer_alert(
    alert_type: AMLAlertType,
    customer_id: str,
    description: str,
    risk_level: RiskLevel
) -> Dict[str, Any]:
    """Create an AML alert for customer screening"""
    alert = {
        "alert_id": f"AML_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}",
        "alert_type": alert_type.value,
        "customer_id": customer_id,
        "description": description,
        "risk_level": risk_level.value,
        "status": AMLAlertStatus.NEW.value,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.aml_alerts.insert_one(alert)
    return {k: v for k, v in alert.items() if k != "_id"}


async def get_pending_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    """Get pending AML alerts for review"""
    if _db is None:
        return []
    
    alerts = await _db.aml_alerts.find(
        {"status": {"$in": [AMLAlertStatus.NEW.value, AMLAlertStatus.UNDER_REVIEW.value]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return alerts


async def update_alert_status(
    alert_id: str,
    new_status: AMLAlertStatus,
    resolution: Optional[str] = None,
    operator_id: Optional[str] = None
) -> Dict[str, Any]:
    """Update the status of an AML alert"""
    if _db is None:
        raise RuntimeError("AML service not initialized")
    
    update = {
        "status": new_status.value,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": operator_id
    }
    
    if resolution:
        update["resolution"] = resolution
    
    if new_status in [AMLAlertStatus.CLEARED, AMLAlertStatus.SAR_FILED, AMLAlertStatus.ACCOUNT_BLOCKED]:
        update["resolved_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await _db.aml_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": update}
    )
    
    if result.matched_count == 0:
        raise ValueError(f"Alert not found: {alert_id}")
    
    return {"alert_id": alert_id, "status": new_status.value, "updated": True}


async def file_sar(
    alert_id: str,
    customer_id: str,
    narrative: str,
    operator_id: str
) -> Dict[str, Any]:
    """
    File a Suspicious Activity Report (SAR) to SEPBLAC.
    In production: This would submit to the regulator's system.
    """
    if _db is None:
        raise RuntimeError("AML service not initialized")
    
    sar = {
        "sar_id": f"SAR_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}",
        "alert_id": alert_id,
        "customer_id": customer_id,
        "narrative": narrative,
        "filed_by": operator_id,
        "filed_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending_submission",
        "regulator": "SEPBLAC",
        "reference_number": None  # Would come from regulator
    }
    
    await _db.sar_reports.insert_one(sar)
    
    # Update alert status
    await update_alert_status(alert_id, AMLAlertStatus.SAR_FILED, f"SAR filed: {sar['sar_id']}", operator_id)
    
    return {k: v for k, v in sar.items() if k != "_id"}


async def get_aml_dashboard() -> Dict[str, Any]:
    """Get AML dashboard statistics"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    # Count alerts by status
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await _db.aml_alerts.aggregate(pipeline).to_list(10)
    
    # Count alerts by type
    pipeline = [
        {"$group": {"_id": "$alert_type", "count": {"$sum": 1}}}
    ]
    type_counts = await _db.aml_alerts.aggregate(pipeline).to_list(20)
    
    # Recent high-risk alerts
    high_risk = await _db.aml_alerts.find(
        {"risk_level": {"$in": ["high", "critical"]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # SARs filed this month
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    sars_this_month = await _db.sar_reports.count_documents({
        "filed_at": {"$gte": month_start.isoformat()}
    })
    
    return {
        "alerts_by_status": {item["_id"]: item["count"] for item in status_counts},
        "alerts_by_type": {item["_id"]: item["count"] for item in type_counts},
        "recent_high_risk": high_risk,
        "sars_this_month": sars_this_month,
        "total_alerts": await _db.aml_alerts.count_documents({}),
        "pending_review": await _db.aml_alerts.count_documents({"status": {"$in": ["new", "under_review"]}}),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
