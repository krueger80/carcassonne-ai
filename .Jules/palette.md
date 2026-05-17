## 2024-05-17 - Add ARIA label to main menu button
**Learning:** Found an icon-only button (hamburger menu) in `src/components/game/GameOverlay.tsx` lacking `aria-label` and `aria-expanded` attributes, making it completely inaccessible to screen readers.
**Action:** Always verify icon-only buttons have descriptive `aria-label` attributes and state-toggling buttons have `aria-expanded`.
