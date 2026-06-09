/**
 * MainContent - 主内容区域包装组件
 * 根据当前路由动态控制顶部间距（pt-14 用于移动端导航栏占位）
 * 并在桌面端右上角渲染统一悬浮的 Globe 语言切换下拉框
 */
'use client'

import { useState } from 'react'
import { useNavigationLogic } from '@/app/layout/shared/hooks/useNavigationLogic'
import { cn } from '@/lib/utils'
import { useGetClientLng } from '@/hooks/useSystem'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { cookieName } from '@/app/i18n/settings'
import { Globe, ChevronDown } from 'lucide-react'

interface MainContentProps {
  children: React.ReactNode
  banner?: React.ReactNode
}

export function MainContent({ children, banner }: MainContentProps) {
  const { isAuthPage, route } = useNavigationLogic()
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

  const isWelcomePage = route[0] === '(welcome)'

  return (
    <main
      className={cn(
        'flex-1 min-h-0 min-w-0 flex flex-col relative',
        // 非 auth 页面需要顶部间距给移动端导航栏留空间
        !isAuthPage && 'pt-14 md:pt-0',
      )}
    >
      {/* 桌面端右上角悬浮一键语言切换 - 排除已有头部导航的欢迎页 */}
      {!isWelcomePage && (
        <div className="hidden md:block absolute top-5 right-6 z-[45]">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5F7A61]/25 text-xs font-semibold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 bg-white/60 dark:bg-black/20 backdrop-blur-md transition-all duration-300 hover:border-[#5F7A61]/50 hover:bg-white dark:hover:bg-black cursor-pointer select-none shadow-sm active:scale-95 animate-in fade-in duration-300"
            >
              <Globe className="size-3.5 text-[#5F7A61]" />
              <span>{lng === 'zh-CN' ? '简体中文' : 'English'}</span>
              <ChevronDown className="size-3 text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50" />
            </button>

            {langDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-[#5F7A61]/10 bg-white dark:bg-[#18221B] p-1.5 shadow-[0_10px_25px_rgba(95,122,97,0.08)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      handleLanguageChange('zh-CN')
                      setLangDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all border-none bg-transparent cursor-pointer ${
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all mt-1 border-none bg-transparent cursor-pointer ${
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
        </div>
      )}

      {banner}
      <div
        id="main-content"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-cyber-fade-in pb-16 md:pb-0"
      >
        {children}
      </div>
    </main>
  )
}
