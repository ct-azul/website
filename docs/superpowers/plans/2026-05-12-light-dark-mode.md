# Light/Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OS-driven light/dark mode — light (blue-tinted) is the default, dark (softened navy) activates via `prefers-color-scheme: dark`, with a `data-theme` hook for a future manual toggle.

**Architecture:** All color tokens live in `src/styles/global.css` as CSS custom properties. Light tokens are defined in `:root`. Dark overrides appear in both the `prefers-color-scheme: dark` media query and the `[data-theme="dark"]` selector, duplicated for clarity. Two sections (`.hero` and `.cta-card`) receive hardcoded always-dark token overrides so they remain dramatic in light mode.

**Tech Stack:** Plain CSS custom properties, `prefers-color-scheme` media query, Astro v6, no JS required.

---

## File Map

| File                          | Role in this change                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/styles/global.css`       | Primary: replace `:root` with light tokens, add dark-mode override blocks, add `--clr-header-scrolled` |
| `src/components/Header.astro` | Replace one hardcoded `rgba(5, 8, 15, 0.88)` with `var(--clr-header-scrolled)`                         |
| `src/pages/index.astro`       | Add always-dark token overrides to `.hero` and `.cta-card` page-scoped styles                          |

Also modified (issues caught in final review, not anticipated in plan):

- `src/layouts/Layout.astro` — replace single hardcoded `meta theme-color` with two media-query-aware tags
- `src/pages/unirse.astro`, `contacto.astro`, `empresas.astro` — `.page-hero h1` had hardcoded `color: #fff`; changed to `color: var(--clr-text)`
- `src/components/Header.astro` — added `.site-header:not(.scrolled)` dark-mode token overrides (header overlays always-dark hero, text must stay light in both modes)

---

### Task 1: Reorganize color tokens in global.css

**Files:**

- Modify: `src/styles/global.css:1-24`

This is the core change. Replace the single dark `:root` block with a light `:root` (default) plus two dark override blocks (OS preference + explicit attribute).

- [ ] **Step 1: Replace `:root` block with light mode tokens**

In `src/styles/global.css`, replace lines 1–24 (the entire `:root { ... }` block) with:

```css
/* ── Light mode (default) ────────────────────────────────────── */
:root {
  --clr-bg:        #eef2f9;
  --clr-surface:   #f5f8ff;
  --clr-surface-2: #e8eef8;
  --clr-border:    #c5d3e8;
  --clr-blue:      #1a6ff0;
  --clr-blue-dim:  #d0e3ff;
  --clr-blue-glow: rgba(26, 111, 240, 0.10);
  --clr-cyan:      #0099a8;
  --clr-gold:      #c47d0e;
  --clr-text:      #0f1e35;
  --clr-text-soft: #3d5a80;
  --clr-muted:     #7a94b8;
  --clr-header-scrolled: rgba(238, 242, 249, 0.92);

  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'IBM Plex Sans', sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --transition: 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ── Dark mode — OS preference ───────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --clr-bg:        #0d1b2e;
    --clr-surface:   #132238;
    --clr-surface-2: #1a2d45;
    --clr-border:    #243d5c;
    --clr-blue:      #2b7fff;
    --clr-blue-dim:  #1a4f9e;
    --clr-blue-glow: rgba(43, 127, 255, 0.18);
    --clr-cyan:      #00d4c8;
    --clr-gold:      #f0b429;
    --clr-text:      #d8e3f0;
    --clr-text-soft: #8399bb;
    --clr-muted:     #4a5e7a;
    --clr-header-scrolled: rgba(13, 27, 46, 0.92);
  }
}

/* ── Dark mode — explicit override (future manual toggle) ────── */
:root[data-theme="dark"] {
  --clr-bg:        #0d1b2e;
  --clr-surface:   #132238;
  --clr-surface-2: #1a2d45;
  --clr-border:    #243d5c;
  --clr-blue:      #2b7fff;
  --clr-blue-dim:  #1a4f9e;
  --clr-blue-glow: rgba(43, 127, 255, 0.18);
  --clr-cyan:      #00d4c8;
  --clr-gold:      #f0b429;
  --clr-text:      #d8e3f0;
  --clr-text-soft: #8399bb;
  --clr-muted:     #4a5e7a;
  --clr-header-scrolled: rgba(13, 27, 46, 0.92);
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: build completes with no errors. Warnings about `cloudflare:workers` types are pre-existing and can be ignored.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add light/dark mode color tokens to global.css"
```

