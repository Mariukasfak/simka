## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized daily revenue aggregation from O(N²) to O(N)]
**Learning:** In `app/api/admin/analytics/route.ts`, aggregating daily revenues using `Array.reduce` with an internal `Array.find` call results in an $O(N^2)$ time complexity, which can become a bottleneck as the number of orders grows.
**Action:** Replace the nested loop structure with a single pass using a Javascript `Map`. `Map` lookups are $O(1)$, reducing the overall time complexity to $O(N)$. Furthermore, `Map` naturally preserves insertion order, maintaining the chronological sort of the input data without requiring a subsequent sort operation.
