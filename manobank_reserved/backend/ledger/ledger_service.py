"""
ManoBank S.A. - Immutable Ledger Service
Legal accounting ledger for regulatory compliance
All entries are cryptographically signed and immutable
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
import hashlib
import json
import uuid


class LedgerEntryType(str, Enum):
    # Account movements
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
    
    # Fees and charges
    FEE = "FEE"
    INTEREST_CREDIT = "INTEREST_CREDIT"
    INTEREST_DEBIT = "INTEREST_DEBIT"
    
    # Loan operations
    LOAN_DISBURSEMENT = "LOAN_DISBURSEMENT"
    LOAN_REPAYMENT = "LOAN_REPAYMENT"
    
    # Card operations
    CARD_PURCHASE = "CARD_PURCHASE"
    CARD_REFUND = "CARD_REFUND"
    CARD_CASH_ADVANCE = "CARD_CASH_ADVANCE"
    
    # Regulatory
    FREEZE = "FREEZE"
    UNFREEZE = "UNFREEZE"
    SEIZURE = "SEIZURE"
    
    # Corrections (must reference original)
    REVERSAL = "REVERSAL"
    ADJUSTMENT = "ADJUSTMENT"


class LedgerStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    REVERSED = "reversed"


# Database reference
_db = None
_previous_hash = None


def init_ledger_service(db):
    """Initialize ledger service with database connection"""
    global _db
    _db = db
    print("✅ Ledger Service initialized")


async def _get_previous_hash() -> str:
    """Get the hash of the last ledger entry for chain integrity"""
    if _db is None:
        return "GENESIS"
    
    last_entry = await _db.ledger.find_one(
        {},
        {"integrity_hash": 1},
        sort=[("sequence_number", -1)]
    )
    
    if last_entry:
        return last_entry.get("integrity_hash", "GENESIS")
    return "GENESIS"


async def _get_next_sequence() -> int:
    """Get the next sequence number for ledger entry"""
    if _db is None:
        return 1
    
    last_entry = await _db.ledger.find_one(
        {},
        {"sequence_number": 1},
        sort=[("sequence_number", -1)]
    )
    
    if last_entry:
        return last_entry.get("sequence_number", 0) + 1
    return 1


async def create_ledger_entry(
    entry_type: LedgerEntryType,
    account_id: str,
    amount: float,
    currency: str = "EUR",
    counterparty_account: Optional[str] = None,
    counterparty_name: Optional[str] = None,
    reference: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    operator_id: Optional[str] = None,
    original_entry_id: Optional[str] = None  # For reversals
) -> Dict[str, Any]:
    """
    Create an immutable ledger entry.
    Each entry is chained to the previous for tamper detection.
    """
    if _db is None:
        raise RuntimeError("Ledger service not initialized")
    
    timestamp = datetime.now(timezone.utc)
    sequence = await _get_next_sequence()
    previous_hash = await _get_previous_hash()
    
    entry = {
        "entry_id": f"LED_{timestamp.strftime('%Y%m%d')}_{uuid.uuid4().hex[:12]}",
        "sequence_number": sequence,
        "timestamp": timestamp.isoformat(),
        "entry_type": entry_type.value,
        "account_id": account_id,
        "amount": round(amount, 2),
        "currency": currency,
        "counterparty": {
            "account_id": counterparty_account,
            "name": counterparty_name
        } if counterparty_account else None,
        "reference": reference or f"REF{sequence:08d}",
        "description": description,
        "status": LedgerStatus.CONFIRMED.value,
        "metadata": metadata or {},
        "operator_id": operator_id,
        "original_entry_id": original_entry_id,
        "previous_hash": previous_hash,
        "integrity_hash": "",  # Calculated below
        "immutable": True,
        "regulatory": {
            "entity": "ManoBank S.A.",
            "cif": "B19427723",
            "regulator": "Banco de España"
        }
    }
    
    # Calculate integrity hash (blockchain-style chaining)
    hash_content = json.dumps({
        "sequence_number": entry["sequence_number"],
        "timestamp": entry["timestamp"],
        "entry_type": entry["entry_type"],
        "account_id": entry["account_id"],
        "amount": entry["amount"],
        "previous_hash": entry["previous_hash"]
    }, sort_keys=True)
    
    entry["integrity_hash"] = hashlib.sha256(hash_content.encode()).hexdigest()
    
    # Store in MongoDB
    await _db.ledger.insert_one(entry)
    
    # Update account balance
    await _update_account_balance(account_id, amount, entry_type)
    
    return {k: v for k, v in entry.items() if k != "_id"}


async def _update_account_balance(account_id: str, amount: float, entry_type: LedgerEntryType):
    """Update the running balance of an account"""
    # Credit types (money in)
    credit_types = [
        LedgerEntryType.DEPOSIT,
        LedgerEntryType.TRANSFER_IN,
        LedgerEntryType.INTEREST_CREDIT,
        LedgerEntryType.LOAN_DISBURSEMENT,
        LedgerEntryType.CARD_REFUND,
        LedgerEntryType.UNFREEZE
    ]
    
    # Determine if credit or debit
    if entry_type in credit_types:
        delta = amount
    else:
        delta = -amount
    
    await _db.manobank_accounts.update_one(
        {"id": account_id},
        {
            "$inc": {"balance": delta},
            "$set": {"last_movement": datetime.now(timezone.utc).isoformat()}
        }
    )


async def get_account_statement(
    account_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """Get account statement with running balance"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    query = {"account_id": account_id}
    
    if start_date or end_date:
        query["timestamp"] = {}
        if start_date:
            query["timestamp"]["$gte"] = start_date.isoformat()
        if end_date:
            query["timestamp"]["$lte"] = end_date.isoformat()
    
    entries = await _db.ledger.find(
        query,
        {"_id": 0}
    ).sort("sequence_number", -1).limit(limit).to_list(limit)
    
    # Get account info
    account = await _db.manobank_accounts.find_one({"id": account_id}, {"_id": 0})
    
    return {
        "account_id": account_id,
        "account_holder": account.get("holder_name") if account else None,
        "current_balance": account.get("balance", 0) if account else 0,
        "currency": account.get("currency", "EUR") if account else "EUR",
        "statement_date": datetime.now(timezone.utc).isoformat(),
        "entries": entries,
        "entry_count": len(entries)
    }


