# Palette's Journal

## 2025-02-14 - Interactive Icons vs Buttons
**Learning:** Components that act as buttons (e.g., selecting an item) are often implemented as `div`s with `onClick`, harming keyboard accessibility. Refactoring these to use semantic `<button>` elements (or `motion.button`) while resetting default button styles preserves the visual design while gaining native keyboard support and ARIA role benefits.
**Action:** When spotting clickable `div`s, check if they can be converted to `<button>`. If so, apply `appearance: none`, `border: none`, `background: transparent`, `padding: 0` to reset, then apply the custom styles. Always add `aria-label` if the button contains only an icon.
