import { test, describe, before, after, mock } from 'node:test';
import assert from 'node:assert';
// @ts-expect-error - import with extension for node --experimental-strip-types
import { getImageDimensions } from './imageProcessing.ts';

// Save original globals
const originalImage = global.Image;
const originalURL = global.URL;

describe('getImageDimensions', () => {
  before(() => {
    // Mock URL
    global.URL = {
      createObjectURL: mock.fn((file: File) => {
        // Use file name to simulate different scenarios
        if (file.name === 'error.png') return 'blob:error';
        return 'blob:success';
      }),
      revokeObjectURL: mock.fn(),
    } as any;

    // Mock Image
    // @ts-expect-error - assigning to global
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: ((error: any) => void) | null = null;
      width: number = 0;
      height: number = 0;
      _src: string = '';

      set src(value: string) {
        this._src = value;
        // Simulate async loading
        setTimeout(() => {
          if (value === 'blob:error') {
            if (this.onerror) this.onerror(new Error('Failed to load image'));
          } else {
            this.width = 100;
            this.height = 200;
            if (this.onload) this.onload();
          }
        }, 10);
      }
    } as any;
  });

  after(() => {
    // Restore globals
    global.Image = originalImage;
    global.URL = originalURL;
  });

  test('should resolve with correct dimensions for a valid image', async () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const dimensions = await getImageDimensions(file);
    assert.deepStrictEqual(dimensions, { width: 100, height: 200 });
  });

  test('should reject if image fails to load', async () => {
    const file = new File([''], 'error.png', { type: 'image/png' });
    await assert.rejects(
      async () => await getImageDimensions(file),
      (err: any) => {
        assert.strictEqual(err.message, 'Failed to load image');
        return true;
      }
    );
  });
});
