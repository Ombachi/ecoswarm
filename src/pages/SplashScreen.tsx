import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Wind, Droplets, Sun } from 'lucide-react';
import { airQualityData } from '@/data/mockData';

export function SplashScreen() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const handleGetStarted = () => {
    navigate('/onboarding');
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
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center text-white">
        {/* Logo */}
        <div
          className={`transition-all duration-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto animate-pulse-glow">
            <Leaf className="w-14 h-14 text-white" />
          </div>

          <h1 className="text-5xl font-black mb-2 tracking-tight">
            EcoSwarm
          </h1>
          <p className="text-lg text-white/80 mb-8">
            The Digital Agora for Gen Z Activists
          </p>
        </div>

        {/* AR-style stats overlay */}
        <div
          className={`transition-all duration-700 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Wind className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/60">📍 {airQualityData.location}</p>
                <p className="font-semibold">
                  Air Quality: <span className="text-yellow-300">{airQualityData.status}</span>
                </p>
                <p className="text-xs text-white/60">AQI: {airQualityData.aqi} • PM2.5: {airQualityData.pm25}µg/m³</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`w-full max-w-xs transition-all duration-700 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button
            onClick={handleGetStarted}
            className="w-full py-4 px-6 bg-card text-primary font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            🌍 Get Started
          </button>

          <button 
            onClick={() => navigate('/login')}
            className="w-full mt-4 py-3 px-6 bg-primary-foreground/10 backdrop-blur text-primary-foreground font-semibold rounded-2xl border border-primary-foreground/20 flex items-center justify-center gap-2 hover:bg-primary-foreground/20 transition-all"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>

      {/* Bottom text */}
      <div className="relative z-10 text-center pb-8 px-6">
        <p className="text-white/50 text-xs">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
