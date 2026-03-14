## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2025-02-28 - [React.memo and html2canvas Image Handling]
**Learning:** Replacing standard `<img>` tags with Next.js `<Image>` components inside elements targeted by `html2canvas` is an anti-pattern, as `html2canvas` struggles to capture optimized `/_next/image` URLs due to cross-origin tainting issues. Additionally, optimizing components with `React.memo` (like `ProductSelector`) is a safe and highly effective way to prevent unnecessary re-renders triggered by complex parent state updates.
**Action:** Avoid using Next.js `<Image>` inside canvases meant for export via `html2canvas`. Default to safe React optimizations like `React.memo` when looking for pure performance improvements without side effects.
