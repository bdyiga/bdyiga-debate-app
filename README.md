# LD Debate Tournament Manager

A local-first web application for organizing Lincoln-Douglas (LD) debate tournaments. Built with **Vite + React**, **Express**, **Prisma (SQLite)**, and **TailwindCSS**.

Deployable on **Vercel**, **GitHub Pages**, or run entirely locally.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run database migration and seed test data
npm run setup

# 3. Start the development server
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
4. Set environment variables in the Vercel dashboard: `SESSION_SECRET`, `DATABASE_URL`
5. **Note**: SQLite uses a local file — for production Vercel, swap to a cloud-compatible database (e.g. Turso, PlanetScale, or Vercel Postgres) by updating `prisma/schema.prisma`

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
| `DATABASE_URL` | Server | Prisma DB connection (e.g. `file:./dev.db` for SQLite) |
| `SESSION_SECRET` | Server | iron-session secret (32+ chars) |
| `CORS_ORIGIN` | Server | Allowed origin for CORS (e.g. `https://bdyiga.github.io`) |
| `PORT` | Server | Server port (default `3000`) |
| `NODE_ENV` | Server | Set to `production` for prod builds |
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

### 5. Permission Check
```bash
curl -X POST http://localhost:3000/api/ballots \
  -H "Content-Type: application/json" \
  -b <judge_cookie_for_unassigned_pairing> \
  -d '{"pairingId":6,"winner":"AFFIRMATIVE","affSpeakerPts":28,"negSpeakerPts":27}'
# Returns 403: "You are not assigned to judge this pairing"
```

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | Vite, React, React Router, TailwindCSS      |
| Backend   | Express (API routes)                        |
| Database  | SQLite via Prisma ORM                       |
| Auth      | iron-session (encrypted cookies) + bcryptjs |
| Deploy    | Vercel (full-stack) or GitHub Pages (SPA)   |

No external paid services — runs entirely locally.

## Scripts

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `npm run dev`        | Start dev server (Vite + Express, port 3000) |
| `npm run build`      | Build frontend with Vite                   |
| `npm start`          | Production: Express serves dist/ + API     |
| `npm run setup`      | Run migration + seed (first time)          |
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
│   ├── index.js            # Server entry (dev: Vite middleware, prod: static)
│   ├── prisma.js           # Prisma client singleton
│   └── session.js          # iron-session config + auth middleware
├── api/
│   └── index.js            # Vercel serverless entry
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Test data seeder
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # React Router routes
│   ├── index.css           # Tailwind styles
│   ├── lib/
│   │   ├── api.js          # API URL helper (VITE_API_URL support)
│   │   └── useUser.jsx     # Auth context + hooks
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
