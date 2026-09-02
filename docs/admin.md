# AthLink Executive Admin

Internal dashboard at **`/admin`** for AthLink leadership (`role = executive`).

## Stack note

This repo is **Next.js 16 + Drizzle + PostgreSQL**, not the AthlinkPro Vite/Supabase stack. Admin APIs live under `/api/admin/*` instead of Supabase Edge Functions. Stripe, Resend, Sentry, and Jotform integrations are stubbed until env vars are set.

## Access control

| Rule | Implementation |
|------|----------------|
| Who can access `/admin/*` | Users with `users.role = 'executive'` |
| Registration | `@athlink.com` or `@athlink.app` only (`EXECUTIVE_EMAIL_DOMAINS`) |
| First executive | Requires `ADMIN_BOOTSTRAP_SECRET` in env |
| Additional executives | Existing executive invites via `/admin/users`, or bootstrap secret |
| Public signup | `athlete`, `coach`, `parent` only — never `executive` |
| Session | HttpOnly cookie `athlink_session` (same as main app) |
| API auth | Every `/api/admin/*` route calls `requireExecutive()` |

Non-executives hitting `/admin` are redirected to `/admin/login?error=not_executive`.

## Routes

| Path | Purpose |
|------|---------|
| `/admin/login` | Executive sign-in |
| `/admin/register` | Bootstrap or invite-only executive registration |
| `/admin` | Overview — stats, health, needs attention |
| `/admin/errors` | Dependency health (DB, Stripe, Resend, Sentry placeholders) |
| `/admin/coaches` | Application queue + coach roster |
| `/admin/athletes` | Athlete roster |
| `/admin/bookings` | All sessions |
| `/admin/ai` | Placeholder until `ai_breakdown_jobs` table exists |
| `/admin/messaging` | Thread counts; Resend log when wired |
| `/admin/moderation` | Placeholder until report tables exist |
| `/admin/config` | Feature flags toggle |
| `/admin/audit` | `admin_audit_log` viewer |
| `/admin/users` | Invite executives + user list |

Site footer and landing footer link to **`/admin`**.

## Database tables (admin-specific)

Added via Drizzle schema (`npm run db:push`):

- **`admin_audit_log`** — executive actions
- **`feature_flags`** — kill switches / rollouts
- **`admin_alerts`** — overview alert feed
- **`coach_applications`** — coach intake queue
- **`platform_config`** — JSON config (seeded later)

Executive role uses existing **`users.role = 'executive'`** enum value (no separate `is_admin` column).

## Environment variables

```bash
# Required for admin auth
DATABASE_URL=postgresql://...
ADMIN_BOOTSTRAP_SECRET=openssl rand -hex 32   # first executive only
EXECUTIVE_EMAIL_DOMAINS=athlink.com,athlink.app

# Planned integrations (optional in MVP)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
SLACK_ALERT_WEBHOOK=
JOTFORM_API_KEY=
```

## Local setup

```bash
cp .env.example .env.local
# Set DATABASE_URL and ADMIN_BOOTSTRAP_SECRET

npm run db:push
npm run db:seed

npm run dev
# http://localhost:3000/admin/register  (first executive)
# http://localhost:3000/admin/login
```

**Seed executive:** `ceo@athlink.app` / `Athlink2026!` (after `db:seed`)

## Granting executive access

1. **Bootstrap:** Set `ADMIN_BOOTSTRAP_SECRET`, visit `/admin/register`, use `@athlink.com` or `@athlink.app` email.
2. **Invite:** Sign in as executive → `/admin/users` → create account with allowed domain.
3. **Never** set `role=executive` via public `/signup`.

## API routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth/login` | POST | Executive login |
| `/api/admin/auth/register` | GET/POST | Registration gate + create executive |
| `/api/admin/overview` | GET | Dashboard stats |
| `/api/admin/health` | GET | Cached 60s health checks |
| `/api/admin/coaches` | GET | Coaches + applications |
| `/api/admin/applications` | PATCH | Approve / reject / request info |
| `/api/admin/bookings` | GET | All bookings |
| `/api/admin/athletes` | GET | Athlete profiles |
| `/api/admin/messaging` | GET | Thread stats |
| `/api/admin/feature-flags` | GET/PATCH | List / toggle flags |
| `/api/admin/audit` | GET | Audit log |
| `/api/admin/users` | GET/POST | Users / invite executive |

## What’s next (AthlinkPro parity)

- Stripe payment mismatch table + webhook retry
- Resend delivery log + Sentry proxy API routes
- Jotform webhook → `coach_applications`
- `ai_breakdown_jobs` + queue UI
- Cron alert dispatcher (Vercel Cron or external)
- Read-only impersonation tokens
