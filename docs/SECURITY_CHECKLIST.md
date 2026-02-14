# Security Checklist

## Before every release

- [ ] No `.env` or `.env.local` in repo or history
- [ ] All protected API routes require JWT and RBAC/ownership
- [ ] CORS allows only configured frontend origins
- [ ] Security headers enabled (X-Content-Type-Options, Referrer-Policy, etc.)
- [ ] Resume upload: PDF/DOCX only, size limit, magic-byte check
- [ ] No secrets in logs or error messages
- [ ] `pip-audit` and `npm audit` run in CI

## After suspected leak

- [ ] Rotate every secret (see docs/SECURITY.md Key Rotation Checklist)
- [ ] Remove leaked files from git history (git filter-repo / BFG)
- [ ] Force-push and notify collaborators

## RBAC / IDOR

- [ ] Candidate: only own profile, resume, applications, saved jobs
- [ ] Employer: only own company, jobs, and applications for those jobs
- [ ] Job create/update/delete: employer from JWT only
- [ ] GET /jobs/mine: employer only, returns only current employer’s jobs
- [ ] /employers/by-user/{id} and /candidates/by-user/{id}: require auth; 403 unless id is current user
- [ ] Application list by job: employer must own job
- [ ] Application status update: employer must own job

## AI / matching

- [ ] No race, gender, age, or photo in matching/ranking inputs or explanations
