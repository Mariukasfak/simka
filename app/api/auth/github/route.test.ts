import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('GitHub Auth Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 500 when configuration is missing', async () => {
    delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

    // @ts-expect-error
    const { GET } = await import(`./route.ts?t=${Date.now()}`);
    const response = await GET();

    assert.strictEqual(response.status, 500);
    const data = await response.json();
    assert.strictEqual(data.error, 'Missing GitHub configuration');
  });

  it('should redirect when configuration is present', async () => {
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id';
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';

    // @ts-expect-error
    const { GET } = await import(`./route.ts?t=${Date.now()}`);
    const response = await GET();

    assert.strictEqual(response.status, 307);
    const location = response.headers.get('location');
    assert.ok(location && location.includes('https://github.com/login/oauth/authorize'));
    assert.ok(location && location.includes('client_id=test-client-id'));
    assert.ok(location && location.includes('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback'));
  });

  it('should return 500 when redirect URI is invalid', async () => {
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id';
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = 'invalid-url';

    // @ts-expect-error
    const { GET } = await import(`./route.ts?t=${Date.now()}`);
    const response = await GET();

    assert.strictEqual(response.status, 500);
    const data = await response.json();
    assert.strictEqual(data.error, 'Invalid redirect URI configuration');
  });
});
