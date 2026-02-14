
import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// @ts-expect-error
import { resizeImage } from './imageProcessing.ts';

// Mock types
interface MockCanvasContext {
  drawImage: (img: any, x: number, y: number, w: number, h: number) => void;
  putImageData: (data: any, x: number, y: number) => void;
  getImageData: (x: number, y: number, w: number, h: number) => { data: Uint8ClampedArray };
}

interface MockCanvas {
  width: number;
  height: number;
  getContext: (type: string) => MockCanvasContext | null;
  toBlob: (callback: (blob: Blob | null) => void, type: string, quality: number) => void;
}

// Global mocks
let originalImage: any;
let originalDocument: any;
let originalURL: any;
let originalFile: any;
let originalBlob: any;

// Helper to store the base mock implementation of createElement
let baseCreateElement: any;

describe('resizeImage', () => {
  before(() => {
    // Save original globals
    originalImage = global.Image;
    originalDocument = global.document;
    originalURL = global.URL;
    originalFile = global.File;
    originalBlob = global.Blob;

    // Mock Blob
    global.Blob = class {
      size: number;
      type: string;
      constructor(content: any[], options: any) {
        this.size = content.length;
        this.type = options?.type || '';
      }
    } as any;

    // Mock File
    global.File = class extends global.Blob {
      name: string;
      constructor(content: any[], name: string, options: any) {
        super(content, options);
        this.name = name;
      }
    } as any;

    // Mock URL
    global.URL = {
      createObjectURL: () => 'blob:mock-url',
      revokeObjectURL: () => {},
    } as any;

    // Mock document
    baseCreateElement = (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: (type: string) => {
            if (type === '2d') {
              return {
                drawImage: (img: any, x: number, y: number, w: number, h: number) => {
                  // Store dimensions for verification if needed
                },
                putImageData: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(4) }),
              };
            }
            return null;
          },
          toBlob: (callback: (blob: Blob | null) => void, type: string, quality: number) => {
            callback(new global.Blob(['mock-image-data'], { type }));
          },
        } as unknown as MockCanvas;
      }
      return {};
    };

    global.document = {
      createElement: baseCreateElement,
    } as any;
  });

  after(() => {
    // Restore globals
    global.Image = originalImage;
    global.document = originalDocument;
    global.URL = originalURL;
    global.File = originalFile;
    global.Blob = originalBlob;
  });

  afterEach(() => {
    // Restore the base mock implementation of createElement
    if (global.document) {
      global.document.createElement = baseCreateElement;
    }
  });

  // Per-test setup for Image mock to control dimensions
  let mockImageWidth = 1000;
  let mockImageHeight = 1000;
  let shouldFailLoad = false;

  beforeEach(() => {
    mockImageWidth = 1000;
    mockImageHeight = 1000;
    shouldFailLoad = false;

    global.Image = class {
      width: number;
      height: number;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

      constructor() {
        this.width = mockImageWidth;
        this.height = mockImageHeight;

        // Simulate async loading behavior
        setTimeout(() => {
          if (shouldFailLoad) {
            if (this.onerror) this.onerror();
          } else {
            if (this.onload) this.onload();
          }
        }, 0);
      }
    } as any;
  });

  it('should resize a large image to fit within max dimensions', async () => {
    mockImageWidth = 2000;
    mockImageHeight = 1000;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    let canvasWidth = 0;
    let canvasHeight = 0;

    // Override createElement for this test to capture dimensions
    global.document.createElement = (tag: string) => {
      if (tag === 'canvas') {
        const canvas = baseCreateElement('canvas') as unknown as MockCanvas;
        return new Proxy(canvas, {
          set(target, prop, value) {
            if (prop === 'width') canvasWidth = value as number;
            if (prop === 'height') canvasHeight = value as number;
            return Reflect.set(target, prop, value);
          }
        }) as any;
      }
      return baseCreateElement(tag);
    };

    await resizeImage(file, 800, 800);

    assert.strictEqual(canvasWidth, 800);
    assert.strictEqual(canvasHeight, 400);
  });

  it('should not resize an image smaller than max dimensions', async () => {
    mockImageWidth = 400;
    mockImageHeight = 300;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    let canvasWidth = 0;
    let canvasHeight = 0;

    global.document.createElement = (tag: string) => {
      if (tag === 'canvas') {
        const canvas = baseCreateElement('canvas') as unknown as MockCanvas;
        return new Proxy(canvas, {
          set(target, prop, value) {
            if (prop === 'width') canvasWidth = value as number;
            if (prop === 'height') canvasHeight = value as number;
            return Reflect.set(target, prop, value);
          }
        }) as any;
      }
      return baseCreateElement(tag);
    };

    await resizeImage(file, 800, 800);

    assert.strictEqual(canvasWidth, 400);
    assert.strictEqual(canvasHeight, 300);
  });

  it('should handle square images', async () => {
    mockImageWidth = 2000;
    mockImageHeight = 2000;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    let canvasWidth = 0;
    let canvasHeight = 0;

    global.document.createElement = (tag: string) => {
      if (tag === 'canvas') {
        const canvas = baseCreateElement('canvas') as unknown as MockCanvas;
        return new Proxy(canvas, {
          set(target, prop, value) {
            if (prop === 'width') canvasWidth = value as number;
            if (prop === 'height') canvasHeight = value as number;
            return Reflect.set(target, prop, value);
          }
        }) as any;
      }
      return baseCreateElement(tag);
    };

    await resizeImage(file, 800, 800);

    assert.strictEqual(canvasWidth, 800);
    assert.strictEqual(canvasHeight, 800);
  });

  it('should reject when image fails to load', async () => {
    shouldFailLoad = true;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    await assert.rejects(
      async () => await resizeImage(file),
      /Failed to load image/
    );
  });
});
