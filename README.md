# 🧱 Rubikcon — Web3 Multi-Product Platform

A production-ready monorepo containing 4 independent frontend applications and a unified backend API.

---

## 📁 Project Structure

```
rubikcon/
├── landing/          → rubikcon.com          (port 3000)
├── academy/          → academy.rubikcon.com  (port 3001)
├── games/            → games.rubikcon.com    (port 3002)
├── blockgigs/        → blockgigs.rubikcon.com (port 3003)
└── backend/          → api.rubikcon.com      (port 4000)
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Wouter |
| Backend    | Node.js, Express, TypeScript                      |
| Database   | PostgreSQL + Prisma ORM                           |
| Auth       | JWT (access tokens, 7d expiry)                    |
| Sessions   | Anonymous session support (no login required for Games) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start dev server
npm run dev
# → API running at http://localhost:4000
# → Health check: http://localhost:4000/health
```

**Seed credentials:**
| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | admin@rubikcon.com     | admin123456   |
| Demo  | demo@rubikcon.com      | demo12345     |

---

### 2. Frontend Apps

Each app is independent. Run them in separate terminals:

```bash
# Landing Page (port 3000)
cd landing && npm install && npm run dev

# Academy (port 3001)
cd academy && npm install && npm run dev

# Games (port 3002)
cd games && npm install && npm run dev

# BlockGigs (port 3003)
cd blockgigs && npm install && npm run dev
```

---

## 🌐 Apps Overview

### 🏠 Landing Page (`/landing`) — Port 3000

The main marketing site for Rubikcon.

**Pages:**
- `/` — Full homepage (Hero, Products, Features, Testimonials, CTA, Footer)
- `/login` — JWT login form
- `/signup` — Account creation form

**Features:**
- Parallax hero with animated mesh background
- Product showcase cards (Academy, Games, BlockGigs)
- Mobile-responsive nav with dropdown
- Auth forms connect to backend API

---

### 🎓 Academy (`/academy`) — Port 3001

Full learning management system.

**Pages:**
- `/` — Course landing with enroll CTA
- `/course` — Module browser with progress tracking
- `/lesson/:id` — Full lesson experience

**Features:**
- 4 modules, 10+ lessons (static data — wire to backend to persist)
- Expandable module sidebar
- Embedded YouTube video player
- Mark as Complete with progress bar
- Next/Previous lesson navigation
- Lesson content renderer (markdown-like)

---

### 🎮 Games (`/games`) — Port 3002

Session-based gaming platform. **No login required.**

**Pages:**
- `/` — Game lobby with leaderboard
- `/play/:id` — Active play screen

**Games implemented:**
- **Hash Runner** — Type block numbers to score combos (30s timer)
- **Block Blast** — Tap colored tiles before they vanish (45s timer)
- All other games: Hash Runner engine (extend to add new games)

**Features:**
- Anonymous session via `localStorage` (UUID-based)
- Personal high score tracking per game
- Live leaderboard sidebar
- Score saved to session, upgradeable to on-chain with account

---

### 💼 BlockGigs (`/blockgigs`) — Port 3003

Decentralized talent marketplace.

**Pages:**
- `/` — Gig + Freelancer marketplace with filters
- `/gig/:id` — Full gig detail with application form
- `/freelancer/:id` — Freelancer profile with reviews

**Features:**
- Filter by category, currency, difficulty
- Featured gig highlighting
- Apply with proposal form (requires auth on backend)
- Freelancer profiles with ratings, reviews, posted gigs

---

## 🔌 Backend API Reference

Base URL: `http://localhost:4000`

### Auth
```
POST   /auth/signup          Register new user
POST   /auth/login           Login, receive JWT
GET    /auth/me              Get current user (requires token)
```

### Academy
```
GET    /academy/course           List all courses
GET    /academy/course/:slug     Single course with modules + lessons
GET    /academy/lesson/:id       Single lesson
POST   /academy/progress         Mark lesson complete (auth required)
GET    /academy/progress         Get my progress (auth required)
```

### Games
```
POST   /games/session/start       Start a new session (anon or auth)
GET    /games/session/:id         Get session + scores
POST   /games/score               Submit a score
GET    /games/leaderboard         Global top 50 scores
GET    /games/leaderboard/:gameId Top scores for one game
```

### Gigs
```
GET    /gigs                      List gigs (paginated, filterable)
GET    /gigs/:id                  Single gig detail
POST   /gigs                      Post a gig (auth required)
POST   /gigs/apply                Apply to a gig (auth required)
GET    /gigs/:id/applications     View applications (poster only)
```

### Auth Header
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2025-04-09T12:00:00.000Z"
}
```

---

## 🗄️ Database Schema

```
User         → id, email, password, name, role
Session      → id, userId (nullable), expiresAt
Course       → id, title, slug, published
Module       → id, courseId, title, position
Lesson       → id, moduleId, title, content, videoUrl, duration, position
Progress     → id, userId, lessonId, completed  [unique: userId+lessonId]
Score        → id, sessionId, userId (nullable), gameId, score
Gig          → id, posterId, title, budget, currency, skills[], status
Application  → id, gigId, userId, proposal, rate, status
```

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT signed with HS256, 7-day expiry
- Input validation with Zod on all endpoints
- CORS restricted to configured origins
- Prisma error boundary middleware
- Anonymous game sessions never expose user data

---

## 🚢 Deployment

### Frontend (Vercel)
Each app deploys independently to Vercel. Set environment build commands:
```
Build: npm run build
Output: dist
```

Update `APPS` URLs in each frontend from `localhost` to production domains.

### Backend (Railway / Render)
```bash
# Set these environment variables in your deployment:
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret-min-32-chars
ALLOWED_ORIGINS=https://rubikcon.com,https://academy.rubikcon.com,...
PORT=4000
NODE_ENV=production
```

### Database
Use Railway PostgreSQL, Supabase, or Neon.tech for managed PostgreSQL.

---

## 📜 Scripts Reference

| App       | Command          | Description                    |
|-----------|------------------|--------------------------------|
| all       | `npm install`    | Install dependencies           |
| all       | `npm run dev`    | Start dev server               |
| all       | `npm run build`  | Production build               |
| backend   | `npm run db:generate` | Generate Prisma client    |
| backend   | `npm run db:migrate`  | Run DB migrations         |
| backend   | `npm run db:seed`     | Seed demo data            |
| backend   | `npm run db:studio`   | Open Prisma Studio        |

---

## 🛠 Extending the Platform

### Add a new game to Games app
1. Create a new game component in `games/src/pages/PlayPage.tsx`
2. Add its entry to `games/src/data/gamesData.ts`
3. Add a case in `renderGame()` inside `PlayPage`

### Add a new course to Academy
1. Add modules/lessons to `academy/src/data/courseData.ts`  
   OR seed via `backend/prisma/seed.ts` and wire the API

### Add a new API module to Backend
1. Create `backend/src/modules/<name>/<name>.routes.ts`
2. Add `prisma.model` to `schema.prisma`
3. Run `npm run db:migrate`
4. Mount the router in `backend/src/index.ts`

---

Built with ❤️ for the Web3 frontier - by Natzsmart:[https://www.github.com/Natzsmart]
