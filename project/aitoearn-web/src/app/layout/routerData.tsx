/**
 * 路由/导航数据配置
 * 包含导航项的图标、路径、翻译键等信息
 */
import React from 'react'

export interface IRouterDataItem {
  // 导航标题
  name: string
  // 翻译键
  translationKey: string
  // 跳转链接
  path?: string
  // 图标
  icon?: React.ReactNode
  // 子导航
  children?: IRouterDataItem[]
}

// Premium handcrafted traditional "National Tide" (国潮) SVGs for localized merchant experience
const DraftBoxIcon = () => (
  // Chinese Folding Fan (折扇) - Representing AI creative artistry
  <svg className="w-5 h-5 text-[#D32F2F] drop-shadow-[0_0_2px_rgba(211,47,47,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18C3 18 6 9 12 9C18 9 21 18 21 18" />
    <line x1="12" y1="21" x2="6" y2="12" />
    <line x1="12" y1="21" x2="9" y2="10.5" />
    <line x1="12" y1="21" x2="12" y2="9.5" />
    <line x1="12" y1="21" x2="15" y2="10.5" />
    <line x1="12" y1="21" x2="18" y2="12" />
    <circle cx="12" cy="21" r="1" fill="currentColor" />
    <path d="M12 21v2" strokeWidth="1.5" />
  </svg>
)

const MissionSquareIcon = () => (
  // Chinese Gold Ingot (元宝) - Representing wealth and explosive orders
  <svg className="w-5 h-5 text-[#E5B25D] drop-shadow-[0_0_2px_rgba(229,178,93,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12C2 12 5 7 12 7C19 7 22 12 22 12C22 12 20 18 12 18C4 18 2 12 2 12Z" fill="currentColor" fillOpacity="0.05" />
    <circle cx="12" cy="11" r="3" fill="#E5B25D" stroke="currentColor" />
    <path d="M6 13.5C6 13.5 9 16 12 16C15 16 18 13.5 18 13.5" />
  </svg>
)

const AiSocialIcon = () => (
  // Chinese Market Drum (堂鼓) - Representing local marketing and attracting crowds
  <svg className="w-5 h-5 text-[#D32F2F] drop-shadow-[0_0_2px_rgba(211,47,47,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8C4 12 4 14 6 18" />
    <path d="M18 8C20 12 20 14 18 18" />
    <ellipse cx="12" cy="8" rx="6" ry="2" fill="currentColor" fillOpacity="0.1" />
    <ellipse cx="12" cy="18" rx="6" ry="2" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" />
    <path d="M6 13h12" strokeDasharray="1,3" />
    <line x1="4" y1="6" x2="8" y2="10" />
    <circle cx="4" cy="6" r="1.2" fill="currentColor" />
    <line x1="20" y1="6" x2="16" y2="10" />
    <circle cx="20" cy="6" r="1.2" fill="currentColor" />
  </svg>
)

const TaskHistoryIcon = () => (
  // Chinese Palace Lantern (宫灯) - Representing recording tasks and lighting history
  <svg className="w-5 h-5 text-[#E5B25D] drop-shadow-[0_0_2px_rgba(229,178,93,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2" />
    <path d="M8 4h8l-1 2H9l-1-2Z" />
    <rect x="6" y="6" width="12" height="10" rx="4" fill="currentColor" fillOpacity="0.05" />
    <path d="M10 6c-2 2-2 8 0 10M14 6c2 2 2 8 0 10" />
    <path d="M8 18h8l-1-2H9l-1 2Z" />
    <path d="M12 18v4" strokeWidth="1.5" />
    <path d="M10 22h4" />
  </svg>
)

const AccountsIcon = () => (
  // Chinese Knot (中国结) - Representing integration, accounts binding, and connection
  <svg className="w-5 h-5 text-[#D32F2F] drop-shadow-[0_0_2px_rgba(211,47,47,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v3M10 5a2 2 0 1 1 4 0" />
    <path d="M12 6.5L17.5 12L12 17.5L6.5 12Z" fill="currentColor" fillOpacity="0.05" />
    <path d="M9 12h6M12 9v6" />
    <path d="M7 10C5.5 10 4.5 11 4.5 12C4.5 13 5.5 14 7 14" />
    <path d="M17 10C18.5 10 19.5 11 19.5 12C19.5 13 18.5 14 17 14" />
    <path d="M10 17v5M14 17v5" strokeWidth="1.5" />
    <path d="M9 22h2M13 22h2" />
  </svg>
)

const AgentAssetsIcon = () => (
  // Chinese Scroll (画卷) - Representing poster design and asset library
  <svg className="w-5 h-5 text-[#E5B25D] drop-shadow-[0_0_2px_rgba(229,178,93,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 6H19M5 18H19" />
    <rect x="5" y="6" width="14" height="12" fill="currentColor" fillOpacity="0.05" />
    <rect x="2" y="4" width="3" height="16" rx="1.2" fill="currentColor" fillOpacity="0.2" />
    <rect x="19" y="4" width="3" height="16" rx="1.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 14C8 14 10 11 12 11C14 11 16 14 16 14" strokeWidth="1.5" />
    <path d="M10 15C10 15 11 13 12 13C13 13 14 15 14 15" strokeWidth="1" />
  </svg>
)

const AcademyIcon = () => (
  // Chinese Scroll / Book (书卷) - Representing learning and academy operations
  <svg className="w-5 h-5 text-[#5F7A61] drop-shadow-[0_0_2px_rgba(95,122,97,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const VipIcon = () => (
  // Golden Crown (皇冠) - Representing VIP subscription and privileges
  <svg className="w-5 h-5 text-[#E5B25D] drop-shadow-[0_0_2px_rgba(229,178,93,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.05" />
    <path d="M3 20h18" strokeWidth="2" />
  </svg>
)

const EcommerceStudioIcon = () => (
  <svg className="w-5 h-5 text-[#E5B25D] drop-shadow-[0_0_2px_rgba(229,178,93,0.35)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="currentColor" fillOpacity="0.05" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export const routerData: IRouterDataItem[] = [
  {
    name: 'Content Management',
    translationKey: 'header.draftBox',
    path: '/draft-box',
    icon: <DraftBoxIcon />,
  },
  {
    name: 'E-commerce Studio',
    translationKey: 'ecommerceStudio',
    path: '/ecommerce-studio',
    icon: <EcommerceStudioIcon />,
  },
  {
    name: 'Mission Square',
    translationKey: 'missionSquare',
    path: '/mission-square',
    icon: <MissionSquareIcon />,
  },
  {
    name: 'AI Publish',
    translationKey: 'aiSocial',
    path: '/ai-social',
    icon: <AiSocialIcon />,
  },
  {
    name: 'Academy',
    translationKey: 'academy',
    path: '/academy',
    icon: <AcademyIcon />,
  },
  {
    name: 'Publish',
    translationKey: 'accounts',
    path: '/accounts',
    icon: <AccountsIcon />,
  },
  {
    name: 'VIP Center',
    translationKey: 'vipCenter',
    path: '/vip',
    icon: <VipIcon />,
  },
  // Tasks moved to notification panel
  {
    name: 'Agent Assets',
    translationKey: 'header.agentAssets',
    path: '/agent-assets',
    icon: <AgentAssetsIcon />,
  },
]

