
# Coding Guidelines (Web App — React + Vite + Tailwind + shadcn/ui)
_Version: 1.2.1 — Updated: 2025-08-22_

> Hard rules for building modern, accessible, and fast UIs that match our tokens and principles. No magic numbers. No “looks fine on my screen.”

## 0) Sources of truth
- **Design tokens** (authoritative): `designs/design-updated.json`
- **Principles**: `designs/design-principles-updated.md`
- **Rules**: `.cursor/rules/design-review-auto.mdc`, `.cursor/rules/design-workflow.mdc`

---

## 1) Theming & tokens (light/dark/high-contrast)
- **Never hardcode** colors, radii, spacing. Map tokens → CSS variables.
- Load tokens at app start and set theme on `<html data-theme="light|dark|hc">`.
- Respect user prefs:
  - `@media (prefers-contrast: more)` → switch to high-contrast `m3.colorRoles` and stronger outlines.
  - `@media (prefers-reduced-motion: reduce)` → disable non-essential animations. :contentReference[oaicite:0]{index=0}

**Example (token → CSS variables)**
```ts
// theme.ts
import tokens from '@/designs/design-updated.json';

export function applyTheme(theme: 'light'|'dark') {
  const role = tokens.m3.colorRoles[theme];
  const root = document.documentElement;
  Object.entries(role).forEach(([k,v]) => root.style.setProperty(`--m3-${k}`, String(v)));
  root.dataset.theme = theme;
}

```

```css
/* globals.css */
:root {
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px;
}
html[data-theme="dark"] {
  color: var(--m3-onSurface); background: var(--m3-surface);
}
@media (prefers-contrast: more) {
  :root { --focus-outline: 2px solid currentColor; }
}

```

---

## 2) Container queries (mandatory for components)

- Every component that changes layout **must** set `container-type: inline-size;` and use `@container` for its own breakpoints. Viewport media queries are for global shell only. Container queries are standardized and broadly supported. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/container?utm_source=chatgpt.com), [Can I Use](https://caniuse.com/css-container-queries?utm_source=chatgpt.com))

**Native CSS**

```css
.card { container-type: inline-size; }
@container (min-width: 36rem) {
  .card--stats { grid-template-columns: 1fr 1fr 1fr; }
}

```

**Tailwind (official plugin)**

```jsx
// tailwind.config.js
plugins: [require('@tailwindcss/container-queries')]

```

```tsx
<div className="@container">
  <div className="grid gap-4 @md:grid-cols-2 @xl:grid-cols-4">...</div>
</div>

```

(Plugin and Tailwind support for container queries.) ([GitHub](https://github.com/tailwindlabs/tailwindcss-container-queries?utm_source=chatgpt.com), [Tailwind CSS](https://tailwindcss.com/blog/tailwindcss-v3-2?utm_source=chatgpt.com))

---

## 3) Density modes

- Two densities: **comfortable** and **compact** (from tokens).
- Controls: 40/32px heights. Table rows: 44/36px. Set via `[data-density="comfortable|compact"]` on `<html>` and consume in CSS.

```css
:root { --control-h: 40px; --row-h: 44px; }
html[data-density="compact"] { --control-h: 32px; --row-h: 36px; }
.button, .input { inline-size: max-content; block-size: var(--control-h); }
tr { block-size: var(--row-h); }

```

---

## 4) Typography

- Base 16px, ratio 1.2; `Inter` for UI, `JetBrains Mono` for code.
- **Numbers**: use tabular numerals for tables/metrics.

```css
.metrics, td.num { font-variant-numeric: tabular-nums; }

```

(MDN for `font-variant-numeric`.) ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric?utm_source=chatgpt.com))

---

## 5) Accessibility (WCAG 2.2 deltas baked-in)

- **Focus Appearance**: Always show a visible, high-contrast 2px focus indicator. Minimum contrast change per WCAG 2.2; test it. ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html?utm_source=chatgpt.com))
- **Target Size (Minimum)**: Every actionable target ≥ **24×24 CSS px**, or meet the spacing exception. ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html?utm_source=chatgpt.com))
- **Dragging Movements**: Every drag interaction must have a **non-drag** (click/keyboard) alternative unless dragging is essential. ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html?utm_source=chatgpt.com))
- **Text contrast**: body text ≥ **4.5:1**. Axis/labels in charts also ≥ 4.5:1. ([W3C](https://www.w3.org/TR/WCAG21/?utm_source=chatgpt.com))

**Code**

```css
:where(button, [role="button"], a[role="button"], input, select, textarea) {
  min-inline-size: 24px; min-block-size: 24px;
}
:where(button, a, input, [tabindex]){:focus-visible{outline: 2px solid currentColor; outline-offset: 2px;}}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

```

(Preferences media queries.) ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-reduced-motion?utm_source=chatgpt.com))

---

## 6) Forms & inputs

- Labels always visible; no color-only validation. Inline help above errors.
- Hit-area respects 24×24 rule even for small icons (use padding/ghost hit-areas). ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html?utm_source=chatgpt.com))

