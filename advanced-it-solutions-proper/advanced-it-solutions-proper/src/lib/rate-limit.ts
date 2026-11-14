interface RateRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateRecord>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}