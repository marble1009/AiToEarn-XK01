export type RewardType = 'CPS' | 'CPE' | 'CPM' | 'FIXED'

export interface Mission {
  id: string
  title: string
  brand: string
  brandLogo: string
  description: string
  coverImage: string
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'RED' | 'All'
  rewardType: RewardType
  rewardValue: string
  estimatedEarnings: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  totalParticipants: number
  deadline: string
  requirements: string[]
}

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Dyson V15 Detect Global Promotion',
    brand: 'Dyson',
    brandLogo: 'https://logo.clearbit.com/dyson.com',
    description: 'Create high-converting short videos demonstrating the laser dust detection feature. Focus on home cleaning scenarios.',
    coverImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
    platform: 'TikTok',
    rewardType: 'CPS',
    rewardValue: '15% Commission',
    estimatedEarnings: '$50 - $1,200',
    difficulty: 'Easy',
    tags: ['Tech', 'Home', 'Cleaning'],
    totalParticipants: 1240,
    deadline: '2026-12-31',
    requirements: ['Video duration > 15s', 'Must show laser feature', 'Add affiliate link in bio'],
  },
  {
    id: 'm2',
    title: 'Lululemon Align Series Lifestyle',
    brand: 'Lululemon',
    brandLogo: 'https://logo.clearbit.com/lululemon.com',
    description: 'Share your daily yoga or lifestyle routine wearing Lululemon Align collection. Premium, aesthetic content preferred.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    platform: 'RED',
    rewardType: 'CPE',
    rewardValue: '$5 per 100 Likes',
    estimatedEarnings: '$20 - $300',
    difficulty: 'Medium',
    tags: ['Fitness', 'Fashion', 'Yoga'],
    totalParticipants: 856,
    deadline: '2026-11-15',
    requirements: ['High-quality photos', 'Tag @lululemon', 'Mention comfort and fabric'],
  },
  {
    id: 'm3',
    title: 'NordVPN Security Awareness Campaign',
    brand: 'NordVPN',
    brandLogo: 'https://logo.clearbit.com/nordvpn.com',
    description: 'Educate your audience about internet privacy and security using NordVPN. Integration in tech or travel videos.',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    platform: 'YouTube',
    rewardType: 'FIXED',
    rewardValue: '$500 per Video',
    estimatedEarnings: '$500',
    difficulty: 'Hard',
    tags: ['Tech', 'Privacy', 'Security'],
    totalParticipants: 120,
    deadline: '2026-10-01',
    requirements: ['Subscribers > 10k', '60s integration', 'Link in description'],
  },
  {
    id: 'm4',
    title: 'Tesla Model 3 Highland Showcase',
    brand: 'Tesla',
    brandLogo: 'https://logo.clearbit.com/tesla.com',
    description: 'Experience and share the new interior and ambient lighting features of the refreshed Model 3.',
    coverImage: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800',
    platform: 'All',
    rewardType: 'CPM',
    rewardValue: '$10 per 1k Views',
    estimatedEarnings: '$100 - $2,000',
    difficulty: 'Medium',
    tags: ['Automotive', 'Tech', 'Tesla'],
    totalParticipants: 3200,
    deadline: '2027-01-01',
    requirements: ['Original footage preferred', 'Focus on new features', 'High engagement required'],
  },
]
