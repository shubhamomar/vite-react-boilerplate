---
title: "Plan – {TASK_NAME}"
type: enhancement
slug: {slug}
status: Pending Approval
owner: {your_name}
created: {YYYY-MM-DD}
---

## 1) Summary
What improves vs current. Who benefits. Success metric(s).

## 2) Goals / Non-Goals
- Goals: …
- Non-Goals: …

## 3) Baseline & Deltas
- Current behavior: …
- Proposed changes (delta-only): …
- Backward-compat: maintain/soft-deprecate/hard-deprecate + timeline

## 4) Assumptions & Dependencies
- Libs/APIs/components touched (links)
- Data migrations / feature flags

## 5) Risks & Mitigations
- Risk → Mitigation (flag, kill switch, rollout)

## 6) UX Spec
- IA/nav changes
- Density impact (40/32; 44/36)
- **Container-query** variants to add
- Command Palette entries to add/update
- Copilot interactions (panel 360–480px; undo/redo)

## 7) A11y Plan (WCAG 2.2)
- Focus ≥3:1, targets ≥24×24, drag-alternatives, prefers-contrast/motion

## 8) Phases & Tasks
- Phase 1: …
- Phase 2: …
- Exit criteria per phase

## 9) Test Plan (Playwright)
- Sizes: 1280×800, 1920×1080, 2560×1440
- Themes: light/dark/high-contrast; Density: comfortable/compact
- Scenarios + selectors
- Screenshot matrix + HTML report path

## 10) Rollback
Flag off / revert steps.

## 11) Definition of Done
- All gates pass; artifacts at `ai-tasks/{slug}/…`

## 12) References
- …
