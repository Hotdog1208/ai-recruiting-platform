"""
Public platform stats. Minimal, efficient queries. No auth required.
"""
from fastapi import APIRouter
from sqlalchemy import text

from app.db.session import engine

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def get_platform_stats() -> dict:
    """Returns aggregate platform metrics for marketing/trust. Single round-trip."""
    with engine.connect() as conn:
        jobs_count = conn.execute(text("SELECT COUNT(*) FROM jobs")).scalar() or 0
        apps_count = conn.execute(text("SELECT COUNT(*) FROM applications")).scalar() or 0
        candidates_count = conn.execute(text("SELECT COUNT(*) FROM candidates")).scalar() or 0
        employers_count = conn.execute(text("SELECT COUNT(DISTINCT user_id) FROM employers")).scalar() or 0
    return {
        "jobs_posted": jobs_count,
        "applications": apps_count,
        "candidates": candidates_count,
        "employers": employers_count,
        "matches_ytd": apps_count,
    }
