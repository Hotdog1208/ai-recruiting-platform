"""Skill assessments: list, take, submit, and results."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.core.deps import get_current_candidate
from app.models import Assessment, AssessmentResult, Candidate

router = APIRouter(prefix="/assessments", tags=["assessments"])


class SubmitAnswersRequest(BaseModel):
    answers: list[int]  # selected option index per question


def _grade(assessment: Assessment, answers: list[int]) -> tuple[int, bool]:
    """Return (score_percentage, passed)."""
    questions = assessment.questions if isinstance(assessment.questions, list) else []
    if not questions:
        return 0, False
    correct = 0
    for i, q in enumerate(questions):
        if i >= len(answers):
            continue
        correct_idx = q.get("correct_index", q.get("correctIndex"))
        if correct_idx is not None and answers[i] == correct_idx:
            correct += 1
    score = (100 * correct // len(questions)) if questions else 0
    passed = score >= assessment.passing_score
    return score, passed


@router.get("")
def list_assessments(db: Session = Depends(get_db)):
    """List all available assessments (public for browsing; taking requires candidate auth)."""
    rows = db.query(Assessment).order_by(Assessment.skill_name).all()
    return [
        {
            "id": str(a.id),
            "skill_name": a.skill_name,
            "description": a.description,
            "question_count": len(a.questions) if isinstance(a.questions, list) else 0,
            "passing_score": a.passing_score,
            "duration_minutes": a.duration_minutes,
        }
        for a in rows
    ]


@router.get("/{assessment_id}")
def get_assessment(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get assessment with questions (for taking). Optionally strip correct answers for secure delivery."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    questions = a.questions if isinstance(a.questions, list) else []
    # Return questions without correct_index to the client (so they can't cheat)
    safe_questions = []
    for q in questions:
        safe = {k: v for k, v in q.items() if k not in ("correct_index", "correctIndex")}
        safe_questions.append(safe)
    return {
        "id": str(a.id),
        "skill_name": a.skill_name,
        "description": a.description,
        "questions": safe_questions,
        "passing_score": a.passing_score,
        "duration_minutes": a.duration_minutes,
    }


@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: UUID,
    body: SubmitAnswersRequest,
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """Submit answers and get score. Candidate can only have one result per assessment (latest overwrites if re-taken)."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    score, passed = _grade(a, body.answers)
    existing = (
        db.query(AssessmentResult)
        .filter(
            AssessmentResult.candidate_id == candidate.id,
            AssessmentResult.assessment_id == assessment_id,
        )
        .first()
    )
    if existing:
        existing.score = score
        existing.passed = passed
        existing.answers = body.answers
        db.commit()
        db.refresh(existing)
        return {
            "result_id": str(existing.id),
            "score": score,
            "passed": passed,
            "passing_score": a.passing_score,
        }
    result = AssessmentResult(
        candidate_id=candidate.id,
        assessment_id=assessment_id,
        score=score,
        passed=passed,
        answers=body.answers,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return {
        "result_id": str(result.id),
        "score": score,
        "passed": passed,
        "passing_score": a.passing_score,
    }


@router.get("/my/results")
def my_results(
    candidate: Candidate = Depends(get_current_candidate),
    db: Session = Depends(get_db),
):
    """List current candidate's assessment results (for profile badges)."""
    results = (
        db.query(AssessmentResult, Assessment)
        .join(Assessment, Assessment.id == AssessmentResult.assessment_id)
        .filter(AssessmentResult.candidate_id == candidate.id)
        .all()
    )
    return [
        {
            "assessment_id": str(a.id),
            "skill_name": a.skill_name,
            "score": r.score,
            "passed": r.passed,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r, a in results
    ]
