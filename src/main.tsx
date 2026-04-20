import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
