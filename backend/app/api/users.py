from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import get_current_user
from app.models import User, Candidate, Employer

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_me(
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return current user + role + linked profile id."""
    user = db.query(User).filter(User.id == current["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "candidate_id": None,
        "employer_id": None,
    }

    if user.role == "candidate":
        c = db.query(Candidate).filter(Candidate.user_id == user.id).first()
        if c:
            result["candidate_id"] = str(c.id)
    elif user.role == "employer":
        e = db.query(Employer).filter(Employer.user_id == user.id).first()
        if e:
            result["employer_id"] = str(e.id)

    return result


@router.get("/{user_id}")
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get user role by Supabase user id (public for role resolution)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "role": user.role}
