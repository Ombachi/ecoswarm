/**
 * AuthContext — thin wrapper around AppContext for auth-specific consumers.
 * Import `useAuth` instead of `useApp` when you only need auth state.
 * This avoids re-renders from unrelated state changes (points, notifications, etc.)
 */
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useApp } from './AppContext';

interface AuthContextType {
  authUserId: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authUserId, isAdmin, isLoading, isOnboarded, logout } = useApp();

  const value = useMemo(() => ({
    authUserId, isAdmin, isLoading, isOnboarded, logout,
  }), [authUserId, isAdmin, isLoading, isOnboarded, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
