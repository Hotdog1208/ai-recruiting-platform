"""Conversation and Message models for direct messaging between users (candidates/employers)."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime, Text, UniqueConstraint
  # type: ignore  # pyre-ignore\nfrom sqlalchemy.dialects.postgresql import UUID
  # type: ignore  # pyre-ignore\nfrom sqlalchemy.orm import relationship
  # type: ignore  # pyre-ignore\n
from app.db.base import Base
  # type: ignore  # pyre-ignore\n

class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (UniqueConstraint("participant_1", "participant_2", name="uq_conversation_participants"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_1 = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    participant_2 = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    last_message_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
