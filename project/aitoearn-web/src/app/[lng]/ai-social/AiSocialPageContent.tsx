/**
 * AI 社媒内容组件 - AI social media Page Content
 * 客户端组件，包含所有交互逻辑
 */
'use client'

import type { IHomeChatRef } from './components/HomeChat'
import { ArrowUp, Upload, Sparkles, Image as ImageIcon, Video, BookOpen, PenTool } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useAgentStore } from '@/store/agent'
import { useTransClient } from '../../i18n/client'
import AgentFeatures from './components/AgentFeatures'
import EcosystemDiagram from './components/EcosystemDiagram'
import { HomeChat } from './components/HomeChat'
import PromptGallery from './components/PromptGallery'
import TaskPreview from './components/TaskPreview'

export function AiSocialPageContent() {
  const { t } = useTransClient('home')

  // Store 方法
  const { setDebugFiles } = useAgentStore()

  // 拖拽上传状态
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)
  const homeChatRef = useRef<IHomeChatRef>(null)

  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    const files = e.dataTransfer.files
    if (files.length > 0) {
      homeChatRef.current?.handleFileDrop(files)
    }
  }, [])

  /**
   * 回到顶部按钮组件
   * @param position 按钮位置，'left' 或 'right'
   */
  function BackToTop({ position = 'left' }: { position?: 'left' | 'right' }) {
    const [isVisible, setIsVisible] = useState(false)

    // 监听滚动显示/隐藏按钮
    useEffect(() => {
      const handleScroll = () => {
        // 滚动超过 400px 显示按钮
        setIsVisible(window.scrollY > 400)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // 点击回到顶部
    const scrollToTop = useCallback(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
      <Button
        size="icon"
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-8 z-50 w-12 h-12 rounded-full',
          'shadow-lg transition-all duration-300 transform',
          position === 'left' ? 'left-8' : 'right-8',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    )
  }

  const [appliedPrompt, setAppliedPrompt] = useState<string>('')
  const [appliedMaterials, setAppliedMaterials] = useState<string[]>([])

  // 处理提示词应用
  const handleApplyPrompt = useCallback(
    (data: { prompt: string, materials?: string[], mode: 'edit' | 'generate' }) => {
      setAppliedPrompt(data.prompt)
      setAppliedMaterials(data.materials || [])
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success('Prompt applied!')
    },
    [],
  )

  // 从 URL query 读取 agentExternalPrompt 和 agentTaskId（由任务页通过 query 传参）
  const searchParams = useSearchParams()
  const router = useRouter()
  const [agentTaskId, setAgentTaskId] = useState<string>('')
  const params = useParams()

  // 解析 debug URL 参数，设置 debug 模式
  useEffect(() => {
    try {
      const debugParam = searchParams.get('debug')
      if (debugParam) {
        // 解析 debug=[file1.txt,file2.txt] 或 debug=file1.txt,file2.txt 格式
        const cleanedParam = debugParam.replace(/^\[|\]$/g, '')
        const files = cleanedParam
          .split(',')
          .map(f => f.trim())
          .filter(Boolean)

        if (files.length > 0) {
          setDebugFiles(files)

          // 清理 URL 上的 debug 参数
          const url = new URL(window.location.href)
          url.searchParams.delete('debug')
          router.replace(url.pathname + url.search)
        }
      }
    }
    catch (e) {
      console.warn('[AiSocialPageContent] Failed to parse debug param:', e)
    }
  }, [searchParams, router, setDebugFiles])

  useEffect(() => {
    try {
      const prompt = searchParams.get('agentExternalPrompt')
      const id = searchParams.get('agentTaskId')
      if (prompt) {
        setAppliedPrompt(prompt)
      }
      if (id) {
        setAgentTaskId(id)
      }
      // 清理 URL 上的 query，避免重复
      if (prompt || id) {
        router.replace(`/${params.lng}/ai-social`)
      }
    }
    catch (e) {
      // ignore
    }
  }, [searchParams, router, params.lng])

  // 清除外部提示词
  const handleClearExternalPrompt = useCallback(() => {
    setAppliedPrompt('')
    setAppliedMaterials([])
  }, [])

  return (
    <div
      className="bg-background min-h-screen pb-16"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 拖拽遮罩层 */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-primary bg-card">
            <Upload className="w-12 h-12 text-primary" />
            <p className="text-lg font-medium text-foreground">{t('dropToUpload')}</p>
          </div>
        </div>
      )}

      {/* 首屏营销引流工作台 */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
        {/* 小店引流工作台标题 */}
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-full inline-block mb-3 animate-pulse">
            ✨ AI 智能助推，一键获客引流
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            小店获客推广工作台
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm max-w-lg mx-auto">
            输入您的商铺特色，让 AI 帮您快速生成爆款文案和引流短视频，一键推送到各个平台草稿箱！
          </p>
        </div>

        {/* 快速生成三大模板卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* 卡片一：写爆款文案 */}
          <div 
            onClick={() => {
              setAppliedPrompt("我经营着一家实体店铺，主推特色是：[在此输入您的商品或服务，例如：招牌黄金脆皮烤鸭]，请帮我写一篇非常懂顾客心理、在社交平台（小红书/抖音）爆火的获客引流文案！带上丰富可爱的表情符号，字数约200字。")
              window.scrollTo({ top: 380, behavior: 'smooth' })
              toast.success("文案模版已加载，请在下方修改您的店铺特色！")
            }}
            className="cursor-pointer p-6 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">写爆款文案</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                餐饮菜单、美发促销、商品上新等文案一键填空式生成。
              </p>
            </div>
            <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              选择该模版 →
            </span>
          </div>

          {/* 卡片二：做宣传海报 */}
          <div 
            onClick={() => {
              setAppliedPrompt("请为我的店铺设计一张精美宣传海报。设计主题是：[在此输入海报主题，例如：开业大酬宾，全场8.8折/新品上市/节日限定活动]，版面要高端、大气，色彩搭配温暖喜庆，吸引人点击！")
              window.scrollTo({ top: 380, behavior: 'smooth' })
              toast.success("海报设计模版已加载，请在下方修改海报主题！")
            }}
            className="cursor-pointer p-6 rounded-2xl border border-border bg-card hover:border-secondary hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">做宣传海报</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                快速制作门店活动促销海报、新品发布海报。
              </p>
            </div>
            <span className="text-xs font-semibold text-secondary mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              选择该模版 →
            </span>
          </div>

          {/* 卡片三：发引流短视频 */}
          <div 
            onClick={() => {
              setAppliedPrompt("请帮我把上传的店内照片或商品实拍图合成为一条带爆款背景音乐与炫酷转场效果的抖音/视频号引流短视频！视频主题是：[在此输入视频卖点，例如：周末探店阿强海鲜排档/老字号纯手工糕点制作流程]")
              window.scrollTo({ top: 380, behavior: 'smooth' })
              toast.success("短视频合成模版已加载，请在下方上传照片并描述视频卖点！")
            }}
            className="cursor-pointer p-6 rounded-2xl border border-border bg-card hover:border-amber-500 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 transition-colors">发引流短视频</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                上传菜品或店内照片，自动合成爆款配乐及转场视频。
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              选择该模版 →
            </span>
          </div>
        </div>

        {/* AI 内容生成控制台 */}
        <div id="ai-generator-panel" className="border border-border rounded-3xl p-6 bg-card shadow-sm relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold text-foreground">AI 内容生成器</span>
          </div>
          <HomeChat
            ref={homeChatRef}
            externalPrompt={appliedPrompt}
            externalMaterials={appliedMaterials}
            onClearExternalPrompt={handleClearExternalPrompt}
            agentTaskId={agentTaskId}
          />
        </div>
      </section>

      {/* 任务预览区域 - 无数据时自动隐藏 */}
      <TaskPreview limit={4} className="px-4 py-8" />

      {/* 提示词画廊区域 */}
      <PromptGallery onApplyPrompt={handleApplyPrompt} />

      {/* AI Agent 功能亮点 */}
      <AgentFeatures />

      {/* 隐藏生态图以符合小店主极简路线 */}
      {/* <EcosystemDiagram /> */}

      {/* 回到顶部按钮 - 右侧 */}
      <BackToTop position="right" />
    </div>
  )
}
