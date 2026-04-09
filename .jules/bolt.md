## 2024-05-23 - [Prevented Parent Re-renders on Drag]
**Learning:** React components re-rendering on every mouse move (even if throttled) can be a significant performance bottleneck, especially if the parent component is complex.
**Action:** Use local state for high-frequency updates (like dragging) and only sync with the parent state on completion (drag end). This isolates the re-renders to the leaf component.
## 2024-04-09 - [API Response Payload Casing]
**Learning:** When optimizing API response payloads, do not blindly map DB snake_case columns to camelCase without ensuring the rest of the application or the original API response wasn't already returning snake_case. Breaking the API contract will fail tests or break frontend components.
**Action:** Always maintain the exact API response payload structure unless explicitly refactoring the full stack. Verify the original response format before mapping.
