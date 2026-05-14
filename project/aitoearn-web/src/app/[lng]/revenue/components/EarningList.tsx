'use client'

import React from 'react'
import { Instagram, Youtube, Twitter, Globe, CheckCircle2, Clock } from 'lucide-react'

export default function EarningList() {
  // Mock data for earnings list
  const earnings = [
    {
      id: 1,
      platform: 'TikTok',
      planName: '夏季美妆推广计划 #04',
      amount: 145.20,
      date: '今天 14:30',
      status: 'completed',
      type: 'conversion'
    },
    {
      id: 2,
      platform: 'Instagram',
      planName: '户外露营装备测评',
      amount: 88.00,
      date: '今天 09:15',
      status: 'completed',
      type: 'click'
    },
    {
      id: 3,
      platform: 'YouTube',
      planName: '智能家居全屋方案',
      amount: 210.50,
      date: '昨天 18:40',
      status: 'pending',
      type: 'conversion'
    },
    {
      id: 4,
      platform: 'Twitter',
      planName: 'Web3 开发者峰会招募',
      amount: 32.40,
      date: '昨天 11:20',
      status: 'completed',
      type: 'click'
    },
    {
      id: 5,
      platform: 'TikTok',
      planName: '国风服装联名发布',
      amount: 67.80,
      date: '2026-05-12',
      status: 'completed',
      type: 'conversion'
    },
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram size={18} className="text-pink-500" />
      case 'YouTube': return <Youtube size={18} className="text-red-500" />
      case 'Twitter': return <Twitter size={18} className="text-blue-400" />
      default: return <Globe size={18} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {earnings.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/50 transition-colors border border-transparent hover:border-gray-100 group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              {getPlatformIcon(item.platform)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.planName}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.platform}</span>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[10px] text-gray-400 font-medium">{item.date}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-black text-gray-900">+${item.amount.toFixed(2)}</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {item.status === 'completed' ? (
                <>
                  <CheckCircle2 size={10} className="text-green-500" />
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">已结算</span>
                </>
              ) : (
                <>
                  <Clock size={10} className="text-orange-400" />
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-tight">结算中</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
