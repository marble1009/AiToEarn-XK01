import type { MobileTopBarProps } from '../types'
/**
 * MobileTopBar - 移动端顶部栏
 * 左侧 Logo + 文字，右侧根据登录状态显示用户头像或菜单图标
 */
import { Menu, Globe, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { cookieName } from '@/app/i18n/settings'
import { useTransClient } from '@/app/i18n/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/store/user'
import { getOssUrl } from '@/utils/oss'
import { useGetClientLng } from '@/hooks/useSystem'

export function MobileTopBar({ onOpen }: MobileTopBarProps) {
  const { t } = useTransClient('common')
  const token = useUserStore(state => state.token)
  const userInfo = useUserStore(state => state.userInfo)
  const lng = useGetClientLng()
  const router = useRouter()
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const handleLanguageChange = (newLng: string) => {
    if (newLng === lng) return
    setCookie(cookieName, newLng, { path: '/' })
    
    const currentPath = window.location.pathname
    const pathWithoutLang = currentPath.replace(`/${lng}`, '') || '/'
    const newPath = `/${newLng}${pathWithoutLang}`
    
    router.push(newPath)
    router.refresh()
  }

  const isLoggedIn = !!token && !!userInfo

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-background border-b border-border" data-testid="mobile-topbar">
      <Link href="/" className="flex items-center gap-2" data-testid="mobile-topbar-logo">
        <div className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#D2232A] to-[#A80B1E] text-white shadow-[0_3px_10px_rgba(210,35,42,0.3)]">
          <span className="text-xs font-bold leading-none select-none">{lng === 'zh-CN' ? '客' : 'a'}</span>
          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#E5B25D]" />
        </div>
        <span className="text-base font-bold tracking-tight text-[#2A2A2A] dark:text-[#FDFBF7]">
          {lng === 'zh-CN' ? '爱易客' : 'aiautoedit'}
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        {/* Mobile Language Switcher */}
        <div className="relative flex items-center">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#5F7A61]/25 text-xs font-semibold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 bg-white/40 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:border-[#5F7A61]/50 cursor-pointer select-none"
          >
            <Globe className="size-3.5 text-[#5F7A61]" />
            <span>{lng === 'zh-CN' ? '中' : 'EN'}</span>
            <ChevronDown className="size-3 text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50" />
          </button>

          {langDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setLangDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-28 rounded-xl border border-[#5F7A61]/10 bg-white dark:bg-[#18221B] p-1.5 shadow-[0_10px_25px_rgba(95,122,97,0.08)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleLanguageChange('zh-CN')
                    setLangDropdownOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all border-none bg-transparent ${
                    lng === 'zh-CN' 
                      ? 'bg-[#5F7A61]/10 text-[#5F7A61]' 
                      : 'text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 hover:bg-[#5F7A61]/5 hover:text-[#5F7A61]'
                  }`}
                >
                  简体中文
                </button>
                <button
                  onClick={() => {
                    handleLanguageChange('en')
                    setLangDropdownOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all mt-1 border-none bg-transparent ${
                    lng === 'en' 
                      ? 'bg-[#5F7A61]/10 text-[#5F7A61]' 
                      : 'text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 hover:bg-[#5F7A61]/5 hover:text-[#5F7A61]'
                  }`}
                >
                  English
                </button>
              </div>
            </>
          )}
        </div>

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
