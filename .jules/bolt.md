## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-23 - [O(N) vs O(N^2) Array Aggregation]
**Learning:** Using `Array.find` or `Array.filter` inside an `Array.reduce` to aggregate data arrays results in O(N^2) time complexity.
**Action:** Always use a `Map` or hash object to aggregate values by a key (like daily revenue), turning O(N^2) into O(N) operations, while preserving the original sequence insertion order natively using Javascript's Map implementation.
