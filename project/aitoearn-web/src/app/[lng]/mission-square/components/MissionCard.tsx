'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, TrendingUp, ChevronRight } from 'lucide-react'
import { Mission } from '../mission.type'

interface MissionCardProps {
  mission: Mission
  onClick: (mission: Mission) => void
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-50'
      case 'Medium': return 'text-orange-500 bg-orange-50'
      case 'Hard': return 'text-red-500 bg-red-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        className="h-full flex flex-col group overflow-hidden border-white/40 hover:border-orange-200 transition-all cursor-pointer"
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
            <Badge className="bg-black/60 backdrop-blur-md border-none text-white px-2 py-0.5">
              {mission.platform}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className={`border-none font-bold ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </Badge>
          </div>
        </div>

        {/* Brand & Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-100">
            <Image src={mission.brandLogo} alt={mission.brand} fill className="object-cover" />
          </div>
          <span className="text-sm font-medium text-gray-500">{mission.brand}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {mission.title}
        </h3>

        {/* Reward Section */}
        <div className="bg-orange-50/50 rounded-xl p-3 mb-4 border border-orange-100/50">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">Estimated Earnings</p>
              <p className="text-lg font-black text-orange-600">{mission.estimatedEarnings}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">{mission.rewardType} Reward</p>
              <p className="text-sm font-bold text-gray-700">{mission.rewardValue}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={14} />
            <span className="text-xs">{mission.totalParticipants} Joined</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} />
            <span className="text-xs">{new Date(mission.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex gap-1">
            {mission.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-orange-500 font-bold group/btn p-0 hover:bg-transparent">
            Join Now
            <ChevronRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
