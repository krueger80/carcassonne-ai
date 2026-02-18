## 2025-05-23 - Accessible Custom Selectors
**Learning:** Custom button groups (like player count) are often invisible to screen readers without ARIA roles. Adding `role="group"` and `aria-pressed` makes them accessible without visual changes.
**Action:** Audit all custom toggle/selector components for `aria-pressed` or `aria-checked` attributes.
