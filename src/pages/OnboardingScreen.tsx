import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { mockUser } from "@/data/mockData";
import { ChevronRight, MapPin, Leaf, Sparkles } from "lucide-react";
import { kenyanCounties } from "@/data/kenyanCounties";

const concerns = [
  { id: "pollution", label: "Air Pollution", emoji: "💨" },
  { id: "drought", label: "Drought & Water", emoji: "🌵" },
  { id: "deforestation", label: "Deforestation", emoji: "🌳" },
  { id: "waste", label: "Plastic Waste", emoji: "♻️" },
  { id: "wildlife", label: "Wildlife", emoji: "🦁" },
  { id: "energy", label: "Clean Energy", emoji: "⚡" },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { setUser, setIsOnboarded, showNotification } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Nairobi");
  const [country, setCountry] = useState("");
  const [selectedConcern, setSelectedConcern] = useState("");

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const user = {
        ...mockUser,
        name: name || "Activist",
        location,
        topConcern: selectedConcern,
        ecoPoints: 10,
      };
      setUser(user);
      setIsOnboarded(true);
      showNotification("Welcome to EcoSwarm! 🌍", 10);
      navigate("/dashboard");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <span className="text-4xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">What should we call you?</h2>
            <p className="text-muted-foreground mb-6">Your name will appear on your profile and posts</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="eco-input text-center text-lg"
              autoFocus
            />
          </div>
        );

      case 1:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Where are you based?</h2>
            <p className="text-muted-foreground mb-6">We will show you local environmental issues and swarms</p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">County</p>
              <select value={location} onChange={(e) => { setLocation(e.target.value); if (e.target.value !== "International (Outside Kenya)") setCountry(""); }} className="eco-input">
                {kenyanCounties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {location === "International (Outside Kenya)" && (
              <div className="space-y-2 mt-3">
                <p className="text-sm text-muted-foreground">Your Country</p>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Uganda, Tanzania, Nigeria..."
                  className="eco-input"
                  autoFocus
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">What matters most to you?</h2>
            <p className="text-muted-foreground mb-6">We will personalize your feed and swarm recommendations</p>
            <div className="grid grid-cols-2 gap-3">
              {concerns.map((concern) => (
                <button
                  key={concern.id}
                  onClick={() => setSelectedConcern(concern.label)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedConcern === concern.label
                      ? "border-primary bg-eco-green-light"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{concern.emoji}</span>
                  <span className="font-medium text-sm">{concern.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="p-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "eco-gradient-bg" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">{renderStep()}</div>

      {/* Footer */}
      <div className="p-6">
        <button
          onClick={handleNext}
          disabled={(step === 0 && !name) || (step === 1 && (!location || (location === "International (Outside Kenya)" && !country.trim()))) || (step === 2 && !selectedConcern)}
          className="w-full eco-button-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {step === 2 ? (
            <>
              <Sparkles className="w-5 h-5" />
              Start My Journey
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {step === 2 && (
          <p className="text-center text-muted-foreground text-sm mt-4">
            🎉 You'll earn <span className="text-primary font-bold">+10 EcoPoints</span> for joining!
          </p>
        )}
      </div>
    </div>
  );
}
