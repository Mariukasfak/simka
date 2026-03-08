## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-06-21 - [Optimized Typed Array Pixel Processing]
**Learning:** Iterating over `Uint8ClampedArray` (like `ImageData.data`) inside a tight loop with repetitive condition checks and constant math is extremely inefficient. Getter/setter overhead bounds-checking makes multiple writes to the array in one iteration costly.
**Action:** Extract condition checks and pre-calculate constant values outside the loop. Inside the loop, read RGB values to local variables, modify them in memory, and write them back to the array exactly once per step.
