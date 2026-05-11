## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized Analytics Data Aggregation]
**Learning:** Using `Array.prototype.find()` or `Array.prototype.filter()` inside an `Array.prototype.reduce()` loop to aggregate data (like grouping daily revenue) results in $O(N \times D)$ time complexity, which becomes a bottleneck as the dataset grows.
**Action:** Replace nested array lookups inside loops with a `Map`. A `Map` provides $O(1)$ lookups, reducing the overall time complexity to $O(N)$ while naturally preserving insertion order.
