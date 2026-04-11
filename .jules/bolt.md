## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-23 - [Parallelizing Independent Backend Tasks]
**Learning:** Sequential execution of independent asynchronous operations (like multiple Supabase database queries or DB inserts followed by email sending) causes an unnecessary cumulative delay in API route handlers. This architecture natively suppresses backend performance.
**Action:** When inspecting API routes, always search for sequential `await` statements (e.g., `await supabase.from...` followed by another `await supabase.from...` or `await transporter.sendMail...`). Wrap them in `Promise.all()` to parallelize network I/O and significantly reduce the total endpoint latency. When parallelizing Supabase queries, remember to destructure `{ data, error }` results because they resolve rather than reject on error.
