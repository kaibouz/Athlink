# AthLink — Backend & Database

3-tier architecture for production launch:

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 16 App Router (existing UI) |
| **Backend** | Next.js Route Handlers (`src/app/api/`) |
| **Database** | PostgreSQL 16 + Drizzle ORM |

## Quick start (local)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` if needed. Default `DATABASE_URL`:

```
postgresql://athlink:athlink@localhost:5432/athlink
```

### 3. Create tables & seed demo data

```bash
npm run db:push
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

### 5. Verify database connection

```bash
curl http://localhost:3000/api/health
```

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Coach | `tanaka@athlink.app` | `Athlink2026!` |
| Athlete | `ethan.park@athlink.app` | `Athlink2026!` |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Database connectivity check |
| POST | `/api/auth/signup` | Register (email, password, name, role) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user + bookings |
| GET | `/api/coaches` | List coaches |
| GET | `/api/coaches/[id]` | Coach detail + reviews + slots |
| GET/POST | `/api/bookings` | List / create bookings |
| PATCH | `/api/bookings/[id]` | Update booking status |

Auth uses **httpOnly session cookies** (30-day expiry).

## Database schema

Tables in `src/db/schema.ts`:

- `users`, `sessions` — authentication
- `coach_profiles`, `reviews`, `time_slots`, `bookings` — marketplace core
- `message_threads`, `messages` — messaging
- `athlete_profiles`, `social_posts` — SNS layer
- `student_athletes`, `coach_feedback` — coach tools

## Production deployment (Vercel + managed Postgres)

1. Create a PostgreSQL database (Neon, Supabase, Railway, etc.)
2. Set environment variables on Vercel:
   - `DATABASE_URL`
   - `SESSION_SECRET` (random 32+ char string)
   - `NEXT_PUBLIC_APP_URL` (your production URL)
3. Run migrations before first deploy:

   ```bash
   DATABASE_URL="..." npm run db:push
   DATABASE_URL="..." npm run db:seed
   ```

4. Deploy as usual (`vercel` or Git push)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate SQL migration files |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Drizzle Studio GUI |

## Fallback mode

If `DATABASE_URL` is not set, the app falls back to the original **localStorage demo mode** so UI development still works without Docker.
