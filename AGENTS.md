# Project architecture rules

- Register the generated app service worker only through `src/pwaRegistration.ts` so development and Lovable previews never retain stale app caches.