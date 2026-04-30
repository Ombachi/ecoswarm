import { useState, useEffect, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
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
import { EcoSwarmChatbot } from "@/components/chat/EcoSwarmChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVisibilityRefetch } from "@/hooks/useVisibilityRefetch";
import {
  MessageSquare, ShoppingBag, Mail, Flame, Moon, Sun, Target,
  Trophy, LogOut, BarChart3, Users, CalendarDays, GraduationCap, Briefcase, Package,
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
  usePageMeta('Dashboard', 'Your EcoSwarm dashboard — track eco-points, streaks, challenges, and your environmental impact.');
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [, setIsLoadingChallenges] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const handleVisibilityRefetch = useCallback(() => {
    if (user) {
      refreshUser();
      loadChallenges();
    }
  }, [user]);
  useVisibilityRefetch(handleVisibilityRefetch);

  useEffect(() => {
    const uid = user?.id || authUserId;
    if (!uid) return;
    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from('user_roles').select('role').eq('user_id', uid).eq('role', 'ecodeveloper').maybeSingle();
        setIsDeveloper(!!data);
      } catch (e) {
        console.error('Role check failed:', (e as Error)?.message);
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
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => setProductCount(count || 0));
    }
  }, [user, roleChecked, isDeveloper]);

  const loadChallenges = async () => {
    if (!user) return;
    try {
      const { data: challengesData, error } = await supabase.from("challenges").select("*").eq("is_active", true);
      if (error) throw error;
      const { data: completedData } = await supabase.from("user_challenges").select("challenge_id").eq("user_id", user.id);
      const completedIds = completedData?.map((c) => c.challenge_id) || [];
      const userRole = isDeveloper ? 'ecodeveloper' : 'ecowarrior';
      const challengesWithStatus = (challengesData || [])
        .filter((c: any) => { const t = c.target_role || 'all'; return t === 'all' || t === userRole; })
        .map((c) => ({ ...c, completed: completedIds.includes(c.id) }))
        // Hide the "Share Your Story" prompt until the user has created their
        // first post — new EcoWarriors shouldn't be pressured before they're
        // settled in.
        .filter((c: any) => {
          const isShareStory = (c.action_type === 'post') ||
            /share.*your.*story/i.test(c.title || '');
          if (isShareStory && (user.stats?.postsCreated ?? 0) === 0) return false;
          return true;
        });
      setChallenges(challengesWithStatus);
    } catch (error) {
      console.error("Error loading challenges:", (error as Error)?.message);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("last_active_at, streak").eq("user_id", user.id).single();
      if (profile?.last_active_at) {
        const lastActive = new Date(profile.last_active_at);
        const now = new Date();
        const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysDiff = Math.floor((todayDay.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          const newStreak = (profile.streak || 0) + 1;
          await supabase.from("profiles").update({ streak: newStreak, last_active_at: now.toISOString() }).eq("user_id", user.id);
          await refreshUser();
          toast.success(`🔥 ${newStreak} day streak!`);
        } else if (daysDiff > 1) {
          await supabase.from("profiles").update({ streak: 1, last_active_at: now.toISOString() }).eq("user_id", user.id);
          await refreshUser();
        } else if (daysDiff === 0) {
          await supabase.from("profiles").update({ last_active_at: now.toISOString() }).eq("user_id", user.id);
        }
      } else {
        await supabase.from("profiles").update({ streak: 1, last_active_at: new Date().toISOString() }).eq("user_id", user.id);
        await refreshUser();
      }
    } catch (error) {
      console.error("Error updating streak:", (error as Error)?.message);
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
    const route = getChallengeRoute(challenge.action_type);
    toast.info(`🎯 Challenge: ${challenge.title} — Complete it to earn ${challenge.points} EcoPoints!`);
    navigate(route);
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.completed) return;
    try {
      const { error } = await supabase.from("user_challenges").insert({ user_id: user.id, challenge_id: challengeId });
      if (error && !error.message.includes("duplicate")) throw error;
      setChallenges(challenges.map((c) => (c.id === challengeId ? { ...c, completed: true } : c)));
      addPoints(challenge.points);
      showNotification(`Challenge completed! 🎉`, challenge.points);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success(`You earned ${challenge.points} EcoPoints!`);
    } catch (error) {
      console.error("Error completing challenge:", (error as Error)?.message);
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

  // Build quick actions - role-aware
  const allQuickActions = [
    { id: 'agora', icon: MessageSquare, label: "Agora Square", color: "from-primary to-secondary", path: "/agora" },
    { id: 'ecomarket', icon: ShoppingBag, label: "EcoMarket", color: "from-secondary to-eco-blue", path: "/ecomarket" },
    { id: 'capacity', icon: GraduationCap, label: "Capacity Hub", color: "from-eco-blue to-primary", path: "/tools" },
    { id: 'letter', icon: isDeveloper ? Briefcase : Mail, label: isDeveloper ? "Advocacy" : "EcoLetter", color: "from-eco-gold to-eco-orange", path: "/tools" },
    { id: 'swarms', icon: Users, label: "Swarms", color: "from-primary to-eco-green", path: "/swarms" },
    { id: 'challenges', icon: Trophy, label: "Challenges", color: "from-eco-orange to-eco-gold", path: "/challenges" },
    { id: 'calendar', icon: CalendarDays, label: "Calendar", color: "from-eco-blue to-secondary", path: "/calendar" },
    { id: 'leaderboard', icon: Target, label: "Leaderboard", color: "from-primary to-eco-gold", path: "/leaderboard" },
    { id: 'impact', icon: BarChart3, label: "My Impact", color: "from-secondary to-primary", path: "/profile" },
    { id: 'merch', icon: Package, label: "EcoMerch", color: "from-eco-green to-secondary", path: "/merch" },
    { id: 'inbox', icon: Mail, label: "Inbox", color: "from-eco-blue to-eco-green", path: "/inbox" },
    { id: 'purchases', icon: ShoppingBag, label: "Purchases", color: "from-eco-orange to-secondary", path: "/purchases" },
    { id: 'earnings', icon: BarChart3, label: "Earnings", color: "from-eco-gold to-eco-green", path: "/earnings" },
  ];

  // Role-aware filtering: hide Challenges for devs, hide Earnings for warriors
  const quickActions = isDeveloper
    ? allQuickActions.filter(a => a.id !== 'challenges')
    : allQuickActions.filter(a => a.id !== 'earnings');

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      <div className="px-4 pt-4 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <SwahiliToggle />
            <NotificationBell />
            <button onClick={toggleDarkMode} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all" title={isSwahili ? "Ondoka" : "Log Out"}>
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
                <div className="h-full eco-gradient-bg rounded-full transition-all" style={{ width: `${Math.min((user.ecoPoints / 2000) * 100, 100)}%` }} />
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
              <TabsTrigger value="home" className="flex-1 gap-1">🏠 Home</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 gap-1"><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="home">
              <div className="space-y-6 pt-2">
                <DashboardHomeContent quickActions={quickActions} navigate={navigate} isSwahili={isSwahili} dailyChallenge={dailyChallenge} handleCompleteChallenge={handleCompleteChallenge} handleStartChallenge={handleStartChallenge} challenges={challenges} user={user} productCount={productCount} isDeveloper={isDeveloper} />
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="pt-2"><DevAnalyticsTab /></div>
            </TabsContent>
          </Tabs>
        ) : (
          <DashboardHomeContent quickActions={quickActions} navigate={navigate} isSwahili={isSwahili} dailyChallenge={dailyChallenge} handleCompleteChallenge={handleCompleteChallenge} handleStartChallenge={handleStartChallenge} challenges={challenges} user={user} productCount={productCount} isDeveloper={false} />
        )}
      </div>

      {/* AI Assistant - only on dashboard */}
      <EcoSwarmChatbot />
    </AppLayout>
  );
}

