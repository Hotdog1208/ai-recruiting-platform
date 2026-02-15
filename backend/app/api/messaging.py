"""Direct messaging between users (candidates and employers)."""
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.core.auth import get_current_user
from app.models import Conversation, Message, User, Candidate, Employer

router = APIRouter(prefix="/messaging", tags=["messaging"])


class SendMessageRequest(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    read: bool
    created_at: str


class ConversationOut(BaseModel):
    id: str
    other_user_id: str
    other_name: str
    other_role: str
    last_message_at: Optional[str]
    last_message_preview: Optional[str]
    unread_count: int
    created_at: str


def _other_participant(conv: Conversation, current_user_id: UUID) -> UUID:
    return conv.participant_2 if conv.participant_1 == current_user_id else conv.participant_1


def _user_display_name(db: Session, user_id: UUID) -> str:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "Unknown"
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if candidate and candidate.full_name:
        return candidate.full_name
    employer = db.query(Employer).filter(Employer.user_id == user_id).first()
    if employer and employer.company_name:
        return employer.company_name
    return user.email or "User"


def _user_role(db: Session, user_id: UUID) -> str:
    user = db.query(User).filter(User.id == user_id).first()
    return user.role if user else "unknown"


@router.get("/conversations")
def list_conversations(
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all conversations for the current user, with last message and unread count."""
    user_id = current["user_id"]
    convs = (
        db.query(Conversation)
        .filter(
            (Conversation.participant_1 == user_id) | (Conversation.participant_2 == user_id)
        )
        .order_by(Conversation.last_message_at.desc().nullslast())
        .all()
    )
    result = []
    for c in convs:
        other_id = _other_participant(c, user_id)
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == c.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        unread = (
            db.query(Message)
            .filter(
                Message.conversation_id == c.id,
                Message.sender_id != user_id,
                Message.read == False,
            )
            .count()
        )
        result.append(
            {
                "id": str(c.id),
                "other_user_id": str(other_id),
                "other_name": _user_display_name(db, other_id),
                "other_role": _user_role(db, other_id),
                "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None,
                "last_message_preview": (last_msg.content[:80] + "…") if last_msg and len(last_msg.content) > 80 else (last_msg.content if last_msg else None),
                "unread_count": unread,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
        )
    return result


@router.get("/conversations/with/{other_user_id}")
def get_or_create_conversation(
    other_user_id: UUID,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get existing conversation with another user or create one."""
    user_id = current["user_id"]
    if other_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    other = db.query(User).filter(User.id == other_user_id).first()
    if not other:
        raise HTTPException(status_code=404, detail="User not found")
    p1, p2 = (user_id, other_user_id) if str(user_id) < str(other_user_id) else (other_user_id, user_id)
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.participant_1 == p1,
            Conversation.participant_2 == p2,
        )
        .first()
    )
    if not conv:
        conv = Conversation(participant_1=p1, participant_2=p2)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return {
        "id": str(conv.id),
        "other_user_id": str(other_user_id),
        "other_name": _user_display_name(db, other_user_id),
        "other_role": _user_role(db, other_user_id),
    }


@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: UUID,
    before: Optional[UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List messages in a conversation. Only participants can read."""
    user_id = current["user_id"]
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user_id not in (conv.participant_1, conv.participant_2):
        raise HTTPException(status_code=403, detail="Not a participant")
    q = db.query(Message).filter(Message.conversation_id == conversation_id)
    if before:
        q = q.filter(Message.id < before)
    messages = q.order_by(Message.created_at.desc()).limit(limit).all()
    # Mark as read messages from the other user
    other_id = _other_participant(conv, user_id)
    for m in messages:
        if m.sender_id == other_id and not m.read:
            m.read = True
    db.commit()
    return [
        {
            "id": str(m.id),
            "conversation_id": str(m.conversation_id),
            "sender_id": str(m.sender_id),
            "content": m.content,
            "read": m.read,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in reversed(messages)
    ]


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: UUID,
    body: SendMessageRequest,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message in a conversation."""
    if not (body.content and body.content.strip()):
        raise HTTPException(status_code=400, detail="Message content is required")
    user_id = current["user_id"]
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user_id not in (conv.participant_1, conv.participant_2):
        raise HTTPException(status_code=403, detail="Not a participant")
    msg = Message(
        conversation_id=conversation_id,
        sender_id=user_id,
        content=body.content.strip()[:10000],
    )
    db.add(msg)
    conv.last_message_at = msg.created_at
    db.commit()
    db.refresh(msg)
    return {
        "id": str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id": str(msg.sender_id),
        "content": msg.content,
        "read": msg.read,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.patch("/messages/{message_id}/read")
def mark_read(
    message_id: UUID,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a message as read (recipient only)."""
    user_id = current["user_id"]
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    conv = db.query(Conversation).filter(Conversation.id == msg.conversation_id).first()
    if not conv or user_id not in (conv.participant_1, conv.participant_2):
        raise HTTPException(status_code=403, detail="Not a participant")
    if msg.sender_id == user_id:
        return {"status": "ok"}
    msg.read = True
    db.commit()
    return {"status": "ok"}
