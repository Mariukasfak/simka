import { test } from 'node:test';
import assert from 'node:assert';
import { generateEmailHtml, escapeHtml } from '../../../app/api/submit-design/email-utils';

test('generateEmailHtml escapes malicious input', () => {
  const validatedData = {
    name: '<script>alert("XSS")</script>',
    email: 'test@example.com',
    phone: '123456789',
    size: 'M',
    quantity: 1,
    comments: '<img src=x onerror=alert(1)>'
  };

  const data = {
    product: {
      name: 'T-Shirt',
      id: 'TSHIRT-001'
    },
    printAreas: ['front', '<svg/onload=alert(1)>'],
    totalPrice: 19.99
  };

  const html = generateEmailHtml(validatedData, data);

  // Check name escaping
  assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'), 'Name should be escaped');
  assert.ok(!html.includes('<script>'), 'Raw script tag should not be present');

  // Check comments escaping
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'Comments should be escaped');
  assert.ok(!html.includes('<img'), 'Raw img tag should not be present');

  // Check printAreas escaping
  assert.ok(html.includes('&lt;svg/onload=alert(1)&gt;'), 'Custom print area should be escaped');
  assert.ok(!html.includes('<svg'), 'Raw svg tag should not be present');
});

test('generateEmailHtml handles safe input correctly', () => {
  const validatedData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    size: 'L',
    quantity: 2,
    comments: 'Hello World'
  };

  const data = {
    product: {
      name: 'Hoodie',
      id: 'H-001'
    },
    printAreas: ['front', 'back'],
    totalPrice: 49.99
  };

  const html = generateEmailHtml(validatedData, data);

  assert.ok(html.includes('John Doe'));
  assert.ok(html.includes('Priekis'));
  assert.ok(html.includes('Nugara'));
});

test('escapeHtml handles non-string inputs', () => {
  assert.strictEqual(escapeHtml(123), '123');
  assert.strictEqual(escapeHtml(null), '');
  assert.strictEqual(escapeHtml(undefined), '');
  assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
});
