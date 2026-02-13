interface LeaderboardUserCardProps {
  user: { name: string; location: string; ecoPoints: number };
  userRank: number;
  isDev?: boolean;
}

export function LeaderboardUserCard({ user, userRank, isDev }: LeaderboardUserCardProps) {
  return (
    <div className="eco-card-elevated p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white ${isDev ? 'bg-gradient-to-br from-secondary to-secondary/80' : 'eco-gradient-bg'}`}>
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
  );
}
