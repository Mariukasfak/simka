## 2024-05-15 - [Initial setup]
**Learning:** Establishing the journal.
**Action:** Ready to record insights.

## 2024-05-15 - [Icon-only button accessibility]
**Learning:** Found two icon-only buttons (close tooltip and close help modal) in `EnhancedDesignCanvas` missing `aria-label`, `type="button"`, `aria-hidden` on internal SVG, and focus styles. Added the missing attributes to improve keyboard and screen reader accessibility.
**Action:** When adding or reviewing custom icon buttons, verify they have explicit `aria-label`, `type="button"`, focus-visible styles, and `aria-hidden` on the icon.
