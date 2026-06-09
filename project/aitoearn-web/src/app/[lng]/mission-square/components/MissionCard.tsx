'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, ChevronRight } from 'lucide-react'
import { Mission, RewardType } from '../mission.type'

interface MissionCardProps {
  mission: Mission
  onClick: (mission: Mission) => void
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-[#5F7A61] bg-[#5F7A61]/10 border border-[#5F7A61]/25'
      case 'Medium': return 'text-[#E5B25D] bg-[#E5B25D]/10 border border-[#E5B25D]/25'
      case 'Hard': return 'text-[#E07A5F] bg-[#E07A5F]/10 border border-[#E07A5F]/25'
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

  // 汉化平台文本
  const translatePlatform = (plat: string) => {
    switch (plat) {
      case 'RED': return '小红书'
      case 'DY': return '抖音'
      case 'KS': return '快手'
      case 'WX': return '视频号'
      default: return plat === 'All' ? '全部渠道' : plat
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        className="h-full flex flex-col group overflow-hidden border-[#5F7A61]/15 dark:border-[#2C3A30]/50 bg-white/70 dark:bg-[#202C24]/60 hover:border-[#F3A390]/40 dark:hover:border-[#F3A390]/40 hover:shadow-[0_6px_20px_rgba(95,122,97,0.06)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer p-5 rounded-3xl"
        onClick={() => onClick(mission)}
      >
        {/* Cover Image */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4">
          <Image
            src={mission.coverImage}
            alt={mission.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-[#FAF7F2]/90 dark:bg-[#18221B]/90 backdrop-blur-md border border-[#5F7A61]/15 text-[#2A2A2A] dark:text-[#FDFBF7] px-2.5 py-0.5 font-semibold text-[10px]">
              {translatePlatform(mission.platform)}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className={`border font-semibold text-[10px] ${getDifficultyColor(mission.difficulty)}`}>
              {translateDifficulty(mission.difficulty)}
            </Badge>
          </div>
        </div>


        
        <h3 className="text-lg font-bold text-[#2A2A2A] dark:text-[#FDFBF7] mb-2 line-clamp-1 group-hover:text-[#5F7A61] dark:group-hover:text-[#7FA382] transition-colors">
          {mission.title}
        </h3>

        {/* Reward Section */}
        <div className="bg-[#FAF7F2]/80 dark:bg-[#1C261F]/80 rounded-2xl p-3 mb-4 border border-[#5F7A61]/10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-[#5F7A61] dark:text-[#7FA382] font-bold uppercase tracking-wide mb-0.5">预估收益</p>
              <p className="text-base font-extrabold text-[#5F7A61] dark:text-[#7FA382]">{mission.estimatedEarnings}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-medium uppercase tracking-wide mb-0.5">{translateRewardType(mission.rewardType)} 奖励</p>
              <p className="text-xs font-bold text-[#F3A390] dark:text-[#F6B4A5]">{mission.rewardValue}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="flex items-center gap-1.5 text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">
            <Users size={12} className="text-[#5F7A61]" />
            <span className="text-[10px]">{mission.totalParticipants} 人已参与</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">
            <Calendar size={12} className="text-[#F3A390]" />
            <span className="text-[10px] truncate">截止：{new Date(mission.deadline).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#5F7A61]/10">
          <div className="flex gap-1.5">
            {mission.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-medium text-[#5F7A61]/80 dark:text-[#7FA382]/80">#{tag}</span>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-[#5F7A61] dark:text-[#7FA382] font-bold group/btn p-0 hover:bg-transparent hover:text-[#F3A390] dark:hover:text-[#F6B4A5] transition-all h-auto">
            立即参与
            <ChevronRight size={14} className="ml-0.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
