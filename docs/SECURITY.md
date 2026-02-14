# Security & Secret Management

## Key Rotation Checklist

If secrets may have been exposed, rotate **all** of the following:

| Secret | Where to Rotate | Notes |
|--------|----------------|-------|
| **Supabase DB password** | Supabase Dashboard → Project Settings → Database | Update `DATABASE_URL` in backend `.env` |
| **Supabase JWT secret** | Supabase Dashboard → Project Settings → API → JWT Secret | Update `SUPABASE_JWT_SECRET` in backend `.env` |
| **Supabase anon key** | Supabase Dashboard → Project Settings → API | Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in frontend `.env.local` |
| **OpenAI API key** | platform.openai.com → API Keys | Create new key, revoke old; update `OPENAI_API_KEY` |
| **Stripe secret key** | Stripe Dashboard → Developers → API Keys | Update `STRIPE_SECRET_KEY` |
| **Stripe webhook secret** | Stripe Dashboard → Webhooks → Signing secret | Regenerate after rotating secret key; update `STRIPE_WEBHOOK_SECRET` |
| **RapidAPI key** | rapidapi.com | Update `RAPIDAPI_KEY` if used |
| **Adzuna keys** | developer.adzuna.com | Update `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` if used |

## Removing Committed Secrets from Git History

If `.env`, `.env.local`, `node_modules`, `.venv`, or `.next` were ever committed:

### Step 1: Remove from index (stop tracking; keep files on disk)

Run from repo root:

```bash
git rm --cached backend/.env 2>nul
git rm --cached frontend/.env.local 2>nul
git rm -r --cached backend/.venv 2>nul
git rm -r --cached frontend/node_modules 2>nul
git rm -r --cached frontend/.next 2>nul
git commit -m "chore: stop tracking secrets and build artifacts"
```

### Step 2: Rewrite history (remove from all commits)

**Option A — git-filter-repo (recommended):**

```bash
pip install git-filter-repo
# From repo root (backup first; this rewrites history)
git filter-repo --path backend/.env --invert-paths
git filter-repo --path frontend/.env.local --invert-paths
git filter-repo --path backend/.venv --invert-paths --force
git filter-repo --path frontend/node_modules --invert-paths --force
git filter-repo --path frontend/.next --invert-paths --force
```

**Option B — BFG Repo-Cleaner:**

```bash
bfg --delete-files .env
bfg --delete-folders .venv
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

### Step 3: After history rewrite

- Force-push: `git push --force`
- **Rotate all secrets** (see Key Rotation Checklist); they remain in history until rewritten.

## Preventing Future Leaks

- Never commit `.env`, `.env.local`, or any file containing real keys.
- Use `.env.example` with placeholders only.
- Add pre-commit hooks (e.g. `detect-secrets`, `gitleaks`) if desired.
- Run `git status` before commits; ensure no env files are staged.
- Keep `.gitignore` updated (see root `.gitignore`).
