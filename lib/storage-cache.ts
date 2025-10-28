/**
 * Storage cache manager for optimizing localStorage reads
 * Reduces the number of expensive localStorage.getItem() calls by caching values in memory
 */

/**
 * In-memory cache for localStorage values
 * Maps storage keys to their parsed values
 */
const cache = new Map<string, unknown>();

/**
 * Tracks which keys have been loaded from localStorage
 */
const loadedKeys = new Set<string>();

/**
 * Retrieves a value from localStorage with caching
 * First checks the in-memory cache before reading from localStorage
 *
 * @param key - The localStorage key to retrieve
 * @returns The parsed value from storage, or null if not found
 *
 * @example
 * const entries = getCachedItem<MoodEntry[]>('moodEntries');
 */
export function getCachedItem<T>(key: string): T | null {
  // Check cache first
  if (loadedKeys.has(key)) {
    return (cache.get(key) as T) || null;
  }

  // Load from localStorage if not in cache
  try {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      const parsed = JSON.parse(item) as T;
      cache.set(key, parsed);
      loadedKeys.add(key);
      return parsed;
    }
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}"`, error);
  }

  loadedKeys.add(key);
  return null;
}

/**
 * Sets a value in localStorage and updates the cache
 *
 * @param key - The localStorage key to set
 * @param value - The value to store
 * @returns true if successful, false otherwise
 *
 * @example
 * setCachedItem('moodEntries', entries);
 */
export function setCachedItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    cache.set(key, value);
    loadedKeys.add(key);
    return true;
  } catch (error) {
    // Handle quota exceeded errors
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.error(
        `localStorage quota exceeded for key "${key}". ` +
          'Consider clearing old data or exporting to free up space.'
      );
    } else {
      console.warn(`Failed to write localStorage key "${key}"`, error);
    }
    return false;
  }
}

/**
 * Removes a value from localStorage and the cache
 *
 * @param key - The localStorage key to remove
 *
 * @example
 * removeCachedItem('moodEntries');
 */
export function removeCachedItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
    cache.delete(key);
    loadedKeys.delete(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage key "${key}"`, error);
  }
}

/**
 * Clears the entire cache and optionally localStorage
 *
 * @param clearStorage - If true, also clears localStorage (default: false)
 *
 * @example
 * clearCache() // Clears only the cache
 * clearCache(true) // Clears both cache and localStorage
 */
export function clearCache(clearStorage = false): void {
  cache.clear();
  loadedKeys.clear();

  if (clearStorage) {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  }
}

/**
 * Invalidates a specific cache entry, forcing it to be reloaded from storage
 *
 * @param key - The localStorage key to invalidate
 *
 * @example
 * invalidateCache('moodEntries');
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
  loadedKeys.delete(key);
}

/**
 * Preloads multiple keys into the cache for faster access
 * Useful for loading commonly used data on app initialization
 *
 * @param keys - Array of localStorage keys to preload
 *
 * @example
 * preloadCache(['moodEntries', 'journalEntries', 'breathSessions']);
 */
export function preloadCache(keys: string[]): void {
  keys.forEach((key) => {
    if (!loadedKeys.has(key)) {
      getCachedItem(key);
    }
  });
}

/**
 * Gets the current cache statistics
 * Useful for debugging and monitoring cache performance
 *
 * @returns Object containing cache statistics
 *
 * @example
 * const stats = getCacheStats();
 * console.log(`Cache has ${stats.size} items`);
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    loadedKeys: Array.from(loadedKeys),
  };
}
