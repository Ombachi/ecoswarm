import { useEffect } from 'react';

/**
 * Triggers a callback when the page becomes visible again (e.g. switching back
 * to the PWA tab or re-opening the installed app).
 */
export function useVisibilityRefetch(callback: () => void) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        callback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [callback]);
}
