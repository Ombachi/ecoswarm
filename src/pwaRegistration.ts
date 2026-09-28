import { registerSW } from "virtual:pwa-register";

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const hostname = window.location.hostname;
const isPreviewHost =
  hostname.startsWith("id-preview--") ||
  hostname.startsWith("preview--") ||
  hostname === "lovableproject.com" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname === "lovableproject-dev.com" ||
  hostname.endsWith(".lovableproject-dev.com") ||
  hostname === "beta.lovable.dev" ||
  hostname.endsWith(".beta.lovable.dev");

const shouldDisableServiceWorker =
  !import.meta.env.PROD ||
  isInIframe ||
  isPreviewHost ||
  new URLSearchParams(window.location.search).get("sw") === "off";

async function unregisterAppWorker() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => new URL(registration.scope).origin === window.location.origin)
      .map((registration) => registration.unregister()),
  );
}

export function registerEcoSwarmServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (shouldDisableServiceWorker) {
    void unregisterAppWorker();
    return;
  }

  registerSW({ immediate: true });
}