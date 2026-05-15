## 2024-05-15 - ARIA attributes for hamburger menu toggle button
**Learning:** Expanding/collapsing menus need explicit `aria-expanded` and `aria-controls` to be properly interpreted by screen readers. A hamburger menu with just a title and no state information is inaccessible to keyboard and screen reader users. Also adding `aria-label` to the hamburger button instead of only an icon.
**Action:** Adding missing `aria-expanded`, `aria-controls`, and `aria-label` to the hamburger button in `src/components/game/GameOverlay.tsx`.
