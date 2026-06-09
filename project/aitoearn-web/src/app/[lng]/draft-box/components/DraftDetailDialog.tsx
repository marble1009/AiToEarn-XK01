/**
 * 草稿详情弹框组件
 * 展示草稿的完整信息，支持编辑和删除操作
 * PC端左右布局：左侧媒体资源，右侧信息
 */

'use client'

import type { PromotionMaterial } from '@/app/[lng]/brand-promotion/brandPromotionStore/types'
import type { PlatType } from '@/app/config/platConfig'
import { Calendar, Edit, Image as ImageIcon, Loader2, Send, Sparkles, Trash2, Video } from 'lucide-react'
import NextImage from 'next/image'
import { memo, useCallback, useState, useEffect } from 'react'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useShallow } from 'zustand/react/shallow'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'

import { AccountPlatInfoMap } from '@/app/config/platConfig'
import { useTransClient } from '@/app/i18n/client'
import { getOssUrl } from '@/utils/oss'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/format'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { aiChatStream } from '@/api/ai'
import styles from './DraftDetailDialog.module.scss'
import { LazyImage } from './LazyImage'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 带 loading 状态的图片组件
function MediaImage({ src, alt }: { src: string, alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Loading 骨架 - 增强效果 */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
        </div>
      )}
      <NextImage
        src={src}
        alt={alt}
        width={800}
        height={600}
        className={cn(
          'max-w-full max-h-full object-contain transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        onLoad={() => setLoaded(true)}
        unoptimized
      />
    </div>
  )
}

