# Palette's Journal

This journal tracks critical UX and accessibility learnings.

## 2024-10-24 - Product Selection Accessibility
**Learning:** Custom selection grids often lack semantic state for screen readers. Using `aria-pressed` on buttons is a valid pattern for single-select grids where radio buttons are too complex to style.
**Action:** Always ensure "selected" visual state is accompanied by `aria-pressed` or `aria-selected` and clear `aria-labels`.
