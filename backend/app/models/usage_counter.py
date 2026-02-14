import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class UsageCounter(Base):
    """Per-employer monthly usage for plan limits."""
    __tablename__ = "usage_counters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id = Column(UUID(as_uuid=True), ForeignKey("employers.id"), nullable=False)
    month = Column(String, nullable=False)  # YYYY-MM
    jobs_posted_count = Column(Integer, default=0)
    applicants_viewed_count = Column(Integer, default=0)
    # Extensible: other counters in jsonb if needed
