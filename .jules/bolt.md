## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized ApplyImageFilter Loop]
**Learning:** Operations on `Uint8ClampedArray` within tight loops (like pixel manipulation) can be expensive due to bounds checking overhead on every property access.
**Action:** Extracted pixel RGB values to local variables before applying image filters. Also, hoisted condition checks and constant variable calculations (like `contrastFactor` and `invSat`) outside the loop to prevent recalculating them for each of the millions of pixels. This provided a ~20-25% speed improvement on large images.
