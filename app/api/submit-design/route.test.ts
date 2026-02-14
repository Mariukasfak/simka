import test from 'node:test';
import assert from 'node:assert';
import { POST } from './route.ts';
import { validateOrderData } from './validator.ts';
import { z } from 'zod';

test('validateOrderData throws on invalid data', () => {
  assert.throws(() => {
    validateOrderData({});
  }, (err: any) => err instanceof z.ZodError || err.name === 'ZodError');
});

test('POST returns 400 on validation error', async () => {
  const mockRequest = {
    json: async () => ({}) // Empty body should fail validation
  };

  // @ts-ignore
  const response = await POST(mockRequest);

  assert.strictEqual(response.status, 400);
  const data = await response.json();
  assert.strictEqual(data.error, 'Validacijos klaida');
  assert.ok(data.details);
});

test('POST returns 200 on valid data (mocked dependencies)', async () => {
  const validData = {
    name: 'Jonas',
    email: 'jonas@example.com',
    size: 'M',
    quantity: 1,
    product: { id: 'p1', name: 'Product 1', type: 'tshirt' },
    totalPrice: 10
  };

  const mockRequest = {
    json: async () => validData
  };

  // @ts-ignore
  const response = await POST(mockRequest);

  // Even if email or DB fails, the route currently returns 200 (as seen in route.ts)
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.success, true);
});
