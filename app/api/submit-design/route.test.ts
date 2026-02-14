import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';

// Mock dependencies
const sendMailMock = mock.fn(() => Promise.resolve({ messageId: 'test-id' }));
const insertMock = mock.fn(() => Promise.resolve({ error: null }));
const getSessionMock = mock.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } }));

mock.module('nodemailer', {
  namedExports: {
    createTransport: mock.fn(() => ({
      sendMail: sendMailMock,
    })),
  },
});

mock.module('@supabase/auth-helpers-nextjs', {
  namedExports: {
    createRouteHandlerClient: mock.fn(() => ({
      auth: {
        getSession: getSessionMock,
      },
      from: mock.fn(() => ({
        insert: insertMock,
      })),
    })),
  },
});

mock.module('next/headers', {
  namedExports: {
    cookies: mock.fn(() => ({})),
  },
});

mock.module('next/server', {
  namedExports: {
    NextResponse: {
      json: mock.fn((body, init) => ({
        body,
        status: init?.status ?? 200,
        ok: (init?.status ?? 200) >= 200 && (init?.status ?? 200) < 300,
      })),
    },
  },
});

describe('Submit Design API', () => {
  let POST: any;

  const validData = {
    name: 'Jonas Jonaitis',
    email: 'jonas@example.com',
    phone: '+37060000000',
    size: 'L',
    quantity: 1,
    comments: 'Test comment',
    product: { id: 't-shirt-1', name: 'T-Shirt', type: 't-shirt' },
    printAreas: ['front'],
    totalPrice: 25.00,
    designPreviews: { front: 'data:image/png;base64,fake' },
    designStates: {},
    uploadedImage: 'data:image/png;base64,fake-logo',
  };

  before(async () => {
    process.env.EMAIL_SERVER = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user@example.com';
    process.env.EMAIL_PASSWORD = 'password';
    process.env.EMAIL_FROM = 'noreply@example.com';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // Import the module under test dynamically to ensure mocks are active
    // @ts-expect-error
    const module = await import('./route.ts');
    POST = module.POST;
  });

  after(() => {
    mock.reset();
  });

  it('should successfully process a valid order', async () => {
    const request = {
      json: async () => validData,
    };

    const response = await POST(request as any);

    // In our mock, NextResponse.json returns { body, ... }
    // The code returns NextResponse.json(...)

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(sendMailMock.mock.calls.length, 1);
    // The code calls insert for DB
    // We need to check if insertMock was called.
    // However, createRouteHandlerClient returns { auth: ..., from: ... }
    // from returns { insert: insertMock }
    // So insertMock should be called.
    // Wait, insertMock might be called multiple times? No, just once.
    // Actually, createRouteHandlerClient is called inside the function.
    // Every call creates a new client mock, but the insert function is the same mock function.
    assert.strictEqual(insertMock.mock.calls.length, 1);
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = { ...validData, email: 'invalid-email' };
    const request = {
      json: async () => invalidData,
    };

    // Reset mocks to ensure counts are correct (though not expected to be called)
    sendMailMock.mock.resetCalls();
    insertMock.mock.resetCalls();

    const response = await POST(request as any);

    assert.strictEqual(response.status, 400);
    assert.ok(response.body.error);
    // Should not send email or save to DB if validation fails
    assert.strictEqual(sendMailMock.mock.calls.length, 0);
    assert.strictEqual(insertMock.mock.calls.length, 0);
  });

  it('should return 200 even if database save fails', async () => {
    // Setup DB mock to fail
    insertMock.mock.mockImplementationOnce(() => Promise.resolve({ error: 'DB Error' }));
    sendMailMock.mock.resetCalls();

    const request = {
      json: async () => validData,
    };

    const response = await POST(request as any);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
    // Email should still be sent
    assert.strictEqual(sendMailMock.mock.calls.length, 1);
  });

  it('should return 200 even if email sending fails', async () => {
    // Setup Email mock to fail
    sendMailMock.mock.mockImplementationOnce(() => Promise.reject(new Error('Email Error')));
    // DB mock needs to be reset to success (it was mocked to fail in previous test, but we used mockImplementationOnce)
    // insertMock implementation is already success by default but let's be sure

    const request = {
      json: async () => validData,
    };

    const response = await POST(request as any);

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
  });
});
