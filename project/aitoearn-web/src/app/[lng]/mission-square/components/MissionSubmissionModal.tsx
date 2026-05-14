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
      setError('Please provide a valid social media link')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Invalid URL format. Please include http:// or https://')
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
      setError(err.message || 'Failed to submit work. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

    // Close after success
    setTimeout(() => {
      onClose()
      setIsSuccess(false)
      setUrl('')
    }, 2500)
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
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {!isSuccess ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge className="bg-orange-100 text-orange-600 border-none mb-2">Submit Your Work</Badge>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {mission.title}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Paste the link to your published post on Twitter, TikTok, or Instagram to claim your rewards.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                      Published Link URL
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <LinkIcon size={18} />
                      </div>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://twitter.com/user/status/..."
                        className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                      />
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-red-500 text-xs font-medium px-1"
                      >
                        <AlertCircle size={14} />
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-warm-gradient text-white font-bold text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm Submission
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
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={40} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Submission Received!</h3>
                  <p className="text-gray-500 text-sm mt-1">Our brand team will audit your link soon.</p>
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
