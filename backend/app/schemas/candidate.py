from pydantic import BaseModel
from typing import Any


class CandidateUpdate(BaseModel):
    full_name: str | None = None
    location: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    age: int | None = None
    work_preference: str | None = None
    work_type: str | None = None
    phone: str | None = None
    headline: str | None = None
    summary: str | None = None
    education: list[dict[str, Any]] | None = None
    experience: list[dict[str, Any]] | None = None
    skills: list[str] | None = None
    video_url: str | None = None
