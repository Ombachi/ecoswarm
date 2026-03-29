import { useEffect } from 'react';

/**
 * Sets document title and meta description for a route page.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | EcoSwarm`;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = meta?.content || '';
    if (meta) {
      meta.content = description;
    } else {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, [title, description]);
}
