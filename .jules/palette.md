## 2024-05-18 - Missing ARIA labels on icon-only buttons
**Learning:** Found that custom icon-only close buttons (like the `X` icon in tooltips and modals in `EnhancedDesignCanvas.tsx`) lack `aria-label`s, rendering them inaccessible to screen readers.
**Action:** Always add `aria-label="Uždaryti"` to such custom close buttons.