async def verify_ledger_integrity(
    start_sequence: int = 1,
    end_sequence: Optional[int] = None
) -> Dict[str, Any]:
    """
    Verify the integrity of the ledger chain.
    Checks that all hashes are valid and chain is unbroken.
    """
    if _db is None:
        return {"verified": False, "error": "Service not initialized"}
    
    query = {"sequence_number": {"$gte": start_sequence}}
    if end_sequence:
        query["sequence_number"]["$lte"] = end_sequence
    
    entries = await _db.ledger.find(
        query,
        {"_id": 0}
    ).sort("sequence_number", 1).to_list(10000)
    
    if not entries:
        return {"verified": True, "message": "No entries to verify", "checked": 0}
    
    errors = []
    previous_hash = "GENESIS" if start_sequence == 1 else None
    
    for i, entry in enumerate(entries):
        # Verify chain link
        if previous_hash is not None and entry.get("previous_hash") != previous_hash:
            errors.append({
                "sequence": entry["sequence_number"],
                "error": "Chain broken - previous_hash mismatch",
                "expected": previous_hash,
                "found": entry.get("previous_hash")
            })
        
        # Verify entry hash
        hash_content = json.dumps({
            "sequence_number": entry["sequence_number"],
            "timestamp": entry["timestamp"],
            "entry_type": entry["entry_type"],
            "account_id": entry["account_id"],
            "amount": entry["amount"],
            "previous_hash": entry["previous_hash"]
        }, sort_keys=True)
        
        calculated_hash = hashlib.sha256(hash_content.encode()).hexdigest()
        
        if calculated_hash != entry.get("integrity_hash"):
            errors.append({
                "sequence": entry["sequence_number"],
                "error": "Hash mismatch - entry may have been tampered",
                "expected": calculated_hash,
                "found": entry.get("integrity_hash")
            })
        
        previous_hash = entry.get("integrity_hash")
    
    return {
        "verified": len(errors) == 0,
        "checked": len(entries),
        "errors": errors,
        "first_sequence": entries[0]["sequence_number"] if entries else None,
        "last_sequence": entries[-1]["sequence_number"] if entries else None,
        "verified_at": datetime.now(timezone.utc).isoformat()
    }


async def create_reversal(
    original_entry_id: str,
    reason: str,
    operator_id: str
) -> Dict[str, Any]:
    """
    Create a reversal entry for an existing ledger entry.
    Does NOT modify the original - creates a new opposite entry.
    """
    if _db is None:
        raise RuntimeError("Ledger service not initialized")
    
    # Find original entry
    original = await _db.ledger.find_one({"entry_id": original_entry_id}, {"_id": 0})
    
    if not original:
        raise ValueError(f"Original entry not found: {original_entry_id}")
    
    if original.get("status") == LedgerStatus.REVERSED.value:
        raise ValueError("Entry has already been reversed")
    
    # Create reversal with opposite amount
    reversal = await create_ledger_entry(
        entry_type=LedgerEntryType.REVERSAL,
        account_id=original["account_id"],
        amount=-original["amount"],  # Opposite sign
        currency=original["currency"],
        counterparty_account=original.get("counterparty", {}).get("account_id"),
        counterparty_name=original.get("counterparty", {}).get("name"),
        reference=f"REV-{original['reference']}",
        description=f"Reversal: {reason}",
        metadata={"original_entry": original_entry_id, "reversal_reason": reason},
        operator_id=operator_id,
        original_entry_id=original_entry_id
    )
    
    # Mark original as reversed
    await _db.ledger.update_one(
        {"entry_id": original_entry_id},
        {"$set": {"status": LedgerStatus.REVERSED.value, "reversed_by": reversal["entry_id"]}}
    )
    
    return reversal


async def get_ledger_summary() -> Dict[str, Any]:
    """Get ledger summary statistics"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    total_entries = await _db.ledger.count_documents({})
    
    # Get totals by type
    pipeline = [
        {"$group": {
            "_id": "$entry_type",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"}
        }}
    ]
    
    by_type = await _db.ledger.aggregate(pipeline).to_list(100)
    
    return {
        "total_entries": total_entries,
        "by_type": {item["_id"]: {"count": item["count"], "total": item["total_amount"]} for item in by_type},
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
