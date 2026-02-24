## 2024-05-23 - Drag-and-Drop Visual Feedback
**Learning:** Users often hesitate during drag-and-drop actions if there isn't immediate, distinct visual feedback. Merely changing a border color is often insufficient, especially on screens with low contrast or glare.
**Action:** Always implement a multi-sensory feedback loop for drag operations:
1.  **Scale change:** Slightly increase size (e.g., `scale-102`) to indicate "catch" readiness.
2.  **Text change:** Explicitly switch instruction text (e.g., from "Drag here" to "Drop now").
3.  **Color intensity:** Use a significantly different background shade, not just border.
4.  **Cursor update:** Ensure `cursor-copy` or `cursor-alias` is active if possible (though browser handles this mostly).
