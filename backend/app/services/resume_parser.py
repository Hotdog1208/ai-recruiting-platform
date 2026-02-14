"""Resume parsing: OpenAI when available, fallback otherwise. Never log raw content."""
import os
import json
import logging
from openai import OpenAI, AuthenticationError, APIError

from app.services.resume_fallback import parse_resume_fallback

logger = logging.getLogger(__name__)

RESUME_EXTRACT_PROMPT = """Extract structured data from this resume text. Return ONLY valid JSON with this exact structure. No markdown, no explanation.

{
  "full_name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "brief professional summary or null",
  "skills": ["skill1", "skill2"],
  "education": [
    {"institution": "string", "degree": "string", "field": "string or null", "year": "string or null"}
  ],
  "experience": [
    {"title": "string", "company": "string", "duration": "string or null", "highlights": ["string"]}
  ],
  "certifications": ["string or null"],
  "strengths": ["area of strength"],
  "job_fit_indicators": ["job titles/role types this person is well-suited for"],
  "suggested_roles": ["job titles the candidate might not have considered but would be a strong fit"]
}

Rules: Only include facts from the resume. Use null for missing fields. No discriminatory attributes. Be concise."""


def parse_resume_text(text: str) -> tuple[dict, list[str], bool]:
    """
    Parse resume text. Tries OpenAI first; on missing key or auth/API error uses fallback.
    Returns (parsed_dict, warnings, ai_used).
    """
    if not text or len(text.strip()) < 50:
        raise ValueError("Resume text too short to parse")

    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key or api_key.startswith("sk-placeholder"):
        fallback = parse_resume_fallback(text)
        return fallback, ["AI parsing unavailable (no OPENAI_API_KEY). Basic extraction used."], False

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You extract structured data from resumes. Return only valid JSON."},
                {"role": "user", "content": f"{RESUME_EXTRACT_PROMPT}\n\n---\n\nResume text:\n\n{text[:12000]}"},
            ],
            temperature=0.1,
        )
        raw = (response.choices[0].message.content or "").strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        parsed = json.loads(raw)
        return parsed, [], True
    except AuthenticationError as e:
        logger.warning("OpenAI auth failed: %s", type(e).__name__)
        fallback = parse_resume_fallback(text)
        return fallback, ["AI parsing unavailable (invalid OPENAI_API_KEY). Basic extraction used."], False
    except (APIError, json.JSONDecodeError, Exception) as e:
        logger.warning("OpenAI parse failed: %s", type(e).__name__)
        fallback = parse_resume_fallback(text)
        return fallback, [f"AI parsing failed ({type(e).__name__}). Basic extraction used."], False
