"""
Dependency injection for auth and RBAC. Use these on all protected routes.
Enforces ownership to prevent IDOR: candidate/employer can only access their own data.
"""
from uuid import UUID
from typing import Annotated
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import get_current_user, get_current_user_optional, require_candidate, require_employer
from app.models import User, Candidate, Employer, Job, Application

# Re-export for convenience
get_current_user_dep = get_current_user
require_candidate_dep = require_candidate
require_employer_dep = require_employer


def get_current_candidate(
    current: Annotated[dict, Depends(require_candidate)],
    db: Session = Depends(get_db),
) -> Candidate:
    """Load candidate row for current user; 404 if not found."""
    c = db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return c


def get_current_employer(
    current: Annotated[dict, Depends(require_employer)],
    db: Session = Depends(get_db),
) -> Employer:
    """Load employer row for current user; 404 if not found."""
    e = db.query(Employer).filter(Employer.user_id == current["user_id"]).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employer profile not found")
    return e


def get_optional_candidate(
    current: Annotated[dict | None, Depends(get_current_user_optional)],
    db: Session = Depends(get_db),
) -> Candidate | None:
    """Return candidate for current user if role is candidate and profile exists; else None."""
    if not current or current.get("role") != "candidate":
        return None
    return db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()


def require_job_owner(
    job_id: UUID,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
) -> Job:
    """Ensure the job belongs to the current employer (IDOR protection)."""
    job = db.query(Job).filter(Job.id == job_id, Job.employer_id == employer.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def require_application_job_owner(
    application_id: UUID,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
) -> Application:
    """Ensure the application's job belongs to the current employer."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    job = db.query(Job).filter(Job.id == app.job_id, Job.employer_id == employer.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Application not found")
    return app
