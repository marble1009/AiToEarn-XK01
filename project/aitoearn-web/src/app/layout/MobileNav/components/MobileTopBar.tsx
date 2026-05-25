import type { MobileTopBarProps } from '../types'
/**
 * MobileTopBar - 移动端顶部栏
 * 左侧 Logo + 文字，右侧根据登录状态显示用户头像或菜单图标
 */
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useTransClient } from '@/app/i18n/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/store/user'
import { getOssUrl } from '@/utils/oss'

export function MobileTopBar({ onOpen }: MobileTopBarProps) {
  const { t } = useTransClient('common')
  const token = useUserStore(state => state.token)
  const userInfo = useUserStore(state => state.userInfo)

  const isLoggedIn = !!token && !!userInfo

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-background border-b border-border" data-testid="mobile-topbar">
      <Link href="/" className="flex items-center gap-2" data-testid="mobile-topbar-logo">
        <div className="relative flex size-8 items-center justify-center rounded bg-black border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
          <span className="text-[#39FF14] text-xs font-black">A</span>
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#FF007F] animate-ping" />
        </div>
        <span className="text-sm font-black tracking-widest text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
          Aura<span className="text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">String</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <button
            onClick={onOpen}
            data-testid="mobile-topbar-menu-btn"
            className="flex items-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Avatar className="h-7 w-7 shrink-0 border border-border">
              <AvatarImage src={getOssUrl(userInfo.avatar) || ''} alt={userInfo.name || t('unknownUser')} />
              <AvatarFallback className="bg-muted-foreground font-semibold text-background text-xs">
                {userInfo.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button
            onClick={onOpen}
            data-testid="mobile-topbar-menu-btn"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
    </div>
  )
}
