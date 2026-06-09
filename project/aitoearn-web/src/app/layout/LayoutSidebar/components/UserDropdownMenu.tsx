/**
 * UserDropdownMenu - 用户头像下拉菜单组件
 * 参考飞书风格，将用户相关功能收纳到下拉菜单中
 * 支持展开/折叠两种状态
 */

'use client'

import type { SidebarCommonProps } from '../types'
import type { SettingsTab } from '@/components/SettingsModal'
import { Bell, BookOpen, ChevronRight, FileText, Globe, LogIn, LogOut, Mail, ScrollText, Settings, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTransClient } from '@/app/i18n/client'
import { DOCS_URL, GITHUB_REPO } from '@/app/layout/shared/constants'
import { useGitHubStars } from '@/app/layout/shared/hooks/useGitHubStars'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CONTACT } from '@/constant'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'
import { navigateToLogin } from '@/utils/auth'
import { getOssUrl } from '@/utils/oss'
import { useGetClientLng } from '@/hooks/useSystem'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { cookieName } from '@/app/i18n/settings'

/** GitHub SVG 图标 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export interface UserDropdownMenuProps extends SidebarCommonProps {
  /** 未读通知数 */
  unreadCount: number
  /** 打开通知面板 */
  onOpenNotification: () => void
  /** 打开设置弹框 */
  onOpenSettings: (defaultTab?: SettingsTab) => void
}

/** 菜单项组件 */
function MenuItem({
  icon: Icon,
  label,
  rightContent,
  onClick,
  href,
  external,
  className,
}: {
  icon: React.ElementType
  label: string
  rightContent?: React.ReactNode
  onClick?: () => void
  href?: string
  external?: boolean
  className?: string
}) {
  const content = (
    <>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {rightContent}
    </>
  )

  const baseClassName = cn(
    'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent',
    className,
  )

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClassName}
        >
          {content}
        </a>
      )
    }
    return (
      <Link href={href} className={baseClassName}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={cn(baseClassName, 'border-none bg-transparent')}>
      {content}
    </button>
  )
}

/** 已登录用户的下拉菜单内容 */
function LoggedInMenuContent({
  collapsed,
  unreadCount,
  onOpenNotification,
  onOpenSettings,
  onClose,
}: {
  collapsed: boolean
  unreadCount: number
  onOpenNotification: () => void
  onOpenSettings: (defaultTab?: SettingsTab) => void
  onClose: () => void
}) {
  const { t } = useTransClient(['common'])
  const userInfo = useUserStore(state => state.userInfo)
  const logout = useUserStore(state => state.logout)
  const starCount = useGitHubStars()
  const lng = useGetClientLng()
  const router = useRouter()

  const handleLanguageChange = (newLng: string) => {
    if (newLng === lng) return
    setCookie(cookieName, newLng, { path: '/' })
    const currentPath = window.location.pathname
    const pathWithoutLang = currentPath.replace(`/${lng}`, '') || '/'
    const newPath = `/${newLng}${pathWithoutLang}`
    router.push(newPath)
    router.refresh()
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  const handleOpenSettings = () => {
    onOpenSettings()
    onClose()
  }

  const handleOpenNotification = () => {
    onOpenNotification()
    onClose()
  }

  return (
    <>
      <div className="flex flex-col gap-1 p-2">
        {/* 用户信息区域 */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-10 w-10 shrink-0 border border-[#5F7A61]/35">
            <AvatarImage src={getOssUrl(userInfo?.avatar) || ''} alt={userInfo?.name || t('common:unknownUser')} />
            <AvatarFallback className="bg-[#5F7A61]/10 font-bold text-[#5F7A61]">
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-bold text-[#5F7A61]" data-testid="sidebar-user-name">
              {userInfo?.name || t('common:unknownUser')}
            </span>
          </div>
        </div>

        <div className="my-1 h-px bg-[#5F7A61]/15" />

        {/* Language switcher group */}
        <div className="group/lang relative">
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-[#2A2A2A] dark:text-[#FDFBF7] transition-colors hover:bg-[#5F7A61]/10 select-none">
            <Globe size={16} className="shrink-0 text-[#E5B25D]" />
            <span className="flex-1 text-left">
              {lng === 'zh-CN' ? '切换语言 / Language' : 'Language / Switch'}
            </span>
            <span className="text-xs text-muted-foreground">
              {lng === 'zh-CN' ? '简体中文' : 'English'}
            </span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
          <div className="invisible absolute left-full top-0 z-50 pl-1 opacity-0 transition-all group-hover/lang:visible group-hover/lang:opacity-100">
            <div className="w-32 rounded-md border border-[#5F7A61]/25 bg-[#FAF7F2] dark:bg-[#202C24] p-1 shadow-md text-[#2A2A2A] dark:text-[#FDFBF7]">
              <button
                onClick={() => handleLanguageChange('zh-CN')}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors border-none bg-transparent',
                  lng === 'zh-CN' ? 'bg-[#5F7A61]/20 text-[#5F7A61]' : 'text-[#2A2A2A] dark:text-[#FDFBF7] hover:bg-[#5F7A61]/10'
                )}
              >
                简体中文
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors mt-1 border-none bg-transparent',
                  lng === 'en' ? 'bg-[#5F7A61]/20 text-[#5F7A61]' : 'text-[#2A2A2A] dark:text-[#FDFBF7] hover:bg-[#5F7A61]/10'
                )}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="my-1 h-px bg-[#5F7A61]/15" />

        {/* 中频：文档 + 联系我们 */}
        <div className="group/docs relative">
          {/* 触发行 */}
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
            <BookOpen size={16} className="shrink-0" />
            <span className="flex-1 text-left">{t('common:documents')}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
          {/* 右侧飞出面板 */}
          <div className="invisible absolute left-full top-0 z-50 pl-1 opacity-0 transition-all group-hover/docs:visible group-hover/docs:opacity-100">
            <div className="w-48 rounded-md border bg-popover p-1 shadow-md">
              <MenuItem icon={FileText} label={t('common:pluginGuide')} href="/websit/plugin-guide" />
              <MenuItem icon={Shield} label={t('common:privacyPolicy')} href="/websit/privacy-policy" />
              <MenuItem icon={ScrollText} label={t('common:termsOfService')} href="/websit/terms-of-service" />
            </div>
          </div>
        </div>
        <MenuItem
          icon={Mail}
          label={t('common:contactUs')}
          href={`mailto:${CONTACT}`}
          external
        />

        <div className="my-1 h-px bg-border" />

        {/* 高频：通知 + 设置 */}
        <div data-testid="sidebar-notification-entry">
          <MenuItem
            icon={Bell}
            label={t('common:notifications')}
            rightContent={
              unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1.5 text-[10px]"
                  data-testid="sidebar-notification-badge"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )
            }
            onClick={handleOpenNotification}
          />
        </div>
        <div data-testid="sidebar-settings-entry">
          <MenuItem
            icon={Settings}
            label={t('common:settings')}
            onClick={handleOpenSettings}
          />
        </div>

        <div className="my-1 h-px bg-border" />

        {/* 退出登录 */}
        <div data-testid="sidebar-logout-entry">
          <MenuItem
            icon={LogOut}
            label={t('common:logout')}
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        </div>
      </div>

    </>
  )
}

