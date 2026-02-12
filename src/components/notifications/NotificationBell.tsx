import { useState, useEffect } from 'react';
import { Bell, X, Users, MessageSquare, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notif.id);
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }

    if (notif.type === 'product' && notif.reference_id) {
      navigate('/ecomarket');
    } else if (notif.type === 'swarm' && notif.reference_id) {
      navigate('/ecomarket');
    } else if (notif.type === 'post' && notif.reference_id) {
      navigate(`/post/${notif.reference_id}`);
    } else if (notif.type === 'post') {
      navigate('/agora');
    } else if (notif.type === 'course') {
      navigate('/tools');
    } else {
      navigate('/agora');
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'swarm': return <Users className="w-4 h-4 text-eco-gold" />;
      case 'post': return <MessageSquare className="w-4 h-4 text-secondary" />;
      case 'course': return <BookOpen className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-auto bg-card border border-border rounded-2xl shadow-xl">
            <div className="sticky top-0 bg-card border-b border-border p-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary font-medium">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-all ${
                    !notif.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold' : ''} text-foreground`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
