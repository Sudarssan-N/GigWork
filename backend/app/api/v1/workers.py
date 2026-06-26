from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.db.helpers import dump_model, one
from app.db.supabase import get_supabase
from app.models.schemas import WorkerOnboard, WorkerProfileResponse, WorkerUpdate

router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("/onboard", response_model=WorkerProfileResponse, status_code=201)
async def onboard_worker(
    body: WorkerOnboard,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()

    data = {"id": user_id, **dump_model(body)}
    existing = db.table("worker_profiles").select("id").eq("id", user_id).execute()

    if existing.data:
        result = (
            db.table("worker_profiles")
            .update(dump_model(body))
            .eq("id", user_id)
            .select("*")
            .execute()
        )
    else:
        result = db.table("worker_profiles").insert(data).select("*").execute()

    profile = one(result)
    if not profile:
        raise HTTPException(status_code=500, detail="Failed to save worker profile")
    return profile


@router.patch("/me", response_model=WorkerProfileResponse)
async def update_my_worker_profile(
    body: WorkerUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    updates = dump_model(body, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("worker_profiles")
        .update(updates)
        .eq("id", user_id)
        .select("*")
        .execute()
    )
    profile = one(result)
    if not profile:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return profile


@router.get("/me", response_model=WorkerProfileResponse)
async def get_my_worker_profile(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    result = db.table("worker_profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return result.data


@router.get("/{worker_id}", response_model=WorkerProfileResponse)
async def get_worker_profile(worker_id: UUID):
    db = get_supabase()
    result = (
        db.table("worker_profiles")
        .select("*")
        .eq("id", str(worker_id))
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result.data