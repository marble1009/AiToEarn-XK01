'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link as LinkIcon, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mission } from '../mission.type'
import { submitWorkApi } from '@/api/mission'

interface MissionSubmissionModalProps {
  mission: Mission | null
  isOpen: boolean
  onClose: () => void
}

export function MissionSubmissionModal({ mission, isOpen, onClose }: MissionSubmissionModalProps) {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!mission) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      setError('请提供有效的发布链接')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('URL 格式无效，请以 http:// 或 https:// 开头')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Real API call to submit work
      await submitWorkApi({
        missionId: mission.id,
        missionTitle: mission.title,
        brand: mission.brand,
        workUrl: url,
        rewardValue: parseFloat(mission.rewardValue.replace(/[^0-9.]/g, '')) * 100 // Convert to cents
      })

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setUrl('')
      }, 2500)
    } catch (err: any) {
      setError(err.message || '提交失败，请重新尝试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#09090b]/95 border border-[#39FF14]/30 shadow-[0_0_25px_rgba(57,255,20,0.25)] rounded-[2rem] overflow-hidden p-8 text-foreground"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-[#39FF14] hover:text-[#FF007F] transition-colors"
            >
              <X size={24} />
            </button>

            {!isSuccess ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge className="bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 mb-2">提交成果</Badge>
                  <h2 className="text-2xl font-black text-foreground leading-tight">
                    {mission.title}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    粘贴您在小红书、抖音或哔哩哔哩上发布的创作链接，系统审计通过后即可领取灵光奖励。
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#39FF14] uppercase tracking-widest px-1">
                      作品发布链接
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39FF14]/60 group-focus-within:text-[#FF007F] transition-colors">
                        <LinkIcon size={18} />
                      </div>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://xiaohongshu.com/discovery/item/..."
                        className="h-14 pl-12 rounded-2xl border border-[#39FF14]/20 bg-black/80 text-foreground placeholder:text-muted-foreground/40 focus:border-[#39FF14] focus:ring-[0_0_8px_rgba(57,255,20,0.3)] transition-all outline-none text-sm"
                      />
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-[#FF007F] text-xs font-semibold px-1"
                      >
                        <AlertCircle size={14} />
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#FF007F] text-black font-black text-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] flex items-center justify-center gap-2 border-none hover:opacity-90 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        确认提交审核
                        <Send size={18} />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                  <CheckCircle2 size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground">提交成功！</h3>
                  <p className="text-muted-foreground text-sm mt-1">系统智体将在短期内对您的发布内容进行自动审计。</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${className}`}>
      {children}
    </span>
  )
}