function DashboardHomeContent({ quickActions, navigate, isSwahili, dailyChallenge, handleCompleteChallenge, handleStartChallenge, challenges, user, productCount, isDeveloper }: any) {
  return (
    <>
      {/* Quick Actions - Expanded Grid */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">{isSwahili ? "Hatua za Haraka" : "Quick Actions"}</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {quickActions.map((action: any) => (
            <button key={action.id} onClick={() => navigate(action.path)} className="eco-card p-2.5 flex flex-col items-center gap-1.5 hover:shadow-lg transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-medium text-foreground text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenge - only for EcoWarriors */}
      {!isDeveloper && dailyChallenge && (
        <div className="eco-card p-4 border-l-4 border-l-eco-gold">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isSwahili ? "Changamoto ya Leo" : "Daily Challenge"}</p>
              <h3 className="font-semibold text-foreground">{dailyChallenge.title}</h3>
              <p className="text-sm text-muted-foreground">{dailyChallenge.description}</p>
            </div>
            <EcoPointsBadge points={dailyChallenge.points} size="sm" />
          </div>
          <button onClick={() => handleStartChallenge(dailyChallenge.id)} className="w-full eco-button-primary py-3 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            {isSwahili ? "Anza Changamoto" : "Start Challenge"}
          </button>
        </div>
      )}
    </>
  );
}
