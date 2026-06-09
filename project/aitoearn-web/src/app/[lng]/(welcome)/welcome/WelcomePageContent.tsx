'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, PenTool, Video, Layers, ShieldCheck, ArrowRight, Globe, ChevronDown } from 'lucide-react'
import { navigateToLogin } from '@/utils/auth'
import { setCookie } from 'cookies-next'
import { cookieName } from '@/app/i18n/settings'

interface WelcomePageContentProps {
  lng: string
}

export default function WelcomePageContent({ lng }: WelcomePageContentProps) {
  const router = useRouter()
  const [systemTime, setSystemTime] = useState('')
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

  useEffect(() => {
    // System time updates in cozy standard
    const timeInterval = setInterval(() => {
      const now = new Date()
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19))
    }, 1000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  const handleStart = () => {
    navigateToLogin()
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] text-[#2A2A2A] antialiased overflow-hidden font-sans selection:bg-[#5F7A61]/20 selection:text-[#5F7A61]">
      
      {/* Premium Warm Soft Spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.07] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#F3A390_0%,transparent_70%)] opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-30 w-full border-b border-[#5F7A61]/10 bg-[#FAF7F2]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-[#5F7A61] text-[#FAF7F2] shadow-[0_4px_12px_rgba(95,122,97,0.2)]">
              <span className="text-lg font-bold select-none">{lng === 'zh-CN' ? '客' : 'a'}</span>
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#F3A390]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2A2A2A]">
              {lng === 'zh-CN' ? '爱易客' : 'aiautoedit'}{' '}
              <span className="text-xs font-normal text-[#5F7A61] bg-[#5F7A61]/10 px-2 py-0.5 rounded-full ml-1.5">
                {lng === 'zh-CN' ? '体验版' : 'Beta'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden md:inline text-xs text-[#2A2A2A]/50 font-mono">
              [ {lng === 'zh-CN' ? '营业时间' : 'Hours'}: {systemTime || '2026-05-30 11:00:00'} ]
            </span>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#5F7A61]/25 text-xs font-semibold text-[#2A2A2A]/80 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:border-[#5F7A61]/50 hover:bg-white cursor-pointer select-none"
              >
                <Globe className="size-3.5 text-[#5F7A61]" />
                <span className="hidden sm:inline">{lng === 'zh-CN' ? '简体中文' : 'English'}</span>
                <span className="inline sm:hidden">{lng === 'zh-CN' ? '中' : 'EN'}</span>
                <ChevronDown className="size-3 text-[#2A2A2A]/50" />
              </button>

              {langDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 rounded-xl border border-[#5F7A61]/10 bg-white p-1.5 shadow-[0_10px_25px_rgba(95,122,97,0.08)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        handleLanguageChange('zh-CN')
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        lng === 'zh-CN' 
                          ? 'bg-[#5F7A61]/10 text-[#5F7A61]' 
                          : 'text-[#2A2A2A]/70 hover:bg-[#5F7A61]/5 hover:text-[#5F7A61]'
                      }`}
                    >
                      简体中文
                    </button>
                    <button
                      onClick={() => {
                        handleLanguageChange('en')
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all mt-1 ${
                        lng === 'en' 
                          ? 'bg-[#5F7A61]/10 text-[#5F7A61]' 
                          : 'text-[#2A2A2A]/70 hover:bg-[#5F7A61]/5 hover:text-[#5F7A61]'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleStart}
              className="relative px-4 sm:px-5 py-2 overflow-hidden rounded-xl border border-[#5F7A61] text-xs font-semibold text-[#5F7A61] bg-transparent transition-all duration-300 hover:bg-[#5F7A61] hover:text-[#FAF7F2] hover:shadow-[0_4px_14px_rgba(95,122,97,0.15)] cursor-pointer"
            >
              {lng === 'zh-CN' ? '开启工作台' : 'Launch App'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-16 md:py-24 max-w-7xl mx-auto min-h-[calc(100vh-10rem)]">
        
        {/* Cozy Craft Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-[#F3A390]/30 bg-[#F3A390]/10 px-4 py-1.5 shadow-[0_2px_8px_rgba(243,163,144,0.08)]">
          <Sparkles className="size-4 text-[#F3A390] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.1em] text-[#F3A390] font-semibold">
            为实体小商贩与店老板量身打造的内容推广神器
          </span>
        </div>

        {/* Dynamic Typography Main Title */}
        <h1 className="text-center text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#2A2A2A] leading-tight">
          让您的好生意 <br className="sm:hidden" />
          <span className="text-[#5F7A61] relative">
            爆单出圈
            <span className="absolute bottom-1 left-0 w-full h-2 bg-[#F3A390]/30 -z-10 rounded-full" />
          </span>
        </h1>

        {/* Elegant Subtitle */}
        <p className="mt-8 max-w-2xl text-center text-sm sm:text-base text-[#2A2A2A]/70 leading-relaxed font-normal">
          实体店主的一站式 AI 获客推广终端。
          <br className="hidden sm:inline" />
          智能生成爆款图文、宣传海报与引流短视频，极速安全推送至社交平台草稿箱，无风控，轻松获客！
        </p>

        {/* Cozy Call-To-Action Button */}
        <div className="mt-12 w-full max-w-md flex justify-center">
          <button
            onClick={handleStart}
            className="group flex w-full sm:w-auto items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#5F7A61] text-[#FAF7F2] font-bold text-sm tracking-wide transition-all duration-300 hover:bg-[#5F7A61]/90 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(95,122,97,0.2)] cursor-pointer"
          >
            <span>一键进入 AI 创意工坊</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Three High-Tech Spec Blocks */}
        <div className="grid gap-6 mt-20 w-full sm:grid-cols-3 max-w-5xl">
          {/* Spec 1 */}
          <div className="p-6 rounded-2xl border border-[#5F7A61]/15 bg-white/60 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#5F7A61]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(95,122,97,0.05)]">
            <div className="flex items-center gap-3 mb-3 text-[#5F7A61]">
              <PenTool className="size-5" />
              <h3 className="font-bold text-sm tracking-wide text-[#2A2A2A]">写爆款文案 (AI Copywriter)</h3>
            </div>
            <p className="text-xs text-[#2A2A2A]/60 leading-relaxed font-sans">
              告别繁琐提问。输入招牌特色（如“黄金脆皮烤鸭”），一键自动产出符合抖音、小红书调性的高诱惑力爆单文案。
            </p>
          </div>

          {/* Spec 2 */}
          <div className="p-6 rounded-2xl border border-[#F3A390]/15 bg-white/60 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#F3A390]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(243,163,144,0.05)]">
            <div className="flex items-center gap-3 mb-3 text-[#F3A390]">
              <Video className="size-5" />
              <h3 className="font-bold text-sm tracking-wide text-[#2A2A2A]">发宣传物料 (Video & Poster)</h3>
            </div>
            <p className="text-xs text-[#2A2A2A]/60 leading-relaxed font-sans">
              直接上传店内或菜品实拍，由 AI 自动排版生成精美活动促销海报，或智能拼贴为带爆款转场和配乐的引流短视频。
            </p>
          </div>

          {/* Spec 3 */}
          <div className="p-6 rounded-2xl border border-[#E5B25D]/15 bg-white/60 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#E5B25D]/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(229,178,93,0.05)]">
            <div className="flex items-center gap-3 mb-3 text-[#E5B25D]">
              <ShieldCheck className="size-5" />
              <h3 className="font-bold text-sm tracking-wide text-[#2A2A2A]">安全草稿箱 (Secure Push)</h3>
            </div>
            <p className="text-xs text-[#2A2A2A]/60 leading-relaxed font-sans">
              针对国内抖音、快手、小红书等平台，全面采用官方合规的『静默推送至草稿箱』模式，100%安全免风控，保住账号自然流量！
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-30 w-full border-t border-[#5F7A61]/10 bg-[#FAF7F2] py-6">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl text-[10px] text-[#2A2A2A]/50 gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-[#5F7A61] animate-ping" />
            <span className="uppercase tracking-widest text-[#5F7A61]">
              {lng === 'zh-CN' ? '系统连接状态: 正常' : 'Connection: Online'}
            </span>
          </div>
          <p className="uppercase tracking-widest">© 2026 {lng === 'zh-CN' ? '爱易客' : 'aiautoedit'} Laboratory. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
