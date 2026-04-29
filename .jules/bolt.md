## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [O(N^2) Anti-Pattern in Data Aggregation]
**Learning:** Found an $O(N^2)$ bottleneck in `app/api/admin/analytics/route.ts` where `Array.find` was used inside an `Array.reduce` loop to group daily revenue. This pattern scales poorly as order volume grows.
**Action:** Replaced the nested loop with a single pass using a `Map` to accumulate values, then converted it back to an array. This reduced time complexity to $O(N)$ and execution time for 5000 items from ~18ms to ~11ms. Also, remember not to commit `pnpm-lock.yaml` changes when performing targeted backend optimizations.
