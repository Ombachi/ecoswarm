/**
 * App Badging API: Shows unread notification count on the app icon.
 */
import { useEffect } from 'react';

export function useAppBadge(count: number) {
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;

    try {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    } catch {
      // Badging API not supported or not installed as PWA
    }
  }, [count]);
}
