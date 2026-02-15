# How to Get All APIs Working

This doc explains **exactly** what each API needs and **why** something might not be working even when `.env` looks correct.

---

## 1. Make sure the backend is reachable

The frontend calls the backend at **one** URL. That URL is:

- **`NEXT_PUBLIC_API_URL`** in `frontend/.env.local` if set  
- Otherwise **`http://127.0.0.1:8000`** (default)

So:

1. **Backend must be running**  
   From repo root:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Or from `backend/`: `uv run uvicorn app.main:app --reload --port 8000`

2. **Frontend must use that URL**  
   - Local: do **not** set `NEXT_PUBLIC_API_URL` and the app will use `http://127.0.0.1:8000`.  
   - If your frontend runs on another host/port, set in `frontend/.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
     ```
   - CORS: backend `FRONTEND_ORIGIN` in `backend/.env` must include the origin the browser uses (e.g. `http://localhost:3000`). Default is `http://localhost:3000,http://127.0.0.1:3000`.

**Quick check:** Open in browser or curl:

- `http://127.0.0.1:8000/health` → should return `{"status":"ok"}`  
- `http://127.0.0.1:8000/debug/config` → shows which keys are set (no secrets). Only works when `ENV` / `ENVIRONMENT` is not `production`.

If `/health` fails, the frontend will never get jobs, resume, or billing working.

---

## 2. Jobs API

**What the app uses**

- **List (browse) jobs:** `GET /matching/browse`  
  - Used by: Jobs page, dashboard “browse”  
  - Auth: optional (if you send a candidate JWT you get match scores)  
- **Job detail:** `GET /jobs/{job_id}`  
  - Used by: Job detail page  
  - Auth: not required  
- **My jobs (employer):** `GET /jobs/mine`  
  - Auth: required (employer JWT)

**Why “jobs don’t work”**

| Symptom | Cause | Fix |
|--------|--------|-----|
| Empty list / nothing loads | Backend not reachable (wrong URL, not running, CORS) | Fix backend URL and CORS; confirm `/health` returns 200. |
| List shows demo jobs only | Normal when there are no jobs in DB and no external keys | Add real jobs (employer flow) or add Adzuna/RapidAPI keys for external jobs (see below). |
| Clicking a job → 404 | Job list can return **demo** jobs with ids like `demo-1`. Detail endpoint expects a **UUID** (real DB job). | Demo jobs are for listing only; detail only works for real jobs. Create a real job as employer or add external jobs. |

**Optional: more “real” job listings**

