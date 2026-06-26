from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.db.supabase import get_supabase
from app.models.schemas import UserRole


async def require_admin(user_id: str = Depends(get_current_user_id)) -> str:
    db = get_supabase()
    result = db.table("profiles").select("role").eq("id", user_id).single().execute()
    if not result.data or result.data.get("role") != UserRole.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user_id