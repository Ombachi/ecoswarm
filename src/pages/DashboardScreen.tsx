import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { ProgressRing } from '@/components/common/ProgressRing';
import { EcoPointsBadge } from '@/components/common/EcoPointsBadge';
import { SwahiliToggle } from '@/components/common/SwahiliToggle';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import {
  MessageSquare,
  Users,
  Mail,
  ChevronRight,
  Flame,
  TreePine,
  Moon,
  Sun,
  Target,
  Eye,
  Sparkles,
  Info,
  Download,
  CheckCircle,
} from 'lucide-react';
import { mockChallenges } from '@/data/mockData';

export function DashboardScreen() {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode, isSwahili } = useApp();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (!user) return null;

  const dailyChallenge = mockChallenges.find((c) => c.type === 'daily' && !c.completed);

  const quickActions = [
    {
      icon: MessageSquare,
      label: isSwahili ? 'Agora Square' : 'Agora Square',
      color: 'from-primary to-secondary',
      path: '/agora',
    },
    {
      icon: Users,
      label: isSwahili ? 'Join Swarm' : 'Join Swarm',
      color: 'from-secondary to-eco-blue',
      path: '/swarms',
    },
    {
      icon: Mail,
      label: isSwahili ? 'Send Letter' : 'Send Letter',
      color: 'from-eco-gold to-eco-orange',
      path: '/tools',
    },
  ];

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {isSwahili ? 'Habari,' : 'Hello,'} 👋
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {user.name} <span className="text-muted-foreground font-normal">from {user.location}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SwahiliToggle />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* EcoPoints Card */}
        <div className="eco-card-elevated p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full eco-gradient-bg rounded-full blur-2xl" />
          </div>
          <div className="flex items-center gap-6">
            <ProgressRing progress={65} size={100}>
              <div className="text-center">
                <p className="text-2xl font-bold eco-gradient-text">{user.ecoPoints}</p>
                <p className="text-[10px] text-muted-foreground">EcoPoints</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-eco-orange" />
                <span className="font-bold text-foreground">{user.streak} Day Streak!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isSwahili
                  ? 'Uko karibu kufikia kiwango kipya!'
                  : "You're close to the next level!"}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full eco-gradient-bg rounded-full transition-all"
                  style={{ width: '65%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">750 more to Gold Changemaker</p>
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="eco-card p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              {isSwahili ? 'Dhamira' : 'Mission'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Empower Gen Z to drive social change across Kenya
            </p>
          </div>
          <div className="eco-card p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eco-gold to-eco-orange flex items-center justify-center mb-2">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              {isSwahili ? 'Maono' : 'Vision'}
            </h3>
            <p className="text-xs text-muted-foreground">
              A Kenya where every young voice sparks action
            </p>
          </div>
        </div>

        {/* About Link */}
        <button
          onClick={() => navigate('/about')}
          className="w-full eco-card p-4 flex items-center gap-4 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-eco-blue flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground text-sm">
              {isSwahili ? 'Kuhusu EcoSwarm' : 'About EcoSwarm'}
            </p>
            <p className="text-xs text-muted-foreground">
              Learn why we built this platform
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="eco-card p-4 border-l-4 border-l-eco-gold">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isSwahili ? 'Changamoto ya Leo' : 'Daily Challenge'}
                </p>
                <h3 className="font-semibold text-foreground">{dailyChallenge.title}</h3>
                <p className="text-sm text-muted-foreground">{dailyChallenge.description}</p>
              </div>
              <EcoPointsBadge points={dailyChallenge.points} size="sm" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">
            {isSwahili ? 'Hatua za Haraka' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="eco-card p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* What You Can Do */}
        <div>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-eco-gold" />
            {isSwahili ? 'Unaweza Kufanya Nini' : 'What You Can Do'}
          </h2>
          <div className="eco-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">📢</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Share Your Story</p>
                <p className="text-xs text-muted-foreground">Post in Agora Square</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-lg">🐝</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Join a Swarm</p>
                <p className="text-xs text-muted-foreground">Unite for collective action</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-eco-gold/10 flex items-center justify-center text-lg">✉️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Write to Leaders</p>
                <p className="text-xs text-muted-foreground">Use EcoLetter Forge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="eco-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {isSwahili ? 'Athari Yako' : 'Your Impact'}
            </h2>
            <button
              onClick={() => navigate('/profile')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              {isSwahili ? 'Ona zaidi' : 'See all'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="eco-stat-card">
              <TreePine className="w-6 h-6 text-primary" />
              <p className="text-xl font-bold text-foreground">{user.stats.treesPlanted}</p>
              <p className="text-[10px] text-muted-foreground">Trees Planted</p>
            </div>
            <div className="eco-stat-card">
              <Mail className="w-6 h-6 text-secondary" />
              <p className="text-xl font-bold text-foreground">{user.stats.lettersSent}</p>
              <p className="text-[10px] text-muted-foreground">Letters Sent</p>
            </div>
            <div className="eco-stat-card">
              <Users className="w-6 h-6 text-eco-gold" />
              <p className="text-xl font-bold text-foreground">{user.stats.swarmsJoined}</p>
              <p className="text-[10px] text-muted-foreground">Swarms Joined</p>
            </div>
          </div>
        </div>

        {/* PWA Install Banner */}
        <div className="eco-card p-4 bg-gradient-to-r from-eco-green-light to-eco-blue-light border-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full eco-gradient-bg flex items-center justify-center flex-shrink-0">
              {isInstalled ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                {isInstalled ? 'EcoSwarm Installed!' : 'Install EcoSwarm'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isInstalled 
                  ? 'Thanks for installing! Enjoy the app.' 
                  : 'Works offline! Earn 50 EcoPoints 🎁'}
              </p>
            </div>
            {!isInstalled && (
              <button 
                onClick={promptInstall}
                className="eco-button-primary py-2 px-4 text-sm"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}