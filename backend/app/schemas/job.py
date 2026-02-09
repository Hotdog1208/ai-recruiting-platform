from pydantic import BaseModel
from typing import Any
from uuid import UUID


class JobCreate(BaseModel):
    title: str
    description: str | None = None
    requirements: dict[str, Any] | None = None
    location: str | None = None
    remote: bool = False


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: dict[str, Any] | None = None
    location: str | None = None
    remote: bool | None = None


class JobResponse(BaseModel):
    id: UUID
    employer_id: UUID
    title: str
    description: str | None
    requirements: dict | None
    location: str | None
    remote: bool | None

    class Config:
        from_attributes = True
