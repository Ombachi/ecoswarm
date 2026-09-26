import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl eco-gradient-bg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">EcoSwarm</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={() => navigate("/tools")} className="hover:text-foreground transition-colors">Courses</button>
            <button onClick={() => navigate("/ecomarket")} className="hover:text-foreground transition-colors">EcoMarket</button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
            <Button size="sm" onClick={() => navigate("/signup")} className="eco-gradient-bg text-primary-foreground border-0">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-10 mb-8">
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
              <h4 className="font-bold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">Terms of Service</button></li>
                <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:hello@ecoswarm.co.ke" className="hover:text-foreground">hello@ecoswarm.co.ke</a></li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><a href="tel:+254729304337" className="hover:text-foreground">+254 729 304 337</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} EcoSwarm. Built with 💚 for the planet
          </div>
        </div>
      </footer>
    </div>
  );
}
