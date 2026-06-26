from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_admin
from app.db.helpers import one
from app.db.supabase import get_supabase
from app.models.schemas import (
    AdminStatsResponse,
    AdminUserResponse,
    AdminWorkerResponse,
    PlatformConfigUpdate,
    VerificationStatus,
    WorkerVerificationUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(_admin_id: str = Depends(require_admin)):
    db = get_supabase()

    profiles = db.table("profiles").select("id, role", count="exact").execute()
    workers = db.table("worker_profiles").select("id, verification_status").execute()
    tasks = db.table("tasks").select("id", count="exact").execute()
    bookings = db.table("bookings").select("id, status, platform_fee").execute()

    role_counts = {"customer": 0, "worker": 0, "admin": 0}
    for p in profiles.data or []:
        role = p.get("role", "customer")
        role_counts[role] = role_counts.get(role, 0) + 1

    pending_workers = sum(
        1 for w in (workers.data or []) if w.get("verification_status") == "pending"
    )
    verified_workers = sum(
        1 for w in (workers.data or []) if w.get("verification_status") == "verified"
    )

    completed_bookings = [b for b in (bookings.data or []) if b.get("status") == "completed"]
    total_revenue = sum(b.get("platform_fee", 0) for b in completed_bookings)

    return {
        "total_users": profiles.count or 0,
        "total_customers": role_counts.get("customer", 0),
        "total_workers": role_counts.get("worker", 0),
        "pending_verifications": pending_workers,
        "verified_workers": verified_workers,
        "total_tasks": tasks.count or 0,
        "total_bookings": len(bookings.data or []),
        "completed_bookings": len(completed_bookings),
        "platform_revenue": total_revenue,
    }


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(_admin_id: str = Depends(require_admin)):
    db = get_supabase()
    result = (
        db.table("profiles")
        .select("id, role, full_name, phone, city, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    users = []
    for row in result.data or []:
        try:
            auth_user = db.auth.admin.get_user_by_id(row["id"])
            if auth_user and auth_user.user:
                row["email"] = auth_user.user.email
        except Exception:
            pass
        users.append(row)
    return users


@router.get("/workers", response_model=list[AdminWorkerResponse])
async def list_workers(
    status: VerificationStatus | None = None,
    _admin_id: str = Depends(require_admin),
):
    db = get_supabase()
    query = db.table("worker_profiles").select(
        "*, profiles(id, full_name, phone, city, created_at)"
    )
    if status:
        query = query.eq("verification_status", status.value)

    result = query.order("created_at", desc=True).execute()
    workers = []
    for w in result.data or []:
        profile = w.pop("profiles", {}) or {}
        workers.append({**w, "profile": profile})
    return workers


@router.patch("/workers/{worker_id}/verify", response_model=AdminWorkerResponse)
async def verify_worker(
    worker_id: UUID,
    body: WorkerVerificationUpdate,
    _admin_id: str = Depends(require_admin),
):
    db = get_supabase()
    existing = (
        db.table("worker_profiles")
        .select("*, profiles(id, full_name, phone, city, created_at)")
        .eq("id", str(worker_id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Worker not found")

    result = (
        db.table("worker_profiles")
        .update({"verification_status": body.verification_status.value})
        .eq("id", str(worker_id))
        .select("*, profiles(id, full_name, phone, city, created_at)")
        .execute()
    )
    w = one(result)
    if not w:
        raise HTTPException(status_code=404, detail="Worker not found")
    profile = w.pop("profiles", {}) or {}
    return {**w, "profile": profile}


@router.get("/config")
async def get_config(_admin_id: str = Depends(require_admin)):
    db = get_supabase()
    result = db.table("platform_config").select("*").execute()
    return {row["key"]: row["value"] for row in (result.data or [])}


@router.patch("/config")
async def update_config(
    body: PlatformConfigUpdate,
    _admin_id: str = Depends(require_admin),
):
    db = get_supabase()
    db.table("platform_config").upsert(
        {"key": body.key, "value": body.value}
    ).execute()
    return {"key": body.key, "value": body.value}


@router.get("/workers/{worker_id}/id-document")
async def get_worker_id_document(
    worker_id: UUID,
    _admin_id: str = Depends(require_admin),
):
    db = get_supabase()
    result = (
        db.table("worker_profiles")
        .select("id_doc_url")
        .eq("id", str(worker_id))
        .single()
        .execute()
    )
    if not result.data or not result.data.get("id_doc_url"):
        raise HTTPException(status_code=404, detail="No document uploaded")

    path = result.data["id_doc_url"]
    signed = db.storage.from_("worker-documents").create_signed_url(path, 3600)
    return {"signed_url": signed.get("signedURL") or signed.get("signedUrl")}