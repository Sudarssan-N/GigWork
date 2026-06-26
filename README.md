# GigWork

A gig-worker marketplace connecting customers who need small local help with workers willing to do the tasks. Built with React, FastAPI, and Supabase.

> Full architecture, schema, API design, and roadmap: **[ARCHITECTURE.md](./ARCHITECTURE.md)**

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Payments:** Razorpay (UPI/cards) — dev mock endpoint included

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Enable **Email** auth in Authentication → Providers (disable Phone if not needed)
4. For local dev, disable **Confirm email** under Authentication → Providers → Email
5. Copy your project URL, publishable/anon key, and service role key into `.env` files
6. Run `supabase/migrations/002_storage_bucket.sql`
7. **Important:** Run `supabase/FIX_SIGNUP.sql` in SQL Editor (fixes signup 500 error)
8. To create an admin user, after signup run in SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
   ```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase + Razorpay credentials
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in Supabase + API URL
npm run dev
```

Open http://localhost:5173

## Project Structure

```
GigWork/
├── frontend/          # React SPA
├── backend/           # FastAPI API
└── supabase/          # SQL migrations
```

## Core Flow

1. Customer posts a task
2. Workers browse and apply with a quote
3. Customer accepts an application → booking created
4. Customer pays (Razorpay or dev mock)
5. Job runs → marked complete → worker rated

## API Docs

With the backend running: http://localhost:8000/docs

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.