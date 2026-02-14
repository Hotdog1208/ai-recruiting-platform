"""Audit logging. Never log secrets or tokens."""
from uuid import UUID
from sqlalchemy.orm import Session

from app.models import AuditLog


def log(
    db: Session,
    action: str,
    *,
    actor_user_id: UUID | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Write an audit log entry. Fire-and-forget; do not raise."""
    try:
        entry = AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip=ip,
            user_agent=user_agent,
        )
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()
