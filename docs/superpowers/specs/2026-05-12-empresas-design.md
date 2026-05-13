# Convocatoria para Empresas — Design Spec

**Date:** 2026-05-12
**Status:** Approved

---

## Overview

Add a dedicated `/empresas` page and a homepage teaser block targeting companies in Azul that want to improve their internal processes through AI automation. The Cluster Tecnológico Azul offers an initial assessment (asesoría) — the fee funds free programming courses for youth in the city.

**Tone:** Practical and approachable. Many companies in a mid-size city may feel AI is "for big tech." The framing must lower that barrier. No mention of pricing or costs anywhere on the page.

**Language:** Argentine Spanish, voseo throughout (e.g., "contanos", "completá", "te ayudamos").

---

## Files Changed

### New files

- `src/pages/empresas.astro` — dedicated page
- `src/pages/api/empresas.ts` — POST handler

### Modified files

- `src/pages/index.astro` — new section `04 — Empresas` before CTA; CTA renumbered to `05`
- `src/components/Header.astro` — add "Empresas" nav link
- `src/components/Footer.astro` — add "Empresas" link

---

## `/empresas` Page Layout

Follows the same two-column structure as `/contacto` (page hero + sidebar + form).

### Page hero

- Section label: `Empresas`
- H1: `Asesoría en innovación tecnológica`
- Subtitle: `Te ayudamos a innovar tus procesos para mejorar el rendimiento de tu empresa. Contanos tu situación y te orientamos.`

### Sidebar (left, sticky, 280px)

#### Block 1 — "¿Qué incluye la asesoría?"

- Diagnóstico inicial de procesos
- Recomendación de herramientas de IA
- Hoja de ruta de implementación

#### Block 2 — "Innovar es comprometerse con Azul" (highlighted, accent border)

- Body: *"Al trabajar con el Cluster, tu empresa no solo mejora sus procesos — también contribuye al crecimiento del ecosistema tecnológico local y al desarrollo profesional de los jóvenes de Azul."*

#### Block 3 — Response time callout

- "Te respondemos en menos de 48 horas hábiles."

### Form (right column)

| Field         | Type     | Required | Validation                |
| ------------- | -------- | -------- | ------------------------- |
| `empresa`     | text     | yes      | max 200 chars             |
| `responsable` | text     | yes      | max 200 chars             |
| `email`       | email    | yes      | `EMAIL_RE`, max 320 chars |
| `categoria`   | select   | yes      | allowlisted (see below)   |
| `mensaje`     | textarea | no       | max 2000 chars            |

Layout: `empresa` + `responsable` side by side (`form-row`), then `email`, `categoria`, `mensaje` each full width.

Submit button: `"Quiero recibir asesoría"`

**Success state:** form hidden, `role="alert"` success message shown, focus moved to it.

---

## Asesoría Categories (`ALLOWED_CATEGORIAS`)

| Value            | Label                                       |
| ---------------- | ------------------------------------------- |
| `automatizacion` | Automatización de procesos internos         |
| `asistentes-ia`  | Asistentes con IA                           |
| `integracion`    | Integración de herramientas de IA           |
| `analisis-datos` | Análisis de datos e inteligencia de negocio |
| `capacitacion`   | Capacitación del equipo                     |
| `no-se`          | No sé por dónde empezar                     |

---

## API Route: `POST /api/empresas`

Follows exact same pattern as `contacto.ts`.

### Validation

- `empresa`: required, max 200
- `responsable`: required, max 200
- `email`: required, `EMAIL_RE`, max 320
- `categoria`: required, must be in `ALLOWED_CATEGORIAS`
- `mensaje`: optional, max 2000
- All user-supplied strings rendered in HTML email bodies wrapped in `escHtml()`

### Emails sent (both via Resend)

#### Email 1 — Notification to cluster

- `from`: `noreply@clustertecnologicoazul.org`
- `to`: `CONTACT_EMAIL`
- `replyTo`: submitted email
- `subject`: `Nueva solicitud de asesoría: [categoria] — [empresa]`
- Body: HTML table with all submitted fields

#### Email 2 — Auto-reply to company

- `from`: `noreply@clustertecnologicoazul.org`
- `to`: submitted email
- `subject`: `Recibimos tu consulta — Cluster Tecnológico Azul`
- Body: friendly voseo message confirming receipt, setting expectation of response within 48 horas hábiles, signed by Cluster Tecnológico Azul

### Error handling for dual emails

The notification email to the cluster is the critical one. The auto-reply is best-effort:

- If notification email fails → return `500`
- If notification succeeds but auto-reply fails → log the error, return `200 OK`

### Fallback (no `RESEND_API_KEY`)

Log submission to console, return `200 OK` — same behavior as existing routes.

---

## Homepage Teaser Block (section `04 — Empresas`)

Inserted in `index.astro` between the Iniciativas section and the existing CTA. The existing CTA section label is updated to `05 — ¿Listo para sumarte?`.

**Visual treatment:** Same `cta-card` style (dark surface, blue glow) as the existing CTA — intentional but distinct.

**Content:**

- Section label: `04 — Empresas`
- H2: `¿Tu empresa está lista para innovar?`
- Body: `Te ayudamos a identificar cómo la inteligencia artificial puede mejorar los procesos de tu empresa. Un diagnóstico inicial, recomendaciones concretas y una hoja de ruta para empezar.`
- Primary CTA button: `Quiero recibir asesoría` → `/empresas`
- Supporting line (small, muted): `Al trabajar con nosotros, contribuís al ecosistema tecnológico de Azul.`

---

## Navigation

"Empresas" added to the nav links array in both `Header.astro` and `Footer.astro`, pointing to `/empresas`.

---

## Accessibility & Patterns

All patterns follow existing site conventions:

- Form feedback uses `role="alert"`
- Success message gets `tabindex="-1"` and `.focus()` after submit
- `[hidden]` attribute used for show/hide (enforced by `display: none !important` in `global.css`)
- Submit button shows loading spinner while in-flight

---

## Out of Scope

- Pricing or cost information — not mentioned anywhere
- Admin dashboard or submission tracking
- File/attachment uploads
- CRM integration
