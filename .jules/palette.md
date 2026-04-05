## 2024-04-05 - Localization of Accessibility Labels
**Learning:** The application's UI is entirely in Lithuanian. When adding standard accessibility attributes like `aria-label` to buttons, it's critical to use the corresponding Lithuanian translation (e.g., "Uždaryti" for "Close") to ensure screen reader users receive a coherent, single-language experience that matches the visual text.
**Action:** Always inspect surrounding text or related UI components to determine the correct language before hardcoding accessibility strings.

## 2024-04-05 - Lucide Icon Accessibility
**Learning:** Icon-only `<button>` elements in this project often use Lucide React icons (e.g., `<X />`). Screen readers may read the SVG markup or generic element types if the icon isn't hidden.
**Action:** When adding an `aria-label` to the parent button, always add `aria-hidden="true"` to the inner Lucide icon component to prevent double-announcing or confusing screen reader output.
