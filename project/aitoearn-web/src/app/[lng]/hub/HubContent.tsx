'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { navigateToLogin } from '@/utils/auth'
import CanvasLineChart from './components/CanvasLineChart'

interface HubContentProps {
  lng: string
}

interface ModuleItem {
  id: string
  title: string
  subtitle: string
  description: string
  color: string
  shadow: string
  path: string
  gridClass: string
}

const modules: ModuleItem[] = [
  {
    id: 'monetize',
    title: '光弦任务空间',
    subtitle: '创意变现',
    description: '以创意重构连接，发现霓虹光弦高额任务奖励，将极简创作精准变现。',
    color: 'from-[#39FF14] to-[#00FF7F]',
    shadow: 'shadow-green-200/50',
    path: '/mission-square',
    gridClass: 'md:col-span-2 md:row-span-2 min-h-[380px]',
  },
  {
    id: 'publish',
    title: '光流分发中心',
    subtitle: '一键发布',
    description: '一键同步至全网 10+ 顶流内容渠道，智能调度，让发布从未如此轻松。',
    color: 'from-[#FF007F] to-[#FF69B4]',
    shadow: 'shadow-pink-200/50',
    path: '/accounts',
    gridClass: 'md:col-span-2 md:row-span-1 min-h-[180px]',
  },
  {
    id: 'engage',
    title: '智能交互终端',
    subtitle: '自动互动',
    description: 'Aura AI 智体驱动的社交运营智能体，全天候全自动交互，精准捕捉转化点。',
    color: 'from-[#FF007F] to-[#39FF14]',
    shadow: 'shadow-purple-200/50',
    path: '/ai-social',
    gridClass: 'md:col-span-1 md:row-span-1 min-h-[180px]',
  },
  {
    id: 'revenue',
    title: '灵光资产账户',
    subtitle: '收益提现',
    description: '查看您的光弦变现账单明细，安全管理并快速提现至个人账户。',
    color: 'from-[#39FF14] to-[#00E5FF]',
    shadow: 'shadow-cyan-200/50',
    path: '/revenue',
    gridClass: 'md:col-span-1 md:row-span-1 min-h-[180px]',
  },
  {
    id: 'create',
    title: '光弦粒子工厂',
    subtitle: '批量创作',
    description: '重构内容生产流水线，从灵光创意到批量视频/图文，一站式极速生产。',
    color: 'from-[#FF007F] to-[#00E5FF]',
    shadow: 'shadow-peach-200/50',
    path: '/chat',
    gridClass: 'md:col-span-4 md:row-span-1 min-h-[180px]',
  },
]

// Custom glowing vector SVGs
const MonetizeIcon = () => (
  <svg className="w-12 h-12 text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" strokeDasharray="2,2" />
    <path d="M12,6 L18,9.5 L18,14.5 L12,18 L6,14.5 L6,9.5 Z" className="animate-pulse" />
    <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1" strokeOpacity="0.3" />
    <line x1="2" y1="7" x2="22" y2="17" strokeWidth="1" strokeOpacity="0.3" />
    <line x1="2" y1="17" x2="22" y2="7" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="3" fill="#39FF14" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="12" cy="12" r="2.5" fill="black" stroke="#39FF14" strokeWidth="1.5" />
  </svg>
)

const PublishIcon = () => (
  <svg className="w-12 h-12 text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12,18 C15.3,18 18,15.3 18,12 C18,8.7 15.3,6 12,6 C8.7,6 6,8.7 6,12" strokeDasharray="3,3" className="animate-pulse" />
    <path d="M12,21 C17,21 21,17 21,12 C21,7 17,3 12,3 C7,3 3,7 3,12" />
    <line x1="12" y1="12" x2="12" y2="22" strokeWidth="2" />
    <polygon points="12,8 15,13 9,13" fill="#FF007F" />
    <circle cx="12" cy="12" r="2" fill="#00E5FF" />
  </svg>
)

const EngageIcon = () => (
  <svg className="w-12 h-12 text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="5" r="2" fill="#39FF14" />
    <circle cx="5" cy="10" r="2" fill="#FF007F" />
    <circle cx="19" cy="10" r="2" fill="#FF007F" />
    <circle cx="8" cy="18" r="2" fill="#00E5FF" />
    <circle cx="16" cy="18" r="2" fill="#00E5FF" />
    <line x1="12" y1="5" x2="5" y2="10" />
    <line x1="12" y1="5" x2="19" y2="10" />
    <line x1="5" y1="10" x2="8" y2="18" />
    <line x1="19" y1="10" x2="16" y2="18" />
    <line x1="8" y1="18" x2="16" y2="18" strokeDasharray="2,2" />
    <line x1="12" y1="5" x2="12" y2="14" />
    <rect x="10" y="11" width="4" height="4" rx="1" fill="black" stroke="#FF007F" className="animate-spin" style={{ transformOrigin: '12px 13px', animationDuration: '6s' }} />
  </svg>
)

