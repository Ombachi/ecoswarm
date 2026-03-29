import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardUserCard } from '@/components/leaderboard/LeaderboardUserCard';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardListItem } from '@/components/leaderboard/LeaderboardListItem';
import { Star, Shield, Sprout } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  name: string;
  eco_points: number | null;
  streak: number | null;
  avatar_url: string | null;
  role: string;
  rank: number;
}

export function LeaderboardScreen() {
  const navigate = useNavigate();
  const { user, isSwahili } = useApp();
  usePageMeta('Leaderboard', 'See top EcoWarriors and EcoDevelopers ranked by eco-points and streaks.');
  const [warriors, setWarriors] = useState<LeaderboardEntry[]>([]);
  const [developers, setDevelopers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ecowarrior');
  const [userRank, setUserRank] = useState<number | null>(null);

  const activeList = activeTab === 'ecowarrior' ? warriors : developers;
  const hasPodium = activeList.length >= 3;
  const listEntries = hasPodium ? activeList.slice(3) : activeList;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!user) return;
    const currentList = activeTab === 'ecowarrior' ? warriors : developers;
    const entry = currentList.find(e => e.user_id === user.id);
    setUserRank(entry?.rank ?? null);
  }, [activeTab, warriors, developers, user]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('id, user_id, name, eco_points, streak, avatar_url, role, rank')
        .order('rank', { ascending: true })
        .limit(200);

      if (error) throw error;

      const entries: LeaderboardEntry[] = (data || []).map((e: any) => ({
        id: e.id || '',
        user_id: e.user_id || '',
        name: e.name || 'Anonymous',
        eco_points: e.eco_points,
        streak: e.streak,
        avatar_url: e.avatar_url,
        role: e.role || 'ecowarrior',
        rank: Number(e.rank) || 0,
      }));

      setWarriors(entries.filter(e => e.role === 'ecowarrior'));
      setDevelopers(entries.filter(e => e.role === 'ecodeveloper'));
    } catch (error) {
      console.error('Error fetching leaderboard:', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameClick = (entry: LeaderboardEntry) => {
    navigate(`/profile/${entry.user_id}`);
  };

  return (
    <AppLayout>
      <LeaderboardHeader isSwahili={isSwahili} onBack={() => navigate(-1)} />

      {/* Cohort Tabs */}
      <div className="px-4 -mt-6 relative z-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-white/90 dark:bg-card/90 backdrop-blur shadow-lg rounded-2xl h-12">
            <TabsTrigger value="ecowarrior" className="rounded-xl gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sprout className="w-4 h-4" />
              {isSwahili ? 'Wapiganaji' : 'EcoWarriors'}
            </TabsTrigger>
            <TabsTrigger value="ecodeveloper" className="rounded-xl gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Shield className="w-4 h-4" />
              {isSwahili ? 'Waendelezaji' : 'EcoDevs'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ecowarrior">
            <LeaderboardContent
              entries={activeList}
              listEntries={listEntries}
              hasPodium={hasPodium}
              isLoading={isLoading}
              user={user}
              userRank={userRank}
              onNameClick={handleNameClick}
              emptyLabel={isSwahili ? 'Hakuna data bado' : 'No EcoWarriors yet'}
            />
          </TabsContent>

          <TabsContent value="ecodeveloper">
            <LeaderboardContent
              entries={activeList}
              listEntries={listEntries}
              hasPodium={hasPodium}
              isLoading={isLoading}
              user={user}
              userRank={userRank}
              onNameClick={handleNameClick}
              emptyLabel={isSwahili ? 'Hakuna data bado' : 'No EcoDevelopers yet'}
              isDev
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function LeaderboardContent({
  entries,
  listEntries,
  hasPodium,
  isLoading,
  user,
  userRank,
  onNameClick,
  emptyLabel,
  isDev,
}: {
  entries: LeaderboardEntry[];
  listEntries: LeaderboardEntry[];
  hasPodium: boolean;
  isLoading: boolean;
  user: any;
  userRank: number | null;
  onNameClick: (e: LeaderboardEntry) => void;
  emptyLabel: string;
  isDev?: boolean;
}) {
  return (
    <div className="py-4 space-y-3">
      {userRank && user && (
        <LeaderboardUserCard user={user} userRank={userRank} isDev={isDev} />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="eco-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {hasPodium && (
            <LeaderboardPodium top3={entries.slice(0, 3)} onNameClick={onNameClick} />
          )}

          {listEntries.map((entry, index) => (
            <LeaderboardListItem
              key={entry.id}
              entry={entry}
              index={index}
              onNameClick={onNameClick}
              isDev={isDev}
            />
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{emptyLabel}</p>
              <p className="text-sm text-muted-foreground">Be the first to earn EcoPoints!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
