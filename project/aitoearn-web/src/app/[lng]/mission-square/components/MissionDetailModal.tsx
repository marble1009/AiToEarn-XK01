'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mission, RewardType } from '../mission.type'
import { useRouter } from 'next/navigation'
import { useMissionStore } from '../missionStore'
import { MissionSubmissionModal } from './MissionSubmissionModal'

interface MissionDetailModalProps {
  mission: Mission | null
  isOpen: boolean
  onClose: () => void
  lng: string
}

export function MissionDetailModal({ mission, isOpen, onClose, lng }: MissionDetailModalProps) {
  const router = useRouter()
  const { joinedMissionIds, joinMission } = useMissionStore()
  const [isSubmissionOpen, setIsSubmissionOpen] = React.useState(false)

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

  if (!mission) return null

  const isJoined = joinedMissionIds.includes(mission.id)

  const handleJoin = () => {
    if (!isJoined) {
      joinMission(mission.id)
    }
    // Navigate to Draft Box with mission context
    router.push(`/${lng}/draft-box?missionId=${mission.id}&brand=${mission.brand}`)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#FAF7F2]/95 dark:bg-[#18221B]/95 border border-[#5F7A61]/20 shadow-[0_12px_40px_rgba(95,122,97,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] backdrop-blur-xl"
            >
              {/* Left: Visual & Brand */}
              <div className="w-full md:w-5/12 bg-black/10 dark:bg-black/25 relative border-r border-[#5F7A61]/15">
                <div className="relative h-64 md:h-full w-full">
                  <Image
                    src={mission.coverImage}
                    alt={mission.title}
                    fill
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 text-white space-y-2">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-wide">{mission.title}</h2>
                  </div>
                </div>
              </div>

              {/* Right: Info & Actions */}
              <div className="w-full md:w-7/12 p-8 overflow-y-auto text-[#2A2A2A] dark:text-[#FDFBF7]">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 dark:bg-[#18221B]/80 border border-[#5F7A61]/20 flex items-center justify-center text-[#5F7A61] dark:text-[#7FA382] hover:bg-[#5F7A61]/10 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>

                <div className="space-y-8">
                  {/* Reward Highlight */}
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/70 dark:bg-[#202C24]/70 border border-[#5F7A61]/15 shadow-[0_4px_16px_rgba(95,122,97,0.03)]">
                    <div>
                      <p className="text-xs font-bold text-[#5F7A61] dark:text-[#7FA382] uppercase tracking-wide mb-1">预估推广收益</p>
                      <p className="text-3xl font-extrabold text-[#5F7A61] dark:text-[#7FA382]">{mission.estimatedEarnings}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#F3A390] hover:bg-[#F3A390]/90 text-white border-none font-semibold mb-1.5 px-3 py-0.5 rounded-full">{translateRewardType(mission.rewardType)}</Badge>
                      <p className="text-sm font-bold text-[#F3A390] dark:text-[#F6B4A5]">{mission.rewardValue}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[#5F7A61] dark:text-[#7FA382] tracking-tight">推广任务描述</h3>
                    <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 leading-relaxed text-xs">
                      {mission.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#5F7A61] dark:text-[#7FA382] tracking-tight">任务要求细则</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {mission.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-[#202C24]/60 border border-[#5F7A61]/10 text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 text-xs shadow-sm">
                          <CheckCircle2 size={16} className="text-[#5F7A61] dark:text-[#7FA382] shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Kit Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-transparent via-[#5F7A61]/5 to-transparent border border-[#5F7A61]/25 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18221B] border border-[#5F7A61]/25 shadow-sm flex items-center justify-center text-[#5F7A61] dark:text-[#7FA382]">
                        <Zap size={18} className="text-[#F3A390] animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#5F7A61] dark:text-[#7FA382]">AI 专属获客套件已就绪</p>
                        <p className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">已为此任务预置专属 AI 创作指令与推广模板。</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[#5F7A61] dark:text-[#7FA382] border-[#5F7A61]/30 bg-transparent text-[10px]">商户标准版</Badge>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col gap-3">
                    {isJoined ? (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <Button 
                          variant="outline"
                          className="h-14 rounded-2xl border-[#5F7A61]/30 bg-[#FAF7F2]/80 dark:bg-[#18221B]/80 text-[#5F7A61] hover:bg-[#5F7A61]/10 font-bold"
                          onClick={handleJoin}
                        >
                          进入创意工坊
                        </Button>
                        <Button 
                          className="h-14 rounded-2xl bg-gradient-to-r from-[#5F7A61] to-[#F3A390] text-white font-bold hover:opacity-90 transition-all shadow-[0_3px_10px_rgba(95,122,97,0.25)] border-none"
                          onClick={() => setIsSubmissionOpen(true)}
                        >
                          提交推广成果
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#5F7A61] to-[#F3A390] text-white font-bold text-base shadow-[0_3px_12px_rgba(95,122,97,0.3)] border-none hover:opacity-90 transition-all group"
                        onClick={handleJoin}
                      >
                        立即参与并开启 AI 创意创作
                        <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground/60">
                    参与此任务即代表您已同意《任务广场协议》与《aiautoedit 社区规范》。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MissionSubmissionModal 
        mission={mission} 
        isOpen={isSubmissionOpen} 
        onClose={() => setIsSubmissionOpen(false)} 
      />
    </>
  )
}
