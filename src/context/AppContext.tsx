import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/ecoswarm';
import { mockUser } from '@/data/mockData';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const [notification, setNotification] = useState<{ message: string; points?: number } | null>(null);

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
      setUser({
        ...user,
        ecoPoints: user.ecoPoints + points,
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
