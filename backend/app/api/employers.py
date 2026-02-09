from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Employer
from app.schemas.employer import EmployerUpdate

router = APIRouter(prefix="/employers", tags=["employers"])


@router.get("/by-user/{user_id}")
def get_employer_by_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get employer profile by Supabase user id."""
    employer = db.query(Employer).filter(Employer.user_id == user_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    return {
        "id": str(employer.id),
        "company_name": employer.company_name,
        "industry": employer.industry,
        "website": employer.website,
        "company_size": employer.company_size,
        "location": employer.location,
        "description": employer.description,
    }


@router.patch("/by-user/{user_id}")
def update_employer_by_user(user_id: UUID, payload: EmployerUpdate, db: Session = Depends(get_db)):
    """Update employer profile."""
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
