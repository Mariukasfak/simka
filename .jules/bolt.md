## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2025-05-18 - [Debouncing with useCallback Anti-Pattern]
**Learning:** Using `useCallback(debounce(fn, delay), [deps])` is a React anti-pattern. If the dependencies are not referentially stable, `useCallback` will recreate the debounced function on every render. For high-frequency updates (like dragging a slider), an unstable dependency prop causes a new debounce timer to be created on every tick. This results in all delayed calls firing sequentially, nullifying the optimization.
**Action:** Use a `useRef` to store the debounced function so it isn't recreated on every render, and call it using the current references in your component scope.
