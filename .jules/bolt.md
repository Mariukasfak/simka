## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [requestAnimationFrame for Event Listener Cleanup & Debouncing]
**Learning:** Wrapping `window.resize` handlers in React `useEffect` with `requestAnimationFrame` significantly improves frontend performance by preventing layout thrashing and avoiding synchronous execution of heavy calculations like bound constraints.
**Action:** When adding continuous or high-frequency event listeners (like `resize`, `scroll`) in `useEffect`, use a named handler function that calls `requestAnimationFrame`, and store the frame ID to effectively cancel the animation frame via `cancelAnimationFrame` in both the new handler execution and the cleanup function, which prevents memory leaks.
