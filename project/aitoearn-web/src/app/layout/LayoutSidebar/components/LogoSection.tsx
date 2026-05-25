/**
 * LogoSection - 侧边栏 Logo 区域
 */

'use client'

import type { LogoSectionProps } from '../types'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Link from 'next/link'
import { useGetClientLng } from '@/hooks/useSystem'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'

export function LogoSection({ collapsed, onToggle }: LogoSectionProps) {
  const lng = useGetClientLng()
  const token = useUserStore(state => state.token)
  const userInfo = useUserStore(state => state.userInfo)
  const userId = userInfo?.id || userInfo?._id
  const logoHref = token ? `/${lng}/${userId || ''}` : '/'

  return (
    <div
      className={cn(
        'mb-3 flex items-center',
        collapsed ? 'justify-center px-1 py-2' : 'justify-between px-2 py-2',
      )}
    >
      {collapsed ? (
        // 收起状态：默认显示 logo，hover 时显示展开按钮
        <div className="relative flex h-8 w-8 items-center justify-center">
          {/* Logo - 默认显示，hover 时隐藏 */}
          <Link
            href={logoHref}
            className="flex items-center justify-center transition-opacity group-hover:opacity-0"
            data-testid="sidebar-logo-link"
          >
            <div className="relative flex size-8 items-center justify-center rounded bg-black border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
              <span className="text-[#39FF14] text-xs font-black">A</span>
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#FF007F] animate-ping" />
            </div>
          </Link>
          {/* 展开按钮 - 默认隐藏，hover 时显示 */}
          <button
            onClick={onToggle}
            className="absolute inset-0 flex items-center justify-center rounded-md border-none bg-transparent text-muted-foreground/70 opacity-0 transition-opacity hover:bg-accent hover:text-muted-foreground group-hover:opacity-100"
            data-testid="sidebar-toggle-btn"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      ) : (
        <>
          <Link
            href={logoHref}
            className="flex items-center gap-2 text-foreground no-underline hover:opacity-85"
            data-testid="sidebar-logo-link"
          >
            <div className="relative flex size-8 items-center justify-center rounded bg-black border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
              <span className="text-[#39FF14] text-xs font-black">A</span>
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#FF007F] animate-ping" />
            </div>
            <span className="text-sm font-black tracking-widest text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
              Aura<span className="text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">String</span>
            </span>
          </Link>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent text-muted-foreground/70 transition-colors hover:bg-accent hover:text-muted-foreground"
            data-testid="sidebar-toggle-btn"
          >
            <PanelLeftClose size={18} />
          </button>
        </>
      )}
    </div>
  )
}
