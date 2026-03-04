
## 2025-02-17 - Added ARIA labels to custom Slider component
**Learning:** Custom UI components built around native inputs (like `input[type="range"]` in the Slider component) often lack context for screen readers when used without explicit `<label>` associations in parent components. In a Lithuanian UI, providing localized labels (e.g., "Dydžio keitimas" instead of just "Dydis" for action context) significantly improves the accessibility of interactive controls.
**Action:** When creating reusable UI components that wrap native form elements, always expose an `aria-label` or `aria-labelledby` prop and encourage its use when instantiating the component in specific contexts.
