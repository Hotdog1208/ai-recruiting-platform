import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSON, JSONB
from app.db.base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    headline = Column(String, nullable=True)
    location = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    age = Column(Integer, nullable=True)  # Optional self-ID; never used for matching
    work_preference = Column(String, nullable=True)  # remote, hybrid, on_site
    work_type = Column(String, nullable=True)  # full_time, part_time, contract, intern
    phone = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    education = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)
    preferences = Column(JSONB, nullable=True)  # job type, location prefs
    resume_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)  # 30–60s intro video URL
    resume_text = Column(Text, nullable=True)
    resume_parsed_data = Column(JSON, nullable=True)  # parsed_profile
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
