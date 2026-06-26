from fastapi import APIRouter

from app.db.supabase import get_supabase
from app.models.schemas import CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories():
    db = get_supabase()
    result = db.table("categories").select("*").order("name").execute()
    return result.data or []