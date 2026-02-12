import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Wind, Droplets, Sun, Heart, Users, MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

const upliftingStatements = [
  "Together, we're changing the world 🌍",
  "Your voice matters. Make it count today! ✨",
  "Small actions, big impact. Let's go! 💪",
  "Be the change you want to see 🌱",
  "One swarm at a time, we rise 🐝",
  "The future is in your hands 🙌",
  "Every action counts. Start now! 🚀",
  "Unite. Amplify. Transform. 🔥",
  "Your generation, your revolution 💫",
  "Dream big, act bigger 🌟",
];

export function SplashScreen() {
  const navigate = useNavigate();
  const { logout, user } = useApp();
  const [showContent, setShowContent] = useState(true); // Start with true to show immediately
  const [currentDate, setCurrentDate] = useState("");
  const [upliftingMessage, setUpliftingMessage] = useState("");

  useEffect(() => {
    // Set current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("en-KE", options));

    // Random uplifting message
    const randomIndex = Math.floor(Math.random() * upliftingStatements.length);
    setUpliftingMessage(upliftingStatements[randomIndex]);
  }, []);

  const handleGetStarted = () => {
    navigate("/role-select");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 eco-gradient-bg opacity-95" />

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Leaf className="absolute top-20 left-10 w-8 h-8 text-white/20 animate-float" />
        <Wind className="absolute top-40 right-8 w-6 h-6 text-white/20 animate-float stagger-2" />
        <Droplets className="absolute bottom-40 left-16 w-7 h-7 text-white/20 animate-float stagger-3" />
        <Sun className="absolute top-60 left-1/2 w-10 h-10 text-white/20 animate-float stagger-4" />
        <Heart className="absolute bottom-60 right-12 w-6 h-6 text-white/20 animate-float stagger-1" />
        <Users className="absolute top-32 right-20 w-7 h-7 text-white/20 animate-float stagger-3" />
        <MessageCircle className="absolute bottom-32 left-8 w-6 h-6 text-white/20 animate-float stagger-2" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center text-white">
        {/* Logo */}
        <div
          className={`transition-all duration-700 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto animate-pulse-glow">
            <Leaf className="w-14 h-14 text-white" />
          </div>

          <h1 className="text-5xl font-black mb-2 tracking-tight">EcoSwarm</h1>
          <p className="text-lg text-white/80 mb-8">Your Digital Agora</p>
        </div>

        {/* Date and Uplifting Message */}
        <div
          className={`transition-all duration-700 delay-300 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-eco-gold/20 flex items-center justify-center">
                <Sun className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="text-center">
                <p className="text-xs text-white/60">📅 {currentDate}</p>
                <p className="font-semibold text-lg mt-1">{upliftingMessage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`w-full max-w-xs transition-all duration-700 delay-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <button
            onClick={handleGetStarted}
            className="w-full py-4 px-6 bg-card text-primary font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            🌍 Join the Movement
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-4 py-3 px-6 bg-primary-foreground/10 backdrop-blur text-primary-foreground font-semibold rounded-2xl border border-primary-foreground/20 flex items-center justify-center gap-2 hover:bg-primary-foreground/20 transition-all"
          >
            Already have an account? Sign In
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 py-3 px-6 bg-destructive/20 backdrop-blur text-destructive font-semibold rounded-2xl border border-destructive/30 flex items-center justify-center gap-2 hover:bg-destructive/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Bottom text */}
      <div className="relative z-10 text-center pb-8 px-6">
        <p className="text-white/50 text-xs">
          By continuing, you agree to our{" "}
          <button onClick={() => navigate("/terms-of-service")} className="underline hover:text-white/70">
            Terms of Service
          </button>
        </p>
      </div>
    </div>
  );
}
