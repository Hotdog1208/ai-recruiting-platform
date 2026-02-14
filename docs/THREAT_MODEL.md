# Threat Model (Summary)

## Assets

- User accounts (candidate/employer), profiles, resumes
- Job listings, applications, match scores
- Billing/subscription data (Stripe)

## Trust Boundaries

- **Client (browser)** ↔ **Backend API**: All mutations and sensitive reads require valid Supabase JWT. Backend never trusts client-supplied identity (user_id, employer_id, candidate_id) for authorization; identity comes from JWT.
- **Backend** ↔ **Supabase (Auth, DB, Storage)**: Backend uses server-side credentials. Storage bucket for resumes is private; access via short-lived signed URLs only.
- **Backend** ↔ **OpenAI / external APIs**: Keys in env only; no keys in logs or responses.

## Threats Addressed

| Threat | Mitigation |
|--------|------------|
| **IDOR** | All protected routes resolve identity from JWT. Ownership checks (e.g. `require_job_owner`, `require_application_job_owner`) enforce that the authenticated user owns the resource. |
| **Secrets in repo** | .gitignore excludes .env*; SECURITY.md documents history rewrite and rotation. |
| **Weak auth** | Supabase JWT verified server-side (signature, exp/nbf/iat, audience). |
| **Injection** | ORM/SQLAlchemy; no raw SQL with user input. Pydantic validation on inputs. |
| **Upload abuse** | Resumes: type + size limits; magic-byte validation; private storage (Phase 1.4). |
| **Information leakage** | No protected attributes (race/gender/age/photo) in matching. Error responses do not expose internals. |
| **Missing audit trail** | audit_logs table; signup, job CRUD, application status change, resume upload logged. |

## Out of Scope (for later)

- DDoS (rate limiting is in-memory for dev; Redis for prod)
- Advanced CSP / XSS hardening
- Penetration testing
