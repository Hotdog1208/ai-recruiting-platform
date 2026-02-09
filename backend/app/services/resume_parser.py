"""AI-powered resume parsing using OpenAI."""
import os
import json
from openai import OpenAI


def _get_client():
    key = os.getenv("OPENAI_API_KEY") or "sk-placeholder"
    return OpenAI(api_key=key)

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
  "job_fit_indicators": ["job titles/role types this person is well-suited for based on experience and skills, e.g. 'Software Engineer', 'Data Analyst', 'Product Manager'"],
  "suggested_roles": ["job titles the candidate might NOT have considered but would be a strong fit - roles where their skills/experience transfer well, e.g. someone with analytics + communication could be 'Solutions Consultant'"]
}

Rules:
- Only include facts from the resume. Use null for missing fields.
- For skills, extract technical and soft skills. No discriminatory attributes.
- job_fit_indicators: roles they clearly qualify for based on stated experience.
- suggested_roles: roles where their background is a GREAT fit but they might not search for—suggest 2-4 based on transferable skills.
- Be concise. Max 15 skills, 5 experience entries, 5 strengths, 5 job_fit_indicators, 4 suggested_roles."""


def parse_resume_text(text: str) -> dict:
    """Parse resume text with OpenAI and return structured data."""
    if not text or len(text.strip()) < 50:
        raise ValueError("Resume text too short to parse")
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY not configured")
    
    client = _get_client()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You extract structured data from resumes. Return only valid JSON."},
            {"role": "user", "content": f"{RESUME_EXTRACT_PROMPT}\n\n---\n\nResume text:\n\n{text[:12000]}"}
        ],
        temperature=0.1,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)
