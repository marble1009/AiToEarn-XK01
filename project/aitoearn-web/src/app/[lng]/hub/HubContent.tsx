'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { ArrowRight, Sparkles, PenTool, Video, ShieldCheck, DollarSign, Layers } from 'lucide-react'
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

// Premium cozy vector icons styled in sage green, sunset peach, and gold
const MonetizeIcon = () => (
  <Sparkles className="w-8 h-8 text-[#5F7A61] dark:text-[#7FA382]" />
)

const PublishIcon = () => (
  <Layers className="w-8 h-8 text-[#F3A390] dark:text-[#F6B4A5]" />
)

const EngageIcon = () => (
  <ShieldCheck className="w-8 h-8 text-[#E5B25D] dark:text-[#E9C482]" />
)

const RevenueIcon = () => (
  <DollarSign className="w-8 h-8 text-[#5F7A61] dark:text-[#E5B25D]" />
)

const CreateIcon = () => (
  <PenTool className="w-8 h-8 text-[#F3A390] dark:text-[#E5B25D]" />
)

const EcommerceIcon = () => (
  <Layers className="w-8 h-8 text-[#E5B25D] dark:text-[#E9C482]" />
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
    case 'ecommerce':
      return <EcommerceIcon />
    default:
      return null
  }
}

