'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles, Zap, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MissionCard } from './components/MissionCard'
import { MissionDetailModal } from './components/MissionDetailModal'
import { MOCK_MISSIONS, Mission } from './mission.type'

export default function MissionSquarePage({ params: { lng } }: { params: { lng: string } }) {
  const [filter, setFilter] = useState<'All' | 'DY' | 'RED' | 'KS' | 'WX'>('All')
  const [search, setSearch] = useState('')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission)
    setIsModalOpen(true)
  }

  const filteredMissions = MOCK_MISSIONS.filter(m => {
    const matchesFilter = filter === 'All' || m.platform === filter || m.platform === 'All'
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.brand.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#18221B] pb-20 text-[#2A2A2A] dark:text-[#FDFBF7] font-sans relative overflow-hidden">
      
      {/* Premium Warm Soft Spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#F3A390_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Hero Section */}
      <div className="border-b border-[#5F7A61]/10 bg-[#FAF7F2]/50 dark:bg-[#18221B]/50 pt-24 pb-32 px-6 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5F7A61]/10 backdrop-blur-md text-[#5F7A61] dark:text-[#7FA382] font-semibold text-sm border border-[#5F7A61]/20 shadow-[0_2px_10px_rgba(95,122,97,0.08)]">
              <Sparkles size={16} className="animate-pulse text-[#F3A390]" />
              <span className="tracking-wide">每日盘点商户推广任务</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] leading-tight tracking-tight">
              将内容灵感 <br />
              <span className="text-[#5F7A61] dark:text-[#7FA382] relative">
                转化为推广资产
                <span className="absolute bottom-2 left-0 w-full h-2.5 bg-[#F3A390]/25 -z-10 rounded-full" />
              </span>
            </h1>
            <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 text-base md:text-lg font-normal max-w-xl">
              加入品牌引流和任务广场。依托我们的 AI 智能创意工坊，简单操作即可生成爆单素材并获取积分与现金奖励！
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto -mt-16 px-6 relative z-20">
        {/* Controls */}
        <div className="bg-white/70 dark:bg-[#202C24]/70 backdrop-blur-xl border border-[#5F7A61]/15 p-4 rounded-[2rem] shadow-[0_6px_20px_rgba(95,122,97,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5F7A61]/65" size={18} />
            <Input 
              placeholder="搜索推广任务、品牌渠道..." 
              className="pl-12 h-14 bg-white/80 dark:bg-[#1C261F]/80 border border-[#5F7A61]/20 text-[#2A2A2A] dark:text-[#FDFBF7] placeholder:text-[#2A2A2A]/40 dark:placeholder:text-[#FDFBF7]/40 rounded-2xl focus-visible:ring-[#5F7A61] focus-visible:border-[#5F7A61]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'DY', 'RED', 'KS', 'WX'].map((p) => (
              <Button
                key={p}
                onClick={() => setFilter(p as any)}
                variant={filter === p ? 'default' : 'ghost'}
                className={`h-14 px-8 rounded-2xl font-bold transition-all border ${
                  filter === p 
                    ? 'bg-[#5F7A61] border-[#5F7A61] text-[#FAF7F2] shadow-[0_3px_10px_rgba(95,122,97,0.25)] hover:bg-[#5F7A61]/90' 
                    : 'text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 border-[#5F7A61]/15 bg-transparent hover:bg-[#5F7A61]/10 hover:text-[#5F7A61]'
                }`}
              >
                {p === 'All' ? '全部渠道' : p === 'RED' ? '小红书' : p === 'DY' ? '抖音' : p === 'KS' ? '快手' : '视频号'}
              </Button>
            ))}
          </div>
        </div>

        {/* Missions Grid */}
        {filteredMissions.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredMissions.map((mission) => (
              <motion.div key={mission.id} variants={item}>
                <MissionCard 
                  mission={mission} 
                  onClick={handleMissionClick}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-white/70 dark:bg-[#202C24]/60 border border-[#5F7A61]/15 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Filter size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">未找到相关推广任务</h3>
            <p className="text-muted-foreground">请尝试调整您的过滤选项或搜索关键字。</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Trending */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#F3A390] text-[#FAF7F2] shadow-[0_4px_15px_rgba(243,163,144,0.4)] flex items-center justify-center z-50 cursor-pointer border border-[#F3A390]/40"
      >
        <TrendingUp size={24} />
      </motion.button>

      {/* Detail Modal */}
      <MissionDetailModal
        mission={selectedMission}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lng={lng}
      />
    </div>
  )
}
