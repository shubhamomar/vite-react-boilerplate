---
title: "Plan – {TASK_NAME}"
type: new-feature
slug: {slug}
status: Pending Approval
owner: {your_name}
created: {YYYY-MM-DD}
---

## 1) Summary
One paragraph on the outcome and user value.

## 2) Goals / Non-Goals
- Goals: …
- Non-Goals: …

## 3) Assumptions & Dependencies
- Assumptions: …
- Dependencies (libs/APIs/components): …

## 4) Risks & Mitigations
- Risk → Mitigation

## 5) UX Spec
- IA & navigation changes
- Density mode impacts (40/32; 44/36)
- Container-query behavior (component breakpoints)
- Command palette entries
- Copilot affordances (panel width 360–480px; undo/redo)

## 6) A11y Plan (WCAG 2.2)
- Focus appearance ≥3:1; target size ≥24×24; drag alternatives; prefers-contrast/motion

## 7) Phases & Tasks
- Phase 1: …
- Phase 2: …
- Exit criteria per phase

## 8) Test Plan (Playwright)
- Viewports: 1280×800, 1920×1080, 2560×1440
- Themes: light/dark/high-contrast; Density: comfortable/compact
- Scenarios + selectors
- Screenshot matrix + HTML report path

## 9) Rollback Strategy
How to disable/guard-rail this feature.

## 10) Definition of Done
- All review gates pass; artifacts written to `ai-tasks/{slug}/…`

## 11) References
Links & brief notes from discovery.

> After approval, update `status: Approved`.
