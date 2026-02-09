from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Candidate
from app.schemas.candidate import CandidateUpdate
from app.services.resume_extract import extract_text_from_file
from app.services.resume_parser import parse_resume_text

router = APIRouter(prefix="/candidates", tags=["candidates"])


@router.get("/by-user/{user_id}")
def get_candidate_by_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get candidate profile by Supabase user id."""
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
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
        "resume_parsed_data": candidate.resume_parsed_data,
    }


@router.patch("/by-user/{user_id}")
def update_candidate_by_user(user_id: UUID, payload: CandidateUpdate, db: Session = Depends(get_db)):
    """Update candidate profile."""
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
    db.commit()
    return {"status": "ok"}


@router.post("/by-user/{user_id}/resume")
def upload_and_parse_resume(user_id: UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload resume, parse with AI, and update candidate profile."""
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    content = file.file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        text = extract_text_from_file(content, file.filename or "resume.pdf")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        parsed = parse_resume_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

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

    return {"status": "ok", "parsed": parsed}
