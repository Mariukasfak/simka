## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [O(n^2) Loop Optimization in Array.reduce]
**Learning:** Using `Array.find()` inside an `Array.reduce()` loop creates an O(n^2) time complexity, which is highly inefficient for data aggregations like grouping revenue by date.
**Action:** Replace nested loops/array searches during aggregation with an O(n) Map-based implementation. JavaScript Maps natively maintain insertion order, ensuring chronological data remains sorted correctly.
