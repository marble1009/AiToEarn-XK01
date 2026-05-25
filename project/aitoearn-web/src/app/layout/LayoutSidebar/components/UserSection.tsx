/**
 * UserSection - 用户头像/登录按钮区域
 */

'use client'

import type { UserSectionProps } from '../types'
import { LogIn } from 'lucide-react'
import { useTransClient } from '@/app/i18n/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'
import { getOssUrl } from '@/utils/oss'

/** 用户头像组件 */
function UserAvatar({
  collapsed,
  onOpenSettings,
}: {
  collapsed: boolean
  onOpenSettings: () => void
}) {
  const userInfo = useUserStore(state => state.userInfo)
  const { t } = useTransClient('common')

  if (!userInfo) {
    return null
  }

  const handleClick = () => {
    onOpenSettings()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              'flex w-full cursor-pointer items-center rounded-lg border border-transparent bg-transparent transition-all hover:bg-[#39FF14]/5 hover:border-[#39FF14]/20',
              collapsed ? 'justify-center p-1' : 'gap-2 px-2 py-1.5',
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 border border-[#39FF14]/40 shadow-[0_0_8px_rgba(57,255,20,0.2)]">
              <AvatarImage src={getOssUrl(userInfo.avatar) || ''} alt={userInfo.name || t('unknownUser')} />
              <AvatarFallback className="bg-muted-foreground font-semibold text-background">
                {userInfo.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="w-full truncate text-sm font-medium text-foreground text-left group-hover:text-[#39FF14] transition-colors">
                  {userInfo.name || t('unknownUser')}
                </span>
              </div>
            )}
          </button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">
            <p>{t('profile')}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export function UserSection({ collapsed, onLogin, onOpenSettings }: UserSectionProps) {
  const token = useUserStore(state => state.token)
  const { t } = useTransClient('common')

  if (token) {
    return <UserAvatar collapsed={collapsed} onOpenSettings={onOpenSettings} />
  }

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLogin}
              size="icon"
              className="h-9 w-9 border border-[#39FF14]/40 bg-black text-[#39FF14] hover:bg-[#39FF14]/15 hover:text-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.2)]"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t('login')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      onClick={onLogin}
      className="mt-1 w-full border border-[#39FF14]/40 bg-black text-[#39FF14] hover:bg-[#39FF14]/15 hover:text-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.2)]"
    >
      {t('login')}
    </Button>
  )
}

