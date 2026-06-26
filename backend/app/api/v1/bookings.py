from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.db.helpers import one
from app.db.supabase import get_supabase
from app.models.schemas import (
    BookingCreate,
    BookingResponse,
    BookingStatus,
    BookingStatusUpdate,
)
from app.services.fees import calculate_fees
from app.services.notifications import create_notification

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _enrich_booking(booking: dict) -> dict:
    db = get_supabase()
    task = db.table("tasks").select("*").eq("id", booking["task_id"]).single().execute()
    booking["task"] = task.data
    booking["total_charge"] = booking["agreed_price"] + booking["platform_fee"]
    return booking


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    body: BookingCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    app = (
        db.table("applications")
        .select("*, tasks(*)")
        .eq("id", str(body.application_id))
        .single()
        .execute()
    )
    if not app.data:
        raise HTTPException(status_code=404, detail="Application not found")

    application = app.data
    task = application["tasks"]

    if task["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only task owner can accept applications")
    if application["status"] != "pending":
        raise HTTPException(status_code=400, detail="Application is not pending")
    if task["status"] != "open":
        raise HTTPException(status_code=400, detail="Task is no longer open")

    fees = calculate_fees(application["proposed_price"])

    booking_data = {
        "task_id": task["id"],
        "application_id": application["id"],
        "customer_id": task["customer_id"],
        "worker_id": application["worker_id"],
        "agreed_price": fees["agreed_price"],
        "platform_fee": fees["platform_fee"],
        "worker_payout": fees["worker_payout"],
        "status": "pending_payment",
    }

    result = db.table("bookings").insert(booking_data).select("*").execute()
    booking = one(result)
    if not booking:
        raise HTTPException(status_code=500, detail="Failed to create booking")

    db.table("applications").update({"status": "accepted"}).eq("id", application["id"]).execute()
    db.table("applications").update({"status": "rejected"}).eq("task_id", task["id"]).neq(
        "id", application["id"]
    ).eq("status", "pending").execute()
    db.table("tasks").update({"status": "assigned"}).eq("id", task["id"]).execute()

    create_notification(
        application["worker_id"],
        "application_accepted",
        {"booking_id": booking["id"], "task_id": task["id"]},
    )
    return _enrich_booking(booking)


@router.get("", response_model=list[BookingResponse])
async def list_bookings(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = (
        db.table("bookings")
        .select("*")
        .or_(f"customer_id.eq.{user_id},worker_id.eq.{user_id}")
        .order("created_at", desc=True)
        .execute()
    )
    return [_enrich_booking(b) for b in (result.data or [])]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    result = db.table("bookings").select("*").eq("id", str(booking_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking = result.data
    if booking["customer_id"] != user_id and booking["worker_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _enrich_booking(booking)


@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: UUID,
    body: BookingStatusUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    existing = db.table("bookings").select("*").eq("id", str(booking_id)).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = existing.data
    new_status = body.status

    transitions = {
        BookingStatus.in_progress: (
            ["paid"],
            [booking["worker_id"], booking["customer_id"]],
        ),
        BookingStatus.completed: (
            ["in_progress", "paid"],
            [booking["worker_id"], booking["customer_id"]],
        ),
    }

    if new_status in transitions:
        allowed_from, allowed_users = transitions[new_status]
        if booking["status"] not in allowed_from:
            raise HTTPException(status_code=400, detail=f"Cannot transition from {booking['status']}")
        if user_id not in allowed_users:
            raise HTTPException(status_code=403, detail="Not authorized for this status change")

    if new_status == BookingStatus.completed:
        db.table("tasks").update({"status": "completed"}).eq("id", booking["task_id"]).execute()
        create_notification(
            booking["worker_id"],
            "booking_completed",
            {"booking_id": str(booking_id)},
        )

    result = (
        db.table("bookings")
        .update({"status": new_status.value})
        .eq("id", str(booking_id))
        .select("*")
        .execute()
    )
    booking = one(result)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _enrich_booking(booking)