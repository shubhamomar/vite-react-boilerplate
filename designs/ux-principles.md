# S-Tier Web App Design Principles (M3-infused, Fluid-first)
_Version: 1.2.1 — Updated: 2025-08-22_

> Opinionated, production-ready rules for 2025 SaaS UI.
> Targets: desktop-first apps with responsive behavior, AI/copilot patterns, WCAG 2.2 AA.

---

## 0) Scope & Non-Goals
- **Scope**: Layout, color, typography, density, states, accessibility, data-heavy UIs, AI/copilot, command palette, motion.
- **Non-Goals**: Marketing site aesthetics, brand storytelling, mobile-only patterns.

---

## 1) System Foundations
- **Tokens first**: All choices map to tokens (colors, spacing, radius, shadow, typography, density).
- **M3 roles**: Use `m3.colorRoles.*` (light/dark) + `surfaceContainer*` tiers for elevation via tone, not heavy shadows.
- **Color space**: Author ramps in **OKLCH** for predictable, accessible steps. Hex is exported for legacy only.
- **Density modes**: Two densities:
  - Comfortable: 40px controls, 44px table rows.
  - Compact: 32px controls, 36px table rows.
- **Typography**:
  - Base 16px, ratio 1.2; `Inter` (sans), `JetBrains Mono` (mono).
  - Use **tabular numerals** wherever numbers align (tables, metrics).
- **Spacing scale**: 4/8/12/16/24/32/48/64.
- **Radius**: 6/10/14/20; pills = 9999px.
- **Elevation**: Prefer `surfaceContainer` tiers; shadows only for emphasis (level2+).

---

## 2) Layout & Responsiveness
- **Container queries are mandatory** for components. Viewport queries only for global layout.
- **Reading width**: Long-form text max **65ch**.
- **Grid**: Min column 280px, gap 16px, up to 12 columns.
- **Breakpoints**:
  - Viewport: 640 / 768 / 1024 / 1280 / 1536 / **2560** / **3200**.
  - Container: 360 / 600 / 840 / 1200.
- **No horizontal scroll** below 320px except true 2-D content (maps, wide tables).
- **Whitespace** scales with viewport; avoid edge-to-edge density on 2K/4K.

---

## 3) Navigation & IA
- **Shell**: Topbar + left sidebar (collapsible). App landmarks: `header / nav / main / aside / footer`.
- **Command palette (required)**: `Mod+K` opens global actions; fuzzy search; recent actions; keyboard-first.
- **Breadcrumbs**: Always for deep paths (3+ levels).
- **Empty states**: Educational, with primary CTA + link to docs or copilot prompt chips.

---

## 4) Color & Theming
- **Themes**: Light + Dark + High-contrast (via user preference). Respect `prefers-color-scheme` and `prefers-contrast`.
- **Contrast**: Body text ≥ 4.5:1; icons/controls (non-text) ≥ 3:1 against adjacent colors.
- **Status ramps**: success / warning / error / info provided in both hex + OKLCH.
- **Glass & mesh**: Subtle only (opacity ≤ 0.12; blur ≤ 20px). Never impair legibility.

---

## 5) Components (Key Rules)
- **Buttons**: Variants primary/secondary/tertiary/danger. Focus ring 2px visible in all themes. Loading uses spinner + `aria-busy`.
- **Inputs**: 40/32 heights, clear affordances, inline validation, helpful messages (no color-only cues).
- **Cards**: Tone elevation (`surfaceContainer`), radius 14px, padding 16.
- **Modals**: Radius 20px, padding 24, backdrop 0.4; must be escapable via `Esc` and close button.
- **Tabs**: Height 40; underline 2px; must be keyboard navigable (arrow keys).
- **Tables**:
  - Sticky header; resizable columns; zebra optional.
  - **Numeric right-align**, text left-align.
  - Row density matches mode (44/36).
  - Virtualize for large datasets; preserve header/footer.
- **Charts**:
  - Provide categorical 12-color ramp; axis/labels meet 4.5:1.
  - Tooltips keyboard accessible; don’t rely on hover only.
