"""Fallback resume parsing when OpenAI is unavailable. Extracts basics via regex/heuristics."""
import re
from typing import Any


def _extract_emails(text: str) -> list[str]:
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    return list(dict.fromkeys(re.findall(pattern, text)))


def _extract_phones(text: str) -> list[str]:
    # Common phone patterns
    pattern = r"(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}"
    return list(dict.fromkeys(re.findall(pattern, text)))


def _extract_links(text: str) -> list[str]:
    url_pattern = r"https?://[^\s<>\"']+"
    urls = re.findall(url_pattern, text)
    linkedin = [u for u in urls if "linkedin.com" in u.lower()]
    github = [u for u in urls if "github.com" in u.lower()]
    other = [u for u in urls if u not in linkedin and u not in github]
    return linkedin[:2] + github[:2] + other[:3]


def _guess_name(text: str) -> str | None:
    """Best-effort: first line that looks like a name (2–4 words, no URL, no all-caps long)."""
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    for line in lines[:15]:
        if re.search(r"@|http|\.com|resume|cv|objective|summary|experience|education", line, re.I):
            continue
        words = line.split()
        if 2 <= len(words) <= 4 and len(line) < 50:
            return line
    return None


def _extract_education_section(text: str) -> list[dict[str, Any]]:
    entries = []
    edu_keywords = r"education|academic|degree|university|college|school|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|ph\.?d|bachelor|master"
    parts = re.split(re.compile(edu_keywords, re.I), text, maxsplit=1)
    if len(parts) < 2:
        return entries
    section = parts[1][:2000]
    lines = [ln.strip() for ln in section.split("\n") if ln.strip()]
    current = {}
    for line in lines[:20]:
        if re.match(r"^[\d\-–]+$", line) or len(line) < 3:
            continue
        if any(x in line.lower() for x in ["university", "college", "institute", "school"]):
            if current:
                entries.append(current)
            current = {"institution": line[:200], "degree": "", "field": None, "year": None}
        elif current and ("bachelor" in line.lower() or "master" in line.lower() or "phd" in line.lower() or "b.s" in line.lower() or "m.s" in line.lower() or "ba " in line.lower() or "ms " in line.lower()):
            current["degree"] = line[:150]
        elif current and re.search(r"20\d{2}|19\d{2}", line):
            current["year"] = re.search(r"20\d{2}|19\d{2}", line).group(0)
    if current:
        entries.append(current)
    return entries[:5]


def _extract_skills_keywords(text: str) -> list[str]:
    common = [
        "python", "javascript", "java", "react", "node", "sql", "aws", "docker", "kubernetes",
        "typescript", "html", "css", "git", "rest", "api", "agile", "scrum", "leadership",
        "communication", "analytics", "machine learning", "data analysis", "excel", "project management",
    ]
    lower = text.lower()
    found = [s for s in common if s in lower]
    # Also single-capitalized words that look like skills (short)
    words = re.findall(r"\b[A-Z][a-z]{2,15}\b", text)
    for w in words[:30]:
        if w.lower() not in found and len(found) < 25:
            found.append(w.lower())
    return list(dict.fromkeys(found))[:20]


def _extract_experience_section(text: str) -> list[dict[str, Any]]:
    entries = []
    exp_keywords = r"experience|employment|work history|professional"
    parts = re.split(re.compile(exp_keywords, re.I), text, maxsplit=1)
    if len(parts) < 2:
        return entries
    section = parts[1][:3000]
    lines = [ln.strip() for ln in section.split("\n") if ln.strip()]
    current = {}
    for line in lines[:25]:
        if len(line) < 4:
            continue
        # Job title often at start of line; company may follow or on next line
        if current and not current.get("company") and (" at " in line or " - " in line or " | " in line):
            parts_line = re.split(r"\s+at\s+|\s+-\s+|\s+\|\s+", line, maxsplit=1)
            if len(parts_line) >= 2:
                current["company"] = parts_line[1][:150]
        if re.search(r"20\d{2}\s*[-–]\s*20\d{2}|20\d{2}\s*[-–]\s*Present|20\d{2}\s*[-–]\s*now", line, re.I) or re.search(r"\d+\s*years?", line, re.I):
            if current:
                current["duration"] = line[:80]
                entries.append(current)
            current = {"title": line[:150], "company": "", "duration": None, "highlights": []}
        elif current and not current.get("title") and len(line) > 3:
            current["title"] = line[:150]
    if current:
        entries.append(current)
    return entries[:5]


def parse_resume_fallback(text: str) -> dict[str, Any]:
    """Extract structured data without AI. Returns same shape as AI parser where possible."""
    if not text or len(text.strip()) < 20:
        return {
            "full_name": None,
            "email": None,
            "phone": None,
            "location": None,
            "summary": None,
            "skills": [],
            "education": [],
            "experience": [],
            "certifications": [],
            "strengths": [],
            "job_fit_indicators": [],
            "suggested_roles": [],
        }
    emails = _extract_emails(text)
    phones = _extract_phones(text)
    links = _extract_links(text)
    return {
        "full_name": _guess_name(text),
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "location": None,
        "summary": None,
        "skills": _extract_skills_keywords(text),
        "education": _extract_education_section(text),
        "experience": _extract_experience_section(text),
        "certifications": [],
        "strengths": [],
        "job_fit_indicators": [],
        "suggested_roles": [],
        "_links": links[:5],
    }
