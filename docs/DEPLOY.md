# AthLink — MVP production deploy

Deploy the coach-validation MVP (registration + bookings + analytics, **no payments**) to Vercel with managed PostgreSQL.

## 1. Create PostgreSQL (Neon recommended)

1. Create a project at [Neon](https://neon.tech) (free tier is fine).
2. Copy the **pooled** connection string, e.g.  
   `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

## 2. Vercel environment variables

In the Vercel project **athlink** → Settings → Environment Variables (Production):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `ADMIN_STATS_TOKEN` | (optional) random token for `/api/stats` |

CLI example:

```bash
printf '%s' 'postgresql://...' | vercel env add DATABASE_URL production
printf '%s' "$(openssl rand -base64 32)" | vercel env add SESSION_SECRET production
printf '%s' 'https://athlink.vercel.app' | vercel env add NEXT_PUBLIC_APP_URL production
```

## 3. Push schema to production DB

From your machine (with production `DATABASE_URL`):

```bash
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed   # optional demo accounts
```

## 4. Deploy

```bash
vercel deploy --prod
```

## 5. Verify

```bash
curl https://your-app.vercel.app/api/health
curl -H "X-Admin-Token: YOUR_TOKEN" https://your-app.vercel.app/api/stats
```

## Coach onboarding flow (MVP)

1. Open `/signup?role=coach`
2. Complete `/coach/register` → profile + 14 days of time slots created
3. Share `/c/{coachId}` or QR from `/coach/qr`
4. Athletes book without payment; coach confirms in dashboard
5. Track funnel at `/coach/analytics`

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Coach | `tanaka@athlink.app` | `Athlink2026!` |
| Athlete | `ethan.park@athlink.app` | `Athlink2026!` |
