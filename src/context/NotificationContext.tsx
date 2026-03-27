/**
 * NotificationContext — thin wrapper for notification-specific consumers.
 */
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useApp } from './AppContext';

interface NotificationContextType {
  notification: { message: string; points?: number } | null;
  showNotification: (message: string, points?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notification, showNotification } = useApp();

  const value = useMemo(() => ({
    notification, showNotification,
  }), [notification, showNotification]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
