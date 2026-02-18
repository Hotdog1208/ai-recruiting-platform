# Load backend/.env before any app imports (required for uvicorn --reload subprocess on Windows)
from pathlib import Path
from dotenv import load_dotenv
_load_dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_load_dotenv_path, override=False)

from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles

from app.api import auth, jobs, employers, candidates, users, applications, matching, external_jobs, saved_jobs, webhooks, billing, messaging, assessments, interview, stats
from app.core.config import get_settings
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

app = FastAPI()
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)


def error_response(code: str, message: str, details=None):
    return {"error": {"code": code, "message": message, "details": details}}


@app.exception_handler(HTTPException)
def http_exception_handler(_request: Request, exc: HTTPException):
    details = exc.detail if isinstance(exc.detail, (dict, list)) else None
    msg = str(exc.detail) if not isinstance(exc.detail, dict) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response("http_error", msg, details),
    )


@app.exception_handler(RequestValidationError)
def validation_error_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error_response("validation_error", "Validation failed", exc.errors()),
    )


def _validate_critical_config() -> None:
    """Run on startup: verify DB and JWT, log optional services. Exit 1 if critical config invalid."""
    import sys
    from sqlalchemy import create_engine, text

    try:
        _s = get_settings()
    except Exception as e:
        print(f"\n\u274c Critical configuration failed: {e}\n")
        sys.exit(1)

    errors: list[str] = []

    # Database reachable
    try:
        url = str(_s.DATABASE_URL)
        if url.startswith("postgres://"):
            url = "postgresql://" + url[11:]
        engine = create_engine(url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("\u2705 Database connection: OK")
    except Exception as e:
        errors.append(f"Database: {e!s}")

    # JWT secret
    if not _s.SUPABASE_JWT_SECRET or len(_s.SUPABASE_JWT_SECRET) < 32:
        errors.append("SUPABASE_JWT_SECRET missing or too short")
    else:
        print("\u2705 SUPABASE_JWT_SECRET: OK")

    if errors:
        print("\n\u274c Fix backend/.env and restart:")
        for err in errors:
            print(f"  \u2022 {err}")
        print()
        sys.exit(1)

    # Optional
    if not _s.OPENAI_API_KEY or _s.OPENAI_API_KEY.strip().startswith(("your_", "paste_", "sk-placeholder")):
        print("\u26a0\ufe0f OPENAI_API_KEY not set or placeholder \u2014 resume parsing uses fallback")
    else:
        print("\u2705 OPENAI_API_KEY: set")
    if not _s.STRIPE_SECRET_KEY:
        print("\u26a0\ufe0f Stripe not configured \u2014 payments disabled")
    else:
        print("\u2705 Stripe: configured")
    print()


_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup_validate() -> None:
    _validate_critical_config()

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(employers.router)
app.include_router(candidates.router)
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(matching.router)
app.include_router(external_jobs.router)
app.include_router(saved_jobs.router)
app.include_router(webhooks.router)
app.include_router(billing.router)
app.include_router(messaging.router)
app.include_router(assessments.router)
app.include_router(interview.router)
app.include_router(stats.router)


# Optional: serve uploaded candidate videos (backend/uploads/videos/)
_uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
if _uploads_dir.exists():
    app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/config")
def debug_config():
    """Dev only: return booleans for config presence. No secrets."""
    import os
    if os.getenv("ENV", os.getenv("ENVIRONMENT", "")).lower() == "production":
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not available")
    from app.core.config import get_settings
    s = get_settings()
    return {
        "has_database_url": bool(s.DATABASE_URL),
        "has_supabase_secret": bool(s.SUPABASE_JWT_SECRET),
        "has_openai_key": bool(s.OPENAI_API_KEY),
        "has_stripe_key": bool(s.STRIPE_SECRET_KEY),
        "has_stripe_webhook_secret": bool(s.STRIPE_WEBHOOK_SECRET),
        "has_rapidapi_key": bool(s.RAPIDAPI_KEY),
        "has_adzuna": bool(s.ADZUNA_APP_ID and s.ADZUNA_APP_KEY),
    }
