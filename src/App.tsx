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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isOnboarded, user } = useApp();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isOnboarded && user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SplashScreen />
          )
        }
      />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route
        path="/dashboard"
        element={
          isOnboarded && user ? (
            <DashboardScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/agora"
        element={
          isOnboarded && user ? (
            <AgoraScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/swarms"
        element={
          isOnboarded && user ? (
            <SwarmsScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/tools"
        element={
          isOnboarded && user ? (
            <ToolsScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isOnboarded && user ? (
            <ProfileScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isOnboarded && user ? (
            <SettingsScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/leaderboard"
        element={
          isOnboarded && user ? (
            <LeaderboardScreen />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
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