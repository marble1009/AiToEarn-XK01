import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export function GlassCard({ children, className, hoverable = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-effect rounded-3xl p-6 transition-all duration-300 ease-out',
        hoverable && 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-200/50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
