'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function RevenueChart() {
  // Mock data for the chart
  const data = [
    { day: '05-01', value: 45 },
    { day: '05-02', value: 52 },
    { day: '05-03', value: 38 },
    { day: '05-04', value: 65 },
    { day: '05-05', value: 48 },
    { day: '05-06', value: 72 },
    { day: '05-07', value: 85 },
    { day: '05-08', value: 60 },
    { day: '05-09', value: 95 },
    { day: '05-10', value: 110 },
    { day: '05-11', value: 88 },
    { day: '05-12', value: 120 },
    { day: '05-13', value: 105 },
    { day: '05-14', value: 140 },
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex items-end justify-between gap-2 pt-4 pb-8">
        {data.map((item, index) => (
          <div key={index} className="flex-grow flex flex-col items-center group relative h-full justify-end">
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-10">
              ${item.value.toFixed(2)}
            </div>
            
            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
              className="w-full max-w-[40px] bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg group-hover:from-green-600 group-hover:to-green-400 transition-colors relative"
            >
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            
            {/* Label */}
            <div className="absolute -bottom-6 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              {item.day.split('-')[1]}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend / Info */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-50 text-xs font-medium text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>每日预估收益 (USD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span>转化完成率</span>
        </div>
      </div>
    </div>
  )
}
