/**
 * PointsContext — thin wrapper for eco-points specific consumers.
 * Import `usePoints` instead of `useApp` when you only need points/stats.
 */
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useApp } from './AppContext';
import { User } from '@/types/ecoswarm';

interface PointsContextType {
  ecoPoints: number;
  addPoints: (points: number) => void;
  updateStats: (stats: Partial<User['stats']>) => void;
  earnBadge: (badgeId: string) => Promise<void>;
  completeCourse: (moduleId: string) => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { user, addPoints, updateStats, earnBadge, completeCourse } = useApp();

  const value = useMemo(() => ({
    ecoPoints: user?.ecoPoints || 0,
    addPoints, updateStats, earnBadge, completeCourse,
  }), [user?.ecoPoints, addPoints, updateStats, earnBadge, completeCourse]);

  return <PointsContext.Provider value={value}>{children}</PointsContext.Provider>;
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) throw new Error('usePoints must be used within PointsProvider');
  return context;
}
