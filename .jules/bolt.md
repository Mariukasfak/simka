## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized daily revenue analytics mapping]
**Learning:** Using `Array.find()` inside a `reduce` loop results in an O(N^2) complexity, causing performance to degrade exponentially for datasets with many items. Using `Map` drops the complexity to O(N).
**Action:** Always prefer `Map` when aggregating data inside loops over nested array searches.
