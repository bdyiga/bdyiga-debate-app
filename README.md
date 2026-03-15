# LD Debate Tournament Manager

A web application for organizing Lincoln-Douglas (LD) debate tournaments. Built with **Vite + React**, **Express**, **Prisma (PostgreSQL)**, **Supabase Auth**, and **TailwindCSS**.

Deployable on **Vercel**, **GitHub Pages**, or run entirely locally.

## Prerequisites

1. A **Supabase** project — create one free at [supabase.com](https://supabase.com)
2. In your Supabase dashboard:
   - Go to **Settings > API** to get your project URL, anon key, and service role key
   - Go to **Settings > Database** to get your PostgreSQL connection strings
   - Go to **Authentication > Providers** and make sure **Email** is enabled
   - Under **Authentication > Settings**, disable "Confirm email" for local development

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in your Supabase credentials
#    (edit .env with your real values)
cp .env .env.local   # or just edit .env directly

# 3. Push the schema to Supabase and seed test data
npm run setup

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build                          # Build the frontend
NODE_ENV=production npm start          # Serve frontend + API on port 3000
```

## Deployment

### Vercel

1. Push the repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Vercel auto-detects the config from `vercel.json`
4. Set these environment variables in the Vercel dashboard:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `DATABASE_URL`, `DIRECT_URL`

### GitHub Pages (Frontend Only)

GitHub Pages serves static files — the API won't run there. Point the frontend at a hosted API (e.g. your Vercel deployment).

```bash
# Set your Vercel API URL, then build & deploy
VITE_API_URL=https://your-app.vercel.app npm run deploy:gh-pages
```

The deploy script automatically sets `VITE_BASE_PATH=/bdyiga-debate-app/` for correct asset paths and generates a `404.html` for SPA routing.

On the API side (Vercel), set `CORS_ORIGIN=https://bdyiga.github.io` so the server accepts cross-origin requests from GitHub Pages.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `SUPABASE_URL` | Server + Build | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (keep secret!) |
| `VITE_SUPABASE_URL` | Build-time | Supabase URL for the frontend |
| `VITE_SUPABASE_ANON_KEY` | Build-time | Supabase anon key for the frontend |
| `DATABASE_URL` | Server | Supabase pooled PostgreSQL connection string |
| `DIRECT_URL` | Server | Supabase direct PostgreSQL connection string |
| `CORS_ORIGIN` | Server | Allowed origin for CORS (e.g. `https://bdyiga.github.io`) |
| `PORT` | Server | Server port (default `3000`) |
| `VITE_API_URL` | Build-time | API base URL for GH Pages (e.g. `https://your-app.vercel.app`) |
| `VITE_BASE_PATH` | Build-time | Asset base path for GH Pages (e.g. `/bdyiga-debate-app/`) |

## Test Credentials

All seeded accounts use the password: **`password`**

| Role     | Email                  | Name            |
|----------|------------------------|-----------------|
| Manager  | manager@example.com    | Alice Manager   |
| Manager  | manager2@example.com   | Bob Manager     |
| Judge    | judge1@example.com     | Carol Judge     |
| Judge    | judge2@example.com     | Dave Judge      |
| Judge    | judge3@example.com     | Eve Judge       |
| Student  | student1@example.com   | Frank Student   |
| Student  | student2@example.com   | Grace Student   |
| Student  | student3@example.com   | Hank Student    |
| Student  | student4@example.com   | Ivy Student     |
| Student  | student5@example.com   | Jake Student    |
| Student  | student6@example.com   | Kim Student     |

## Seeded Data

- **1 Tournament**: "Fall Invitational 2026" with resolution on civil disobedience
- **3 Rounds** with 3 pairings each (9 total pairings)
- **2 Pre-submitted ballots** (Round 1, pairings 1 and 2)

## LD Debate Format

Lincoln-Douglas (LD) is a one-on-one debate format:

- **Affirmative**: Argues in favor of the resolution
- **Negative**: Argues against the resolution
- **Judge**: Evaluates the round and submits a ballot

### Ballot Fields

| Field            | Description                                      |
|------------------|--------------------------------------------------|
| Winner           | AFFIRMATIVE or NEGATIVE                          |
| Aff Speaker Pts  | Numeric score (0–30) for the affirmative debater |
| Neg Speaker Pts  | Numeric score (0–30) for the negative debater    |
| Comments         | Free-text judge feedback on argumentation        |
| Timestamp        | Auto-recorded when the ballot is submitted       |

## Testing Common Flows

### 1. Submit a Ballot (Judge)
1. Log in as `judge3@example.com` / `password`
2. See pending pairings (Round 1 pairing 3 has no ballot)
3. Click "Submit Ballot" → select winner, enter points, add comments, submit

### 2. View Results (Student)
1. Log in as `student1@example.com` / `password`
2. See Round 1 result with judge comments and speaker points

### 3. Create a Pairing (Manager)
1. Log in as `manager@example.com` / `password`
2. Click a tournament → "+ Add Pairing" → select round/debaters/judge/room → create
3. Log in as the assigned judge — the new pairing appears

### 4. Export Ballots (Manager)
1. From tournament detail, click "Export CSV"

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | Vite, React, React Router, TailwindCSS      |
| Backend   | Express (API routes)                        |
| Database  | PostgreSQL via Prisma ORM (Supabase)        |
| Auth      | Supabase Auth (JWT tokens)                  |
| Deploy    | Vercel (full-stack) or GitHub Pages (SPA)   |

## Scripts

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `npm run dev`        | Start dev server (Vite + Express, port 3000) |
| `npm run build`      | Build frontend with Vite                   |
| `npm start`          | Production: Express serves dist/ + API     |
| `npm run setup`      | Push schema + seed (first time)            |
| `npm run prisma:push`| Push schema to Supabase                    |
| `npm run prisma:migrate` | Run Prisma migration                  |
| `npm run seed`       | Seed database with test data               |
| `npm run deploy:gh-pages` | Build and deploy to GitHub Pages      |

## Project Structure

```
├── index.html              # Vite entry point
├── vite.config.js          # Vite + React + 404.html plugin
├── vercel.json             # Vercel deployment config
├── package.json
├── server/
│   ├── app.js              # Express API (all routes)
│   ├── auth.js             # Supabase JWT verification + auth middleware
│   ├── index.js            # Server entry (dev: Vite middleware, prod: static)
│   ├── prisma.js           # Prisma client singleton
│   └── supabase.js         # Supabase admin client (service role)
├── api/
│   └── index.js            # Vercel serverless entry
├── prisma/
│   ├── schema.prisma       # Database schema (PostgreSQL)
│   └── seed.js             # Test data seeder (creates Supabase auth users + DB records)
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # React Router routes
│   ├── index.css           # Tailwind styles
│   ├── lib/
│   │   ├── api.js          # API URL helper + JWT-authenticated fetch
│   │   ├── supabase.js     # Supabase client (anon key)
│   │   └── useUser.jsx     # Auth context + hooks (Supabase Auth)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── BallotForm.jsx
│   │   ├── PairingCard.jsx
│   │   └── TournamentForm.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── ManagerDashboard.jsx
│       ├── TournamentDetail.jsx
│       ├── JudgeDashboard.jsx
│       ├── BallotPage.jsx
│       └── StudentDashboard.jsx
```