const RevenueIcon = () => (
  <svg className="w-12 h-12 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12,2 L20,6.5 L20,15.5 L12,20 L4,15.5 L4,6.5 Z" />
    <line x1="12" y1="2" x2="12" y2="20" />
    <line x1="4" y1="6.5" x2="12" y2="11" />
    <line x1="20" y1="6.5" x2="12" y2="11" />
    <path d="M7,12 L12,15 L17,12" strokeWidth="1" strokeOpacity="0.5" />
    <polygon points="12,6.5 15,9 12,11.5 9,9" fill="#00E5FF" className="animate-pulse" />
  </svg>
)

const CreateIcon = () => (
  <svg className="w-12 h-12 text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="10" width="8" height="4" rx="1" />
    <line x1="11" y1="12" x2="17" y2="12" strokeWidth="2.5" />
    <circle cx="17" cy="12" r="2.5" fill="#FF007F" className="animate-ping" />
    <circle cx="17" cy="12" r="1.5" fill="#39FF14" />
    <path d="M18,12 Q21,9 22,12 Q21,15 20,12" stroke="#FF007F" strokeDasharray="1,1" className="animate-pulse" />
    <path d="M18,12 Q20,16 22,12" stroke="#00E5FF" />
    <line x1="3" y1="14" x2="3" y2="18" />
    <line x1="7" y1="14" x2="7" y2="18" />
    <line x1="3" y1="18" x2="10" y2="18" />
  </svg>
)

const getModuleIcon = (id: string) => {
  switch (id) {
    case 'monetize':
      return <MonetizeIcon />
    case 'publish':
      return <PublishIcon />
    case 'engage':
      return <EngageIcon />
    case 'revenue':
      return <RevenueIcon />
    case 'create':
      return <CreateIcon />
    default:
      return null
  }
}

// Extra Neon Tech Visual Widgets
const MonetizeDashboard = () => (
  <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-lg space-y-3 font-mono text-xs">
    <div className="flex justify-between items-center text-[10px] text-gray-500">
      <span>光弦瞬时流速 (AURA FLUX RATE)</span>
      <span className="text-[#39FF14] animate-pulse">● LIVE</span>
    </div>
    <div className="h-16 relative overflow-hidden flex items-end">
      <CanvasLineChart />
    </div>
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      <div className="bg-white/5 p-1.5 rounded border border-white/5">
        <div className="text-gray-500">高能奖励池</div>
        <div className="text-white font-bold text-[#FF007F] mt-0.5">120K+ AUR</div>
      </div>
      <div className="bg-white/5 p-1.5 rounded border border-white/5">
        <div className="text-gray-500">创作者活跃度</div>
        <div className="text-white font-bold text-[#39FF14] mt-0.5">98.4%</div>
      </div>
    </div>
  </div>
)

const PublishChannels = () => (
  <div className="mt-4 flex flex-wrap gap-2 items-center">
    <div className="flex items-center gap-1.5 bg-[#FF007F]/10 border border-[#FF007F]/20 px-2 py-1 rounded text-[10px] text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F] animate-pulse" />
      TikTok
    </div>
    <div className="flex items-center gap-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 px-2 py-1 rounded text-[10px] text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
      小红书
    </div>
    <div className="flex items-center gap-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-1 rounded text-[10px] text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
      YouTube
    </div>
    <div className="flex items-center gap-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 px-2 py-1 rounded text-[10px] text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
      抖音
    </div>
  </div>
)

const EngageTerminal = () => (
  <div className="mt-4 p-2 bg-black/80 border border-[#39FF14]/20 rounded font-mono text-[9px] text-[#39FF14] h-20 overflow-hidden relative">
    <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
    <div className="opacity-70">&gt; Social Agent v1.2.0</div>
    <div className="opacity-90">&gt; Status: Listening (24h)</div>
    <div className="opacity-70 text-[#FF007F]">&gt; Engaged: +1,248 users</div>
    <div className="flex items-center">
      <span>&gt; Thread-01: OK</span>
      <span className="w-1 h-3 bg-[#39FF14] ml-1 animate-pulse" />
    </div>
  </div>
)

const RevenueLedger = () => (
  <div className="mt-4 p-3 bg-black/40 border border-[#00E5FF]/10 rounded-lg space-y-1 font-mono">
    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Aura Asset Ledger</div>
    <div className="text-xl font-bold text-[#00E5FF] drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
      82,491.50
      <span className="text-[10px] text-gray-400 ml-1">AUR</span>
    </div>
    <div className="text-[9px] text-[#39FF14] flex items-center gap-1">
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span>+14.2% 今日收益率</span>
    </div>
  </div>
)

