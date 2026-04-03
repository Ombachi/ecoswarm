import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

let currentUserId: string | null = null;

// Lightweight fire-and-forget tracker
function trackEvent(eventType: string, eventData: Record<string, unknown> = {}, page?: string) {
  if (!currentUserId) return;
  supabase.from('platform_analytics').insert({
    user_id: currentUserId,
    event_type: eventType,
    event_data: eventData,
    page: page || window.location.pathname,
  } as any).then(() => {});
}

export function useAnalyticsTracker() {
  const location = useLocation();
  const lastPage = useRef('');

  // Keep user id in sync
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      currentUserId = data.user?.id || null;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      currentUserId = session?.user?.id || null;
    });
    return () => subscription.unsubscribe();
  }, []);

  // Track page views
  useEffect(() => {
    if (location.pathname !== lastPage.current) {
      lastPage.current = location.pathname;
      trackEvent('page_view', { path: location.pathname });
    }
  }, [location.pathname]);

  const trackSearch = useCallback((query: string, section: string) => {
    trackEvent('search', { query, section });
  }, []);

  const trackAction = useCallback((action: string, data: Record<string, unknown> = {}) => {
    trackEvent(action, data);
  }, []);

  return { trackSearch, trackAction };
}

// Export standalone for use outside hooks
export { trackEvent };
