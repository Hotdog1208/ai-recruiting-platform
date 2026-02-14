# What You’re Missing – Exact Steps

Your **backend `.env` is fully populated**. Every expected variable is set and the values look like real keys (not placeholders). So the problem is likely one of: backend not running, wrong URL, or a specific service (OpenAI / RapidAPI / Adzuna) rejecting the key.

Do these in order.

---

## 1. Confirm the backend is running

- In a terminal:
  ```bash
  cd backend
  pip install -r requirements.txt   # if you haven’t
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```
- Open: **http://127.0.0.1:8000/health**  
  You should see: `{"status":"ok"}`.  
  If that fails, the app isn’t starting (e.g. database or config error in the terminal).

---

## 2. Confirm the frontend talks to that backend

- Frontend should call **http://127.0.0.1:8000** (or whatever you set).
- In the project root, check **frontend/.env.local** (or **frontend/.env**):
  ```env
  NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
  ```
- If you run the frontend on another host/port, keep this URL pointing at the backend.  
  If `NEXT_PUBLIC_API_URL` is wrong or missing, “APIs not working” is really “frontend not hitting your backend.”

---

## 3. See what the backend thinks is configured

- With the backend running, open: **http://127.0.0.1:8000/debug/config**  
  (If you set `ENV=production` or `ENVIRONMENT=production`, this route returns 404.)
- You’ll see something like:
  ```json
  {
    "has_database_url": true,
    "has_supabase_secret": true,
    "has_openai_key": true,
    "has_stripe_key": true,
    "has_stripe_webhook_secret": true,
    "has_rapidapi_key": true,
    "has_adzuna": true
  }
  ```
- If any of these are `false`, that variable isn’t loaded (e.g. typo in name, or wrong `.env` file).

---

## 4. If “jobs” or “external jobs” don’t work

- **Adzuna:**  
  - Get keys from: https://developer.adzuna.com/  
  - In **backend/.env**: `ADZUNA_APP_ID=...` and `ADZUNA_APP_KEY=...`  
  - Restart the backend after changing `.env`.

- **JSearch (Indeed, etc.):**  
  - Get **RAPIDAPI_KEY** from https://rapidapi.com/  
  - Subscribe to the **JSearch** API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch  
  - Choose the **free** plan if you only need light use.  
  - Put the key in **backend/.env** as `RAPIDAPI_KEY=...` and restart.

- If both are set and you still get no external jobs, check backend logs when you trigger a search; the aggregator may be returning errors (e.g. 401/403 for bad keys or unsubscribed API).

---

## 5. If “AI” (resume parsing or match scores) doesn’t work

- **OpenAI** is pay-per-use. You need:
  - A valid **OPENAI_API_KEY** in **backend/.env** (you already have one set).
  - Billing enabled on the OpenAI account and some usage left (or credit).
- In the OpenAI dashboard:  
  https://platform.openai.com/account/billing  
  - Add a payment method if you haven’t.  
  - If the key was regenerated, replace `OPENAI_API_KEY` in **backend/.env** and restart.

---

## 6. Quick test of “APIs” from the backend

- With backend running:
  - **Health:**  
    `GET http://127.0.0.1:8000/health` → `{"status":"ok"}`
  - **Config (no production):**  
    `GET http://127.0.0.1:8000/debug/config` → all `has_*` true.
  - **Jobs (no auth):**  
    `GET http://127.0.0.1:8000/matching/browse` → JSON list of jobs (platform + external or demo).
  - **External jobs refresh:**  
    `GET http://127.0.0.1:8000/external-jobs?refresh=true` → JSON list.

If (1)–(3) work but the frontend still says “APIs not working,” the issue is on the frontend (wrong URL, CORS, or how it’s calling the backend). If (4) or (5) fail, the issue is that specific service (key or billing).

---

## Summary

- You are **not** missing env vars; they’re all set.
- Do this:
  1. Start backend, check **/health** and **/debug/config**.
  2. Set **NEXT_PUBLIC_API_URL** in the frontend to that backend URL.
  3. If jobs don’t load: confirm Adzuna/RapidAPI keys and JSearch subscription, then check backend logs.
  4. If AI doesn’t work: confirm OpenAI key and billing, then restart backend after any .env change.

After these steps, if something still fails, say which of the four (backend health, jobs, AI, or frontend) and we can narrow it down.
