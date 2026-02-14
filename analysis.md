# Event Listener Thrashing Analysis in DesignCanvas

## Issue
The current implementation of `DesignCanvas` suffers from event listener thrashing and incorrect lifecycle management due to a circular dependency between `handleMouseMove`, `handleMouseUp`, and `useEffect`.

1. `handleMouseMove` is recreated whenever `isDragging` changes (initially `false`, then `true`).
2. `handleMouseDown` attaches the *current* `handleMouseMove` (created when `isDragging` was `false`) to the document.
3. When `isDragging` becomes `true` (via `setIsDragging(true)` in `handleMouseDown`), `handleMouseMove` is recreated.
4. The `useEffect` cleanup runs for the *old* `handleMouseMove`, removing the listener attached in step 2.
5. The new `handleMouseMove` (created when `isDragging` is `true`) is never attached because `handleMouseDown` is not called again.
6. As a result, dragging stops working immediately after the first render following mouse down.

## Performance Impact
- **Correctness:** The primary impact is functional correctness. Dragging is broken.
- **CPU/Memory:** Unnecessary recreation of `handleMouseMove` and `handleMouseUp` functions and unnecessary execution of `useEffect` cleanup/setup cycles (thrashing) whenever `isDragging` changes. By stabilizing the event listeners, we reduce function allocations and effect executions.

## Solution
Refactor the event listener management to use a single `useEffect` that depends on `isDragging`.

- If `isDragging` is `true`, attach `mousemove` and `mouseup` listeners.
- Return a cleanup function that removes these listeners.
- `handleMouseMove` and `handleMouseUp` can be defined inside the effect or outside with stable references (e.g., using `useRef` or just relying on the effect's closure), ensuring they don't cause re-attachments during the drag operation.
- Since `setPosition` uses functional updates, it doesn't need to be in the dependency array, making `handleMouseMove` stable during the drag.
