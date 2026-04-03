## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-25 - [Parallelized DB Queries in Admin API]
**Learning:** Sequential independent database queries (e.g., in analytics dashboards) are a major source of latency. Also, fetching all columns via `.select('*')` into memory for simple aggregations causes significant network overhead.
**Action:** Use `Promise.all` to parallelize independent Supabase queries. Additionally, always explicitly request only the necessary columns (e.g., `select('id, total_price')`) instead of `select('*')`.
