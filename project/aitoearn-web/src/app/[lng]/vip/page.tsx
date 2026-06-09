/**
 * VIP 会员与额度进度中心页面
 * 包含发光黄金 VIP 实体卡、三环额度进度圈以及极简透明定价网格
 */
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  Sparkles, 
  Check, 
  User, 
  ShieldCheck, 
  QrCode, 
  X, 
  ChevronRight, 
  Zap, 
  Crown 
} from 'lucide-react'
import { useGetClientLng } from '@/hooks/useSystem'
import { cn } from '@/lib/utils'

export default function VipPage() {
  const params = useParams()
  const lng = useGetClientLng()

  // State for Customer Service Activation Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  // Mock quota data
  const quotas = [
    {
      id: 'copy',
      title: lng === 'zh-CN' ? '文案生成额度' : 'Daily Copywriting',
      used: 12,
      total: 20,
      color: 'stroke-[#5F7A61]',
      textColor: 'text-[#5F7A61]',
      desc: lng === 'zh-CN' ? '每日重置，用于爆款文案填空生成' : 'Resets daily for AI marketing copy'
    },
    {
      id: 'poster',
      title: lng === 'zh-CN' ? '海报设计额度' : 'Daily Poster Design',
      used: 3,
      total: 5,
      color: 'stroke-[#F3A390]',
      textColor: 'text-[#F3A390]',
      desc: lng === 'zh-CN' ? '每日重置，用于门店活动与折价海报' : 'Resets daily for campaign posters'
    },
    {
      id: 'video',
      title: lng === 'zh-CN' ? '短视频合成额度' : 'Daily Video Synthesis',
      used: 0,
      total: 2,
      color: 'stroke-[#E5B25D]',
      textColor: 'text-[#E5B25D]',
      desc: lng === 'zh-CN' ? '每日重置，用于同城探店引流短视频' : 'Resets daily for local store vlogs'
    }
  ]

  // Pricing Plan details
  const plans = [
    {
      name: lng === 'zh-CN' ? '首月体验卡 (First Month Trial)' : 'First Month Cozy Trial',
      price: '19',
      period: lng === 'zh-CN' ? '首月' : '1st mo',
      originalPrice: '39',
      tag: lng === 'zh-CN' ? '首月特惠 4.8 折 ★' : 'Promo 50%+ OFF ★',
      features: lng === 'zh-CN' ? [
        '每日文案生成：20次',
        '每日海报设计：5次',
        '每日视频合成：2次',
        '多平台一键静默推送',
        '专属小店引流实战指南',
        '100% 模拟人工免封号安全背书'
      ] : [
        '20 copy generations / day',
        '5 poster designs / day',
        '2 video compilations / day',
        'Multi-platform silent push',
        'Academy operations guide',
        '100% human-safe push warrant'
      ],
      color: 'border-[#5F7A61]/30 bg-gradient-to-b from-[#5F7A61]/5 to-transparent',
      isDisabled: false,
      isRecommend: false
    },
    {
      name: lng === 'zh-CN' ? '连续包月卡 (Continuous Monthly)' : 'Continuous Monthly VIP',
      price: '39',
      period: lng === 'zh-CN' ? '月' : 'mo',
      originalPrice: '49',
      tag: lng === 'zh-CN' ? '主打省心续订' : 'Best Choice Renewal',
      features: lng === 'zh-CN' ? [
        '每日文案生成：50次',
        '每日海报设计：10次',
        '每日视频合成：5次',
        '无限多平台极速静默推送',
        '引流学院全套爆品视频课',
        '1v1 客服包教包会绑定服务'
      ] : [
        '50 copy generations / day',
        '10 poster designs / day',
        '5 video compilations / day',
        'Unlimited platform silent push',
        'Full Academy operations course',
        '1v1 secure setup helper support'
      ],
      color: 'border-[#E5B25D]/50 bg-gradient-to-b from-[#E5B25D]/5 to-transparent shadow-[0_8px_24px_rgba(229,178,93,0.06)]',
      isRecommend: true,
      isDisabled: false
    },
    {
      name: lng === 'zh-CN' ? '高级会员套餐 (Supreme VIP)' : 'Supreme Annual VIP',
      price: '299',
      period: lng === 'zh-CN' ? '年' : 'yr',
      originalPrice: '588',
      tag: lng === 'zh-CN' ? '暂未开通 · 敬请期待' : 'Coming Soon',
      features: lng === 'zh-CN' ? [
        '每日文案生成：100次',
        '每日海报设计：20次',
        '每日视频合成：10次',
        '无限多平台极速静默推送',
        '1v1 同城专家引流方案指导',
        '优先体验全新 AI 功能'
      ] : [
        '100 copy generations / day',
        '20 poster designs / day',
        '10 video compilations / day',
        'Unlimited platform silent push',
        '1v1 specialist advisor call',
        'Priority access to new AI models'
      ],
      color: 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 opacity-40 select-none cursor-not-allowed',
      isRecommend: false,
      isDisabled: true
    }
  ]

  const handleSubscribeClick = (planName: string) => {
    setSelectedPlan(planName)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#18221B] selection:bg-[#5F7A61]/20 p-6 md:p-16 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Background spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#E5B25D_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="max-w-5xl w-full relative z-10 space-y-12">
        
        {/* Title block */}
        <div className="text-center space-y-3">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-[#E5B25D]/30 bg-[#E5B25D]/10 px-4 py-1.5 shadow-[0_2px_8px_rgba(229,178,93,0.08)] w-max mx-auto">
            <Crown className="size-4 text-[#E5B25D] animate-pulse" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.1em] text-[#E5B25D] font-bold">
              {lng === 'zh-CN' ? '尊贵特权 · 每日额度无限畅享' : 'EXCLUSIVE PRIVILEGES · UNLIMITED PROGRESS'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight">
            {lng === 'zh-CN' ? '会员与额度进度中心' : 'VIP Subscription & Quotas'}
          </h1>
          <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 text-xs sm:text-sm max-w-lg mx-auto font-normal">
            {lng === 'zh-CN'
              ? '清晰、透明的会员权益，每日已用额度直观图形展示，助力小店生意快速出圈！'
              : 'Transparent subscription details and elegant visual daily progress rings to keep your business growing.'}
          </p>
        </div>

        {/* Golden Glowing VIP Card */}
        <div className="max-w-md mx-auto w-full aspect-[1.586/1] bg-gradient-to-br from-[#E6C387] via-[#C59B58] to-[#9E7331] rounded-3xl p-6 shadow-[0_15px_35px_rgba(197,155,88,0.25)] hover:shadow-[0_20px_45px_rgba(197,155,88,0.4)] transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden group select-none animate-in zoom-in-95 duration-500">
          {/* Card Shine Reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          
          {/* Ambient light points */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl opacity-45" />

          {/* Card Layout */}
          <div className="h-full flex flex-col justify-between text-white relative z-10 font-sans">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Crown className="size-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide text-white">
                    {lng === 'zh-CN' ? '爱易客尊享会员' : 'aiyike Premium VIP'}
                  </h3>
                  <p className="text-[8px] text-white/70 uppercase tracking-widest font-mono">GOLDEN VIP CARD</p>
                </div>
              </div>
              <span className="text-[9px] font-semibold bg-white/25 border border-white/25 px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-sm font-mono">
                {lng === 'zh-CN' ? '至尊年卡' : 'SUPREME YEARLY'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] text-white/70 uppercase tracking-widest font-mono font-medium">Card Number</p>
              <p className="text-lg font-bold tracking-[0.15em] font-mono drop-shadow-sm">8249 1500 2026 8888</p>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-3">
              <div>
                <p className="text-[8px] text-white/60 uppercase font-mono">Expires</p>
                <p className="text-[10px] font-bold tracking-wide font-mono">2027/05/31</p>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-300 drop-shadow-sm animate-pulse" />
                <span className="text-[9px] font-semibold tracking-wider uppercase font-mono text-emerald-300">
                  {lng === 'zh-CN' ? '保障通道已激活' : 'SECURED PUSH'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Three Circular Progress Rings (Daily Quotas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotas.map((q) => {
            const pct = q.total > 0 ? (q.used / q.total) * 100 : 0
            // Circumference of SVG Circle = 2 * PI * r = 2 * 3.14159 * 40 = 251.2
            const strokeDashoffset = 251.2 - (251.2 * pct) / 100

            return (
              <div 
                key={q.id}
                className="bg-white/70 dark:bg-[#202C24]/70 backdrop-blur-xl border border-[#5F7A61]/15 p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#5F7A61]/30 transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[220px]"
              >
                <span className="text-xs font-extrabold text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 tracking-wider uppercase">
                  {q.title}
                </span>

                {/* SVG Progress Ring */}
                <div className="relative size-24 my-4 flex items-center justify-center">
                  <svg className="size-full transform -rotate-90">
                    {/* Circle Background */}
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      className="stroke-neutral-100 dark:stroke-neutral-800 fill-transparent"
                      strokeWidth="8"
                    />
                    {/* Circle Active Ring */}
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      className={cn("fill-transparent transition-all duration-500 ease-out", q.color)}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Inside Text */}
                  <div className="absolute flex flex-col items-center justify-center font-sans">
                    <span className="text-lg font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7]">
                      {q.used}
                      <span className="text-[10px] text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40 font-medium">
                        /{q.total}
                      </span>
                    </span>
                    <span className={cn("text-[9px] font-bold mt-0.5", q.textColor)}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 leading-relaxed font-normal">
                  {q.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Pricing Subscriptions Grids */}
        <div className="space-y-6 pt-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2A2A2A] dark:text-[#FDFBF7]">
              {lng === 'zh-CN' ? '透明、简单的一键订阅计划' : 'Transparent Pricing Packages'}
            </h2>
            <p className="text-xs text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 mt-1.5">
              {lng === 'zh-CN' ? '无复杂代币兑换，实体小店老板专享爆单卡套餐' : 'No complex token calculation. Simple and transparent monthly or annual VIP cards.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((p, idx) => (
              <div 
                key={idx}
                className={cn(
                  "border rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                  p.color
                )}
              >
                {/* Special Tag badge */}
                <div className={cn(
                  "absolute -top-3 right-6 text-[#FAF7F2] text-[9px] font-extrabold px-3 py-1 rounded-full shadow-sm select-none uppercase tracking-widest",
                  p.isDisabled 
                    ? "bg-neutral-400 dark:bg-neutral-700 animate-none" 
                    : p.isRecommend 
                      ? "bg-[#E5B25D] animate-pulse" 
                      : "bg-[#5F7A61] animate-pulse"
                )}>
                  {p.tag}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] mb-4">
                    {p.name}
                  </h3>

                  {/* Pricing row */}
                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-3xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] font-mono">
                      ¥{p.price}
                    </span>
                    <span className="text-xs text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40">
                      /{p.period}
                    </span>
                    <span className="text-xs line-through text-[#2A2A2A]/30 dark:text-[#FDFBF7]/30 ml-2 font-mono">
                      ¥{p.originalPrice}
                    </span>
                  </div>

                  {/* Feature checklist */}
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 leading-relaxed font-normal">
                        <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => !p.isDisabled && handleSubscribeClick(p.name)}
                  disabled={p.isDisabled}
                  className={cn(
                    "w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm select-none border-none",
                    p.isDisabled
                      ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
                      : p.isRecommend
                        ? "bg-[#E5B25D] text-white hover:bg-[#E5B25D]/90 hover:shadow-[0_4px_12px_rgba(229,178,93,0.2)] cursor-pointer active:scale-98"
                        : "bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-[#2A2A2A] dark:text-[#FDFBF7] hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer active:scale-98"
                  )}
                >
                  {p.isDisabled 
                    ? (lng === 'zh-CN' ? '暂未开通' : 'Coming Soon')
                    : (lng === 'zh-CN' ? '立即购买 / 升级' : 'Subscribe Now')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Service Activation Popover (Modal) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
          />

          {/* Modal Container */}
          <div className="bg-white dark:bg-[#1C261F] border border-[#5F7A61]/35 rounded-3xl p-6 max-w-xs w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-10 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200 font-sans">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="size-11 rounded-2xl bg-[#E5B25D]/10 flex items-center justify-center text-[#E5B25D]">
              <QrCode className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7]">
                {lng === 'zh-CN' ? '扫码联系客服激活订阅' : 'Scan to Activate Subscription'}
              </h3>
              <p className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">
                {lng === 'zh-CN' ? `您选择的套餐是: ${selectedPlan}` : `Selected Package: ${selectedPlan}`}
              </p>
            </div>

            {/* Simulated Cozy WeChat QRCode Cover */}
            <div className="size-44 rounded-2xl bg-[#FAF7F2] border border-[#5F7A61]/15 p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {/* Inside WeChat QRCode Placeholder (Highly detailed mockup) */}
              <div className="size-full border border-dashed border-[#5F7A61]/30 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center p-2 text-[#5F7A61]/50 bg-white">
                <Crown className="size-8 text-[#E5B25D] animate-bounce" />
                <span className="text-[9px] font-extrabold text-[#2A2A2A]/60 leading-tight">
                  {lng === 'zh-CN' ? '店主获客顾问专属微信' : 'WeChat Account QR Code'}
                </span>
                <span className="text-[8px] text-[#5F7A61]/70 font-semibold tracking-wider font-mono bg-[#5F7A61]/10 px-1.5 py-0.5 rounded">
                  ID: aiyike_service
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 font-semibold flex items-center justify-center gap-1">
                <Zap className="size-3 text-[#E5B25D] fill-[#E5B25D]" />
                {lng === 'zh-CN' ? '添加微信客服，发送订单秒级开通' : 'Add WeChat for instant manual quota activations.'}
              </p>
              <p className="text-[9px] text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40 leading-relaxed font-normal">
                {lng === 'zh-CN'
                  ? '支持支付宝/微信快捷扫码。1v1 客服提供包安装包教包绑定保姆服务！'
                  : 'Fast WeChat support. Includes 1v1 operator setup guidance.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
