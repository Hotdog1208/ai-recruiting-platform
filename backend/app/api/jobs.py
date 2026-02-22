from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request, BackgroundTasks
  # type: ignore  # pyre-ignore\nfrom sqlalchemy.orm import Session
  # type: ignore  # pyre-ignore\nfrom sqlalchemy import or_, func
  # type: ignore  # pyre-ignore\n
from app.db.session import get_db
  # type: ignore  # pyre-ignore\nfrom app.core.deps import get_current_employer, require_job_owner
  # type: ignore  # pyre-ignore\nfrom app.core.audit import log as audit_log
  # type: ignore  # pyre-ignore\nfrom app.models import Job, Employer, Application
  # type: ignore  # pyre-ignore\nfrom app.schemas.job import JobCreate, JobUpdate, JobResponse
  # type: ignore  # pyre-ignore\nfrom app.services.job_matcher import update_job_embedding_task
  # type: ignore  # pyre-ignore\n
router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/mine", response_model=list[JobResponse])
def list_my_jobs(
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    """List current employer's jobs (employer only)."""
    return db.query(Job).filter(Job.employer_id == employer.id).order_by(Job.id.desc()).all()


@router.get("", response_model=list[JobResponse])
def list_jobs(
    employer_id: UUID | None = Query(None),
    q: str | None = Query(None, description="Search by title or description"),
    location: str | None = Query(None),
    remote: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    """List jobs with optional filters (public)."""
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
  # type: ignore  # pyre-ignore\n    if not words:
        similar = db.query(Job).filter(Job.id != job_id).limit(limit).all()
    else:
        from sqlalchemy import or_
  # type: ignore  # pyre-ignore\n        filters = [Job.title.ilike(f"%{w}%") for w in words]
        similar = db.query(Job).filter(Job.id != job_id).filter(or_(*filters)).limit(limit).all()
    return [
        {"id": str(j.id), "title": j.title, "location": j.location, "remote": j.remote}
        for j in similar
    ]


@router.post("", response_model=JobResponse)
def create_job(
    payload: JobCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    """Create a job (employer only). Employer derived from JWT."""
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
    audit_log(
        db,
        "job_create",
        actor_user_id=employer.user_id,
        entity_type="job",
        entity_id=str(job.id),
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    background_tasks.add_task(update_job_embedding_task, str(job.id))
    return job


@router.delete("/{job_id}")
def delete_job(
    request: Request,
    job: Job = Depends(require_job_owner),
    db: Session = Depends(get_db),
):
    """Delete a job (employer only; must own job)."""
    employer_id = job.employer_id
    emp = db.query(Employer).filter(Employer.id == employer_id).first()
    db.query(Application).filter(Application.job_id == job.id).delete()
    db.delete(job)
    db.commit()
    if emp:
        audit_log(
            db,
            "job_delete",
            actor_user_id=emp.user_id,
            entity_type="job",
            entity_id=str(job.id),
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    return {"status": "ok"}


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    payload: JobUpdate,
    request: Request,
    background_tasks: BackgroundTasks,
    job: Job = Depends(require_job_owner),
    db: Session = Depends(get_db),
):
    """Update job (employer only; must own job)."""
    emp = db.query(Employer).filter(Employer.id == job.employer_id).first()
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
    if emp:
        audit_log(
            db,
            "job_update",
            actor_user_id=emp.user_id,
            entity_type="job",
            entity_id=str(job.id),
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    background_tasks.add_task(update_job_embedding_task, str(job.id))
    return job
