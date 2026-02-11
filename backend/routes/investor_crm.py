"""
ManoProtect - Investor CRM (Internal)
Free internal CRM to track investor interactions and document downloads
"""
from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from core.auth import require_auth

router = APIRouter(prefix="/investor-crm", tags=["Investor CRM"])
_db = None

def init_db(db):
    global _db
    _db = db


# Models
class InvestorNote(BaseModel):
    investor_id: str
    note: str
    note_type: str = "general"  # general, meeting, call, email, follow_up


class InvestorStatus(BaseModel):
    investor_id: str
    status: str  # lead, contacted, interested, negotiating, committed, declined


class InvestorTag(BaseModel):
    investor_id: str
    tag: str


# API Endpoints
@router.get("/dashboard")
async def get_crm_dashboard(request: Request):
    """Get CRM dashboard overview"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    # Check if user is admin
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores pueden acceder al CRM")
    
    try:
        # Total investors (users who accessed investor section)
        total_investors = await _db.investor_access_logs.distinct("user_id")
        
        # Downloads by document
        pipeline = [
            {"$group": {
                "_id": "$doc_type",
                "count": {"$sum": 1}
            }}
        ]
        downloads_by_doc = await _db.document_downloads.aggregate(pipeline).to_list(10)
        
        # Recent activity
        recent_downloads = await _db.document_downloads.find(
            {},
            {"_id": 0}
        ).sort("downloaded_at", -1).limit(10).to_list(10)
        
        # Total downloads
        total_downloads = await _db.document_downloads.count_documents({})
        
        # Downloads today
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
        downloads_today = await _db.document_downloads.count_documents({
            "downloaded_at": {"$gte": today.isoformat()}
        })
        
        # Get investor statuses
        status_pipeline = [
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        statuses = await _db.investor_statuses.aggregate(status_pipeline).to_list(10)
        
        return {
            "total_investors": len(total_investors),
            "total_downloads": total_downloads,
            "downloads_today": downloads_today,
            "downloads_by_document": {d["_id"]: d["count"] for d in downloads_by_doc},
            "investor_statuses": {s["_id"]: s["count"] for s in statuses} if statuses else {},
            "recent_activity": recent_downloads
        }
    except Exception as e:
        return {
            "total_investors": 0,
            "total_downloads": 0,
            "downloads_today": 0,
            "downloads_by_document": {},
            "investor_statuses": {},
            "recent_activity": []
        }


@router.get("/investors")
async def get_all_investors(
    request: Request,
    status: Optional[str] = None,
    limit: int = 50
):
    """Get list of all investors with their activity"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    try:
        # Get all users who have downloaded documents
        pipeline = [
            {"$group": {
                "_id": "$user_id",
                "total_downloads": {"$sum": 1},
                "last_download": {"$max": "$downloaded_at"},
                "documents": {"$addToSet": "$doc_type"}
            }},
            {"$sort": {"last_download": -1}},
            {"$limit": limit}
        ]
        
        investors = await _db.document_downloads.aggregate(pipeline).to_list(limit)
        
        # Enrich with user data and status
        enriched = []
        for inv in investors:
            user_data = await _db.users.find_one(
                {"user_id": inv["_id"]},
                {"_id": 0, "email": 1, "full_name": 1, "created_at": 1}
            )
            
            status_data = await _db.investor_statuses.find_one(
                {"investor_id": inv["_id"]},
                {"_id": 0}
            )
            
            notes_count = await _db.investor_notes.count_documents({"investor_id": inv["_id"]})
            tags = await _db.investor_tags.find(
                {"investor_id": inv["_id"]},
                {"_id": 0, "tag": 1}
            ).to_list(20)
            
            enriched.append({
                "investor_id": inv["_id"],
                "email": user_data.get("email") if user_data else "Unknown",
                "name": user_data.get("full_name") if user_data else "Unknown",
                "total_downloads": inv["total_downloads"],
                "last_download": inv["last_download"],
                "documents_accessed": inv["documents"],
                "status": status_data.get("status") if status_data else "lead",
                "notes_count": notes_count,
                "tags": [t["tag"] for t in tags],
                "registered_at": user_data.get("created_at") if user_data else None
            })
        
        # Filter by status if specified
        if status:
            enriched = [i for i in enriched if i["status"] == status]
        
        return {
            "investors": enriched,
            "total_count": len(enriched)
        }
    except Exception as e:
        return {"investors": [], "total_count": 0}


