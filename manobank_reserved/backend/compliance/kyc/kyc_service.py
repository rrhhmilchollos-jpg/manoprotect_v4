"""
ManoBank S.A. - KYC (Know Your Customer) Service
Complete KYC workflow management for regulatory compliance
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid


class KYCStatus(str, Enum):
    INITIATED = "initiated"
    DOCUMENTS_PENDING = "documents_pending"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    UNDER_REVIEW = "under_review"
    VIDEO_SCHEDULED = "video_scheduled"
    VIDEO_COMPLETED = "video_completed"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    BLOCKED = "blocked"


class DocumentType(str, Enum):
    DNI = "dni"
    NIE = "nie"
    PASSPORT = "passport"
    DRIVING_LICENSE = "driving_license"
    RESIDENCE_PERMIT = "residence_permit"
    PROOF_OF_ADDRESS = "proof_of_address"
    BANK_STATEMENT = "bank_statement"
    TAX_RETURN = "tax_return"
    PAYSLIP = "payslip"
    SELFIE = "selfie"
    SELFIE_WITH_ID = "selfie_with_id"


class VerificationLevel(str, Enum):
    BASIC = "basic"  # Name, email only
    STANDARD = "standard"  # ID verified
    ENHANCED = "enhanced"  # ID + video + address
    FULL = "full"  # Everything + source of funds


# Database reference
_db = None


def init_kyc_service(db):
    """Initialize KYC service with database connection"""
    global _db
    _db = db
    print("✅ KYC Service initialized")


async def initiate_kyc(
    customer_id: str,
    customer_name: str,
    customer_email: str,
    verification_level: VerificationLevel = VerificationLevel.STANDARD,
    required_documents: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Initiate a KYC verification process for a customer.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    # Default required documents based on level
    if required_documents is None:
        if verification_level == VerificationLevel.BASIC:
            required_documents = []
        elif verification_level == VerificationLevel.STANDARD:
            required_documents = [DocumentType.DNI.value, DocumentType.SELFIE.value]
        elif verification_level == VerificationLevel.ENHANCED:
            required_documents = [
                DocumentType.DNI.value, 
                DocumentType.SELFIE_WITH_ID.value,
                DocumentType.PROOF_OF_ADDRESS.value
            ]
        else:  # FULL
            required_documents = [
                DocumentType.DNI.value,
                DocumentType.SELFIE_WITH_ID.value,
                DocumentType.PROOF_OF_ADDRESS.value,
                DocumentType.BANK_STATEMENT.value
            ]
    
    kyc_process = {
        "kyc_id": f"KYC_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:12]}",
        "customer_id": customer_id,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "verification_level": verification_level.value,
        "status": KYCStatus.INITIATED.value,
        "required_documents": required_documents,
        "submitted_documents": [],
        "video_verification": {
            "required": verification_level in [VerificationLevel.ENHANCED, VerificationLevel.FULL],
            "scheduled_at": None,
            "completed_at": None,
            "result": None,
            "recording_url": None
        },
        "risk_assessment": {
            "score": None,
            "level": None,
            "factors": []
        },
        "timeline": [
            {
                "event": "KYC_INITIATED",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "details": f"Verification level: {verification_level.value}"
            }
        ],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_by": None,
        "review_notes": None
    }
    
    await _db.kyc_processes.insert_one(kyc_process)
    
    # Update customer status
    await _db.manobank_customers.update_one(
        {"id": customer_id},
        {"$set": {
            "kyc_status": KYCStatus.INITIATED.value,
            "kyc_id": kyc_process["kyc_id"]
        }}
    )
    
    return {k: v for k, v in kyc_process.items() if k != "_id"}


async def submit_document(
    kyc_id: str,
    document_type: DocumentType,
    document_url: str,
    document_number: Optional[str] = None,
    expiry_date: Optional[str] = None,
    metadata: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Submit a document for KYC verification.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    document = {
        "document_id": f"DOC_{uuid.uuid4().hex[:12]}",
        "document_type": document_type.value,
        "document_url": document_url,
        "document_number": document_number,
        "expiry_date": expiry_date,
        "metadata": metadata or {},
        "verification_status": "pending",
        "verification_result": None,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Add to KYC process
    result = await _db.kyc_processes.update_one(
        {"kyc_id": kyc_id},
        {
            "$push": {
                "submitted_documents": document,
                "timeline": {
                    "event": "DOCUMENT_SUBMITTED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": f"Document type: {document_type.value}"
                }
            },
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    if result.matched_count == 0:
        raise ValueError(f"KYC process not found: {kyc_id}")
    
    # Check if all documents submitted
    await _check_and_update_status(kyc_id)
    
    return document


async def _check_and_update_status(kyc_id: str):
    """Check if all required documents are submitted and update status"""
    kyc = await _db.kyc_processes.find_one({"kyc_id": kyc_id}, {"_id": 0})
    
    if not kyc:
        return
    
    required = set(kyc.get("required_documents", []))
    submitted = set(d["document_type"] for d in kyc.get("submitted_documents", []))
    
    if required.issubset(submitted):
        new_status = KYCStatus.DOCUMENTS_SUBMITTED.value
        if kyc.get("video_verification", {}).get("required"):
            new_status = KYCStatus.VIDEO_SCHEDULED.value
        else:
            new_status = KYCStatus.UNDER_REVIEW.value
        
        await _db.kyc_processes.update_one(
            {"kyc_id": kyc_id},
            {
                "$set": {"status": new_status},
                "$push": {
                    "timeline": {
                        "event": "STATUS_CHANGED",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "details": f"All documents submitted. New status: {new_status}"
                    }
                }
            }
        )


async def verify_document(
    kyc_id: str,
    document_id: str,
    verified: bool,
    verification_notes: Optional[str] = None,
    operator_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Manually verify a submitted document.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    kyc = await _db.kyc_processes.find_one({"kyc_id": kyc_id}, {"_id": 0})
    
    if not kyc:
        raise ValueError(f"KYC process not found: {kyc_id}")
    
    # Find and update document
    documents = kyc.get("submitted_documents", [])
    doc_index = None
    
    for i, doc in enumerate(documents):
        if doc["document_id"] == document_id:
            doc_index = i
            break
    
    if doc_index is None:
        raise ValueError(f"Document not found: {document_id}")
    
    documents[doc_index]["verification_status"] = "verified" if verified else "rejected"
    documents[doc_index]["verification_result"] = {
        "verified": verified,
        "notes": verification_notes,
        "verified_by": operator_id,
        "verified_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.kyc_processes.update_one(
        {"kyc_id": kyc_id},
        {
            "$set": {
                "submitted_documents": documents,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "timeline": {
                    "event": "DOCUMENT_VERIFIED" if verified else "DOCUMENT_REJECTED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": f"Document {document_id}: {verification_notes or 'No notes'}"
                }
            }
        }
    )
    
    return {"document_id": document_id, "verified": verified}


async def complete_video_verification(
    kyc_id: str,
    passed: bool,
    recording_url: Optional[str] = None,
    notes: Optional[str] = None,
    operator_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Record the result of video verification.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    video_result = {
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "result": "passed" if passed else "failed",
        "recording_url": recording_url,
        "notes": notes,
        "verified_by": operator_id
    }
    
    new_status = KYCStatus.VIDEO_COMPLETED.value if passed else KYCStatus.REJECTED.value
    
    await _db.kyc_processes.update_one(
        {"kyc_id": kyc_id},
        {
            "$set": {
                "video_verification.completed_at": video_result["completed_at"],
                "video_verification.result": video_result["result"],
                "video_verification.recording_url": recording_url,
                "status": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "timeline": {
                    "event": "VIDEO_COMPLETED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": f"Video verification {'passed' if passed else 'failed'}"
                }
            }
        }
    )
    
    return {"kyc_id": kyc_id, "video_result": video_result}


async def approve_kyc(
    kyc_id: str,
    operator_id: str,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Approve a KYC verification process.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    kyc = await _db.kyc_processes.find_one({"kyc_id": kyc_id}, {"_id": 0})
    
    if not kyc:
        raise ValueError(f"KYC process not found: {kyc_id}")
    
    await _db.kyc_processes.update_one(
        {"kyc_id": kyc_id},
        {
            "$set": {
                "status": KYCStatus.APPROVED.value,
                "reviewed_by": operator_id,
                "review_notes": notes,
                "approved_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "timeline": {
                    "event": "KYC_APPROVED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": f"Approved by {operator_id}"
                }
            }
        }
    )
    
    # Update customer
    await _db.manobank_customers.update_one(
        {"id": kyc["customer_id"]},
        {"$set": {
            "kyc_verified": True,
            "kyc_status": KYCStatus.APPROVED.value,
            "kyc_verified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "kyc_id": kyc_id,
        "status": KYCStatus.APPROVED.value,
        "customer_id": kyc["customer_id"]
    }


async def reject_kyc(
    kyc_id: str,
    operator_id: str,
    reason: str
) -> Dict[str, Any]:
    """
    Reject a KYC verification process.
    """
    if _db is None:
        raise RuntimeError("KYC service not initialized")
    
    kyc = await _db.kyc_processes.find_one({"kyc_id": kyc_id}, {"_id": 0})
    
    if not kyc:
        raise ValueError(f"KYC process not found: {kyc_id}")
    
    await _db.kyc_processes.update_one(
        {"kyc_id": kyc_id},
        {
            "$set": {
                "status": KYCStatus.REJECTED.value,
                "reviewed_by": operator_id,
                "review_notes": reason,
                "rejected_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "timeline": {
                    "event": "KYC_REJECTED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "details": f"Rejected by {operator_id}: {reason}"
                }
            }
        }
    )
    
    # Update customer
    await _db.manobank_customers.update_one(
        {"id": kyc["customer_id"]},
        {"$set": {
            "kyc_verified": False,
            "kyc_status": KYCStatus.REJECTED.value
        }}
    )
    
    return {
        "kyc_id": kyc_id,
        "status": KYCStatus.REJECTED.value,
        "reason": reason
    }


async def get_kyc_status(kyc_id: str) -> Dict[str, Any]:
    """Get current KYC status and details"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    kyc = await _db.kyc_processes.find_one({"kyc_id": kyc_id}, {"_id": 0})
    
    if not kyc:
        raise ValueError(f"KYC process not found: {kyc_id}")
    
    return kyc


