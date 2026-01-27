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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; points?: number } | null>(null);

  // Listen to auth state changes and fetch user profile
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        // Fetch user profile from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
          setIsOnboarded(false);
        } else if (profile) {
          // Convert profile to User type
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
          setUser(appUser);
          setIsOnboarded(true);
        } else {
          // User exists in auth but no profile yet
          setUser(null);
          setIsOnboarded(false);
        }
      } else {
        setUser(null);
        setIsOnboarded(false);
      }
      setIsLoading(false);
    });

    // THEN check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // The onAuthStateChange will handle setting user if there's a session
    });

    return () => {
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

  const addPoints = (points: number) => {
    if (user) {
      const newPoints = user.ecoPoints + points;
      setUser({
        ...user,
        ecoPoints: newPoints,
      });
      
      // Update points in database
      supabase
        .from('profiles')
        .update({ eco_points: newPoints })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Error updating points:', error);
        });
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
