import { useNavigate } from "react-router-dom";
import { Leaf, Mail, Phone, Globe } from "lucide-react";

export function PublicFooter() {
  const navigate = useNavigate();
  const link = "hover:text-foreground transition-colors";
  return (
    <footer className="border-t border-border/50 py-12 md:py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-lg">EcoSwarm</span>
            </div>
            <p className="text-sm text-muted-foreground">Learn climate skills. Shop sustainable products.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate("/courses")} className={link}>Climate Academy</button></li>
              <li><button onClick={() => navigate("/ecomarket")} className={link}>EcoMarket</button></li>
              <li><button onClick={() => navigate("/about")} className={link}>About EcoSwarm</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate("/terms-of-service")} className={link}>Terms of Service</button></li>
              <li><button onClick={() => navigate("/privacy-policy")} className={link}>Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:hello@ecoswarm.co.ke" className={link}>hello@ecoswarm.co.ke</a></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><a href="tel:+254729304337" className={link}>+254 729 304 337</a></li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4" /><a href="https://ecoswarm.co.ke" target="_blank" rel="noopener noreferrer" className={link}>ecoswarm.co.ke</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EcoSwarm.</p>
          <p>Built with 💚 for the planet</p>
        </div>
      </div>
    </footer>
  );
}
