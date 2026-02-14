"""
ManoProtect - User Reviews/Ratings System
API routes for customer reviews and ratings
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, Query
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# Database reference
db = None

def set_database(database):
    global db
    db = database
    print(f"✅ Reviews routes initialized: {db is not None}")


# ============================================
# MODELS
# ============================================

class ReviewCreate(BaseModel):
    """Model for creating a new review"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    title: Optional[str] = Field(None, max_length=100, description="Review title")
    comment: str = Field(..., min_length=10, max_length=1000, description="Review comment")
    
    @field_validator('comment')
    @classmethod
    def validate_comment(cls, v):
        if v and len(v.strip()) < 10:
            raise ValueError('El comentario debe tener al menos 10 caracteres')
        return v.strip()


class ReviewResponse(BaseModel):
    """Public review response model"""
    review_id: str
    user_name: str
    user_initial: str
    user_plan: str
    rating: int
    title: Optional[str]
    comment: str
    created_at: str
    verified: bool
    location: Optional[str]


# ============================================
# PUBLIC ENDPOINTS (No auth required)
# ============================================

@router.get("/public")
async def get_public_reviews(
    limit: int = Query(10, ge=1, le=50),
    min_rating: int = Query(1, ge=1, le=5)
):
    """
    Get public reviews for landing page
    Returns only approved reviews with user privacy protected
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get approved reviews sorted by rating and date
    reviews = await db.user_reviews.find(
        {
            "status": "approved",
            "rating": {"$gte": min_rating}
        },
        {"_id": 0}
    ).sort([("rating", -1), ("created_at", -1)]).limit(limit).to_list(limit)
    
    # Format for public display
    public_reviews = []
    for review in reviews:
        public_reviews.append({
            "review_id": review.get("review_id"),
            "user_name": review.get("display_name", "Usuario verificado"),
            "user_initial": review.get("user_initial", "U"),
            "user_plan": review.get("user_plan_display", "Premium"),
            "rating": review.get("rating", 5),
            "title": review.get("title"),
            "comment": review.get("comment"),
            "created_at": review.get("created_at"),
            "verified": review.get("verified", False),
            "location": review.get("location")
        })
    
    return {
        "reviews": public_reviews,
        "total": len(public_reviews)
    }


@router.get("/stats")
async def get_reviews_stats():
    """
    Get review statistics for landing page
    Returns average rating, total reviews, and distribution
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get aggregated stats
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {
            "_id": None,
            "average_rating": {"$avg": "$rating"},
            "total_reviews": {"$sum": 1},
            "five_stars": {"$sum": {"$cond": [{"$eq": ["$rating", 5]}, 1, 0]}},
            "four_stars": {"$sum": {"$cond": [{"$eq": ["$rating", 4]}, 1, 0]}},
            "three_stars": {"$sum": {"$cond": [{"$eq": ["$rating", 3]}, 1, 0]}},
            "two_stars": {"$sum": {"$cond": [{"$eq": ["$rating", 2]}, 1, 0]}},
            "one_star": {"$sum": {"$cond": [{"$eq": ["$rating", 1]}, 1, 0]}}
        }}
    ]
    
    result = await db.user_reviews.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "average_rating": 0,
            "total_reviews": 0,
            "distribution": {
                "five_stars": 0,
                "four_stars": 0,
                "three_stars": 0,
                "two_stars": 0,
                "one_star": 0
            }
        }
    
    stats = result[0]
    return {
        "average_rating": round(stats.get("average_rating", 0), 1),
        "total_reviews": stats.get("total_reviews", 0),
        "distribution": {
            "five_stars": stats.get("five_stars", 0),
            "four_stars": stats.get("four_stars", 0),
            "three_stars": stats.get("three_stars", 0),
            "two_stars": stats.get("two_stars", 0),
            "one_star": stats.get("one_star", 0)
        }
    }


