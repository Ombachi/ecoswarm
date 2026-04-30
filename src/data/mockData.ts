import { User, Badge } from '@/types/ecoswarm';

export const mockUser: User = {
  id: '1',
  name: 'Amani',
  location: 'Nairobi',
  ecoPoints: 1250,
  topConcern: 'Air Pollution',
  streak: 7,
  badges: [
    { id: '1', name: 'First Steps', icon: '🌱', description: 'Joined EcoSwarm' },
    { id: '2', name: 'Voice Heard', icon: '📢', description: 'Sent first letter' },
    { id: '3', name: 'Marketplace Pro', icon: '🛒', description: 'Listed 5 products' },
    { id: '4', name: 'Streak Master', icon: '🔥', description: '7 day streak' },
  ],
  stats: {
    co2Saved: 520,
    lettersSent: 3,
    swarmsJoined: 5,
    postsCreated: 12,
    treesPlanted: 0,
    coursesCompleted: 1,
  },
};

export const allBadges: Badge[] = [
  { id: '1', name: 'First Steps', icon: '🌱', description: 'Joined EcoSwarm' },
  { id: '2', name: 'Voice Heard', icon: '📢', description: 'Sent first letter' },
  { id: '3', name: 'Marketplace Pro', icon: '🛒', description: 'Listed 5 products' },
  { id: '4', name: 'Streak Master', icon: '🔥', description: '7 day streak' },
  { id: '5', name: 'Influencer', icon: '⭐', description: '100 likes on a post' },
  { id: '6', name: 'Policy Maker', icon: '📜', description: 'Sent 10 letters' },
  { id: '7', name: 'Educator', icon: '🎓', description: 'Completed all modules' },
  { id: '8', name: 'Community Builder', icon: '🤝', description: 'Listed first product' },
];