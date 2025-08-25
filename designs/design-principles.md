# S-Tier Web App Design Principles (Material 3–infused, Fluid-first)

> Opinionated, LLM-friendly checklist for professional web UIs.
> Fluid-first with responsive scaling; role-based theming; WCAG 2.2 AA; Modern minimal aesthetics.

## I. Philosophy
- **Fluid over fixed**: Embrace container queries, fluid typography, and adaptive layouts.
- **Minimal boundaries**: Replace borders with subtle shadows and background tone variations.
- **Clarity over cleverness**: Reduce cognitive load through purposeful design.
- **Performance first**: Snappy feedback and perceived performance.
- **Consistency via tokens**: Use role-based theming and reusable patterns.
- **Accessibility is non-negotiable**: WCAG 2.2 AA minimum standard.

## II. System Foundations (Tokens + M3 roles)
- **Color roles**: Use Material 3 roles from `designs/tokens.json` (`primary/onPrimary`, `surface/onSurface`, `outline`, `surfaceContainer*` tiers).
- **Tone-based surfaces**: Prefer elevation through surface container variations over heavy shadows.
- **Type roles**: Apply M3 `display / headline / title / body / label`; reserve "display" for hero/contextual headlines.
- **Fluid typography**: Use `clamp()` for responsive text scaling between breakpoints.
- **Grid & spacing**: 8px base; fluid containers with max-width constraints; predictable gutters.
- **Shape**: 4/8/12/16 radii set; use tone + radius to imply hierarchy.

## III. Modern Minimal Design Language
- **No visible borders**: Replace `border` with `shadow-sm` and subtle background tone variations.
- **Subtle boundaries**: Use `surfaceContainer`, `surfaceContainerLow`, `surfaceContainerHigh` for element separation.
- **Mesh gradients**: Leverage gradient backgrounds for hero sections and key visual elements.
- **Depth through elevation**: Use shadow variations (`shadow-sm`, `shadow-md`, `shadow-lg`) sparingly and purposefully.
- **Micro-interactions**: Smooth hover states with subtle scale transforms and opacity changes.

## IV. Fluid Layout System
- **Container queries**: Use for component-level responsiveness where supported.
- **Fluid grids**: CSS Grid with `minmax()` and `fr` units for adaptive columns.
- **Responsive units**: Prefer `rem`, `em`, `vw`, `vh`, `clamp()` over fixed `px` values.
- **Breakpoint strategy**:
  - Base: Fluid design that works without media queries
  - Progressive enhancement at: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px`
  - High-density: `hd 1600px`, `fhd 1920px`, `qhd 2560px`, `uhd 3840px`
- **Content-first scaling**: Optimize for readability and usability at every viewport size.

## V. Web-specific Accessibility & Input
- **Pointer target (AA)**: **≥ 24×24 CSS px**, or use spacing-based exception. Desktop control heights: **32 / 40 / 48px** density tiers.
- **Focus appearance (AA)**: Visible indicator with **≥ 3:1** contrast change vs unfocused state; keyboard traversal everywhere.
- **Contrast**: Text & essential UI meet AA; non-text controls 3:1 against adjacent colors.
- **Reflow**: No horizontal scroll at **320px** viewport width (except true 2-D content like data tables, maps).
- **Touch targets**: Minimum 44px for mobile interfaces.

## VI. Advanced Layout Patterns
- **Sidebar + topbar navigation**: Maintain landmarks (`header/nav/main/aside/footer`).
- **Fluid whitespace**: Use proportional spacing that scales with viewport size.
- **Content zones**: Avoid edge-to-edge dense content on very large monitors.
- **Progressive disclosure**: Layer information density based on screen real estate.
- **Adaptive components**: Components that reshape based on available space.

## VII. Interaction & Motion
- **States for all controls**: default / hover / focus / active / disabled / loading.
- **Motion timing**: **150–250ms** for micro-interactions; **250–400ms** for layout changes.
- **Easing functions**: **Emphasized easing** for primary transitions; **Standard** for utility animations.
- **Reduced motion**: Respect `prefers-reduced-motion` for accessibility.
- **Skeletons/spinners**: Optimistic UI where safe; cancelable long actions.

## VIII. Data-heavy Views
- **Responsive tables**: Horizontal scroll for wide tables; card layout for mobile.
- **Sticky elements**: Headers, filters, and action bars where appropriate.
- **Cards & metrics**: Communicate emphasis via **tone/elevation/type**, not arbitrary color pops.
- **Empty/loading/error states**: Clearly defined for all data scenarios.
- **Progressive loading**: Load critical content first, defer non-essential elements.

## IX. Code Quality & Tooling
- **Use design tokens**: Reference `designs/tokens.json` exclusively (not design.json).
- **Role-based colors**: No raw hex values; use M3 color roles.
- **Component libraries**: Leverage shadcn/ui components with proper customization.
- **Documentation**: Reference external docs via Context7 for implementation guidance.
- **Validation**: Regular design reviews with Playwright automation.

## X. Design Process & Planning
- **Discovery phase**: Use MCP tools (shadcn, context7) for research and component exploration.
- **Planning required**: Create detailed plan for user approval before implementation.
- **Tool orchestration**: Leverage all available MCP tools for comprehensive design solutions.
- **Iterative refinement**: Test across breakpoints and gather feedback continuously.

## XI. Background & Visual Enhancement
- **Mesh gradients**: Use for hero sections, key CTAs, and visual interest.
- **Subtle patterns**: Light textures and gradients for depth without distraction.
- **Color harmony**: Maintain brand consistency while adding visual richness.
- **Performance consideration**: Optimize gradient complexity for smooth rendering.

---

### References
- WCAG 2.2 Target Size (Minimum) **24×24** CSS px
- WCAG 2.2 Focus Appearance (Minimum) **3:1** contrast change
- WCAG 2.1/2.2 Reflow at **320 CSS px**
- CSS Container Queries for component-level responsiveness
- CSS `clamp()` for fluid typography scaling
- Material 3 color roles & tone-based surfaces
- Modern CSS layout: Grid, Flexbox, and logical properties
- Design system tokens and component-driven development

### Key Files
- **Design tokens**: `designs/tokens.json` (authoritative source)
- **Component library**: shadcn/ui integration
- **Documentation**: Context7 external reference system
