## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [Parallelizing Supabase Queries]
**Learning:** Sequential Supabase queries using `.select('*')` create a compounded latency penalty and unnecessary memory pressure in Next.js API routes. Supabase promises resolve with an `{ error, data }` object pattern instead of strictly rejecting, making them slightly tricky to use correctly with `Promise.all`.
**Action:** Use `Promise.all` to parallelize multiple independent database fetches. Always destructure the response array objects `[{ data: d1, error: e1 }, { data: d2, error: e2 }]` and handle the errors sequentially afterward. Always limit `.select()` fields to exactly what's required (e.g. `select('id, total_price')`) to reduce API payload overhead.
