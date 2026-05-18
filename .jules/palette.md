## 2024-05-23 - [Icon Button Accessibility]
**Learning:** Icon-only buttons in modals/tooltips (like the close 'X') often lack ARIA labels and focus states, reducing accessibility. The translation for standard actions like 'Close' should simply be 'Uždaryti' to match surrounding UI text and avoid perceived localization bugs.
**Action:** Always add 'aria-label' and explicit focus-visible utility classes to icon-only buttons that don't use the shared Button component.
