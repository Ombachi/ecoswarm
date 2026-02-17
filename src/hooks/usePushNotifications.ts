import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePushNotifications(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  // Fetch VAPID public key from backend
  useEffect(() => {
    if (!isSupported) return;
    
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (!error && data?.publicKey) {
          setVapidKey(data.publicKey);
        }
      } catch (e) {
        console.error('Failed to fetch VAPID key:', e);
      }
    };
    fetchVapidKey();
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported || !userId) return;
    checkSubscription();
  }, [isSupported, userId]);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = async () => {
    if (!userId || !isSupported || !vapidKey) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;

      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const json = subscription.toJSON();

      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      }, { onConflict: 'user_id,endpoint' });

      if (error) {
        console.error('Failed to save subscription:', error);
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  return { isSupported, isSubscribed, subscribe, unsubscribe };
}
