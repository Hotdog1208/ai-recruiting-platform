from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db.session import get_db
from app.models import Job, Employer, Application
from app.schemas.job import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[JobResponse])
def list_jobs(
    employer_id: UUID | None = Query(None),
    q: str | None = Query(None, description="Search by title or description"),
    location: str | None = Query(None),
    remote: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    """List jobs with optional filters."""
    query = db.query(Job)
    if employer_id:
        query = query.filter(Job.employer_id == employer_id)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(Job.title.ilike(term), func.coalesce(Job.description, "").ilike(term))
        )
    if location and location.strip():
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))
    if remote is not None:
        query = query.filter(Job.remote == remote)
    return query.order_by(Job.id.desc()).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: UUID, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/similar")
def get_similar_jobs(job_id: UUID, limit: int = Query(5, le=10), db: Session = Depends(get_db)):
    """Get jobs with similar title (exclude current job)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # Simple similarity: jobs with overlapping words in title
    words = [w for w in job.title.lower().split() if len(w) > 2][:3]
    if not words:
        similar = db.query(Job).filter(Job.id != job_id).limit(limit).all()
    else:
        from sqlalchemy import or_
        filters = [Job.title.ilike(f"%{w}%") for w in words]
        similar = db.query(Job).filter(Job.id != job_id).filter(or_(*filters)).limit(limit).all()
    return [
        {"id": str(j.id), "title": j.title, "location": j.location, "remote": j.remote}
        for j in similar
    ]


@router.post("", response_model=JobResponse)
def create_job(payload: JobCreate, employer_id: UUID, db: Session = Depends(get_db)):
    """Create a job (employer only). Pass employer_id as query param."""
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    job = Job(
        employer_id=employer.id,
        title=payload.title,
        description=payload.description,
        requirements=payload.requirements,
        location=payload.location,
        remote=payload.remote,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: UUID, db: Session = Depends(get_db)):
    """Delete a job (employer only). Applications are removed too."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.query(Application).filter(Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"status": "ok"}


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(job_id: UUID, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if payload.title is not None:
        job.title = payload.title
    if payload.description is not None:
        job.description = payload.description
    if payload.requirements is not None:
        job.requirements = payload.requirements
    if payload.location is not None:
        job.location = payload.location
    if payload.remote is not None:
        job.remote = payload.remote
    db.commit()
    db.refresh(job)
    return job
