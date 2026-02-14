"""Job-candidate matching API."""
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_candidate, get_optional_candidate
from app.models import Job, Candidate, ExternalJob, Employer
from app.services.job_matcher import compute_match_score
from app.services.job_aggregator import get_external_jobs

router = APIRouter(prefix="/matching", tags=["matching"])

# Curated demo jobs when DB and external APIs have none (no keys or empty DB).
DEMO_JOBS = [
    {"id": "demo-1", "source": "demo", "title": "Senior Software Engineer", "company": "TechCorp Inc", "location": "San Francisco, CA", "description": "Build scalable systems. 5+ years experience. Python, Go, or Node.", "remote": True, "salary_min": "120000", "salary_max": "180000", "url": None},
    {"id": "demo-2", "source": "demo", "title": "Frontend Developer", "company": "StartupXYZ", "location": "New York, NY", "description": "React/Next.js. Design systems and accessibility.", "remote": False, "salary_min": "95000", "salary_max": "140000", "url": None},
    {"id": "demo-3", "source": "demo", "title": "Data Engineer", "company": "DataFlow", "location": "Remote", "description": "ETL, data pipelines, Spark/SQL. Remote-first.", "remote": True, "salary_min": "110000", "salary_max": "160000", "url": None},
    {"id": "demo-4", "source": "demo", "title": "Product Manager", "company": "ProductLabs", "location": "Austin, TX", "description": "Own roadmap and stakeholder alignment. 3+ years PM.", "remote": True, "salary_min": "100000", "salary_max": "150000", "url": None},
    {"id": "demo-5", "source": "demo", "title": "DevOps Engineer", "company": "CloudScale", "location": "Seattle, WA", "description": "Kubernetes, AWS/GCP, CI/CD. On-call rotation.", "remote": False, "salary_min": "130000", "salary_max": "170000", "url": None},
    {"id": "demo-6", "source": "demo", "title": "UX Designer", "company": "DesignStudio", "location": "Chicago, IL", "description": "User research, prototyping, Figma. B2B SaaS experience.", "remote": True, "salary_min": "85000", "salary_max": "125000", "url": None},
    {"id": "demo-7", "source": "demo", "title": "Backend Engineer", "company": "API First", "location": "Denver, CO", "description": "REST/GraphQL APIs, PostgreSQL, Redis.", "remote": True, "salary_min": "115000", "salary_max": "155000", "url": None},
    {"id": "demo-8", "source": "demo", "title": "ML Engineer", "company": "AILabs", "location": "Boston, MA", "description": "Training and deploying models. PyTorch/TensorFlow.", "remote": False, "salary_min": "140000", "salary_max": "190000", "url": None},
    {"id": "demo-9", "source": "demo", "title": "Full Stack Developer", "company": "WebAgency", "location": "Remote", "description": "React + Node. Agency environment, multiple clients.", "remote": True, "salary_min": "90000", "salary_max": "130000", "url": None},
    {"id": "demo-10", "source": "demo", "title": "Security Engineer", "company": "SecureNet", "location": "Washington, DC", "description": "AppSec, penetration testing, compliance.", "remote": True, "salary_min": "125000", "salary_max": "175000", "url": None},
]


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
    candidate: Candidate = Depends(get_current_candidate),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Get jobs recommended for the current candidate by AI match score (candidate JWT required)."""
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
    candidate: Candidate | None = Depends(get_optional_candidate),
    include_external: bool = Query(True),
    q: str | None = Query(None, description="Search in title/description"),
    location: str | None = Query(None, description="Filter by location (contains)"),
    remote: bool | None = Query(None, description="Filter by remote-only"),
    db: Session = Depends(get_db),
):
    """Browse all jobs (platform + external). If candidate JWT is sent, includes match scores."""
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
        try:
            external = get_external_jobs(db, limit=50, query=q)
        except Exception:
            external = []
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

    if not results:
        # No platform or external jobs: return demo list (filter by q/location/remote if provided).
        results = [dict(j) for j in DEMO_JOBS]
        if q and q.strip():
            q_lower = q.strip().lower()
            results = [j for j in results if q_lower in (j.get("title") or "").lower() or q_lower in (j.get("description") or "").lower() or q_lower in (j.get("company") or "").lower()]
        if location and location.strip():
            loc_lower = location.strip().lower()
            results = [j for j in results if loc_lower in (j.get("location") or "").lower()]
        if remote is True:
            results = [j for j in results if j.get("remote") is True]
        if candidate:
            for j in results:
                match = compute_match_score(_candidate_to_dict(candidate), j)
                j["match_score"] = match["score"]
                j["match_reason"] = match["reason"]
                j["suggested_for_you"] = match.get("suggested_for_you", False)
            results.sort(key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)), reverse=True)
    elif candidate:
        results.sort(
            key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)),
            reverse=True,
        )
    return results
