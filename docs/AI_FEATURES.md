# AI-Powered Features (Indeed on Steroids)

## Architecture Overview

```
Resume (PDF/DOCX) → AI Parser → Structured Profile → Match Engine → Recommended Jobs
                                                          ↓
External APIs (Adzuna) → Job Aggregator → External Jobs DB
```

## 1. Resume Upload & AI Parsing

**Flow:**
1. Candidate uploads PDF, DOCX, or TXT on Profile page
2. Backend extracts text (pypdf, python-docx)
3. OpenAI GPT-4o-mini parses into structured JSON:
   - full_name, location, email, phone
   - skills (technical + soft)
   - education, experience
   - certifications, strengths
   - **job_fit_indicators** ( inferred role types)

**Bias mitigation:** Prompt instructs AI to exclude discriminatory attributes. Only skills, experience, certifications, location.

## 2. AI Job Matching

**Flow:**
1. Candidate has parsed resume (or manual profile)
2. For each job (platform + external), AI computes:
   - **Match score** (0–100)
   - **Reason** (1–2 sentence explanation)

**Candidate dashboard:**
- **Recommended for you** – Jobs sorted by AI match score
- **Browse all jobs** – Platform + external jobs (with scores when resume is parsed)

## 3. Job Aggregation (External Sources)

**Adzuna API** – Free job listings (UK, US, etc.)

- Fetches jobs on demand
- Stores in `external_jobs` table
- Candidates see them in browse + recommended
- Employers see in **Market jobs** page

**Adding more sources:** Extend `job_aggregator.py` (e.g. JSearch, Remote OK).

## 4. Candidate UX

- Upload resume → AI fills profile
- Recommended jobs (AI-ranked)
- Browse all (platform + external)
- Match % and reason on each card
- Apply on platform jobs; external jobs link to source

## 5. Employer UX

- Post jobs (existing)
- **Market jobs** – View aggregated external listings to see market

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| OPENAI_API_KEY | Yes (for AI) | Resume parsing, job matching |
| ADZUNA_APP_ID | No | External job aggregation |
| ADZUNA_APP_KEY | No | External job aggregation |

Without OPENAI_API_KEY: Resume upload fails; matching returns 50% for all jobs.
Without Adzuna keys: No external jobs; platform jobs only.
