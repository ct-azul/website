# UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual light/dark mode toggle switch, bolder form field labels, and improved secondary text contrast.

**Architecture:** Three independent CSS/JS changes across three files. Task 1 (global.css) has no dependencies. Task 2 (Layout.astro anti-FOUC script) must land before Task 3 (Header toggle) so the theme is restored before paint. No new files are created.

**Tech Stack:** Astro v6, TypeScript, plain CSS custom properties, `localStorage` for theme persistence.

---

## File map

| File | Change |
|---|---|
| `src/styles/global.css` | Update `--clr-text-soft` and `--clr-muted` tokens; add `font-weight` + `color` to `.form-group label` |
| `src/layouts/Layout.astro` | Add `<script is:inline>` anti-FOUC before `</head>` |
| `src/components/Header.astro` | Add toggle markup (desktop + mobile), CSS, and JS logic |

---

## Task 1: Text contrast and label styles

**Files:**
- Modify: `src/styles/global.css`

This project has no automated test suite. Verification is manual via the dev server.

- [ ] **Step 1: Start the dev server**

```bash
cd website && npm run dev
```

Open http://localhost:4321 and keep it open throughout.

- [ ] **Step 2: Update color tokens in `src/styles/global.css`**

Replace the light mode values (lines ~13–14):

```css
  --clr-text-soft: #2e4f75;
  --clr-muted:     #607a96;
```

Replace the dark mode OS-preference values (lines ~41–42, inside `@media (prefers-color-scheme: dark)`):

```css
    --clr-text-soft: #96adc7;
    --clr-muted:     #6882a0;
```

Replace the dark mode explicit-override values (lines ~59–60, inside `:root[data-theme="dark"]`):

```css
  --clr-text-soft: #96adc7;
  --clr-muted:     #6882a0;
```

Also update the comment on that last block from "future manual toggle" to "manual toggle":

```css
/* ── Dark mode — manual toggle ───────────────────────────────── */
```

- [ ] **Step 3: Update `.form-group label` in `src/styles/global.css`**

Find the existing rule (around line 192):

```css
.form-group label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--clr-text-soft);
}
```

Replace it with:

```css
.form-group label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--clr-text);
}
```

- [ ] **Step 4: Verify in browser**

Visit http://localhost:4321/contacto — labels ("Nombre", "Asunto", "Mensaje") should be bolder and darker than before.
Visit http://localhost:4321/unirse — same check.
Check subtitles and muted text throughout — they should be noticeably more readable than before.
Toggle OS dark mode (System Preferences → Appearance → Dark) and repeat checks.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style: improve text contrast and bold form labels"
```

---

## Task 2: Anti-FOUC script

**Files:**
- Modify: `src/layouts/Layout.astro`

This script prevents the "flash of wrong theme" when a user has saved a theme preference. It must run synchronously before the browser paints — that's why it needs `is:inline` (Astro's default behavior bundles and defers scripts).

- [ ] **Step 1: Add the script to `src/layouts/Layout.astro`**

Find the closing `</head>` tag (line ~61) and insert immediately before it:

```astro
    <script is:inline>
      (function () {
        const t = localStorage.getItem('theme');
        if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
      })();
    </script>
  </head>
```

The full `<head>` closing should now look like:

```astro
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Mono:wght@400;500&display=swap"
    />
    <script is:inline>
      (function () {
        const t = localStorage.getItem('theme');
        if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
      })();
    </script>
  </head>
```

- [ ] **Step 2: Verify the script is inlined**

```bash
npm run build && grep -A3 'localStorage' dist/index.html | head -10
```

Expected: you see the IIFE inline in the HTML output, not a `<script src="...">` reference.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add anti-FOUC theme script to Layout"
```

---

## Task 3: Theme toggle

**Files:**
- Modify: `src/components/Header.astro`

Adds a sun/moon toggle switch to the desktop header and to the mobile nav drawer. Both toggles share the `.theme-toggle` class and are wired by a single JS block.

- [ ] **Step 1: Add toggle markup to `src/components/Header.astro`**

