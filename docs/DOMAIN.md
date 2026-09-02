# AthLink — MVP domain (Vercel)

## Current status

| URL | Status |
|-----|--------|
| https://athlink-taupe.vercel.app | **Live** (Vercel default, no DNS needed) |
| https://athlink.com | Added to project — **DNS pending** |
| https://www.athlink.com | Added — **DNS pending** (redirects to apex) |
| https://mvp.athlink.com | Added — **DNS pending** (MVP subdomain option) |

Vercel project: **athlink**  
Dashboard: https://vercel.com/6gw2mkt2vm-9334s-projects/athlink/settings/domains

`NEXT_PUBLIC_APP_URL` (Production): `https://athlink.com`

---

## DNS setup (required)

Domain registrar DNS is on **a2dns.com** nameservers. Log in to your domain/DNS panel and add:

### Option A — Production apex (`athlink.com`)

| Type | Name | Value |
|------|------|--------|
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |

(Legacy single-IP also works: `76.76.21.21`)

### Option B — `www`

| Type | Name | Value |
|------|------|--------|
| CNAME | `www` | `3bc3ecb1b3718979.vercel-dns-017.com` |

`vercel.json` redirects `www` → `athlink.com`.

### Option C — MVP only (`mvp.athlink.com`) — fastest to test

One record, no apex change:

| Type | Name | Value |
|------|------|--------|
| CNAME | `mvp` | `3bc3ecb1b3718979.vercel-dns-017.com` |

Then use https://mvp.athlink.com for coach demos.

---

## Verify after DNS change

Propagation usually takes 5–60 minutes.

```bash
vercel domains verify athlink.com
vercel domains verify www.athlink.com
vercel domains verify mvp.athlink.com
```

When `ok: true`, redeploy:

```bash
vercel deploy --prod
```

---

## Buy a domain inside Vercel (alternative)

If you prefer Vercel as registrar:

```bash
vercel domains search athlink
vercel domains check yourname.com
vercel domains buy yourname.com
vercel domains add yourname.com athlink
```

`athlink.com` is already owned (Third Party), so purchase is not needed.

---

## Checklist

- [x] Domain added to Vercel team
- [x] Domain linked to `athlink` project
- [x] `www` + `mvp` subdomains added
- [x] `NEXT_PUBLIC_APP_URL` set to `https://athlink.com`
- [ ] DNS A/CNAME records at a2dns.com
- [ ] `vercel domains verify` passes
- [ ] `vercel deploy --prod`
