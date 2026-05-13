'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, Megaphone, Target, BarChart3, ArrowRight } from 'lucide-react'
import { useBrandPromotionStore } from '../brandPromotionStore'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import CreatePlanModal from './CreatePlanModal'
import { useRouter } from 'next/navigation'

interface BrandPromotionContentProps {
  lng: string
}

export default function BrandPromotionContent({ lng }: BrandPromotionContentProps) {
  const router = useRouter()
  const { 
    plans, 
    plansLoading, 
    fetchPlans, 
    openCreatePlanModal 
  } = useBrandPromotionStore()

  useEffect(() => {
    fetchPlans(1)
  }, [fetchPlans])

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
    <div className="min-h-screen bg-cream p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500 font-semibold tracking-wide uppercase text-sm">
            <Megaphone size={18} />
            <span>Monetize Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            推广计划大厅
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            在这里发现、创建并管理您的内容变现计划。每一个创意都值得被赋予商业价值。
          </p>
        </div>
        
        <Button 
          onClick={openCreatePlanModal}
          size="lg"
          className="bg-warm-gradient text-white border-none shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 transition-all cursor-pointer h-14 px-8 rounded-2xl group"
        >
          <Plus className="mr-2 group-hover:rotate-90 transition-transform" />
          新建推广计划
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {plansLoading && plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-400" />
            <p className="text-gray-400 font-medium">正在为您加载计划...</p>
          </div>
        ) : plans.length === 0 ? (
          <GlassCard className="py-24 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-10 h-10 text-orange-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">暂无推广计划</h3>
                <p className="text-gray-500">点击右上角按钮，开启您的第一个内容变现旅程。</p>
              </div>
              <Button 
                variant="outline" 
                onClick={openCreatePlanModal}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                立即创建
              </Button>
            </div>
          </GlassCard>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={item}>
                <GlassCard 
                  className="group hover:border-orange-200 transition-all cursor-pointer h-full flex flex-col"
                  onClick={() => router.push(`/${lng}/draft-box?planId=${plan.id}`)}
                >
                  <div className="flex-grow space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
                        <BarChart3 size={24} />
                      </div>
                      <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
                        Active
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {plan.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {plan.desc || '暂无描述，点击进入计划详情管理您的素材与生成任务。'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {plan.platform ? (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-bold">
                          {plan.platform}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded uppercase font-bold italic">
                          All Platforms
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-sm font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">
                    <span>进入管理</span>
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreatePlanModal />
    </div>
  )
}
