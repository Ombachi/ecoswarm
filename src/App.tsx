import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { SplashScreen } from "@/pages/SplashScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { LoginScreen } from "@/pages/LoginScreen";
import { SignupScreen } from "@/pages/SignupScreen";
import { DashboardScreen } from "@/pages/DashboardScreen";
import { AgoraScreen } from "@/pages/AgoraScreen";
import { SwarmsScreen } from "@/pages/SwarmsScreen";
import { ToolsScreen } from "@/pages/ToolsScreen";
import { ProfileScreen } from "@/pages/ProfileScreen";
import { AboutScreen } from "@/pages/AboutScreen";
import { SettingsScreen } from "@/pages/SettingsScreen";
import { LeaderboardScreen } from "@/pages/LeaderboardScreen";
import { EditProfileScreen } from "@/pages/EditProfileScreen";
import { ModuleScreen } from "@/pages/ModuleScreen";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

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
  const { isOnboarded, user, isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isAuthenticated = isOnboarded && user;

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardScreen /> : <Navigate to="/" replace />} />
      <Route path="/agora" element={isAuthenticated ? <AgoraScreen /> : <Navigate to="/" replace />} />
      <Route path="/swarms" element={isAuthenticated ? <SwarmsScreen /> : <Navigate to="/" replace />} />
      <Route path="/tools" element={isAuthenticated ? <ToolsScreen /> : <Navigate to="/" replace />} />
      <Route path="/profile" element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={isAuthenticated ? <SettingsScreen /> : <Navigate to="/" replace />} />
      <Route path="/leaderboard" element={isAuthenticated ? <LeaderboardScreen /> : <Navigate to="/" replace />} />
      <Route path="/edit-profile" element={isAuthenticated ? <EditProfileScreen /> : <Navigate to="/" replace />} />
      <Route path="/module/:moduleId" element={isAuthenticated ? <ModuleScreen /> : <Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
