# Environment Setup

## Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in values:

```env
# REQUIRED
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
OPENAI_API_KEY=sk-your-openai-key

# REQUIRED for job aggregation (LinkedIn, Indeed, Glassdoor via JSearch)
RAPIDAPI_KEY=your_rapidapi_key

# OPTIONAL - Adzuna (UK/US jobs)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

**Keys you need:**
| Key | Required | Where to get |
|-----|----------|--------------|
| `DATABASE_URL` | Yes | Supabase project → Settings → Database |
| `SUPABASE_JWT_SECRET` | Yes | Supabase project → Settings → API → JWT secret |
| `OPENAI_API_KEY` | Yes | https://platform.openai.com/api-keys |
| `RAPIDAPI_KEY` | Yes (for jobs) | https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | No | https://developer.adzuna.com/signup |

### Job aggregation sources

| Source | Env vars | Sign up |
|--------|----------|---------|
| **Adzuna** | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | https://developer.adzuna.com/signup |
| **JSearch** (LinkedIn, Indeed, Glassdoor, ZipRecruiter) | `RAPIDAPI_KEY` | https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch |

## Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
