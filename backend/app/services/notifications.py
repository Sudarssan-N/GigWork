from uuid import UUID

from app.db.supabase import get_supabase


def create_notification(user_id: UUID | str, notif_type: str, payload: dict) -> None:
    db = get_supabase()
    db.table("notifications").insert(
        {
            "user_id": str(user_id),
            "type": notif_type,
            "payload": payload,
        }
    ).execute()