import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { ProgressRing } from '@/components/common/ProgressRing';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';
import { allBadges } from '@/data/mockData';
import {
  Settings,
  ChevronRight,
  Mail,
  ShoppingBag,
  MessageSquare,
  Trophy,
  Share2,
  Sparkles,
  BookOpen,
  Edit,
} from 'lucide-react';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, isSwahili } = useApp();
  usePageMeta('Profile', 'View your EcoSwarm profile, badges, stats, and environmental impact.');
  const [productCount, setProductCount] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setProductCount(count || 0));
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'ecodeveloper')
      .maybeSingle()
      .then(({ data }) => setIsDeveloper(!!data));
  }, [user]);

  if (!user) return null;

  const profileSlug = encodeURIComponent(user.name.replace(/\s+/g, '-').toLowerCase());

  const statItems = [
    {
      icon: Mail,
      value: user.stats.lettersSent,
      label: isSwahili ? 'Barua Zilizotumwa' : 'Letters Sent',
      color: 'text-secondary',
    },
    {
      icon: MessageSquare,
      value: user.stats.postsCreated,
      label: isSwahili ? 'Hadithi Zilizoshirikiwa' : 'Stories Shared',
      color: 'text-eco-gold',
    },
    ...(!isDeveloper ? [{
      icon: BookOpen,
      value: user.stats.coursesCompleted,
      label: isSwahili ? 'Kozi Zilizokamilika' : 'Courses Done',
      color: 'text-eco-orange',
    }] : []),
    {
      icon: ShoppingBag,
      value: productCount,
      label: isSwahili ? 'Bidhaa' : 'Products Listed',
      color: 'text-primary',
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="eco-gradient-bg px-4 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">
              {isSwahili ? 'Athari Yangu' : 'My Impact'}
            </h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full bg-white/20 text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-contain bg-muted"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-white/80">📍 {user.location}</p>
              {user.bio && (
                <p className="text-white/70 text-sm mt-1 line-clamp-1">{user.bio}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs">
                  🔥 {user.streak} Day Streak
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="p-2 rounded-full bg-white/20 text-white"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EcoPoints Card - Overlapping */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="eco-card-elevated p-6">
          <div className="flex items-center gap-6">
            <ProgressRing progress={65} size={90}>
              <div className="text-center">
                <p className="text-xl font-bold eco-gradient-text">{user.ecoPoints}</p>
                <p className="text-[9px] text-muted-foreground">Points</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">
                Silver {isDeveloper ? 'EcoDeveloper' : 'EcoWarrior'}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                750 more points to Gold
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full eco-gradient-bg rounded-full"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Impact Stats */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isSwahili ? 'Takwimu za Athari' : 'Impact Statistics'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {statItems.map((stat, index) => (
              <div
                key={stat.label}
                className="eco-stat-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground text-center">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-eco-gold" />
              {isSwahili ? 'Beji Zangu' : 'My Badges'}
            </h3>
            <span className="text-sm text-muted-foreground">
              {user.badges.length}/{allBadges.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {allBadges.map((badge) => {
              const isEarned = user.badges.some((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`eco-card p-3 flex flex-col items-center gap-1 ${
                    !isEarned && 'opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-[9px] text-center text-muted-foreground font-medium">
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share Profile */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-secondary" />
            {isSwahili ? 'Shiriki Athari Yangu' : 'Share My Impact'}
          </h3>
          <div className="eco-card p-4">
            <SocialShareButtons
              url={`${window.location.origin}/u/${profileSlug}`}
              title={`🌍 I'm making waves on EcoSwarm!`}
              text={`🏆 ${user.ecoPoints} EcoPoints earned | ✉️ ${user.stats.lettersSent} Letters sent | 📦 ${productCount} Products listed | 🔥 ${user.streak}-day streak!\n\nJoin Africa's Gen Z EcoWarriors movement! Create your impact profile now 👇`}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
