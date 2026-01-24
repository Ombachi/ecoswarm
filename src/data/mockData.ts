import { User, Post, Swarm, LetterTemplate, Recipient, LearningModule, Challenge, Badge } from '@/types/ecoswarm';

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
    { id: '3', name: 'Swarm Leader', icon: '🐝', description: 'Joined 5 swarms' },
    { id: '4', name: 'Streak Master', icon: '🔥', description: '7 day streak' },
    { id: '5', name: 'Tree Planter', icon: '🌳', description: 'Contributed to 50 trees' },
  ],
  stats: {
    co2Saved: 520,
    lettersSent: 3,
    swarmsJoined: 5,
    postsCreated: 12,
    treesPlanted: 50,
  },
};

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Wanjiku K.',
    content: 'The drought hit my family\'s farm in Machakos hard this season. We lost 60% of our maize crop. Climate change is real and affecting us NOW. 🌾💔 #ClimateJustice #KenyaFarmers',
    likes: 234,
    comments: 45,
    shares: 89,
    tags: ['ClimateJustice', 'KenyaFarmers'],
    createdAt: new Date('2024-01-15'),
    isLiked: false,
  },
  {
    id: '2',
    userId: '3',
    userName: 'Brian O.',
    content: 'Just witnessed the Nairobi River clean-up with my swarm! 🌊 We removed 200kg of plastic in 3 hours. This is what Gen Z power looks like! Join us next Saturday! #NairobiRiverCleanUp',
    mediaType: 'image',
    likes: 567,
    comments: 123,
    shares: 234,
    tags: ['NairobiRiverCleanUp', 'GenZClimate'],
    createdAt: new Date('2024-01-14'),
    isLiked: true,
  },
  {
    id: '3',
    userId: '4',
    userName: 'Faith M.',
    content: 'Air quality in Nairobi CBD today: UNHEALTHY 🚨 When will our leaders take action? I can barely breathe on my commute. We need electric matatus NOW! #NairobiAir #CleanAirKe',
    likes: 891,
    comments: 234,
    shares: 456,
    tags: ['NairobiAir', 'CleanAirKe'],
    createdAt: new Date('2024-01-13'),
    isLiked: false,
  },
  {
    id: '4',
    userId: '5',
    userName: 'Kevin N.',
    content: 'My school started a composting program and we\'ve diverted 500kg of waste from landfills! 🌱♻️ Small actions, big impact. Who else is composting? #ZeroWasteKe',
    likes: 345,
    comments: 67,
    shares: 123,
    tags: ['ZeroWasteKe', 'SchoolClimate'],
    createdAt: new Date('2024-01-12'),
    isLiked: false,
  },
];

export const mockSwarms: Swarm[] = [
  {
    id: '1',
    name: 'Nairobi River Clean-Up',
    description: 'Join thousands of Gen Z activists working to restore Nairobi River to its former glory. Weekly clean-ups, advocacy, and community engagement.',
    goal: 'Collect 10,000 signatures to petition for river restoration funding',
    targetSignatures: 10000,
    currentSignatures: 7834,
    participants: 2341,
    category: 'Water',
    createdAt: new Date('2023-06-01'),
    isJoined: true,
  },
  {
    id: '2',
    name: 'Clean Air Nairobi',
    description: 'Fighting for breathable air in our city. Advocating for electric public transport, industrial regulations, and green spaces.',
    goal: 'Push for electric matatu pilot program in CBD',
    targetSignatures: 15000,
    currentSignatures: 11234,
    participants: 4567,
    category: 'Air Quality',
    createdAt: new Date('2023-08-15'),
    isJoined: false,
  },
  {
    id: '3',
    name: 'Plant a Million Trees',
    description: 'Reforesting Kenya one tree at a time. Partner with local nurseries and communities to restore degraded lands.',
    goal: 'Plant 1 million trees across Kenya by 2025',
    targetSignatures: 50000,
    currentSignatures: 34567,
    participants: 8901,
    category: 'Reforestation',
    createdAt: new Date('2023-01-01'),
    isJoined: true,
  },
  {
    id: '4',
    name: 'Plastic-Free Kenya',
    description: 'Eliminating single-use plastics from our communities. Education, alternatives, and policy advocacy.',
    goal: 'Ban plastic packaging in 100 supermarkets',
    targetSignatures: 20000,
    currentSignatures: 8765,
    participants: 3210,
    category: 'Waste',
    createdAt: new Date('2023-09-01'),
    isJoined: false,
  },
];

