## 2026-03-31 - Toggle Buttons Missing Accessibility States
**Learning:** In this application, interactive toggle buttons (such as the Hamburger menu and Scoreboard toggles in GameOverlay) consistently lacked `aria-expanded` and `aria-controls` attributes, making their state changes invisible to screen readers.
**Action:** When adding or auditing toggle buttons that expand/collapse panels or menus, always ensure they have `aria-expanded` linked to their boolean state, `aria-controls` pointing to the panel's `id`, and an appropriate `aria-label` if they are icon-only.
