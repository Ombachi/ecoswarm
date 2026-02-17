import { Crown, Medal, Flame } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  name: string;
  eco_points: number | null;
  streak: number | null;
  avatar_url: string | null;
  rank: number;
}

interface LeaderboardListItemProps {
  entry: LeaderboardEntry;
  index: number;
  onNameClick: (entry: LeaderboardEntry) => void;
  isDev?: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2: return <Medal className="w-6 h-6 text-gray-400" />;
    case 3: return <Medal className="w-6 h-6 text-amber-600" />;
    default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/10';
    case 2: return 'bg-gradient-to-r from-gray-100 to-slate-50 border-gray-300 dark:from-gray-800/30 dark:to-slate-800/20';
    case 3: return 'bg-gradient-to-r from-amber-100 to-orange-50 border-amber-300 dark:from-amber-900/20 dark:to-orange-900/10';
    default: return '';
  }
};

export function LeaderboardListItem({ entry, index, onNameClick, isDev }: LeaderboardListItemProps) {
  return (
    <div
      className={`eco-card p-4 flex items-center gap-4 animate-slide-up ${getRankBg(entry.rank)}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="w-10 flex justify-center">
        {getRankIcon(entry.rank)}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white overflow-hidden ${isDev ? 'bg-gradient-to-br from-secondary to-secondary/80' : 'eco-gradient-bg'}`}>
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt="" className="w-full h-full object-contain" />
        ) : entry.name.charAt(0)}
      </div>
      <div className="flex-1">
        <button
          onClick={() => onNameClick(entry)}
          className="font-semibold text-foreground hover:text-primary transition-colors text-left"
        >
          {entry.name}
        </button>
        <p className="text-xs text-muted-foreground">{isDev ? '🛡️ EcoDeveloper' : '🌍 EcoWarrior'}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">{entry.eco_points || 0}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
          <Flame className="w-3 h-3 text-eco-orange" />
          {entry.streak || 0}
        </p>
      </div>
    </div>
  );
}
