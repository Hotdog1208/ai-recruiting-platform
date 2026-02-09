"""Job-candidate matching API."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Job, Candidate, ExternalJob, Employer
from app.services.job_matcher import compute_match_score
from app.services.job_aggregator import get_external_jobs

router = APIRouter(prefix="/matching", tags=["matching"])


def _candidate_to_dict(c: Candidate) -> dict:
    loc = c.location
    if not loc and (c.city or c.state or c.country):
        loc = ", ".join(filter(None, [c.city, c.state, c.country]))
    return {
        "id": str(c.id),
        "full_name": c.full_name,
        "location": loc,
        "work_preference": c.work_preference,
        "work_type": c.work_type,
        "skills": c.skills,
        "experience": c.experience,
        "resume_parsed_data": c.resume_parsed_data,
    }


@router.get("/recommended")
def get_recommended_jobs(
    user_id: UUID = Query(...),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Get jobs recommended for candidate by AI match score."""
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    cand_dict = _candidate_to_dict(candidate)

    # Get platform jobs
    platform_jobs = db.query(Job).all()
    results = []

    score_limit = min(limit, 15)  # Cap API calls
    for job in platform_jobs[:score_limit]:
        employer = db.query(Employer).filter(Employer.id == job.employer_id).first()
        job_dict = {
            "id": str(job.id),
            "source": "platform",
            "title": job.title,
            "company": employer.company_name if employer else None,
            "location": job.location,
            "description": job.description or "",
            "remote": job.remote,
        }
        match = compute_match_score(cand_dict, job_dict)
        results.append({
            **job_dict,
            "match_score": match["score"],
            "match_reason": match["reason"],
            "suggested_for_you": match.get("suggested_for_you", False),
        })

    # Get external jobs and score them
    external = get_external_jobs(db, limit=min(score_limit - len(results), 20))
    for ext in external:
        match = compute_match_score(cand_dict, ext)
        results.append({
            **ext,
            "match_score": match["score"],
            "match_reason": match["reason"],
            "suggested_for_you": match.get("suggested_for_you", False),
        })

    # Sort: suggested_for_you first, then by match score descending
    results.sort(
        key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)),
        reverse=True,
    )
    return results[:limit]


@router.get("/browse")
def browse_all_jobs(
    user_id: UUID | None = Query(None),
    include_external: bool = Query(True),
    q: str | None = Query(None, description="Search in title/description"),
    location: str | None = Query(None, description="Filter by location (contains)"),
    remote: bool | None = Query(None, description="Filter by remote-only"),
    db: Session = Depends(get_db),
):
    """Browse all jobs (platform + external). With user_id, includes match scores."""
    from sqlalchemy import or_, func

    platform_query = db.query(Job)
    if q and q.strip():
        q_pattern = f"%{q.strip()}%"
        platform_query = platform_query.filter(
            or_(
                Job.title.ilike(q_pattern),
                func.coalesce(Job.description, "").ilike(q_pattern),
            )
        )
    if location and location.strip():
        loc_pattern = f"%{location.strip()}%"
        platform_query = platform_query.filter(
            func.coalesce(Job.location, "").ilike(loc_pattern)
        )
    if remote is True:
        platform_query = platform_query.filter(Job.remote == True)
    platform_jobs = platform_query.all()
    results = []

    candidate = None
    if user_id:
        candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()

    for job in platform_jobs:
        employer = db.query(Employer).filter(Employer.id == job.employer_id).first()
        item = {
            "id": str(job.id),
            "source": "platform",
            "title": job.title,
            "company": employer.company_name if employer else None,
            "location": job.location,
            "description": (job.description or "")[:300],
            "remote": job.remote,
        }
        if candidate:
            match = compute_match_score(_candidate_to_dict(candidate), item)
            item["match_score"] = match["score"]
            item["match_reason"] = match["reason"]
            item["suggested_for_you"] = match.get("suggested_for_you", False)
        results.append(item)

    if include_external:
        external = get_external_jobs(db, limit=50, query=q)
        for ext in external:
            if q and q.strip():
                q_lower = q.strip().lower()
                if q_lower not in (ext.get("title") or "").lower() and q_lower not in (ext.get("description") or "").lower():
                    continue
            if location and location.strip():
                loc = (ext.get("location") or "").lower()
                if location.strip().lower() not in loc:
                    continue
            item = {**ext}
            if candidate:
                match = compute_match_score(_candidate_to_dict(candidate), ext)
                item["match_score"] = match["score"]
                item["match_reason"] = match["reason"]
                item["suggested_for_you"] = match.get("suggested_for_you", False)
            results.append(item)

    if candidate:
        results.sort(
            key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)),
            reverse=True,
        )
    return results
