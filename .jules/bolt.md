## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimize Array Operations in Loops]
**Learning:** Using `Array.find` or `Array.filter` inside loops (like `reduce`) creates an $O(n^2)$ complexity, which can become a severe performance bottleneck when aggregating large datasets like daily revenue or logs.
**Action:** Always prefer using a `Map` or an object for aggregations or lookups within loops. This reduces the time complexity to $O(n)$ and, in JavaScript, `Map` naturally preserves insertion order, maintaining chronological data sequences safely.
