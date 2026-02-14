from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import require_employer, get_current_user
from app.models import Employer
from app.schemas.employer import EmployerUpdate

router = APIRouter(prefix="/employers", tags=["employers"])


def _employer_response(employer: Employer):
    return {
        "id": str(employer.id),
        "company_name": employer.company_name,
        "industry": employer.industry,
        "website": employer.website,
        "domain": employer.domain,
        "company_size": employer.company_size,
        "location": employer.location,
        "description": employer.description,
        "logo_url": employer.logo_url,
        "verification_status": employer.verification_status,
    }


@router.get("/me")
def get_employer_me(
    current: dict = Depends(require_employer),
    db: Session = Depends(get_db),
):
    """Get current employer profile (employer-only)."""
    employer = db.query(Employer).filter(Employer.user_id == current["user_id"]).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return _employer_response(employer)


@router.put("/me")
def update_employer_me(
    payload: EmployerUpdate,
    current: dict = Depends(require_employer),
    db: Session = Depends(get_db),
):
    """Update current employer profile (employer-only)."""
    employer = db.query(Employer).filter(Employer.user_id == current["user_id"]).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    if payload.company_name is not None:
        employer.company_name = payload.company_name
    if payload.industry is not None:
        employer.industry = payload.industry
    if payload.website is not None:
        employer.website = payload.website
    if payload.domain is not None:
        employer.domain = payload.domain
    if payload.company_size is not None:
        employer.company_size = payload.company_size
    if payload.location is not None:
        employer.location = payload.location
    if payload.description is not None:
        employer.description = payload.description
    db.commit()
    return {"status": "ok"}


@router.get("/by-user/{user_id}")
def get_employer_by_user(
    user_id: UUID,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get employer profile by user id (self only)."""
    if current["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    employer = db.query(Employer).filter(Employer.user_id == user_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return _employer_response(employer)


@router.patch("/by-user/{user_id}")
def update_employer_by_user(
    user_id: UUID,
    payload: EmployerUpdate,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update employer profile (self only)."""
    if current["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    employer = db.query(Employer).filter(Employer.user_id == user_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    if payload.company_name is not None:
        employer.company_name = payload.company_name
    if payload.industry is not None:
        employer.industry = payload.industry
    if payload.website is not None:
        employer.website = payload.website
    if payload.company_size is not None:
        employer.company_size = payload.company_size
    if payload.location is not None:
        employer.location = payload.location
    if payload.description is not None:
        employer.description = payload.description
    db.commit()
    return {"status": "ok"}
