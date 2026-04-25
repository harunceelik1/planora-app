// Lightweight rate limiter with Upstash fallback.
import type { Ratelimit as UpstashRatelimit } from "@upstash/ratelimit";

const inMemoryMap = new Map<string, { count: number; reset: number }>();

async function tryUpstashLimit(key: string, points: number, windowMs: number) {
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    const redis = new (Redis as any)({ url, token });
    const rl = new (Ratelimit as any)({ redis, limiter: (Ratelimit as any).fixedWindow(points, Math.floor(windowMs / 1000)) });
    const res = await (rl as any).limit(key);
    // res has properties depending on lib; normalize best-effort
    return { limited: res.success === false, remaining: res.remaining ?? 0, reset: Date.now() + (res.reset ?? windowMs) };
  } catch (e) {
    return null;
  }
}

export async function checkRateLimit(key: string, points: number, windowMs: number) {
  // Try Upstash first
  const up = await tryUpstashLimit(key, points, windowMs);
  if (up) return up;

  // Fallback to in-memory
  const now = Date.now();
  const entry = inMemoryMap.get(key);
  if (!entry || now > entry.reset) {
    inMemoryMap.set(key, { count: 1, reset: now + windowMs });
    return { limited: false, remaining: points - 1, reset: now + windowMs };
  }
  if (entry.count >= points) {
    return { limited: true, remaining: 0, reset: entry.reset };
  }
  entry.count += 1;
  return { limited: false, remaining: points - entry.count, reset: entry.reset };
}

export default { checkRateLimit };
