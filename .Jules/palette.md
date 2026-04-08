# Palette's Journal

## 2024-05-18 - Added ARIA labels and states to icon-only game controls
**Learning:** Found several icon-only buttons (zoom controls, hamburger menu) in the game UI (`GameBoard.tsx`, `GameOverlay.tsx`) that lacked text alternatives, making them inaccessible. Additionally, stateful toggle buttons like the Hamburger menu were missing `aria-expanded` attributes.
**Action:** Always verify that buttons containing only visual elements (like `+`, `-`, or SVG icons) have descriptive `aria-label` attributes. Add `aria-expanded` to toggleable menus to provide state context to screen readers.
