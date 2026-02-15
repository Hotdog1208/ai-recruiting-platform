# Pre-Launch Checklist – AI Recruiting Platform

Use this with the **Ultimate Pre-Launch Checklist** you have. Each section maps to the repo and tells you what’s already done and what to verify or add.

---

## Section 1: Universal Launch Checklist – Repo Mapping

### A. Content & Design
- **Placeholder text:** Search for `Lorem|Coming Soon|placeholder` in `frontend/` – fix any remaining.
- **Headings:** Use a single H1 per page; H2 → H3 order in marketing pages (`app/(marketing)/`, `app/page.tsx`).
- **Footer copyright:** Dynamic year in `components/layout/Footer.tsx` – `© {new Date().getFullYear()}`.
- **Legal pages:** `app/(marketing)/privacy/`, `terms/`, `cookies/`, `acceptable-use/`, `contact/` – confirm content and links.
- **Favicon:** Set in `app/layout.tsx` via metadata or `app/icon.png` (Next.js convention).

### B. Functionality & UX
- **Nav:** `components/layout/Navbar.tsx` – all links and mobile menu.
- **Forms:** Auth in `app/(auth)/`; candidate profile and employer flows – test submit and validation.
- **Search:** Jobs page uses `GET /matching/browse` – see `docs/GET_APIS_WORKING.md`.
- **Payments:** Stripe in `backend/app/api/billing.py`; frontend `dashboard/employer/billing` – requires `STRIPE_SECRET_KEY` and a plan with `stripe_price_id`.

### C. Responsive & Cross-Browser
- **Breakpoints:** Tailwind + custom in `globals.css` (e.g. 768px, 1024px). Test 320px, 375px, 768px, 1440px.
- **Touch targets:** Buttons use `min-height` / padding; check `btn-primary`, `search-button`, `role-button` in `globals.css`.

### D. Performance
- **Lighthouse:** Run on production build (`npm run build && npm run start`).
- **Images:** Next.js `Image` used on homepage; use `unoptimized` only where needed (e.g. SVGs).
- **Fonts:** `next/font` (Syne, Manrope) with `display: swap` in `app/layout.tsx`.

### E. Security
- **Headers:** `backend/app/middleware/security_headers.py` – X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP, X-XSS-Protection.
- **Secrets:** No `.env` in git; `backend/.env.example` and `frontend/.env.local.example` only.
- **Rate limiting:** `backend/app/middleware/rate_limit.py` – enabled on app.
- **Auth:** Supabase JWT; backend validates with `SUPABASE_JWT_SECRET`.

### F. SEO
- **Meta:** Root `app/layout.tsx` has default title/description; add per-page metadata where needed.
- **OG/Twitter:** Default openGraph and twitter card in layout; add `metadataBase` and `openGraph.images` when you have a default image.
- **404:** Branded `app/not-found.tsx` with link home.

### G–P (Analytics, Accessibility, Backup, Hosting, Email, Media, Integrations, CMS, Errors, Launch Prep)
- **Analytics:** Add GA4 or similar in `app/layout.tsx` or GTM; respect cookie consent.
- **Accessibility:** Labels on forms (`Input` has `label`); focus states in `globals.css` (`focus-visible`). Run axe/WAVE.
- **Backup:** Hosting/DB backup is on you (Supabase, Vercel, etc.).
- **Email:** Supabase Auth handles password reset; add transactional provider if needed.
- **APIs:** See `docs/GET_APIS_WORKING.md` and `docs/API_KEYS_AND_SERVICES.md`.

---

## Section 2: Platform-Specific – Where It Lives

| Item | Location |
|------|----------|
| Candidate signup | `app/(auth)/signup/candidate/page.tsx` → `POST /auth/post-signup` |
| Employer signup | `app/(auth)/signup/employer/page.tsx` → `POST /auth/post-signup` |
| Resume upload | `app/profile/candidate/page.tsx` → `POST /candidates/by-user/{id}/resume` |
| Browse jobs | `app/jobs/page.tsx` → `GET /matching/browse` |
| Job detail | `app/jobs/[id]/page.tsx` → `GET /jobs/{id}` (UUID only; demo ids = list only) |
| Create job | `app/dashboard/employer/` → `POST /jobs` |
| Applications | `app/api/applications` (backend); candidate/employer dashboards |
| Billing / Stripe | `backend/app/api/billing.py`; `app/dashboard/employer/billing/` |
| Health | `GET /health`, `GET /debug/config` (dev) |

---

## Validation Script (from your checklist)

```powershell
# Backend
cd backend
# uv run python scripts/check_env.py   # if script exists
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
# In another terminal:
# Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing | Select -Expand Content

# Frontend
cd frontend
npm run build
npm run lint
```

Manual: sign up as candidate → upload resume → browse jobs → apply; sign up as employer → create job → view applications. Run Lighthouse and fix critical issues.

---

## Launch Day

- Set production env vars on host (no `.env` in repo).
- Point domain to frontend (e.g. Vercel) and backend (e.g. Railway, Render).
- Ensure `FRONTEND_ORIGIN` and CORS include production origin.
- Tag release: `git tag v1.0.0 && git push origin v1.0.0`.
- Post-deploy: hit `https://yourdomain.com/health` and run one full user flow.

---

## Quick “Ready to Launch” Checklist

- [ ] Backend `/health` returns 200 in production.
- [ ] Frontend build and lint pass.
- [ ] No placeholder/Lorem on public pages.
- [ ] Privacy, Terms, Cookies, Contact exist and are linked in footer.
- [ ] 404 is branded and links home.
- [ ] Sign up (candidate + employer), login, resume upload, job browse, and apply tested.
- [ ] Stripe configured if you’re charging (key + plan with price id).
- [ ] Security headers and rate limiting enabled.
- [ ] Meta title/description and OG set; favicon set.
