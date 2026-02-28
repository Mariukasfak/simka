## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-28 - [React.memo Requirements]
**Learning:** When using `React.memo` to prevent unnecessary component re-renders, it is not enough to only memoize the target component. If the component receives a callback function as a prop (like `onSelect`), that function *must* be stable (e.g. wrapped in `useCallback` in the parent component). If the parent passes a new inline function reference on every render, the shallow comparison of props by `React.memo` will always fail, adding comparison overhead but failing to stop the re-render.
**Action:** When adding `React.memo`, always verify the parent component passes stable function references and primitive values or memoized objects.