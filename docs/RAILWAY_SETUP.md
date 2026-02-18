# Setting Up the Backend on Railway

This guide gets your **FastAPI backend** running on Railway and reachable at **https://api.recruiter.solutions**.

---

## Prerequisites

- GitHub repo pushed (your backend code is in the `backend/` folder).
- A [Railway](https://railway.app) account (sign up with GitHub).
- **Supabase** project with:
  - **Database** → Connection string (URI) for `DATABASE_URL`.
  - **Project Settings → API** → **JWT Secret** for `SUPABASE_JWT_SECRET`.

---

## 1. Create a new project on Railway

1. Go to [railway.app](https://railway.app) and log in (GitHub is easiest).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your **ai-recruiting-platform** repo (or the repo that contains the `backend/` folder).
5. If Railway asks “Configure a service,” choose **Add a service** or **Deploy now**; we’ll set the rest in the next steps.

---

## 2. Set the root directory and build

Railway will clone the whole repo. Your app lives in **`backend/`**, so we need to tell Railway to use that folder.

1. In your Railway project, click the **backend service** (the one that was created from the repo).
2. Open the **Settings** tab.
3. Find **Root Directory** (or **Source** / **Build** section).
4. Set **Root Directory** to:
   ```text
   backend
   ```
5. Save if there’s a Save button.

**Build settings (Railway often auto-detects):**

- **Build Command:** leave empty or set to:
  ```text
  pip install -r requirements.txt
  ```
- **Start Command:** set to:
  ```text
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
  Railway provides `$PORT`; your app must listen on that port.

If Railway doesn’t show a custom Start Command, add a **Procfile** or a **nixpacks.toml** in the repo (see step 6 below). Otherwise, set the start command in the Railway **Settings** or **Variables** → **Start Command**.

---

## 3. Add environment variables

In the same service → **Variables** (or **Environment**):

Add these (use your real values; no quotes in the value field):

| Variable | Value | Where to get it |
|----------|--------|------------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[PASSWORD]@...pooler.supabase.com:5432/postgres` | Supabase → **Project Settings** → **Database** → **Connection string** (URI). Use the **Connection pooling** URI; replace `[YOUR-PASSWORD]` with your DB password. If the password has `@` or `#`, URL-encode it (e.g. `@` → `%40`). |
| `SUPABASE_JWT_SECRET` | Your JWT secret string | Supabase → **Project Settings** → **API** → **JWT Secret**. |
| `FRONTEND_ORIGIN` | `https://recruiter.solutions,https://www.recruiter.solutions` | So the backend allows CORS from your frontend. |

Optional (add later if you use them):

- `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc. (see `backend/.env.example`).

Click **Add** or **Save** for each variable. Railway will redeploy when you change variables.

---

## 4. Deploy and get the URL

1. Trigger a deploy if it didn’t start automatically: **Deployments** → **Redeploy** or push a commit.
2. In **Settings**, find **Networking** or **Public Networking**.
3. Click **Generate domain** (or **Add a domain**). Railway will give you a URL like:
   ```text
   https://ai-recruiting-platform-production-xxxx.up.railway.app
   ```
4. Open that URL in the browser and add `/health`, e.g.:
   ```text
   https://ai-recruiting-platform-production-xxxx.up.railway.app/health
   ```
   You should get a JSON response (e.g. `{"status":"ok"}` or similar). If that works, the backend is running.

---

## 5. Add custom domain `api.recruiter.solutions`

1. In the same service, go to **Settings** → **Networking** / **Domains**.
2. Click **Custom Domain** (or **Add domain**).
3. Enter:
   ```text
   api.recruiter.solutions
   ```
4. Railway will show you what to set in DNS (usually a **CNAME** record).

**At GoDaddy (or your DNS provider):**

- **Type:** CNAME  
- **Name / Host:** `api`  
- **Value / Points to:** the hostname Railway gives you (e.g. `xxxx.up.railway.app` or similar).  
- **TTL:** 3600 (or default).

Save DNS. Wait 5–60 minutes for propagation. Railway will issue SSL for `api.recruiter.solutions` automatically.

---

## 6. (Optional) Start command via Procfile

If Railway doesn’t let you set the start command in the UI, add a **Procfile** in the **backend** folder so Railway runs uvicorn on `$PORT`:

Create **`backend/Procfile`** with one line:

```text
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Commit and push. Railway will use this to start the app.

(If your repo root is the project root, some setups expect the Procfile at repo root; then use **Root Directory** = `backend` and put the Procfile in `backend/Procfile` as above.)

---

## 7. Run database migrations on production

Your production database (Supabase) must have the same schema as your app. Run migrations **once** against the production `DATABASE_URL`:

**Option A – from your machine (recommended):**

1. Set `DATABASE_URL` in your shell to the **same** Supabase URI you added on Railway (production DB).
2. From the repo root:
   ```bash
   cd backend
   alembic upgrade head
   ```
   Use the same `DATABASE_URL` Railway uses so you’re migrating the production DB.

**Option B – Railway one-off run:**

If Railway supports a “one-off command” or “run command,” run:

```text
alembic upgrade head
```

from the **backend** root (with Railway’s env vars loaded). That will run migrations against the production DB.

---

## 8. Point the frontend at the backend

1. **Vercel** → your frontend project → **Settings** → **Environment Variables**.
2. Add (or update) **Production** (and Preview if needed):
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.recruiter.solutions`
     (or your Railway URL like `https://xxxx.up.railway.app` until DNS is ready).
3. **Redeploy** the frontend so it uses the new value.

After DNS propagates, the frontend will call `https://api.recruiter.solutions` and the “Backend not connected” banner should disappear.

---

## Checklist

- [ ] Railway project created from GitHub repo.
- [ ] Root Directory set to **`backend`**.
- [ ] Start command: **`uvicorn app.main:app --host 0.0.0.0 --port $PORT`** (or Procfile in `backend/`).
- [ ] Variables set: **`DATABASE_URL`**, **`SUPABASE_JWT_SECRET`**, **`FRONTEND_ORIGIN`**.
- [ ] Deploy succeeded; **`/health`** on the Railway URL returns OK.
- [ ] Custom domain **`api.recruiter.solutions`** added in Railway; CNAME **`api`** set at GoDaddy (or your DNS).
- [ ] **`alembic upgrade head`** run once against production DB.
- [ ] **`NEXT_PUBLIC_API_URL`** set to **`https://api.recruiter.solutions`** in Vercel; frontend redeployed.

---

## Troubleshooting

- **Build fails:** Check **Root Directory** is `backend` and **Build Command** runs `pip install -r requirements.txt` from that directory.
- **App crashes / no response:** Ensure start command uses **`--host 0.0.0.0`** and **`--port $PORT`**.
- **CORS errors in browser:** `FRONTEND_ORIGIN` must include `https://recruiter.solutions` and `https://www.recruiter.solutions` (comma-separated, no spaces).
- **502 / domain not working:** Wait for DNS; confirm CNAME `api` points to the hostname Railway shows.
