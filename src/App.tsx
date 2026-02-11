import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

// Critical path - loaded immediately
import { SplashScreen } from "@/pages/SplashScreen";
import { LoginScreen } from "@/pages/LoginScreen";
import { SignupScreen } from "@/pages/SignupScreen";

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
  const { isOnboarded, user, isLoading, authUserId } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const hasSession = Boolean(authUserId);
  const isAuthenticated = hasSession;

  const requireAuthed = (element: JSX.Element) => {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    // Profile loading is handled inside AppProvider; never block forever here.
    return element;
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupScreen />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/terms-of-service" element={<TermsOfServiceScreen />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/profile/:userId" element={<PublicImpactScreen />} />
        <Route path="/post/:postId" element={<PostViewScreen />} />

        <Route path="/dashboard" element={requireAuthed(<DashboardScreen />)} />
        <Route path="/agora" element={requireAuthed(<AgoraScreen />)} />
        <Route path="/agora/tag/:tag" element={requireAuthed(<AgoraScreen />)} />
        <Route path="/ecomarket" element={requireAuthed(<EcoMarketScreen />)} />
        <Route path="/tools" element={requireAuthed(<ToolsScreen />)} />
        <Route path="/profile" element={requireAuthed(<ProfileScreen />)} />
        <Route path="/settings" element={requireAuthed(<SettingsScreen />)} />
        <Route path="/privacy-policy" element={requireAuthed(<PrivacyPolicyScreen />)} />
        <Route path="/feedback" element={requireAuthed(<FeedbackScreen />)} />
        <Route path="/rate-app" element={requireAuthed(<RateAppScreen />)} />
        <Route path="/leaderboard" element={requireAuthed(<LeaderboardScreen />)} />
        <Route path="/edit-profile" element={requireAuthed(<EditProfileScreen />)} />
        <Route path="/module/:moduleId" element={requireAuthed(<ModuleScreen />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
