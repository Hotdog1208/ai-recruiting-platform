import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.db.base import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id = Column(UUID(as_uuid=True), ForeignKey("employers.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    requirements = Column(JSON, nullable=True)
    location = Column(String, nullable=True)
    remote = Column(Boolean, nullable=True, default=False)
