"""
Job aggregation from Adzuna and JSearch (LinkedIn, Indeed, Glassdoor, ZipRecruiter via Google for Jobs).
"""
import os
import hashlib
import httpx
from datetime import datetime
from app.models import ExternalJob
from sqlalchemy.orm import Session

# --- Adzuna ---
ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"
REGIONS = {"gb": "United Kingdom", "us": "United States"}


def fetch_adzuna_jobs(db: Session, region: str = "us", results_per_page: int = 20) -> list[dict]:
    """Fetch jobs from Adzuna API. Requires ADZUNA_APP_ID and ADZUNA_APP_KEY."""
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        return []

    jobs = []
    try:
        resp = httpx.get(
            f"{ADZUNA_BASE}/{region}/search/1",
            params={
                "app_id": app_id,
                "app_key": app_key,
                "results_per_page": results_per_page,
            },
            timeout=15,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        for item in data.get("results", []):
            job = {
                "external_id": f"adzuna_{item.get('id', '')}",
                "source": "adzuna",
                "title": item.get("title", ""),
                "company": item.get("company", {}).get("display_name") if isinstance(item.get("company"), dict) else str(item.get("company", "")),
                "location": item.get("location", {}).get("display_name") if isinstance(item.get("location"), dict) else str(item.get("location", "")),
                "description": item.get("description", ""),
                "url": item.get("redirect_url"),
                "salary_min": str(item.get("salary_min", "")) if item.get("salary_min") else None,
                "salary_max": str(item.get("salary_max", "")) if item.get("salary_max") else None,
                "raw_data": item,
            }
            jobs.append(job)
            _upsert_external_job(db, job)
        db.commit()
    except Exception:
        pass
    return jobs


# --- JSearch (LinkedIn, Indeed, Glassdoor, ZipRecruiter via Google for Jobs) ---
JSEARCH_BASE = "https://jsearch.p.rapidapi.com"


def fetch_jsearch_jobs(db: Session, query: str = "software engineer", num_pages: int = 1, country: str = "us") -> list[dict]:
    """
    Fetch jobs from JSearch API. Aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter, Monster.
    Requires RAPIDAPI_KEY. Subscribe at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    """
    api_key = os.getenv("RAPIDAPI_KEY") or os.getenv("X_RAPIDAPI_KEY")
    if not api_key:
        return []

    jobs = []
    try:
        resp = httpx.get(
            f"{JSEARCH_BASE}/search",
            params={
                "query": query,
                "page": "1",
                "num_pages": str(num_pages),
                "country": country,
                "date_posted": "all",
            },
            headers={
                "x-rapidapi-host": "jsearch.p.rapidapi.com",
                "x-rapidapi-key": api_key,
            },
            timeout=20,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        if data.get("status") != "OK":
            return []
        for item in data.get("data", []):
            job_id = item.get("job_id") or item.get("job_uuid") or ""
            raw = str(job_id) if job_id else str(item)
            ext_id = f"jsearch_{hashlib.md5(raw.encode(errors='ignore')).hexdigest()[:24]}"
            emp = item.get("employer")
            employer = item.get("employer_name") or (emp.get("name") if isinstance(emp, dict) else str(emp or ""))
            job = {
                "external_id": ext_id,
                "source": "jsearch",
                "title": item.get("job_title", ""),
                "company": employer,
                "location": item.get("job_city") or item.get("job_country") or (item.get("job_location") or {}).get("display_name") if isinstance(item.get("job_location"), dict) else "",
                "description": item.get("job_description", "")[:5000] if item.get("job_description") else "",
                "url": item.get("job_apply_link") or item.get("job_google_link"),
                "salary_min": str(item.get("job_min_salary", "")) if item.get("job_min_salary") else None,
                "salary_max": str(item.get("job_max_salary", "")) if item.get("job_max_salary") else None,
                "raw_data": {k: v for k, v in item.items() if k not in ("job_description",)},
            }
            if not job["location"] and isinstance(item.get("job_location"), dict):
                job["location"] = item["job_location"].get("display_name", "")
            jobs.append(job)
            _upsert_external_job(db, job)
        db.commit()
    except Exception:
        pass
    return jobs


def _upsert_external_job(db: Session, job: dict) -> None:
    """Insert or skip if exists (by external_id + source)."""
    existing = db.query(ExternalJob).filter(
        ExternalJob.external_id == job["external_id"],
        ExternalJob.source == job["source"],
    ).first()
    if not existing:
        ej = ExternalJob(**job)
        db.add(ej)


def fetch_all_sources(db: Session, query: str = "software engineer", country: str = "us") -> list[dict]:
    """
    Fetch from Adzuna and JSearch. JSearch aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter.
    """
    fetch_adzuna_jobs(db, region="us")
    return fetch_jsearch_jobs(db, query=query, num_pages=1, country=country)


def get_external_jobs(db: Session, limit: int = 50, query: str | None = None) -> list[dict]:
    """
    Get external jobs from DB. Optionally refresh from all sources first.
    Uses query to trigger JSearch/Indeed fetch if provided.
    """
    if query and query.strip():
        fetch_all_sources(db, query=query.strip()[:100])
    jobs = db.query(ExternalJob).order_by(ExternalJob.fetched_at.desc()).limit(limit).all()
    return [
        {
            "id": str(j.id),
            "source": j.source,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "description": (j.description or "")[:500],
            "url": j.url,
            "salary_min": j.salary_min,
            "salary_max": j.salary_max,
        }
        for j in jobs
    ]
