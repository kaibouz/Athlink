# Athlink information architecture

Marketplace pattern (Airbnb / ClassPass style): **show inventory first, ask for an account when needed**.

Aligned with **AthlinkPro Athlete / Coach screen PDFs**:
Launch → Choose your side → role home → primary loops (Find a coach / Calendar, Feed/Scout, Messages/Inbox, Progress/Earnings).

## Three layers

| Layer | Role | Primary URLs |
|-------|------|----------------|
| **Marketing HQ** | Brand + **one** Get Started | `/` |
| **Role fork + LPs** | Choose athlete / coach → story → register | `/get-started`, `/for-athletes`, `/for-coaches` |
| **Platform** | Same screens as the mobile concept | `/search`, `/home`, `/coach/*`, `/messages`, `/sns`, `/progress` |

Canonical path helpers: [`src/lib/market-to-platform.ts`](../src/lib/market-to-platform.ts).

## Accurate visitor → platform flow

```
Guest
  └─ /  (HQ)  — single primary CTA: Get started
       ├─ (secondary text) Find coaches → /search   ← public inventory
       └─ Get started → /get-started                ← PDF: Choose your side
                            ├─ Continue as athlete → /for-athletes → /join/athlete → Clerk → /app → /home
                            └─ Continue as coach   → /for-coaches  → /join/coach   → Clerk → /app → /coach/dashboard

Signed-in
  ├─ Athlete tabs: Home · Find coach · Feed · Messages · Progress
  ├─ Coach tabs:   Today · Calendar · Scout · Inbox · Earnings
  └─ Never bounce back to HQ or /get-started
```

`/app` is the post-auth router only. It must not render marketing chrome.

## Simplification rules (from PDF + market)

- **One Get Started** on HQ — role choice happens once on `/get-started`, not as competing hero buttons.
- Role LP cards on HQ are **story teasers**, not a second signup funnel.
- Nav labels match the PDF (Find coach, Scout, Inbox) so market → app feels continuous.
- Browse `/search` stays public; booking / messaging still gate on auth.

## Glassmorphism surface (platform + marketing cards)

Decorative glass skin for **content panels and chrome** (not Apple Liquid Glass — glass is not reserved for floating controls alone):

- `backdrop-filter: blur(16px)`
- `background: rgba(255,255,255,0.12)` (dark equivalent via tokens)
- `border: 1px solid rgba(255,255,255,0.25)`
- Soft wide shadow + optional contrast scrim for readable text
- Backdrop wash/image stays flexible via `--glass-scene-*` CSS variables
- Fallbacks: `prefers-reduced-transparency`, `prefers-reduced-motion`

Use `.glass-panel` / `<GlassPanel>` / `.glass-scene` / `<GlassScene>`.

## Do not

- Make `/` a role-only gateway (story never lands)
- Put multiple peer Get Started / Sign up CTAs in the HQ hero
- Send signed-in users back through `/get-started`
- Hide `/search` behind login

## Open follow-ups

- Unify Clerk signup with `/join/*` local signup
- Merge `/coach/register` into `/join/coach`
- Production `CLERK_*_FALLBACK_REDIRECT_URL=/app`
