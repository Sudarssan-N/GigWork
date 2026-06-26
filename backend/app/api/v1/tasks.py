from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user_id
from app.db.helpers import dump_model, one
from app.db.supabase import get_supabase
from app.models.schemas import TaskCreate, TaskResponse, TaskStatus, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _enrich_task(task: dict) -> dict:
    db = get_supabase()
    try:
        cat = (
            db.table("categories")
            .select("id, name, slug, icon")
            .eq("id", task["category_id"])
            .maybe_single()
            .execute()
        )
        task["category"] = cat.data
    except Exception:
        task["category"] = None

    try:
        apps = (
            db.table("applications")
            .select("id", count="exact")
            .eq("task_id", task["id"])
            .execute()
        )
        task["application_count"] = apps.count or 0
    except Exception:
        task["application_count"] = 0

    return task


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    body: TaskCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    data = dump_model(body, exclude_none=True)
    data["customer_id"] = user_id

    result = db.table("tasks").insert(data).select("*").execute()
    task = one(result)
    if not task:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return _enrich_task(task)


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    status: TaskStatus | None = Query(None),
    city: str | None = Query(None),
    category_id: UUID | None = Query(None),
    mine: bool = Query(False),
    has_location: bool = Query(False),
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    query = db.table("tasks").select("*")

    if mine:
        query = query.eq("customer_id", user_id)
    else:
        query = query.eq("status", status.value if status else "open")

    if city:
        query = query.ilike("city", f"%{city}%")
    if category_id:
        query = query.eq("category_id", str(category_id))

    result = query.order("created_at", desc=True).execute()
    tasks = [_enrich_task(t) for t in (result.data or [])]

    if has_location:
        tasks = [t for t in tasks if t.get("latitude") and t.get("longitude")]

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    result = db.table("tasks").select("*").eq("id", str(task_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    task = result.data
    if task["status"] != "open" and task["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _enrich_task(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    body: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    existing = db.table("tasks").select("*").eq("id", str(task_id)).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Task not found")
    if existing.data["customer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your task")

    updates = dump_model(body, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("tasks")
        .update(updates)
        .eq("id", str(task_id))
        .select("*")
        .execute()
    )
    task = one(result)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _enrich_task(task)