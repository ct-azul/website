# Light/Dark Mode — Design Spec

**Date:** 2026-05-12
**Status:** Approved

---

## Overview

Add a light/dark color mode system to the site. Light mode (blue-tinted) is the default and
fallback, making the site more welcoming to unknown visitors. Dark mode (softened navy) activates
automatically via `prefers-color-scheme: dark`. No manual toggle — OS preference drives everything.
The architecture leaves a clean hook for a future toggle without any CSS changes.

**Goal:** Make the site inviting and readable in both modes, with light mode as the face most
first-time visitors will see.

---

## Token Architecture

`src/styles/global.css` is reorganized into three blocks:

```css
/* 1. Light mode — default for all visitors */
:root { ... }

/* 2. Dark mode — OS preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { ... }
}

/* 3. Dark mode — explicit data-theme override (future manual toggle) */
:root[data-theme="dark"] { ... }
```

Dark tokens are duplicated across blocks 2 and 3 (small duplication, maximum clarity).
`Layout.astro` sets no `data-theme` attribute by default — OS auto-detection handles everything.
A future toggle only needs `document.documentElement.dataset.theme = 'dark'|'light'`.

---

## Color Palettes

### Light mode (default)

| Token             | Value                   | Role                |
| ----------------- | ----------------------- | ------------------- |
| `--clr-bg`        | `#eef2f9`               | Page background     |
| `--clr-surface`   | `#f5f8ff`               | Cards, inputs       |
| `--clr-surface-2` | `#e8eef8`               | Secondary surfaces  |
| `--clr-border`    | `#c5d3e8`               | Borders             |
| `--clr-text`      | `#0f1e35`               | Body text           |
| `--clr-text-soft` | `#3d5a80`               | Secondary text      |
| `--clr-muted`     | `#7a94b8`               | Muted / placeholder |
| `--clr-blue`      | `#1a6ff0`               | Primary CTA         |
| `--clr-cyan`      | `#0099a8`               | Accent              |
| `--clr-gold`      | `#c47d0e`               | Highlights          |
| `--clr-blue-dim`  | `#d0e3ff`               | Blue surface tint   |
| `--clr-blue-glow` | `rgba(26,111,240,0.10)` | Glow effects        |

### Dark mode (softened navy)

Only the background stack changes from current values; text and accent tokens are unchanged.

| Token             | Current                 | New       |
| ----------------- | ----------------------- | --------- |
| `--clr-bg`        | `#05080f`               | `#0d1b2e` |
| `--clr-surface`   | `#0a1020`               | `#132238` |
| `--clr-surface-2` | `#101828`               | `#1a2d45` |
| `--clr-border`    | `#1b2b42`               | `#243d5c` |
| `--clr-text`      | `#d8e3f0`               | unchanged |
| `--clr-text-soft` | `#8399bb`               | unchanged |
| `--clr-muted`     | `#4a5e7a`               | unchanged |
| `--clr-blue`      | `#2b7fff`               | unchanged |
| `--clr-cyan`      | `#00d4c8`               | unchanged |
| `--clr-gold`      | `#f0b429`               | unchanged |
| `--clr-blue-dim`  | `#1a4f9e`               | unchanged |
| `--clr-blue-glow` | `rgba(43,127,255,0.18)` | unchanged |

---

## Special Cases — Always-Dark Sections

The starfield hero and CTA card sections stay dark in both modes. They are dramatic focal points
that break visually on a light background.

These sections receive hardcoded dark token overrides scoped to their selectors:

```css
.hero,
.cta-card {
  --clr-bg:      #0d1b2e;
  --clr-surface: #132238;
  --clr-text:    #d8e3f0;
  /* remaining dark tokens as needed */
  color-scheme: dark;
}
```

This means light-mode visitors see a bright, welcoming page with dark hero/CTA sections that stand
out — a strong visual hierarchy.

---

## Header Scrolled State

`Header.astro` currently hardcodes `rgba(5, 8, 15, 0.88)` for the scrolled background. This is
replaced with a CSS variable `--clr-header-scrolled` defined per mode:

- Light: `rgba(238, 242, 249, 0.92)`
- Dark: `rgba(13, 27, 46, 0.92)`

---

## Files Changed

| File                          | Change                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/styles/global.css`       | Reorganize color tokens into light (`:root`), dark media query, dark `[data-theme]` blocks; add `--clr-header-scrolled` |
| `src/layouts/Layout.astro`    | No structural changes; `--clr-header-scrolled` definition lives in `global.css`                                         |
| `src/components/Header.astro` | Replace hardcoded `rgba(5,8,15,0.88)` with `var(--clr-header-scrolled)`                                                 |
| `src/pages/index.astro`       | Scope `.hero` and `.cta-card` to always-dark token overrides                                                            |
| `src/pages/empresas.astro`    | Audit and fix any hardcoded dark colors; apply always-dark scoping where needed                                         |
| `src/pages/unirse.astro`      | Same audit                                                                                                              |
| `src/pages/contacto.astro`    | Same audit                                                                                                              |

---

## Out of Scope

- Manual toggle button — architecture supports it but it is not built here
- Persisting user preference to `localStorage`
- Any copy, layout, or component changes — purely a color token change
- `og:image` or other asset changes
