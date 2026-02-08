import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChevronLeft, Leaf, Target, Eye, Sparkles, Users, MessageSquare, Mail, Heart, Globe, Zap } from "lucide-react";

export function AboutScreen() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Agora Square",
      description: "Share your stories, ideas, and experiences with a community that cares.",
      color: "from-primary to-secondary",
    },
    {
      icon: Users,
      title: "Swarm Campaigns",
      description: "Unite with others on causes that matter. Collective action for real impact.",
      color: "from-secondary to-eco-blue",
    },
    {
      icon: Mail,
      title: "EcoLetter Forge",
      description: "Generate powerful advocacy letters to decision-makers with AI assistance.",
      color: "from-eco-gold to-eco-orange",
    },
    {
      icon: Sparkles,
      title: "Capacity Hub",
      description: "Learn, grow, and earn points while building your activism skills.",
      color: "from-eco-orange to-destructive",
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
            <p className="text-white/80">The Digital Agora for Gen Z</p>
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
              <p className="text-sm text-muted-foreground">Why we exist</p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">
            To amplify voices,connect passions and transform digital engagement into real-world impact
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
              <p className="text-sm text-muted-foreground">Where we're headed</p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">A digital agora for collective impact</p>
        </div>

        {/* Why EcoSwarm */}
        <div>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Why EcoSwarm?
          </h2>
          <div className="eco-card p-5 bg-gradient-to-br from-eco-green-light to-eco-blue-light border-none">
            <p className="text-foreground leading-relaxed mb-4">
              We built EcoSwarm because we believe that <strong>Gen Z has the power to reshape Kenya</strong> — but only
              if they have the right tools.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-eco-gold flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-sm">
                  <strong>Social media is loud, but action is quiet.</strong> We bridge that gap with gamification and
                  real tools for advocacy.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-sm">
                  <strong>Issues are interconnected.</strong> From climate to mental health, unemployment to corruption
                  — your voice matters on all fronts.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-sm">
                  <strong>Collective action beats individual effort.</strong> Swarms make movements unstoppable.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h2 className="font-bold text-foreground mb-4">Our Values</h2>
          <div className="grid grid-cols-2 gap-3">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="eco-card p-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-3xl mb-2 block">{value.emoji}</span>
                <h3 className="font-semibold text-foreground text-sm">{value.title}</h3>
                <p className="text-xs text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-eco-gold" />
            What You Can Do
          </h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="eco-card p-4 flex items-start gap-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="eco-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Make an Impact?</h3>
          <p className="text-muted-foreground mb-4">Join thousands of Gen Z changemakers across Kenya.</p>
          <button onClick={() => navigate("/signup")} className="eco-button-primary w-full py-4">
            🌍 Join the Movement
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">Made with 💚 for Kenya's Gen Z</p>
          <p className="text-xs text-muted-foreground mt-1">© 2026 EcoSwarm. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}
