
import { test } from 'node:test';
import assert from 'node:assert';
import { NextResponse } from 'next/server';

// Helper to load module with fresh environment
const loadModule = async () => {
  // Use a query parameter to bust the cache
  const modulePath = `./route.ts?update=${Date.now()}`;
  return import(modulePath);
};

test('GitHub Auth API Route', async (t) => {
  const originalClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const originalRedirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

  // Restore environment after each test
  t.afterEach(() => {
    if (originalClientId !== undefined) {
      process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = originalClientId;
    } else {
      delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    }

    if (originalRedirectUri !== undefined) {
      process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = originalRedirectUri;
    } else {
      delete process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;
    }
  });

  await t.test('returns 500 when REDIRECT_URI is invalid', async () => {
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id';
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = 'not-a-url';

    const { GET } = await loadModule();
    const response = await GET();

    assert.strictEqual(response.status, 500);
    const data = await response.json();
    assert.deepStrictEqual(data, { error: 'Invalid redirect URI configuration' });
  });

  await t.test('returns 500 when configuration is missing', async () => {
    delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = 'https://example.com/callback';

    const { GET } = await loadModule();
    const response = await GET();

    assert.strictEqual(response.status, 500);
    const data = await response.json();
    assert.deepStrictEqual(data, { error: 'Missing GitHub configuration' });
  });

  await t.test('redirects to GitHub when configuration is valid', async () => {
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'test-client-id';
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI = 'https://example.com/callback';

    const { GET } = await loadModule();
    const response = await GET();

    // NextResponse.redirect returns 307 by default
    assert.strictEqual(response.status, 307);

    const location = response.headers.get('location');
    assert.ok(location?.startsWith('https://github.com/login/oauth/authorize'));

    const url = new URL(location!);
    assert.strictEqual(url.searchParams.get('client_id'), 'test-client-id');
    assert.strictEqual(url.searchParams.get('redirect_uri'), 'https://example.com/callback');
    assert.strictEqual(url.searchParams.get('scope'), 'read:user user:email');
  });
});