**Desktop** — inside `.header-actions`, before the CTA buttons (replace lines 30–37):

```astro
    <div class="header-actions">
      <button class="theme-toggle" role="switch" aria-checked="false" aria-label="Cambiar tema">
        <svg class="icon-sun" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <svg class="icon-moon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <a href="/empresas" class="btn btn-primary btn-sm">Empresas</a>
      <a href="/unirse" class="btn btn-primary btn-sm">Unite</a>
      <button class="hamburger" id="hamburger" aria-label="Abrir menú" aria-expanded="false">
        <span class="hamburger-icon"><span></span><span></span><span></span></span>
        <span class="hamburger-label">Menú</span>
      </button>
    </div>
```

**Mobile** — inside `.nav-mobile`, add a `<li>` after the `{navLinks.map(...)}` block (replace lines 40–46):

```astro
  <nav class="nav-mobile" id="nav-mobile" aria-label="Navegación móvil" hidden>
    <ul>
      {navLinks.map(link => (
        <li><a href={link.href}>{link.label}</a></li>
      ))}
      <li class="nav-theme-row">
        <span>Tema</span>
        <button class="theme-toggle" role="switch" aria-checked="false" aria-label="Cambiar tema">
          <svg class="icon-sun" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <svg class="icon-moon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </li>
    </ul>
  </nav>
```

- [ ] **Step 2: Add JS logic to the existing `<script>` block in `src/components/Header.astro`**

Append the following to the bottom of the existing `<script>` block (after the `navMobile.querySelectorAll('a').forEach(...)` line):

```typescript
  function getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-checked', String(theme === 'dark'));
    });
  }

  // Sync aria-checked on init without touching localStorage
  // (anti-FOUC script in Layout.astro already applied data-theme if saved)
  const initTheme = getTheme();
  document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-checked', String(initTheme === 'dark'));
  });

  document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  });
```

- [ ] **Step 3: Add CSS for the toggle to the `<style>` block in `src/components/Header.astro`**

Append before the closing `</style>` tag (after the last `@media` block):

```css
  /* Theme toggle */
  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--clr-text-soft);
    border-radius: var(--radius-sm);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--clr-blue);
    outline-offset: 2px;
  }

  .toggle-track {
    width: 32px;
    height: 18px;
    background: var(--clr-border);
    border-radius: 9px;
    position: relative;
    transition: background var(--transition);
    flex-shrink: 0;
  }

  .toggle-thumb {
    width: 12px;
    height: 12px;
    background: var(--clr-text-soft);
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 200ms ease, background var(--transition);
  }

  .theme-toggle[aria-checked="true"] .toggle-track { background: var(--clr-blue); }
  .theme-toggle[aria-checked="true"] .toggle-thumb { transform: translateX(14px); background: #fff; }

  .icon-sun  { color: var(--clr-gold); }
  .icon-moon { color: var(--clr-muted); }
  .theme-toggle[aria-checked="true"] .icon-moon { color: var(--clr-blue); }

  .nav-theme-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1rem;
    color: var(--clr-text-soft);
    border-top: 1px solid var(--clr-border);
  }

  @media (max-width: 768px) {
    .header-actions .theme-toggle { display: none; }
  }
```

- [ ] **Step 4: Verify in browser**

Start dev server if not running: `npm run dev`

**Desktop (viewport > 768px):**
- Toggle switch appears in the header before the Empresas/Unite buttons
- Clicking it switches between light and dark mode immediately
- Refreshing the page keeps the chosen mode (localStorage persists)
- Sun icon (gold) and moon icon swap visual emphasis correctly

**Mobile (resize browser to < 768px):**
- Desktop toggle disappears from header
- Hamburger menu opens → last item is "Tema" row with the toggle switch
- Clicking the toggle switches theme
- Menu can still be closed with Escape key

**Accessibility:**
- Tab to the toggle and press Space or Enter — theme switches
- `aria-checked` reflects current state (check in DevTools → Elements)

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add light/dark mode toggle to header"
```
