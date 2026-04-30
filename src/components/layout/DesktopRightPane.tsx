import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Users, Trophy, ChevronRight, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KenyaHeatMap } from '@/components/heatmap/KenyaHeatMap';
import { AccountabilityWidget } from '@/components/accountability/AccountabilityWidget';

interface MiniSwarm {
  id: string;
  name: string;
  current_signatures: number;
  target_signatures: number;
  participants: number;
}

interface MiniChallenge {
  id: string;
  title: string;
  points: number;
  completed: boolean;
}

const climateDatesShort = [
  { date: '03-21', title: 'International Day of Forests', emoji: '🌳' },
  { date: '03-22', title: 'World Water Day', emoji: '💧' },
  { date: '04-22', title: 'Earth Day', emoji: '🌍' },
  { date: '06-05', title: 'World Environment Day', emoji: '🌱' },
  { date: '06-08', title: 'World Oceans Day', emoji: '🐋' },
];

function getNextDates() {
  const now = new Date();
  const year = now.getFullYear();
  return climateDatesShort
    .map(d => {
      const [m, day] = d.date.split('-').map(Number);
      let full = new Date(year, m - 1, day);
      if (full < now) full = new Date(year + 1, m - 1, day);
      const daysUntil = Math.ceil((full.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...d, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);
}

export function DesktopRightPane() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [swarms, setSwarms] = useState<MiniSwarm[]>([]);
  const [challenges, setChallenges] = useState<MiniChallenge[]>([]);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const upcoming = getNextDates();

  useEffect(() => {
    if (!user) return;

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ecodeveloper')
      .maybeSingle()
      .then(({ data }) => setIsDeveloper(!!data));

    supabase
      .from('swarms')
      .select('id, name, current_signatures, target_signatures, participants')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setSwarms(data || []));

    loadChallenges();
  }, [user?.id]);

  const loadChallenges = async () => {
    if (!user) return;
    const { data: all } = await supabase.from('challenges').select('*').eq('is_active', true).eq('type', 'daily').limit(3);
    const { data: completed } = await supabase.from('user_challenges').select('challenge_id').eq('user_id', user.id);
    const completedIds = completed?.map(c => c.challenge_id) || [];
    setChallenges((all || []).map((c: any) => ({ id: c.id, title: c.title, points: c.points, completed: completedIds.includes(c.id) })));
  };

  return (
    <aside className="w-[320px] h-screen sticky top-0 border-l border-border bg-card overflow-y-auto hide-scrollbar p-4 space-y-5">
      {/* Eco Calendar */}
      <div>
        <button
          onClick={() => navigate('/calendar')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Eco Calendar
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="space-y-2">
          {upcoming.map(d => (
            <div key={d.date} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate('/calendar')}>
              <span className="text-2xl">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.daysUntil === 0 ? '🔴 Today!' : `in ${d.daysUntil} days`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Swarms */}
      <div>
        <button
          onClick={() => navigate('/swarms')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" /> Trending Swarms
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="space-y-3">
          {swarms.map(s => {
            const pct = s.target_signatures > 0 ? Math.min((s.current_signatures / s.target_signatures) * 100, 100) : 0;
            return (
              <div key={s.id} className="p-3 rounded-xl border border-border/50 bg-card space-y-2">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <Progress value={pct} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.participants} members</span>
                  <button
                    onClick={() => navigate('/swarms')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Join →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Heat Map */}
      <KenyaHeatMap />

      {/* Wall of Accountability */}
      <AccountabilityWidget />

      {/* Daily Challenges - EcoWarrior only */}
      {!isDeveloper && (
        <div>
          <button
            onClick={() => navigate('/challenges')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-eco-gold" /> Daily Challenges
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="space-y-2">
            {challenges.map(c => (
              <div
                key={c.id}
                className={`flex items-center gap-3 p-3 rounded-xl border border-border/50 transition-colors ${c.completed ? 'opacity-60' : 'hover:bg-muted/50 cursor-pointer'}`}
                onClick={() => !c.completed && navigate('/challenges')}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${c.completed ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground'}`}>
                  {c.completed && <Target className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${c.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{c.title}</p>
                </div>
                <span className="text-xs font-bold text-eco-gold">+{c.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
