/**
 * LayoutSidebar - 左侧侧边栏布局组件
 * 包含 Logo、主导航、底部功能区（余额、插件）、用户下拉菜单与快捷语言切换
 * 支持展开/收缩两种状态
 */
'use client'

import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { routerData } from '@/app/layout/routerData'
import { useNavigationLogic } from '@/app/layout/shared'
import NotificationPanel from '@/components/notification/NotificationPanel'
import { useSettingsModalStore } from '@/components/SettingsModal/store'
import { useNotification } from '@/hooks/useNotification'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'
import { BottomSection, LogoSection, NavSection, UserDropdownMenu } from './components'
import { MyChannelsEntry } from './components/BottomSection/MyChannelsEntry'
import { Globe } from 'lucide-react'
import { useGetClientLng } from '@/hooks/useSystem'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { cookieName } from '@/app/i18n/settings'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * 侧边栏主组件
 */
function LayoutSidebar() {
  const { currRouter, isAuthPage } = useNavigationLogic()
  const { unreadCount } = useNotification()
  const lng = useGetClientLng()
  const router = useRouter()

  const toggleLanguage = () => {
    const newLng = lng === 'zh-CN' ? 'en' : 'zh-CN'
    setCookie(cookieName, newLng, { path: '/' })
    const currentPath = window.location.pathname
    const pathWithoutLang = currentPath.replace(`/${lng}`, '') || '/'
    const newPath = `/${newLng}${pathWithoutLang}`
    router.push(newPath)
    router.refresh()
  }

  // 获取侧边栏状态和设置方法
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useUserStore(
    useShallow(state => ({
      sidebarCollapsed: state.sidebarCollapsed,
      setSidebarCollapsed: state.setSidebarCollapsed,
    })),
  )

  // UI 状态
  const [notificationVisible, setNotificationVisible] = useState(false)
  const { openSettings } = useSettingsModalStore()

  // 首页、auth、websit、welcome 页面不显示侧边栏，未登录也绝不显示侧边栏
  const token = useUserStore(state => state.token)
  if (isAuthPage || !token) {
    return null
  }

  // 转换路由数据为 NavSection 所需格式
  const navItems = routerData.map(item => ({
    path: item.path || '/',
    translationKey: item.translationKey,
    icon: item.icon,
  }))

  return (
    <>
      <aside
        className={cn(
          'group sticky left-0 top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar p-3 transition-all duration-300 md:flex',
          collapsed ? 'w-[68px] min-w-[68px]' : 'w-[240px] min-w-[240px]',
        )}
      >
        {/* Logo 区域 - 固定 */}
        <LogoSection collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* 可滚动区域：主导航 */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <NavSection items={navItems} currentRoute={currRouter!} collapsed={collapsed} />
        </div>

        {/* 底部固定区域 - 不随滚动 */}
        <div className="flex-shrink-0">
          {/* 极简快捷中英文切换 */}
          {collapsed ? (
            <div className="pb-2 flex justify-center w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleLanguage}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-sidebar-border bg-background text-[#5F7A61] hover:bg-[#5F7A61]/10 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Globe size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{lng === 'zh-CN' ? 'Switch to English' : '切换至中文'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="pb-2 px-1">
              <button
                onClick={toggleLanguage}
                className="flex w-full items-center gap-3 rounded-xl border border-[#5F7A61]/15 bg-background hover:bg-[#5F7A61]/10 px-3 py-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Globe size={16} className="text-[#5F7A61]" />
                <span className="flex-1 text-left select-none">
                  {lng === 'zh-CN' ? '系统语言 / Language' : 'System Language'}
                </span>
                <span className="text-[10px] font-bold text-[#FAF7F2] bg-[#5F7A61] px-2 py-0.5 rounded-full select-none shadow-sm">
                  {lng === 'zh-CN' ? '中' : 'EN'}
                </span>
              </button>
            </div>
          )}

          {/* 我的频道入口 */}
          <div className="pb-1 flex flex-1">
            <MyChannelsEntry collapsed={collapsed} />
          </div>

          {/* 底部功能区 */}
          <BottomSection collapsed={collapsed} onOpenSettings={openSettings} />

          {/* 用户下拉菜单 */}
          <div className="mt-2 border-t border-sidebar-border pt-2">
            <UserDropdownMenu
              collapsed={collapsed}
              unreadCount={unreadCount}
              onOpenNotification={() => setNotificationVisible(true)}
              onOpenSettings={openSettings}
            />
          </div>
        </div>
      </aside>

      {/* 通知面板 */}
      <NotificationPanel
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </>
  )
}

export default LayoutSidebar
