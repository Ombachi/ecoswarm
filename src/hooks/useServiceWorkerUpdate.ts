/**
 * Service Worker Update: Detects new versions, shows prompt, and
 * periodically checks for updates (every 60s on focus).
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useServiceWorkerUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Skip the update poller entirely in preview/iframe contexts —
    // there's no production SW to update and reloads here are disruptive.
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const isPreviewHost =
      window.location.hostname.includes('id-preview--') ||
      window.location.hostname.includes('lovableproject.com') ||
      window.location.hostname.includes('lovable.app');
    if (isPreviewHost || isInIframe) return;

    let refreshing = false;

    const checkForWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }
    };

    const listenForInstalling = (reg: ServiceWorkerRegistration) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    };

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        registrationRef.current = reg;
        checkForWaiting(reg);
        listenForInstalling(reg);
        // Immediate update check on load so a freshly-published SW is
        // detected within seconds instead of waiting for the 60s poll.
        reg.update().catch(() => {});
      } catch {
        // SW not available
      }
    };

    init();

    // Extra safety net: check again shortly after load in case the SW
    // wasn't fully ready on the first call (e.g. cold start).
    const initialKickTimeout = setTimeout(() => {
      registrationRef.current?.update().catch(() => {});
    }, 1500);

    // Auto-reload when new SW takes over — at most once per 30s per session
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      try {
        const last = Number(sessionStorage.getItem('ecoswarm-sw-reload-at') || 0);
        if (Date.now() - last < 30_000) return;
        sessionStorage.setItem('ecoswarm-sw-reload-at', String(Date.now()));
      } catch { /* ignore */ }
      refreshing = true;
      window.location.reload();
    });

    // Periodically check for updates (every 60s when page is visible)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && registrationRef.current) {
        registrationRef.current.update().catch(() => {});
      }
    }, 60_000);

    // Also check on visibility change (user returns to app)
    const onVisChange = () => {
      if (document.visibilityState === 'visible' && registrationRef.current) {
        registrationRef.current.update().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisChange);
      clearTimeout(initialKickTimeout);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [waitingWorker]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return { updateAvailable, applyUpdate, dismissUpdate };
}
