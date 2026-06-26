from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.db.helpers import one
from app.db.supabase import get_supabase
from app.models.schemas import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    body: ReviewCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    booking = (
        db.table("bookings")
        .select("*")
        .eq("id", str(body.booking_id))
        .single()
        .execute()
    )
    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.data["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    if user_id == booking.data["customer_id"]:
        reviewee_id = booking.data["worker_id"]
    elif user_id == booking.data["worker_id"]:
        reviewee_id = booking.data["customer_id"]
    else:
        raise HTTPException(status_code=403, detail="Not part of this booking")

    data = {
        "booking_id": str(body.booking_id),
        "reviewer_id": user_id,
        "reviewee_id": reviewee_id,
        "rating": body.rating,
        "comment": body.comment,
    }
    result = db.table("reviews").insert(data).select("*").execute()
    review = one(result)
    if not review:
        raise HTTPException(status_code=500, detail="Failed to create review")

    if reviewee_id == booking.data["worker_id"]:
        reviews = (
            db.table("reviews")
            .select("rating")
            .eq("reviewee_id", reviewee_id)
            .execute()
        )
        ratings = [r["rating"] for r in (reviews.data or [])]
        avg = sum(ratings) / len(ratings) if ratings else 0
        db.table("worker_profiles").update(
            {"rating_avg": round(avg, 2), "rating_count": len(ratings)}
        ).eq("id", reviewee_id).execute()

    return review


@router.get("/users/{user_id}", response_model=list[ReviewResponse])
async def list_user_reviews(user_id: UUID):
    db = get_supabase()
    result = (
        db.table("reviews")
        .select("*")
        .eq("reviewee_id", str(user_id))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []