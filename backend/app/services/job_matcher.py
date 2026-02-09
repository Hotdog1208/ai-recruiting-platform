"""AI-powered job-candidate matching."""
import os
import json
from openai import OpenAI


def _get_client():
    key = os.getenv("OPENAI_API_KEY") or "sk-placeholder"
    return OpenAI(api_key=key)

MATCH_PROMPT = """Given a candidate profile and a job listing, score how well the candidate fits the job from 0-100.

Candidate profile:
- Skills: {skills}
- Experience summary: {experience}
- Job fit indicators (roles they suit): {job_fit}
- Suggested roles (roles they might not consider but fit well): {suggested_roles}
- Location: {location}

Job:
- Title: {job_title}
- Company: {company}
- Description: {job_description}
- Location: {job_location}

Return ONLY a JSON object: {{"score": number 0-100, "reason": "1-2 sentence explanation of fit", "suggested_for_you": boolean}}
- suggested_for_you: true if this job matches suggested_roles OR is a strong fit (score>=75) for a role type they might not have searched for. false otherwise.
No markdown. No other text."""


def compute_match_score(
    candidate: dict,
    job: dict,
) -> dict:
    """Compute match score (0-100) and reason using OpenAI."""
    if not os.getenv("OPENAI_API_KEY"):
        return {"score": 50, "reason": "AI matching not configured"}
    
    skills = candidate.get("skills") or []
    if isinstance(skills, list):
        skills = ", ".join(str(s) for s in skills[:20])
    else:
        skills = str(skills)

    experience = candidate.get("experience") or []
    if isinstance(experience, list):
        exp_str = "; ".join(
            f"{e.get('title', '')} at {e.get('company', '')}" for e in experience[:5] if isinstance(e, dict)
        )
    else:
        exp_str = str(experience)

    rpd = candidate.get("resume_parsed_data")
    job_fit = (rpd.get("job_fit_indicators") if isinstance(rpd, dict) else None) or []
    if isinstance(job_fit, list):
        job_fit = ", ".join(str(f) for f in job_fit)
    else:
        job_fit = str(job_fit)
    suggested_roles = (rpd.get("suggested_roles") if isinstance(rpd, dict) else None) or []
    if isinstance(suggested_roles, list):
        suggested_roles = ", ".join(str(s) for s in suggested_roles)
    else:
        suggested_roles = str(suggested_roles)

    prompt = MATCH_PROMPT.format(
        skills=skills,
        experience=exp_str or "Not specified",
        job_fit=job_fit or "Not specified",
        suggested_roles=suggested_roles or "None",
        location=candidate.get("location") or "Not specified",
        job_title=job.get("title", ""),
        company=job.get("company", ""),
        job_description=(job.get("description") or "")[:800],
        job_location=job.get("location") or "Not specified",
    )

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return {
            "score": min(100, max(0, int(data.get("score", 50)))),
            "reason": data.get("reason", ""),
            "suggested_for_you": data.get("suggested_for_you", False),
        }
    except Exception:
        return {"score": 50, "reason": "Unable to compute match", "suggested_for_you": False}