export const mockLetterTemplates: LetterTemplate[] = [
  {
    id: '1',
    title: 'Fund Kenyan Renewables',
    category: 'Energy',
    content: `Dear [Recipient],

I am writing as a concerned young Kenyan citizen to urge immediate action on renewable energy investment.

Kenya has incredible potential for solar, wind, and geothermal energy. Yet, we continue to rely heavily on fossil fuels that harm our health and environment.

[PERSONAL_STORY]

I urge you to:
1. Increase funding for renewable energy projects
2. Create incentives for household solar adoption
3. Phase out coal power plant proposals

Our future depends on the decisions you make today.

Respectfully,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '2',
    title: 'UN Climate Targets 2030',
    category: 'International',
    content: `Dear [Recipient],

As a young advocate from Kenya, I am writing to emphasize the urgent need for stronger climate commitments.

Africa contributes less than 4% of global emissions yet suffers the most severe climate impacts. This is a matter of climate justice.

[PERSONAL_STORY]

I call upon you to:
1. Push for more ambitious NDC targets
2. Ensure climate finance reaches frontline communities
3. Include youth voices in decision-making

The clock is ticking. We need action now.

Sincerely,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '3',
    title: 'Nairobi Air Quality Action',
    category: 'Local',
    content: `Dear [Recipient],

I am a resident of Nairobi deeply concerned about our deteriorating air quality.

Every day, millions of us breathe polluted air that causes respiratory diseases, reduces life expectancy, and affects our quality of life.

[PERSONAL_STORY]

I request immediate action to:
1. Implement stricter vehicle emission standards
2. Expand electric public transport options
3. Increase urban green spaces

Our lungs cannot wait. Please act now.

Best regards,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
];

export const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Hon. Aden Duale',
    title: 'Cabinet Secretary',
    organization: 'Ministry of Environment, Kenya',
  },
  {
    id: '2',
    name: 'Johnson Sakaja',
    title: 'Governor',
    organization: 'Nairobi County',
  },
  {
    id: '3',
    name: 'Patricia Espinosa',
    title: 'Executive Secretary',
    organization: 'UNFCCC',
  },
  {
    id: '4',
    name: 'Your Local MP',
    title: 'Member of Parliament',
    organization: 'National Assembly',
  },
];

export const mockLearningModules: LearningModule[] = [
  {
    id: '1',
    title: 'Advocacy Skills 101',
    description: 'Learn how to effectively communicate your message and influence decision-makers.',
    duration: '15 min',
    points: 30,
    category: 'Skills',
    completed: true,
    progress: 100,
  },
  {
    id: '2',
    title: 'Climate Governance in Kenya',
    description: 'Understand how environmental policies are made and how you can influence them.',
    duration: '20 min',
    points: 40,
    category: 'Knowledge',
    completed: false,
    progress: 45,
  },
  {
    id: '3',
    title: 'Digital Activism Tactics',
    description: 'Master social media campaigns, hashtag movements, and viral content creation.',
    duration: '25 min',
    points: 50,
    category: 'Skills',
    completed: false,
    progress: 0,
  },
  {
    id: '4',
    title: 'Environmental Rights',
    description: 'Know your rights under Kenyan environmental law and international treaties.',
    duration: '18 min',
    points: 35,
    category: 'Knowledge',
    completed: false,
    progress: 0,
  },
  {
    id: '5',
    title: 'Building Coalitions',
    description: 'Learn to organize and lead grassroots environmental movements.',
    duration: '22 min',
    points: 45,
    category: 'Leadership',
    completed: false,
    progress: 0,
  },
];

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Share Your Story',
    description: 'Post about an environmental issue affecting you',
    points: 20,
    type: 'daily',
    completed: false,
  },
  {
    id: '2',
    title: 'Join a Swarm',
    description: 'Become part of a campaign that matters to you',
    points: 30,
    type: 'daily',
    completed: true,
  },
  {
    id: '3',
    title: 'Send an EcoLetter',
    description: 'Make your voice heard by a decision-maker',
    points: 50,
    type: 'weekly',
    completed: false,
  },
];

export const airQualityData = {
  location: 'Nairobi CBD',
  aqi: 85,
  status: 'Moderate',
  pm25: 28.5,
  lastUpdated: new Date(),
};

export const allBadges: Badge[] = [
  { id: '1', name: 'First Steps', icon: '🌱', description: 'Joined EcoSwarm' },
  { id: '2', name: 'Voice Heard', icon: '📢', description: 'Sent first letter' },
  { id: '3', name: 'Swarm Leader', icon: '🐝', description: 'Joined 5 swarms' },
  { id: '4', name: 'Streak Master', icon: '🔥', description: '7 day streak' },
  { id: '5', name: 'Tree Planter', icon: '🌳', description: 'Contributed to 50 trees' },
  { id: '6', name: 'Influencer', icon: '⭐', description: '100 likes on a post' },
  { id: '7', name: 'Policy Maker', icon: '📜', description: 'Sent 10 letters' },
  { id: '8', name: 'Educator', icon: '🎓', description: 'Completed all modules' },
];
