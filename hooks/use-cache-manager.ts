import { useCallback } from 'react';

// Global cache store for managing cache invalidation
const cacheStore = new Map<string, () => void>();

export function useCacheManager() {
  const registerCache = useCallback((key: string, invalidateFn: () => void) => {
    cacheStore.set(key, invalidateFn);
  }, []);

  const unregisterCache = useCallback((key: string) => {
    cacheStore.delete(key);
  }, []);

  const invalidateCache = useCallback((key: string) => {
    const invalidateFn = cacheStore.get(key);
    if (invalidateFn) {
      invalidateFn();
    }
  }, []);

  const invalidateAllCaches = useCallback(() => {
    cacheStore.forEach((invalidateFn) => {
      invalidateFn();
    });
  }, []);

  const invalidateRelatedCaches = useCallback((pattern: string) => {
    cacheStore.forEach((invalidateFn, key) => {
      if (key.includes(pattern)) {
        invalidateFn();
      }
    });
  }, []);

  return {
    registerCache,
    unregisterCache,
    invalidateCache,
    invalidateAllCaches,
    invalidateRelatedCaches,
  };
}

// Predefined cache keys for easy invalidation
export const CACHE_KEYS = {
  LIVING_ESSAY: 'living-essay',
  TIDBITS: (clerkUserId: string) => `tidbits-${clerkUserId}`,
  VOICE_CHAT_DATA: (clerkUserId: string) => `voice-chat-data-${clerkUserId}`,
  USER_DATA: (clerkUserId: string) => `user-data-${clerkUserId}`,
} as const; 