# Palette's Journal

## 2024-05-23 - Form Accessibility Pattern
**Learning:** Adding `aria-invalid` and `aria-describedby` to form inputs significantly improves the screen reader experience by explicitly linking errors to inputs.
**Action:** When implementing forms, always ensure error messages have unique IDs and are referenced by `aria-describedby` on the corresponding input, and use `aria-invalid` to indicate error state.
