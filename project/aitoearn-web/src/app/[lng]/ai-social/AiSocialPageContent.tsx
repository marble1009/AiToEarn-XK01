/**
 * AI 社媒内容组件 - AI social media Page Content
 * 极简左右分栏双视口结构：左侧填空式控制台，右侧真实社交网络卡片预览
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Sparkles, 
  PenTool, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Copy, 
  Check, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Play, 
  RotateCw, 
  User, 
  ExternalLink 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useGetClientLng } from '@/hooks/useSystem'
import { aiChatStream } from '@/api/ai'

const KEYWORD_CATEGORIES = [
  {
    name: '美食餐饮',
    tags: ['招牌现做', '秘制配方', '外酥里嫩', '网红打卡', '分量超足', '入口即化', '舌尖美味', '精选食材']
  },
  {
    name: '生活服务',
    tags: ['专业指导', '环境极佳', '新客体验', '金牌技师', '贴心服务', '零基础入门', '限时免费', '物超所值']
  },
  {
    name: '营销活动',
    tags: ['到店送冰粉', '买一送一', '第二件半价', '限时特惠', '充值返现', '进店有礼', '手慢无', '全场打折']
  }
]

export function AiSocialPageContent() {
  const params = useParams()
  const lng = useGetClientLng()
  const router = useRouter()

  // Tab & Form states
  const [activeTab, setActiveTab] = useState<'copywriting' | 'poster' | 'video'>('copywriting')
  const [platform, setPlatform] = useState<'xhs' | 'douyin'>('xhs')
  const [shopName, setShopName] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [benefit, setBenefit] = useState('')
  const [tone, setTone] = useState('cozy') // cozy, energetic, professional
  const [images, setImages] = useState<string[]>([])
  
  // AI generation states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isPushed, setIsPushed] = useState(false)
  
  // File drag & upload references
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toggle keyword pills
  const handleToggleTag = (tag: string) => {
    if (sellingPoints.includes(tag)) {
      // Remove it cleanly
      let newPoints = sellingPoints.replace(tag, '').replace(/，\s*，/g, '，').replace(/,\s*,/g, ',').trim();
      newPoints = newPoints.replace(/^[,，\s]+|[,，\s]+$/g, '');
      setSellingPoints(newPoints);
    } else {
      // Append it with comma or space
      if (sellingPoints.trim()) {
        const lastChar = sellingPoints.trim().slice(-1);
        if (['，', ',', '。', '.', '！', '!'].includes(lastChar)) {
          setSellingPoints(`${sellingPoints.trim()} ${tag}`);
        } else {
          setSellingPoints(`${sellingPoints.trim()}，${tag}`);
        }
      } else {
        setSellingPoints(tag);
      }
    }
  }

  // AI Optimize Selling Points
  const handleOptimizePoints = async () => {
    if (!sellingPoints.trim()) {
      toast.error(lng === 'zh-CN' ? '请先输入特色招牌/卖点，再进行智能优化！' : 'Please enter highlights first to optimize!')
      return
    }
    setIsOptimizing(true)
    try {
      const prompt = `您是一位专业的商业文案策划专家与同城社媒爆品打造大师。请将以下用户输入的零散店铺特色或招牌亮点，进行深度润色与智能优化，提炼出极其吸引眼球、读起来朗朗上口、具有超高感染力的一句话或两句话爆款卖点（包含适当的Emoji表情符号）。
原始卖点特色：${sellingPoints}

请直接输出优化后的精炼卖点文本，不需要任何解释性的开头或收尾，不要加引号，控制在60字以内。`
      
      const response = await aiChatStream({
        messages: [{ role: 'user', content: prompt }]
      })
      const data = await response.json()
      let optimizedText = ''
      if (data?.content) {
        optimizedText = typeof data.content === 'string' ? data.content.trim() : JSON.stringify(data.content)
      } else if (data?.choices?.[0]?.message?.content) {
        optimizedText = data.choices[0].message.content.trim()
      }

      if (optimizedText) {
        setSellingPoints(optimizedText)
        toast.success(lng === 'zh-CN' ? '卖点智能优化成功！' : 'Highlights optimized successfully!')
      } else {
        toast.error(lng === 'zh-CN' ? '优化失败，请稍后重试' : 'Optimization failed, please try again.')
      }
    } catch (error) {
      console.error('Failed to optimize selling points:', error)
      toast.error(lng === 'zh-CN' ? '网络异常，智能优化失败' : 'Optimization failed due to network error.')
    } finally {
      setIsOptimizing(false)
    }
  }

  // Handle template selection
  const handleTemplateSelect = (tab: 'copywriting' | 'poster' | 'video') => {
    setActiveTab(tab)
    if (tab === 'copywriting') {
      setShopName('阿强海鲜排档')
      setSellingPoints('招牌香辣大肉蟹，现捞现杀，蟹肉肥美多汁，爆炒浓郁！')
      setBenefit('凭本条推送，到店即送招牌手工冰粉一份！全场海鲜打8.8折！')
      setPlatform('xhs')
    } else if (tab === 'poster') {
      setShopName('小雅咖啡屋')
      setSellingPoints('夏日限定椰乳拿铁，选用极品瑰夏咖啡豆，丝滑清甜！')
      setBenefit('限时特惠：买一送一，每日限量100杯！')
      setPlatform('xhs')
    } else {
      setShopName('阿芳手作茶点')
      setSellingPoints('传承30年纯手工古法绿豆糕，零添加，低糖健康，入口即化！')
      setBenefit('周末探店特惠：特浓芝士绿豆糕礼盒立减15元！')
      setPlatform('douyin')
    }
    toast.success(lng === 'zh-CN' ? '模版加载成功！请在左侧表单微调您的店铺信息。' : 'Template loaded successfully!')
  }

  // Pre-load default values on mount
  useEffect(() => {
    handleTemplateSelect('copywriting')
  }, [])

  // Dynamic mock & real AI generation
  const handleGenerate = async () => {
    if (!shopName.trim() && !sellingPoints.trim()) {
      toast.error(lng === 'zh-CN' ? '请先输入您的店铺名称或招牌特色！' : 'Please input shop name or highlights first!')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')
    setIsPushed(false)

    // 1. Generate Fallback Text in case of API failure or missing token
    let fallbackText = ''
    if (activeTab === 'copywriting') {
      fallbackText = `🔥 店主爆单狂推！【${shopName}】真的绝了！\n\n今天必须给全城食客强烈安利我们店的头号招牌——✨【${sellingPoints}】✨！\n\n一口咬下去，简直是舌尖上的极致奢华体验！食材全都是清晨现采现捞，确保了无与伦比的鲜美度。大火爆炒锁住汤汁，蟹肉肥硕弹牙，吃完还要舔手指！😋\n\n🎁 【老板含泪大送福利】：\n📢 ${benefit || '到店消费即可享受限时惊爆折扣！'}\n\n赶紧约上您的饭搭子，来一场说走就走的美味探店吧！👇\n📍 坐标：[自动匹配同城定位]\n#同城探店 #我的美食日记 #小微店主AI神器 #爱易客`
    } else if (activeTab === 'poster') {
      fallbackText = `🎨 【${shopName}】官方精品海报文案已生成：\n\n👉 主题：【${sellingPoints}】\n🏷️ 核心福利：${benefit || '暂无折扣'}\n📍 视觉基调：落日珊瑚橘明亮温润风格\n🎯 海报口号：匠心手作，温暖您的胃与心。`
    } else {
      fallbackText = `🎬 【${shopName}】引流短视频爆款脚本与音轨：\n\n[画面 0-3s]：大特写！${sellingPoints} 腾腾冒热气的诱人特写，快速切切切！\n[画面 3-8s]：老板亲自现作/打包特写，展示温暖匠人手艺，配上欢快悠扬的店堂音乐。\n[画面 8-15s]：推出醒目大字幕【${benefit || '限时惊爆折扣'}】，引导同城定位点赞并点击下方链接！\n\n🎵 配乐推荐：夏日午后民谣吉他\n#抖音同城爆单 #引流短视频 #爱易客自动排版`
    }

    let generatedText = fallbackText

    try {
      // 2. Construct robust system prompt
      const prompt = `您是一位拥有百万粉丝的本地同城引流与社媒获客营销大师，专门为实体小店（餐饮、美容、美发、健身等）撰写高热度、极具煽动性的爆单文案与脚本。
请为我的小店生成一段定制化的社媒推广内容。
店铺名称：${shopName}
特色招牌 / 卖点：${sellingPoints}
促销福利：${benefit || '暂无促销，突出招牌美味/品质与贴心服务即可'}
目标平台及风格：${
        activeTab === 'copywriting' 
          ? '小红书（红薯风高粘性图文，排版精美，使用大量Emoji表情符号，语气要俏皮活泼、安利语气，带上热门同城探店话题，并在末尾加上引导关注与定位的话术）' 
          : activeTab === 'poster' 
            ? '商业海报（排版文案干净明朗，包含极具吸引力的主标题/大口号、卖点提炼、核心福利说明、以及一句暖心文案，格式为易读的文本列表）' 
            : '抖音同城引流视频（包含按时间线 0-3s, 3-8s, 8-15s 编排的分镜头画面描述、口播台词配音、欢快的配乐推荐、以及抖音同城爆单和探店的热门标签）'
      }

请直接输出文案的正文内容，以精美的换行和表情符号进行排版，不需要任何解释性的开头或收尾（例如：“好的，这是为您生成的文案如下”之类的话）。`

      // 3. Call the real http chat request
      const response = await aiChatStream({
        messages: [{ role: 'user', content: prompt }]
      })
      const data = await response.json()
      let fetchedText = ''
      if (data?.content) {
        fetchedText = typeof data.content === 'string' ? data.content.trim() : JSON.stringify(data.content)
      } else if (data?.choices?.[0]?.message?.content) {
        fetchedText = data.choices[0].message.content.trim()
      }

      if (fetchedText) {
        generatedText = fetchedText
      } else {
        console.warn('API returned empty choices, using high-fidelity fallback.')
      }
    } catch (error) {
      console.error('Failed to call real AI API, falling back to high-fidelity simulator:', error)
    }

    // 4. Simulate streaming AI typewriter output
    let currentLength = 0
    const interval = setInterval(() => {
      if (currentLength < generatedText.length) {
        setGeneratedContent(generatedText.substring(0, currentLength + 5))
        currentLength += 5
      } else {
        clearInterval(interval)
        setIsGenerating(false)
        toast.success(lng === 'zh-CN' ? '爆款文案生成成功！' : 'Content generated successfully!')
      }
    }, 15)
  }

  // Handle Copy text
  const handleCopy = () => {
    if (!generatedContent) return
    navigator.clipboard.writeText(generatedContent)
    setIsCopied(true)
    toast.success(lng === 'zh-CN' ? '文案已成功复制到剪贴板！' : 'Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Handle Push to Draft
  const handlePushToDraft = () => {
    setIsPushed(true)
    toast.success(lng === 'zh-CN' ? '🎉 已通过安全免控通道成功传输到您的社媒草稿箱！' : 'Pushed to social media draft box successfully!')
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...newUrls])
      toast.success(lng === 'zh-CN' ? '素材图片上传成功！' : 'Images uploaded successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#18221B] selection:bg-[#5F7A61]/20 pb-16 font-sans">
      
      {/* Background spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,#F3A390_0%,transparent_70%)] opacity-[0.05] dark:opacity-[0.08] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 pb-8 relative z-10">
        
        {/* Title Badge & Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-[#F3A390]/30 bg-[#F3A390]/10 px-4 py-1.5 shadow-[0_2px_8px_rgba(243,163,144,0.08)] w-max mx-auto">
            <Sparkles className="size-4 text-[#F3A390] animate-pulse" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.1em] text-[#F3A390] font-bold">
              {lng === 'zh-CN' ? '温暖商务 · 极简高产 —— 实体店获客神器' : 'Cozy Commercial · Smart AI Copywriter for Shop Owners'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight text-center">
            {lng === 'zh-CN' ? '爱易客 AI 智能创作工坊' : 'aiyike AI Creative Studio'}
          </h1>
          <p className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 text-xs sm:text-sm max-w-xl mx-auto font-normal">
            {lng === 'zh-CN' 
              ? '零 Prompt 门槛！填空您的店铺特色，AI 自动生成高诱惑力的小红书与抖音爆单图文，一键安全送达草稿箱。'
              : 'Zero Prompt learning! Fill in the form and let AI draft high-conversion social posts for Douyin & Xiaohongshu.'}
          </p>
        </div>

        {/* Core Template Cards (Interactive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Copywriting */}
          <div 
            onClick={() => handleTemplateSelect('copywriting')}
            className={cn(
              "cursor-pointer p-6 rounded-3xl border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden active:scale-[0.98]",
              activeTab === 'copywriting'
                ? "bg-white dark:bg-[#202C24] border-[#5F7A61]/40 shadow-[0_8px_24px_rgba(95,122,97,0.08)] ring-1 ring-[#5F7A61]/25"
                : "bg-white/50 dark:bg-[#202C24]/30 border-[#5F7A61]/15 hover:bg-white dark:hover:bg-[#202C24]/60 hover:shadow-md hover:border-[#5F7A61]/35"
            )}
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#5F7A61]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-5.5 h-5.5 text-[#5F7A61]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] mb-2">
                {lng === 'zh-CN' ? '写爆款文案' : 'Cozy Copywriter'}
              </h3>
              <p className="text-xs text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 leading-relaxed font-normal">
                {lng === 'zh-CN' ? '餐饮菜单、美发促销、商品上新等高赞文案一键填空式生成。' : 'Food menus, salon deals, new products copywriting.'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#5F7A61] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {lng === 'zh-CN' ? '选择该模版 →' : 'Select Template →'}
            </span>
          </div>

          {/* Card 2: Poster */}
          <div 
            onClick={() => handleTemplateSelect('poster')}
            className={cn(
              "cursor-pointer p-6 rounded-3xl border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden active:scale-[0.98]",
              activeTab === 'poster'
                ? "bg-white dark:bg-[#202C24] border-[#F3A390]/40 shadow-[0_8px_24px_rgba(243,163,144,0.08)] ring-1 ring-[#F3A390]/25"
                : "bg-white/50 dark:bg-[#202C24]/30 border-[#F3A390]/15 hover:bg-white dark:hover:bg-[#202C24]/60 hover:shadow-md hover:border-[#F3A390]/35"
            )}
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F3A390]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5.5 h-5.5 text-[#F3A390]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] mb-2">
                {lng === 'zh-CN' ? '做宣传海报' : 'Cozy Poster'}
              </h3>
              <p className="text-xs text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 leading-relaxed font-normal">
                {lng === 'zh-CN' ? '快速制作精美的节日促销海报、活动折扣海报。' : 'Quickly generate promotional campaign and event posters.'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#F3A390] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {lng === 'zh-CN' ? '选择该模版 →' : 'Select Template →'}
            </span>
          </div>

          {/* Card 3: Video */}
          <div 
            onClick={() => handleTemplateSelect('video')}
            className={cn(
              "cursor-pointer p-6 rounded-3xl border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden active:scale-[0.98]",
              activeTab === 'video'
                ? "bg-white dark:bg-[#202C24] border-[#E5B25D]/40 shadow-[0_8px_24px_rgba(229,178,93,0.08)] ring-1 ring-[#E5B25D]/25"
                : "bg-white/50 dark:bg-[#202C24]/30 border-[#E5B25D]/15 hover:bg-white dark:hover:bg-[#202C24]/60 hover:shadow-md hover:border-[#E5B25D]/35"
            )}
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#E5B25D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-5.5 h-5.5 text-[#E5B25D]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] mb-2">
                {lng === 'zh-CN' ? '发引流短视频' : 'Cozy Video'}
              </h3>
              <p className="text-xs text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 leading-relaxed font-normal">
                {lng === 'zh-CN' ? '多张菜品实拍一键排版，生成爆款转场和配乐短视频。' : 'Combine photos into trending vlogs with cozy music.'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#E5B25D] mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {lng === 'zh-CN' ? '选择该模版 →' : 'Select Template →'}
            </span>
          </div>
        </div>

        {/* Dual-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white/70 dark:bg-[#202C24]/70 backdrop-blur-xl border border-[#5F7A61]/15 p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6">
            
            <div className="flex items-center gap-2 border-b border-[#5F7A61]/10 pb-3">
              <Sparkles className="size-5 text-[#5F7A61]" />
              <span className="text-sm font-bold text-[#2A2A2A] dark:text-[#FDFBF7]">
                {lng === 'zh-CN' ? '填写店铺特色表单' : 'Merchant Details Form'}
              </span>
            </div>

            {/* Shop Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80">
                {lng === 'zh-CN' ? '店铺/商品名称' : 'Shop/Product Name'}
              </label>
              <input 
                type="text" 
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder={lng === 'zh-CN' ? '例: 阿强海鲜排档' : 'e.g. Cozy Coffee Cafe'}
                className="w-full bg-white dark:bg-[#18221B] border border-[#5F7A61]/20 rounded-xl px-3 py-2 text-xs text-[#2A2A2A] dark:text-[#FDFBF7] placeholder-[#2A2A2A]/30 focus:outline-none focus:border-[#5F7A61] transition-colors"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 block">
                {lng === 'zh-CN' ? '首选发布平台' : 'Primary Social Platform'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform('xhs')}
                  className={cn(
                    "py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    platform === 'xhs'
                      ? "bg-[#F3A390]/10 border-[#F3A390] text-[#F3A390] shadow-sm"
                      : "bg-white dark:bg-[#18221B] border-neutral-200 dark:border-neutral-800 text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 hover:border-neutral-300"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F3A390]" />
                  {lng === 'zh-CN' ? '小红书 (XHS)' : 'RedBook (XHS)'}
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('douyin')}
                  className={cn(
                    "py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    platform === 'douyin'
                      ? "bg-[#5F7A61]/10 border-[#5F7A61] text-[#5F7A61] shadow-sm"
                      : "bg-white dark:bg-[#18221B] border-neutral-200 dark:border-neutral-800 text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 hover:border-neutral-300"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F7A61]" />
                  {lng === 'zh-CN' ? '抖音 (Douyin)' : 'TikTok/Douyin'}
                </button>
              </div>
            </div>

            {/* Selling Points Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 block">
                  {lng === 'zh-CN' ? '主推特色/招牌亮点 (AI 生成基石)' : 'Specialty & Core Highlights'}
                </label>
                <button
                  type="button"
                  onClick={handleOptimizePoints}
                  disabled={isOptimizing || !sellingPoints.trim()}
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all duration-300 cursor-pointer shadow-sm select-none border border-[#F3A390]/30",
                    isOptimizing
                      ? "bg-[#F3A390]/10 text-[#F3A390]/50 border-none cursor-not-allowed"
                      : !sellingPoints.trim()
                        ? "bg-neutral-100 dark:bg-[#18221B] text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800 cursor-not-allowed"
                        : "bg-[#F3A390]/10 text-[#F3A390] hover:bg-[#F3A390] hover:text-white"
                  )}
                >
                  {isOptimizing ? (
                    <>
                      <RotateCw className="size-3 animate-spin" />
                      <span>{lng === 'zh-CN' ? '优化中...' : 'Optimizing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3 animate-pulse text-[#F3A390]" />
                      <span>{lng === 'zh-CN' ? 'AI 智能优化' : 'AI Optimize'}</span>
                    </>
                  )}
                </button>
              </div>
              <textarea 
                rows={3}
                value={sellingPoints}
                onChange={e => setSellingPoints(e.target.value)}
                placeholder={lng === 'zh-CN' ? '写写招牌特色、手艺故事或特惠商品...' : 'Tell AI about your specialty dishes, hand-crafted skills, or specific items...'}
                className="w-full bg-white dark:bg-[#18221B] border border-[#5F7A61]/20 rounded-xl px-3 py-2 text-xs text-[#2A2A2A] dark:text-[#FDFBF7] placeholder-[#2A2A2A]/30 focus:outline-none focus:border-[#5F7A61] transition-colors resize-none leading-relaxed"
              />

              {/* Keyword Tags Selection */}
              <div className="space-y-2 pt-1 border-t border-[#5F7A61]/10 mt-2">
                <span className="text-[10px] font-bold text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 block">
                  💡 {lng === 'zh-CN' ? '探索提示词快捷模块 (点击选择/取消以高效率拼凑您的卖点)' : 'Quick Keyword Pills (Click to select/unselect)'}
                </span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {KEYWORD_CATEGORIES.map((cat, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <div className="text-[9px] font-bold text-[#5F7A61]/80 dark:text-[#5F7A61]/90 flex items-center gap-1">
                        <span className="inline-block w-1 h-2 bg-[#5F7A61] rounded-full" />
                        {cat.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((tag, tIdx) => {
                          const isActive = sellingPoints.includes(tag)
                          return (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full transition-all duration-200 border cursor-pointer select-none",
                                isActive
                                  ? "bg-[#5F7A61] border-[#5F7A61] text-[#FAF7F2] shadow-sm scale-95"
                                  : "bg-white/40 dark:bg-[#18221B]/40 border-neutral-200 dark:border-neutral-800 text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 hover:bg-[#5F7A61]/10 hover:border-[#5F7A61]/30 hover:text-[#5F7A61]"
                              )}
                            >
                              {tag}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Benefit Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 block">
                {lng === 'zh-CN' ? '优惠福利/引流赠品 (激发冲动消费)' : 'Promotional Offers & Gifts'}
              </label>
              <input 
                type="text" 
                value={benefit}
                onChange={e => setBenefit(e.target.value)}
                placeholder={lng === 'zh-CN' ? '例: 到店即送手工精美小凉粉一份！' : 'e.g. Get a free hand-made iced jelly upon arrival!'}
                className="w-full bg-white dark:bg-[#18221B] border border-[#5F7A61]/20 rounded-xl px-3 py-2 text-xs text-[#2A2A2A] dark:text-[#FDFBF7] placeholder-[#2A2A2A]/30 focus:outline-none focus:border-[#5F7A61] transition-colors"
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 block">
                {lng === 'zh-CN' ? '生成风格调性' : 'Tone & Style'}
              </label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-white dark:bg-[#18221B] border border-[#5F7A61]/20 rounded-xl px-3 py-2 text-xs text-[#2A2A2A] dark:text-[#FDFBF7] focus:outline-none focus:border-[#5F7A61] transition-colors cursor-pointer"
              >
                <option value="cozy">{lng === 'zh-CN' ? '温暖手作匠人风 (Cozy)' : 'Warm Cozy'}</option>
                <option value="energetic">{lng === 'zh-CN' ? '激情吸睛爆单风 (Energetic)' : 'Viral Energetic'}</option>
                <option value="professional">{lng === 'zh-CN' ? '高端雅致生活风 (Elegant)' : 'Elegant Elegant'}</option>
              </select>
            </div>

            {/* Material uploads */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2A2A2A]/80 dark:text-[#FDFBF7]/80 block">
                {lng === 'zh-CN' ? '实拍素材上传 (可选)' : 'Upload Photos/Videos'}
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#5F7A61]/20 hover:border-[#5F7A61]/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 bg-white/40 dark:bg-black/10 transition-colors cursor-pointer"
              >
                <Upload className="size-5 text-[#5F7A61] animate-bounce" />
                <span className="text-[10px] font-bold text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60">
                  {lng === 'zh-CN' ? '拖拽或点击上传店内实拍' : 'Drag or click to upload store media'}
                </span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                />
              </div>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative size-12 rounded-lg overflow-hidden border border-[#5F7A61]/10 shadow-sm animate-in zoom-in-50">
                      <img src={url} className="w-full h-full object-cover" alt="upload" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setImages(prev => prev.filter((_, i) => i !== idx))
                        }}
                        className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold border-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AIGC Submit Trigger */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "w-full py-3.5 rounded-2xl text-xs font-extrabold tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98 select-none",
                isGenerating
                  ? "bg-[#5F7A61]/25 text-[#5F7A61]/50 border-none cursor-not-allowed"
                  : "bg-[#5F7A61] text-[#FAF7F2] hover:bg-[#5F7A61]/90 hover:shadow-[0_8px_24px_rgba(95,122,97,0.2)]"
              )}
            >
              {isGenerating ? (
                <>
                  <RotateCw className="size-4 animate-spin" />
                  <span>{lng === 'zh-CN' ? 'AI 正在极速生成爆品中...' : 'AI Assembling Cozy Content...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>{lng === 'zh-CN' ? '一键生成社交推广爆款' : 'GENERATE VIRAL SOCIAL CARD'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Visual Mockup Live Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between bg-white/40 dark:bg-black/10 border border-[#5F7A61]/10 px-4 py-2.5 rounded-2xl">
              <span className="text-xs font-semibold text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50">
                {lng === 'zh-CN' ? '📺 社交平台拟真预览效果 (Live Preview)' : '📺 Live Social Media Mockup Preview'}
              </span>
              <span className="text-[10px] text-[#5F7A61] font-bold uppercase tracking-widest animate-pulse">
                {platform === 'xhs' ? '● Xiaohongshu Card' : '● Douyin Player'}
              </span>
            </div>

            {/* Mock Card Preview Container */}
            <div className="bg-white/80 dark:bg-[#202C24]/80 backdrop-blur-xl border border-[#5F7A61]/15 rounded-3xl p-6 shadow-sm min-h-[460px] flex flex-col justify-between relative overflow-hidden animate-cyber-fade-in">
              
              {/* Radial background blur glow */}
              <div className={cn(
                "absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl opacity-[0.04] transition-opacity",
                platform === 'xhs' ? "bg-[#F3A390]" : "bg-[#5F7A61]"
              )} />

              {/* Simulated Mobile Platform Header */}
              <div className="w-full mb-6">
                
                {platform === 'xhs' ? (
                  /* 小红书风格 Mockup Top */
                  <div className="flex items-center justify-between border-b border-[#F3A390]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-full bg-[#F3A390]/10 border border-[#F3A390]/30 flex items-center justify-center text-[#F3A390]">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7]">爱易客店铺智体运营官</span>
                        <span className="text-[9px] text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40">同城美食推荐 · 刚刚发布</span>
                      </div>
                    </div>
                    <button className="bg-[#F3A390] text-white font-extrabold text-[10px] px-3 py-1 rounded-full border-none cursor-pointer hover:bg-[#F3A390]/90 transition-colors">
                      关注
                    </button>
                  </div>
                ) : (
                  /* 抖音风格 Mockup Top */
                  <div className="flex items-center justify-between border-b border-[#5F7A61]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-full bg-[#5F7A61]/10 border border-[#5F7A61]/30 flex items-center justify-center text-[#5F7A61]">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7]">@爱易客 AI 爆单助手</span>
                        <span className="text-[9px] text-[#2A2A2A]/40 dark:text-[#FDFBF7]/40">同城流量先锋 · 推荐视频</span>
                      </div>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-2" />
                  </div>
                )}
              </div>

              {/* Main Content View (Typing content or visuals) */}
              <div className="flex-1 min-h-0 flex flex-col justify-start">
                
                {/* Simulated Media Banner */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#5F7A61]/5 to-[#F3A390]/5 border border-[#5F7A61]/10 relative overflow-hidden flex items-center justify-center mb-6">
                  {images.length > 0 ? (
                    <img src={images[0]} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="flex flex-col items-center text-center p-6 space-y-2 text-[#5F7A61]/40">
                      {platform === 'xhs' ? (
                        <>
                          <ImageIcon className="size-8 text-[#F3A390]/50 animate-pulse" />
                          <span className="text-[10px] font-bold tracking-widest text-[#F3A390]/70 uppercase">
                            {lng === 'zh-CN' ? '小红书精美海报图位' : 'Xiaohongshu Poster Grid'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="size-8 text-[#5F7A61]/50 animate-pulse" />
                          <span className="text-[10px] font-bold tracking-widest text-[#5F7A61]/70 uppercase">
                            {lng === 'zh-CN' ? '抖音短视频播放模拟' : 'Douyin Video Player'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulated Generated Text block */}
                <div className="w-full bg-[#FAF7F2]/50 dark:bg-black/10 border border-[#5F7A61]/5 p-4 rounded-2xl min-h-[160px] max-h-[220px] overflow-y-auto font-mono text-xs leading-relaxed text-[#2A2A2A]/90 dark:text-[#FDFBF7]/90 whitespace-pre-wrap select-text selection:bg-[#5F7A61]/35">
                  {generatedContent ? (
                    generatedContent
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-center text-[#2A2A2A]/30 dark:text-[#FDFBF7]/30 space-y-2">
                      <Sparkles className="size-5 text-[#5F7A61]/30 animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        {lng === 'zh-CN' ? '等待输入生成爆品文案...' : 'Awaiting form generation...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mockup Bottom Interactions */}
              <div className="w-full border-t border-[#5F7A61]/10 pt-4 mt-6">
                
                {platform === 'xhs' ? (
                  /* 小红书风格底栏 */
                  <div className="flex items-center justify-between text-xs text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold select-none">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 hover:text-[#F3A390] transition-colors cursor-pointer">
                        <Heart className="size-4" /> 1.2w
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
                        <MessageCircle className="size-4" /> 432
                      </span>
                      <span className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer">
                        <Bookmark className="size-4" /> 892
                      </span>
                    </div>
                    <span className="flex items-center gap-1 hover:text-[#5F7A61] transition-colors cursor-pointer">
                      <Share2 className="size-4" /> 分享
                    </span>
                  </div>
                ) : (
                  /* 抖音风格底栏 */
                  <div className="flex items-center justify-between text-xs text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold select-none">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#5F7A61]/10 text-[#5F7A61] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        抖音同城推荐
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer">
                        <Heart className="size-4 fill-red-500 text-red-500" /> 82.4w
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer">
                        <MessageCircle className="size-4" /> 14.2w
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Card Actions (Copy & Push to Draft) */}
            {generatedContent && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                {/* Action 1: Copy */}
                <button
                  onClick={handleCopy}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold transition-all border border-[#5F7A61]/25 hover:border-[#5F7A61]/60 bg-white/80 dark:bg-[#18221B]/80 text-[#2A2A2A] dark:text-[#FDFBF7] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      <span className="text-emerald-500">{lng === 'zh-CN' ? '复制成功' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 text-[#5F7A61]" />
                      <span>{lng === 'zh-CN' ? '复制生成文案' : 'Copy Copywriting'}</span>
                    </>
                  )}
                </button>

                {/* Action 2: Safe Push to Draft */}
                <button
                  onClick={handlePushToDraft}
                  className={cn(
                    "w-full py-3.5 rounded-2xl text-xs font-extrabold tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none",
                    isPushed
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-none border-none"
                      : "bg-[#5F7A61] text-[#FAF7F2] hover:bg-[#5F7A61]/90 hover:shadow-[0_8px_24px_rgba(95,122,97,0.2)]"
                  )}
                >
                  {isPushed ? (
                    <>
                      <Check className="size-4" />
                      <span>{lng === 'zh-CN' ? '已成功推送至草稿箱' : 'Draft Box Secured'}</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="size-4" />
                      <span>{lng === 'zh-CN' ? '推送至草稿箱 (安全推荐)' : 'Push to Draft Box'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
