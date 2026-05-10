## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2026-05-10 - [Optimized Array.find in Admin Analytics API]
**Learning:** The `app/api/admin/analytics/route.ts` contained an O(N^2) operation where `Array.prototype.find()` was nested inside an `Array.prototype.reduce()` to aggregate daily revenue data. For a large volume of orders, this is a significant bottleneck.
**Action:** Replaced the nested array search with a `Map` based lookup. Iterating the orders and updating the `Map` happens in O(N) time. The chronological sorting is naturally preserved by the `Map` object, as it guarantees iterating in insertion order, making this a safe and effective replacement.
