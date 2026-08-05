import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { TabletSidebar } from './TabletSidebar';
import { useApp } from '@/context/AppContext';
import { useLayout } from '@/context/LayoutContext';
import { Sparkles, Shield } from 'lucide-react';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { notification, isAdmin } = useApp();
  const { layoutMode, isTabletLandscape } = useLayout();

  const notificationBanner = notification && (
    <div className="eco-notification">
      <Sparkles className="w-5 h-5" />
      <span>{notification.message}</span>
      {notification.points && (
        <span className="ml-auto eco-points-badge text-xs">+{notification.points} pts</span>
      )}
    </div>
  );

  // Desktop triple-pane
  if (layoutMode === 'desktop') {
    return (
      <div className="flex h-screen w-full bg-background">
        {!isAdmin && <DesktopSidebar />}
        <main className="flex-1 overflow-y-auto min-w-0">
          {isAdmin && (
            <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-1.5 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[11px] font-bold text-destructive">Admin Mode</span>
            </div>
          )}
          {notificationBanner}
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
        <UpdatePrompt />
      </div>
    );
  }

  // Tablet landscape
  if (layoutMode === 'tablet' && isTabletLandscape) {
    return (
      <div className="flex h-screen w-full bg-background">
        {!isAdmin && <TabletSidebar />}
        <main className="flex-1 overflow-y-auto min-w-0">
          {isAdmin && (
            <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-1.5 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-destructive" />
              <span className="text-[11px] font-bold text-destructive">Admin Mode</span>
            </div>
          )}
          {notificationBanner}
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
        <UpdatePrompt />
      </div>
    );
  }

  // Mobile
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-bold text-destructive">Admin Mode</span>
        </div>
      )}
      {notificationBanner}
      <main className={isAdmin ? '' : 'pb-20'}>{children}</main>
      {!isAdmin && <BottomNav />}
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
}
