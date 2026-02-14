# Repo Audit Report

**Date:** 2026-02-08  
**Scope:** Phase 0 — hygiene, secrets risk, missing/broken items.

---

## 1. Tracked artifacts & secrets risk

| Item | Status | Action |
|------|--------|--------|
| **backend/.env** | Present on disk; contains real `OPENAI_API_KEY` | **CRITICAL:** Must never be committed. If ever pushed, use git filter-repo to remove from history and rotate the key immediately. |
| **frontend/.env.local** | Present on disk | Ensure not tracked. Add to .gitignore explicitly. |
| **backend/.venv/** | Not in repo tree | .gitignore covers. Ensure not tracked. |
| **frontend/node_modules/** | Not in repo tree | .gitignore covers. |
| **frontend/.next/** | Not in repo tree | .gitignore covers. |
| **coverage/ dist/ build/** | — | Add to .gitignore. |

**Commands to verify and remove from index (run from repo root):**
```bash
git ls-files | findstr /i "\.env .venv node_modules \.next"
# If any listed:
git rm --cached backend/.env 2>nul
git rm --cached frontend/.env.local 2>nul
# Then use docs/SECURITY.md for history rewrite.
```

---

## 2. .gitignore gaps

- Add `**/.env*`, `**/.venv/`, `**/__pycache__/`, `**/*.pyc` for full tree coverage.
- Add `coverage/`, `dist/`, `build/`.
- Keep `!.env.example` and `!.env*.example` so examples remain committable.

---

## 3. Missing pages (spec vs current)

| Spec path | Current | Note |
|-----------|---------|------|
| / (hero, features, FAQ, CTA) | / exists | Needs premium copy + illustrations. |
| /pricing | /pricing | Exists. |
| /about, /contact | Exist under (marketing). | — |
| /help | Missing | Add. |
| /terms, /privacy | Exist. | — |
| /cookies | Missing | Add (cookie consent). |
| /ai-disclaimer | Exists as ai-disclosure. | Align name or redirect. |
| /acceptable-use | Missing | Add. |
| /verify-email | Missing | Add (friendly messaging). |
| /signup, /signup/candidate, /signup/employer | Exist. | — |
| /login, /forgot-password | Exist. | — |
| /candidate/dashboard, /candidate/profile, … | Current: /dashboard/candidate, /profile/candidate | Route structure differs; can keep current and add aliases or migrate in Phase 2. |
| /employer/dashboard, …/billing | /dashboard/employer exists; /employer/billing missing | Add billing page under employer. |
| /settings (export/delete) | /settings exists | Ensure export/delete endpoints and UI. |

---

## 4. Broken imports / code

- **Backend:** No broken imports detected. `app.core.auth` exists; JWT verified; RBAC on candidates/employers/users/me.
- **Frontend:** No broken imports detected. Supabase client null-safe; API wrapper present.
- **IDOR risk:** Jobs API allows `employer_id` from query param for create/update/delete without verifying the authenticated user is that employer. Must enforce ownership in Phase 1.

---

## 5. Env validation

- **Backend:** No Pydantic Settings; uses `os.getenv`. Add `app/core/config.py` with fail-fast validation.
- **Frontend:** No central env validation. Add `lib/env.ts` and “Setup required” banner when keys missing.

---

## 6. Summary

| Priority | Item |
|----------|------|
| P0 | Remove backend/.env from tracking if ever committed; rotate exposed key; harden .gitignore. |
| P0 | Add backend config (Pydantic Settings) and frontend env validation. |
| P0 | Enforce RBAC/ownership on jobs, applications, saved_jobs (Phase 1). |
| P1 | Add missing pages: /help, /cookies, /acceptable-use, /verify-email, employer billing. |
| P1 | Add audit_logs table and security headers, rate limiting, upload hardening (Phase 1). |
