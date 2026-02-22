from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
  # type: ignore  # pyre-ignore\nfrom sqlalchemy.orm import Session
  # type: ignore  # pyre-ignore\n
from app.db.session import get_db
  # type: ignore  # pyre-ignore\nfrom app.core.auth import require_candidate, get_current_user
  # type: ignore  # pyre-ignore\nfrom app.models import Candidate
  # type: ignore  # pyre-ignore\nfrom app.schemas.candidate import CandidateUpdate
  # type: ignore  # pyre-ignore\nfrom app.services.resume_extract import extract_text_from_file
  # type: ignore  # pyre-ignore\nfrom app.services.resume_parser import parse_resume_text
  # type: ignore  # pyre-ignore\nfrom app.services.job_matcher import update_candidate_embedding_task
  # type: ignore  # pyre-ignore\n
router = APIRouter(prefix="/candidates", tags=["candidates"])


def _candidate_response(candidate: Candidate):
    loc = candidate.location
    if not loc and (candidate.city or candidate.state or candidate.country):
        loc = ", ".join(filter(None, [candidate.city, candidate.state, candidate.country]))
    return {
        "id": str(candidate.id),
        "full_name": candidate.full_name,
        "location": loc,
        "city": candidate.city,
        "state": candidate.state,
        "country": candidate.country,
        "age": candidate.age,
        "work_preference": candidate.work_preference,
        "work_type": candidate.work_type,
        "phone": candidate.phone,
        "headline": candidate.headline,
        "summary": candidate.summary,
        "education": candidate.education,
        "experience": candidate.experience,
        "skills": candidate.skills,
        "resume_url": candidate.resume_url,
        "video_url": getattr(candidate, "video_url", None),
        "resume_parsed_data": candidate.resume_parsed_data,
    }


