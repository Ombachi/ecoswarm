/**
 * Periodic Background Sync handler for Workbox-generated SW.
 * This file is imported via importScripts in the Workbox config.
 *
 * Registered tags:
 *   sync-feed     — refreshes cached Agora posts every 12h
 *   sync-products — refreshes cached marketplace products every 6h
 */

/* global self, caches, fetch */

const SUPABASE_URL_PATTERN = /supabase\.co\/rest\/v1/;
const API_CACHE = 'supabase-api-cache';

async function refreshCache(urlSubstring) {
  try {
    const cache = await caches.open(API_CACHE);
    const keys = await cache.keys();
    const targets = keys.filter((req) => req.url.includes(urlSubstring));

    await Promise.all(
      targets.map(async (request) => {
        try {
          const response = await fetch(request, { cache: 'no-cache' });
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch {
          // Network unavailable — keep stale cache entry
        }
      })
    );
  } catch {
    // Cache API error — non-critical
  }
}

// Add jitter so 10K clients don't stampede the API at the same minute.
function jitter(maxMs) {
  return new Promise((r) => setTimeout(r, Math.floor(Math.random() * maxMs)));
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-feed') {
    // Up to 10 minutes of jitter — spreads load over a window instead of a spike.
    event.waitUntil(jitter(10 * 60 * 1000).then(() => refreshCache('posts')));
  } else if (event.tag === 'sync-products') {
    event.waitUntil(jitter(10 * 60 * 1000).then(() => refreshCache('products')));
  }
});
