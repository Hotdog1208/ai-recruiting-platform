"""External job aggregation API."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.job_aggregator import get_external_jobs, fetch_all_sources

router = APIRouter(prefix="/external-jobs", tags=["external-jobs"])


@router.get("")
def list_external_jobs(
    limit: int = Query(50, le=100),
    refresh: bool = Query(False),
    q: str | None = Query(None, description="Search query - triggers fetch from JSearch/Indeed"),
    db: Session = Depends(get_db),
):
    """
    List jobs from Adzuna, JSearch (LinkedIn/Indeed/Glassdoor), and Indeed.
    Set refresh=true to fetch fresh data. Use q for search-triggered fetch.
    """
    if refresh:
        fetch_all_sources(db, query=q or "software engineer")
    return get_external_jobs(db, limit=limit, query=q)
