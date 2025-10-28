import {
  getCachedItem,
  setCachedItem,
  removeCachedItem,
  clearCache,
  invalidateCache,
  preloadCache,
  getCacheStats,
} from '../storage-cache';

describe('storage-cache', () => {
  beforeEach(() => {
    // Clear localStorage and cache before each test
    localStorage.clear();
    clearCache(false);
  });

  describe('getCachedItem', () => {
    it('should return null for non-existent key', () => {
      expect(getCachedItem('nonexistent')).toBeNull();
    });

    it('should retrieve value from localStorage', () => {
      localStorage.setItem('test', JSON.stringify({ value: 123 }));
      const result = getCachedItem<{ value: number }>('test');
      expect(result).toEqual({ value: 123 });
    });

    it('should use cache on subsequent reads', () => {
      localStorage.setItem('test', JSON.stringify({ value: 123 }));

      // First read - from localStorage
      getCachedItem('test');

      // Modify localStorage directly
      localStorage.setItem('test', JSON.stringify({ value: 456 }));

      // Second read - should return cached value, not new value
      const result = getCachedItem<{ value: number }>('test');
      expect(result).toEqual({ value: 123 });
    });

    it('should handle parse errors gracefully', () => {
      localStorage.setItem('test', 'invalid json');
      const result = getCachedItem('test');
      expect(result).toBeNull();
    });
  });

  describe('setCachedItem', () => {
    it('should set value in localStorage', () => {
      const value = { test: 'data' };
      setCachedItem('test', value);

      const stored = localStorage.getItem('test');
      expect(JSON.parse(stored!)).toEqual(value);
    });

    it('should update cache', () => {
      const value = { test: 'data' };
      setCachedItem('test', value);

      // Should retrieve from cache
      const result = getCachedItem('test');
      expect(result).toEqual(value);
    });

    it('should return true on success', () => {
      expect(setCachedItem('test', { value: 123 })).toBe(true);
    });
  });

  describe('removeCachedItem', () => {
    it('should remove value from localStorage', () => {
      localStorage.setItem('test', 'value');
      removeCachedItem('test');
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should remove value from cache', () => {
      setCachedItem('test', { value: 123 });
      removeCachedItem('test');

      // Set new value in localStorage directly
      localStorage.setItem('test', JSON.stringify({ value: 456 }));

      // Should read from localStorage (not cache)
      const result = getCachedItem<{ value: number }>('test');
      expect(result).toEqual({ value: 456 });
    });
  });

  describe('clearCache', () => {
    it('should clear cache without clearing localStorage', () => {
      setCachedItem('test1', 'value1');
      setCachedItem('test2', 'value2');

      clearCache(false);

      // Cache should be empty
      expect(getCacheStats().size).toBe(0);

      // localStorage should still have values
      expect(localStorage.getItem('test1')).not.toBeNull();
      expect(localStorage.getItem('test2')).not.toBeNull();
    });

    it('should clear both cache and localStorage when clearStorage is true', () => {
      setCachedItem('test1', 'value1');
      setCachedItem('test2', 'value2');

      clearCache(true);

      expect(getCacheStats().size).toBe(0);
      expect(localStorage.getItem('test1')).toBeNull();
      expect(localStorage.getItem('test2')).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should remove specific key from cache', () => {
      setCachedItem('test', { value: 123 });
      invalidateCache('test');

      // Modify localStorage
      localStorage.setItem('test', JSON.stringify({ value: 456 }));

      // Should read new value from localStorage
      const result = getCachedItem<{ value: number }>('test');
      expect(result).toEqual({ value: 456 });
    });
  });

  describe('preloadCache', () => {
    it('should load multiple keys into cache', () => {
      localStorage.setItem('key1', JSON.stringify('value1'));
      localStorage.setItem('key2', JSON.stringify('value2'));
      localStorage.setItem('key3', JSON.stringify('value3'));

      preloadCache(['key1', 'key2', 'key3']);

      const stats = getCacheStats();
      expect(stats.size).toBe(3);
    });

    it('should skip already loaded keys', () => {
      localStorage.setItem('key1', JSON.stringify('value1'));
      getCachedItem('key1'); // Load key1

      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

      preloadCache(['key1', 'key2']);

      // Should only call getItem once for key2
      expect(getItemSpy).toHaveBeenCalledTimes(1);
      expect(getItemSpy).toHaveBeenCalledWith('key2');

      getItemSpy.mockRestore();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      setCachedItem('key1', 'value1');
      setCachedItem('key2', 'value2');

      const stats = getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.loadedKeys).toContain('key1');
      expect(stats.loadedKeys).toContain('key2');
    });

    it('should return empty stats for empty cache', () => {
      const stats = getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
      expect(stats.loadedKeys).toEqual([]);
    });
  });
});
