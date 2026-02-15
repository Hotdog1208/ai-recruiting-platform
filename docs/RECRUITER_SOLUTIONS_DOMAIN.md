# Making the Website Public on Recruiter.Solutions

This doc is the exact sequence to go live at **https://recruiter.solutions** (and optional **https://www.recruiter.solutions**).

---

## Quick overview (order of operations)

1. Deploy frontend and backend to your hosts (if not already).
2. Add the domain in each host (Vercel + backend provider).
3. Point DNS at those hosts.
4. Set production environment variables (frontend + backend).
5. Configure Supabase redirect URLs.
6. Configure Stripe (if using billing).
7. Run database migrations on production.

---

## 1. Deploy and add the domain

### 1a. Frontend (Vercel)

1. Push your code to GitHub and connect the repo in [Vercel](https://vercel.com) (if not already).
2. In Vercel: **Project → Settings → Domains**.
3. Click **Add** and enter `recruiter.solutions`. Add `www.recruiter.solutions` too if you want www.
4. Vercel will show you what to set in DNS (e.g. **A** record to Vercel’s IP, or **CNAME** for `www`). Leave this tab open; you’ll do DNS in step 2.

### 1b. Backend (Render / Railway / Fly.io, etc.)

1. Deploy the backend (from the `backend/` folder) to your provider.
2. In the service settings, add a **custom domain**: `api.recruiter.solutions`.
3. The provider will tell you how to point DNS (usually a **CNAME** from `api.recruiter.solutions` to their hostname). You’ll do that in step 2.

---

## 2. DNS (at your domain registrar)

Where you bought **recruiter.solutions** (e.g. Namecheap, Cloudflare, GoDaddy, Google Domains):

| Type  | Name / Host       | Value / Target                    | TTL (optional) |
|-------|-------------------|-----------------------------------|-----------------|
| **A** | `@` (or blank)    | Vercel’s IP (from Vercel Domains) | 3600            |
| **CNAME** | `www`         | `cname.vercel-dns.com` (or what Vercel shows) | 3600 |
| **CNAME** | `api`         | Your backend hostname (e.g. `xxx.onrender.com`) | 3600 |

- **A** for root: use the exact value Vercel gives you for `recruiter.solutions` (sometimes they use CNAME for root; follow what Vercel shows).
- **CNAME** for `www`: so `www.recruiter.solutions` goes to Vercel.
- **CNAME** for `api`: so `api.recruiter.solutions` goes to your backend.

Save DNS. Propagation can take 5–60 minutes. You can check with `nslookup api.recruiter.solutions` or [dnschecker.org](https://dnschecker.org).

---

## 3. Frontend environment (production)

In **Vercel → Your Project → Settings → Environment Variables**, add (for **Production**):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://recruiter.solutions` |
| `NEXT_PUBLIC_API_URL` | `https://api.recruiter.solutions` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Supabase → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key (same place) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` (optional; for billing) |

Redeploy the frontend after changing env vars (Vercel → Deployments → ⋮ on latest → Redeploy).

---

## 4. Backend environment (production)

In your **backend host** (Render/Railway/etc.) → your backend service → **Environment** (or **Environment Variables**), set:

| Variable | Value |
|----------|--------|
| `FRONTEND_ORIGIN` | `https://recruiter.solutions,https://www.recruiter.solutions` |
| `DATABASE_URL` | Your production Postgres URL (e.g. from Supabase → Settings → Database) |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT Secret |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (if using billing) |
| `STRIPE_WEBHOOK_SECRET` | From step 6 below (if using billing) |

Plus any optional keys (e.g. `OPENAI_API_KEY`) — see `API_KEYS_AND_SERVICES.md`.  
Restart or redeploy the backend after changing env vars.

---

## 5. Supabase auth redirect URLs

1. Open [Supabase](https://supabase.com) → your project.
2. **Authentication → URL Configuration → Redirect URLs**.
3. Add:
   - `https://recruiter.solutions/auth/callback`
   - `https://www.recruiter.solutions/auth/callback` (if you use www)
4. Save. You can keep localhost URLs for local dev.

---

## 6. Stripe (if using billing)

1. **Stripe Dashboard** → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL: `https://api.recruiter.solutions/webhooks/stripe` (or your real backend URL).
3. Select events you need (e.g. `checkout.session.completed`, `customer.subscription.updated`).
4. Copy the **Signing secret** and set it in the backend as `STRIPE_WEBHOOK_SECRET` (see step 4).
5. In Stripe (Customer portal / Checkout settings), add your production domain if Stripe asks for it.  
   Success/cancel URLs are taken from the first value in `FRONTEND_ORIGIN`, so they will be `https://recruiter.solutions/dashboard/employer/billing?success=1` and `?cancel=1`.

---

## 7. Database migrations (production)

Your production database must have the latest schema. From your machine (or a one-off run in your backend host):

```bash
cd backend
# Use production DATABASE_URL (e.g. set it in this shell or in .env used here)
alembic upgrade head
```

If your host runs migrations on deploy, ensure that step uses the production `DATABASE_URL` and has run at least once.

---

## 8. Verify the site is public

1. Open **https://recruiter.solutions** — the app should load.
2. Sign up / log in — auth should redirect back to recruiter.solutions.
3. If you use the API from the site, confirm calls go to **https://api.recruiter.solutions** (check Network tab in dev tools).

---

## Reference: DNS and hosting (summary)

- **Frontend:** `recruiter.solutions` (and optionally `www.recruiter.solutions`) → Vercel.
- **Backend:** `api.recruiter.solutions` → your backend host (Render / Railway / Fly.io, etc.).

---

## Checklist (tick as you go)

- [ ] **1.** Frontend deployed; domain `recruiter.solutions` (and `www` if used) added in Vercel.
- [ ] **2.** Backend deployed; custom domain `api.recruiter.solutions` added in backend host.
- [ ] **3.** DNS: A/CNAME for root and www → Vercel; CNAME for `api` → backend.
- [ ] **4.** Frontend env in Vercel: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, Supabase (and Stripe if needed).
- [ ] **5.** Backend env: `FRONTEND_ORIGIN`, `DATABASE_URL`, `SUPABASE_JWT_SECRET`, Stripe if needed.
- [ ] **6.** Supabase: Redirect URLs include `https://recruiter.solutions/auth/callback` (and www if used).
- [ ] **7.** Stripe: Webhook `https://api.recruiter.solutions/webhooks/stripe`; `STRIPE_WEBHOOK_SECRET` in backend.
- [ ] **8.** Production DB: `alembic upgrade head` run against production `DATABASE_URL`.
- [ ] **9.** Verified: https://recruiter.solutions loads and login works.

---

## Optional: www redirect

If you want `www.recruiter.solutions` to redirect to `recruiter.solutions` (or the reverse), set that in Vercel (Domains → ⋮ next to the domain) or at your DNS/CDN provider.
