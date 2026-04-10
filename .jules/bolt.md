## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-05-24 - [Avoid Altering Casing in Payloads]
**Learning:** When explicitly selecting `snake_case` database columns instead of `select(*)`, returning mapped `camelCase` keys without verifying frontend dependencies causes hidden regressions. In this API, `recentOrders` needs `camelCase` mappings.
**Action:** Always verify the expected frontend types and contracts before changing how database results are mapped to the API response structure.
