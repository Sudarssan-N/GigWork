from typing import Any

from pydantic import BaseModel


def dump_model(model: BaseModel, *, exclude_none: bool = False) -> dict:
    """Serialize a Pydantic model for Supabase/JSON (UUIDs, enums, datetimes → strings)."""
    return model.model_dump(mode="json", exclude_none=exclude_none)


def one(result: Any) -> dict | None:
    """Return a single row from a PostgREST execute result."""
    data = result.data
    if isinstance(data, list):
        return data[0] if data else None
    return data