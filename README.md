# Document Review System — Django REST + Supabase

## Project structure
```
document-review-system/
├── backend/    ← Django REST API
└── frontend/   ← Next.js (React/TSX)
```

## Quick start

### 1. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Fill in your values in .env (see MANUAL CHANGES below)

python manage.py makemigrations api
python manage.py migrate
python seed_admin.py        # creates your admin user interactively

python manage.py runserver  # runs on http://localhost:8000
```

### 2. Frontend
```bash
cd frontend
npm install          # or pnpm install / yarn

# Fill in frontend/.env.local (see MANUAL CHANGES below)

npm run dev          # runs on http://localhost:3000
```

---

## MANUAL CHANGES REQUIRED

### backend/.env  ← fill in ALL values
| Variable | Where to find it |
|---|---|
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DB_HOST` | Supabase → Project Settings → Database → Host |
| `DB_PASSWORD` | Supabase → Project Settings → Database → Password |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase → Project Settings → API → service_role key (for storage uploads) |
| `SUPABASE_BUCKET` | Name of the storage bucket you create (default: `documents`) |

### frontend/.env.local  ← one value
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` for local dev; your deployed backend URL for production |

### Supabase Storage setup
1. Go to Supabase → Storage → Create a new bucket named `documents`
2. Set it to **private**
3. Make sure your `SUPABASE_KEY` in `.env` is the **service_role** key (not the anon key) so the backend can upload files
