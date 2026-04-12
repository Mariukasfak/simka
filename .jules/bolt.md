## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-23 - [Parallelizing Database Queries in Analytics Route]
**Learning:** In the Supabase environment, `Promise.all` can effectively parallelize independent sequential SQL queries. However, Supabase query objects do not reject upon SQL errors but instead resolve with an `{ error }` payload.
**Action:** When using `Promise.all` to execute multiple Supabase queries simultaneously, destructure the array of results and explicitly throw the errors sequentially immediately after the `Promise.all` block to maintain standard error-handling flows.
