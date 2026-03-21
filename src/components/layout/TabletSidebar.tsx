import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare, ShoppingBag, Mail, GraduationCap, Users, CalendarDays,
  Trophy, Target, Leaf, Settings, Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { icon: MessageSquare, label: 'Agora', path: '/agora' },
  { icon: ShoppingBag, label: 'Market', path: '/ecomarket' },
  { icon: GraduationCap, label: 'Learn', path: '/tools' },
  { icon: Mail, label: 'Letters', path: '/tools' },
  { icon: Users, label: 'Swarms', path: '/swarms' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
  { icon: Trophy, label: 'Challenges', path: '/challenges' },
  { icon: Target, label: 'Ranks', path: '/leaderboard' },
  { icon: Inbox, label: 'Inbox', path: '/inbox' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function TabletSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ecodeveloper')
      .maybeSingle()
      .then(({ data }) => setIsDeveloper(!!data));
  }, [user?.id]);

  const filtered = isDeveloper ? navItems.filter(n => n.label !== 'Challenges') : navItems;

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
