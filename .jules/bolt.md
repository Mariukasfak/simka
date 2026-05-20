## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-23 - [O(n^2) Daily Revenue Aggregation]
**Learning:** Using `Array.find` inside `Array.reduce` creates an (N^2)$ algorithm for grouping dates, which becomes a bottleneck as the order table grows.
**Action:** Replace nested loops with a `Map` or an object lookup for (N)$ complexity.