const CreateSynthesizer = () => (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full font-mono text-[10px] text-gray-400 bg-black/40 border border-white/5 p-4 rounded-xl">
    <div className="space-y-1">
      <div className="flex justify-between">
        <span>粒子密度 (DENSITY)</span>
        <span className="text-[#39FF14]">65%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-[#39FF14] to-[#00E5FF]" />
        <div className="absolute top-[-2px] left-[65%] w-2 h-2.5 rounded bg-white shadow-[0_0_6px_#00E5FF]" />
      </div>
    </div>

    <div className="space-y-1">
      <div className="flex justify-between">
        <span>渲染流速 (RENDER FLUX)</span>
        <span className="text-[#FF007F]">50%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[50%] bg-gradient-to-r from-[#FF007F] to-[#00E5FF]" />
        <div className="absolute top-[-2px] left-[50%] w-2 h-2.5 rounded bg-white shadow-[0_0_6px_#FF007F]" />
      </div>
    </div>

    <div className="space-y-1">
      <div className="flex justify-between">
        <span>灵感熵值 (ENTROPY)</span>
        <span className="text-[#00E5FF]">82%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[82%] bg-gradient-to-r from-[#00E5FF] to-[#39FF14]" />
        <div className="absolute top-[-2px] left-[82%] w-2 h-2.5 rounded bg-white shadow-[0_0_6px_#39FF14]" />
      </div>
    </div>

    {/* Batch progress */}
    <div className="md:col-span-3 pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
        <span className="text-[9px] text-[#39FF14] uppercase tracking-wider">批量成片流水线正在热合成中...</span>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-gray-500">
        <span>[████████████░░░░░] 72%</span>
      </div>
    </div>
  </div>
)

const renderExtraWidget = (id: string) => {
  switch (id) {
    case 'monetize':
      return <MonetizeDashboard />
    case 'publish':
      return <PublishChannels />
    case 'engage':
      return <EngageTerminal />
    case 'revenue':
      return <RevenueLedger />
    case 'create':
      return <CreateSynthesizer />
    default:
      return null
  }
}

export default function HubContent({ lng }: HubContentProps) {
  const router = useRouter()
  const token = useUserStore(state => state.token)

  const handleCardClick = (path: string) => {
    if (!token) {
      navigateToLogin(`/${lng}${path}`)
      return
    }
    router.push(`/${lng}${path}`)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-black selection:bg-[#FF007F]/20 p-6 md:p-16 flex flex-col items-center relative overflow-hidden">
      {/* CRT Scanline Filter */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />
      {/* Radial dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #39FF14 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4 relative z-20"
      >
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#39FF14] via-[#00E5FF] to-[#FF007F] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)] tracking-wider">
          AuraString 极简内容实验室
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto tracking-widest font-light">
          光弦 · 光流 · 智体 · 批量 —— 专为新一代超级个体打造的赛博智能创作流水线。
        </p>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl relative z-20"
      >
        {modules.map((m) => (
          <motion.div key={m.id} variants={item} className={m.gridClass}>
            <GlassCard 
              className="h-full flex flex-col group relative overflow-hidden cursor-pointer transition-all active:scale-[0.99] border border-white/5 hover:border-[#FF007F]/40 hover:shadow-[0_0_25px_rgba(255,0,127,0.15)] bg-black/60 backdrop-blur-xl p-6"
              onClick={() => handleCardClick(m.path)}
            >
              {/* Radial Blur Glow */}
              <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${m.color} blur-3xl opacity-10 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Glowing Custom Vector SVG Icon */}
                  <div className="mb-6 flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#FF007F]/30 group-hover:bg-[#FF007F]/5 transition-colors">
                      {getModuleIcon(m.id)}
                    </div>
                    {/* Tiny visual tech tag */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${m.color} animate-pulse`} />
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{m.id}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-[#39FF14] tracking-widest uppercase">{m.subtitle}</span>
                    <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FF007F] transition-colors tracking-wide">{m.title}</h3>
                  </div>

                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 font-light">
                    {m.description}
                  </p>
                </div>

                {/* Simulated Console Dashboard Widget */}
                <div>
                  {renderExtraWidget(m.id)}

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[#FF007F] font-bold group/btn">
                    <span className="text-xs tracking-widest uppercase group-hover:text-white transition-colors">立即开启 SYSTEM.ACCESS</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF007F] to-[#00E5FF] flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-1 shadow-[0_0_10px_rgba(255,0,127,0.3)]">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-center text-gray-600 text-[10px] tracking-widest relative z-20 font-mono"
      >
        © 2026 AuraString.cloud | 用极简内容粒子，点亮超级个体的赛博未来
      </motion.div>
    </div>
  )
}

