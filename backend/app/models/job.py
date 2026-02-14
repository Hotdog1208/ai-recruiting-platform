import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON, JSONB
from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id = Column(UUID(as_uuid=True), ForeignKey("employers.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    requirements = Column(JSON, nullable=True)
    skills = Column(JSONB, nullable=True)
    location = Column(String, nullable=True)
    remote = Column(Boolean, nullable=True, default=False)
    employment_type = Column(String, nullable=True)  # full_time, part_time, contract, intern
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    status = Column(String, nullable=True, default="open")  # open, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
