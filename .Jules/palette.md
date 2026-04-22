## 2024-05-18 - Missing ARIA attributes on Hamburger Menu and Expandable Content
**Learning:** In `GameOverlay.tsx`, the hamburger menu button and its content dropdown lack necessary ARIA attributes such as `aria-label`, `aria-expanded`, and `aria-controls`. This makes it difficult for screen reader users to understand the purpose of the button and its current state.
**Action:** When implementing toggle buttons that control expandable content, ensure they have an explicit `aria-label`, update `aria-expanded` based on the open state, and link to the content container using `aria-controls`.
