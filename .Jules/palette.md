## 2024-03-04 - ARIA labels for Icon-Only Elements
**Learning:** Found that custom Meeple and Good icons are implemented as `div` elements acting as buttons or visual indicators, but lack `role`, `aria-label`, and `tabIndex` for accessibility.
**Action:** Add proper semantic accessibility attributes to custom interactive icon elements like `MeepleIcon` and `GoodIcon` when they function as buttons. Also check `Button` component for `aria-label` support.
