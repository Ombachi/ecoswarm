/**
 * Offline database utilities using idb-keyval for IndexedDB operations.
 * Handles offline queue for failed API calls and post caching.
 */
import { get, set, del, keys, createStore } from 'idb-keyval';

// Separate stores for different data types
const queueStore = createStore('ecoswarm-queue', 'offline-queue');
const cacheStore = createStore('ecoswarm-cache', 'offline-cache');

// ─── Offline Queue (Background Sync) ────────────────────────────
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

export async function addToQueue(request: QueuedRequest): Promise<void> {
  await set(request.id, request, queueStore);
}

export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  const allKeys = await keys(queueStore);
  const items: QueuedRequest[] = [];
  for (const key of allKeys) {
    const item = await get<QueuedRequest>(key, queueStore);
    if (item) items.push(item);
  }
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

export async function removeFromQueue(id: string): Promise<void> {
  await del(id, queueStore);
}

// ─── Post Cache (Offline Reading) ────────────────────────────────
export interface CachedPost {
  id: string;
  user_name: string;
  content: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  created_at?: string;
  media_url?: string;
  media_type?: string;
}

export async function cachePosts(posts: CachedPost[]): Promise<void> {
  await set('cached-posts', posts, cacheStore);
  await set('cached-posts-timestamp', Date.now(), cacheStore);
}

export async function getCachedPosts(): Promise<CachedPost[]> {
  return (await get<CachedPost[]>('cached-posts', cacheStore)) || [];
}

export async function getCacheTimestamp(): Promise<number> {
  return (await get<number>('cached-posts-timestamp', cacheStore)) || 0;
}

export async function clearCache(): Promise<void> {
  await del('cached-posts', cacheStore);
  await del('cached-posts-timestamp', cacheStore);
}

// ─── Product Cache (Offline Browsing) ────────────────────────────
export interface CachedProduct {
  id: string;
  org_name: string;
  product_name: string;
  category: string;
  description: string;
  price: number;
  media_url?: string;
  badges?: string[];
}

export async function cacheProducts(products: CachedProduct[]): Promise<void> {
  await set('cached-products', products, cacheStore);
  await set('cached-products-timestamp', Date.now(), cacheStore);
}

export async function getCachedProducts(): Promise<CachedProduct[]> {
  return (await get<CachedProduct[]>('cached-products', cacheStore)) || [];
}

export async function getCachedProductsTimestamp(): Promise<number> {
  return (await get<number>('cached-products-timestamp', cacheStore)) || 0;
}
