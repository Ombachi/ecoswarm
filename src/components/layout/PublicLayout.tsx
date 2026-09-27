import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "./PublicFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const item = (path: string, label: string, match: string[]) => (
    <button
      onClick={() => navigate(path)}
      className={`transition-colors hover:text-foreground ${match.includes(pathname) ? "text-foreground font-semibold" : ""}`}
    >
      {label}
    </button>
  );
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-lg font-extrabold tracking-tight">EcoSwarm</span>
          </button>
          <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground">
            {item("/courses", "Courses", ["/courses", "/tools"])}
            {item("/ecomarket", "EcoMarket", ["/ecomarket"])}
            <span className="hidden md:inline">{item("/about", "About", ["/about"])}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/login")}>Sign In</Button>
            <Button size="sm" onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
