"""Saved jobs API - candidates save jobs to apply later. All routes require candidate JWT."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.session import get_db
from app.core.deps import get_current_candidate
from app.models import SavedJob, Job, Candidate

router = APIRouter(prefix="/saved-jobs", tags=["saved-jobs"])


def _job_to_item(job: Job) -> dict:
    return {
        "id": str(job.id),
        "title": job.title,
        "description": (job.description or "")[:200],
        "location": job.location,
        "remote": job.remote,
    }


@router.get("")
def list_saved_jobs(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """List jobs saved by the current candidate (candidate JWT required)."""
    saved = db.query(SavedJob).filter(SavedJob.candidate_id == candidate.id).order_by(SavedJob.created_at.desc()).all()
    result = []
    for s in saved:
        job = db.query(Job).filter(Job.id == s.job_id).first()
        if job:
            result.append({
                **_job_to_item(job),
                "saved_at": s.created_at.isoformat() if s.created_at else None,
            })
    return result


@router.post("")
def save_job(
    job_id: UUID = Query(...),
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Save a job for later (candidate JWT required)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = db.query(SavedJob).filter(
        and_(SavedJob.candidate_id == candidate.id, SavedJob.job_id == job_id)
    ).first()
    if existing:
        return {"status": "ok", "saved": True}
    s = SavedJob(candidate_id=candidate.id, job_id=job_id)
    db.add(s)
    db.commit()
    return {"status": "ok", "saved": True}


@router.delete("")
def unsave_job(
    job_id: UUID = Query(...),
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Remove a saved job (candidate JWT required)."""
    db.query(SavedJob).filter(
        and_(SavedJob.candidate_id == candidate.id, SavedJob.job_id == job_id)
    ).delete()
    db.commit()
    return {"status": "ok", "saved": False}


@router.get("/check")
def check_saved(
    job_id: UUID = Query(...),
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Check if a job is saved by the current candidate (candidate JWT required)."""
    exists = db.query(SavedJob).filter(
        and_(SavedJob.candidate_id == candidate.id, SavedJob.job_id == job_id)
    ).first()
    return {"saved": exists is not None}