@router.get("/investors/{investor_id}")
async def get_investor_detail(investor_id: str, request: Request):
    """Get detailed information about a specific investor"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    # Get user data
    user_data = await _db.users.find_one(
        {"user_id": investor_id},
        {"_id": 0}
    )
    
    # Get all downloads
    downloads = await _db.document_downloads.find(
        {"user_id": investor_id},
        {"_id": 0}
    ).sort("downloaded_at", -1).to_list(100)
    
    # Get notes
    notes = await _db.investor_notes.find(
        {"investor_id": investor_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Get status
    status = await _db.investor_statuses.find_one(
        {"investor_id": investor_id},
        {"_id": 0}
    )
    
    # Get tags
    tags = await _db.investor_tags.find(
        {"investor_id": investor_id},
        {"_id": 0, "tag": 1}
    ).to_list(20)
    
    # Calculate engagement score
    engagement_score = min(100, len(downloads) * 10 + len(notes) * 5)
    
    return {
        "investor_id": investor_id,
        "user_info": user_data,
        "downloads": downloads,
        "notes": notes,
        "status": status.get("status") if status else "lead",
        "tags": [t["tag"] for t in tags],
        "engagement_score": engagement_score,
        "total_downloads": len(downloads)
    }


@router.post("/investors/{investor_id}/status")
async def update_investor_status(investor_id: str, data: InvestorStatus, request: Request):
    """Update investor status"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    valid_statuses = ['lead', 'contacted', 'interested', 'negotiating', 'committed', 'declined']
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado invalido. Usa: {valid_statuses}")
    
    await _db.investor_statuses.update_one(
        {"investor_id": investor_id},
        {
            "$set": {
                "status": data.status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": user.user_id
            }
        },
        upsert=True
    )
    
    # Log status change
    await _db.investor_activity.insert_one({
        "investor_id": investor_id,
        "action": "status_change",
        "new_status": data.status,
        "performed_by": user.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "status": data.status}


@router.post("/investors/{investor_id}/notes")
async def add_investor_note(investor_id: str, data: InvestorNote, request: Request):
    """Add a note to an investor"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    note_doc = {
        "investor_id": investor_id,
        "note": data.note,
        "note_type": data.note_type,
        "created_by": user.user_id,
        "created_by_name": user.full_name or user.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await _db.investor_notes.insert_one(note_doc)
    
    return {"success": True, "note": note_doc}


@router.delete("/investors/{investor_id}/notes/{note_index}")
async def delete_investor_note(investor_id: str, note_index: int, request: Request):
    """Delete a note (by index in sorted list)"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    # Get all notes sorted
    notes = await _db.investor_notes.find(
        {"investor_id": investor_id}
    ).sort("created_at", -1).to_list(100)
    
    if note_index < 0 or note_index >= len(notes):
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    
    note_to_delete = notes[note_index]
    await _db.investor_notes.delete_one({"_id": note_to_delete["_id"]})
    
    return {"success": True}


@router.post("/investors/{investor_id}/tags")
async def add_investor_tag(investor_id: str, data: InvestorTag, request: Request):
    """Add a tag to an investor"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    # Check if tag already exists
    existing = await _db.investor_tags.find_one({
        "investor_id": investor_id,
        "tag": data.tag.lower()
    })
    
    if existing:
        return {"success": True, "message": "Tag ya existe"}
    
    await _db.investor_tags.insert_one({
        "investor_id": investor_id,
        "tag": data.tag.lower(),
        "added_by": user.user_id,
        "added_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "tag": data.tag.lower()}


@router.delete("/investors/{investor_id}/tags/{tag}")
async def remove_investor_tag(investor_id: str, tag: str, request: Request):
    """Remove a tag from an investor"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    await _db.investor_tags.delete_one({
        "investor_id": investor_id,
        "tag": tag.lower()
    })
    
    return {"success": True}


@router.get("/analytics")
async def get_crm_analytics(request: Request, days: int = 30):
    """Get CRM analytics for a time period"""
    session_token = request.cookies.get("session_token")
    user = await require_auth(request, session_token)
    
    if user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    since = datetime.now(timezone.utc) - timedelta(days=days)
    since_str = since.isoformat()
    
    try:
        # Downloads over time
        pipeline = [
            {"$match": {"downloaded_at": {"$gte": since_str}}},
            {"$group": {
                "_id": {"$substr": ["$downloaded_at", 0, 10]},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        downloads_timeline = await _db.document_downloads.aggregate(pipeline).to_list(days)
        
        # Most popular documents
        doc_pipeline = [
            {"$match": {"downloaded_at": {"$gte": since_str}}},
            {"$group": {
                "_id": "$doc_type",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        popular_docs = await _db.document_downloads.aggregate(doc_pipeline).to_list(10)
        
        # Conversion funnel
        total_leads = await _db.investor_statuses.count_documents({"status": "lead"})
        contacted = await _db.investor_statuses.count_documents({"status": "contacted"})
        interested = await _db.investor_statuses.count_documents({"status": "interested"})
        negotiating = await _db.investor_statuses.count_documents({"status": "negotiating"})
        committed = await _db.investor_statuses.count_documents({"status": "committed"})
        
        return {
            "period_days": days,
            "downloads_timeline": [{"date": d["_id"], "count": d["count"]} for d in downloads_timeline],
            "popular_documents": [{"doc_type": d["_id"], "downloads": d["count"]} for d in popular_docs],
            "conversion_funnel": {
                "leads": total_leads,
                "contacted": contacted,
                "interested": interested,
                "negotiating": negotiating,
                "committed": committed
            }
        }
    except:
        return {
            "period_days": days,
            "downloads_timeline": [],
            "popular_documents": [],
            "conversion_funnel": {}
        }
