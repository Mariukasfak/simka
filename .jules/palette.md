## 2024-05-09 - Added Accessible Tooltip Close Buttons
**Learning:** Found that custom icon-only UI close buttons (like the `<X size={16} />` used in tooltips and modals in `EnhancedDesignCanvas.tsx`) lacked `aria-label`s and proper keyboard focus rings.
**Action:** Always add localization-aware ARIA labels (e.g., `aria-label="Uždaryti"`) and Tailwind focus utility classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500`) to custom icon-only components that don't use the shared `Button` component to ensure screen reader and keyboard accessibility.
