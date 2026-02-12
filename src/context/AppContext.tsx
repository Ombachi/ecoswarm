import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Badge } from '@/types/ecoswarm';
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { allBadges } from '@/data/mockData';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  /** auth session exists even if profile row is still being created */
  authUserId: string | null;
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
  earnBadge: (badgeId: string) => Promise<void>;
  completeCourse: (moduleId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; points?: number } | null>(null);

  const withTimeout = async <T,>(
    promise: PromiseLike<T>,
    ms: number,
    label: string
  ): Promise<T> => {
    let timeoutId: number | undefined;
    const timeout = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`${label}_timeout`)), ms);
    });
    try {
      return await Promise.race([Promise.resolve(promise), timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const fetchUserBadges = async (userId: string): Promise<Badge[]> => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId);

      if (error || !data) return [];

      return data
        .map((ub) => {
          const badge = allBadges.find((b) => b.id === ub.badge_id);
          if (badge) {
            return { ...badge, earnedAt: new Date(ub.earned_at) };
          }
          return null;
        })
        .filter(Boolean) as Badge[];
    } catch {
      return [];
    }
  };

  const buildPlaceholderUser = (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }): User => {
    const metaName = authUser.user_metadata?.name;
    const fallbackName = metaName || (authUser.email || 'EcoWarrior').split('@')[0] || 'EcoWarrior';
    return {
      id: authUser.id,
      name: fallbackName,
      location: 'Kenya',
      avatar: undefined,
      bio: undefined,
      ecoPoints: 0,
      streak: 0,
      topConcern: 'Climate Action',
      badges: [],
      stats: {
        treesPlanted: 0,
        lettersSent: 0,
        swarmsJoined: 0,
        co2Saved: 0,
        postsCreated: 0,
        coursesCompleted: 0,
      },
    };
  };

  const ensureFirstStepsBadgeExists = async (userId: string) => {
    // Make this idempotent at the DB layer so the badge can't be "missed"
    // due to UI timing/race conditions.
    try {
      const { data: existing, error: selectError } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', '1')
        .maybeSingle();

      if (selectError) {
        console.warn('ensureFirstStepsBadgeExists: select failed', selectError);
        return;
      }

      if (existing) return;

      const { error: insertError } = await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: '1',
      });

      if (insertError && !insertError.message.toLowerCase().includes('duplicate')) {
        console.warn('ensureFirstStepsBadgeExists: insert failed', insertError);
      }
    } catch (e) {
      console.warn('ensureFirstStepsBadgeExists: unexpected error', e);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      type ProfileRow = Database['public']['Tables']['profiles']['Row'];
      const res = await withTimeout<PostgrestSingleResponse<ProfileRow | null>>(
        (supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle() as unknown) as PromiseLike<PostgrestSingleResponse<ProfileRow | null>>,
        8000,
        'fetch_profile'
      );

      const { data: profile, error } = res;

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (profile) {
        const badges = await fetchUserBadges(userId);
        const appUser: User = {
          id: profile.user_id,
          name: profile.name,
          location: profile.location || profile.county || 'Kenya',
          avatar: (profile as unknown as { avatar_url?: string }).avatar_url || undefined,
          bio: (profile as unknown as { bio?: string }).bio || undefined,
          ecoPoints: profile.eco_points || 0,
          streak: profile.streak || 0,
          topConcern: profile.top_concern || 'Climate Action',
          badges,
          stats: {
            treesPlanted: profile.trees_planted || 0,
            lettersSent: profile.letters_sent || 0,
            swarmsJoined: profile.swarms_joined || 0,
            co2Saved: profile.co2_saved || 0,
            postsCreated: profile.posts_created || 0,
            coursesCompleted: (profile as unknown as { courses_completed?: number }).courses_completed || 0,
          },
        };
        return appUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile (unexpected):', error);
      return null;
    }
  };

  const ensureProfileExists = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }) => {
    const existing = await fetchUserProfile(authUser.id);
    if (existing) return existing;

    // Use the name from auth metadata (set during signup) instead of email prefix
    const metaName = authUser.user_metadata?.name;
    const fallbackName = metaName || (authUser.email || 'EcoWarrior').split('@')[0] || 'EcoWarrior';

    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: authUser.id,
      email: authUser.email || '',
      name: fallbackName,
      location: authUser.user_metadata?.county || 'Kenya',
      county: authUser.user_metadata?.county || undefined,
      sex: authUser.user_metadata?.sex || undefined,
      phone: authUser.user_metadata?.phone || undefined,
      top_concern: authUser.user_metadata?.top_concern || undefined,
    });

    if (insertError && !insertError.message.toLowerCase().includes('duplicate')) {
      console.error('Error creating profile:', insertError);
      return null;
    }

    // Re-fetch after insert
    return await fetchUserProfile(authUser.id);
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

    const hydrateUserInBackground = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }, event?: string) => {
      // Always ensure the UI has *something* to render to avoid infinite loading.
      if (isMounted) {
        setIsOnboarded(true);
        setUser((prev) => (prev?.id === authUser.id ? prev : buildPlaceholderUser(authUser)));
      }

      // Then do the real profile fetch/create work without blocking rendering.
      let appUser = await ensureProfileExists({ id: authUser.id, email: authUser.email, user_metadata: authUser.user_metadata });

      // If still missing (network/RLS timing), retry a few times with backoff.
      if (!appUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const delays = [800, 1500, 2500];
        for (const delay of delays) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          appUser = await ensureProfileExists({ id: authUser.id, email: authUser.email, user_metadata: authUser.user_metadata });
          if (appUser) break;
        }
      }

      if (!appUser) {
        console.warn('hydrateUserInBackground: profile still missing after retries; keeping placeholder user');
        return;
      }

      // Ensure First Steps badge exists on first sign-in.
      if (event === 'SIGNED_IN') {
        await ensureFirstStepsBadgeExists(authUser.id);
      }

      const badges = await fetchUserBadges(authUser.id);
      appUser = { ...appUser, badges };

      if (isMounted) {
        setUser(appUser);
        setIsOnboarded(true);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          'get_session'
        );

        if (!isMounted) return;

        setAuthUserId(session?.user?.id ?? null);

        if (session?.user) {
          // Do not block initial render on profile fetch.
          void hydrateUserInBackground({ id: session.user.id, email: session.user.email, user_metadata: session.user.user_metadata }, 'INITIAL_SESSION');
        } else {
          setUser(null);
          setIsOnboarded(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setAuthUserId(null);
          setUser(null);
          setIsOnboarded(false);
        }
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

      setAuthUserId(session?.user?.id ?? null);

      if (session?.user) {
        void hydrateUserInBackground({ id: session.user.id, email: session.user.email, user_metadata: session.user.user_metadata }, event);
      } else {
        setUser(null);
        setIsOnboarded(false);
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

      const updateData: Record<string, number> = {};
      if (stats.lettersSent !== undefined) updateData.letters_sent = newStats.lettersSent;
      if (stats.swarmsJoined !== undefined) updateData.swarms_joined = newStats.swarmsJoined;
      if (stats.postsCreated !== undefined) updateData.posts_created = newStats.postsCreated;
      if (stats.treesPlanted !== undefined) updateData.trees_planted = newStats.treesPlanted;
      if (stats.co2Saved !== undefined) updateData.co2_saved = newStats.co2Saved;
      if (stats.coursesCompleted !== undefined) updateData.courses_completed = newStats.coursesCompleted;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id);

        if (error) console.error('Error updating stats:', error);
      }
    }
  };

  const earnBadge = async (badgeId: string) => {
    if (!user) return;
    const alreadyHas = user.badges.some((b) => b.id === badgeId);
    if (alreadyHas) return;

    const badge = allBadges.find((b) => b.id === badgeId);
    if (!badge) return;

    const { error } = await supabase.from('user_badges').insert({
      user_id: user.id,
      badge_id: badgeId,
    });

    if (error) {
      console.error('Error earning badge:', error);
      return;
    }

    setUser({
      ...user,
      badges: [...user.badges, { ...badge, earnedAt: new Date() }],
    });
  };

  const completeCourse = async (moduleId: string) => {
    if (!user) return;

    const { error } = await supabase.from('course_completions').insert({
      user_id: user.id,
      module_id: moduleId,
    });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error completing course:', error);
      return;
    }

    const newCount = user.stats.coursesCompleted + 1;
    await updateStats({ coursesCompleted: newCount });

    // Award Educator badge when all modules completed (12 modules)
    if (newCount >= 12) {
      await earnBadge('7'); // Educator badge
    }
  };

  // Check and award Streak Master badge
  const checkStreakBadge = async () => {
    if (user && user.streak >= 7) {
      await earnBadge('4'); // Streak Master badge
    }
  };

  // Run streak badge check when user changes
  useEffect(() => {
    if (user) {
      checkStreakBadge();
    }
  }, [user?.streak]);

  const showNotification = (message: string, points?: number) => {
    setNotification({ message, points });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authUserId,
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
        earnBadge,
        completeCourse,
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