// Extra Custom UI widgets matching the Notion-style Golden Fusion with full bilingual support
const MonetizeDashboard = ({ lng }: { lng: string }) => (
  <div className="mt-4 p-3 bg-white/40 dark:bg-[#1C261F]/40 border border-[#5F7A61]/10 rounded-xl space-y-3 font-sans text-xs">
    <div className="flex justify-between items-center text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">
      <span className="font-semibold uppercase tracking-wider">
        {lng === 'zh-CN' ? '宣发变现热度 (MISSION HEAT)' : 'PROMOTION HEAT (MISSION HEAT)'}
      </span>
      <span className="text-[#5F7A61] dark:text-[#7FA382] font-bold animate-pulse">
        {lng === 'zh-CN' ? '● 实时更新' : '● Live Updated'}
      </span>
    </div>
    <div className="h-16 relative overflow-hidden flex items-end">
      <CanvasLineChart />
    </div>
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-[#5F7A61]/10">
        <div className="text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-medium">
          {lng === 'zh-CN' ? '高能任务奖池' : 'Hot Rewards Pool'}
        </div>
        <div className="text-[#F3A390] dark:text-[#F6B4A5] font-extrabold text-xs mt-0.5">
          {lng === 'zh-CN' ? '12,000+ 积分' : '12,000+ Pts'}
        </div>
      </div>
      <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-[#5F7A61]/10">
        <div className="text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-medium">
          {lng === 'zh-CN' ? '店主任务达成率' : 'Store Completion'}
        </div>
        <div className="text-[#5F7A61] dark:text-[#7FA382] font-extrabold text-xs mt-0.5">98.4%</div>
      </div>
    </div>
  </div>
)

const PublishChannels = ({ lng }: { lng: string }) => (
  <div className="mt-4 flex flex-wrap gap-2 items-center">
    <div className="flex items-center gap-1.5 bg-[#F3A390]/10 border border-[#F3A390]/20 px-2.5 py-1 rounded-full text-[10px] text-[#F3A390] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F3A390]" />
      {lng === 'zh-CN' ? '抖音' : 'Douyin'}
    </div>
    <div className="flex items-center gap-1.5 bg-[#5F7A61]/10 border border-[#5F7A61]/20 px-2.5 py-1 rounded-full text-[10px] text-[#5F7A61] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A61]" />
      {lng === 'zh-CN' ? '小红书' : 'Red/XHS'}
    </div>
    <div className="flex items-center gap-1.5 bg-[#E5B25D]/10 border border-[#E5B25D]/20 px-2.5 py-1 rounded-full text-[10px] text-[#E5B25D] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E5B25D]" />
      {lng === 'zh-CN' ? '快手' : 'Kuaishou'}
    </div>
    <div className="flex items-center gap-1.5 bg-[#5F7A61]/10 border border-[#5F7A61]/20 px-2.5 py-1 rounded-full text-[10px] text-[#5F7A61] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#7FA382]" />
      {lng === 'zh-CN' ? '视频号' : 'WeChat Channel'}
    </div>
  </div>
)

const EngageTerminal = ({ lng }: { lng: string }) => (
  <div className="mt-4 p-3 bg-white/40 dark:bg-[#1C261F]/40 border border-[#5F7A61]/10 rounded-xl font-mono text-[9px] text-[#5F7A61] dark:text-[#7FA382] h-20 overflow-hidden relative">
    <div className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[#5F7A61] dark:bg-[#7FA382] animate-ping" />
    <div className="opacity-70">
      {lng === 'zh-CN' ? '> 店铺智体运营助理 v1.2.0' : '> AI Shop Agent v1.2.0'}
    </div>
    <div className="opacity-90 font-semibold">
      {lng === 'zh-CN' ? '> 运行状态: 全天候自动值守' : '> Status: 24/7 Autopilot'}
    </div>
    <div className="opacity-70 text-[#F3A390] dark:text-[#F6B4A5]">
      {lng === 'zh-CN' ? '> 今日引流用户数: +1,248 人' : '> Traffic Driven Today: +1,248'}
    </div>
    <div className="flex items-center">
      <span>
        {lng === 'zh-CN' ? '> 账号连接: 正常 (CONNECTED)' : '> Connection: CONNECTED'}
      </span>
      <span className="w-1 h-3 bg-[#5F7A61] dark:bg-[#7FA382] ml-1 animate-pulse" />
    </div>
  </div>
)

const RevenueLedger = ({ lng }: { lng: string }) => (
  <div className="mt-4 p-3 bg-white/40 dark:bg-[#1C261F]/40 border border-[#5F7A61]/10 rounded-xl space-y-1 font-sans">
    <div className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 uppercase tracking-widest font-semibold">
      {lng === 'zh-CN' ? '商户累计收益明细 (Asset Ledger)' : 'Accumulated Earnings Ledger'}
    </div>
    <div className="text-xl font-bold text-[#E5B25D] dark:text-[#E9C482]">
      82,491.50
      <span className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 ml-1 font-medium">
        {lng === 'zh-CN' ? '积分' : 'Pts'}
      </span>
    </div>
    <div className="text-[9px] text-[#5F7A61] dark:text-[#7FA382] flex items-center gap-1 font-bold">
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span>
        {lng === 'zh-CN' ? '+14.2% 本周环比增长' : '+14.2% Week-over-Week'}
      </span>
    </div>
  </div>
)

const CreateSynthesizer = ({ lng }: { lng: string }) => (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full font-sans text-[10px] text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 bg-white/40 dark:bg-[#1C261F]/40 border border-[#5F7A61]/10 p-4 rounded-xl">
    <div className="space-y-1.5">
      <div className="flex justify-between font-semibold">
        <span>{lng === 'zh-CN' ? '文案爆度 (COPYWRITER COZY)' : 'COPYWRITER COZY'}</span>
        <span className="text-[#5F7A61] dark:text-[#7FA382]">65%</span>
      </div>
      <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-[#5F7A61] to-[#E5B25D]" />
        <div className="absolute top-[-2px] left-[65%] w-2 h-2.5 rounded bg-[#FAF7F2] border border-[#5F7A61]/40 shadow-sm" />
      </div>
    </div>

    <div className="space-y-1.5">
      <div className="flex justify-between font-semibold">
        <span>{lng === 'zh-CN' ? '海报渲染 (POSTER RENDER)' : 'POSTER RENDER'}</span>
        <span className="text-[#F3A390]">50%</span>
      </div>
      <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[50%] bg-gradient-to-r from-[#F3A390] to-[#E5B25D]" />
        <div className="absolute top-[-2px] left-[50%] w-2 h-2.5 rounded bg-[#FAF7F2] border border-[#F3A390]/40 shadow-sm" />
      </div>
    </div>

    <div className="space-y-1.5">
      <div className="flex justify-between font-semibold">
        <span>{lng === 'zh-CN' ? '视频合成 (VIDEO SYNTH)' : 'VIDEO SYNTH'}</span>
        <span className="text-[#E5B25D]">82%</span>
      </div>
      <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full w-[82%] bg-gradient-to-r from-[#E5B25D] to-[#5F7A61]" />
        <div className="absolute top-[-2px] left-[82%] w-2 h-2.5 rounded bg-[#FAF7F2] border border-[#E5B25D]/40 shadow-sm" />
      </div>
    </div>

    {/* Batch progress */}
    <div className="md:col-span-3 pt-3 border-t border-[#5F7A61]/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A61] dark:bg-[#7FA382] animate-ping" />
        <span className="text-[9px] text-[#5F7A61] dark:text-[#7FA382] font-semibold uppercase tracking-wider">
          {lng === 'zh-CN' ? 'AI 智能内容生成流水线就绪...' : 'AI content assembly line ready...'}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-mono">
        <span>[████████████░░░░░] 72% {lng === 'zh-CN' ? '已完成' : 'COMPLETED'}</span>
      </div>
    </div>
  </div>
)

const EcommerceStudioWidget = ({ lng }: { lng: string }) => (
  <div className="mt-4 flex flex-wrap gap-2 items-center">
    <div className="flex items-center gap-1.5 bg-[#E5B25D]/10 border border-[#E5B25D]/20 px-2.5 py-1 rounded-full text-[10px] text-[#E5B25D] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E5B25D]" />
      {lng === 'zh-CN' ? '背景替换' : 'Background Gen'}
    </div>
    <div className="flex items-center gap-1.5 bg-[#5F7A61]/10 border border-[#5F7A61]/20 px-2.5 py-1 rounded-full text-[10px] text-[#5F7A61] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A61]" />
      {lng === 'zh-CN' ? '人像模特' : 'AI Model'}
    </div>
    <div className="flex items-center gap-1.5 bg-[#F3A390]/10 border border-[#F3A390]/20 px-2.5 py-1 rounded-full text-[10px] text-[#F3A390] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F3A390]" />
      {lng === 'zh-CN' ? '一致视频 (R2V)' : 'Consistent Video'}
    </div>
  </div>
)

const renderExtraWidget = (id: string, lng: string) => {
  switch (id) {
    case 'monetize':
      return <MonetizeDashboard lng={lng} />
    case 'publish':
      return <PublishChannels lng={lng} />
    case 'engage':
      return <EngageTerminal lng={lng} />
    case 'revenue':
      return <RevenueLedger lng={lng} />
    case 'create':
      return <CreateSynthesizer lng={lng} />
    case 'ecommerce':
      return <EcommerceStudioWidget lng={lng} />
    default:
      return null
  }
}

export default function HubContent({ lng }: HubContentProps) {
  const router = useRouter()
  const token = useUserStore(state => state.token)

  const modules: ModuleItem[] = [
    {
      id: 'monetize',
      title: lng === 'zh-CN' ? '商户爆单任务广场' : 'Merchant Mission Square',
      subtitle: lng === 'zh-CN' ? '推广收益' : 'Monetize Rewards',
      description: lng === 'zh-CN'
        ? '发现同城爆单推广宣发任务，提交您的海报与到店Vlog草稿，获取丰厚的积分与引流奖励。'
        : 'Discover local viral marketing tasks. Submit posters or Vlog drafts to earn rich points and rewards.',
      color: 'from-[#D2232A] to-[#F3A390]',
      shadow: 'shadow-red-100/30 dark:shadow-red-950/20',
      path: '/mission-square',
      gridClass: 'md:col-span-2 md:row-span-2 min-h-[380px]',
    },
    {
      id: 'publish',
      title: lng === 'zh-CN' ? '绑定推广抖音/红书' : 'Link Social Channels',
      subtitle: lng === 'zh-CN' ? '多端同步' : 'Multi-Platform Sync',
      description: lng === 'zh-CN'
        ? '安全绑定您的抖音、小红书、快手、微信视频号等同城流量账号。采用合规的草稿箱安全推送机制，轻松实现多平台内容群发。'
        : 'Securely bind Douyin, Xiaohongshu, Kuaishou, and WeChat channels. Smooth multi-platform publishing via secure draft push.',
      color: 'from-[#F3A390] to-[#E5B25D]',
      shadow: 'shadow-pink-100/30 dark:shadow-pink-950/20',
      path: '/accounts',
      gridClass: 'md:col-span-2 md:row-span-1 min-h-[180px]',
    },
    {
      id: 'engage',
      title: lng === 'zh-CN' ? 'AI 同城引流获客' : 'AI Social Traffic Agent',
      subtitle: lng === 'zh-CN' ? '全天候值守' : '24/7 Autopilot',
      description: lng === 'zh-CN'
        ? '实体门店专用的 AI 自动引流托管助理。自动捕捉高意向同城食客/顾客，打通从线上曝光到线下进店消费的客流转化闭环。'
        : 'Autopilot AI agent dedicated to local merchants. Captures high-intent local customers to drive foot traffic and boost conversions.',
      color: 'from-[#E5B25D] to-[#D2232A]',
      shadow: 'shadow-yellow-100/30 dark:shadow-yellow-950/20',
      path: '/ai-social',
      gridClass: 'md:col-span-1 md:row-span-1 min-h-[180px]',
    },
    {
      id: 'revenue',
      title: lng === 'zh-CN' ? '获客推广收益中心' : 'Monetization & Analytics',
      subtitle: lng === 'zh-CN' ? '安全结算' : 'Secure Payouts',
      description: lng === 'zh-CN'
        ? '实时统计您的推广积分与获客收益明细，收益明晰安全。支持一键发起结算和提取。'
        : 'Track your marketing points and conversion metrics in real-time. Secure, transparent ledger with quick payouts.',
      color: 'from-[#5F7A61] to-[#E5B25D]',
      shadow: 'shadow-teal-100/30 dark:shadow-teal-950/20',
      path: '/revenue',
      gridClass: 'md:col-span-1 md:row-span-1 min-h-[180px]',
    },
    {
      id: 'create',
      title: lng === 'zh-CN' ? 'AI 自动获客创作室' : 'AI Creative Studio',
      subtitle: lng === 'zh-CN' ? '爆款生产线' : 'Viral Production Line',
      description: lng === 'zh-CN'
        ? '实体店老板专用的 AI 宣发创作流水线。只需输入您的特色招牌或活动，即可一键批量生成爆款同城引流文案、活动海报及精美短视频。'
        : 'Cozy content workflow tailored for store owners. Input highlights to batch generate viral posts and short videos.',
      color: 'from-[#D2232A] to-[#E5B25D]',
      shadow: 'shadow-orange-100/30 dark:shadow-orange-950/20',
      path: '/draft-box',
      gridClass: 'md:col-span-2 md:row-span-1 min-h-[180px]',
    },
    {
      id: 'ecommerce',
      title: lng === 'zh-CN' ? '电商智能创作工坊' : 'E-commerce AI Studio',
      subtitle: lng === 'zh-CN' ? '视觉营销中心' : 'Visual Marketing Hub',
      description: lng === 'zh-CN'
        ? '专为电商卖家与门店主设计的视觉内容生成中心。支持智能商品背景替换、虚拟模特试衣、以及基于万相 2.7 R2V 技术的角色一致视频生成。'
        : 'Visual content generator tailored for e-commerce. Replace backgrounds, generate virtual model fittings, and synthesize consistent videos.',
      color: 'from-[#E5B25D] to-[#5F7A61]',
      shadow: 'shadow-yellow-100/30 dark:shadow-teal-950/20',
      path: '/ecommerce-studio',
      gridClass: 'md:col-span-2 md:row-span-1 min-h-[180px]',
    },
  ]

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
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#18221B] selection:bg-[#5F7A61]/20 p-6 md:p-16 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Premium Warm Soft Spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#F3A390_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4 relative z-20"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight text-center">
          {lng === 'zh-CN' ? '爱易客 智能创作空间' : 'aiautoedit Creative Space'}
        </h1>
        <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 text-sm md:text-base max-w-2xl mx-auto tracking-wide font-normal">
          {lng === 'zh-CN' 
            ? '文案撰写 · 宣传发布 · 智体托管 —— 专为实体店老板与创作者量身打造的内容获客与推广中心。'
            : 'Cozy copywriting · Multi-platform publish · AI autopilot —— Tailored content growth center for store owners & creators.'}
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
              className="h-full flex flex-col group relative overflow-hidden cursor-pointer transition-all active:scale-[0.99] border border-[#5F7A61]/15 dark:border-[#7FA382]/15 hover:border-[#F3A390]/40 dark:hover:border-[#F3A390]/40 bg-white/70 dark:bg-[#202C24]/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(95,122,97,0.06)]"
              onClick={() => handleCardClick(m.path)}
            >
              {/* Radial Blur Glow */}
              <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${m.color} blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Glowing Custom Vector Icon Container */}
                  <div className="mb-6 flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-[#5F7A61]/5 border border-[#5F7A61]/10 group-hover:border-[#F3A390]/30 group-hover:bg-[#F3A390]/5 transition-colors">
                      {getModuleIcon(m.id)}
                    </div>
                    {/* Tiny visual tech tag */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${m.color} animate-pulse`} />
                      <span className="text-[10px] font-semibold text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40 uppercase tracking-widest">{m.id}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold text-[#5F7A61] dark:text-[#7FA382] tracking-widest uppercase">{m.subtitle}</span>
                    <h3 className="text-xl md:text-2xl font-bold text-[#2A2A2A] dark:text-[#FDFBF7] group-hover:text-[#5F7A61] dark:group-hover:text-[#7FA382] transition-colors tracking-tight">{m.title}</h3>
                  </div>

                  <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    {m.description}
                  </p>
                </div>

                {/* Dashboard Widget */}
                <div>
                  {renderExtraWidget(m.id, lng)}

                  <div className="mt-6 pt-4 border-t border-[#5F7A61]/10 flex items-center justify-between text-[#5F7A61] dark:text-[#7FA382] font-bold group/btn">
                    <span className="text-xs tracking-wide group-hover:text-[#2A2A2A] dark:group-hover:text-white transition-colors">
                      {lng === 'zh-CN' ? '一键进入创意面板' : 'Enter Workspace'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#5F7A61] text-[#FAF7F2] flex items-center justify-center transition-transform group-hover/btn:translate-x-1 shadow-[0_3px_10px_rgba(95,122,97,0.25)]">
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
        className="mt-16 text-center text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 text-[10px] tracking-widest relative z-20 font-medium"
      >
        © 2026 {lng === 'zh-CN' ? '爱易客' : 'aiautoedit'} Laboratory. All Rights Reserved.
      </motion.div>
    </div>
  )
}
