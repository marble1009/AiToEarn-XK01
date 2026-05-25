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
  const [filter, setFilter] = useState<'All' | 'TikTok' | 'RED' | 'YouTube'>('All')
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
    <div className="min-h-screen bg-black pb-20 text-foreground">
      {/* Hero Section */}
      <div className="border-b border-[#39FF14]/20 bg-black pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#39FF14]/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FF007F]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39FF14]/10 backdrop-blur-md text-[#39FF14] font-bold text-sm border border-[#39FF14]/30 shadow-[0_0_10px_rgba(57,255,20,0.2)]">
              <Sparkles size={16} className="animate-pulse" />
              <span className="tracking-widest">每日新增灵光任务</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight tracking-wider">
              将内容灵感 <br />
              <span className="text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.6)] underline decoration-[#FF007F] decoration-2 underline-offset-8">转化为灵光资产。</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-xl">
              发现全球品牌的变现任务。通过我们的 NVIDIA LLM 辅助创作，只需一分钟，即可发布爆款内容并赚取收益。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto -mt-16 px-6">
        {/* Controls */}
        <div className="bg-black/60 backdrop-blur-xl border border-[#39FF14]/30 p-4 rounded-3xl shadow-[0_0_20px_rgba(57,255,20,0.15)] flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39FF14]/60" size={18} />
            <Input 
              placeholder="搜索灵光任务、品牌渠道..." 
              className="pl-12 h-14 bg-black/80 border border-[#39FF14]/20 text-[#39FF14] placeholder:text-muted-foreground/40 rounded-2xl focus-visible:ring-[#39FF14] focus-visible:border-[#39FF14]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'TikTok', 'RED', 'YouTube'].map((p) => (
              <Button
                key={p}
                onClick={() => setFilter(p as any)}
                variant={filter === p ? 'default' : 'ghost'}
                className={`h-14 px-8 rounded-2xl font-bold transition-all border ${
                  filter === p 
                    ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:bg-[#39FF14]/90' 
                    : 'text-muted-foreground border-[#39FF14]/20 bg-transparent hover:bg-[#39FF14]/10 hover:text-[#39FF14]'
                }`}
              >
                {p === 'All' ? '全部渠道' : p === 'RED' ? '小红书' : p}
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
            <div className="w-20 h-20 bg-black/80 border border-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <Filter size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">未找到相关灵光任务</h3>
            <p className="text-muted-foreground">请尝试调整您的过滤选项或搜索关键字。</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Trending */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#FF007F] text-white shadow-[0_0_15px_rgba(255,0,127,0.5)] flex items-center justify-center z-50 cursor-pointer border border-[#FF007F]/40"
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
