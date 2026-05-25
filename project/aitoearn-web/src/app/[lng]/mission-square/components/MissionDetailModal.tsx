'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, CheckCircle2, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react'
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
              className="relative w-full max-w-4xl bg-[#09090b]/95 border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.25)] rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] backdrop-blur-md"
            >
              {/* Left: Visual & Brand */}
              <div className="w-full md:w-5/12 bg-black relative border-r border-[#39FF14]/15">
                <div className="relative h-64 md:h-full w-full">
                  <Image
                    src={mission.coverImage}
                    alt={mission.title}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 text-white space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black border border-[#39FF14]/40 p-1 overflow-hidden shadow-[0_0_6px_rgba(57,255,20,0.3)]">
                        <Image src={mission.brandLogo} alt={mission.brand} width={24} height={24} className="rounded-full" />
                      </div>
                      <span className="font-bold text-lg text-foreground">{mission.brand}</span>
                      <ShieldCheck size={18} className="text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]" />
                    </div>
                    <h2 className="text-2xl font-black leading-tight text-foreground tracking-wider">{mission.title}</h2>
                  </div>
                </div>
              </div>

              {/* Right: Info & Actions */}
              <div className="w-full md:w-7/12 p-8 overflow-y-auto text-foreground">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] hover:bg-[#39FF14]/15 hover:text-[#39FF14] transition-colors shadow-[0_0_8px_rgba(57,255,20,0.15)]"
                >
                  <X size={20} />
                </button>

                <div className="space-y-8">
                  {/* Reward Highlight */}
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-[#030303] border border-[#39FF14]/30 shadow-[inset_0_0_15px_rgba(57,255,20,0.05)]">
                    <div>
                      <p className="text-sm font-black text-[#39FF14] uppercase tracking-widest mb-1 drop-shadow-[0_0_6px_rgba(57,255,20,0.3)]">预估灵光收益</p>
                      <p className="text-4xl font-black text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">{mission.estimatedEarnings}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#FF007F] text-white hover:bg-[#FF007F]/90 border-none font-bold mb-2">{translateRewardType(mission.rewardType)}</Badge>
                      <p className="text-sm font-bold text-[#FF007F] drop-shadow-[0_0_6px_rgba(255,0,127,0.3)]">{mission.rewardValue}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.3)]">灵光任务描述</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {mission.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.3)]">任务要求细则</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {mission.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/80 border border-[#39FF14]/20 text-muted-foreground text-sm shadow-[0_0_8px_rgba(57,255,20,0.05)]">
                          <CheckCircle2 size={18} className="text-[#39FF14] shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Kit Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-black via-[#39FF14]/5 to-black border border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.15)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black border border-[#39FF14]/40 shadow-[0_0_6px_rgba(57,255,20,0.3)] flex items-center justify-center text-[#39FF14]">
                        <Zap size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#39FF14]">NVIDIA AI 灵感套件已就绪</p>
                        <p className="text-xs text-muted-foreground">已为此任务预置专属 Prompt 创作指令模板。</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[#39FF14] border-[#39FF14]/30 bg-transparent">Pro 专业版</Badge>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col gap-3">
                    {isJoined ? (
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <Button 
                          variant="outline"
                          className="h-14 rounded-2xl border-[#39FF14]/30 bg-black text-[#39FF14] hover:bg-[#39FF14]/15 hover:text-[#39FF14] font-bold"
                          onClick={handleJoin}
                        >
                          进入创作工坊
                        </Button>
                        <Button 
                          className="h-14 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#FF007F] text-black font-black hover:opacity-90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] border-none"
                          onClick={() => setIsSubmissionOpen(true)}
                        >
                          提交灵光成果
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#FF007F] text-black font-black text-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] border-none hover:opacity-90 transition-all group"
                        onClick={handleJoin}
                      >
                        立即参与并开启 AI 灵感创作
                        <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                  </div>

                  <p className="text-center text-xs text-muted-foreground/60">
                    参与此任务即代表您已同意《任务广场协议》与《AuraString 社区规范》。
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
