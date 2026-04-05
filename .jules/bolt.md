## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [Fix Window Resize Memory Leak]
**Learning:** In React, using an anonymous function for `addEventListener` inside a `useEffect` with frequently changing dependencies, combined with providing an incorrect function to `removeEventListener` in the cleanup block, causes severe memory leaks and degrades performance as multiple event listeners stack up over time.
**Action:** Always use stable, named functions for event listeners inside `useEffect` and ensure the exact same function is passed to the cleanup `removeEventListener`. Further optimize window resize events by wrapping their logic inside `requestAnimationFrame` to prevent layout thrashing.
