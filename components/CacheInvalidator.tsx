import { useEffect } from 'react';
import { useCacheManager, CACHE_KEYS } from '@/hooks/use-cache-manager';

interface CacheInvalidatorProps {
  clerkUserId?: string;
  trigger?: boolean;
  onInvalidated?: () => void;
}

export function CacheInvalidator({ 
  clerkUserId, 
  trigger = false, 
  onInvalidated 
}: CacheInvalidatorProps) {
  const { invalidateCache, invalidateRelatedCaches } = useCacheManager();

  useEffect(() => {
    if (trigger && clerkUserId) {
      // Invalidate all related caches when new data is available
      invalidateCache(CACHE_KEYS.LIVING_ESSAY);
      invalidateCache(CACHE_KEYS.TIDBITS(clerkUserId));
      invalidateCache(CACHE_KEYS.VOICE_CHAT_DATA(clerkUserId));
      
      // Also invalidate any other caches that might be related
      invalidateRelatedCaches(clerkUserId);
      
      onInvalidated?.();
    }
  }, [trigger, clerkUserId, invalidateCache, invalidateRelatedCaches, onInvalidated]);

  // This component doesn't render anything
  return null;
}

// Hook for easy cache invalidation
export function useCacheInvalidation(clerkUserId?: string) {
  const { invalidateCache, invalidateRelatedCaches } = useCacheManager();

  const invalidateAllUserCaches = () => {
    if (!clerkUserId) return;
    
    invalidateCache(CACHE_KEYS.LIVING_ESSAY);
    invalidateCache(CACHE_KEYS.TIDBITS(clerkUserId));
    invalidateCache(CACHE_KEYS.VOICE_CHAT_DATA(clerkUserId));
    invalidateCache(CACHE_KEYS.USER_DATA(clerkUserId));
  };

  const invalidateLivingEssay = () => {
    invalidateCache(CACHE_KEYS.LIVING_ESSAY);
  };

  const invalidateTidbits = () => {
    if (clerkUserId) {
      invalidateCache(CACHE_KEYS.TIDBITS(clerkUserId));
    }
  };

  const invalidateVoiceChatData = () => {
    if (clerkUserId) {
      invalidateCache(CACHE_KEYS.VOICE_CHAT_DATA(clerkUserId));
    }
  };

  return {
    invalidateAllUserCaches,
    invalidateLivingEssay,
    invalidateTidbits,
    invalidateVoiceChatData,
  };
} 