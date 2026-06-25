# Deployment Guide — Django (Railway) + Next.js (Vercel)

## Architecture
```
Vercel (Next.js frontend)  ──→  Railway (Django API)  ──→  Supabase (PostgreSQL + Storage)
```

---

## 1. Deploy the Backend to Railway

### One-click setup
1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select your repo, then set the **Root Directory** to `backend`.
4. Railway auto-detects Python via `nixpacks.toml` and runs the `Procfile`.

### Required Environment Variables (Railway dashboard → Variables)

| Variable | Value |
|---|---|
| `SECRET_KEY` | Run `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app.railway.app` (your Railway domain) |
| `DATABASE_URL` | Auto-injected if you add a Railway PostgreSQL plugin — otherwise use Supabase DB URL |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase → Project Settings → API → **service_role** key |
| `SUPABASE_BUCKET` | `documents` (or your bucket name) |
| `PORT` | Auto-set by Railway — do **not** set manually |

### First deploy checklist
- [ ] Migrations run automatically via `Procfile` `release` command.
- [ ] After first deploy, run seed scripts via Railway shell if needed:
  ```bash
  python seed_admin.py
  ```

---

## 2. Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import from GitHub.
2. Set **Root Directory** to `frontend`.
3. Vercel auto-detects Next.js. Framework preset: **Next.js**.
4. Add this **Environment Variable** in Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` (no trailing slash) |

5. Deploy.

---

## 3. CORS — connect them together

In Railway, set:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

In Vercel, set:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 4. Supabase Storage setup
1. Supabase dashboard → **Storage** → **New bucket** → name it `documents`.
2. Set bucket to **Private**.
3. Use the **service_role** key (not anon) in your Railway env — this lets the backend upload and generate signed URLs.

---

## 5. Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env    # then fill in your values
python manage.py migrate
python seed_admin.py
python manage.py runserver
```

### Frontend
```bash
cd frontend
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
pnpm dev
```

---

## 6. Scaling Notes

- **Railway**: upgrade to Pro plan for more vCPU/RAM; Gunicorn is configured with `--workers 2 --threads 4`. Increase workers for CPU-bound loads.
- **Vercel**: scales automatically — no changes needed.
- **Database**: Railway PostgreSQL is fine to start; migrate to Supabase direct connection (with pgBouncer) if you hit connection limits.
- **File uploads**: all files go through Supabase Storage directly from the backend — no Railway disk usage.
