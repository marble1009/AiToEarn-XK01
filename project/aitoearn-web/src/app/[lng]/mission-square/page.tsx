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
    <div className="min-h-screen bg-[#FDFCF9] pb-20">
      {/* Hero Section */}
      <div className="bg-warm-gradient pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-orange-200 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/30">
              <Sparkles size={16} />
              <span>NEW MISSIONS EVERY DAY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              Turn Your Content <br />
              <span className="text-orange-100 underline decoration-orange-300 underline-offset-8 italic">Into Revenue.</span>
            </h1>
            <p className="text-white/80 text-xl font-medium max-w-xl">
              发现全球品牌的变现任务。通过我们的 NVIDIA LLM 辅助创作，只需一分钟，即可发布爆款内容并赚取收益。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto -mt-16 px-6">
        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-xl shadow-orange-100/50 flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search missions, brands..." 
              className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-orange-400"
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
                className={`h-14 px-8 rounded-2xl font-bold transition-all ${
                  filter === p 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'text-gray-500 hover:bg-orange-50'
                }`}
              >
                {p}
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
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Filter size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">No missions found</h3>
            <p className="text-gray-500">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Trending */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-orange-600 text-white shadow-2xl flex items-center justify-center z-50 cursor-pointer"
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
