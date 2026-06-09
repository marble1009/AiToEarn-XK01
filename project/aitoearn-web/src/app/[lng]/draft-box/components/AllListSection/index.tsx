/**
 * AllListSection - 全部列表区域
 * 合并草稿、视频、图片三种数据源，瀑布流布局 + IntersectionObserver 无限滚动
 * 根据数据来源分发渲染 DraftCard 或 MediaCard
 * 支持批量选择模式
 */

'use client'

import type { MediaItem } from '@/api/types/media'
import type { PromotionMaterial } from '@/app/[lng]/brand-promotion/brandPromotionStore/types'
import type { MediaPreviewItem } from '@/components/common/MediaPreview'
import { Check, Inbox, Trash2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import Masonry from 'react-masonry-css'
import { useShallow } from 'zustand/react/shallow'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'
import { useTransClient } from '@/app/i18n/client'
import { MediaPreview } from '@/components/common/MediaPreview'
import { Skeleton } from '@/components/ui/skeleton'
import { getOssUrl } from '@/utils/oss'
import { apiDeleteMaterial } from '@/api/material'
import { confirm } from '@/lib/confirm'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useMediaTabStore } from '../ContentTabs/mediaTabStore'
import { LazyImage } from '../LazyImage'
import { MediaCard } from '../MediaCard'

/**
 * 瀑布流断点配置
 */
const MASONRY_BREAKPOINTS = {
  default: 5,
  1280: 4,
  1024: 3,
  768: 3,
  640: 2,
}

