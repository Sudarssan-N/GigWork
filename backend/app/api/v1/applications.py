from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.db.helpers import dump_model, one
from app.db.supabase import get_supabase
from app.models.schemas import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatus,
    ApplicationUpdate,
)
from app.services.notifications import create_notification

router = APIRouter(tags=["applications"])


def _enrich_application(app: dict) -> dict:
    db = get_supabase()
    worker = (
        db.table("profiles")
        .select("id, role, full_name, phone, avatar_url, city, created_at")
        .eq("id", app["worker_id"])
        .single()
        .execute()
    )
    app["worker"] = worker.data
    return app


@router.post("/tasks/{task_id}/applications", response_model=ApplicationResponse, status_code=201)
async def create_application(
    task_id: UUID,
    body: ApplicationCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    worker_profile = (
        db.table("worker_profiles")
        .select("verification_status, id_doc_url")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    if not worker_profile.data:
        raise HTTPException(
            status_code=403,
            detail="Complete worker onboarding first at /worker/onboard",
        )
    wp = worker_profile.data
    if not wp.get("id_doc_url"):
        raise HTTPException(status_code=403, detail="Upload ID document to apply for tasks")
    if wp.get("verification_status") != "verified":
        raise HTTPException(
            status_code=403,
            detail="Your profile is pending admin verification",
        )

    task = db.table("tasks").select("*").eq("id", str(task_id)).single().execute()
    if not task.data:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.data["status"] != "open":
        raise HTTPException(status_code=400, detail="Task is not open for applications")
    if task.data["customer_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot apply to your own task")

    data = dump_model(body)
    data["task_id"] = str(task_id)
    data["worker_id"] = user_id

    result = db.table("applications").insert(data).select("*").execute()
    application = one(result)
    if not application:
        raise HTTPException(status_code=500, detail="Failed to create application")

    create_notification(
        task.data["customer_id"],
        "new_application",
        {"task_id": str(task_id), "application_id": application["id"]},
    )
    return _enrich_application(application)


@router.get("/tasks/{task_id}/applications", response_model=list[ApplicationResponse])
async def list_task_applications(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    task = db.table("tasks").select("customer_id").eq("id", str(task_id)).single().execute()
    if not task.data:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.data["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only task owner can view applications")

    result = (
        db.table("applications")
        .select("*")
        .eq("task_id", str(task_id))
        .order("created_at", desc=True)
        .execute()
    )
    return [_enrich_application(a) for a in (result.data or [])]


@router.get("/applications/mine", response_model=list[ApplicationResponse])
async def list_my_applications(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = (
        db.table("applications")
        .select("*")
        .eq("worker_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [_enrich_application(a) for a in (result.data or [])]


@router.patch("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: UUID,
    body: ApplicationUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    existing = (
        db.table("applications")
        .select("*, tasks(customer_id)")
        .eq("id", str(application_id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Application not found")

    app = existing.data
    is_worker = app["worker_id"] == user_id
    is_customer = app["tasks"]["customer_id"] == user_id

    if body.status == ApplicationStatus.withdrawn and not is_worker:
        raise HTTPException(status_code=403, detail="Only worker can withdraw")
    if body.status in (ApplicationStatus.accepted, ApplicationStatus.rejected) and not is_customer:
        raise HTTPException(status_code=403, detail="Only customer can accept/reject")

    updates = dump_model(body, exclude_none=True)
    result = (
        db.table("applications")
        .update(updates)
        .eq("id", str(application_id))
        .select("*")
        .execute()
    )
    application = one(result)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return _enrich_application(application)