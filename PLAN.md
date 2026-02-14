# Implementation Plan (Security + UI Pass)

## Phase 0 — Repo Hygiene + Secret Remediation (DONE)

- **0.1** **Audit:** `docs/REPO_AUDIT.md` — tracked artifacts, secrets risk, missing pages, IDOR notes. **CRITICAL:** `backend/.env` contains real API key; must not be committed; if ever in history, rotate key and rewrite history.
- **0.2** **.gitignore:** Root `.gitignore` updated with `**/.env*`, `**/.venv/`, `**/__pycache__/`, `**/*.pyc`, `frontend/node_modules/`, `frontend/.next/`, `coverage/`, `dist/`, `build/`, `**/*.log`. Exceptions: `!.env.example`, `!.env*.example`.
- **0.3** **Remove from tracking:** `docs/SECURITY.md` — exact steps: `git rm --cached` for `.env`/`.env.local`, then git filter-repo or BFG for history rewrite.
- **0.4** **Env examples:** `backend/.env.example`, `frontend/.env.local.example` with placeholders only.
- **0.5** **Backend config:** `app/core/config.py` — Pydantic Settings (`pydantic-settings`). Required: `DATABASE_URL`, `SUPABASE_JWT_SECRET`. CORS from `FRONTEND_ORIGIN`. Fail-fast on missing required vars.
- **0.6** **Frontend env validation:** `lib/env.ts` — `getEnvStatus()`, `getSetupMessage()`, `isSetupComplete()`. **Setup banner:** `components/EnvBanner.tsx` shows when Supabase or API URL missing; does not crash UI.

---

## Phase 1 — Backend Security Hardening (DONE)

- **1.1** **JWT + RBAC:** `app/core/auth.py` uses `get_settings().SUPABASE_JWT_SECRET`; validates JWT; loads user from DB. `app/core/deps.py`: `get_current_candidate`, `get_current_employer`, `require_job_owner`, `require_application_job_owner`. All protected routes use these; no client-supplied identity for authorization.
- **1.2** **IDOR prevention:** Jobs: create uses employer from JWT only (no `employer_id` in body/query). Update/delete use `require_job_owner`. Applications: create uses candidate from JWT; list by job uses `require_job_owner`; list by candidate → `GET /applications/by-candidate/me` with auth; status update uses `require_application_job_owner`.
- **1.3** **CORS:** From config `frontend_origins`; no wildcard in prod.
- **1.4** **Security headers:** `app/middleware/security_headers.py` — X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, minimal CSP. Wired in `main.py`.
- **1.5** **Audit logging:** `app/models/audit_log.py` (audit_logs table), `app/core/audit.py` (`log()`). Logged: signup_complete, job_create, job_update, job_delete, application_status_change. Migration: `add_audit_logs.py`.
- **1.6** **Frontend API alignment:** Employer job create/delete/duplicate use `apiPost`/`apiDelete` with `session.access_token`. Candidate applications use `GET /applications/by-candidate/me` with token. Apply uses `POST /applications?job_id=...` with token. Applicants page uses `apiGet`/`apiPatch` with token for by-job list and status update.
- **1.7** **CI:** `.github/workflows/ci.yml` — backend: pip-audit, import check; frontend: npm audit (continue-on-error), lint, typecheck.
- **1.8** **Docs:** `docs/THREAT_MODEL.md`, `docs/SECURITY_CHECKLIST.md`; `docs/SECURITY.md` updated with index + history rewrite steps.

**Not done this pass (defer):** Rate limiting (in-memory/Redis), request body/upload size limits, resume upload magic-byte validation and private storage (partial later). HSTS in prod (deploy config).

---

## Completion / follow-up fixes (post Phase 3)

- **IDOR:** `/employers/by-user/{user_id}` and `/candidates/by-user/{user_id}` (GET, PATCH, POST resume) now require auth and return 403 unless `user_id` is the current user.
- **Employer jobs:** Added GET `/jobs/mine` (employer only) so employer dashboard uses token and does not pass `employer_id` from client.
- **Frontend:** Employer dashboard and profile use `/employers/me` and `/jobs/mine` with token; added `apiPut`; candidate profile/dashboard pass token to all by-user and matching API calls.
- **Navbar:** When logged in, shows Dashboard and Sign out instead of Log in / Sign up.
- **Toasts:** Success toasts on job create, job delete, job duplicate, and application submit.

---

## Phase 2 — UI Overhaul (DONE)

- **Deps:** Radix (dialog, dropdown, tabs, toast), lucide-react, class-variance-authority, clsx, tailwind-merge, react-hook-form, zod, next-themes.
- **Design system:** `lib/utils.ts` (cn), components/ui: Button, Input, Card, Skeleton, Badge, EmptyState, Dialog, DropdownMenu, Tabs, Toast (provider + useToast).
- **Layouts:** MarketingLayout unchanged (Navbar + Footer). AppLayout with sidebar + topbar (responsive; collapsible on mobile), role-specific nav (candidate vs employer). Dashboard, profile, and settings use AppLayout.
- **Pages:** Help, cookies, acceptable-use, verify-email (Suspense), employer billing; ai-disclaimer redirects to ai-disclosure. Footer updated with new links.
- **Assets:** `public/branding/logo.svg`, `public/illustrations/hero.svg`, empty-jobs, empty-applications, empty-applicants, onboarding-candidate, onboarding-employer.
- **Resilience:** `lib/api.ts` tracks backend status (ok/unreachable); `BackendBanner` shows “Backend not connected” when unreachable. ToastProvider + EnvBanner in providers.

---

## Phase 3 — AI Provider Adapter (DONE)

- **Backend:** `app/ai/providers/base.py` (BaseAIProvider interface), `openai_provider.py`, `anthropic_provider.py`; `app/ai/service.py` selects provider by `AI_PROVIDER` (openai | anthropic). `ai_complete()`, `is_ai_configured()`. Safe fallback strings when keys missing; no crashes. Config: `AI_PROVIDER`, `ANTHROPIC_API_KEY` in `app/core/config.py` and `.env.example`. Anthropic package not added; provider handles ImportError with fallback.

---

## Optional / future improvements

- **Rate limiting:** In-memory or Redis limiter on auth, upload, job create, AI endpoints (see SECURITY_CHECKLIST).
- **Request limits:** Max JSON body size and max upload size (e.g. 5–10 MB) in FastAPI.
- **Resume upload:** Magic-byte validation (PDF/DOCX), private Supabase Storage bucket, short-TTL signed URLs.
- **Replace native confirm():** Use Dialog component for “Delete job?” and other destructive confirmations.
- **Candidate/employer /me everywhere:** Frontend could switch remaining by-user calls to /candidates/me and /employers/me; backend by-user can stay for backward compatibility with token + self-check.
- **Jobs page when logged in:** Consider using AppLayout or a slim app bar so /jobs shows Dashboard/Sign out for authenticated users (optional UX).

---

## Deliverables This Pass

1. **PLAN.md** (this file)
2. **docs/SECURITY.md** — rotation + history rewrite
3. **docs/SECURITY_CHECKLIST.md**, **docs/THREAT_MODEL.md**
4. **docs/REPO_AUDIT.md**
5. **.gitignore** updated
6. **backend:** config, deps, RBAC/ownership, security headers, audit logs, CI
7. **frontend:** env validation, EnvBanner, API calls updated for secured endpoints
8. **QA_CHECKLIST.md** — security + UI steps (see below)
