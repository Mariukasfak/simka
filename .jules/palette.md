## 2024-05-15 - ARIA labels for icon-only buttons
**Learning:** Icon-only close buttons in modals/tooltips (`<X />`) lacked `aria-label` attributes and explicit focus rings, making them inaccessible to screen readers and keyboard users.
**Action:** Added Lithuanian `aria-label`s (e.g., 'Uždaryti patarimą') and Tailwind focus classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded`) to ensure proper accessibility and keyboard navigation.
