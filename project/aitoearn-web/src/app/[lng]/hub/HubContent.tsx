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
    id: 'monetize',
    title: 'Monetize',
    subtitle: '内容赚钱',
    description: '在任务广场发现高额奖励，通过 CPS、CPE 模式将您的创意变现。',
    icon: '/assets/icons/hub/monetize.png',
    color: 'from-[#FF9D6C] to-[#FFC85E]',
    shadow: 'shadow-orange-200/50',
    path: '/mission-square',
  },
  {
    id: 'publish',
    title: 'Publish',
    subtitle: '内容发布',
    description: '一键分发至全球 10+ 主流平台，智能排期，让内容分发变得从未如此简单。',
    icon: '/assets/icons/hub/publish.png',
    color: 'from-[#FFD97D] to-[#FFB347]',
    shadow: 'shadow-yellow-200/50',
    path: '/accounts',
  },
  {
    id: 'engage',
    title: 'Engage',
    subtitle: '内容互动',
    description: 'AI 驱动的社交运营 Agent，自动化回复与评论挖掘，精准捕捉每一份转化机会。',
    icon: '/assets/icons/hub/engage.png',
    color: 'from-[#FFA17F] to-[#FFCCBB]',
    shadow: 'shadow-red-200/50',
    path: '/ai-social',
  },
  {
    id: 'revenue',
    title: 'Revenue',
    subtitle: '收益提现',
    description: '查看您的内容变现收益明细，管理余额并快速提现至您的账户。',
    icon: '/assets/icons/hub/monetize.png', // 暂时使用现有图标
    color: 'from-[#4ADE80] to-[#22C55E]',
    shadow: 'shadow-green-200/50',
    path: '/revenue',
  },
  {
    id: 'create',
    title: 'Create',
    subtitle: '内容创作',
    description: 'Agent 重构内容生产线，从创意到视频/图文成品，一站式 AI 批量生成。',
    icon: '/assets/icons/hub/create.png',
    color: 'from-[#FFE29F] to-[#FFA99F]',
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
    <div className="min-h-screen bg-cream selection:bg-orange-100 p-8 md:p-16 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-warm-gradient">
          AiToEarn Hub
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Monetize · Publish · Engage · Create —— 为“一人公司”打造的 AI 内容营销全链路智能体平台。
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 w-full max-w-7xl"
      >
        {modules.map((m) => (
          <motion.div key={m.id} variants={item}>
            <GlassCard 
              className="h-full flex flex-col group relative overflow-hidden cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => handleCardClick(m.path)}
            >
              {/* Background Glow */}
              <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${m.color} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-8 w-24 h-24 relative animate-float">
                  <Image
                    src={m.icon}
                    alt={m.title}
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${m.color}`} />
                    <span className="text-sm font-semibold text-orange-400 tracking-wider uppercase">{m.subtitle}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800">{m.title}</h3>
                </div>

                <p className="text-gray-500 leading-relaxed flex-grow">
                  {m.description}
                </p>

                <div className="mt-8 pt-6 border-t border-white/50 flex items-center justify-between text-orange-500 font-medium group/btn">
                  <span>立即开始</span>
                  <div className="w-10 h-10 rounded-full bg-warm-gradient flex items-center justify-center text-white transition-transform group-hover/btn:translate-x-1">
                    <ArrowRight size={20} />
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
        className="mt-24 text-center text-gray-400 text-sm"
      >
        © 2026 AiToEarn.ai | 每一位创作者都值得更好的回报
      </motion.div>
    </div>
  )
}
