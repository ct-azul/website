# CLAUDE.md — Cluster Tecnológico Azul Website

Operational guide for AI agents maintaining this project. Read this before making any change.

---

## Project overview

Institutional website for **Cluster Tecnológico Azul**, a nonprofit tech community in Azul, Buenos Aires, Argentina.  
Live URL: **https://clustertecnologicoazul.org**  
GitHub org: https://github.com/clustertecnologicoazul

---

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Astro v6** (SSR mode) | `output: 'server'` — NOT static |
| Adapter | `@astrojs/cloudflare` | Targets Cloudflare Workers runtime |
| Runtime | **Cloudflare Workers + Assets** | Deployed via `wrangler.jsonc`, not Pages |
| Email sending | **Resend** | `resend` npm package, free tier: 3,000/month |
| Email receiving | **Cloudflare Email Routing** | Forwards `info@clustertecnologicoazul.org` → Gmail |
| DNS | **Cloudflare** (authoritative nameservers) | Domain registrar: external `.org` provider |
| Language | TypeScript (strict) | All API routes and utilities |
| Styles | Plain CSS with CSS custom properties | No Tailwind, no CSS-in-JS |
| Fonts | Plus Jakarta Sans (display) + IBM Plex Sans (body) + IBM Plex Mono | Loaded via Google Fonts `<link>` in `Layout.astro` |

---

## Repository structure

```
website/
├── src/
│   ├── config.ts              # Shared constants (CONTACT_EMAIL fallback)
│   ├── lib/
│   │   └── email.ts           # Shared email utilities (escHtml, EMAIL_RE, getEmailConfig, etc.)
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML shell: <head>, SEO, fonts, skip-link, Header, Footer
│   ├── components/
│   │   ├── Header.astro       # Fixed nav bar + hamburger menu
│   │   └── Footer.astro       # Footer with social links (LinkedIn, Instagram, GitHub, Linktree)
│   ├── pages/
│   │   ├── index.astro        # Landing page (hero, nosotros, valores, iniciativas, CTA)
│   │   ├── unirse.astro       # Join form page
│   │   ├── contacto.astro     # Contact form page
│   │   └── api/
│   │       ├── unirse.ts      # POST handler for join form → Resend
│   │       └── contacto.ts    # POST handler for contact form → Resend
│   └── styles/
│       └── global.css         # Design tokens, resets, utility classes
├── public/
│   ├── logo.png               # Official cluster logo (499×499px, square)
│   ├── favicon.svg
│   └── favicon.ico
├── astro.config.mjs           # Astro config: output=server, cloudflare adapter, site URL
├── wrangler.jsonc             # Cloudflare Worker config: name, routes, assets, observability
└── .env.example               # Template for local env vars
```

---

## Local development

```bash
npm install
cp .env.example .env   # fill in RESEND_API_KEY and CONTACT_EMAIL
npm run dev            # starts on http://localhost:4321
npm run build          # production build → dist/
```

Without `RESEND_API_KEY` set, form submissions are **logged to console** instead of emailed — this is intentional and safe for local dev.

---

## Cloudflare deployment

### How it works

This is deployed as a **Cloudflare Worker with static Assets**, NOT as a Cloudflare Pages project.  
The distinction matters for environment variables (see below).

- `wrangler.jsonc` drives the deployment
- Build output goes to `dist/` (`dist/server/` for the Worker, `dist/client/` for static assets)
- Cloudflare CI/CD triggers on every push to `main` via GitHub integration

### wrangler.jsonc key fields

```jsonc
{
  "name": "website",                        // Worker name in Cloudflare dashboard
  "compatibility_date": "2026-04-15",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "assets": { "directory": "./dist", "binding": "ASSETS" },
  "routes": [
    { "pattern": "clustertecnologicoazul.org", "custom_domain": true },
    { "pattern": "www.clustertecnologicoazul.org", "custom_domain": true }
  ]
}
```

Do **not** add `override_existing_dns_record` to routes — it's not a valid field in the routes schema and will break the build.

---

## Environment variables — CRITICAL

### Where to set them

