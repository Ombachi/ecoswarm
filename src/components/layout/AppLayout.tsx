import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useApp } from '@/context/AppContext';
import { Sparkles, Shield } from 'lucide-react';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';
import { EcoSwarmChatbot } from '@/components/chat/EcoSwarmChatbot';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { notification, isAdmin } = useApp();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-bold text-destructive">Admin Mode</span>
        </div>
      )}
      {notification && (
        <div className="eco-notification">
          <Sparkles className="w-5 h-5" />
          <span>{notification.message}</span>
          {notification.points && (
            <span className="ml-auto eco-points-badge text-xs">
              +{notification.points} pts
            </span>
          )}
        </div>
      )}
      <main className={isAdmin ? '' : 'pb-20'}>{children}</main>
      {!isAdmin && <BottomNav />}
      <InstallPrompt />
      <UpdatePrompt />
      {!isAdmin && <EcoSwarmChatbot />}
    </div>
  );
}
