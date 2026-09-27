import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Leaf, ArrowRight } from "lucide-react";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { PremiumHero } from "@/components/landing/PremiumHero";
import { TwoPathSplit } from "@/components/landing/TwoPathSplit";
import { CoursesPreview } from "@/components/landing/CoursesPreview";
import { MarketHighlights } from "@/components/landing/MarketHighlights";
import { LiveTheChange } from "@/components/landing/LiveTheChange";

export function LandingPage() {
  const navigate = useNavigate();

  usePageMeta(
    "Learn Climate Skills & Shop Sustainable Products",
    "EcoSwarm is Kenya's home for climate education and sustainable shopping. Learn environmental skills and discover vetted eco-friendly products.",
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl eco-gradient-bg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">EcoSwarm</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={() => navigate("/courses")} className="hover:text-foreground transition-colors">Courses</button>
            <button onClick={() => navigate("/ecomarket")} className="hover:text-foreground transition-colors">EcoMarket</button>
            <button onClick={() => scrollTo("live-the-change")} className="hover:text-foreground transition-colors">Live the Change</button>
            <button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About</button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/signup")}
              className="eco-gradient-bg text-primary-foreground border-0"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <PremiumHero />

      {/* ── Two-path split: learn or shop ── */}
      <TwoPathSplit />

      {/* ── Learn: Climate Academy Courses ── */}
      <CoursesPreview />

      {/* ── Shop: Products that don't cost the planet ── */}
      <MarketHighlights />

      {/* ── Live the change ── */}
      <LiveTheChange />

      {/* ── FAQ ── */}
      <LandingFAQ />

      {/* ── CTA Banner ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-3xl p-8 md:p-14 text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Learn & Shop Green?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Join EcoSwarm and turn climate curiosity into everyday action.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/signup")} className="bg-card text-primary hover:bg-card/90 border-0 gap-2 font-bold">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}
                className="border-primary-foreground text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-bold">
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
