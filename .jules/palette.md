## 2024-05-23 - Accessibility in Custom Selection Grids
**Learning:** Custom interactive grids (like product selectors) often miss semantic grouping and selection state for screen readers. Buttons that visually appear selected via border/color changes are invisible to AT without `aria-pressed`.
**Action:** Always wrap selection grids in `role="group"` with a label, and ensure selected items use `aria-pressed="true"`.
