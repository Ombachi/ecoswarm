import { ChevronLeft, Trophy } from 'lucide-react';

interface LeaderboardHeaderProps {
  isSwahili: boolean;
  onBack: () => void;
}

export function LeaderboardHeader({ isSwahili, onBack }: LeaderboardHeaderProps) {
  return (
    <div className="eco-gradient-bg px-4 pt-4 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <button
          onClick={onBack}
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
            {isSwahili ? 'Wanaharakati Bora Kenya' : 'Top EcoWarriors & EcoDevs in Kenya'}
          </p>
        </div>
      </div>
    </div>
  );
}
