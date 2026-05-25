'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Terminal, ShieldAlert, Cpu, ArrowRight } from 'lucide-react'
import { navigateToLogin } from '@/utils/auth'

interface WelcomePageContentProps {
  lng: string
}

export default function WelcomePageContent({ lng }: WelcomePageContentProps) {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [glitchText, setGlitchText] = useState('AURASTRING')
  const [systemTime, setSystemTime] = useState('')

  useEffect(() => {
    // Dynamic glitch effect
    const interval = setInterval(() => {
      const chars = 'AURASTRING/#'
      let glitched = ''
      for (let i = 0; i < 'AURASTRING'.length; i++) {
        if (Math.random() < 0.1) {
          glitched += chars[Math.floor(Math.random() * chars.length)]
        } else {
          glitched += 'AURASTRING'[i]
        }
      }
      setGlitchText(glitched)
    }, 250)

    // System time updates
    const timeInterval = setInterval(() => {
      const now = new Date()
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToLogin()
  }

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-gray-100 antialiased overflow-hidden font-mono selection:bg-[#FF007F] selection:text-white">
      {/* CRT Scanline Filter Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      
      {/* Subtle CRT Flicker & Glow */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Cyber Grid Lines Background */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #39FF14 1px, transparent 1px),
            linear-gradient(to bottom, #39FF14 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Pulsing Neon Glow Spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#39FF14_0%,transparent_70%)] opacity-10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#FF007F_0%,transparent_70%)] opacity-10 blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-30 w-full border-b border-[#39FF14]/20 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex size-8 items-center justify-center rounded bg-black border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.3)]">
              <span className="text-[#39FF14] text-lg font-bold">A</span>
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#FF007F] animate-ping" />
            </div>
            <span className="text-xl font-black tracking-widest text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
              Aura<span className="text-[#FF007F] drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">String</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-[#39FF14]/60 tracking-wider">
              [ SYSTEM TIME: {systemTime || '2026-05-25 11:00:00'} ]
            </span>
            <button
              onClick={() => navigateToLogin()}
              className="relative px-5 py-1.5 overflow-hidden rounded border border-[#39FF14] text-xs font-semibold text-[#39FF14] bg-transparent transition-all duration-300 hover:bg-[#39FF14] hover:text-black hover:shadow-[0_0_15px_rgba(57,255,20,0.6)]"
            >
              启动终端
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-16 md:py-24 max-w-7xl mx-auto min-h-[calc(100vh-10rem)]">
        {/* Neon Badge */}
        <div className="mb-6 flex items-center gap-2 rounded border border-[#FF007F]/40 bg-black/50 px-4 py-1.5 shadow-[0_0_10px_rgba(255,0,127,0.2)]">
          <Sparkles className="size-4 text-[#FF007F] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#FF007F] font-semibold">
            AuraString 极简内容实验室
          </span>
        </div>

        {/* Glitch Main Title */}
        <h1 className="text-center text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
          <span className="text-[#39FF14]">{glitchText}</span>
        </h1>

        {/* Cyber Subtitle */}
        <p className="mt-6 max-w-2xl text-center text-sm sm:text-base text-gray-400 leading-relaxed">
          极简内容引擎 ✦ 赛博分发与智体交互终端。
          <br className="hidden sm:inline" />
          光流一键托管，国内及国际多轨自动分发，小红书专属签名底层协议护航。
        </p>

        {/* Interactive Terminal Command Box */}
        <form
          onSubmit={handleSubmit}
          className="relative mt-12 w-full max-w-xl p-[2px] rounded-lg bg-gradient-to-r from-[#39FF14] via-transparent to-[#FF007F] shadow-[0_0_20px_rgba(57,255,20,0.15)]"
        >
          <div className="flex w-full items-center gap-3 rounded-lg bg-black/90 p-3">
            <Terminal className="size-5 text-[#39FF14] shrink-0" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入光弦指令 (例如: /boot_lab)..."
              className="flex-1 bg-transparent text-sm border-0 text-white placeholder-gray-600 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#39FF14] text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-[#FF007F] hover:text-white hover:shadow-[0_0_15px_rgba(255,0,127,0.5)]"
            >
              <span>执行</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </form>

        {/* Three High-Tech Spec Blocks */}
        <div className="grid gap-6 mt-20 w-full sm:grid-cols-3 max-w-5xl">
          {/* Spec 1 */}
          <div className="p-6 rounded border border-[#39FF14]/20 bg-black/50 backdrop-blur-sm transition-all duration-300 hover:border-[#39FF14]/60 hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <div className="flex items-center gap-3 mb-3 text-[#39FF14]">
              <Cpu className="size-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">光流多轨分发 (Flow Hub)</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              一条内容，一键在国内外 14+ 社交网格（抖音、TikTok、YouTube等）进行全自动光弦分发。
            </p>
          </div>

          {/* Spec 2 */}
          <div className="p-6 rounded border border-[#FF007F]/20 bg-black/50 backdrop-blur-sm transition-all duration-300 hover:border-[#FF007F]/60 hover:shadow-[0_0_15px_rgba(255,0,127,0.1)]">
            <div className="flex items-center gap-3 mb-3 text-[#FF007F]">
              <Terminal className="size-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">智体社交托管 (Agent Grid)</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              基于大模型智体（AI Agent），全天候自动执行日常内容排程、发布与智能社交互动，释放双手。
            </p>
          </div>

          {/* Spec 3 */}
          <div className="p-6 rounded border border-[#39FF14]/20 bg-black/50 backdrop-blur-sm transition-all duration-300 hover:border-[#39FF14]/60 hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <div className="flex items-center gap-3 mb-3 text-[#39FF14]">
              <ShieldAlert className="size-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">小红书专属签名 (RedNote Key)</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              专为国内小红书平台集成了专有加密算法与底层防封签名服务，保障账户合规、高速、安全发送。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-30 w-full border-t border-[#39FF14]/10 bg-black/80 py-6">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl text-[10px] text-gray-600 gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-[#39FF14] animate-ping" />
            <span className="uppercase tracking-widest text-[#39FF14]/60">SYS STATUS: CONNECTED</span>
          </div>
          <p className="uppercase tracking-widest">© 2026 AuraString Laboratory. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
