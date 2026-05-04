## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2026-05-04 - [O(n²) Array.find inside Reduce]
**Learning:** Using Array.find() inside a reduce() function creates an O(n²) time complexity bottleneck, which is particularly detrimental for data aggregation like processing analytics.
**Action:** Always replace nested O(n) array lookups within loops/reduce functions with an O(1) Map or Object dictionary lookup, reducing overall complexity to O(n).
