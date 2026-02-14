type RateLimitContext = {
  count: number;
  lastReset: number;
};

const rateLimitMap = new Map<string, RateLimitContext>();

/**
 * Basic in-memory rate limiter.
 * @param ip The IP address to rate limit.
 * @param limit The maximum number of requests allowed within the window.
 * @param windowMs The duration of the window in milliseconds.
 * @returns true if the request is allowed, false if limit exceeded.
 */
export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();

  // Cleanup if map gets too large to prevent memory leaks
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  const context = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - context.lastReset > windowMs) {
    context.count = 0;
    context.lastReset = now;
  }

  if (context.count >= limit) {
    return false;
  }

  context.count += 1;
  rateLimitMap.set(ip, context);
  return true;
}