export function UserDropdownMenu({
  collapsed,
  unreadCount,
  onOpenNotification,
  onOpenSettings,
}: UserDropdownMenuProps) {
  const token = useUserStore(state => state.token)
  const userInfo = useUserStore(state => state.userInfo)
  const hasHydrated = useUserStore(state => state._hasHydrated)
  const { t } = useTransClient('common')
  const [open, setOpen] = useState(false)

  // 如果还未 hydrate 完成，显示骨架屏
  if (!hasHydrated) {
    if (collapsed) {
      return <Skeleton className="h-9 w-9 rounded-md" />
    }
    return <Skeleton className="mt-2 h-9 w-full rounded-md" />
  }

  // 未登录状态显示登录按钮
  if (!token) {
    const handleLogin = () => navigateToLogin()

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleLogin}
                size="icon"
                className="h-9 w-9 border border-[#5F7A61]/40 bg-[#FAF7F2] text-[#5F7A61] hover:bg-[#5F7A61]/10 hover:text-[#5F7A61] shadow-sm"
                data-testid="sidebar-login-btn"
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
        onClick={handleLogin}
        className="mt-2 w-full border border-[#5F7A61]/40 bg-[#FAF7F2] text-[#5F7A61] hover:bg-[#5F7A61]/10 hover:text-[#5F7A61] shadow-sm"
        data-testid="sidebar-login-btn"
      >
        {t('login')}
      </Button>
    )
  }

  // 已登录状态显示下拉菜单
  return (
    <div
      className={cn(
        'flex items-center rounded-lg transition-colors hover:bg-accent',
        collapsed ? 'p-1' : 'gap-2 px-2 py-1.5',
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                {/* 头像区域 - 点击打开设置弹框 */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onOpenSettings('profile')
                  }}
                  data-testid="sidebar-user-trigger"
                  className={cn(
                    'relative flex cursor-pointer items-center border-none bg-transparent flex-1',
                    collapsed ? 'justify-center' : 'gap-2',
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-[#5F7A61]/35">
                    <AvatarImage src={getOssUrl(userInfo?.avatar) || ''} alt={userInfo?.name || t('unknownUser')} />
                    <AvatarFallback className="bg-[#5F7A61]/10 font-bold text-[#5F7A61]">
                      {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {!collapsed && (
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="w-full truncate text-left text-sm font-medium text-foreground group-hover:text-[#5F7A61] transition-colors">
                        {userInfo?.name || t('unknownUser')}
                      </span>
                    </div>
                  )}

                  {/* 未读通知指示器 */}
                  {unreadCount > 0 && (
                    <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive shadow-sm" />
                  )}
                </button>
              </TooltipTrigger>
            </PopoverTrigger>
            {collapsed && !open && (
              <TooltipContent side="right">
                <p>{t('profile')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <PopoverContent
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'start'}
          className="w-64 p-0 bg-[#FAF7F2] dark:bg-[#202C24] border border-[#5F7A61]/35 shadow-[0_10px_30px_rgba(95,122,97,0.1)] text-[#2A2A2A] dark:text-[#FDFBF7] rounded-2xl overflow-hidden"
          sideOffset={4}
          data-testid="sidebar-user-menu"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <LoggedInMenuContent
            collapsed={collapsed}
            unreadCount={unreadCount}
            onOpenNotification={onOpenNotification}
            onOpenSettings={onOpenSettings}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
