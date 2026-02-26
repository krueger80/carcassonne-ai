# Palette's Journal

## 2025-05-18 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like the hamburger menu) are a frequent accessibility trap in this codebase. They often lack `aria-label` or accessible names, making them invisible to screen readers despite being critical navigation elements.
**Action:** When creating or spotting icon-only buttons, always enforce `aria-label` usage. Consider using a `Tooltip` component if available, but at minimum, ensure the `aria-label` is descriptive (e.g., "Main Menu" instead of just "Menu"). Also ensure `aria-expanded` is used for toggle buttons.
