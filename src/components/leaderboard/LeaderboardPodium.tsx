import { Crown, Medal } from 'lucide-react';

interface PodiumEntry {
  id: string;
  user_id: string;
  name: string;
  eco_points: number | null;
  avatar_url: string | null;
}

interface LeaderboardPodiumProps {
  top3: PodiumEntry[];
  onNameClick: (entry: PodiumEntry) => void;
}

export function LeaderboardPodium({ top3, onNameClick }: LeaderboardPodiumProps) {
  return (
    <div className="flex items-end justify-center gap-2 mb-6">
      {/* 2nd Place */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xl font-bold text-white mb-2">
          {top3[1].avatar_url ? (
            <img src={top3[1].avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : top3[1].name.charAt(0)}
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-xl text-center w-20">
          <Medal className="w-5 h-5 text-gray-500 mx-auto" />
          <button onClick={() => onNameClick(top3[1])} className="text-xs font-semibold truncate block w-full hover:text-primary transition-colors">
            {top3[1].name}
          </button>
          <p className="text-xs text-muted-foreground">{top3[1].eco_points || 0}</p>
        </div>
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-white mb-2 ring-4 ring-yellow-300/50">
          {top3[0].avatar_url ? (
            <img src={top3[0].avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : top3[0].name.charAt(0)}
        </div>
        <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 px-4 py-3 rounded-t-xl text-center w-24">
          <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
          <button onClick={() => onNameClick(top3[0])} className="text-sm font-bold truncate block w-full hover:text-primary transition-colors">
            {top3[0].name}
          </button>
          <p className="text-xs text-muted-foreground">{top3[0].eco_points || 0}</p>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white mb-2">
          {top3[2].avatar_url ? (
            <img src={top3[2].avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : top3[2].name.charAt(0)}
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-t-xl text-center w-20">
          <Medal className="w-5 h-5 text-amber-600 mx-auto" />
          <button onClick={() => onNameClick(top3[2])} className="text-xs font-semibold truncate block w-full hover:text-primary transition-colors">
            {top3[2].name}
          </button>
          <p className="text-xs text-muted-foreground">{top3[2].eco_points || 0}</p>
        </div>
      </div>
    </div>
  );
}
