## 2024-05-18 - Missing ARIA labels on icon-only buttons
**Learning:** Found that custom `button` tags with only an icon (like the close buttons in `EnhancedDesignCanvas.tsx`) often miss `aria-label` attributes and focus-visible utility classes. Since they don’t use the shared `Button` component, they must be manually addressed for screen reader and keyboard accessibility.
**Action:** When an icon-only button cannot use the shared `Button` component, explicitly add `aria-label` and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500` styles.
