## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.

## 2024-05-23 - [Optimized Coordinate Display with Refs]
**Learning:** Even with local state in a parent component, updating that state on every drag frame (e.g., for coordinate display) triggers re-renders of the entire parent and its children.
**Action:** Use `useRef` and direct DOM manipulation (e.g., `ref.current.innerText`) for high-frequency text updates like coordinates, bypassing React's render cycle completely during the interaction.
