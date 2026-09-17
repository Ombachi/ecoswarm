import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  ShoppingBag,
  MessageSquare,
  Award,
  Edit,
  ChevronRight,
} from 'lucide-react';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, isSwahili } = useApp();
  usePageMeta('Profile', 'View and manage your EcoSwarm profile.');

  if (!user) return null;

  const quickLinks = [
    { icon: ShoppingBag, label: isSwahili ? 'Manunuzi Yangu' : 'My Purchases', path: '/purchases' },
    { icon: MessageSquare, label: isSwahili ? 'Ujumbe' : 'Messages', path: '/inbox' },
    { icon: Award, label: isSwahili ? 'Vyeti Vyangu' : 'My Certificates', path: '/certificates' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="eco-gradient-bg px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">
              {isSwahili ? 'Wasifu Wangu' : 'My Profile'}
            </h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full bg-white/20 text-white"
              aria-label="Settings"
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
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
              <p className="text-white/80">📍 {user.location}</p>
              {user.bio && (
                <p className="text-white/70 text-sm mt-1 line-clamp-2">{user.bio}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="p-2 rounded-full bg-white/20 text-white"
              aria-label="Edit profile"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 py-6 max-w-3xl mx-auto w-full space-y-3">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="eco-card w-full p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <link.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 font-medium text-foreground">{link.label}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </AppLayout>
  );
}
