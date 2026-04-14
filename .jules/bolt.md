## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2026-04-14 - Parallelizing Database Queries using Promise.all
**Learning:** The analytics route fetched independent Supabase queries sequentially, causing unnecessary backend latency. However, Supabase queries return an object `{ data, error }` rather than throwing an error for rejected promises.
**Action:** Use `Promise.all()` to run queries concurrently. Destructure the returned arrays of objects immediately, then manually check and throw the errors sequentially *after* the promise resolves.
