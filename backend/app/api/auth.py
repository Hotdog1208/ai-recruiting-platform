import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.db.session import get_db
from app.core.audit import log as audit_log
from app.models import User, Candidate, Employer
from app.schemas.auth import PostSignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/post-signup")
def post_signup(
    payload: PostSignupRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Create user and role-specific profile after Supabase signup."""
    # Validate role-specific fields
    errors = payload.validate_role_fields()
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    # Parse Supabase UUID (can be string)
    user_uuid = uuid.UUID(payload.supabase_user_id)

    # Check if user already exists (idempotent for double-clicks)
    existing = db.query(User).filter(User.id == user_uuid).first()
    if existing:
        return {"status": "ok", "message": "User already registered"}

    # Create user
    user = User(
        id=user_uuid,
        email=payload.email,
        role=payload.role,
    )
    db.add(user)
    db.flush()  # Get user.id without committing

    if payload.role == "candidate":
        candidate = Candidate(
            user_id=user.id,
            full_name=payload.full_name.strip(),
        )
        db.add(candidate)
    elif payload.role == "employer":
        employer = Employer(
            user_id=user.id,
            company_name=payload.company_name.strip(),
            industry=payload.industry.strip() if payload.industry else None,
        )
        db.add(employer)

    db.commit()
    audit_log(
        db,
        "signup_complete",
        actor_user_id=user.id,
        entity_type="user",
        entity_id=str(user.id),
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"status": "ok"}
