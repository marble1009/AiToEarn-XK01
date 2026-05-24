/**
 * WelcomePageContent - Welcome 页面主组件
 * 使用 Tailwind CSS + shadcn/ui 重写版本
 */
'use client'

import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { AIGraderSection } from './components/sections/AIGraderSection'
import { BeliefsSection } from './components/sections/BeliefsSection'
import { ExperienceTabsSection } from './components/sections/ExperienceTabsSection'
import { ReviewsSection } from './components/sections/ReviewsSection'
import { TechFeaturesSection } from './components/sections/TechFeaturesSection'

interface WelcomePageContentProps {
  lng: string
}

export default function WelcomePageContent({ lng }: WelcomePageContentProps) {
  return (
    <div className="min-h-screen bg-black text-indigo-100 antialiased relative overflow-hidden selection:bg-[#FF007F] selection:text-white">
      {/* 极酷炫的赛博霓虹极光粒子背景层 - AuraString 灵动光弦 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* 荧光绿极光 */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(57,255,20,0.06)_0%,rgba(0,0,0,0)_70%)] animate-pulse" style={{ animationDuration: '8s' }} />
        {/* 荧光粉极光 */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(255,0,127,0.06)_0%,rgba(0,0,0,0)_70%)] animate-pulse" style={{ animationDuration: '12s' }} />
        {/* 纵向穿梭的“光之弦”（AuraString） */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-[#39FF14] to-transparent opacity-20 blur-[1px]" />
        <div className="absolute top-0 left-[50.5%] transform -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#FF007F] to-transparent opacity-15 blur-[2px]" />
      </div>

      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区 */}
      <main className="relative">
        {/* AI 打分工具区块 */}
        <AIGraderSection />

        {/* 体验标签轮播 */}
        <ExperienceTabsSection />

        {/* 评论区块 */}
        <ReviewsSection />

        {/* 科技功能介绍 */}
        <TechFeaturesSection />

        {/* 为什么选择 AiToEarn + 核心功能（合并区块） */}
        <BeliefsSection />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}
