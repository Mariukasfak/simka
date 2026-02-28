
## 2025-02-13 - [EnhancedOrderForm ARIA Attributes & Native Validation Conflict]
**Learning:** Adding the native `required` HTML attribute to form inputs managed by `react-hook-form` and `zod` blocks the submission event if the form lacks `noValidate`. This causes a UX regression because the browser's native tooltips prevent custom React-rendered validation errors from appearing.
**Action:** Use `aria-required="true"` instead of the native `required` attribute when managing form validation in React to ensure accessible requirements are communicated without breaking custom validation flows.
