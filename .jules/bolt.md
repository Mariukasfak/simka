## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2025-02-09 - [Image Filtering LUT Optimization]
**Learning:** For high-performance image processing loops in JavaScript, computing floating-point arithmetic (like brightness and contrast adjustments) per pixel is extremely expensive and causes significant latency for high-resolution images.
**Action:** Always pre-calculate finite possibilities (e.g., all 256 pixel values) into a 1D Look-Up Table (LUT) using `Uint8ClampedArray` to replace complex math with fast array lookups, and ensure intermediate math correctly clamps values with `Math.max(0, Math.min(255, val))` before writing back to preserve mathematical exactness with legacy array assignments.
