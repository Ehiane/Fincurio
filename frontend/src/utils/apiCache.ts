/**
 * Simple in-memory cache for API responses.
 * Avoids redundant network calls when navigating between pages.
 * Data expires after TTL (default 5 minutes) or can be invalidated manually.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(...prefixes: string[]): void {
  if (prefixes.length === 0) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (prefixes.some(p => key.startsWith(p))) {
      cache.delete(key);
    }
  }
}
