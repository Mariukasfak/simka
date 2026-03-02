## 2025-01-28 - [Accessible Custom Selection Grid]
**Learning:** When building custom selection grids (like ProductSelector) using non-native inputs (e.g. `button` or `div`), they lack the semantic meaning of radio buttons, making them inaccessible to screen readers.
**Action:** Always wrap custom selection grid containers with `role="group"` and provide an `aria-label`, and add `aria-pressed={isSelected}` to the individual button items to clearly communicate selection state to screen readers.
