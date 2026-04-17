## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-25 - [Optimize Supabase Queries]
**Learning:** Sequential `supabase.from()` calls in API routes create unnecessary latency, and `select("*")` on large tables consumes excess memory and bandwidth. Additionally, returned data often requires mapping to camelCase to match the frontend types.
**Action:** Use `Promise.all` to execute independent queries concurrently, explicitly list required columns in `.select()`, and map `snake_case` keys to `camelCase` for compatibility.
