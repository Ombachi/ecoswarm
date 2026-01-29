export interface User {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  bio?: string;
  ecoPoints: number;
  topConcern: string;
  streak: number;
  badges: Badge[];
  stats: UserStats;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: Date;
}

export interface UserStats {
  co2Saved: number;
  lettersSent: number;
  swarmsJoined: number;
  postsCreated: number;
  treesPlanted: number;
  coursesCompleted: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  createdAt: Date;
  isLiked?: boolean;
}

export interface Swarm {
  id: string;
  name: string;
  description: string;
  goal: string;
  targetSignatures: number;
  currentSignatures: number;
  participants: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  isJoined?: boolean;
}

export interface LetterTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface Recipient {
  id: string;
  name: string;
  title: string;
  organization: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  points: number;
  category: string;
  completed?: boolean;
  progress?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'weekly' | 'special';
  completed?: boolean;
}
