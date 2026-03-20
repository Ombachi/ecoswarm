import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useApp } from "@/context/AppContext";
import { ProgressRing } from "@/components/common/ProgressRing";
import { EcoPointsBadge } from "@/components/common/EcoPointsBadge";
import { SwahiliToggle } from "@/components/common/SwahiliToggle";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Confetti } from "@/components/common/Confetti";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DevAnalyticsTab } from "@/components/dashboard/DevAnalyticsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVisibilityRefetch } from "@/hooks/useVisibilityRefetch";
import {
  MessageSquare,
  ShoppingBag,
  Mail,
  ChevronRight,
  Flame,
  Moon,
  Sun,
  Target,
  Download,
  CheckCircle,
  Trophy,
  LogOut,
  BarChart3,
  Users,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  action_type: string | null;
  completed?: boolean;
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode, isSwahili, addPoints, showNotification, refreshUser, logout, authUserId } = useApp();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  // Refetch dashboard data when app becomes visible (PWA resume)
  const handleVisibilityRefetch = useCallback(() => {
    if (user) {
      refreshUser();
      loadChallenges();
    }
  }, [user]);
  useVisibilityRefetch(handleVisibilityRefetch);
  // Check role as soon as we have an auth ID (don't wait for full profile)
  useEffect(() => {
    const uid = user?.id || authUserId;
    if (!uid) return;

    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', uid)
          .eq('role', 'ecodeveloper')
          .maybeSingle();
        setIsDeveloper(!!data);
      } catch (e) {
        console.error('Role check failed:', (e as Error)?.message || 'An error occurred');
      } finally {
        setRoleChecked(true);
      }
    };
    checkRole();
  }, [user?.id, authUserId]);

  useEffect(() => {
    if (user && roleChecked) {
      loadChallenges();
      updateStreak();
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => setProductCount(count || 0));
    }
  }, [user, roleChecked, isDeveloper]);

  const loadChallenges = async () => {
    if (!user) return;

    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true);

      if (challengesError) throw challengesError;

      // Fetch user's completed challenges
      const { data: completedData } = await supabase
        .from("user_challenges")
        .select("challenge_id")
        .eq("user_id", user.id);

      const completedIds = completedData?.map((c) => c.challenge_id) || [];

      // Filter challenges by role and mark completed
      const userRole = isDeveloper ? 'ecodeveloper' : 'ecowarrior';
      const challengesWithStatus = (challengesData || [])
        .filter((c: any) => {
          const targetRole = c.target_role || 'all';
          return targetRole === 'all' || targetRole === userRole;
        })
        .map((c) => ({
          ...c,
          completed: completedIds.includes(c.id),
        }));

      setChallenges(challengesWithStatus);
    } catch (error) {
      console.error("Error loading challenges:", (error as Error)?.message || 'An error occurred');
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      // Check and update streak based on last activity
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_active_at, streak")
        .eq("user_id", user.id)
        .single();

      if (profile?.last_active_at) {
        const lastActive = new Date(profile.last_active_at);
        const now = new Date();

        // Reset times to midnight for accurate day comparison
        const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const daysDiff = Math.floor((todayDay.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Increment streak for consecutive day
          const newStreak = (profile.streak || 0) + 1;
          await supabase
            .from("profiles")
            .update({ streak: newStreak, last_active_at: now.toISOString() })
            .eq("user_id", user.id);
          await refreshUser();
          toast.success(`🔥 ${newStreak} day streak! Keep it up!`);
        } else if (daysDiff > 1) {
          // Reset streak if more than 1 day gap
          await supabase
            .from("profiles")
            .update({ streak: 1, last_active_at: now.toISOString() })
            .eq("user_id", user.id);
          await refreshUser();
        } else if (daysDiff === 0) {
          // Same day, just update last_active_at if not already updated today
          await supabase.from("profiles").update({ last_active_at: now.toISOString() }).eq("user_id", user.id);
        }
      } else {
        // First time, set streak to 1
        await supabase
          .from("profiles")
          .update({ streak: 1, last_active_at: new Date().toISOString() })
          .eq("user_id", user.id);
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating streak:", (error as Error)?.message || 'An error occurred');
    }
  };

  const getChallengeRoute = (actionType: string | null) => {
    switch (actionType) {
      case "post": return "/agora";
      case "engage": return "/agora";
      case "ecomarket": return "/ecomarket";
      case "inbox": return "/inbox";
      case "letter": return "/tools";
      case "module": return "/tools";
      default: return "/dashboard";
    }
  };

  const handleStartChallenge = (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.completed) return;
    
    // Navigate to the relevant page so users can complete the challenge there
    const route = getChallengeRoute(challenge.action_type);
    toast.info(`🎯 Challenge: ${challenge.title} — Complete it to earn ${challenge.points} EcoPoints!`);
    navigate(route);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    try {
      const { error } = await supabase.from("user_challenges").insert({
        user_id: user.id,
        challenge_id: challengeId,
      });

      if (error && !error.message.includes("duplicate")) throw error;

      setChallenges(challenges.map((c) => (c.id === challengeId ? { ...c, completed: true } : c)));
      addPoints(challenge.points);
      showNotification(`Challenge completed! 🎉`, challenge.points);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success(`You earned ${challenge.points} EcoPoints!`);
    } catch (error) {
      console.error("Error completing challenge:", (error as Error)?.message || 'An error occurred');
      toast.error("Failed to complete challenge");
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const dailyChallenge = challenges.find((c) => c.type === "daily" && !c.completed);

  const allQuickActions = [
    { id: 'agora', icon: MessageSquare, label: "Agora Square", color: "from-primary to-secondary", path: "/agora" },
    { id: 'ecomarket', icon: ShoppingBag, label: "EcoMarket", color: "from-secondary to-eco-blue", path: "/ecomarket" },
    { id: 'capacity', icon: GraduationCap, label: "Capacity Hub", color: "from-eco-blue to-primary", path: "/tools" },
    { id: 'letter', icon: Mail, label: "EcoLetter Forge", color: "from-eco-gold to-eco-orange", path: "/tools" },
    { id: 'swarms', icon: Users, label: "Swarms", color: "from-primary to-eco-green", path: "/swarms" },
    { id: 'challenges', icon: Trophy, label: "Challenges", color: "from-eco-orange to-eco-gold", path: "/challenges" },
    { id: 'calendar', icon: CalendarDays, label: "Eco Calendar", color: "from-eco-blue to-secondary", path: "/calendar" },
    { id: 'leaderboard', icon: Target, label: "Leaderboard", color: "from-secondary to-primary", path: "/leaderboard" },
  ];

  // Hide Challenges for EcoDevelopers
  const quickActions = isDeveloper
    ? allQuickActions.filter(a => a.id !== 'challenges')
    : allQuickActions;

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      <div className="px-4 pt-4 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{isSwahili ? "Habari," : "Hello,"} 👋</p>
            <h1 className="text-2xl font-bold text-foreground">
              {user.name} <span className="text-muted-foreground font-normal">from {user.location}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SwahiliToggle />
            <NotificationBell />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
              title={isSwahili ? "Ondoka" : "Log Out"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EcoPoints Card */}
        <div className="eco-card-elevated p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full eco-gradient-bg rounded-full blur-2xl" />
          </div>
          <div className="flex items-center gap-6">
            <ProgressRing progress={Math.min((user.ecoPoints / 2000) * 100, 100)} size={100}>
              <div className="text-center">
                <p className="text-2xl font-bold eco-gradient-text">{user.ecoPoints}</p>
                <p className="text-[10px] text-muted-foreground">EcoPoints</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-eco-orange" />
                <span className="font-bold text-foreground">{user.streak} Day Streak!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isSwahili ? "Uko karibu kufikia kiwango kipya!" : "You're close to the next level!"}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full eco-gradient-bg rounded-full transition-all"
                  style={{ width: `${Math.min((user.ecoPoints / 2000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(2000 - user.ecoPoints, 0)} more to Gold {isDeveloper ? 'EcoDeveloper' : 'EcoWarrior'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for dev analytics */}
        {roleChecked && isDeveloper ? (
          <Tabs defaultValue="home">
            <TabsList className="w-full">
              <TabsTrigger value="home" className="flex-1 gap-1">
                🏠 Home
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 gap-1">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="home">
              <div className="space-y-6 pt-2">
                <DashboardHomeContent
                  quickActions={quickActions}
                  navigate={navigate}
                  isSwahili={isSwahili}
                  dailyChallenge={dailyChallenge}
                  handleCompleteChallenge={handleCompleteChallenge}
                  handleStartChallenge={handleStartChallenge}
                  challenges={challenges}
                  user={user}
                  productCount={productCount}
                  isInstalled={isInstalled}
                  promptInstall={promptInstall}
                  isDeveloper={isDeveloper}
                />
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="pt-2">
                <DevAnalyticsTab />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <DashboardHomeContent
            quickActions={quickActions}
            navigate={navigate}
            isSwahili={isSwahili}
            dailyChallenge={dailyChallenge}
            handleCompleteChallenge={handleCompleteChallenge}
            handleStartChallenge={handleStartChallenge}
            challenges={challenges}
            user={user}
            productCount={productCount}
            isInstalled={isInstalled}
            promptInstall={promptInstall}
            isDeveloper={false}
          />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>© 2026 EcoSwarm. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}

/* Extracted home content to avoid duplication */
function DashboardHomeContent({
  quickActions,
  navigate,
  isSwahili,
  dailyChallenge,
  handleCompleteChallenge,
  handleStartChallenge,
  challenges,
  user,
  productCount,
  isInstalled,
  promptInstall,
  isDeveloper,
}: any) {
  return (
    <>
      {/* Quick Actions - Icon Grid */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">{isSwahili ? "Hatua za Haraka" : "Quick Actions"}</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action: any) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="eco-card p-3 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-foreground text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenge - only for EcoWarriors */}
      {!isDeveloper && dailyChallenge && (
        <div className="eco-card p-4 border-l-4 border-l-eco-gold">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isSwahili ? "Changamoto ya Leo" : "Daily Challenge"}
              </p>
              <h3 className="font-semibold text-foreground">{dailyChallenge.title}</h3>
              <p className="text-sm text-muted-foreground">{dailyChallenge.description}</p>
            </div>
            <EcoPointsBadge points={dailyChallenge.points} size="sm" />
          </div>
          <button
            onClick={() => handleStartChallenge(dailyChallenge.id)}
            className="w-full eco-button-primary py-3 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            {isSwahili ? "Anza Changamoto" : "Start Challenge"}
          </button>
        </div>
      )}

      {/* Impact Summary */}
      <div className="eco-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">{isSwahili ? "Athari Yako" : "Your Impact"}</h2>
          <button
            onClick={() => navigate("/profile")}
            className="text-primary text-sm font-medium flex items-center gap-1"
          >
            {isSwahili ? "Ona zaidi" : "See all"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="eco-stat-card">
            <Mail className="w-6 h-6 text-secondary" />
            <p className="text-xl font-bold text-foreground">{user.stats.lettersSent}</p>
            <p className="text-[10px] text-muted-foreground">Letters Sent</p>
          </div>
          <div className="eco-stat-card">
            <MessageSquare className="w-6 h-6 text-eco-gold" />
            <p className="text-xl font-bold text-foreground">{user.stats.postsCreated}</p>
            <p className="text-[10px] text-muted-foreground">Stories Shared</p>
          </div>
          <div className="eco-stat-card">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <p className="text-xl font-bold text-foreground">{productCount}</p>
            <p className="text-[10px] text-muted-foreground">Products Listed</p>
          </div>
          {!isDeveloper && (
            <div className="eco-stat-card">
              <Target className="w-6 h-6 text-eco-orange" />
              <p className="text-xl font-bold text-foreground">{user.stats.coursesCompleted}</p>
              <p className="text-[10px] text-muted-foreground">Courses Done</p>
            </div>
          )}
        </div>
      </div>


      {/* PWA Install Banner */}
      <div className="eco-card p-4 bg-gradient-to-r from-eco-green-light to-eco-blue-light border-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full eco-gradient-bg flex items-center justify-center flex-shrink-0">
            {isInstalled ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Download className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              {isInstalled ? "EcoSwarm Installed!" : "Install EcoSwarm"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isInstalled ? "Thanks for installing! Enjoy the app." : "Works offline! Earn 50 EcoPoints 🎁"}
            </p>
          </div>
          {!isInstalled && (
            <button onClick={promptInstall} className="eco-button-primary py-2 px-4 text-sm">
              Install
            </button>
          )}
        </div>
      </div>
    </>
  );
}
