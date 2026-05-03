## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [O(n^2) Bottlenecks in Array Reduce]
**Learning:** Using `Array.prototype.find()` inside a `reduce()` loop creates an O(N^2) complexity, which can become a bottleneck when aggregating large datasets like daily revenue over long periods. JavaScript Maps inherently preserve insertion order, making them perfect for chronological grouping while providing O(1) lookups.
**Action:** When aggregating datasets by keys (e.g., grouping revenue by date), replace nested `Array.find` or `Array.filter` calls within loops with a `Map` or object-based lookup to achieve O(N) complexity and avoid performance bottlenecks.
