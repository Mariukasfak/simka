## 2024-06-25 - [Raw Button Accessibility]
**Learning:** Raw `<button>` elements in this project (e.g., in modals or tooltips) lack the inherent keyboard accessibility focus styles provided by the standard `components/ui/Button.tsx`.
**Action:** When adding raw icon-only buttons (like a close `X`), always manually apply utility classes such as `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded` and include an `aria-label` to ensure they are accessible via keyboard navigation and screen readers.