async def get_pending_kyc_reviews(limit: int = 50) -> List[Dict[str, Any]]:
    """Get KYC processes pending review"""
    if _db is None:
        return []
    
    pending_statuses = [
        KYCStatus.DOCUMENTS_SUBMITTED.value,
        KYCStatus.UNDER_REVIEW.value,
        KYCStatus.VIDEO_COMPLETED.value
    ]
    
    kycs = await _db.kyc_processes.find(
        {"status": {"$in": pending_statuses}},
        {"_id": 0}
    ).sort("created_at", 1).limit(limit).to_list(limit)
    
    return kycs


async def get_kyc_dashboard() -> Dict[str, Any]:
    """Get KYC dashboard statistics"""
    if _db is None:
        return {"error": "Service not initialized"}
    
    # Count by status
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await _db.kyc_processes.aggregate(pipeline).to_list(20)
    
    # Today's submissions
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await _db.kyc_processes.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    # Pending reviews
    pending = await _db.kyc_processes.count_documents({
        "status": {"$in": ["documents_submitted", "under_review", "video_completed"]}
    })
    
    # Average processing time (for approved KYCs)
    pipeline = [
        {"$match": {"status": "approved", "approved_at": {"$exists": True}}},
        {"$project": {
            "processing_days": {
                "$divide": [
                    {"$subtract": [
                        {"$dateFromString": {"dateString": "$approved_at"}},
                        {"$dateFromString": {"dateString": "$created_at"}}
                    ]},
                    86400000  # milliseconds in a day
                ]
            }
        }},
        {"$group": {"_id": None, "avg_days": {"$avg": "$processing_days"}}}
    ]
    
    avg_result = await _db.kyc_processes.aggregate(pipeline).to_list(1)
    avg_processing_days = avg_result[0]["avg_days"] if avg_result else None
    
    return {
        "by_status": {item["_id"]: item["count"] for item in status_counts},
        "today_submissions": today_count,
        "pending_review": pending,
        "avg_processing_days": round(avg_processing_days, 1) if avg_processing_days else None,
        "total_processes": await _db.kyc_processes.count_documents({}),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
