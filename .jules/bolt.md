## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized Redundant Array Lookups in Render Cycle]
**Learning:** Performing multiple `Array.prototype.find()` operations (O(N)) on the same array inside a React render cycle (especially when bound to event handlers or child component props) can significantly impact performance as the array grows.
**Action:** Use `useMemo` to memoize the result of the `find()` lookup so the search is only performed once when the dependencies (`designs` or `activeDesignId`) change, reusing the result across the current render cycle and event handlers.