// 媒体预览组件 - 使用 Swiper 轮播
const MediaPreview = memo(({ material }: { material: PromotionMaterial }) => {
  const mediaList = material.mediaList || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // 检查是否全是图片（非视频）
  const isAllImages = mediaList.length > 0 && !mediaList.some(m => m.type === 'video')

  // 无媒体但有封面
  if (mediaList.length === 0 && material.coverUrl) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
        <LazyImage
          src={getOssUrl(material.coverUrl)}
          alt={material.title || '草稿封面'}
          fill
          className="object-cover"
          skeletonClassName="rounded-lg"
        />
      </div>
    )
  }

  // 无媒体无封面
  if (mediaList.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-lg bg-muted">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  // 有媒体 - 使用 Swiper
  return (
    <div
      className={cn(
        'w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-muted relative',
        styles.draftMediaSwiper,
        isHovered ? styles.swiperVisible : styles.swiperHidden,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Swiper
        data-testid="draftbox-detail-swiper"
        modules={[Navigation, Pagination]}
        navigation={mediaList.length > 1}
        pagination={{ clickable: true }}
        loop={mediaList.length > 1}
        observer={true}
        observeParents={true}
        onSlideChange={swiper => setCurrentIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {mediaList.map((media, index) => (
          <SwiperSlide key={index} className="!flex items-center justify-center">
            {media.type === 'video'
              ? (
                  <video
                    src={getOssUrl(media.url)}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain bg-white"
                    poster={getOssUrl(material.coverUrl)}
                  />
                )
              : (
                  <MediaImage
                    src={getOssUrl(media.url)}
                    alt={material.title || `媒体 ${index + 1}`}
                  />
                )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 右上角页码指示器 - 仅图片且多于1张时显示 */}
      {isAllImages && mediaList.length > 1 && (
        <div className={cn(
          'absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-black/50 text-white backdrop-blur-sm',
          'transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0',
        )}
        >
          {currentIndex + 1}
          {' '}
          /
          {mediaList.length}
        </div>
      )}
    </div>
  )
})

MediaPreview.displayName = 'MediaPreview'

// 详情弹框内容组件
const DraftDetailContent = memo(({ onClose }: { onClose: () => void }) => {
  const { t } = useTransClient('brandPromotion')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    const { selectedDraft, isSubmitting, generateVideoForDraft } = usePlanDetailStore(
      useShallow(state => ({
        selectedDraft: state.selectedDraft,
        isSubmitting: state.isSubmitting,
        generateVideoForDraft: state.generateVideoForDraft,
      })),
    )

  const {
    openEditMaterialModal,
    closeDraftDetailDialog,
    deleteMaterial,
    openPublishDialog,
  } = usePlanDetailStore(
    useShallow(state => ({
      openEditMaterialModal: state.openEditMaterialModal,
      closeDraftDetailDialog: state.closeDraftDetailDialog,
      deleteMaterial: state.deleteMaterial,
      openPublishDialog: state.openPublishDialog,
    })),
  )

  // 处理编辑
  const handleEdit = useCallback(() => {
    if (selectedDraft) {
      closeDraftDetailDialog()
      openEditMaterialModal(selectedDraft)
    }
  }, [selectedDraft, closeDraftDetailDialog, openEditMaterialModal])

  // 处理发布
  const handlePublish = useCallback(() => {
    if (selectedDraft) {
      closeDraftDetailDialog()
      openPublishDialog(selectedDraft)
    }
  }, [selectedDraft, closeDraftDetailDialog, openPublishDialog])

  // 处理删除
  const handleDelete = useCallback(async () => {
    if (!selectedDraft)
      return

    const success = await deleteMaterial(selectedDraft.id)
    if (success) {
      toast.success(t('plan.deleteSuccess'))
      closeDraftDetailDialog()
    }
    else {
      toast.error(t('plan.deleteFailed'))
    }
    setDeleteConfirmOpen(false)
  }, [selectedDraft, deleteMaterial, closeDraftDetailDialog, t])

  const [isVideoGenerating, setIsVideoGenerating] = useState(false)
  const [showGenConfig, setShowGenConfig] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const hasImage = !!(selectedDraft?.mediaList?.some(m => m.type === 'image') || selectedDraft?.coverUrl)
  const defaultModel = hasImage ? 'wan2.7-i2v-2026-04-25' : 'wan2.7-t2v-2026-04-25'
  const [model, setModel] = useState(defaultModel)

  useEffect(() => {
    if (selectedDraft) {
      setPrompt(selectedDraft.desc || selectedDraft.title || '')
      const hasImg = !!(selectedDraft.mediaList?.some(m => m.type === 'image') || selectedDraft.coverUrl)
      setModel(hasImg ? 'wan2.7-i2v-2026-04-25' : 'wan2.7-t2v-2026-04-25')
      setShowGenConfig(false)
    }
  }, [selectedDraft])

  const actionKeywords = ['微微一笑', '转头微笑', '轻轻挥手', '漫步前行', '喝一口饮料', '点头致意', '手持产品展示']

  const handleAddAction = useCallback((act: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim()
      if (!trimmed) return act
      if (trimmed.endsWith('。') || trimmed.endsWith('；') || trimmed.endsWith('，') || trimmed.endsWith(';')) {
        return `${trimmed}${act}`
      }
      return `${trimmed}，${act}`
    })
  }, [])

  const optimizePromptContent = useCallback(async (currentPrompt: string): Promise<string> => {
    const systemPrompt = `你是一个资深的电商获客和内容创意大师。你必须使用简体中文进行回复，绝对不能使用英文或翻译成英文。
你需要将用户输入的简单提示词（无论输入是中文还是英文），翻译、扩写并优化成更具吸引力、视觉感、商业卖点和同城热度的爆款视频/图文提示词。
要求：
1. 必须使用简体中文回复，绝对不要翻译成英文，也不要输出任何英文。
2. 即使输入是英文，也必须将其全部翻译成简体中文并按照中文要求进行扩写，绝对不要原样保留英文。
3. 补充画面视觉细节（画面构成、运镜方式、灯光氛围、镜头焦距等，适合AI生图生视频）。
4. 强调核心商业卖点，增加引流吸引力。
5. 请只输出优化后的提示词内容本身，不要有任何前言、解释或旁白，误区或引号。`

    const res = await aiChatStream({
      model: 'gpt-5.1-all',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${currentPrompt}\n\n注意：请确保使用简体中文输出优化后的提示词，不要输出任何英文，只返回优化后的提示词本身。` }
      ],
      stream: false
    })
    const data = await res.json()
    if (data && data.content) {
      return data.content
    }
    throw new Error('未返回有效内容')
  }, [])

  const handleOptimizePrompt = useCallback(async (currentPrompt: string) => {
    if (!currentPrompt.trim()) return
    setIsOptimizing(true)
    try {
      const optimized = await optimizePromptContent(currentPrompt)
      setPrompt(optimized)
      toast.success('提示词已智能优化！')
    } catch (error) {
      console.error(error)
      toast.error('AI 优化出错')
    } finally {
      setIsOptimizing(false)
    }
  }, [optimizePromptContent])

  const onSubmitGeneration = useCallback(async () => {
    if (selectedDraft) {
      setIsVideoGenerating(true)
      let finalPrompt = prompt
      if (autoOptimize) {
        setIsOptimizing(true)
        try {
          finalPrompt = await optimizePromptContent(prompt)
          setPrompt(finalPrompt)
        } catch (error) {
          console.error('Auto optimization failed, using original prompt:', error)
        } finally {
          setIsOptimizing(false)
        }
      }

      // 获取草稿内的图片路径（如果适用）
      let imagePath: string | undefined = undefined
      if (hasImage) {
        const imageMedia = selectedDraft.mediaList?.find(m => m.type === 'image')
        imagePath = imageMedia?.url || selectedDraft.coverUrl || undefined
      }

      await generateVideoForDraft(selectedDraft, {
        prompt: finalPrompt,
        model,
        image: imagePath,
      })
      
      setShowGenConfig(false)
      // We don't wait for polling here as the store handles it async
      setTimeout(() => setIsVideoGenerating(false), 2000)
    }
  }, [selectedDraft, prompt, autoOptimize, model, hasImage, generateVideoForDraft, optimizePromptContent])

  if (!selectedDraft)
    return null

  return (
    <>
      {/* 无障碍：隐藏的标题 */}
      <DialogTitle className="sr-only">{t('draft.detailTitle')}</DialogTitle>

      {/* PC端左右布局，移动端垂直布局 */}
      <div className="flex flex-col md:flex-row md:gap-6 md:h-[80vh]">
        {/* 左侧：媒体区域 */}
        <div className="md:w-3/5 flex-shrink-0 h-[40vh] md:h-full">
          <MediaPreview material={selectedDraft} />
        </div>

        {/* 右侧：信息区域 - 移动端限制最大高度使 ScrollArea 生效 */}
        <div className="md:w-2/5 mt-4 md:mt-0 flex flex-col max-h-[35vh] md:max-h-none md:h-full">
          {/* 可滚动内容 */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pr-2">
              {/* 标题 */}
              <div>
                <h3 className="text-lg font-medium">
                  {selectedDraft.title || '未命名草稿'}
                </h3>
              </div>

              {/* 描述 */}
              {selectedDraft.desc && (
                <div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDraft.desc}
                  </p>
                </div>
              )}

              {/* 话题 */}
              {selectedDraft.topics && selectedDraft.topics.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {selectedDraft.topics.map((topic, index) => (
                    <span key={index} className="text-sm text-primary">
                      #
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* 统计信息 */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {t('material.useCount', { count: selectedDraft.useCount || 0 })}
                </Badge>
                {selectedDraft.mediaList && selectedDraft.mediaList.length > 0 && (
                  <Badge variant="outline">
                    {selectedDraft.mediaList.some(m => m.type === 'video')
                      ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            {t('planType.video')}
                          </>
                        )
                      : (
                          <>
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {t('planType.article')}
                            {selectedDraft.mediaList.length > 1 && (
                              <span className="ml-1">
                                (
                                {selectedDraft.mediaList.length}
                                )
                              </span>
                            )}
                          </>
                        )}
                  </Badge>
                )}
              </div>

              {/* 平台图标 */}
              {selectedDraft.accountTypes && selectedDraft.accountTypes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDraft.accountTypes.map((type) => {
                    const platInfo = AccountPlatInfoMap.get(type as PlatType)
                    if (!platInfo)
                      return null
                    return (
                      <NextImage
                        key={type}
                        src={platInfo.icon}
                        alt={platInfo.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                        unoptimized
                      />
                    )
                  })}
                </div>
              )}

              {/* 创建时间 */}
              {selectedDraft.createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t('draft.createdAt')}
                    :
                    {' '}
                    {formatDate(selectedDraft.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 固定底部的操作按钮 */}
          <div className="flex items-center gap-2 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              data-testid="draftbox-detail-edit-btn"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('draft.edit')}
            </Button>
            <Button
              data-testid="draftbox-detail-publish-btn"
              className="flex-1 cursor-pointer"
              onClick={handlePublish}
            >
              <Send className="h-4 w-4 mr-2" />
              {t('draft.publish')}
            </Button>
            <Button
              data-testid="draftbox-detail-delete-btn"
              variant="outline"
              className="flex-1 cursor-pointer text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('draft.delete')}
            </Button>
          </div>

          {/* AI 增强操作 - 一键成片 / 配置面板 */}
          <div className="mt-4 border border-[#5F7A61]/20 rounded-xl p-3 bg-muted/30 space-y-3">
            {showGenConfig ? (
              <div className="space-y-3 text-[#2A2A2A] dark:text-[#FDFBF7]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">AI 视频生成配置</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowGenConfig(false)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    返回
                  </Button>
                </div>

                {/* 提示词输入框 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium">画面描述关键词</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOptimizePrompt(prompt)}
                      disabled={isOptimizing}
                      className="h-6 px-2 text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
                    >
                      {isOptimizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      智能优化
                    </Button>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="输入要生成的画面描述..."
                    className="text-xs min-h-[60px] bg-background border-[#5F7A61]/20 focus-visible:ring-primary focus-visible:border-primary"
                  />
                </div>

                {/* 人物动作预选 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">人物动作预选</label>
                  <div className="flex flex-wrap gap-1.5">
                    {actionKeywords.map((act) => (
                      <Badge
                        key={act}
                        variant="secondary"
                        onClick={() => handleAddAction(act)}
                        className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-0.5 px-1.5"
                      >
                        {act}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 场景自适应关键词优化开关 & 模型选择 */}
                <div className="space-y-2 pt-1 border-t border-[#5F7A61]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">自适应关键词优化 (提交时)</span>
                    <Switch
                      checked={autoOptimize}
                      onCheckedChange={setAutoOptimize}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">生成模型</label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="w-full h-8 text-xs bg-background border-[#5F7A61]/20">
                        <SelectValue placeholder="选择生成模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {hasImage ? (
                          <>
                            <SelectItem value="wan2.7-i2v-2026-04-25">万相 2.7 图生视频 (推荐)</SelectItem>
                            <SelectItem value="wanx2.1-i2v-plus">万相 2.1 图生视频-专业版</SelectItem>
                            <SelectItem value="wanx2.1-i2v-turbo">万相 2.1 图生视频-极速版</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="wan2.7-t2v-2026-04-25">万相 2.7 文生视频 (推荐)</SelectItem>
                            <SelectItem value="wanx2.1-t2v-plus">万相 2.1 文生视频-专业版</SelectItem>
                            <SelectItem value="wanx2.1-t2v-turbo">万相 2.1 文生视频-极速版</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 确认生成按钮 */}
                <Button
                  className="w-full h-10 cursor-pointer bg-gradient-to-r from-[#E5B25D] to-[#F3A390] text-[#FAF7F2] font-bold text-xs hover:opacity-90 transition-all border-none"
                  onClick={onSubmitGeneration}
                  disabled={isVideoGenerating || isOptimizing}
                >
                  {isVideoGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      AI 视频引擎处理中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      开始生成 AI 灵感视频
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full h-12 cursor-pointer bg-gradient-to-r from-[#E5B25D] to-[#F3A390] text-[#FAF7F2] font-extrabold hover:opacity-90 transition-all border-none shadow-[0_4px_12px_rgba(229,178,93,0.2)] group"
                  onClick={() => setShowGenConfig(true)}
                  disabled={isVideoGenerating}
                >
                  {isVideoGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-5 w-5 mr-2 animate-pulse group-hover:rotate-12 transition-transform" />
                  )}
                  {isVideoGenerating ? 'AI 智体视频引擎处理中...' : '一键生成 AI 灵感视频'}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground italic">
                  由 NVIDIA ACE 与 字节跳动火山引擎 提供超强算力支持
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#FAF7F2] dark:bg-[#1C261F] border border-[#5F7A61]/35 shadow-[0_10px_30px_rgba(95,122,97,0.1)] text-[#2A2A2A] dark:text-[#FDFBF7] backdrop-blur-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('plan.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70">
              {t('plan.deleteConfirmDesc', { name: selectedDraft.title || '未命名草稿' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer border border-[#5F7A61]/30 text-[#5F7A61] hover:bg-[#5F7A61]/10 bg-transparent">{t('common.cancel')}</AlertDialogCancel>
            <Button
              className="cursor-pointer bg-red-500 text-white hover:bg-red-600 border-none shadow-sm font-bold"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

DraftDetailContent.displayName = 'DraftDetailContent'

// 主组件
export const DraftDetailDialog = memo(() => {
  const { draftDetailDialogOpen } = usePlanDetailStore(
    useShallow(state => ({
      draftDetailDialogOpen: state.draftDetailDialogOpen,
    })),
  )

  const closeDraftDetailDialog = usePlanDetailStore(state => state.closeDraftDetailDialog)

  // 根据疑难杂症记录 #2，拆成两层组件避免闪烁
  if (!draftDetailDialogOpen)
    return null

  return (
    <Dialog open onOpenChange={closeDraftDetailDialog}>
      <DialogContent data-testid="draftbox-detail-dialog" className="sm:max-w-md md:max-w-6xl bg-[#FAF7F2] dark:bg-[#18221B] border border-[#5F7A61]/35 shadow-[0_10px_30px_rgba(95,122,97,0.1)] text-[#2A2A2A] dark:text-[#FDFBF7] backdrop-blur-md rounded-3xl overflow-hidden">
        <DraftDetailContent onClose={closeDraftDetailDialog} />
      </DialogContent>
    </Dialog>
  )
})

DraftDetailDialog.displayName = 'DraftDetailDialog'