- **Adzuna:** In `backend/.env` set `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` (from [developer.adzuna.com](https://developer.adzuna.com/)).  
- **JSearch (RapidAPI):** Set `RAPIDAPI_KEY` and subscribe to JSearch on RapidAPI.  

If these are not set, the backend still returns **demo jobs** on `/matching/browse` so the list is never empty.

---

## 3. Resume parsing API

**What the app uses**

- **Upload + parse:** `POST /candidates/by-user/{user_id}/resume`  
  - Body: multipart file (PDF, DOCX, or TXT)  
  - Used by: Candidate profile page “Upload resume”  
  - Auth: **required** (Supabase JWT). The `user_id` must be the current user’s id.

**Why “resume parsing doesn’t work”**

| Symptom | Cause | Fix |
|--------|--------|-----|
| 401 / “Session expired” | No token or invalid token sent to backend | User must be logged in; frontend must send `Authorization: Bearer <access_token>`. |
| 404 “Candidate not found” | No `Candidate` row for this user | User must have signed up **as candidate** and the app must have called **POST /auth/post-signup** after Supabase signup so the backend created a `User` + `Candidate`. |
| 400 “File too large” / “Allowed types…” | Wrong file type or > 10MB | Use PDF, DOCX, or TXT; max 10MB. |
| Parsing “works” but no AI | No or invalid OpenAI key | See below. |

**OpenAI (AI parsing)**

- **With valid `OPENAI_API_KEY` in `backend/.env`:** Resume is parsed with GPT (better extraction).  
- **Without key or with invalid key:** Backend uses **fallback** parsing (regex/basic extraction). Upload still succeeds; you get a warning like “Basic extraction used.”

So “resume parsing” **always works** in the sense that upload + parse succeeds; only the **quality** depends on OpenAI. To get AI parsing:

1. Add a valid `OPENAI_API_KEY` to `backend/.env` (from OpenAI, with billing enabled if required).  
2. Restart the backend.  
3. Avoid placeholder values; the code treats keys starting with `sk-placeholder` as “no key.”

---

## 4. Stripe / billing API

**What exists**

- **Backend:** `POST /billing/checkout-session` creates a Stripe Checkout session (employer only).  
- **Frontend:** Dashboard → Billing page can call this to “Upgrade” and redirect to Stripe.

**Why “Stripe isn’t working”**

| Symptom | Cause | Fix |
|--------|--------|-----|
| 501 “Billing not configured” | `STRIPE_SECRET_KEY` missing or empty in `backend/.env` | Add Stripe secret key (test key is fine). |
| 501 “No price configured for checkout” | No plan with a Stripe Price ID in the DB | In DB, ensure a row in `plans` has `stripe_price_id` set to a Stripe Price ID (e.g. `price_xxx`). |
| Checkout works but webhooks don’t | `STRIPE_WEBHOOK_SECRET` not set or wrong | For local dev use Stripe CLI to forward events and set `STRIPE_WEBHOOK_SECRET` to the CLI’s signing secret. |

So: **Stripe “working”** = backend has `STRIPE_SECRET_KEY` + at least one plan with `stripe_price_id`. You don’t need payment functions elsewhere for this; the billing page is the payment entry point.

---

## 5. Checklist: “Everything in .env is correct” but APIs still don’t work

Use this order:

1. **Backend running and reachable**  
   - `curl http://127.0.0.1:8000/health` → `{"status":"ok"}`.  
   - If you use another host/port, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to that base URL.

2. **CORS**  
   - Backend `FRONTEND_ORIGIN` must include the origin you use (e.g. `http://localhost:3000`).  
   - Otherwise the browser will block requests.

3. **Required backend env (app won’t start without these)**  
   - `DATABASE_URL` – Postgres connection string (e.g. from Supabase).  
   - `SUPABASE_JWT_SECRET` – From Supabase Project Settings → API → JWT Secret.  

4. **Jobs**  
   - List: no extra env needed; demo jobs if DB + external are empty.  
   - Detail: only real jobs (UUID); demo jobs are list-only.  
   - Optional: `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` and/or `RAPIDAPI_KEY` for external listings.

5. **Resume**  
   - User must be **candidate** and **post-signup** must have been called (so `Candidate` exists).  
   - Optional: `OPENAI_API_KEY` for AI parsing; otherwise fallback parsing is used.

6. **Stripe**  
   - `STRIPE_SECRET_KEY` in backend.  
   - At least one plan in DB with `stripe_price_id` for checkout to succeed.

---

## 6. Quick verification (no secrets)

With backend running:

- **Health:**  
  `GET http://127.0.0.1:8000/health`  
  → `{"status":"ok"}`

- **Config (dev only):**  
  `GET http://127.0.0.1:8000/debug/config`  
  → `has_database_url`, `has_supabase_secret`, `has_openai_key`, `has_stripe_key`, `has_rapidapi_key`, `has_adzuna`, etc. (all booleans).

If you have a frontend health page that calls the backend (e.g. `/api/health`), it should show backend “healthy” when the above works.

---

## Summary

| API / feature | Required env / condition | Optional env |
|---------------|-------------------------|--------------|
| Backend reachable | Backend running; `NEXT_PUBLIC_API_URL` or default 127.0.0.1:8000; CORS | — |
| Jobs list | None (demo jobs if empty) | Adzuna, RapidAPI for external jobs |
| Job detail | Real job in DB (UUID) | — |
| Resume upload/parse | User is candidate + post-signup done; JWT sent | `OPENAI_API_KEY` for AI parsing |
| Stripe checkout | `STRIPE_SECRET_KEY` + plan with `stripe_price_id` in DB | `STRIPE_WEBHOOK_SECRET` for webhooks |

If “everything in .env is correct,” the most common causes are: backend not running or wrong URL, CORS, or missing **Candidate** row (resume) / missing **Plan.stripe_price_id** (Stripe).
