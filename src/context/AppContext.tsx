import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/ecoswarm';
import { supabase } from '@/integrations/supabase/client';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSwahili: boolean;
  toggleLanguage: () => void;
  addPoints: (points: number) => void;
  showNotification: (message: string, points?: number) => void;
  notification: { message: string; points?: number } | null;
  isLoading: boolean;
  updateStats: (stats: Partial<User['stats']>) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; points?: number } | null>(null);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (profile) {
      const appUser: User = {
        id: profile.user_id,
        name: profile.name,
        location: profile.location || profile.county || 'Kenya',
        ecoPoints: profile.eco_points || 0,
        streak: profile.streak || 0,
        topConcern: profile.top_concern || 'Climate Action',
        badges: [],
        stats: {
          treesPlanted: profile.trees_planted || 0,
          lettersSent: profile.letters_sent || 0,
          swarmsJoined: profile.swarms_joined || 0,
          co2Saved: profile.co2_saved || 0,
          postsCreated: profile.posts_created || 0,
        },
      };
      return appUser;
    }
    return null;
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const appUser = await fetchUserProfile(authUser.id);
      if (appUser) {
        setUser(appUser);
        setIsOnboarded(true);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOnboarded(false);
  };

  // Listen to auth state changes and fetch user profile
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          const appUser = await fetchUserProfile(session.user.id);
          if (isMounted) {
            if (appUser) {
              setUser(appUser);
              setIsOnboarded(true);
            } else {
              setUser(null);
              setIsOnboarded(false);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
            setIsOnboarded(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!isMounted) return;

      if (session?.user) {
        const appUser = await fetchUserProfile(session.user.id);
        if (isMounted) {
          if (appUser) {
            setUser(appUser);
            setIsOnboarded(true);
          } else {
            setUser(null);
            setIsOnboarded(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setIsOnboarded(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLanguage = () => {
    setIsSwahili(!isSwahili);
  };

  const addPoints = async (points: number) => {
    if (user) {
      const newPoints = user.ecoPoints + points;
      setUser({
        ...user,
        ecoPoints: newPoints,
      });
      
      // Update points in database
      const { error } = await supabase
        .from('profiles')
        .update({ eco_points: newPoints })
        .eq('user_id', user.id);
        
      if (error) console.error('Error updating points:', error);
    }
  };

  const updateStats = async (stats: Partial<User['stats']>) => {
    if (user) {
      const newStats = { ...user.stats, ...stats };
      setUser({
        ...user,
        stats: newStats,
      });

      // Update stats in database
      const updateData: Record<string, number> = {};
      if (stats.lettersSent !== undefined) updateData.letters_sent = newStats.lettersSent;
      if (stats.swarmsJoined !== undefined) updateData.swarms_joined = newStats.swarmsJoined;
      if (stats.postsCreated !== undefined) updateData.posts_created = newStats.postsCreated;
      if (stats.treesPlanted !== undefined) updateData.trees_planted = newStats.treesPlanted;
      if (stats.co2Saved !== undefined) updateData.co2_saved = newStats.co2Saved;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id);
          
        if (error) console.error('Error updating stats:', error);
      }
    }
  };

  const showNotification = (message: string, points?: number) => {
    setNotification({ message, points });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isOnboarded,
        setIsOnboarded,
        isDarkMode,
        toggleDarkMode,
        isSwahili,
        toggleLanguage,
        addPoints,
        showNotification,
        notification,
        isLoading,
        updateStats,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
