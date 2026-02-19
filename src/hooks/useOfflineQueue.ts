/**
 * Background Sync: Queues failed API calls and retries when back online.
 */
import { useState, useEffect, useCallback } from 'react';
import { addToQueue, getQueuedRequests, removeFromQueue, type QueuedRequest } from '@/lib/offlineDb';
import { toast } from 'sonner';

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  // Track online status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Retry queued requests when back online
  useEffect(() => {
    if (!isOnline) return;
    processQueue();
  }, [isOnline]);

  // Load pending count on mount
  useEffect(() => {
    getQueuedRequests().then(q => setPendingCount(q.length));
  }, []);

  const processQueue = async () => {
    const queued = await getQueuedRequests();
    if (queued.length === 0) return;

    let successCount = 0;
    for (const req of queued) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
        if (response.ok || response.status < 500) {
          await removeFromQueue(req.id);
          successCount++;
        } else if (req.retries >= 3) {
          await removeFromQueue(req.id);
        }
      } catch {
        // Still offline or network error, keep in queue
      }
    }

    const remaining = await getQueuedRequests();
    setPendingCount(remaining.length);

    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline action${successCount > 1 ? 's' : ''} ✅`);
    }
  };

  const queueRequest = useCallback(async (
    url: string,
    method: string,
    body?: unknown,
    headers?: Record<string, string>
  ) => {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json', ...headers },
      timestamp: Date.now(),
      retries: 0,
    };
    await addToQueue(request);
    setPendingCount(prev => prev + 1);
    toast.info('You\'re offline. Action saved and will sync when reconnected 📡');
  }, []);

  return { isOnline, pendingCount, queueRequest, processQueue };
}
