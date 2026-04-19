## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-24 - [API Map Optimizations & API Data Schema Warning]
**Learning:** When fetching raw database rows, Supabase typically returns `snake_case` keys. The frontend typically relies on `camelCase` matching its Typescript types. Mapping these in an API response silently breaks frontend code that previously relied on a mismatch or implicit conversion, resulting in UI regressions. Also, $O(N^2)$ `.find()` algorithms inside a `.reduce()` loop become noticeable bottlenecks when iterating over analytical datasets.
**Action:** Use a `Map` structure to reduce array lookups to $O(N)$ when aggregating large datasets. Never blindly re-map response object shapes without checking frontend dependencies!
