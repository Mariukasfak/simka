## 2025-05-23 - Interactive Tooltip Roles
**Learning:** Elements with `role="tooltip"` should not contain interactive elements (like close buttons). They are meant for non-interactive descriptions.
**Action:** Use `role="region"` (with `aria-label`) or a non-modal `role="dialog"` for tooltips that persist and require user interaction to dismiss.
