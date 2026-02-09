from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: str
    candidate_id: str


class ApplicationStatusUpdate(BaseModel):
    status: str  # pending, reviewed, accepted, rejected