- **Command Palette**:
  - Width ~720px, max-height 70vh, item 40px, global shortcut `Mod+K`.
  - Returns actions, pages, and entities; supports undo/redo.
- **Copilot Panel**:
  - Right-docked 360–480px; resizable; shows prompts history, citations, and “Try this” chips.
  - Must support **inline suggestions** (chips) in primary flows.

---

## 6) Interaction States & Motion
- **States on everything**: default/hover/focus/active/disabled/loading/selected.
- **Motion**:
  - Micro-interactions 150–250ms; layout 250–400ms.
  - Easing: Standard for utility; Emphasized for primary transitions.
  - Honor `prefers-reduced-motion`: disable non-essential animations.
- **Focus**:
  - 2px ring or equivalent with **≥3:1** contrast change vs unfocused.

---

## 7) Accessibility (WCAG 2.2 AA Baseline)
- **Target size**: Min **24×24 CSS px** for any pointer target _or_ adequate spacing to equivalent effect.
- **Dragging alternatives**: Every drag interaction must have click/keyboard alternative unless essential.
- **Keyboard**: Full operability; visible focus always; Skip-to-content link.
- **Forms**: Labels, descriptions, and error text read by screen readers; error not conveyed by color alone.
- **Contrast**: Text ≥4.5:1; non-text focus/controls ≥3:1; verify in light/dark/high-contrast.

---

## 8) Content & Microcopy
- **Plain, specific, helpful**. Avoid ambiguous verbs.
- **Empty state**: What happened + what user can do + sample prompt (for copilot).
- **Errors**: Human, actionable, polite; explain how to resolve.

---

## 9) HD/QHD/4K Behavior
- **Max content width**: cap reading areas; leave generous margins.
- **Density**: Prefer **compact** mode on ≥ 2560px unless overridden.
- **Charts**: Increase tick density and gridline spacing proportionally.

---

## 10) Anti-Patterns (Reject in review)
- Full-bleed dense dashboards on ultra-wide.
- Color-only validation or hover-only interactions.
- Scroll-jacking, motion that ignores reduced-motion.
- Command palette as “search only” without actions.
- Copilot that takes actions without clear consent/undo.

---

## 11) Review Checklist (LLM & QA use)
- Container queries applied to all components (not just viewport).
- Reading width ≤ 65ch where applicable.
- Two density modes wired; toggles work.
- Focus ring visible (≥3:1) in light/dark/high-contrast.
- Targets meet 24×24 or spacing exception.
- Drag interactions have click/keyboard alternatives.
- `Mod+K` palette opens, searches, executes, and logs recent commands.
- Copilot panel docks, resizes, provides suggested prompts, and supports undo.
- Tables: sticky header, column resize, correct alignment, virtualization for >1k rows.
- Charts: categorical ramp used; labels ≥4.5:1.
- `prefers-reduced-motion` and `prefers-contrast` respected.

---

## 12) Definition of Done (Design)
- All checklist items pass.
- Tokens exist for every new visual decision.
- Dark + High-contrast snapshots reviewed.
- Playwright a11y checks pass core flows.
- Copy reviewed for clarity and actionability.

---

## 13) Key Files & Tools (Agent Index)
- **Design tokens**: `designs/design-updated.json` (authoritative source)
- **LLM rule files**: `.cursor/rules/design-review-auto.mdc`, `.cursor/rules/design-workflow.mdc`
- **Component baseline**: shadcn/ui + Tailwind (`components.json` registry)
- **Documentation**: Context7 external reference system
- **Test/Eval**: Playwright scripts for a11y + interaction checks
- **Agents known to consume these**: Cursor, Google Jules, Claude Code, Gemini CLI

### Agent Notes
- **Cursor**: Project rules are discovered from `.cursor/rules` and can be scoped by path. Keeping this file and the token JSON near the code they govern improves retrieval.
- **Jules**: Reads repo context and follows linked references (tokens, rules, docs) when you include them in tasks; keep this file in `/designs` or root and link it in prompts.
- **MCP**: If MCP servers are configured, expose tools (e.g., `repo.search`, `http.fetch`, `playwright.run`) so agents can query tokens/docs and run checks.

