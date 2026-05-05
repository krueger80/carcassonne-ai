## 2024-05-24 - Accessible Hamburger Menus
**Learning:** Toggle buttons controlling expandable content must explicitly set `aria-expanded`, `aria-controls` and an `aria-label` (using translations with fallbacks) to be accessible to screen readers, while their inner decorative elements (like SVG icons) must use `aria-hidden='true'`.
**Action:** Consistently apply these ARIA attributes to all custom expandable menu/drawer toggles across the application.
