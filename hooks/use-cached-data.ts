import { useState, useEffect, useCallback, useRef } from 'react';
import { useCacheManager } from './use-cache-manager';

interface CachedData<T> {
  data: T | null;
  timestamp: number;
  isLoading: boolean;
  error: string | null;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: number; // How long to show stale data while refreshing
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 30 * 1000, // 30 seconds
};

export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: Partial<CacheConfig> = {}
) {
  const [cache, setCache] = useState<CachedData<T>>({
    data: null,
    timestamp: 0,
    isLoading: false,
    error: null,
  });

  const { registerCache, unregisterCache } = useCacheManager();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const previousKeyRef = useRef<string>(key);

  const isStale = useCallback(() => {
    return Date.now() - cache.timestamp > finalConfig.ttl;
  }, [cache.timestamp, finalConfig.ttl]);

  const isStaleWhileRevalidate = useCallback(() => {
    return Date.now() - cache.timestamp > finalConfig.staleWhileRevalidate;
  }, [cache.timestamp, finalConfig.staleWhileRevalidate]);

  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: 0,
      isLoading: false,
      error: null,
    });
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // If we have fresh data and not forcing refresh, return early
    if (!forceRefresh && cache.data && !isStale()) {
      return cache.data;
    }

    // If we have stale data but within revalidate window, show stale data while fetching
    const shouldShowStale = cache.data && !isStaleWhileRevalidate() && !forceRefresh;

    if (!shouldShowStale) {
      setCache(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const data = await fetchFn();
      setCache({
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setCache(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [cache.data, fetchFn, isStale, isStaleWhileRevalidate, key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Register cache with the cache manager
  useEffect(() => {
    registerCache(key, clearCache);
    return () => {
      unregisterCache(key);
    };
  }, [key, registerCache, unregisterCache, clearCache]);

  // Initial data fetch when component mounts and no cached data exists
  useEffect(() => {
    if (!cache.data && !cache.isLoading && !cache.error) {
      fetchData();
    }
  }, [key, cache.data, cache.isLoading, cache.error, fetchData]);

  // Auto-refresh stale data when component mounts or key changes
  useEffect(() => {
    if (cache.data && isStale()) {
      fetchData();
    }
  }, [key, cache.data, isStale, fetchData]);

  // Force refetch when key changes (e.g., from 'anonymous' to actual user ID)
  useEffect(() => {
    if (previousKeyRef.current !== key) {
      clearCache();
      previousKeyRef.current = key;
    }
  }, [key, clearCache]);

  return {
    data: cache.data,
    isLoading: cache.isLoading,
    error: cache.error,
    isStale: isStale(),
    fetch: fetchData,
    refresh,
    clearCache,
  };
}

// Specialized hooks for different data types
export function useCachedLivingEssay() {
  return useCachedData(
    'living-essay',
    async () => {
      const response = await fetch('/api/living-essay');
      if (!response.ok) {
        throw new Error('Failed to fetch living essay data');
      }
      return response.json();
    },
    { ttl: 2 * 60 * 1000 } // 2 minutes for living essay
  );
}

export function useCachedTidbits(clerkUserId: string | undefined) {
  return useCachedData(
    `tidbits-${clerkUserId || 'anonymous'}`,
    async () => {
      if (!clerkUserId) {
        // Return empty array if no clerkUserId yet
        return [];
      }
      const response = await fetch(`/api/users/${clerkUserId}/tidbits`);
      if (!response.ok) {
        throw new Error('Failed to fetch tidbits');
      }
      return response.json();
    },
    { ttl: 3 * 60 * 1000 } // 3 minutes for tidbits
  );
}

export function useCachedVoiceChatData(clerkUserId: string | undefined) {
  return useCachedData(
    `voice-chat-data-${clerkUserId || 'anonymous'}`,
    async () => {
      if (!clerkUserId) {
        // Return default data if no clerkUserId yet
        return {
          firstName: null,
          lastName: null,
          onboardingArchetypes: 'No onboarding data available.',
          callSummaries: []
        };
      }
      const response = await fetch(`/api/users/${clerkUserId}/voice-chat-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch voice chat data');
      }
      return response.json();
    },
    { ttl: 5 * 60 * 1000 } // 5 minutes for voice chat data
  );
}

export function useCachedUserData(clerkUserId: string | undefined) {
  return useCachedData(
    `user-data-${clerkUserId || 'anonymous'}`,
    async () => {
      if (!clerkUserId) {
        // Return null if no clerkUserId yet
        return null;
      }
      const response = await fetch(`/api/users/${clerkUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes for user data
  );
} 