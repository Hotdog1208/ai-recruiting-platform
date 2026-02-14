import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class Match(Base):
    """AI match score + explanation for job-candidate pair. Never uses protected attributes."""
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("job_id", "candidate_id", name="uq_match_job_candidate"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    score = Column(Integer, nullable=False)  # 0–100
    explanation = Column(JSONB, nullable=True)  # bullets, gaps, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
