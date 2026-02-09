# AI Recruiting Platform - Architecture

## Auth Flow

1. **Signup (Candidate/Employer)**
   - User fills form on frontend
   - `supabase.auth.signUp()` creates Supabase auth user
   - Frontend POSTs to `/auth/post-signup` with role-specific fields
   - Backend creates `users` row + `candidates` or `employers` row
   - Frontend updates Supabase user metadata with role (for fast session resolution)
   - User redirected to role-specific dashboard

2. **Login**
   - `supabase.auth.signInWithPassword()`
   - Role resolved from: `user_metadata.role` or backend `GET /users/{id}`
   - Redirect to `/dashboard/candidate` or `/dashboard/employer`

3. **Protected Routes**
   - Dashboard layout checks auth; redirects to `/login` if unauthenticated
   - Role-based redirect: candidates can't access employer dashboard and vice versa

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/post-signup` | Create user + profile after Supabase signup |
| GET | `/users/{user_id}` | Get user role |
| GET | `/candidates/by-user/{user_id}` | Get candidate profile |
| GET | `/employers/by-user/{user_id}` | Get employer profile |
| GET | `/jobs` | List jobs (optional `?employer_id=` filter) |
| GET | `/jobs/{job_id}` | Get single job |
| POST | `/jobs?employer_id=` | Create job (employer only) |

## Data Flow

```
Supabase Auth (identity only)
       ↓
Backend PostgreSQL (users, candidates, employers, jobs)
       ↓
Frontend (Next.js) reads via fetch to backend
```

## Next Steps (AI Layer)

- Resume parsing with OpenAI
- Job ↔ candidate matching algorithm
- Bias mitigation in matching (no discriminatory fields)
