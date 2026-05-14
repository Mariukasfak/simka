## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2026-05-14 - [O(N^2) Aggregation Bottleneck]
**Learning:** Using `Array.find()` inside a loop (like `Array.reduce()`) to aggregate database records by date creates an O(N^2) bottleneck when processing high volumes of daily orders in the analytics endpoint.
**Action:** Always use a `Map` or object dictionary to group database records by a key (like date) in analytics APIs to guarantee O(N) performance, while naturally preserving the chronological sorting of the already-sorted query results.
