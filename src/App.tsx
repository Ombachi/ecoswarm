import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { Loader2 } from "lucide-react";

// Critical path - loaded immediately
import { SplashScreen } from "@/pages/SplashScreen";
import { LoginScreen } from "@/pages/LoginScreen";
import { SignupScreen } from "@/pages/SignupScreen";
import { RoleSelectScreen } from "@/pages/RoleSelectScreen";

// Lazy loaded routes for code splitting
const OnboardingScreen = lazy(() => import("@/pages/OnboardingScreen").then(m => ({ default: m.OnboardingScreen })));
const ForgotPasswordScreen = lazy(() => import("@/pages/ForgotPasswordScreen").then(m => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen = lazy(() => import("@/pages/ResetPasswordScreen").then(m => ({ default: m.ResetPasswordScreen })));
const DashboardScreen = lazy(() => import("@/pages/DashboardScreen").then(m => ({ default: m.DashboardScreen })));
const AgoraScreen = lazy(() => import("@/pages/AgoraScreen").then(m => ({ default: m.AgoraScreen })));
const EcoMarketScreen = lazy(() => import("@/pages/EcoMarketScreen").then(m => ({ default: m.EcoMarketScreen })));
const ToolsScreen = lazy(() => import("@/pages/ToolsScreen").then(m => ({ default: m.ToolsScreen })));
const ProfileScreen = lazy(() => import("@/pages/ProfileScreen").then(m => ({ default: m.ProfileScreen })));
const AboutScreen = lazy(() => import("@/pages/AboutScreen").then(m => ({ default: m.AboutScreen })));
const SettingsScreen = lazy(() => import("@/pages/SettingsScreen").then(m => ({ default: m.SettingsScreen })));
const LeaderboardScreen = lazy(() => import("@/pages/LeaderboardScreen").then(m => ({ default: m.LeaderboardScreen })));
const EditProfileScreen = lazy(() => import("@/pages/EditProfileScreen").then(m => ({ default: m.EditProfileScreen })));
const ModuleScreen = lazy(() => import("@/pages/ModuleScreen").then(m => ({ default: m.ModuleScreen })));
const PrivacyPolicyScreen = lazy(() => import("@/pages/PrivacyPolicyScreen").then(m => ({ default: m.PrivacyPolicyScreen })));
const FeedbackScreen = lazy(() => import("@/pages/FeedbackScreen").then(m => ({ default: m.FeedbackScreen })));
const RateAppScreen = lazy(() => import("@/pages/RateAppScreen").then(m => ({ default: m.RateAppScreen })));
const TermsOfServiceScreen = lazy(() => import("@/pages/TermsOfServiceScreen").then(m => ({ default: m.TermsOfServiceScreen })));
const OfflinePage = lazy(() => import("@/pages/OfflinePage").then(m => ({ default: m.OfflinePage })));
const PublicImpactScreen = lazy(() => import("@/pages/PublicImpactScreen").then(m => ({ default: m.PublicImpactScreen })));
const PostViewScreen = lazy(() => import("@/pages/PostViewScreen").then(m => ({ default: m.PostViewScreen })));
const ShareTargetPage = lazy(() => import("@/pages/ShareTargetPage").then(m => ({ default: m.ShareTargetPage })));
const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const AdminPanel = lazy(() => import("@/pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const InboxScreen = lazy(() => import("@/pages/InboxScreen").then(m => ({ default: m.InboxScreen })));
const SwarmsScreen = lazy(() => import("@/pages/SwarmsScreen").then(m => ({ default: m.SwarmsScreen })));
const ChallengesScreen = lazy(() => import("@/pages/ChallengesScreen").then(m => ({ default: m.ChallengesScreen })));
const CalendarScreen = lazy(() => import("@/pages/CalendarScreen").then(m => ({ default: m.CalendarScreen })));
const EcoMerchScreen = lazy(() => import("@/pages/EcoMerchScreen").then(m => ({ default: m.EcoMerchScreen })));
const PurchasesScreen = lazy(() => import("@/pages/PurchasesScreen").then(m => ({ default: m.PurchasesScreen })));
const EarningsScreen = lazy(() => import("@/pages/EarningsScreen").then(m => ({ default: m.EarningsScreen })));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isOnboarded, user, isLoading, authUserId, isAdmin } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const hasSession = Boolean(authUserId);
  const isAuthenticated = hasSession;

  const requireAuthed = (element: JSX.Element) => {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return element;
  };

  // Admin redirect helper - admin goes straight to /admin for all regular user routes
  const authedRoute = (element: JSX.Element) => {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    if (isAdmin) return <Navigate to="/admin" replace />;
    return element;
  };

    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <LandingPage />} />
            <Route path="/welcome" element={<SplashScreen />} />
            <Route path="/role-select" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RoleSelectScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupScreen />} />
            <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/terms-of-service" element={<TermsOfServiceScreen />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/profile/:userId" element={<PublicImpactScreen />} />
            <Route path="/u/:userName" element={<PublicImpactScreen />} />
            <Route path="/post/:postId" element={<PostViewScreen />} />
            <Route path="/share-target" element={requireAuthed(<ShareTargetPage />)} />

            <Route path="/dashboard" element={<ErrorBoundary>{authedRoute(<DashboardScreen />)}</ErrorBoundary>} />
            <Route path="/agora" element={<ErrorBoundary>{authedRoute(<AgoraScreen />)}</ErrorBoundary>} />
            <Route path="/agora/tag/:tag" element={<ErrorBoundary>{authedRoute(<AgoraScreen />)}</ErrorBoundary>} />
            <Route path="/ecomarket" element={<ErrorBoundary>{authedRoute(<EcoMarketScreen />)}</ErrorBoundary>} />
            <Route path="/tools" element={<ErrorBoundary>{authedRoute(<ToolsScreen />)}</ErrorBoundary>} />
            <Route path="/profile" element={<ErrorBoundary>{authedRoute(<ProfileScreen />)}</ErrorBoundary>} />
            <Route path="/settings" element={<ErrorBoundary>{authedRoute(<SettingsScreen />)}</ErrorBoundary>} />
            <Route path="/feedback" element={authedRoute(<FeedbackScreen />)} />
            <Route path="/rate-app" element={authedRoute(<RateAppScreen />)} />
            <Route path="/leaderboard" element={authedRoute(<LeaderboardScreen />)} />
            <Route path="/edit-profile" element={authedRoute(<EditProfileScreen />)} />
            <Route path="/module/:moduleId" element={<ErrorBoundary>{authedRoute(<ModuleScreen />)}</ErrorBoundary>} />
            <Route path="/inbox" element={<ErrorBoundary>{authedRoute(<InboxScreen />)}</ErrorBoundary>} />
            <Route path="/swarms" element={<ErrorBoundary>{authedRoute(<SwarmsScreen />)}</ErrorBoundary>} />
            <Route path="/challenges" element={authedRoute(<ChallengesScreen />)} />
            <Route path="/calendar" element={authedRoute(<CalendarScreen />)} />
            <Route path="/merch" element={<ErrorBoundary>{authedRoute(<EcoMerchScreen />)}</ErrorBoundary>} />
            <Route path="/purchases" element={<ErrorBoundary>{authedRoute(<PurchasesScreen />)}</ErrorBoundary>} />
            <Route path="/earnings" element={<ErrorBoundary>{authedRoute(<EarningsScreen />)}</ErrorBoundary>} />
            <Route path="/admin" element={<ErrorBoundary>{requireAuthed(<AdminPanel />)}</ErrorBoundary>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <LayoutProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </LayoutProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
