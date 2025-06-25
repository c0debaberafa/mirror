# Caching System

This application implements a sophisticated caching system to improve performance and user experience when switching between tabs and loading data.

## Overview

The caching system provides:
- **Stale-while-revalidate**: Shows cached data immediately while fetching fresh data in the background
- **Automatic cache invalidation**: Clears caches when new data is available
- **Configurable TTL**: Different cache durations for different types of data
- **Smooth tab switching**: Instant data display when switching between Voice Chat and Living Essay tabs

## How It Works

### 1. Cached Data Hooks

The system uses specialized hooks for different data types:

```typescript
// Living Essay data (2 minute TTL)
const { data, isLoading, error, refresh } = useCachedLivingEssay();

// User tidbits (3 minute TTL)
const { data: tidbits, isLoading } = useCachedTidbits(clerkUserId);

// Voice chat data (5 minute TTL)
const { data: userData } = useCachedVoiceChatData(clerkUserId);

// User data (10 minute TTL)
const { data: user } = useCachedUserData(clerkUserId);
```

### 2. Cache Manager

The cache manager provides centralized cache invalidation:

```typescript
const { invalidateCache, invalidateAllCaches } = useCacheManager();

// Invalidate specific cache
invalidateCache('living-essay');

// Invalidate all caches
invalidateAllCaches();
```

### 3. Cache Invalidator Component

Automatically invalidates related caches when new data is available:

```typescript
<CacheInvalidator 
  clerkUserId={clerkUserId}
  trigger={shouldInvalidateCache}
  onInvalidated={() => console.log('Caches invalidated')}
/>
```

## Cache Configuration

Each data type has optimized cache settings:

| Data Type | TTL | Stale While Revalidate | Use Case |
|-----------|-----|------------------------|----------|
| Living Essay | 2 minutes | 30 seconds | Frequently updated content |
| Tidbits | 3 minutes | 30 seconds | User insights |
| Voice Chat Data | 5 minutes | 30 seconds | Conversation history |
| User Data | 10 minutes | 30 seconds | Profile information |

## Usage Examples

### Basic Usage

```typescript
import { useCachedLivingEssay } from '@/hooks/use-cached-data';

function MyComponent() {
  const { data, isLoading, error, refresh } = useCachedLivingEssay();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Render data */}</div>;
}
```

### Manual Cache Invalidation

```typescript
import { useCacheInvalidation } from '@/components/CacheInvalidator';

function MyComponent({ clerkUserId }) {
  const { invalidateAllUserCaches, invalidateLivingEssay } = useCacheInvalidation(clerkUserId);
  
  const handleNewData = () => {
    // Invalidate all caches when new data is available
    invalidateAllUserCaches();
  };
  
  const handleEssayUpdate = () => {
    // Invalidate only living essay cache
    invalidateLivingEssay();
  };
}
```

### Automatic Cache Invalidation

```typescript
// In VoiceChat component
vapiInstance.on('call-end', () => {
  // Trigger cache invalidation when call ends
  if (onCallEnded) {
    onCallEnded();
  }
});

// In main page
const handleCallEnded = () => {
  setShouldInvalidateCache(true);
  setTimeout(() => setShouldInvalidateCache(false), 100);
};
```

## Benefits

1. **Instant Tab Switching**: Users see data immediately when switching between tabs
2. **Background Updates**: Fresh data is fetched in the background while showing cached data
3. **Reduced API Calls**: Prevents unnecessary API calls for recently fetched data
4. **Better UX**: No loading spinners for cached data
5. **Automatic Sync**: Caches are automatically invalidated when new data is available

## Cache Keys

The system uses predictable cache keys for easy management:

- `living-essay` - Living essay data
- `tidbits-{clerkUserId}` - User tidbits
- `voice-chat-data-{clerkUserId}` - Voice chat data
- `user-data-{clerkUserId}` - User profile data

## Best Practices

1. **Use appropriate TTL**: Set shorter TTL for frequently changing data
2. **Invalidate related caches**: When one cache is updated, invalidate related caches
3. **Handle loading states**: Always show loading states for initial data fetch
4. **Error handling**: Provide fallbacks when cache or API calls fail
5. **Background refresh**: Use stale-while-revalidate for seamless updates

## Troubleshooting

### Cache not updating
- Check if the cache key is correct
- Verify the cache invalidation is being triggered
- Ensure the TTL hasn't expired

### Performance issues
- Reduce TTL for frequently changing data
- Use more specific cache keys
- Implement cache size limits if needed

### Memory leaks
- Ensure cache cleanup on component unmount
- Monitor cache store size
- Implement cache eviction policies if needed 