| Purpose | Location | Variable |
|---|---|---|
| Email sending at runtime | **Workers & Pages → website → Settings → Variables and Secrets** | `RESEND_API_KEY` (Secret), `CONTACT_EMAIL` (Variable) |
| Local dev | `.env` file (gitignored) | same names |

> **DO NOT** set `RESEND_API_KEY` in the CI/CD "Build variables" section. Those variables are only available during the build process, not at Worker runtime. The Worker reads env via `import { env } from 'cloudflare:workers'` (Astro v6 requirement).

### Astro v6 env access (breaking change from v5)

`Astro.locals.runtime.env` was **removed in Astro v6**.  
All environment variable access must use:

```typescript
import { env } from 'cloudflare:workers';
```

This is already implemented in `src/lib/email.ts`. Do not revert to `locals.runtime.env`.

### Fallback behavior

If `RESEND_API_KEY` is missing at runtime, the API routes log the submission to Cloudflare Worker logs and return `200 OK` (so the user sees success). This is intentional to avoid breaking the UX during misconfiguration. Check Worker logs at: **Workers & Pages → website → Logs**.

---

## Email system

### Outbound (form submissions) — Resend

- Library: `resend` npm package
- API key: stored as a Worker Secret (see above)
- `from` address: `noreply@clustertecnologicoazul.org`
- `to` address: value of `CONTACT_EMAIL` env var (falls back to `info@clustertecnologicoazul.org`)
- `replyTo`: set to the user's submitted email so replies go directly to them
- Domain verified in Resend dashboard with DNS records (DKIM TXT + SPF/CNAME)

If you need to change the `from` address or domain, update both the Resend domain verification AND the hardcoded `from:` string in `src/pages/api/contacto.ts` and `src/pages/api/unirse.ts`.

### Inbound (receiving email) — Cloudflare Email Routing

- `info@clustertecnologicoazul.org` is handled by Cloudflare Email Routing
- Forwarded to a Gmail address (configured in **Cloudflare Dashboard → Email → Email Routing**)
- No code changes needed for inbound; it's purely a DNS/dashboard setting
- MX records for the domain point to Cloudflare's mail servers

### DNS records summary (Cloudflare)

| Type | Name | Purpose |
|---|---|---|
| CNAME | `@` | Routes apex domain to the Worker |
| CNAME | `www` | Routes www to the Worker |
| MX | `@` | Cloudflare Email Routing (inbound) |
| TXT | `@` | SPF record for Resend |
| CNAME | `resend._domainkey` | DKIM for Resend (outbound auth) |
| TXT | `_dmarc` | DMARC policy |

> The A records for `@` and `www` that existed before Cloudflare Workers setup were deleted. Do not re-add them — they would conflict with the Worker CNAME routes.

---

## Form handling

Both forms (`/unirse` and `/contacto`) follow the same pattern:

1. Client submits JSON via `fetch` to the corresponding API route
2. API route validates input server-side (required fields, email regex, field length limits, allowlists)
3. If valid and `RESEND_API_KEY` is set → sends email via Resend
4. Returns `{ ok: true }` on success or `{ error: "..." }` on failure
5. Client shows success/error feedback with `role="alert"` for screen readers and focuses the message

### Input validation rules

**Both endpoints:**
- `email`: must match `EMAIL_RE` regex, max 320 chars
- `nombre`: required, max 200 chars
- `mensaje`: max 5,000 chars

**`/api/unirse`:** `rol` validated against `ALLOWED_ROLES` set; `como-conociste` validated against `ALLOWED_COMO` set

**`/api/contacto`:** `asunto` validated against `ALLOWED_ASUNTOS` set

If you add new select options to any form, you **must** also add the new value to the corresponding allowlist set in the API route.

### Security

- All user-supplied values rendered in HTML email bodies are run through `escHtml()` (from `src/lib/email.ts`) to prevent XSS
- `escHtml()` is NOT applied to email subjects (they are plain text, not HTML)
- All API responses include `Content-Type: application/json` via `JSON_HEADERS`

---

## Design system

Defined as CSS custom properties in `src/styles/global.css`:

