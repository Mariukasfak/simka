## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [O(N^2) Array Reductions in Data Aggregation]
**Learning:** Using `Array.find` inside `Array.reduce` to aggregate data by keys (like dates) creates an O(N^2) bottleneck, which is particularly detrimental in backend API routes handling analytics or large datasets.
**Action:** Always use a `Map` or a simple object for grouping and aggregating data to ensure O(N) complexity. JavaScript `Map`s preserve insertion order naturally.