// 骨架屏
function AllCardSkeleton({ index }: { index: number }) {
  const heights = [120, 160, 200, 140, 180, 150, 170, 190]
  const height = heights[index % heights.length]

  return (
    <div className="mb-4">
      <Skeleton className="w-full rounded-xl" style={{ height: `${height}px` }} />
      <div className="pt-2 px-1">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

// 加载更多指示器
const LoadingIndicator = memo(({ label }: { label: string }) => (
  <div className="flex justify-center py-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <span>{label}</span>
    </div>
  </div>
))
LoadingIndicator.displayName = 'LoadingIndicator'

/** 草稿卡片（简化版，用于全部列表，支持批量选择） */
const AllDraftCard = memo(({ material, onClick, onDelete, batchMode, selected, onToggleSelect }: {
  material: PromotionMaterial
  onClick: () => void
  onDelete?: () => void
  batchMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}) => {
  const coverUrl = getOssUrl(material.coverUrl) || '/images/placeholder.png'

  const handleClick = useCallback(() => {
    if (batchMode && onToggleSelect) {
      onToggleSelect()
    }
    else {
      onClick()
    }
  }, [batchMode, onClick, onToggleSelect])

  const handleDeleteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    confirm({
      title: '确定要删除此草稿吗？',
      content: '删除后将无法恢复。',
      okType: 'destructive',
      onOk: async () => {
        try {
          const res = await apiDeleteMaterial(material.id)
          if (res) {
            toast.success('删除成功')
            onDelete?.()
          } else {
            toast.error('删除失败')
          }
        } catch (error) {
          console.error('Failed to delete material:', error)
          toast.error('删除失败')
        }
      }
    })
  }, [material, onDelete])

  return (
    <div
      className={cn(
        'mb-4 cursor-pointer group relative',
        batchMode
          ? cn(
              'rounded-xl transition-all duration-200',
              selected ? 'shadow-lg' : '',
            )
          : '',
      )}
      onClick={handleClick}
    >
      {/* 批量模式圆形勾选指示器 */}
      {batchMode && (
        <div
          className={cn(
            'absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm',
            selected
              ? 'bg-primary border-primary scale-110'
              : 'bg-background/90 border-muted-foreground/30 group-hover:border-primary group-hover:scale-105',
          )}
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.() }}
        >
          {selected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-xl">
        <LazyImage
          src={coverUrl}
          alt={material.title || ''}
          width={400}
          height={300}
          className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          skeletonClassName="rounded-xl"
          placeholderHeight={150}
          style={{ aspectRatio: 'auto' }}
        />
        {!batchMode && material.desc && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 rounded-xl">
            <p className="text-white text-xs line-clamp-4">
              {material.desc}
            </p>
          </div>
        )}

        {/* 选中遮罩 */}
        {batchMode && selected && (
          <div className="absolute inset-0 bg-primary/15 pointer-events-none rounded-xl" />
        )}

        {/* 删除按钮 - 仅非批量模式 */}
        {!batchMode && onDelete && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-md cursor-pointer"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="pt-2 px-1">
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {material.title || ''}
        </p>
        {material.model && (
          <span className="inline-block mt-1 px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
            {material.model}
          </span>
        )}
      </div>
    </div>
  )
})
AllDraftCard.displayName = 'AllDraftCard'

interface AllListSectionProps {
  materialGroupId: string
}

export const AllListSection = memo(({ materialGroupId }: AllListSectionProps) => {
  const { t } = useTransClient('material')
  const { t: tBrand } = useTransClient('brandPromotion')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const currentPlan = usePlanDetailStore(state => state.currentPlan)
  const openDraftDetailDialog = usePlanDetailStore(state => state.openDraftDetailDialog)

  const { mergedList, loading, initialized, allExhausted, batchMode, selectedIds } = useMediaTabStore(
    useShallow(state => ({
      mergedList: state.all.mergedList,
      loading: state.all.loading,
      initialized: state.all.initialized,
      allExhausted: state.all.allExhausted,
      batchMode: state.batchMode,
      selectedIds: state.selectedIds,
    })),
  )

  const fetchAllList = useMediaTabStore(state => state.fetchAllList)
  const loadMoreAll = useMediaTabStore(state => state.loadMoreAll)
  const toggleSelection = useMediaTabStore(state => state.toggleSelection)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  // 媒体预览状态
  const { previewOpen, previewIndex, previewType } = useMediaTabStore(
    useShallow(state => ({
      previewOpen: state.previewOpen,
      previewIndex: state.previewIndex,
      previewType: state.previewType,
    })),
  )
  const openPreview = useMediaTabStore(state => state.openPreview)
  const closePreview = useMediaTabStore(state => state.closePreview)

  // 首次加载
  useEffect(() => {
    if (!initialized && materialGroupId && currentPlan) {
      fetchAllList(materialGroupId, currentPlan.id)
    }
  }, [initialized, materialGroupId, currentPlan, fetchAllList])

  // IntersectionObserver 无限滚动
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current
    if (!loadMoreElement)
      return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !allExhausted && !loading && materialGroupId && currentPlan) {
          loadMoreAll(materialGroupId, currentPlan.id)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreElement)
    return () => observer.disconnect()
  }, [allExhausted, loading, materialGroupId, currentPlan, loadMoreAll])

  // 媒体卡片点击 - 打开预览
  const handleMediaClick = useCallback((media: MediaItem) => {
    // 找到在合并列表中同类型媒体的索引（用于预览导航）
    const mediaItems = mergedList.filter(item => item.source === media.type)
    const index = mediaItems.findIndex(item => item.id === media._id)
    if (index !== -1) {
      openPreview(media.type as 'video' | 'img', index)
    }
  }, [mergedList, openPreview])

  // 预览项列表（按当前预览类型过滤）
  const previewItems = useMemo((): MediaPreviewItem[] => {
    return mergedList
      .filter(item => item.source === previewType)
      .map((item) => {
        const media = item.data as MediaItem
        return {
          type: media.type === 'video' ? 'video' as const : 'image' as const,
          src: getOssUrl(media.url),
          title: media.title,
        }
      })
  }, [mergedList, previewType])

  // 初始加载骨架屏
  if (loading && mergedList.length === 0) {
    return (
      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <AllCardSkeleton key={i} index={i} />
        ))}
      </Masonry>
    )
  }

  // 空状态
  if (initialized && mergedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {t('mediaManagement.noMedia')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('mediaManagement.noMediaDesc')}
        </p>
      </div>
    )
  }

  return (
    <>
      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {mergedList.map((item) => {
          if (item.source === 'draft') {
            const material = item.data as PromotionMaterial
            return (
              <AllDraftCard
                key={`draft-${item.id}`}
                material={material}
                onClick={() => openDraftDetailDialog(material)}
                onDelete={() => {
                  if (materialGroupId && currentPlan) {
                    fetchAllList(materialGroupId, currentPlan.id)
                    // 同步刷新草稿箱以同步顶栏 Tab 数量与草稿箱内容
                    usePlanDetailStore.getState().fetchMaterials(currentPlan.id, 1)
                  }
                }}
                batchMode={batchMode}
                selected={selectedSet.has(item.id)}
                onToggleSelect={() => toggleSelection(item.id)}
              />
            )
          }
          else {
            const media = item.data as MediaItem
            return (
              <MediaCard
                key={`${item.source}-${item.id}`}
                media={media}
                onClick={handleMediaClick}
                onDelete={() => {
                  if (materialGroupId && currentPlan) {
                    fetchAllList(materialGroupId, currentPlan.id)
                  }
                }}
                batchMode={batchMode}
                selected={selectedSet.has(item.id)}
                onToggleSelect={() => toggleSelection(item.id)}
              />
            )
          }
        })}
      </Masonry>

      {/* 加载触发器 */}
      <div ref={loadMoreRef} />

      {/* 加载更多指示器 */}
      {loading && <LoadingIndicator label={tBrand('common.loading')} />}

      {/* 没有更多数据 */}
      {allExhausted && mergedList.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <span className="text-sm text-muted-foreground">
            {t('mediaManagement.loadedAll')}
          </span>
        </div>
      )}

      {/* 媒体预览弹窗 */}
      <MediaPreview
        open={previewOpen}
        items={previewItems}
        initialIndex={previewIndex}
        onClose={closePreview}
      />
    </>
  )
})

AllListSection.displayName = 'AllListSection'
