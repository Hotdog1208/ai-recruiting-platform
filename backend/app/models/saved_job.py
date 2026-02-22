import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, DateTime, UniqueConstraint
  # type: ignore  # pyre-ignore\nfrom sqlalchemy.dialects.postgresql import UUID
  # type: ignore  # pyre-ignore\n
from app.db.base import Base
  # type: ignore  # pyre-ignore\n

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("candidate_id", "job_id", name="uq_savedjob_candidate_job"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
