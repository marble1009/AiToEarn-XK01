export type RewardType = 'CPS' | 'CPE' | 'CPM' | 'FIXED'

export interface Mission {
  id: string
  title: string
  brand: string
  brandLogo: string
  description: string
  coverImage: string
  platform: 'DY' | 'RED' | 'KS' | 'WX' | 'All'
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
    title: '「清凉生椰拿铁」夏日新品探店推广',
    brand: '精品咖啡店',
    brandLogo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200',
    description: '发布您购买生椰拿铁的精美实物实拍或到店Vlog，搭配 AI 创作室自动生成的爆款清凉推广文案，吸引附近写字楼食客消费。',
    coverImage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
    platform: 'RED',
    rewardType: 'CPS',
    rewardValue: '核销每单返佣 10%',
    estimatedEarnings: '150 - 1,500 积分',
    difficulty: 'Easy',
    tags: ['生椰拿铁', '探店下午茶', '打卡今日咖啡'],
    totalParticipants: 1840,
    deadline: '2026-10-31',
    requirements: ['小红书平台发文不少于50字', '必须包含门店或饮品实拍', '正文带标签 #今日咖啡清空计划'],
  },
  {
    id: 'm2',
    title: '「大杯冰爽圣代」同城打卡挑战',
    brand: '特色茶饮店',
    brandLogo: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=200',
    description: '前往附近的茶饮门店与创意立牌合照，使用 AI 工具箱自动拼贴生成魔性节奏短视频并配上专属欢乐音乐，吸引周边家长带娃到店。',
    coverImage: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800',
    platform: 'DY',
    rewardType: 'CPE',
    rewardValue: '满 50 赞送创意周边 + 100 积分',
    estimatedEarnings: '50 - 200 积分',
    difficulty: 'Easy',
    tags: ['冰爽圣代', '夏日果茶', '打卡挑战'],
    totalParticipants: 2450,
    deadline: '2026-11-15',
    requirements: ['包含特色品牌立牌或圣代实物', '使用经典欢乐活力BGM', '文案体现高性价比与清爽'],
  },
  {
    id: 'm3',
    title: '「深夜食堂·捞面特技秀」吃货打卡Vlog',
    brand: '同城特色火锅',
    brandLogo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=200',
    description: '在火锅店用餐时，录制一段捞面师现场表演或趣味蘸料调制短视频。由 AI 创意工坊智能合成一段带深夜诱惑氛围 of 爆款吃货探店小视频。',
    coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
    platform: 'DY',
    rewardType: 'CPM',
    rewardValue: '每 1000 播放结算 10 积分',
    estimatedEarnings: '200 - 3,000 积分',
    difficulty: 'Medium',
    tags: ['深夜火锅', '捞面表演', '吃货探店Vlog'],
    totalParticipants: 3200,
    deadline: '2026-12-31',
    requirements: ['包含捞面表演或用餐热烈场景', '视频必须添加火锅店定位', '原创手机实拍镜头'],
  },
  {
    id: 'm4',
    title: '「芝芝多肉葡萄」经典重现新品打卡大赏',
    brand: '手作鲜果茶',
    brandLogo: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200',
    description: '实拍饮品店经典新品多肉葡萄的拉丝与饱满果肉，采用温馨雅致的排版滤镜，搭配 AI 创作的高诱惑力下午茶推荐语。',
    coverImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    platform: 'RED',
    rewardType: 'FIXED',
    rewardValue: '成功发布即可得 80 积分',
    estimatedEarnings: '80 积分',
    difficulty: 'Medium',
    tags: ['多肉葡萄', '手作果茶', '白领下午茶打卡'],
    totalParticipants: 1540,
    deadline: '2026-09-30',
    requirements: ['上传不少于3张无水印高清细节图', '字数大于50字且分享真实口感', '必须关联多肉葡萄打卡话题'],
  },
]
