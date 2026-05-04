## 2024-05-23 - [Missing ARIA Labels on Icon-Only Buttons]
**Learning:** Icon-only buttons using components like `<X />` often lack `aria-label` attributes, making them inaccessible to screen reader users who cannot infer their purpose visually.
**Action:** Always ensure that any button without visible text includes a descriptive `aria-label` attribute (e.g., `aria-label="Uždaryti"` for close buttons) to maintain accessibility standards.
