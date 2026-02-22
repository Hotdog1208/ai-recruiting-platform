"""Job-candidate matching API."""
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func
import asyncio

from app.db.session import get_db, get_async_db
from app.core.deps import get_async_current_candidate, get_async_optional_candidate
from app.models import Job, Candidate, ExternalJob, Employer
from app.services.job_matcher import compute_match_score, generate_embedding, get_candidate_text
from app.services.job_aggregator import get_external_jobs

router = APIRouter(prefix="/matching", tags=["matching"])

DEMO_JOBS = [
    {"id": "demo-1", "source": "demo", "title": "Senior Software Engineer", "company": "TechCorp Inc", "location": "San Francisco, CA", "description": "Build scalable systems. 5+ years experience. Python, Go, or Node.", "remote": True, "salary_min": "120000", "salary_max": "180000", "url": None},
    {"id": "demo-2", "source": "demo", "title": "Frontend Developer", "company": "StartupXYZ", "location": "New York, NY", "description": "React/Next.js. Design systems and accessibility.", "remote": False, "salary_min": "95000", "salary_max": "140000", "url": None},
    {"id": "demo-3", "source": "demo", "title": "Data Engineer", "company": "DataFlow", "location": "Remote", "description": "ETL, data pipelines, Spark/SQL. Remote-first.", "remote": True, "salary_min": "110000", "salary_max": "160000", "url": None},
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


def _fast_vector_score(distance: float | None) -> int:
    """Convert pgvector cosine distance (0=identical, 1=orthogonal) to a 0-100 score."""
    if distance is None:
        return 75
    # typical similarities might be 0.6 to 0.9 (distance 0.1 to 0.4). 
    # Let's scale: distance 0.0 -> 100, distance 0.4 -> 60
    score = int((1.0 - distance) * 100)
    return max(0, min(100, score + 10))  # Bump slightly for nicer display


@router.get("/recommended")
async def get_recommended_jobs(
    candidate: Candidate = Depends(get_async_current_candidate),
    limit: int = Query(20, le=50),
    async_db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
):
    """Get jobs recommended for the current candidate leveraging pgvector similarity search."""
    
    # 1. Ensure candidate has an embedding
    if candidate.embedding is None:
        cand_text = get_candidate_text(candidate)
        emb = await generate_embedding(cand_text)
        if emb:
            candidate.embedding = emb
            await async_db.commit()

    results = []
    
    # 2. Vectorized nearest-neighbor query for Platform Jobs (O(1) milliseconds scale)
    if candidate.embedding is not None:
        dist_expr = Job.embedding.cosine_distance(candidate.embedding).label("distance")
        stmt = (
            select(Job, dist_expr)
            .where(Job.embedding != None)
            .order_by(dist_expr)
            .limit(limit)
        )
        result = await async_db.execute(stmt)
        for job, distance in result.all():
            employer_res = await async_db.execute(select(Employer).where(Employer.id == job.employer_id))
            employer = employer_res.scalars().first()
            
            job_dict = {
                "id": str(job.id),
                "source": "platform",
                "title": job.title,
                "company": employer.company_name if employer else None,
                "location": job.location,
                "description": job.description or "",
                "remote": job.remote,
            }
            results.append({
                **job_dict,
                "match_score": _fast_vector_score(distance),
                "match_reason": "Matched via scalable vector semantic search.",
                "suggested_for_you": True if distance < 0.25 else False,
            })
    else:
        # Fallback if embeddings fail entirely
        result = await async_db.execute(select(Job).limit(limit))
        for job in result.scalars().all():
            results.append({
                "id": str(job.id),
                "source": "platform",
                "title": job.title,
                "company": "Platform Employer",
                "location": job.location,
                "description": job.description or "",
                "remote": job.remote,
                "match_score": 50,
                "match_reason": "Semantic search unavailable.",
                "suggested_for_you": False,
            })

    # 3. External jobs (Fallback to sync API call + slow LLM score if needed)
    # Run sync aggregator in executor to not block async loop
    loop = asyncio.get_event_loop()
    external = await loop.run_in_executor(None, get_external_jobs, sync_db, min(limit, 10))
    
    cand_dict = _candidate_to_dict(candidate)
    for ext in external:
        # We compute LLM match for a small number of external jobs (since no embeddings natively)
        match = compute_match_score(cand_dict, ext)
        results.append({
            **ext,
            "match_score": match["score"],
            "match_reason": match["reason"],
            "suggested_for_you": match.get("suggested_for_you", False),
        })

    # Sort: suggested first, then score
    results.sort(key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)), reverse=True)
    return results[:limit]


@router.get("/browse")
async def browse_all_jobs(
    candidate: Candidate | None = Depends(get_async_optional_candidate),
    include_external: bool = Query(True),
    q: str | None = Query(None, description="Search in title/description"),
    location: str | None = Query(None, description="Filter by location (contains)"),
    remote: bool | None = Query(None, description="Filter by remote-only"),
    async_db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
):
    """Browse all jobs (platform + external) asynchronously."""
    
    stmt = select(Job)
    if q and q.strip():
        q_pattern = f"%{q.strip()}%"
        stmt = stmt.where(or_(Job.title.ilike(q_pattern), func.coalesce(Job.description, "").ilike(q_pattern)))
    if location and location.strip():
        loc_pattern = f"%{location.strip()}%"
        stmt = stmt.where(func.coalesce(Job.location, "").ilike(loc_pattern))
    if remote is True:
        stmt = stmt.where(Job.remote == True)
        
    # If candidate is logged in and has embedding, sort by distance!
    if candidate and candidate.embedding is not None:
        dist_expr = Job.embedding.cosine_distance(candidate.embedding).label("distance")
        stmt = stmt.add_columns(dist_expr)
        stmt = stmt.order_by(dist_expr)
    
    result = await async_db.execute(stmt)
    
    results = []
    # If we added columns, result.all() returns tuples
    if candidate and candidate.embedding is not None:
        rows = result.all()
    else:
        rows = [(job, None) for job in result.scalars().all()]
        
    for job, distance in rows:
        employer_res = await async_db.execute(select(Employer).where(Employer.id == job.employer_id))
        employer = employer_res.scalars().first()
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
            if distance is not None:
                item["match_score"] = _fast_vector_score(distance)
                item["match_reason"] = "Matched via semantic vector search."
                item["suggested_for_you"] = True if distance < 0.25 else False
            else:
                item["match_score"] = 50
                item["match_reason"] = "Semantic score unavailable."
                item["suggested_for_you"] = False
        results.append(item)

    if include_external:
        loop = asyncio.get_event_loop()
        try:
            external = await loop.run_in_executor(None, get_external_jobs, sync_db, 20, q)
        except Exception:
            external = []
            
        cand_dict = _candidate_to_dict(candidate) if candidate else None
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
            if cand_dict:
                match = compute_match_score(cand_dict, item)
                item["match_score"] = match["score"]
                item["match_reason"] = match["reason"]
                item["suggested_for_you"] = match.get("suggested_for_you", False)
            results.append(item)

    if not results:
        results = [dict(j) for j in DEMO_JOBS]
        # minimal filtering for demo
        
    if candidate:
        results.sort(key=lambda x: (x.get("suggested_for_you", False), x.get("match_score", 0)), reverse=True)
        
    return results
