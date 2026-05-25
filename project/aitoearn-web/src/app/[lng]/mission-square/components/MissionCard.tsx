'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, TrendingUp, ChevronRight } from 'lucide-react'
import { Mission, RewardType } from '../mission.type'

interface MissionCardProps {
  mission: Mission
  onClick: (mission: Mission) => void
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/20'
      case 'Medium': return 'text-[#FF007F] bg-[#FF007F]/10 border border-[#FF007F]/20'
      case 'Hard': return 'text-red-500 bg-red-950/40 border border-red-500/20'
      default: return 'text-muted-foreground bg-muted/20 border border-muted-foreground/20'
    }
  }

  // 汉化难度文本
  const translateDifficulty = (diff: string) => {
    switch (diff) {
      case 'Easy': return '简单'
      case 'Medium': return '中等'
      case 'Hard': return '困难'
      default: return diff
    }
  }

  // 汉化奖励类型文本
  const translateRewardType = (type: RewardType) => {
    switch (type) {
      case 'CPS': return '销售提成'
      case 'CPE': return '按赞计费'
      case 'CPM': return '播放计费'
      case 'FIXED': return '固定酬劳'
      default: return type
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        className="h-full flex flex-col group overflow-hidden border-[#39FF14]/20 bg-black/80 hover:border-[#FF007F]/40 hover:shadow-[0_0_18px_rgba(255,0,127,0.2)] transition-all duration-300 cursor-pointer"
        onClick={() => onClick(mission)}
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
          <Image
            src={mission.coverImage}
            alt={mission.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 font-bold">
              {mission.platform === 'RED' ? '小红书' : mission.platform}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className={`border font-bold ${getDifficultyColor(mission.difficulty)}`}>
              {translateDifficulty(mission.difficulty)}
            </Badge>
          </div>
        </div>

        {/* Brand & Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#39FF14]/30 shadow-[0_0_4px_rgba(57,255,20,0.2)]">
            <Image src={mission.brandLogo} alt={mission.brand} fill className="object-cover" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{mission.brand}</span>
        </div>
        
        <h3 className="text-xl font-extrabold text-foreground mb-2 line-clamp-1 group-hover:text-[#39FF14] drop-shadow-[0_0_4px_rgba(57,255,20,0.15)] transition-colors">
          {mission.title}
        </h3>

        {/* Reward Section */}
        <div className="bg-[#09090b] rounded-xl p-3 mb-4 border border-[#39FF14]/20 shadow-[inset_0_0_10px_rgba(57,255,20,0.05)]">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-[#39FF14] font-black uppercase tracking-wider mb-1 drop-shadow-[0_0_4px_rgba(57,255,20,0.3)]">预估收益</p>
              <p className="text-lg font-black text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">{mission.estimatedEarnings}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{translateRewardType(mission.rewardType)} 奖励</p>
              <p className="text-sm font-extrabold text-[#FF007F] drop-shadow-[0_0_6px_rgba(255,0,127,0.3)]">{mission.rewardValue}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={14} className="text-[#39FF14]/60" />
            <span className="text-xs">{mission.totalParticipants} 人已参与</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={14} className="text-[#FF007F]/60" />
            <span className="text-xs">截止：{new Date(mission.deadline).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#39FF14]/15">
          <div className="flex gap-1">
            {mission.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-[#39FF14]/60">#{tag}</span>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-[#39FF14] font-bold group/btn p-0 hover:bg-transparent hover:text-[#FF007F] transition-all">
            立即参与
            <ChevronRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
