import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { POST } from './route.ts';

describe('POST /api/submit-design', () => {
  beforeEach(() => {
    // Reset global mock state
    // @ts-ignore
    globalThis.__MOCK_DB_ERROR__ = false;
    // @ts-ignore
    globalThis.__MOCK_DB_THROW__ = false;
    // @ts-ignore
    globalThis.__MOCK_EMAIL_CALLBACK__ = () => {};

    // Mock console to avoid noise
    mock.method(console, 'error', () => {});
    mock.method(console, 'log', () => {});
    mock.method(console, 'warn', () => {});
  });

  test('should continue execution and send email when database insertion returns error', async () => {
    // Enable database error simulation (returns { error: ... })
    // @ts-ignore
    globalThis.__MOCK_DB_ERROR__ = true;

    let emailSent = false;
    // @ts-ignore
    globalThis.__MOCK_EMAIL_CALLBACK__ = (opts) => {
        emailSent = true;
    };

    const requestData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123456789',
      size: 'M',
      quantity: 1,
      comments: 'Test comment',
      product: {
        id: 'prod-123',
        name: 'T-Shirt',
        type: 't-shirt'
      },
      totalPrice: 20.00,
      designPreviews: { front: 'data:image/png;base64,preview' },
      designStates: {},
      uploadedImage: 'data:image/png;base64,logo'
    };

    const request = {
      json: async () => requestData,
    } as unknown as Request;

    // Set environment variables needed for the handler
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.EMAIL_SERVER = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASSWORD = 'password';

    const response = await POST(request);

    // Assertions
    const res = response as any;
    assert.strictEqual(res.status, 200, 'Response status should be 200');
    assert.strictEqual(res.body.success, true, 'Response body should indicate success');

    // Verify Email was sent
    assert.strictEqual(emailSent, true, 'Email should be sent despite DB error');
  });

  test('should continue execution and send email when database throws exception', async () => {
    // Enable database exception simulation
    // @ts-ignore
    globalThis.__MOCK_DB_THROW__ = true;

    let emailSent = false;
    // @ts-ignore
    globalThis.__MOCK_EMAIL_CALLBACK__ = (opts) => {
        emailSent = true;
    };

    const requestData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '123456789',
      size: 'M',
      quantity: 1,
      comments: 'Test comment',
      product: {
        id: 'prod-123',
        name: 'T-Shirt',
        type: 't-shirt'
      },
      totalPrice: 20.00,
      designPreviews: { front: 'data:image/png;base64,preview' },
      designStates: {},
      uploadedImage: 'data:image/png;base64,logo'
    };

    const request = {
      json: async () => requestData,
    } as unknown as Request;

    // Set environment variables needed for the handler
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.EMAIL_SERVER = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASSWORD = 'password';

    const response = await POST(request);

    // Assertions
    const res = response as any;
    assert.strictEqual(res.status, 200, 'Response status should be 200');
    assert.strictEqual(res.body.success, true, 'Response body should indicate success');

    // Verify Email was sent
    assert.strictEqual(emailSent, true, 'Email should be sent despite DB exception');
  });
});
