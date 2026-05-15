## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [O(N^2) Array Accumulation and Sequential DB Queries]
**Learning:** Found sequential Supabase queries and an O(N^2) Array.find within Array.reduce for aggregating time-series data, creating a compound performance bottleneck.
**Action:** Parallelize independent Supabase queries using Promise.all (handling {data, error} tuples) and replace O(N^2) array accumulation with O(N) Map lookup.
