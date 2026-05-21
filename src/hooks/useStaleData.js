import { useState, useEffect, useCallback, useRef } from "react";

const cache = new Map(); // in-memory for instant within-session access
const STORAGE_PREFIX = "swr_cache_";

function readFromStorage(key) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return { data, ts };
  } catch {
    return null;
  }
}

function writeToStorage(key, data) {
  try {
    sessionStorage.setItem(
      STORAGE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // storage quota — not fatal
  }
}

/**
 * Stale-While-Revalidate hook.
 *
 * @param {string} cacheKey   - unique string key for this data
 * @param {Function} fetcher  - async function that returns fresh data
 * @param {object} options
 *   @param {number}  options.ttl         - ms before data is considered stale (default 60s)
 *   @param {boolean} options.skip        - don't fetch when true (e.g. missing id)
 *   @param {any}     options.deps        - extra dependency that invalidates cache when changed
 *
 * Returns { data, loading, revalidating, error, mutate }
 *   - data:         last known data (may be stale)
 *   - loading:      true only on the very first load with no cached data
 *   - revalidating: true when a background fetch is in-flight (stale data shown)
 *   - error:        fetch error (doesn't clear existing data)
 *   - mutate:       fn(newData) to update local cache immediately (optimistic)
 */
export function useStaleData(
  cacheKey,
  fetcher,
  { ttl = 60_000, skip = false, deps } = {},
) {
  const getInitial = () => {
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const stored = readFromStorage(cacheKey);
    if (stored) {
      cache.set(cacheKey, stored.data);
      return stored.data;
    }
    return null;
  };

  const [data, setData] = useState(getInitial);
  const [loading, setLoading] = useState(!getInitial() && !skip);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const revalidate = useCallback(async () => {
    if (skip) return;
    const hasCache = cache.has(cacheKey);
    if (hasCache) {
      setRevalidating(true);
    } else {
      setLoading(true);
    }

    try {
      const fresh = await fetcherRef.current();
      const stored = readFromStorage(cacheKey);
      // Only update state if data actually changed (shallow JSON compare)
      if (!stored || JSON.stringify(stored.data) !== JSON.stringify(fresh)) {
        cache.set(cacheKey, fresh);
        writeToStorage(cacheKey, fresh);
        setData(fresh);
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRevalidating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, skip, deps]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const mutate = useCallback(
    (newData) => {
      cache.set(cacheKey, newData);
      writeToStorage(cacheKey, newData);
      setData(newData);
    },
    [cacheKey],
  );

  return { data, loading, revalidating, error, mutate, revalidate };
}

/** Invalidate a cache key so next mount forces a fresh fetch */
export function invalidateCache(cacheKey) {
  cache.delete(cacheKey);
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + cacheKey);
  } catch {}
}
