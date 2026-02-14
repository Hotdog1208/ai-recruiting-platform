# Why APIs Might Not Be Working – Keys & Costs

The backend uses several external services. **None of them require a paid plan to get started**, but some need **free signup** and one (OpenAI) is **pay-as-you-go** after you add a payment method. Here’s what actually controls whether things work.

---

## 1. Required (app won’t start without these)

| Variable | Where to get it | Cost |
|--------|------------------|------|
| `DATABASE_URL` | Supabase: Project Settings → Database → Connection string (URI) | Free tier available |
| `SUPABASE_JWT_SECRET` | Supabase: Project Settings → API → JWT Secret | Same project, free |

If these are missing or wrong, the backend will fail on startup. **These are not paid APIs** – they come from your Supabase project (free tier is fine).

---

## 2. Optional – external job listings (Adzuna, JSearch)

When these keys are **not set**, the app does **not** break. It just has no live external jobs and falls back to **demo job listings** (curated fake jobs) so the UI still works.

| Service | Env vars | How to get | Cost |
|--------|----------|------------|------|
| **Adzuna** | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | [developer.adzuna.com](https://developer.adzuna.com/) – register and create an app | **Free** |
| **JSearch** (Indeed, LinkedIn, etc.) | `RAPIDAPI_KEY` | [RapidAPI](https://rapidapi.com/) – sign up, then subscribe to “JSearch” API (free tier available) | **Free tier**; paid if you exceed it |

So “APIs not working” for **job listings** is usually:

- You haven’t added these keys to `backend/.env`, or  
- For JSearch, you haven’t subscribed to the API on RapidAPI (even the free plan).

No upfront payment is required for Adzuna or for JSearch’s free tier.

---

## 3. Optional – AI (resume parsing & match scores)

| Feature | Env var | Behavior without key | Cost |
|--------|---------|----------------------|------|
| Resume parsing | `OPENAI_API_KEY` | Fallback to basic extraction (no AI) | **Pay-per-use** (you need an OpenAI account and usage-based billing) |
| Job match scores | `OPENAI_API_KEY` | All matches show 50% and “AI matching not configured” | Same as above |

So:

- **“Not working” for AI** = either no `OPENAI_API_KEY` in `backend/.env`, or an invalid/key with no credits.
- **OpenAI is paid** in the sense that you need to add a payment method and pay for usage; there is no permanent free tier for API calls. So yes – **if you haven’t paid / added billing with OpenAI, the AI features won’t work.**

---

## 4. Optional – billing (Stripe)

| Env vars | Purpose | Cost |
|----------|--------|------|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Employer billing / subscriptions | Stripe account; you only pay Stripe fees when you charge customers |

If these are missing, only billing-related endpoints are affected. Auth, jobs, matching, etc. still work.

---

## Quick checklist

1. **Backend won’t start**  
   → Check `DATABASE_URL` and `SUPABASE_JWT_SECRET` in `backend/.env` (from Supabase; no payment required).

2. **No real job listings / only demo jobs**  
   → Add Adzuna and/or RapidAPI (JSearch) keys. Both have free options; payment is not required to get basic listings.

3. **Resume parsing is basic / match scores always 50%**  
   → Add a valid `OPENAI_API_KEY` and ensure your OpenAI account has billing enabled (pay-as-you-go). **This is the only part that requires “paying” for the APIs to work.**

4. **Billing / checkout broken**  
   → Configure Stripe keys and webhook secret when you’re ready to charge.

---

## Checking what’s configured

With the backend running (and not in production), you can see which keys are set:

```http
GET http://127.0.0.1:8000/debug/config
```

Response is a JSON object with booleans like `has_openai_key`, `has_rapidapi_key`, `has_adzuna`, etc. No secrets are returned.

---

**Summary:**  
The main reason “APIs aren’t working” is usually **missing or invalid keys in `backend/.env`**, not “we haven’t paid.” The only service that actually requires payment to work is **OpenAI** (for AI resume parsing and match scores). Job aggregation (Adzuna, JSearch) can work with **free** signup and free-tier keys.