---

## 7) Navigation, Command Palette, Copilot

- **Command Palette (required)**: `Mod+K` opens; fuzzy search; recent actions; keyboard-first. Use an accessible library (e.g., `cmdk` or `react-cmdk`) or implement with ARIA combobox. ([GitHub](https://github.com/pacocoursey/cmdk?utm_source=chatgpt.com), [cmdk.paco.me](https://cmdk.paco.me/?utm_source=chatgpt.com), [React Spectrum](https://react-spectrum.adobe.com/react-aria/examples/command-palette.html?utm_source=chatgpt.com))
- **Copilot panel**: right-docked, **360–480px**, resizable; undo/redo visible; never acts without explicit user confirmation (align with Copilot UX principles). ([Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-cloud/dev/copilot/isv/ux-guidance?utm_source=chatgpt.com))

**Command Palette (React + cmdk)**

```tsx
import { useEffect, useState } from 'react';
import { Command } from 'cmdk';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(v => !v); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open) return null;
  return (
    <Command label="Command Menu" className="fixed left-1/2 top-24 -translate-x-1/2 w-[720px] max-h-[70vh] rounded-xl bg-[var(--m3-surfaceContainerHigh)] shadow-xl">
      <Command.Input placeholder="Type a command…" />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        {/* map actions here */}
      </Command.List>
    </Command>
  );
}

```

---

## 8) Tables (data-heavy by default)

- Sticky header; resizable columns; **numeric right-align**; virtualization for >1k rows.
- Use tabular nums for consistency; keep row heights per density.
- Use ARIA patterns only when native table semantics aren’t possible. (APG reference.) ([W3C](https://www.w3.org/WAI/ARIA/apg/?utm_source=chatgpt.com))

**CSS**

```css
table { width: 100%; border-collapse: separate; border-spacing: 0; }
thead th { position: sticky; top: 0; background: var(--m3-surfaceContainer); z-index: 1; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }

```

---

## 9) Charts

- Use the **categorical 12-color ramp** from tokens.
- Axis/labels ≥ 4.5:1; don’t rely on color alone—add markers/patterns. (WCAG text contrast + a11y data-viz guidance.) ([W3C](https://www.w3.org/TR/WCAG21/?utm_source=chatgpt.com), [The A11Y Collective](https://www.a11y-collective.com/blog/accessible-charts/?utm_source=chatgpt.com))

---

## 10) Effects & motion

- Glass/blur opacity ≤ 0.12; blur ≤ 20px (never harm legibility).
- Animation timings: 150–250ms micro; 250–400ms layout. Disable when `prefers-reduced-motion: reduce`. ([web.dev](https://web.dev/articles/prefers-reduced-motion?utm_source=chatgpt.com))

---

## 11) Layout rules recap

- **Reading width** max **65ch** for prose panes.
- Use container queries for component responsiveness; viewport queries for the global shell only. (MDN + support tables.) ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries?utm_source=chatgpt.com), [Can I Use](https://caniuse.com/css-container-queries?utm_source=chatgpt.com))

---

## 12) Linting & CI (what we auto-check)

- **Tokens**: grep for hardcoded hex/radii/spacing; enforce CSS vars.
- **Container queries**: require `container-type` on components with responsive variants; `@container` present.
- **A11y (WCAG 2.2)**: Focus ring visible/contrasty; all targets ≥24×24 or spaced; drag alternatives present. (WCAG 2.2 list.) ([W3C](https://www.w3.org/TR/WCAG22/?utm_source=chatgpt.com))
- **Prefs**: `prefers-contrast` and `prefers-reduced-motion` rules present.
- **Palette**: `Mod+K` command palette opens and executes an action; copilot panel sized 360–480px.

---

## 13) Playwright checks (essentials)

> These run in .cursor/rules/design-review-auto.mdc via MCP.
>
- **Focus**: tab through the first 10 interactive elements → compute ring contrast change (expect ≥3:1). ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html?utm_source=chatgpt.com))
- **Target size**: query all actionable elements → bounding box ≥24×24 or spacing exception attribute. ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html?utm_source=chatgpt.com))
- **Drag alt**: if `[data-draggable=true]` exists → test a sibling “Move/Resize” button that does the same thing. ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html?utm_source=chatgpt.com))
- **Container queries**: resize component container (not viewport) → expect `@container` variants to flip. ([MDN Web Docs](https://developer.mozilla.org/en-US/blog/getting-started-with-css-container-queries/?utm_source=chatgpt.com))
- **Prefs**: emulate reduced-motion and high-contrast → verify CSS takes effect. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-reduced-motion?utm_source=chatgpt.com))
- **Command Palette**: send `Mod+K` → type, execute, assert route/action. (`cmdk`/combobox pattern.) ([GitHub](https://github.com/pacocoursey/cmdk?utm_source=chatgpt.com))

---

## 14) Tailwind specifics

- Enable **container queries** plugin and **font-variant-numeric** utilities; use `@md:`, `@lg:` variants and `tabular-nums`. ([GitHub](https://github.com/tailwindlabs/tailwindcss-container-queries?utm_source=chatgpt.com), [Tailwind CSS](https://tailwindcss.com/docs/font-variant-numeric?utm_source=chatgpt.com))
- Prefer utilities for spacing/radius but **values come from tokens** via CSS variables (e.g., `rounded-[var(--radius-md)]`).

---

## 15) Don’ts (fail the review)

- Hardcoded hex/radius/spacing outside tokens.
- Hover-only affordances or color-only validation.
- Viewport-only responsive components (no `@container`).
- Missing non-drag alternatives.
- No command palette for deep apps; copilot acting without explicit consent. ([Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-cloud/dev/copilot/isv/ux-guidance?utm_source=chatgpt.com))

---

## Key Files & Tools (Agent Index)

- **Design tokens**: `designs/design-updated.json` (authoritative source)
- **Design principles**: `designs/design-principles-updated.md`
- **LLM rules**: `.cursor/rules/design-review-auto.mdc`, `.cursor/rules/design-workflow.mdc`
- **Component baseline**: shadcn/ui + Tailwind (with `@tailwindcss/container-queries`)
- **Docs**: Context7 external reference system
- **Test/Eval**: Playwright via MCP
- **Agents known to consume these**: Cursor, Google Jules, Claude Code, Gimini CLI

### Agent Notes

- **Container queries are required**: set `container-type: inline-size;` on components and write `@container` rules. (MDN + Tailwind plugin.) ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/container-type?utm_source=chatgpt.com), [GitHub](https://github.com/tailwindlabs/tailwindcss-container-queries?utm_source=chatgpt.com))
- **WCAG 2.2** checks must pass before merge: Focus Appearance, Target Size, Dragging Movements. ([W3C](https://www.w3.org/TR/WCAG22/?utm_source=chatgpt.com))
- **Preferences**: implement `prefers-contrast` and `prefers-reduced-motion`. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-contrast?utm_source=chatgpt.com))

---

## 16) Playwright Configuration & Best Practices

To ensure stable and reliable end-to-end tests, the following configurations in `playwright.config.ts` are mandatory. Deviations from this setup have been proven to cause otherwise avoidable test failures.

### 16.1) `webServer` Block is Mandatory

The `webServer` block **must** be enabled. This ensures that Playwright starts the Vite development server before any tests run.

-   **Why**: Running tests without a web server (e.g., against `file://` URLs) will cause `SecurityError` failures. The browser will deny access to critical APIs like `localStorage`, `sessionStorage`, and others that are restricted to a proper `http` origin.

**Correct Configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  // ...
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173', // Match your Vite port
    reuseExistingServer: !process.env.CI,
  },
});
```

### 16.2) `baseURL` is Mandatory

The `baseURL` property inside the `use` block **must** be set and must match the `webServer.url`.

-   **Why**: Test scripts should use `page.goto('/')` or `page.goto('/some-path')` for navigation. This relies on `baseURL` being set. If it is not set, calls to `page.goto(baseURL)` will result in a `Cannot navigate to invalid URL` error.

**Correct Configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  // ...
  use: {
    baseURL: 'http://localhost:5173', // Must match webServer.url
    // ...
  },
});
```

### 16.3) Safely Clearing `localStorage` in Tests

To reliably clear `localStorage` before a test, first navigate to the `baseURL` to establish the correct origin context, then perform the clear operation.

**Correct Pattern:**
```typescript
// e2e/some.spec.ts
test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(baseURL || '/'); // Establishes origin
  await page.evaluate(() => localStorage.clear()); // Now this is safe
  await page.goto('/page-to-test'); // Proceed with test
});

### 16.4) Zustand Store DOM Synchronization

When using `zustand` with `persist` middleware for theme/density settings, there's a critical race condition between React hydration and DOM attribute application.

**The Problem**: The store's initial state (from `persist`) is not immediately reflected in the DOM. Playwright tests that check for `data-theme` or `data-density` attributes will fail because these attributes are not set until after the component mounts and the store hydrates.

**The Solution**: Use a combination of approaches:

1. **Anti-flicker script in `index.html`** (already implemented)
2. **`onRehydrateStorage` callback** in the persist middleware
3. **Initial state application** before React mounts

**Correct Pattern**:
```typescript
// store/settingsStore.ts
const applyDomSettings = (theme: Theme, density: Density) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-density', density);
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // ... store definition
    }),
    {
      name: 'app-settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDomSettings(state.theme, state.density);
        }
      },
    },
  ),
);

// Apply initial state immediately
const initialState = useSettingsStore.getState();
applyDomSettings(initialState.theme, initialState.density);
```

**Test Strategy**: Add a small delay or wait for the store to hydrate before checking DOM attributes:
```typescript
// In test files
await page.waitForFunction(() => {
  return document.documentElement.hasAttribute('data-theme');
});
```
```
