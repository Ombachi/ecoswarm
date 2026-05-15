import { useEffect } from 'react';

const SITE_ORIGIN = 'https://ecoswarm.co.ke';

type MetaEl = HTMLMetaElement | HTMLLinkElement;

function upsert(selector: string, create: () => MetaEl, setValue: (el: MetaEl) => void) {
  let el = document.head.querySelector(selector) as MetaEl | null;
  let created = false;
  if (!el) {
    el = create();
    document.head.appendChild(el);
    created = true;
  }
  const prev = el instanceof HTMLLinkElement ? el.href : el.content;
  setValue(el);
  return { el, prev, created };
}

/**
 * Sets per-route document title, meta description, canonical URL,
 * and Open Graph / Twitter title+description+url so each route looks
 * unique to crawlers and social platforms.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = `${title} | EcoSwarm`;
    const url = `${SITE_ORIGIN}${window.location.pathname}`;

    const prevTitle = document.title;
    document.title = fullTitle;

    const desc = upsert(
      'meta[name="description"]',
      () => Object.assign(document.createElement('meta'), { name: 'description' }),
      (el) => { (el as HTMLMetaElement).content = description; },
    );
    const canonical = upsert(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      (el) => { (el as HTMLLinkElement).href = url; },
    );
    const ogTitle = upsert(
      'meta[property="og:title"]',
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m; },
      (el) => { (el as HTMLMetaElement).content = fullTitle; },
    );
    const ogDesc = upsert(
      'meta[property="og:description"]',
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m; },
      (el) => { (el as HTMLMetaElement).content = description; },
    );
    const ogUrl = upsert(
      'meta[property="og:url"]',
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m; },
      (el) => { (el as HTMLMetaElement).content = url; },
    );
    const twTitle = upsert(
      'meta[name="twitter:title"]',
      () => Object.assign(document.createElement('meta'), { name: 'twitter:title' }),
      (el) => { (el as HTMLMetaElement).content = fullTitle; },
    );
    const twDesc = upsert(
      'meta[name="twitter:description"]',
      () => Object.assign(document.createElement('meta'), { name: 'twitter:description' }),
      (el) => { (el as HTMLMetaElement).content = description; },
    );

    return () => {
      document.title = prevTitle;
      const restore = (entry: { el: MetaEl; prev: string; created: boolean }, attr: 'content' | 'href') => {
        if (entry.created) entry.el.remove();
        else (entry.el as unknown as Record<string, string>)[attr] = entry.prev;
      };
      restore(desc, 'content');
      restore(canonical, 'href');
      restore(ogTitle, 'content');
      restore(ogDesc, 'content');
      restore(ogUrl, 'content');
      restore(twTitle, 'content');
      restore(twDesc, 'content');
    };
  }, [title, description]);
}