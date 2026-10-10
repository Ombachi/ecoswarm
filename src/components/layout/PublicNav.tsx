import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PublicNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Public navigation" className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-16">
        <Link to="/" aria-label="EcoSwarm home" className="flex items-center gap-2 shrink-0"><Leaf className="w-7 h-7 text-primary" /><span className="hidden lg:inline font-extrabold text-lg">EcoSwarm</span></Link>
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {[['/courses', 'Courses'], ['/ecomarket', 'EcoMarket'], ['/merch', 'EcoMerch'], ['/about', 'About']].map(([path, label]) => <Button key={path} asChild variant="ghost" size="sm" className={`shrink-0 px-2 sm:px-3 ${pathname === path ? 'text-primary' : 'text-muted-foreground'}`}><Link to={path}>{label}</Link></Button>)}
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0"><Link to="/login">Sign In</Link></Button>
      </div>
    </nav>
  );
}