## 2024-05-19 - Adding ARIA labels to Icon-only Buttons
**Learning:** Found multiple `<button>` elements that only contain an icon (like `<X />`) for closing modals or tooltips. These are completely inaccessible to screen readers without `aria-label`.
**Action:** Always add descriptive `aria-label`s to any button whose content is purely visual (icons). And ensure keyboard focus accessibility.
