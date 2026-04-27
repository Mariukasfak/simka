## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2026-04-27 - [O(N) Map for Data Aggregation]
**Learning:** Replaced an O(N^2) Array.find() inside Array.reduce() with an O(N) Map lookup for grouping daily revenue data. This pattern is essential for data aggregation bottlenecks as row count scales.
**Action:** Always favor Hash Maps/Objects for grouping or counting data arrays instead of nested find/filter iterations.
