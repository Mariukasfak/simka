
## 2024-05-17 - Missing ARIA labels and focus states on icon-only close buttons
**Learning:** Icon-only buttons (like the `X` icon used for closing tooltips and modals in `EnhancedDesignCanvas`) inherently lack context for screen reader users and often miss visual focus indicators for keyboard users.
**Action:** Always add descriptive `aria-label` attributes (e.g., `aria-label="Uždaryti patarimą"`) and explicit `focus-visible` utility classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded`) to any icon-only interactive elements to ensure full accessibility.
