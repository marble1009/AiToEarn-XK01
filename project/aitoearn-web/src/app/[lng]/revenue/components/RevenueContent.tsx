'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, DollarSign, Activity, ArrowUpRight, History } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import RevenueChart from './RevenueChart'
import EarningList from './EarningList'
import WithdrawModal from './WithdrawModal'
import { useUserStore } from '@/store/user'

interface RevenueContentProps {
  lng: string
}

export default function RevenueContent({ lng }: RevenueContentProps) {
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const creditsBalance = useUserStore(state => state.creditsBalance)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600 font-semibold tracking-wide uppercase text-sm">
            <Wallet size={18} />
            <span>Financial Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            收益看板
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            实时追踪您的推广收益与数据表现。将您的创意与影响力转化为实际收入。
          </p>
        </div>
        
        <Button 
          onClick={() => setWithdrawOpen(true)}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 hover:shadow-green-300/50 transition-all cursor-pointer h-14 px-8 rounded-2xl group"
        >
          <ArrowUpRight className="mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          立即提现
        </Button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <GlassCard className="h-full flex flex-col justify-between p-6 bg-gradient-to-br from-white to-green-50/30 border-green-100/50">
              <div className="flex items-center gap-3 mb-4 text-green-600">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign size={24} />
                </div>
                <span className="font-semibold">可提现余额</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">${(creditsBalance / 100).toFixed(2)}</span>
                <span className="text-gray-500 text-sm font-medium">USD</span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="h-full flex flex-col justify-between p-6">
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <span className="font-semibold">本月总收益</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">$1,284.50</span>
                <span className="text-gray-500 text-sm font-medium">USD</span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="h-full flex flex-col justify-between p-6">
              <div className="flex items-center gap-3 mb-4 text-blue-500">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity size={24} />
                </div>
                <span className="font-semibold">总曝光/点击</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">45.2K</span>
                <span className="text-green-500 text-sm font-bold flex items-center">
                  <ArrowUpRight size={14} /> 12%
                </span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard className="h-full flex flex-col justify-between p-6">
              <div className="flex items-center gap-3 mb-4 text-purple-500">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History size={24} />
                </div>
                <span className="font-semibold">待结算收益</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">$340.00</span>
                <span className="text-gray-500 text-sm font-medium">USD</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <motion.div variants={item} className="lg:col-span-2">
            <GlassCard className="p-6 h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">收益趋势分析</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium cursor-pointer hover:bg-gray-200">7天</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-800 text-sm rounded-full font-medium cursor-pointer shadow-sm">30天</span>
                </div>
              </div>
              <RevenueChart />
            </GlassCard>
          </motion.div>

          {/* Recent Earnings List */}
          <motion.div variants={item} className="lg:col-span-1">
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">最新收益明细</h3>
                <span className="text-sm text-green-600 font-semibold cursor-pointer hover:underline">查看全部</span>
              </div>
              <EarningList />
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} balance={creditsBalance} />
    </div>
  )
}
