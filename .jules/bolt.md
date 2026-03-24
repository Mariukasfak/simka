## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Memoized Object.values lookups in render loops]
**Learning:** Performing multiple `Object.values(obj).some(...)` operations directly inside a React component's render body can cause unnecessary overhead during frequent re-renders (like when dragging elements or typing in forms), as it creates new arrays and executes the lambda function repeatedly.
**Action:** Use `useMemo` to cache the boolean result of the `.some()` check. This ensures the calculation only happens when the underlying object changes, significantly reducing garbage collection and execution time during high-frequency renders.

## 2024-05-23 - [Optimizing image data loops]
**Learning:** Loops that iterate over large arrays (like `Uint8ClampedArray` for image data) should avoid evaluating conditions or performing constant calculations inside the loop body. Doing so incurs significant overhead due to the large number of iterations (millions of pixels).
**Action:** Hoist condition checks and constant variable calculations out of the main loop. Evaluate boolean flags and static values once before the loop begins to maximize performance in functions processing image data.
