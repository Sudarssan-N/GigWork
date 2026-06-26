from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user_id
from app.db.helpers import dump_model, one
from app.db.supabase import get_supabase
from app.models.schemas import ProfileResponse, ProfileUpdate, SignupRequest, SignupResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_auth_user(db, user_id: str):
    try:
        return db.auth.admin.get_user_by_id(user_id)
    except Exception:
        return None


def _enrich_profile(profile: dict, user_id: str) -> dict:
    db = get_supabase()
    auth_user = _get_auth_user(db, user_id)
    if auth_user and auth_user.user:
        profile["email"] = auth_user.user.email

    wp = db.table("worker_profiles").select("verification_status").eq("id", user_id).execute()
    profile["has_worker_profile"] = bool(wp.data)
    profile["worker_verified"] = (
        wp.data[0].get("verification_status") == "verified" if wp.data else False
    )
    return profile


def _ensure_profile(user_id: str) -> dict:
    """Create profile if missing (replaces DB trigger after signup)."""
    db = get_supabase()
    existing = db.table("profiles").select("*").eq("id", user_id).execute()
    if existing.data:
        return existing.data[0]

    auth_user = _get_auth_user(db, user_id)
    full_name = ""
    if auth_user and auth_user.user:
        meta = auth_user.user.user_metadata or {}
        full_name = meta.get("full_name") or (auth_user.user.email or "").split("@")[0]

    inserted = (
        db.table("profiles")
        .insert({"id": user_id, "full_name": full_name})
        .select("*")
        .execute()
    )
    profile = one(inserted)
    if not profile:
        raise HTTPException(status_code=500, detail="Failed to create profile")
    return profile


@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(body: SignupRequest):
    db = get_supabase()
    try:
        auth_resp = db.auth.admin.create_user(
            {
                "email": body.email,
                "password": body.password,
                "email_confirm": True,
                "user_metadata": {"full_name": body.full_name},
            }
        )
    except Exception as exc:
        msg = str(exc)
        if "already been registered" in msg or "already exists" in msg.lower():
            raise HTTPException(status_code=409, detail="Email already registered") from exc
        if "Database error" in msg:
            raise HTTPException(
                status_code=500,
                detail="Database setup incomplete. Run supabase/FIX_SIGNUP.sql in Supabase SQL Editor.",
            ) from exc
        raise HTTPException(status_code=400, detail=msg) from exc

    user_id = str(auth_resp.user.id)
    db.table("profiles").upsert(
        {"id": user_id, "full_name": body.full_name, "role": "customer"},
        on_conflict="id",
    ).execute()

    return SignupResponse(user_id=user_id)


@router.get("/me", response_model=ProfileResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    profile = _ensure_profile(user_id)
    return _enrich_profile(profile, user_id)


@router.patch("/me", response_model=ProfileResponse)
async def update_me(
    body: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    _ensure_profile(user_id)

    updates = dump_model(body, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "role" in updates and updates["role"] == "worker":
        existing = (
            db.table("worker_profiles")
            .select("id")
            .eq("id", user_id)
            .execute()
        )
        if not existing.data:
            db.table("worker_profiles").insert({"id": user_id}).execute()

    result = (
        db.table("profiles")
        .update(updates)
        .eq("id", user_id)
        .select("*")
        .execute()
    )
    profile = one(result)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _enrich_profile(profile, user_id)