## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [O(N^2) Array.find inside reduce]
**Learning:** Nested array iteration methods (e.g. `Array.find` inside `Array.reduce`) can cause significant performance bottlenecks as data scales up, yielding O(N^2) complexity.
**Action:** Replace these patterns with O(N) hash map lookups using JavaScript's `Map`. It offers faster execution and naturally preserves insertion order for later mapping to arrays.
