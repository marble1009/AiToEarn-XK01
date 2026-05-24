'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { navigateToLogin } from '@/utils/auth'

interface HubContentProps {
  lng: string
}

interface ModuleItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  shadow: string
  path: string
}

const modules: ModuleItem[] = [
  {
    id: 'monetize',
    title: '光弦任务空间',
    subtitle: '创意变现',
    description: '以创意重构连接，发现霓虹光弦高额任务奖励，将极简创作精准变现。',
    icon: '/assets/icons/hub/monetize.png',
    color: 'from-[#39FF14] to-[#00FF7F]',
    shadow: 'shadow-green-200/50',
    path: '/mission-square',
  },
  {
    id: 'publish',
    title: '光流分发中心',
    subtitle: '一键发布',
    description: '一键同步至全网 10+ 顶流内容渠道，智能调度，让发布从未如此轻松。',
    icon: '/assets/icons/hub/publish.png',
    color: 'from-[#FF007F] to-[#FF69B4]',
    shadow: 'shadow-pink-200/50',
    path: '/accounts',
  },
  {
    id: 'engage',
    title: '智能交互终端',
    subtitle: '自动互动',
    description: 'Aura AI 智体驱动的社交运营智能体，全天候全自动交互，精准捕捉转化点。',
    icon: '/assets/icons/hub/engage.png',
    color: 'from-[#FF007F] to-[#39FF14]',
    shadow: 'shadow-purple-200/50',
    path: '/ai-social',
  },
  {
    id: 'revenue',
    title: '灵光资产账户',
    subtitle: '收益提现',
    description: '查看您的光弦变现账单明细，安全管理并快速提现至个人账户。',
    icon: '/assets/icons/hub/monetize.png',
    color: 'from-[#39FF14] to-[#00E5FF]',
    shadow: 'shadow-cyan-200/50',
    path: '/revenue',
  },
  {
    id: 'create',
    title: '光弦粒子工厂',
    subtitle: '批量创作',
    description: '重构内容生产流水线，从灵光创意到批量视频/图文，一站式极速生产。',
    icon: '/assets/icons/hub/create.png',
    color: 'from-[#FF007F] to-[#00E5FF]',
    shadow: 'shadow-peach-200/50',
    path: '/chat',
  },
]

export default function HubContent({ lng }: HubContentProps) {
  const router = useRouter()
  const token = useUserStore(state => state.token)

  const handleCardClick = (path: string) => {
    // 检查是否登录
    if (!token) {
      // 未登录则弹出全局登录弹窗，并设置登录后重定向路径
      navigateToLogin(`/${lng}${path}`)
      return
    }
    // 已登录则直接跳转
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
    <div className="min-h-screen bg-black selection:bg-[#FF007F]/20 p-8 md:p-16 flex flex-col items-center relative overflow-hidden">
      {/* 赛博扫描线条滤镜 */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />
      {/* 点状网格背景 */}
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
        className="text-center mb-16 space-y-4 relative z-20"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#39FF14] via-[#00E5FF] to-[#FF007F] drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
          AuraString 极简内容实验室
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto tracking-wide">
          光弦 · 光流 · 智体 · 批量 —— 专为新一代超级个体打造的赛博智能创作流水线。
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 w-full max-w-7xl relative z-20"
      >
        {modules.map((m) => (
          <motion.div key={m.id} variants={item}>
            <GlassCard 
              className="h-full flex flex-col group relative overflow-hidden cursor-pointer transition-all active:scale-[0.98] border border-white/5 hover:border-[#FF007F]/30 hover:shadow-[0_0_20px_rgba(255,0,127,0.15)] bg-black/60 backdrop-blur-xl"
              onClick={() => handleCardClick(m.path)}
            >
              {/* Background Glow */}
              <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${m.color} blur-3xl opacity-10 group-hover:opacity-35 transition-opacity`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8 w-24 h-24 relative animate-float">
                  <Image
                    src={m.icon}
                    alt={m.title}
                    fill
                    className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform"
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${m.color} animate-pulse`} />
                    <span className="text-xs font-semibold text-[#39FF14] tracking-wider uppercase">{m.subtitle}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#FF007F] transition-colors">{m.title}</h3>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                  {m.description}
                </p>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[#FF007F] font-medium group/btn">
                  <span className="text-sm">立即开启</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF007F] to-[#00E5FF] flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-1 shadow-[0_0_10px_rgba(255,0,127,0.3)]">
                    <ArrowRight size={16} />
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
        className="mt-24 text-center text-gray-500 text-xs tracking-widest relative z-20"
      >
        © 2026 AuraString.cloud | 用极简内容粒子，点亮超级个体的赛博未来
      </motion.div>
    </div>
  )
}