```css
--clr-bg:        #05080f   /* page background */
--clr-surface:   #0a1020   /* cards, inputs */
--clr-surface-2: #101828
--clr-border:    #1b2b42
--clr-blue:      #2b7fff   /* primary CTA color */
--clr-cyan:      #00d4c8   /* accent / highlight */
--clr-gold:      #f0b429
--clr-text:      #d8e3f0
--clr-text-soft: #8399bb
--clr-muted:     #4a5e7a

--font-display:  'Plus Jakarta Sans', sans-serif
--font-body:     'IBM Plex Sans', sans-serif
--font-mono:     'IBM Plex Mono', monospace
```

The `[hidden]` attribute is enforced with `display: none !important` in `global.css` to prevent CSS `display: flex/grid` from overriding it (known issue with form show/hide logic).

---

## Copy and language

The site is written in **Argentine Spanish (Rioplatense)**:

- Use **voseo** throughout: `vos tenés`, `unite`, `completá`, `seleccioná`, `escribinos`, `contanos`
- Never use **tuteo**: ~~`tú tienes`~~, ~~`únete`~~, ~~`completa`~~
- Avoid **ustedeo** in user-facing copy: ~~`¿cómo nos conoció?`~~ → `¿cómo nos conociste?`
- Tone: direct, warm, community-focused — not corporate

---

## Accessibility

- Skip-to-content link at top of `<body>` (`.skip-link` class)
- `<main id="main-content">` as the skip target
- Form success/error feedback uses `role="alert"` so screen readers announce it
- After successful form submit, focus is moved to the success message (`.setAttribute('tabindex', '-1'); .focus()`)
- `prefers-reduced-motion`: starfield animation is hidden, `.reveal` elements default to `opacity: 1`
- Starfield canvas uses `IntersectionObserver` to pause `requestAnimationFrame` when off-screen
- Form focus styles include both `outline` (for high-contrast mode) and `box-shadow` (visual enhancement)

---

## Social media

| Platform | URL |
|---|---|
| LinkedIn | https://linkedin.com/company/clustertecnologicoazul |
| Instagram | https://instagram.com/clustertecnologicoazul |
| GitHub | https://github.com/clustertecnologicoazul |
| Linktree | https://linktr.ee/clustertecnologicoazul |

Social links appear in: **Footer** (icon-only) and **Contacto page sidebar** (icon + label + handle).

---

## SEO

- `<link rel="canonical">` and `og:url` computed from `Astro.url.pathname` + `Astro.site` in `Layout.astro`
- `og:image` points to `/og-image.png` — **this file does not exist yet** and needs to be created (1200×630px)
- `site` in `astro.config.mjs` is `https://clustertecnologicoazul.org` — keep this in sync with the live domain

---

## Common tasks

### Add a new page
1. Create `src/pages/mypage.astro`
2. Add `export const prerender = true;` if it has no dynamic server-side logic
3. Add it to the nav links array in both `Header.astro` and `Footer.astro`

### Add a new form field
1. Add the `<input>` / `<select>` to the `.astro` page
2. Add validation in the corresponding `src/pages/api/*.ts` route
3. If it's a `<select>`, add all valid values to the allowlist `Set`
4. Add the new field to the HTML email template in the API route
5. If the field is user-supplied string rendered in the email HTML, wrap it in `escHtml()`

### Change the contact email
1. Update `CONTACT_EMAIL` in **Workers & Pages → website → Settings → Variables and Secrets**
2. The fallback in `src/config.ts` is only used locally — update it too if the change is permanent

### Rotate the Resend API key
1. Generate a new key at https://resend.com/api-keys
2. Update the `RESEND_API_KEY` Secret in **Workers & Pages → website → Settings → Variables and Secrets**
3. No code changes required

### Add a new select option to a form
1. Add the `<option value="newvalue">` to the `.astro` page
2. Add `'newvalue'` to the corresponding `ALLOWED_*` Set in the API route — **required**, or submissions with the new value will return 422

### Deploy
Pushes to `main` trigger automatic deployment via Cloudflare's GitHub integration. No manual deploy needed.

To deploy manually:
```bash
npm run build
npx wrangler deploy
```
