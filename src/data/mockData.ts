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
  {
    id: '4',
    title: 'Protect Mau Forest',
    category: 'Conservation',
    content: `Dear [Recipient],

I am writing to express grave concern about the ongoing destruction of the Mau Forest Complex, East Africa's largest indigenous montane forest.

The Mau is a critical water tower that feeds major rivers including the Mara, which sustains the Maasai Mara ecosystem and Lake Victoria.

[PERSONAL_STORY]

I urge you to:
1. Halt all illegal encroachment and logging
2. Accelerate the resettlement and rehabilitation program
3. Prosecute those responsible for forest destruction
4. Increase funding for forest rangers and surveillance

The Mau Forest is irreplaceable. We cannot allow its destruction.

Sincerely,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '5',
    title: 'Stop Illegal Wildlife Trade',
    category: 'Wildlife',
    content: `Dear [Recipient],

Kenya's wildlife heritage is under threat from poaching and illegal wildlife trade. Our elephants, rhinos, and other iconic species face extinction if we do not act now.

[PERSONAL_STORY]

I call on you to:
1. Strengthen penalties for wildlife crimes
2. Increase funding for Kenya Wildlife Service
3. Enhance community-based conservation programs
4. Improve international cooperation on wildlife trafficking

Our wildlife is not for sale. Protect Kenya's natural heritage.

Respectfully,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '6',
    title: 'Ban Single-Use Plastics',
    category: 'Waste',
    content: `Dear [Recipient],

Despite Kenya's 2017 plastic bag ban, single-use plastics continue to pollute our environment. Our rivers, oceans, and lands are choking with plastic waste.

[PERSONAL_STORY]

I request immediate action to:
1. Extend the ban to all single-use plastics
2. Promote biodegradable alternatives
3. Invest in plastic recycling infrastructure
4. Educate communities on waste management

A plastic-free Kenya is possible. Lead the way.

Best regards,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '7',
    title: 'Climate-Smart Agriculture',
    category: 'Agriculture',
    content: `Dear [Recipient],

Climate change is devastating Kenya's agricultural sector. Farmers like my family are experiencing unpredictable rains, prolonged droughts, and crop failures.

[PERSONAL_STORY]

I urge you to:
1. Expand irrigation infrastructure
2. Provide farmers with drought-resistant seeds
3. Establish climate information systems for farmers
4. Create insurance schemes for crop losses

Our food security depends on adapting to climate change now.

Sincerely,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
  {
    id: '8',
    title: 'Clean Water Access',
    category: 'Water',
    content: `Dear [Recipient],

Access to clean water remains a challenge for millions of Kenyans. Water scarcity affects health, education, and economic opportunities.

[PERSONAL_STORY]

I call on you to:
1. Invest in water infrastructure in underserved areas
2. Protect our water catchment areas
3. Implement water recycling programs
4. Address water pollution from industries

Clean water is a fundamental right. Ensure all Kenyans have access.

Respectfully,
[YOUR_NAME]
[YOUR_LOCATION]`,
  },
];

export const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Hon. Aden Duale',
    title: 'Cabinet Secretary',
    organization: 'Ministry of Environment, Climate Change and Forestry',
  },
  {
    id: '2',
    name: 'Johnson Sakaja',
    title: 'Governor',
    organization: 'Nairobi County Government',
  },
  {
    id: '3',
    name: 'Dr. Simon Stiell',
    title: 'Executive Secretary',
    organization: 'UNFCCC',
  },
  {
    id: '4',
    name: 'Your Local MP',
    title: 'Member of Parliament',
    organization: 'National Assembly',
  },
  {
    id: '5',
    name: 'Kenya Wildlife Service',
    title: 'Director General',
    organization: 'Kenya Wildlife Service (KWS)',
  },
  {
    id: '6',
    name: 'NEMA Director General',
    title: 'Director General',
    organization: 'National Environment Management Authority',
  },
  {
    id: '7',
    name: 'Water Resources Authority',
    title: 'Director General',
    organization: 'Water Resources Authority (WRA)',
  },
  {
    id: '8',
    name: 'Kenya Forest Service',
    title: 'Chief Conservator of Forests',
    organization: 'Kenya Forest Service (KFS)',
  },
  {
    id: '9',
    name: 'County Environment Committee',
    title: 'Chairperson',
    organization: 'County Government Environment Committee',
  },
  {
    id: '10',
    name: 'UNEP Executive Director',
    title: 'Executive Director',
    organization: 'UN Environment Programme (Nairobi HQ)',
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
  {
    id: '6',
    title: 'Climate Science Basics',
    description: 'Understand the science behind climate change, from greenhouse gases to tipping points.',
    duration: '30 min',
    points: 50,
    category: 'Knowledge',
    completed: false,
    progress: 0,
  },
  {
    id: '7',
    title: 'Public Speaking for Activists',
    description: 'Develop confidence and skills to speak at rallies, town halls, and media interviews.',
    duration: '25 min',
    points: 45,
    category: 'Skills',
    completed: false,
    progress: 0,
  },
  {
    id: '8',
    title: 'Writing Effective Petitions',
    description: 'Craft compelling petitions that gather signatures and drive action.',
    duration: '20 min',
    points: 40,
    category: 'Skills',
    completed: false,
    progress: 0,
  },
  {
    id: '9',
    title: 'Understanding Carbon Footprints',
    description: 'Learn to calculate and reduce your personal and community carbon footprint.',
    duration: '18 min',
    points: 35,
    category: 'Knowledge',
    completed: false,
    progress: 0,
  },
  {
    id: '10',
    title: 'Youth Leadership in Climate Action',
    description: 'Case studies of successful youth climate movements around the world.',
    duration: '28 min',
    points: 50,
    category: 'Leadership',
    completed: false,
    progress: 0,
  },
  {
    id: '11',
    title: 'Sustainable Living Practices',
    description: 'Practical tips for reducing waste, conserving water, and living sustainably.',
    duration: '22 min',
    points: 40,
    category: 'Lifestyle',
    completed: false,
    progress: 0,
  },
  {
    id: '12',
    title: 'Engaging with Local Government',
    description: 'How to participate in county government processes and influence local policy.',
    duration: '25 min',
    points: 45,
    category: 'Governance',
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
  { id: '5', name: 'Influencer', icon: '⭐', description: '100 likes on a post' },
  { id: '6', name: 'Policy Maker', icon: '📜', description: 'Sent 10 letters' },
  { id: '7', name: 'Educator', icon: '🎓', description: 'Completed all modules' },
  { id: '8', name: 'Community Builder', icon: '🤝', description: 'Created a swarm' },
];
