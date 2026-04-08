## 2026-03-07 - ARIA Labels for GameBoard zoom controls
**Learning:** The GameBoard component uses several completely bare icon-only buttons for critical map controls (Zoom In, Zoom Out, Reset, Territory) that lacked accessible names.
**Action:** Always add `aria-label` attributes to these bare buttons to ensure screen readers can announce their functionality correctly.
