"""Saved jobs API - candidates save jobs to apply later."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import SavedJob, Job, Candidate
from sqlalchemy import and_

router = APIRouter(prefix="/saved-jobs", tags=["saved-jobs"])


def _resolve_candidate(candidate_id: UUID | None, user_id: UUID | None, db: Session) -> Candidate | None:
    """Resolve candidate by id or by user_id."""
    if candidate_id:
        return db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if user_id:
        return db.query(Candidate).filter(Candidate.user_id == user_id).first()
    return None


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
    candidate_id: UUID | None = Query(None),
    user_id: UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """List jobs saved by a candidate. Pass candidate_id or user_id."""
    candidate = _resolve_candidate(candidate_id, user_id, db)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
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
    candidate_id: UUID | None = Query(None),
    user_id: UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """Save a job for later. Pass candidate_id or user_id."""
    candidate = _resolve_candidate(candidate_id, user_id, db)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
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
    candidate_id: UUID | None = Query(None),
    user_id: UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """Remove a saved job. Pass candidate_id or user_id."""
    candidate = _resolve_candidate(candidate_id, user_id, db)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.query(SavedJob).filter(
        and_(SavedJob.candidate_id == candidate.id, SavedJob.job_id == job_id)
    ).delete()
    db.commit()
    return {"status": "ok", "saved": False}


@router.get("/check")
def check_saved(
    job_id: UUID = Query(...),
    candidate_id: UUID | None = Query(None),
    user_id: UUID | None = Query(None),
    db: Session = Depends(get_db),
):
    """Check if a job is saved by candidate. Pass candidate_id or user_id."""
    candidate = _resolve_candidate(candidate_id, user_id, db)
    if not candidate:
        return {"saved": False}
    exists = db.query(SavedJob).filter(
        and_(SavedJob.candidate_id == candidate.id, SavedJob.job_id == job_id)
    ).first()
    return {"saved": exists is not None}
