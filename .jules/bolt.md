## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Parallelize Multiple Supabase Queries]
**Learning:** Supabase queries resolve with `{ data, error }` instead of rejecting promises on database errors. When you want to fetch multiple datasets to optimize round trips for API endpoints, you can safely use `Promise.all` on the queries without a catch block stopping execution, and then you just throw/handle errors afterwards.
**Action:** When aggregating data or doing multiple uncoupled selects in API handlers, switch sequential `await supabase.from()` calls to `Promise.all([supabase.from(...), supabase.from(...)])`.
