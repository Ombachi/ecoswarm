import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '@/components/common/Confetti';
import { Users, Sparkles } from 'lucide-react';

interface WelcomePostProps {
  post: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: Date;
    tags: string[];
  };
  onSayHi: (userName: string) => void;
}

export function WelcomePost({ post, onSayHi }: WelcomePostProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const isEcoDev = post.tags.includes('ecodeveloper');
  const roleName = isEcoDev ? 'EcoDeveloper' : 'EcoWarrior';
  const newUserName = post.tags.find(t => t.startsWith('welcome_user_'))?.replace('welcome_user_', '') || post.userName;

  useEffect(() => {
    // Show confetti briefly when a welcome post first appears
    const ageMs = Date.now() - new Date(post.createdAt).getTime();
    if (ageMs < 60000) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [post.createdAt]);

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="p-4 animate-slide-up border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent relative overflow-hidden">
        {/* Decorative sparkles */}
        <div className="absolute top-2 right-3 opacity-30">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        {/* Welcome badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-3">
          <Users className="w-3.5 h-3.5" />
          Welcome to the Swarm! 🎉
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(`/profile/${post.userId}`)}
            className="flex-shrink-0 hover:ring-2 hover:ring-primary transition-all rounded-full"
          >
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={newUserName} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary" />
            ) : (
              <div className="w-12 h-12 rounded-full eco-gradient-bg flex items-center justify-center text-white text-lg font-bold ring-2 ring-primary">
                {newUserName.charAt(0)}
              </div>
            )}
          </button>
          <div>
            <button
              onClick={() => navigate(`/profile/${post.userId}`)}
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              @{newUserName}
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isEcoDev
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-primary/15 text-primary'
              }`}>
                {isEcoDev ? '🏢' : '🌿'} {roleName}
              </span>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        <p className="text-foreground leading-relaxed mb-4">
          🌟 A new <span className="font-bold text-primary">{roleName}</span> just joined!
          Welcome <span className="font-bold">@{newUserName}</span>!
          Let's show them some love in the comments 💚
        </p>

        {/* Say Hi button */}
        <button
          onClick={() => onSayHi(newUserName)}
          className="w-full py-2.5 px-4 rounded-xl eco-gradient-bg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          👋 Say Hi to @{newUserName}
        </button>

        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {new Date(post.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </>
  );
}
