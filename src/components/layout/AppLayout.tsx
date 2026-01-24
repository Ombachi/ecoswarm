import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useApp } from '@/context/AppContext';
import { Leaf, Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { notification } = useApp();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
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
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
