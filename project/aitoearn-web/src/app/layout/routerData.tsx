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

// Handcrafted custom glowing neon SVGs for navigation
const DraftBoxIcon = () => (
  <svg className="w-5 h-5 text-[#39FF14] drop-shadow-[0_0_3px_rgba(57,255,20,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3,3" />
    <path d="M8 8h8M8 12h8M8 16h5" />
    <circle cx="16" cy="16" r="2" fill="#39FF14" className="animate-pulse" />
  </svg>
)

const MissionSquareIcon = () => (
  <svg className="w-5 h-5 text-[#FF007F] drop-shadow-[0_0_3px_rgba(255,0,127,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    <circle cx="12" cy="12" r="1.5" fill="#00E5FF" />
  </svg>
)

const AiSocialIcon = () => (
  <svg className="w-5 h-5 text-[#39FF14] drop-shadow-[0_0_3px_rgba(57,255,20,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 0 0-7.743 16.33L3 21l2.67-1.257A10 10 0 1 0 12 2Z" />
    <circle cx="9" cy="12" r="1" fill="#FF007F" />
    <circle cx="12" cy="12" r="1" fill="#39FF14" />
    <circle cx="15" cy="12" r="1" fill="#00E5FF" />
  </svg>
)

const TaskHistoryIcon = () => (
  <svg className="w-5 h-5 text-[#00E5FF] drop-shadow-[0_0_3px_rgba(0,229,255,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
    <path d="M12 2a10 10 0 0 1 8 4" stroke="#FF007F" className="animate-spin" style={{ transformOrigin: '12px 12px', animationDuration: '8s' }} />
  </svg>
)

const AccountsIcon = () => (
  <svg className="w-5 h-5 text-[#FF007F] drop-shadow-[0_0_3px_rgba(255,0,127,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
    <circle cx="12" cy="8" r="1" fill="#39FF14" />
  </svg>
)

const AgentAssetsIcon = () => (
  <svg className="w-5 h-5 text-[#39FF14] drop-shadow-[0_0_3px_rgba(57,255,20,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
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
    name: 'Task History',
    translationKey: 'tasksHistory',
    path: '/tasks-history',
    icon: <TaskHistoryIcon />,
  },
  {
    name: 'Publish',
    translationKey: 'accounts',
    path: '/accounts',
    icon: <AccountsIcon />,
  },
  // Tasks moved to notification panel
  {
    name: 'Agent Assets',
    translationKey: 'header.agentAssets',
    path: '/agent-assets',
    icon: <AgentAssetsIcon />,
  },
]

