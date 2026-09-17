import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Home, Leaf, Settings, User, ShoppingBag, MessageSquare, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarFallback } from '@/components/common/AvatarFallback';

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'My Purchases', path: '/purchases' },
    { icon: MessageSquare, label: 'Messages', path: '/inbox' },
    { icon: Award, label: 'My Certificates', path: '/certificates' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[280px] h-screen sticky top-0 border-r border-border bg-card flex flex-col overflow-y-auto hide-scrollbar">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">EcoSwarm</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'eco-gradient-bg text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>


      {/* Mini Profile */}
      {user && (
        <div onClick={() => navigate('/profile')} className="m-3 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <AvatarFallback src={user.avatar} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.location}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