# ============================================
# AUTHENTICATED ENDPOINTS
# ============================================

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current logged in user from session"""
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    user = await db.users.find_one(
        {"session_token": session_token},
        {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return user


# Lista de planes de pago válidos (excluye "free")
PAID_PLANS = [
    "personal", "personal-monthly", "personal-quarterly", "personal-yearly",
    "family", "family-monthly", "family-quarterly", "family-yearly",
    "business", "business-monthly", "business-yearly",
    "enterprise", "enterprise-monthly", "enterprise-yearly",
    "weekly", "monthly", "quarterly", "yearly"
]


@router.post("")
async def create_review(
    data: ReviewCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Create a new review (ONLY for users with paid subscription)
    Free users cannot leave reviews
    """
    user = await get_current_user(request, session_token)
    user_id = user.get("user_id") or user.get("id")
    
    # Check if user has a PAID subscription - BLOCK free users
    user_plan = user.get("plan", "free")
    is_premium = user_plan in PAID_PLANS
    
    if not is_premium:
        raise HTTPException(
            status_code=403, 
            detail="Solo los usuarios con suscripción de pago pueden dejar valoraciones. Actualiza tu plan para compartir tu experiencia."
        )
    
    # Check if user already has a review
    existing = await db.user_reviews.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Ya has dejado una valoración. Puedes editarla desde tu perfil."
        )
    
    # Create display name (privacy protected)
    user_name = user.get("name", "Usuario")
    name_parts = user_name.split()
    if len(name_parts) >= 2:
        display_name = f"{name_parts[0]} {name_parts[-1][0]}."
    else:
        display_name = f"{name_parts[0]}" if name_parts else "Usuario"
    
    # Get user initial for avatar
    user_initial = user_name[0].upper() if user_name else "U"
    
    # Format plan name for display
    plan_display_map = {
        "free": "Gratuito",
        "personal": "Personal",
        "personal-monthly": "Personal",
        "personal-yearly": "Personal",
        "family": "Familiar",
        "family-monthly": "Familiar",
        "family-quarterly": "Familiar",
        "family-yearly": "Familiar Premium",
        "business": "Business",
        "enterprise": "Enterprise"
    }
    user_plan_display = plan_display_map.get(user_plan, "Premium")
    
    # Create review
    review = {
        "review_id": f"rev_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "user_email": user.get("email"),
        "user_name": user_name,  # Private
        "display_name": display_name,  # Public
        "user_initial": user_initial,
        "user_plan": user_plan,
        "user_plan_display": user_plan_display,
        "rating": data.rating,
        "title": data.title,
        "comment": data.comment,
        "verified": is_premium,  # Premium users get verified badge
        "location": user.get("location") or user.get("city"),
        "status": "approved" if is_premium else "pending",  # Auto-approve premium users
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_reviews.insert_one(review)
    
    # Remove private fields from response
    review.pop("user_email", None)
    review.pop("user_name", None)
    
    return {
        "success": True,
        "message": "¡Gracias por tu valoración!" if is_premium else "Tu valoración está pendiente de revisión",
        "review": {k: v for k, v in review.items() if k != "_id"}
    }


@router.get("/my-review")
async def get_my_review(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current user's review"""
    user = await get_current_user(request, session_token)
    user_id = user.get("user_id") or user.get("id")
    
    review = await db.user_reviews.find_one(
        {"user_id": user_id},
        {"_id": 0, "user_email": 0}
    )
    
    if not review:
        return {"review": None}
    
    return {"review": review}


@router.put("/my-review")
async def update_my_review(
    data: ReviewCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update current user's review"""
    user = await get_current_user(request, session_token)
    user_id = user.get("user_id") or user.get("id")
    
    existing = await db.user_reviews.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="No tienes ninguna valoración")
    
    # Premium users stay approved, others go back to pending
    user_plan = user.get("plan", "free")
    is_premium = user_plan != "free"
    
    update_data = {
        "rating": data.rating,
        "title": data.title,
        "comment": data.comment,
        "status": "approved" if is_premium else "pending",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_reviews.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": "Valoración actualizada correctamente"
    }


@router.delete("/my-review")
async def delete_my_review(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete current user's review"""
    user = await get_current_user(request, session_token)
    user_id = user.get("user_id") or user.get("id")
    
    result = await db.user_reviews.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No tienes ninguna valoración")
    
    return {
        "success": True,
        "message": "Valoración eliminada"
    }


# ============================================
# ENTERPRISE ADMIN ENDPOINTS
# ============================================

async def get_enterprise_employee(request: Request, enterprise_session: Optional[str] = Cookie(None)):
    """Get current enterprise employee from session"""
    if not enterprise_session:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    employee = await db.enterprise_employees.find_one(
        {"session_token": enterprise_session},
        {"_id": 0, "password_hash": 0}
    )
    if not employee:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    return employee


@router.get("/admin/all")
async def get_all_reviews_admin(
    request: Request,
    enterprise_session: Optional[str] = Cookie(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all reviews for enterprise admin"""
    employee = await get_enterprise_employee(request, enterprise_session)
    
    query = {}
    if status:
        query["status"] = status
    
    total = await db.user_reviews.count_documents(query)
    skip = (page - 1) * limit
    
    reviews = await db.user_reviews.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.patch("/admin/{review_id}/approve")
async def approve_review(
    review_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Approve a pending review"""
    employee = await get_enterprise_employee(request, enterprise_session)
    
    result = await db.user_reviews.update_one(
        {"review_id": review_id},
        {"$set": {
            "status": "approved",
            "approved_by": employee.get("employee_id"),
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Valoración no encontrada")
    
    return {"success": True, "message": "Valoración aprobada"}


@router.patch("/admin/{review_id}/reject")
async def reject_review(
    review_id: str,
    reason: str = Query(..., min_length=5),
    request: Request = None,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Reject a review with reason"""
    employee = await get_enterprise_employee(request, enterprise_session)
    
    result = await db.user_reviews.update_one(
        {"review_id": review_id},
        {"$set": {
            "status": "rejected",
            "rejected_by": employee.get("employee_id"),
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejection_reason": reason
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Valoración no encontrada")
    
    return {"success": True, "message": "Valoración rechazada"}


@router.delete("/admin/{review_id}")
async def delete_review_admin(
    review_id: str,
    request: Request,
    enterprise_session: Optional[str] = Cookie(None)
):
    """Delete a review (admin only)"""
    employee = await get_enterprise_employee(request, enterprise_session)
    
    # Only super_admin and admin can delete
    if employee.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Sin permisos para eliminar valoraciones")
    
    result = await db.user_reviews.delete_one({"review_id": review_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Valoración no encontrada")
    
    return {"success": True, "message": "Valoración eliminada"}
