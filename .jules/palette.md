## 2024-04-25 - Manually styling raw buttons
**Learning:** When standard `Button.tsx` components are not used, raw `<button>` elements throughout the app often lack proper keyboard focus states (`focus-visible`) and localized ARIA labels (e.g., "Uždaryti" for close icons), making them inaccessible.
**Action:** Always verify raw `<button>` implementations and manually append `focus-visible:outline-none focus-visible:ring-2 rounded` classes (customizing the ring color) along with localized `aria-label`s for icon-only instances.
