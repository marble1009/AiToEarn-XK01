'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, CheckCircle2, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mission } from '../mission.type'
import { useRouter } from 'next/navigation'

interface MissionDetailModalProps {
  mission: Mission | null
  isOpen: boolean
  onClose: () => void
  lng: string
}

export function MissionDetailModal({ mission, isOpen, onClose, lng }: MissionDetailModalProps) {
  const router = useRouter()

  if (!mission) return null

  const handleJoin = () => {
    // Navigate to Draft Box with mission context
    router.push(`/${lng}/draft-box?missionId=${mission.id}&brand=${mission.brand}`)
    onClose()
  }

  return (
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
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left: Visual & Brand */}
            <div className="w-full md:w-5/12 bg-gray-50 relative">
              <div className="relative h-64 md:h-full w-full">
                <Image
                  src={mission.coverImage}
                  alt={mission.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white p-1 overflow-hidden">
                      <Image src={mission.brandLogo} alt={mission.brand} width={24} height={24} />
                    </div>
                    <span className="font-bold text-lg">{mission.brand}</span>
                    <ShieldCheck size={18} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black leading-tight">{mission.title}</h2>
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                {/* Reward Highlight */}
                <div className="flex items-center justify-between p-6 rounded-3xl bg-orange-50 border border-orange-100">
                  <div>
                    <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-1">Potential Revenue</p>
                    <p className="text-4xl font-black text-orange-600">{mission.estimatedEarnings}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-orange-600 text-white mb-2">{mission.rewardType}</Badge>
                    <p className="text-sm font-bold text-gray-700">{mission.rewardValue}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800">Mission Description</h3>
                  <p className="text-gray-500 leading-relaxed">
                    {mission.description}
                  </p>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Requirements</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {mission.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-600 text-sm">
                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Kit Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">NVIDIA AI Kit Available</p>
                      <p className="text-xs text-blue-600">Pre-configured prompts & templates for this mission.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">Pro</Badge>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-4">
                  <Button 
                    className="flex-grow h-14 rounded-2xl bg-warm-gradient text-white font-bold text-lg shadow-xl shadow-orange-200 group"
                    onClick={handleJoin}
                  >
                    Join & Start AI Creation
                    <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" className="h-14 w-14 rounded-2xl border-gray-200 shrink-0">
                    <ExternalLink size={20} className="text-gray-400" />
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-400">
                  By joining, you agree to the Campaign Terms and Community Guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
