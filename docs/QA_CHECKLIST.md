# QA Checklist

## Security Tests (Phase 1)

- [ ] **JWT:** Invalid or expired token → 401 on protected endpoints
- [ ] **JWT:** Missing Authorization header → 401
- [ ] **RBAC:** Candidate calling employer-only endpoint (e.g. POST /jobs) → 403
- [ ] **RBAC:** Employer calling candidate-only endpoint (e.g. POST /applications with wrong context) → 403 or 401 as appropriate
- [ ] **IDOR:** Candidate cannot list another candidate’s applications (only /applications/by-candidate/me with own token)
- [ ] **IDOR:** Employer cannot update/delete another employer’s job (only own jobs)
- [ ] **IDOR:** Employer cannot list applications for another employer’s job
- [ ] **IDOR:** GET /employers/by-user/{other_user_id} or /candidates/by-user/{other_user_id} with own token → 403
- [ ] **Ownership:** GET /jobs/mine returns only current employer’s jobs (employer token required)
- [ ] **Ownership:** Job create does not accept employer_id from client; server uses JWT
- [ ] **Ownership:** Application create does not accept candidate_id from client; server uses JWT
- [ ] **Security headers:** Response has X-Content-Type-Options, Referrer-Policy, etc. (check in DevTools)
- [ ] **CORS:** Only configured FRONTEND_ORIGIN(s) allowed
- [ ] **Audit logs:** Signup, job create/update/delete, application status change write to audit_logs
- [ ] **Rate limit** (when implemented): Excess requests to auth/upload/job create return 429
- [ ] **Upload** (when hardened): Only PDF/DOCX accepted; size limit enforced; no HTML rendering of resume

## Auth Flow

- [ ] Sign up as candidate: `/signup` → choose candidate → complete → redirect to dashboard
- [ ] Sign up as employer: `/signup` → choose employer → complete → redirect to dashboard
- [ ] Login: `/login` → valid credentials → redirect to role-appropriate dashboard
- [ ] Unauthenticated access to `/candidate` or `/employer` redirects to `/login`
- [ ] Logout clears session and redirects

## Candidate Flow

- [ ] Candidate dashboard loads
- [ ] Profile: `/candidate/profile` → view/edit full_name, location, skills, etc.
- [ ] Resume upload: upload PDF/DOCX → parse succeeds → profile populated
- [ ] Jobs: browse, search, filter by location/remote
- [ ] Save job: save icon → job appears in saved list
- [ ] Apply: apply button → application created; status in applications list
- [ ] Applications: `/candidate/applications` shows status (pending, reviewed, etc.)

## Employer Flow

- [ ] Employer dashboard loads
- [ ] Company profile: `/employer/company` → view/edit company info
- [ ] Create job: `/employer/jobs/new` → fill form → job created
- [ ] Edit job: `/employer/jobs/[id]` → update → saved
- [ ] Close job: close button → status = closed
- [ ] Applicants: `/employer/jobs/[id]/applicants` → list with match scores
- [ ] Update application status: move to reviewed/shortlisted/accepted/rejected
- [ ] Add note to application

## Billing (when implemented)

- [ ] Pricing page shows plans
- [ ] Upgrade: click plan → Stripe Checkout → success
- [ ] Webhook: subscription created in DB
- [ ] Gating: free plan limits enforced (e.g. max 1 job)

## API Health

- [ ] `GET /health` returns `{"status": "ok"}`
- [ ] CORS: frontend can call backend from deployed origin

## UI / UX Tests

- [ ] **Pages:** Marketing (/, /pricing, /about, /contact, /help), legal (/terms, /privacy, /cookies, /ai-disclaimer, /acceptable-use), auth (signup, login, forgot-password, verify-email) load without crash
- [ ] **App pages:** Candidate dashboard, profile, resume, jobs, applications; Employer dashboard, company, jobs, applicants, billing; Settings
- [ ] **Responsiveness:** Sidebar collapses on mobile; tables/lists scroll; forms usable on small screens
- [ ] **Forms:** Validation errors shown clearly; submit disabled when invalid
- [ ] **Buttons:** Loading/disabled states on submit; destructive actions have confirmation
- [ ] **Lists:** Skeleton loaders while loading; empty states with illustration/message
- [ ] **Toasts:** Success/error feedback for key actions
- [ ] **Accessibility:** Focus visible in modals; keyboard can close dialogs
- [ ] **Resilience:** Backend unreachable → “Backend not connected” banner; no UI crash
- [ ] **Resilience:** Missing API keys → “Setup required” or “AI not configured” where applicable; rest of UI works

## Edge Cases

- [ ] Invalid JWT → 401
- [ ] Candidate calling employer-only endpoint → 403
- [ ] Resume file too large → 400
- [ ] Duplicate application → 400
