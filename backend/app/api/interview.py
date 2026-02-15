"""AI-powered interview question generation and answer evaluation."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.ai.service import ai_complete, is_ai_configured

router = APIRouter(prefix="/interview", tags=["interview"])


class GenerateQuestionsRequest(BaseModel):
    role: str = "Software Engineer"


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str


@router.get("/status")
def interview_status():
    """Whether AI interview features are available."""
    return {"available": is_ai_configured()}


@router.post("/generate-questions")
async def generate_questions(
    body: GenerateQuestionsRequest,
    current: dict = Depends(get_current_user),
):
    """Generate 5-7 role-specific interview questions (behavioral + technical)."""
    role = (body.role or "Software Engineer").strip() or "Software Engineer"
    prompt = f"""Generate exactly 7 short interview questions for the role: "{role}".
Include a mix of behavioral (e.g. tell me about a time...) and role-relevant technical or situational questions.
Return ONLY a JSON array of strings, one question per element. No other text. Example: ["Question 1?", "Question 2?"]"""
    out = await ai_complete(
        prompt,
        system="You are an expert hiring manager. Output only valid JSON array of question strings.",
        max_tokens=600,
    )
    import json
    try:
        if "[" in out and "]" in out:
            start, end = out.index("["), out.rindex("]") + 1
            arr = json.loads(out[start:end])
        else:
            arr = json.loads(out)
        if not isinstance(arr, list):
            arr = [str(arr)]
        questions = [str(q).strip() for q in arr if q][:10]
    except Exception:
        questions = [
            f"Tell me about your experience as a {role}.",
            f"What interests you most about this {role} position?",
            "Describe a challenging project and how you handled it.",
            "How do you stay updated with industry changes?",
            "Where do you see yourself in 3 years?",
        ]
    return {"questions": questions, "role": role}


@router.post("/evaluate-answer")
async def evaluate_answer(
    body: EvaluateAnswerRequest,
    current: dict = Depends(get_current_user),
):
    """Evaluate a candidate's answer and return feedback."""
    q = (body.question or "").strip()
    a = (body.answer or "").strip()
    if not q or not a:
        return {
            "score": 0,
            "feedback": "Please provide both a question and an answer.",
            "suggestions": [],
        }
    prompt = f"""Interview question: {q}
Candidate's answer: {a}

Evaluate this answer in 2-4 sentences. Be constructive. Then suggest one specific improvement if applicable.
Format your response as:
FEEDBACK: (your feedback here)
IMPROVEMENT: (one short suggestion or "None")"""
    out = await ai_complete(prompt, max_tokens=400)
    feedback = out.strip()
    improvement = ""
    if "IMPROVEMENT:" in feedback:
        parts = feedback.split("IMPROVEMENT:", 1)
        feedback = parts[0].replace("FEEDBACK:", "").strip()
        improvement = parts[1].strip() if len(parts) > 1 else ""
    elif "FEEDBACK:" in feedback:
        feedback = feedback.replace("FEEDBACK:", "").strip()
    suggestions = [improvement] if improvement and improvement.lower() != "none" else []
    return {
        "feedback": feedback,
        "suggestions": suggestions,
    }
