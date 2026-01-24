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

          <button className="w-full mt-4 py-3 px-6 bg-primary-foreground/10 backdrop-blur text-primary-foreground font-semibold rounded-2xl border border-primary-foreground/20 flex items-center justify-center gap-2 hover:bg-primary-foreground/20 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
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
