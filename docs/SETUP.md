# Local Setup

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or Supabase project)

## Quick Start

1. **Clone and install**
   ```bash
   cd ai-recruiting-platform
   npm install --prefix frontend
   cd backend && python -m venv .venv && .venv\Scripts\activate  # Windows
   # or: source .venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```

2. **Environment**
   - Copy `backend/.env.example` → `backend/.env`
   - Copy `frontend/.env.local.example` → `frontend/.env.local`
   - Edit **backend/.env**: set `DATABASE_URL` to your real Postgres URI (Supabase: Project Settings → Database → Connection string → URI; port must be a number, e.g. 5432). Set `SUPABASE_JWT_SECRET` from Supabase → API → JWT Secret.
   - Edit **frontend/.env.local**: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; optionally `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (default in dev).

3. **Validate env (Windows PowerShell, from backend/)**
   ```powershell
   .\scripts\check_env.ps1
   ```
   You must see "DB URL valid: yes" and "PASS" for DATABASE_URL and SUPABASE_JWT_SECRET. If not, fix `backend/.env` and run again.

4. **Database**
   From `backend/` with venv activated:
   ```powershell
   alembic upgrade head
   ```
   If you see "DATABASE_URL looks like the template placeholder", run `.\scripts\check_env.ps1` and fix `backend/.env` so the URL has a numeric port (e.g. 5432), not the word "port".

5. **Run**
   - **Option A:** From root: `npm run dev` (runs both; requires `npm install` at root first)
   - **Option B:** `.\scripts\dev.ps1` (Windows) or `./scripts/dev.sh` (macOS/Linux) — opens separate windows
   - **Manual:** Backend: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload`; Frontend: `cd frontend && npm run dev`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "DATABASE_URL looks like the template placeholder" | Edit `backend/.env`; set `DATABASE_URL` to real Postgres URI (port as number, e.g. 5432). Run `.\scripts\check_env.ps1`. |
| "API URL not set" banner | Frontend defaults to `http://127.0.0.1:8000` in dev. If banner shows, add `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` to `frontend/.env.local`. Banner also appears when Supabase vars are missing. |
| "Invalid token" / "Session expired" on resume upload | Ensure `SUPABASE_JWT_SECRET` in `backend/.env` matches Supabase. Log in again on the frontend. |
| Browse Jobs empty | API returns demo jobs when DB and external APIs have none. To add platform jobs: `python scripts/seed_demo_data.py` from backend. |
| CORS errors | Set `FRONTEND_ORIGIN=http://localhost:3000,http://127.0.0.1:3000` in backend `.env` |
| Database connection refused | Check `DATABASE_URL` and Supabase connection pooler |
| `npm run dev` fails | Run `npm install` in `frontend/` |
| No migrations | Run `alembic upgrade head` from `backend/` after `.\scripts\check_env.ps1` passes |
