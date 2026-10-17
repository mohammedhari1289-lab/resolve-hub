// Simple in-memory login throttle (per email). Use Redis/Upstash for multi-instance deployments.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function isLimited(key: string) {
  const e = attempts.get(key);
  if (!e) return false;
  if (e.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return e.count >= MAX;
}

export function recordFailure(key: string) {
  const e = attempts.get(key);
  if (!e || e.resetAt < Date.now()) attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else e.count += 1;
}

export function clearFailures(key: string) {
  attempts.delete(key);
}
