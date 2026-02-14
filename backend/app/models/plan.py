import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  # free, starter, pro
    stripe_price_id = Column(String, nullable=True)
    limits = Column(JSONB, nullable=True)  # {"active_jobs": 1, "applicants_view": 20, "ai_explanations": false}
