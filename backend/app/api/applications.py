from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_candidate, require_job_owner, require_application_job_owner
from app.core.audit import log as audit_log
from app.models import Application, Job, Candidate, Employer

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("")
def create_application(
    job_id: UUID = Query(...),
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Apply for a job (candidate only; uses identity from JWT)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = db.query(Application).filter(
        Application.job_id == job_id,
        Application.candidate_id == candidate.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    app = Application(job_id=job_id, candidate_id=candidate.id)
    db.add(app)
    db.commit()
    return {"status": "ok", "id": str(app.id)}


@router.get("/by-job/{job_id}")
def list_applications_by_job(
    job: Job = Depends(require_job_owner),
    db: Session = Depends(get_db),
):
    """List applications for a job (employer only; must own job)."""
    apps = db.query(Application).filter(Application.job_id == job.id).all()
    result = []
    for a in apps:
        c = db.query(Candidate).filter(Candidate.id == a.candidate_id).first()
        result.append({
            "id": str(a.id),
            "candidate_id": str(a.candidate_id),
            "candidate_name": c.full_name if c else None,
            "candidate_location": c.location if c else None,
            "candidate_skills": c.skills if c else [],
            "candidate_experience": c.experience if c else None,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result


@router.get("/by-candidate/me")
def list_my_applications(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """List applications by current candidate (candidate only)."""
    apps = db.query(Application).filter(Application.candidate_id == candidate.id).all()
    result = []
    for a in apps:
        j = db.query(Job).filter(Job.id == a.job_id).first()
        result.append({
            "id": str(a.id),
            "job_id": str(a.job_id),
            "job_title": j.title if j else None,
            "job_location": j.location if j else None,
            "job_remote": j.remote if j else None,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result


@router.patch("/{application_id}")
def update_application_status(
    request: Request,
    status: str = Query(..., pattern="^(pending|reviewed|shortlisted|interview|accepted|rejected)$"),
    app: Application = Depends(require_application_job_owner),
    db: Session = Depends(get_db),
):
    """Update application status (employer only; must own job)."""
    job = db.query(Job).filter(Job.id == app.job_id).first()
    emp = db.query(Employer).filter(Employer.id == job.employer_id).first() if job else None
    app.status = status
    db.commit()
    if emp and request:
        audit_log(
            db,
            "application_status_change",
            actor_user_id=emp.user_id,
            entity_type="application",
            entity_id=str(app.id),
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    return {"status": "ok"}
