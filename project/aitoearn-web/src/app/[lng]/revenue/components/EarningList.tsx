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
          className="flex items-center justify-between p-4 rounded-2xl bg-black/60 border border-[#39FF14]/15 hover:border-[#FF007F]/40 hover:bg-[#FF007F]/5 hover:shadow-[0_0_12px_rgba(255,0,127,0.15)] transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-black border border-[#39FF14]/30 shadow-[0_0_8px_rgba(57,255,20,0.15)] flex items-center justify-center group-hover:scale-110 transition-transform">
              {getPlatformIcon(item.platform)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.planName}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.platform === 'RED' ? '小红书' : item.platform}</span>
                <span className="text-[10px] text-muted-foreground/30">•</span>
                <span className="text-[10px] text-muted-foreground font-medium">{item.date}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-black text-[#39FF14] drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]">+${item.amount.toFixed(2)}</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {item.status === 'completed' ? (
                <>
                  <CheckCircle2 size={10} className="text-[#FF007F] drop-shadow-[0_0_4px_rgba(255,0,127,0.4)]" />
                  <span className="text-[10px] text-[#FF007F] font-bold uppercase tracking-tight drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]">已结算</span>
                </>
              ) : (
                <>
                  <Clock size={10} className="text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight">结算中</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
