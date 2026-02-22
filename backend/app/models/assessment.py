"""Skill assessments and results for candidate verification."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Boolean, Integer, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    questions = Column(JSONB, nullable=False)  # list of {question, options, correct_index or correct_value}
    passing_score = Column(Integer, default=70)  # percentage
    duration_minutes = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)


class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    __table_args__ = (UniqueConstraint("candidate_id", "assessment_id", name="uq_assessment_result_candidate_assessment"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    score = Column(Integer, nullable=False)  # percentage
    passed = Column(Boolean, nullable=False)
    answers = Column(JSONB, nullable=True)  # snapshot of answers for record
    completed_at = Column(DateTime, default=datetime.utcnow)
