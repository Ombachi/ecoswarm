import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '@/components/common/Confetti';
import { EcoPointsBadge } from '@/components/common/EcoPointsBadge';
import { Trophy, CheckCircle, ChevronRight, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  action_type: string | null;
  target_role: string | null;
  completed?: boolean;
}

export function ChallengesScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (user) {
      checkRole();
      loadChallenges();
    }
  }, [user]);

  const checkRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ecodeveloper')
      .maybeSingle();
    setIsDeveloper(!!data);
    setRoleChecked(true);
  };

  const loadChallenges = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [{ data: challengesData }, { data: completedData }] = await Promise.all([
        supabase.from('challenges').select('*').eq('is_active', true),
        supabase.from('user_challenges').select('challenge_id').eq('user_id', user.id),
      ]);
      const completedIds = completedData?.map(c => c.challenge_id) || [];
      // Only show EcoWarrior challenges (target_role = 'all' or 'ecowarrior')
      const filtered = (challengesData || [])
        .filter(c => {
          const target = c.target_role || 'all';
          return target === 'all' || target === 'ecowarrior';
        })
        .map(c => ({ ...c, completed: completedIds.includes(c.id) }));
      setChallenges(filtered);
    } catch {
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoute = (actionType: string | null) => {
    switch (actionType) {
      case 'post': return '/agora';
      case 'engage': return '/agora';
      case 'ecomarket': return '/ecomarket';
      case 'inbox': return '/inbox';
      case 'letter': return '/tools';
      case 'module': return '/tools';
      default: return '/dashboard';
    }
  };

  const handleStart = (challenge: Challenge) => {
    if (challenge.completed) return;
    toast.info(`🎯 ${challenge.title} — Complete to earn ${challenge.points} pts!`);
    navigate(getRoute(challenge.action_type));
  };

  // Block EcoDevelopers from accessing challenges
  if (roleChecked && isDeveloper) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">EcoWarrior Exclusive</h2>
          <p className="text-muted-foreground mb-6">
            Challenges are exclusively for EcoWarriors to earn EcoPoints through planet-positive actions.
          </p>
          <button onClick={() => navigate('/dashboard')} className="eco-button-primary py-3 px-6">
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showConfetti && <Confetti />}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-eco-gold" /> Challenges
            </h1>
            <p className="text-xs text-muted-foreground">Complete tasks, earn EcoPoints</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No challenges available</p>
            )}
            {challenges.map(challenge => (
              <button
                key={challenge.id}
                onClick={() => handleStart(challenge)}
                disabled={challenge.completed}
                className={`eco-card p-4 flex items-center gap-4 w-full text-left transition-all ${
                  challenge.completed ? 'opacity-60' : 'hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  challenge.completed ? 'eco-gradient-bg' : 'bg-muted'
                }`}>
                  {challenge.completed
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Trophy className="w-5 h-5 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      challenge.type === 'daily' ? 'bg-eco-gold/20 text-eco-gold'
                      : challenge.type === 'weekly' ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/20 text-secondary'
                    }`}>{challenge.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <EcoPointsBadge points={challenge.points} size="sm" />
                  {!challenge.completed && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
