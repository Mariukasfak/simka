## 2024-05-16 - Add ARIA labels to close buttons
**Learning:** Found custom `<button>` tags used for close (X) actions in modals/tooltips without any ARIA labels. Users relying on screen readers wouldn't know what these buttons do. Also they lack proper focus styles for keyboard navigation.
**Action:** Always add `aria-label='Uždaryti'` (match Lithuanian localization) and keyboard focus states like `focus-visible:outline-none focus-visible:ring-2` when creating custom icon-only buttons instead of using the shared `Button` component.
