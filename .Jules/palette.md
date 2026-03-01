## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found a recurring pattern where icon-only buttons (like Zoom In/Out, Hamburger Menu, Scoreboard toggle) lack `aria-label`s or use `title` instead of semantic ARIA attributes. Menu buttons also miss `aria-expanded` state.
**Action:** When creating or reviewing icon-only buttons in this app, ensure they have descriptive `aria-label` attributes and include state attributes like `aria-expanded` or `aria-pressed` for interactive components.
