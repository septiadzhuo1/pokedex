// Simple in-memory cache for Pokemon data
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const getFromCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

export const setCache = (key, value) => {
  cache.set(key, {
    value,
    expiry: Date.now() + CACHE_DURATION,
  });
};

export const clearCache = () => {
  cache.clear();
};
