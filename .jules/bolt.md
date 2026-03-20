## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Uint8ClampedArray Auto-Clamping]
**Learning:** When optimizing pixel manipulation loops on `ImageData.data` (`Uint8ClampedArray`), explicitly clamping values with `Math.min(255, Math.max(0, val))` before writing them back adds unnecessary overhead. `Uint8ClampedArray` automatically handles clamping and rounding natively upon assignment.
**Action:** Simply assign the calculated Javascript numbers back to the array (`data[i] = r`) and let the JS engine handle the native clamping.
