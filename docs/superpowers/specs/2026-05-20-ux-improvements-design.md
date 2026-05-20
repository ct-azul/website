# UX Improvements — Design Spec

**Goal:** Add a manual light/dark mode toggle, increase form label boldness, and improve secondary text contrast across the site.

**Scope:** `src/components/Header.astro`, `src/layouts/Layout.astro`, `src/styles/global.css`

---

## 1. Light/dark mode toggle

### Behavior

- A toggle switch with sun ☀ and moon ☾ icons lets users override OS-level theme preference
- Preference is saved to `localStorage` under key `theme` (`"light"` or `"dark"`)
- On subsequent visits, the saved preference is restored before first paint (no flash)
- When no `localStorage` value exists, the site respects `prefers-color-scheme` as before (no behavior change for new visitors)

### Toggle component

A `<button role="switch">` element styled as a pill-shaped track with a sliding circle:

```
☀  [○    ]  ☾   ← light mode (circle on left)
☀  [    ○]  ☾   ← dark mode  (circle on right)
```

- `aria-checked="true"` when dark mode is active, `aria-checked="false"` for light
- `aria-label="Cambiar tema"`
- Transition: circle slides with `transform: translateX` over 200ms

### Placement

| Viewport | Location |
|---|---|
| Desktop (>768px) | Inside `.header-actions`, before the Empresas/Unite CTA buttons |
| Mobile (≤768px) | Last item of the `.nav-mobile` drawer, with label "Tema" on the left and the switch on the right |

### Anti-FOUC script

An inline `<script>` in `<head>` of `Layout.astro` (before any stylesheets render) reads `localStorage` and sets `document.documentElement.dataset.theme` synchronously:

```html
<script is:inline>
  (function () {
    const t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  })();
</script>
```

This must use `is:inline` in Astro so it is emitted as a literal inline `<script>` without bundling or deferral, ensuring it runs synchronously before first paint.

### JS logic (in Header.astro `<script>`)

```typescript
function getTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  // update aria-checked on all toggle buttons (desktop + mobile)
  document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-checked', String(theme === 'dark'));
  });
}
```

Each toggle button calls `applyTheme(current === 'dark' ? 'light' : 'dark')` on click.

---

## 2. Bolder form labels

In `src/styles/global.css`, change `.form-group label`:

- `font-weight`: add `600`
- `color`: change from `var(--clr-text-soft)` to `var(--clr-text)`

This applies uniformly to all three form pages (`/unirse`, `/contacto`, `/empresas`).

---

## 3. Text contrast improvements

Update CSS custom properties in `src/styles/global.css`.

| Token | Light (current) | Light (new) | Dark (current) | Dark (new) |
|---|---|---|---|---|
| `--clr-text-soft` | `#3d5a80` | `#2e4f75` | `#8399bb` | `#96adc7` |
| `--clr-muted` | `#7a94b8` | `#607a96` | `#4a5e7a` | `#6882a0` |

The current `--clr-muted` in light mode fails WCAG AA (~2.8:1 against `#eef2f9`). The new value `#607a96` reaches ~4.5:1. Dark mode values are brightened proportionally.

Changes apply in three places in `global.css`:
1. `:root` (light mode defaults)
2. `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`
3. `:root[data-theme="dark"]`
