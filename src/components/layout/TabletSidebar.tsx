import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Leaf, Settings, User, ShoppingBag, MessageSquare, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: ShoppingBag, label: 'Orders', path: '/purchases' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
  { icon: Award, label: 'Certs', path: '/certificates' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function TabletSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const filtered = navItems;

  return (
    <aside className="w-[80px] h-screen sticky top-0 border-r border-border bg-card flex flex-col items-center py-4 overflow-y-auto hide-scrollbar">
      <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center mb-6">
        <Leaf className="w-5 h-5 text-primary-foreground" />
      </div>

      <nav className="flex-1 space-y-1 w-full px-2">
        {filtered.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-medium transition-all',
                isActive
                  ? 'eco-gradient-bg text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
