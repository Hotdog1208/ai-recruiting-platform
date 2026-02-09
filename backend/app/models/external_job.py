from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid
from datetime import datetime
from app.db.base import Base


class ExternalJob(Base):
    """Aggregated jobs from external APIs (Adzuna, etc.)"""
    __tablename__ = "external_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String, index=True)  # ID from source
    source = Column(String, nullable=False)  # adzuna, etc.
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)
    url = Column(String, nullable=True)
    salary_min = Column(String, nullable=True)
    salary_max = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)
