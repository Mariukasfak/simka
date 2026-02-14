import { test } from 'node:test';
import assert from 'node:assert';
// @ts-expect-error - TS expects no extension for imports, but node:test requires it
import { isValidDataUri } from './image.ts';

test('isValidDataUri - Valid Data URIs', () => {
  // Simple PNG
  assert.strictEqual(isValidDataUri('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='), true);
  // JPEG
  assert.strictEqual(isValidDataUri('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAQECAQECAgICAgICAgMFAwMDAwMGBAQDBQcHBwcHBwcHBwoLCAcICQcHBzkLCAgICQkJCAoLDQoLCQgICQkJ/9sAQwECAgIDAwMFAwMFCwgHCAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/2Q=='), true);
  // GIF
  assert.strictEqual(isValidDataUri('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), true);
  // WEBP
  assert.strictEqual(isValidDataUri('data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='), true);
});

test('isValidDataUri - Invalid URLs and Paths', () => {
  // File path
  assert.strictEqual(isValidDataUri('file:///etc/passwd'), false);
  assert.strictEqual(isValidDataUri('/etc/passwd'), false);

  // HTTP URL
  assert.strictEqual(isValidDataUri('http://example.com/image.png'), false);
  assert.strictEqual(isValidDataUri('https://example.com/image.png'), false);

  // Blob URL
  assert.strictEqual(isValidDataUri('blob:http://localhost:3000/1234-5678'), false);

  // Script execution attempt (XSS/Data URI abuse, though restricted by image/)
  assert.strictEqual(isValidDataUri('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), false);

  // Invalid base64 (contains spaces or newlines if we are strict, or invalid chars)
  assert.strictEqual(isValidDataUri('data:image/png;base64,invalid-chars!@#'), false);

  // Missing base64 prefix
  assert.strictEqual(isValidDataUri('data:image/png,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='), false);

  // Empty
  assert.strictEqual(isValidDataUri(''), false);

  // Null/Undefined (though typed string)
  assert.strictEqual(isValidDataUri(null as any), false);
  assert.strictEqual(isValidDataUri(undefined as any), false);
});
