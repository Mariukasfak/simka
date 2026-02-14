import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock nodemailer
const sendMailMock = mock.fn(async () => ({ messageId: 'test-id' }));
const createTransportMock = mock.fn(() => ({
  sendMail: sendMailMock,
}));

mock.module('nodemailer', {
  defaultExport: {
    createTransport: createTransportMock,
  },
});

describe('sendEmail', () => {
  let sendEmail: any;
  const originalEnv = process.env;

  // Create spies for console methods
  const consoleLogMock = mock.method(console, 'log');
  const consoleErrorMock = mock.method(console, 'error');

  beforeEach(async () => {
    // Dynamic import to ensure mock is applied
    const module = await import('./email.ts');
    sendEmail = module.sendEmail;

    process.env = { ...originalEnv };
    sendMailMock.mock.resetCalls();
    createTransportMock.mock.resetCalls();
    consoleLogMock.mock.resetCalls();
    consoleErrorMock.mock.resetCalls();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should send email successfully with valid configuration', async () => {
    process.env.EMAIL_SERVER = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user@test.com';
    process.env.EMAIL_PASSWORD = 'password';
    process.env.EMAIL_FROM = 'from@test.com';

    await sendEmail({
      to: 'recipient@test.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
    });

    assert.strictEqual(createTransportMock.mock.callCount(), 1);
    assert.strictEqual(sendMailMock.mock.callCount(), 1);

    const sendMailArgs = sendMailMock.mock.calls[0].arguments[0];
    assert.strictEqual(sendMailArgs.to, 'recipient@test.com');
    assert.strictEqual(sendMailArgs.subject, 'Test Subject');

    // Verify no sensitive info logged
    const logs = consoleLogMock.mock.calls.map(c => c.arguments[0]);
    assert.ok(logs.some(msg => msg.includes('Email sent successfully')), 'Should log success message');
    assert.ok(!logs.some(msg => typeof msg === 'string' && msg.includes('recipient@test.com')), 'Should not log recipient email');
  });

  it('should fail gracefully if configuration is missing', async () => {
    delete process.env.EMAIL_SERVER;

    await sendEmail({
      to: 'recipient@test.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
    });

    assert.strictEqual(createTransportMock.mock.callCount(), 0);
    assert.strictEqual(sendMailMock.mock.callCount(), 0);

    const errors = consoleErrorMock.mock.calls.map(c => c.arguments[0]);
    assert.ok(errors.some(msg => msg.includes('Missing email configuration')), 'Should log missing config error');
  });
});
