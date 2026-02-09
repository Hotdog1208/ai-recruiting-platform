from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Application, Job, Candidate, Employer

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("")
def create_application(
    job_id: UUID = Query(...),
    candidate_id: UUID = Query(...),
    db: Session = Depends(get_db),
):
    """Apply for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    existing = db.query(Application).filter(
        Application.job_id == job_id,
        Application.candidate_id == candidate_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    app = Application(job_id=job_id, candidate_id=candidate_id)
    db.add(app)
    db.commit()
    return {"status": "ok", "id": str(app.id)}


@router.get("/by-job/{job_id}")
def list_applications_by_job(job_id: UUID, db: Session = Depends(get_db)):
    """List applications for a job (employer only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    apps = db.query(Application).filter(Application.job_id == job_id).all()
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


@router.get("/by-candidate/{candidate_id}")
def list_applications_by_candidate(candidate_id: UUID, db: Session = Depends(get_db)):
    """List applications by a candidate."""
    apps = db.query(Application).filter(Application.candidate_id == candidate_id).all()
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
    application_id: UUID,
    status: str = Query(..., pattern="^(pending|reviewed|shortlisted|interview|accepted|rejected)$"),
    db: Session = Depends(get_db),
):
    """Update application status (employer only)."""
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = status
    db.commit()
    return {"status": "ok"}
