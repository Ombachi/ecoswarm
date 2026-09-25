import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ChevronLeft,
  Leaf,
  Target,
  Eye,
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Heart,
  Globe,
  Zap,
  BookOpen,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AboutStory } from "@/components/about/AboutStory";

export function AboutScreen() {
  const navigate = useNavigate();
  usePageMeta("About", "Learn about EcoSwarm — Kenya's platform for climate education and sustainable shopping.");

  const features = [
    {
      icon: GraduationCap,
      title: "Climate Academy",
      description: "Take expert-led climate courses and earn certificates.",
      color: "from-eco-orange to-destructive",
    },
    {
      icon: ShoppingBag,
      title: "EcoMarket",
      description: "Discover and buy eco-friendly products from Kenyan sellers.",
      color: "from-secondary to-eco-blue",
    },
    {
      icon: Sparkles,
      title: "EcoMerch",
      description: "Wear the change with sustainable merchandise.",
      color: "from-eco-gold to-eco-orange",
    },
  ];

  const values = [
    { emoji: "🌍", title: "Global Mindset", desc: "Think globally, act locally" },
    { emoji: "🤝", title: "Collective Power", desc: "Together we achieve more" },
    { emoji: "📢", title: "Amplified Voices", desc: "Every voice deserves to be heard" },
    { emoji: "🔥", title: "Passionate Action", desc: "Turn passion into real change" },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="eco-gradient-bg px-4 pt-4 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20 text-white mb-4">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">EcoSwarm</h1>
            <p className="text-white/80">Learn & Shop Sustainably</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 pb-6 space-y-6">
        {/* Mission Card */}
        <div className="eco-card-elevated p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">
            To make climate education and sustainable products accessible to every Kenyan.
          </p>
        </div>

        {/* Vision Card */}
        <div className="eco-card-elevated p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-gold to-eco-orange flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Our Vision</h2>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">
            {" "}
            A climate-literate Kenya where sustainable living is the easy choice.{" "}
          </p>
        </div>

      </div>

      {/* Full story: about, mission, values, why, research, founders, partners */}
      <div className="-mx-0">
        <AboutStory />
      </div>

      <div className="px-4 pb-6 space-y-6 max-w-3xl mx-auto">
        {/* CTA */}
        <div className="eco-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Learn & Shop Green?</h3>
          <p className="text-muted-foreground mb-4">Join EcoSwarm and start your climate journey today.</p>
          <button onClick={() => navigate("/signup")} className="eco-button-primary w-full py-4">
            🌍 Get Started
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">Made with 💚 for You</p>
          <p className="text-xs text-muted-foreground mt-1">© 2026 EcoSwarm. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}
