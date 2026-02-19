/**
 * Persistent offline data: Caches recent posts in IndexedDB for offline reading.
 */
import { useEffect, useCallback } from 'react';
import { cachePosts, getCachedPosts, getCacheTimestamp, type CachedPost } from '@/lib/offlineDb';

const CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

export function useOfflineCache() {
  const savePostsToCache = useCallback(async (posts: CachedPost[]) => {
    try {
      // Cache the 50 most recent posts
      const toCache = posts.slice(0, 50).map(p => ({
        id: p.id,
        user_name: p.user_name,
        content: p.content,
        tags: p.tags,
        likes: p.likes,
        comments: p.comments,
        created_at: p.created_at,
        media_url: p.media_url,
        media_type: p.media_type,
      }));
      await cachePosts(toCache);
    } catch {
      // IndexedDB not available
    }
  }, []);

  const loadCachedPosts = useCallback(async (): Promise<CachedPost[] | null> => {
    try {
      const timestamp = await getCacheTimestamp();
      if (Date.now() - timestamp > CACHE_MAX_AGE_MS) return null;
      const posts = await getCachedPosts();
      return posts.length > 0 ? posts : null;
    } catch {
      return null;
    }
  }, []);

  return { savePostsToCache, loadCachedPosts };
}
