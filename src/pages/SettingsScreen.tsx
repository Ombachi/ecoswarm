import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronLeft, 
  User, 
  Bell, 
  Moon, 
  Globe, 
  LogOut,
  ChevronRight,
  Shield,
  Heart,
  MessageCircle,
  Loader2,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode, isSwahili, toggleLanguage, logout } = useApp();
  usePageMeta('Settings', 'Manage your EcoSwarm account settings, notifications, and preferences.');
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications(user?.id);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    }
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your name, photo, and bio',
          action: () => navigate('/edit-profile'),
          type: 'link' as const,
        },
        {
          icon: Shield,
          label: 'Premium Subscription',
          description: 'Upgrade for priority listings & lower fees',
          action: () => navigate('/premium'),
          type: 'link' as const,
        },
        ...(isAdmin ? [{
          icon: Settings2,
          label: 'Admin Panel',
          description: 'Manage courses, templates & recipients',
          action: () => navigate('/admin'),
          type: 'link' as const,
        }] : []),
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          value: isDarkMode,
          action: toggleDarkMode,
          type: 'toggle' as const,
        },
        {
          icon: Globe,
          label: 'Swahili Mode',
          description: 'Switch language to Swahili',
          value: isSwahili,
          action: toggleLanguage,
          type: 'toggle' as const,
        },
        {
          icon: Bell,
          label: 'Push Notifications',
          description: pushSupported ? 'Get notified about new activity' : 'Not supported on this device',
          value: pushSubscribed,
          action: () => pushSubscribed ? pushUnsubscribe() : pushSubscribe(),
          type: 'toggle' as const,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: Shield,
          label: 'Privacy Policy',
          description: 'How we protect your data',
          action: () => navigate('/privacy-policy'),
          type: 'link' as const,
        },
        {
          icon: MessageCircle,
          label: 'Send Feedback',
          description: 'Help us improve EcoSwarm',
          action: () => navigate('/feedback'),
          type: 'link' as const,
        },
        {
          icon: Heart,
          label: 'Rate the App',
          description: 'Love EcoSwarm? Rate us!',
          action: () => navigate('/rate-app'),
          type: 'link' as const,
        },
      ],
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-muted text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* User Card */}
        {user && (
          <div className="eco-card-elevated p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl eco-gradient-bg flex items-center justify-center text-2xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">📍 {user.location}</p>
              <p className="text-xs text-primary mt-1">{user.ecoPoints} EcoPoints</p>
            </div>
          </div>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              {group.title.toUpperCase()}
            </h3>
            <div className="eco-card divide-y divide-border overflow-hidden">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === 'toggle' ? (
                    <Switch 
                      checked={item.value} 
                      onCheckedChange={item.action}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full eco-card p-4 flex items-center gap-4 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 text-destructive animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{isLoggingOut ? 'Logging out...' : 'Log Out'}</p>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
        </button>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">EcoSwarm v1.0.0</p>
          <p className="text-xs text-muted-foreground">Made with 💚 in Kenya</p>
        </div>
      </div>
    </AppLayout>
  );
}
