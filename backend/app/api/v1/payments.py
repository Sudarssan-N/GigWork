import hashlib
import hmac
import json

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request
from uuid import UUID

from app.core.config import settings
from app.core.security import get_current_user_id
from app.db.supabase import get_supabase
from app.models.schemas import PaymentOrderResponse

router = APIRouter(prefix="/payments", tags=["payments"])


def _get_razorpay_client():
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        return None
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


@router.post("/create-order/{booking_id}", response_model=PaymentOrderResponse)
async def create_payment_order(
    booking_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    booking = db.table("bookings").select("*").eq("id", str(booking_id)).single().execute()
    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.data["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only customer can pay")
    if booking.data["status"] != "pending_payment":
        raise HTTPException(status_code=400, detail="Booking is not pending payment")

    total = booking.data["agreed_price"] + booking.data["platform_fee"]
    amount_paise = total * 100

    client = _get_razorpay_client()
    if client is None:
        order_id = f"dev_order_{booking_id}"
        db.table("payments").insert(
            {
                "booking_id": str(booking_id),
                "razorpay_order_id": order_id,
                "amount": total,
                "fee_amount": booking.data["platform_fee"],
                "status": "created",
            }
        ).execute()
        return PaymentOrderResponse(
            order_id=order_id,
            amount=amount_paise,
            key_id="dev_key",
        )

    order = client.order.create(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": str(booking_id),
        }
    )

    db.table("payments").insert(
        {
            "booking_id": str(booking_id),
            "razorpay_order_id": order["id"],
            "amount": total,
            "fee_amount": booking.data["platform_fee"],
            "status": "created",
        }
    ).execute()

    return PaymentOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        key_id=settings.razorpay_key_id,
    )


@router.post("/dev-confirm/{booking_id}")
async def dev_confirm_payment(
    booking_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    """Dev-only endpoint to simulate payment when Razorpay is not configured."""
    db = get_supabase()
    booking = db.table("bookings").select("*").eq("id", str(booking_id)).single().execute()
    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.data["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only customer can pay")

    db.table("bookings").update({"status": "paid"}).eq("id", str(booking_id)).execute()
    db.table("payments").update({"status": "captured"}).eq("booking_id", str(booking_id)).execute()
    db.table("tasks").update({"status": "in_progress"}).eq("id", booking.data["task_id"]).execute()
    return {"status": "paid"}


@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if settings.razorpay_webhook_secret:
        expected = hmac.new(
            settings.razorpay_webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=400, detail="Invalid signature")

    payload = json.loads(body)
    event = payload.get("event")

    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        db = get_supabase()
        payment = (
            db.table("payments")
            .select("*")
            .eq("razorpay_order_id", order_id)
            .single()
            .execute()
        )
        if payment.data:
            db.table("payments").update(
                {
                    "status": "captured",
                    "razorpay_payment_id": payment_id,
                    "webhook_payload": payload,
                }
            ).eq("id", payment.data["id"]).execute()

            booking_id = payment.data["booking_id"]
            db.table("bookings").update({"status": "paid"}).eq("id", booking_id).execute()

            booking = db.table("bookings").select("task_id").eq("id", booking_id).single().execute()
            if booking.data:
                db.table("tasks").update({"status": "in_progress"}).eq(
                    "id", booking.data["task_id"]
                ).execute()

    return {"status": "ok"}