@router.get("/me")
def get_candidate_me(
    current: dict = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    """Get current candidate profile (candidate-only)."""
    candidate = db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return _candidate_response(candidate)


@router.put("/me")
def update_candidate_me(
    payload: CandidateUpdate,
    background_tasks: BackgroundTasks,
    current: dict = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    """Update current candidate profile (candidate-only)."""
    candidate = db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if payload.full_name is not None:
        candidate.full_name = payload.full_name
    if payload.location is not None:
        candidate.location = payload.location
    if payload.city is not None:
        candidate.city = payload.city
    if payload.state is not None:
        candidate.state = payload.state
    if payload.country is not None:
        candidate.country = payload.country
    if payload.age is not None:
        candidate.age = payload.age
    if payload.work_preference is not None:
        candidate.work_preference = payload.work_preference
    if payload.work_type is not None:
        candidate.work_type = payload.work_type
    if payload.phone is not None:
        candidate.phone = payload.phone
    if payload.headline is not None:
        candidate.headline = payload.headline
    if payload.summary is not None:
        candidate.summary = payload.summary
    if payload.education is not None:
        candidate.education = payload.education
    if payload.experience is not None:
        candidate.experience = payload.experience
    if payload.skills is not None:
        candidate.skills = payload.skills
    if payload.video_url is not None:
        candidate.video_url = payload.video_url
    db.commit()
    background_tasks.add_task(update_candidate_embedding_task, str(candidate.id))
    return {"status": "ok"}


MAX_RESUME_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_RESUME_EXTENSIONS = (".pdf", ".docx", ".doc", ".txt")
MAX_VIDEO_BYTES = 50 * 1024 * 1024  # 50 MB for short intro video
ALLOWED_VIDEO_TYPES = ("video/webm", "video/mp4", "video/quicktime")


def _validate_resume_file(filename: str | None, content: bytes) -> None:
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    fn = (filename or "").lower()
    if not any(fn.endswith(ext) for ext in ALLOWED_RESUME_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Allowed types: PDF, DOCX, TXT")
    
    # Magic byte validation to verify actual file contents
    if fn.endswith(".pdf") and not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF format")
    if fn.endswith((".docx", ".doc")) and not content.startswith(b"PK\x03\x04") and not content.startswith(b"\xd0\xcf\x11\xe0"):
        # PK... is the signature for ZIP/DOCX; \xd0... is the signature for older DOC files.
        raise HTTPException(status_code=400, detail="Invalid MS Word document format")


@router.post("/me/resume")
def upload_resume_me(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current: dict = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    """Upload resume, parse (AI or fallback), and update candidate profile (candidate-only)."""
    candidate = db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    content = file.file.read()
    _validate_resume_file(file.filename, content)
    try:
        text = extract_text_from_file(content, file.filename or "resume.pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        parsed, warnings, ai_used = parse_resume_text(text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if parsed.get("full_name"):
        candidate.full_name = parsed["full_name"]
    if parsed.get("location"):
        candidate.location = parsed["location"]
    if parsed.get("skills"):
        candidate.skills = parsed["skills"]
    if parsed.get("education"):
        candidate.education = parsed["education"]
    if parsed.get("experience"):
        candidate.experience = parsed["experience"]
    candidate.resume_parsed_data = parsed
    if hasattr(candidate, "resume_text"):
        candidate.resume_text = text
    db.commit()
    background_tasks.add_task(update_candidate_embedding_task, str(candidate.id))
    return {"status": "ok", "parsed": parsed, "warnings": warnings, "ai_used": ai_used}


@router.post("/me/video")
def upload_video_me(
    file: UploadFile = File(...),
    current: dict = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    """Upload a short intro video (30–60s). Saves to backend uploads folder and sets candidate.video_url."""
    candidate = db.query(Candidate).filter(Candidate.user_id == current["user_id"]).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    content = file.file.read()
    if len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=400, detail="Video too large (max 50MB)")
    ct = (file.content_type or "").lower()
    if ct not in ALLOWED_VIDEO_TYPES and not (file.filename or "").lower().endswith((".webm", ".mp4", ".mov")):
        raise HTTPException(status_code=400, detail="Allowed: WebM, MP4")

    # Magic byte validation for video files
    if content:
        magic = content[:12]
        is_webm = magic.startswith(b"\x1aE\xdf\xa3")
        is_mp4 = b"ftyp" in magic
        if not (is_webm or is_mp4):
            raise HTTPException(status_code=400, detail="Invalid video format signature")
    uploads_root = Path(__file__).resolve().parent.parent.parent / "uploads" / "videos"
    uploads_root.mkdir(parents=True, exist_ok=True)
    ext = ".webm" if "webm" in ct else ".mp4" if "mp4" in ct or "quicktime" in ct else ".webm"
    path = uploads_root / f"{candidate.id}{ext}"
    path.write_bytes(content)
    candidate.video_url = f"/uploads/videos/{candidate.id}{ext}"
    db.commit()
    return {"status": "ok", "video_url": candidate.video_url}


@router.get("/by-user/{user_id}")
def get_candidate_by_user(
    user_id: UUID,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidate profile by user id (self only)."""
    if current["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return _candidate_response(candidate)


@router.patch("/by-user/{user_id}")
def update_candidate_by_user(
    user_id: UUID,
    payload: CandidateUpdate,
    background_tasks: BackgroundTasks,
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update candidate profile (self only)."""
    if current["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if payload.full_name is not None:
        candidate.full_name = payload.full_name
    if payload.location is not None:
        candidate.location = payload.location
    if payload.city is not None:
        candidate.city = payload.city
    if payload.state is not None:
        candidate.state = payload.state
    if payload.country is not None:
        candidate.country = payload.country
    if payload.age is not None:
        candidate.age = payload.age
    if payload.work_preference is not None:
        candidate.work_preference = payload.work_preference
    if payload.work_type is not None:
        candidate.work_type = payload.work_type
    if payload.phone is not None:
        candidate.phone = payload.phone
    if payload.headline is not None:
        candidate.headline = payload.headline
    if payload.summary is not None:
        candidate.summary = payload.summary
    if payload.education is not None:
        candidate.education = payload.education
    if payload.experience is not None:
        candidate.experience = payload.experience
    if payload.skills is not None:
        candidate.skills = payload.skills
    if payload.video_url is not None:
        candidate.video_url = payload.video_url
    db.commit()
    background_tasks.add_task(update_candidate_embedding_task, str(candidate.id))
    return {"status": "ok"}


@router.post("/by-user/{user_id}/resume")
def upload_and_parse_resume(
    user_id: UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload resume, parse with AI, and update candidate profile (self only)."""
    if current["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    content = file.file.read()
    _validate_resume_file(file.filename, content)

    try:
        text = extract_text_from_file(content, file.filename or "resume.pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        parsed, warnings, ai_used = parse_resume_text(text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Update candidate with parsed data
    if parsed.get("full_name"):
        candidate.full_name = parsed["full_name"]
    if parsed.get("location"):
        candidate.location = parsed["location"]
    if parsed.get("skills"):
        candidate.skills = parsed["skills"]
    if parsed.get("education"):
        candidate.education = parsed["education"]
    if parsed.get("experience"):
        candidate.experience = parsed["experience"]
    candidate.resume_parsed_data = parsed
    db.commit()
    background_tasks.add_task(update_candidate_embedding_task, str(candidate.id))

    return {"status": "ok", "parsed": parsed, "warnings": warnings, "ai_used": ai_used}
