import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// No client-side domain redirects: the app always loads from the origin that
// hosts the current build, so dynamic imports never cross origins.

// Auto-recover from stale chunks after a deployment (one reload per session window).
const RELOAD_KEY = "ecoswarm-chunk-reload-at";
export function reloadForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch { /* ignore */ }
  window.location.reload();
  return true;
}
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForStaleChunk();
});

createRoot(document.getElementById("root")!).render(<App />);

// Guard: unregister SWs in iframe/preview contexts to prevent stale content
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  // Unregister any active SWs AND purge their caches so the preview
  // never serves stale HTML/JS from a previous session.
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((k) => caches.delete(k));
    });
  }
} else if ('serviceWorker' in navigator) {
  // Register periodicSync to keep cached posts/products fresh in the background
  navigator.serviceWorker.ready.then(async (registration) => {
    if ('periodicSync' in registration) {
      try {
        const status = await navigator.permissions.query({
          // @ts-ignore — periodicSync not yet in default TS lib
          name: 'periodic-background-sync',
        });
        if (status.state === 'granted') {
          // Sync feed content every 12 hours
          await (registration as any).periodicSync.register('sync-feed', {
            minInterval: 12 * 60 * 60 * 1000,
          });
          // Sync marketplace products every 6 hours
          await (registration as any).periodicSync.register('sync-products', {
            minInterval: 6 * 60 * 60 * 1000,
          });
        }
      } catch {
        // periodicSync not supported or permission denied — silent fallback
      }
    }
  });
}
// SW registration is handled by vite-plugin-pwa (registerType: "prompt")
