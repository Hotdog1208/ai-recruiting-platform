# Deployment

## Frontend (Vercel)

1. Push repo to GitHub and connect to Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build` (default).
4. Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (e.g. `https://your-backend.onrender.com`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)

## Backend (Render / Railway / Fly)

### Render

1. New Web Service, connect repo.
2. Root directory: `backend`.
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment: Add all vars from `backend/.env.example`.
6. Health check path: `/health`

### Railway

1. New project from repo, select `backend` as root.
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add env vars from `.env.example`.

### Fly.io

1. `fly launch` in `backend/` directory.
2. Add secrets: `fly secrets set DATABASE_URL=... SUPABASE_JWT_SECRET=... OPENAI_API_KEY=...`
3. Ensure `fly.toml` has internal port 8000 and health check `/health`.

## CORS and domain (Recruiter.Solutions)

Set `FRONTEND_ORIGIN` in backend to your deployed frontend URL. For **recruiter.solutions**:

```
FRONTEND_ORIGIN=https://recruiter.solutions,https://www.recruiter.solutions
```

The first origin is also used for Stripe checkout redirects. See **docs/RECRUITER_SOLUTIONS_DOMAIN.md** for full domain setup.

## Stripe Webhooks

1. **Production:** In Stripe Dashboard → Webhooks, add endpoint: `https://your-backend.com/webhooks/stripe`.
2. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Copy the signing secret into backend env as `STRIPE_WEBHOOK_SECRET`.

### Local testing (Windows PowerShell)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Log in: `stripe login`
3. Forward events to your local backend:
   ```powershell
   stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to http://localhost:8000/webhooks/stripe
   ```
4. The CLI prints a webhook signing secret (e.g. `whsec_...`). Set that in **backend/.env** as `STRIPE_WEBHOOK_SECRET` so the backend can verify forwarded events.
5. Run the backend (`uvicorn app.main:app --reload`) and trigger a test checkout; the CLI will forward the event to your local `/webhooks/stripe`.
