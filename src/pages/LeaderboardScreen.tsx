import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { 
  ChevronLeft, 
  Trophy, 
  Medal,
  Flame,
  Crown,
  Star,
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  name: string;
  eco_points: number | null;
  streak: number | null;
  rank: number;
}

export function LeaderboardScreen() {
  const navigate = useNavigate();
  const { user, isSwahili } = useApp();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const hasPodium = leaderboard.length >= 3;
  const listEntries = hasPodium ? leaderboard.slice(3) : leaderboard;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Use the secure leaderboard view instead of querying profiles directly
      // This view only exposes non-sensitive fields: id, user_id, name, eco_points, location, streak, rank
      const { data, error } = await supabase
        .from('leaderboard')
        .select('id, user_id, name, eco_points, streak, rank')
        .order('rank', { ascending: true })
        .limit(100);

      if (error) throw error;

      const rankedData = (data || []).map((entry) => ({
        id: entry.id || '',
        user_id: entry.user_id || '',
        name: entry.name || 'Anonymous',
        eco_points: entry.eco_points,
        streak: entry.streak,
        rank: entry.rank || 0,
      }));

      setLeaderboard(rankedData);

      // Find current user's rank
      if (user) {
        const currentUserEntry = rankedData.find(entry => entry.user_id === user.id);
        if (currentUserEntry) {
          setUserRank(currentUserEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-50 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-50 border-amber-300';
      default:
        return '';
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="eco-gradient-bg px-4 pt-4 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/20 text-white mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSwahili ? 'Ubao wa Viongozi' : 'Leaderboard'}
            </h1>
            <p className="text-white/80 text-sm">
              {isSwahili ? 'Wanaharakati Bora Kenya' : 'Top EcoWarriors in Kenya'}
            </p>
          </div>
        </div>
      </div>

      {/* User Rank Card */}
      {userRank && user && (
        <div className="px-4 -mt-8 relative z-20">
          <div className="eco-card-elevated p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl eco-gradient-bg flex items-center justify-center text-xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{user.name} (You)</p>
              <p className="text-sm text-muted-foreground">📍 {user.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">#{userRank}</p>
              <p className="text-xs text-muted-foreground">{user.ecoPoints} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-4 py-6 space-y-3">
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
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-2 mb-6">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xl font-bold text-white mb-2">
                    {leaderboard[1].name.charAt(0)}
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-t-xl text-center w-20">
                    <Medal className="w-5 h-5 text-gray-500 mx-auto" />
                    <p className="text-xs font-semibold truncate">{leaderboard[1].name}</p>
                    <p className="text-xs text-muted-foreground">{leaderboard[1].eco_points || 0}</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-white mb-2 ring-4 ring-yellow-300/50">
                    {leaderboard[0].name.charAt(0)}
                  </div>
                  <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 px-4 py-3 rounded-t-xl text-center w-24">
                    <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
                    <p className="text-sm font-bold truncate">{leaderboard[0].name}</p>
                    <p className="text-xs text-muted-foreground">{leaderboard[0].eco_points || 0}</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white mb-2">
                    {leaderboard[2].name.charAt(0)}
                  </div>
                  <div className="bg-orange-100 px-4 py-2 rounded-t-xl text-center w-20">
                    <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    <p className="text-xs font-semibold truncate">{leaderboard[2].name}</p>
                    <p className="text-xs text-muted-foreground">{leaderboard[2].eco_points || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            {listEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`eco-card p-4 flex items-center gap-4 animate-slide-up ${getRankBg(entry.rank)}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-12 h-12 rounded-2xl eco-gradient-bg flex items-center justify-center text-lg font-bold text-white">
                  {entry.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">🌍 EcoWarrior</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.eco_points || 0}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Flame className="w-3 h-3 text-eco-orange" />
                    {entry.streak || 0}
                  </p>
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available yet</p>
                <p className="text-sm text-muted-foreground">Be the first to earn EcoPoints!</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}