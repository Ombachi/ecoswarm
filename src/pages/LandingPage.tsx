import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Leaf, Globe, ArrowRight, Mail, Phone } from "lucide-react";
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
            <button onClick={() => scrollTo("courses")} className="hover:text-foreground transition-colors">Courses</button>
            <button onClick={() => scrollTo("market")} className="hover:text-foreground transition-colors">EcoMarket</button>
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
      {/* ── Two-path split: learn or shop ── */}
      <TwoPathSplit />

      {/* ── Learn: Climate Academy Courses ── */}
      <CoursesPreview />

      {/* ── Shop: Products that don't cost the planet ── */}
      <MarketHighlights />

      {/* ── Live the change ── */}
      <LiveTheChange />

      {/* ── CTA Banner ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="eco-gradient-bg rounded-3xl p-8 md:p-14 text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Learn & Shop Green?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Join EcoSwarm and turn climate curiosity into everyday action.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-card text-primary hover:bg-card/90 border-0 gap-2 font-bold"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-primary-foreground text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 font-bold"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-12 md:py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg eco-gradient-bg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-extrabold text-lg">EcoSwarm</span>
              </div>
              <p className="text-sm text-muted-foreground">Learn climate skills. Shop sustainable products.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollTo("courses")} className="hover:text-foreground transition-colors">Climate Academy</button></li>
                <li><button onClick={() => scrollTo("market")} className="hover:text-foreground transition-colors">EcoMarket</button></li>
                <li><button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About EcoSwarm</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigate("/terms-of-service")}
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy-policy")}
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@ecoswarm.co.ke" className="hover:text-foreground transition-colors">
                    hello@ecoswarm.co.ke
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+254729304337" className="hover:text-foreground transition-colors">
                    +254 729 304 337
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a
                    href="https://ecoswarm.co.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    ecoswarm.co.ke
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} EcoSwarm.</p>
            <p>Built with 💚 for the planet</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
