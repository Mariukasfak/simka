## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2026-04-13 - [Dangling resize Event Listeners]
**Learning:** Anonymous inline functions passed to `window.addEventListener` in a `useEffect` cannot be correctly removed by `window.removeEventListener` in the cleanup function if the references don't match. This causes severe memory leaks and excessive callbacks on layout resizes.
**Action:** Always extract the resize logic into a named, stable function reference and wrap the heavy DOM/state updates inside `requestAnimationFrame` to decouple them from the main thread and prevent layout thrashing.
