# Athlink information architecture

Marketplace pattern (Airbnb / ClassPass style): **show inventory first, ask for an account when needed**.

## Three layers

| Layer | Role | Primary URLs |
|-------|------|----------------|
| **Marketing HQ** | Brand + routes into the product | `/` |
| **Role LPs** | Athlete / coach story → register | `/get-started`, `/for-athletes`, `/for-coaches` |
| **Platform** | Search, book, train, coach OS | `/search`, `/home`, `/coach/*`, `/messages`, `/sns` |

Canonical path helpers: [`src/lib/market-to-platform.ts`](../src/lib/market-to-platform.ts).

## Accurate visitor → platform flow

```
Guest
  └─ /  (HQ)
       ├─ Find coaches → /search              ← public inventory
       ├─ Get started  → /get-started         ← role fork
       │                    ├─ /for-athletes → /join/athlete → Clerk → /app
       │                    └─ /for-coaches  → /join/coach   → Clerk → /app
       └─ Log in → /sign-in?redirect_url=/app → /app → role home

Signed-in
  ├─ Athlete → /home (platform) — marketplace still at /search
  ├─ Coach   → /coach/dashboard
  └─ Never bounce back to HQ or /get-started
```

`/app` is the post-auth router only. It must not render marketing chrome.

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
- Send signed-in users back through `/get-started`
- Hide `/search` behind login

## Open follow-ups

- Unify Clerk signup with `/join/*` local signup
- Merge `/coach/register` into `/join/coach`
- Production `CLERK_*_FALLBACK_REDIRECT_URL=/app`
