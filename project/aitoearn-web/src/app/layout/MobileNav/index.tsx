/**
 * MobileNav - 移动端顶部导航组件
 * 在移动端显示，包含 Logo 和抽屉式导航菜单
 * 与桌面端侧边栏功能保持一致
 */
'use client'

import { X, Sparkles, Inbox, Link as LinkIcon, Menu } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useNavigationLogic } from '@/app/layout/shared'
import { useChannelManagerStore } from '@/components/ChannelManager'
import { useSettingsModalStore } from '@/components/SettingsModal/store'
import { cn } from '@/lib/utils'
import { MobileBottomSection, MobileNavList, MobileTopBar } from './components'
import { useUserStore } from '@/store/user'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/**
 * 移动端导航主组件
 */
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { currRouter, isAuthPage } = useNavigationLogic()
  const { openSettings } = useSettingsModalStore()

  // 频道管理器
  const { openModal } = useChannelManagerStore(
    useShallow(state => ({
      openModal: state.openModal,
    })),
  )

  const params = useParams()
  // 首页、auth、websit、welcome 页面不显示，未登录也绝不显示
  const token = useUserStore(state => state.token)
  if (isAuthPage || !token) {
    return null
  }

  const handleClose = () => setIsOpen(false)

  const isAiSocial = currRouter?.includes('/ai-social')
  const isDraftBox = currRouter?.includes('/draft-box')
  const isAccounts = currRouter?.includes('/accounts')

  return (
    <>
      {/* 移动端顶部栏 */}
      <MobileTopBar onOpen={() => setIsOpen(true)} />

      {/* 抽屉遮罩 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity"
          data-testid="mobile-drawer-overlay"
          onClick={handleClose}
        />
      )}

      {/* 抽屉导航 */}
      <div
        data-testid="mobile-drawer"
        className={cn(
          'md:hidden fixed top-0 right-0 z-[60] w-[300px] h-full bg-background shadow-xl transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 抽屉头部 */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <span className="text-base font-semibold text-foreground">功能菜单</span>
          <button
            onClick={handleClose}
            data-testid="mobile-drawer-close"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* 可滚动导航区域 */}
        <div className="flex-1 overflow-y-auto">
          <MobileNavList
            currentRoute={currRouter}
            onClose={handleClose}
            onOpenMyChannels={openModal}
          />
        </div>

        {/* 底部功能区 - 固定在底部 */}
        <div className="shrink-0 px-4 pb-4 border-t border-border">
          <MobileBottomSection onClose={handleClose} onOpenSettings={openSettings} />
        </div>
      </div>

      {/* 移动端微信式底部四栏导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {/* 工作台 */}
        <Link 
          href={`/${params.lng}/ai-social`}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors duration-200",
            isAiSocial
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className={cn("w-5 h-5 mb-1", isAiSocial ? "text-primary" : "text-muted-foreground")} />
          <span>工作台</span>
        </Link>

        {/* 草稿箱 */}
        <Link 
          href={`/${params.lng}/draft-box`}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors duration-200",
            isDraftBox
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Inbox className={cn("w-5 h-5 mb-1", isDraftBox ? "text-primary" : "text-muted-foreground")} />
          <span>草稿箱</span>
        </Link>

        {/* 账号绑定 */}
        <Link 
          href={`/${params.lng}/accounts`}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors duration-200",
            isAccounts
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LinkIcon className={cn("w-5 h-5 mb-1", isAccounts ? "text-primary" : "text-muted-foreground")} />
          <span>账号绑定</span>
        </Link>

        {/* 更多/菜单 */}
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
          )}
        >
          <Menu className="w-5 h-5 mb-1 text-muted-foreground" />
          <span>更多菜单</span>
        </button>
      </nav>
    </>
  )
}

export default MobileNav