---

### Task 2: Fix Header scrolled background

**Files:**

- Modify: `src/components/Header.astro:84`

The Header has one hardcoded dark color for its scrolled state. Replace it with the CSS variable added in Task 1.

- [ ] **Step 1: Replace the hardcoded rgba in Header.astro**

In `src/components/Header.astro`, find the `.site-header.scrolled` rule (around line 83). It currently reads:

```css
.site-header.scrolled {
  background: rgba(5, 8, 15, 0.88);
  border-color: var(--clr-border);
```

Change it to:

```css
.site-header.scrolled {
  background: var(--clr-header-scrolled);
  border-color: var(--clr-border);
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: use css variable for header scrolled background"
```

---

### Task 3: Scope hero and CTA sections to always-dark in index.astro

**Files:**

- Modify: `src/pages/index.astro` (page-scoped `<style>` block)

The `.hero` (starfield hero) and `.cta-card` sections must stay dark regardless of the page's active color mode. In light mode, the hero canvas particles would be invisible on a light background, and `.cta-card h2` already has `color: #fff` hardcoded which breaks on a light surface.

- [ ] **Step 1: Add always-dark overrides to .hero in index.astro**

In `src/pages/index.astro`, find the `.hero { ... }` CSS rule (around line 284) and add dark token overrides and an explicit dark background to it. The full updated rule:

```css
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 68px;
  /* always dark — starfield canvas requires a dark background */
  background-color: #0d1b2e;
  --clr-bg:        #0d1b2e;
  --clr-surface:   #132238;
  --clr-surface-2: #1a2d45;
  --clr-border:    #243d5c;
  --clr-text:      #d8e3f0;
  --clr-text-soft: #8399bb;
  --clr-muted:     #4a5e7a;
  color-scheme: dark;
}
```

- [ ] **Step 2: Add always-dark overrides to .cta-card in index.astro**

In `src/pages/index.astro`, find the `.cta-card { ... }` CSS rule (around line 570) and add dark token overrides. The full updated rule:

```css
.cta-card {
  position: relative;
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-lg);
  padding: 4rem;
  text-align: center;
  overflow: hidden;
  /* always dark — h2 uses hardcoded color:#fff, glow uses dark rgba values */
  --clr-bg:        #0d1b2e;
  --clr-surface:   #132238;
  --clr-surface-2: #1a2d45;
  --clr-border:    #243d5c;
  --clr-text:      #d8e3f0;
  --clr-text-soft: #8399bb;
  --clr-muted:     #4a5e7a;
  color-scheme: dark;
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: scope hero and cta-card to always-dark tokens"
```

---

### Task 4: Visual smoke test across all pages

**Files:** none — verification only

No automated test suite exists. Correctness is verified visually in the browser.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser.

- [ ] **Step 2: Test light mode**

Ensure your OS is set to light mode (System Preferences → Appearance → Light on macOS, or use Chrome DevTools → Rendering → "Emulate CSS prefers-color-scheme: light").

Check each page:

| Page        | What to verify                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`         | Blue-tinted light background on body. Hero stays dark (navy/starfield). Both CTA cards stay dark. Nav text visible. |
| `/empresas` | Light page background, form inputs readable, sidebar readable. Commitment block (blue accent border) visible.       |
| `/unirse`   | Light page background, form readable. Success/error feedback colors (teal/red) visible.                             |
| `/contacto` | Same as `/unirse`.                                                                                                  |

Scroll on any page to trigger the header scrolled state — header background should become semi-transparent light (`rgba(238, 242, 249, 0.92)`).

- [ ] **Step 3: Test dark mode**

Switch OS to dark mode (or use Chrome DevTools → Rendering → "Emulate CSS prefers-color-scheme: dark").

Check each page:

| Page        | What to verify                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `/`         | Deep navy background (not near-black `#05080f`). Hero/CTA sections visually unchanged from before. |
| `/empresas` | Navy background, surfaces slightly lighter. All text readable.                                     |
| `/unirse`   | Same.                                                                                              |
| `/contacto` | Same.                                                                                              |

Scrolled header in dark mode: `rgba(13, 27, 46, 0.92)`.

- [ ] **Step 4: Final commit if any fixups were needed**

If any visual issues required fixes in steps 2–3, commit those now:

```bash
git add -p   # stage only the fixup changes
git commit -m "fix: light/dark mode visual fixups"
```

If no fixups were needed, skip this step.
