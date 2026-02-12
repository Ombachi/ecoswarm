import { useNavigate } from "react-router-dom";
import { Leaf, Shield, Building2 } from "lucide-react";

export function RoleSelectScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 eco-gradient-bg opacity-95" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto">
          <Leaf className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight">Choose Your Role</h1>
        <p className="text-white/70 mb-10 text-sm max-w-xs">
          How do you want to contribute to the movement?
        </p>

        <div className="w-full max-w-sm space-y-4">
          {/* EcoWarrior */}
          <button
            onClick={() => navigate("/signup?role=ecowarrior")}
            className="w-full bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-left hover:bg-white/25 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">🌍 EcoWarrior</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  I want to join campaigns, learn, and take action
                </p>
              </div>
            </div>
          </button>

          {/* EcoDeveloper */}
          <button
            onClick={() => navigate("/signup?role=ecodeveloper")}
            className="w-full bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-left hover:bg-white/25 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/30 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-amber-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">🏢 EcoDeveloper</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  I am an organization/company with eco-products or services to share
                </p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-8 text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
