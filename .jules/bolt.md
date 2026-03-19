## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [React.memo Pitfalls and useState Stability]
**Learning:** Wrapping a component in `React.memo` is a de-optimization if its props are not stable. If a parent passes an unstable prop (like an un-memoized object or function), the `React.memo` component will still re-render, adding shallow comparison overhead for no benefit. Furthermore, React `useState` setter functions have guaranteed stable identities; wrapping them in `useCallback` is an anti-pattern that provides no performance gain.
**Action:** Do not use `React.memo` unless you verify that all props passed to the component are stable across parent re-renders. Never wrap `useState` setters in `useCallback`.
