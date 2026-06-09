/**
 * MediaCard - 媒体卡片
 * 展示视频/图片缩略图，点击打开预览
 * 视频：缩略图 + 播放图标 + 时长
 * 图片：缩略图，保持原始比例
 * 支持批量选择模式和单张 hover 删除
 */

'use client'

import type { MediaItem } from '@/api/types/media'
import { Check, Play, Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'
import { getOssUrl } from '@/utils/oss'
import { deleteMedia } from '@/api/media'
import { confirm } from '@/lib/confirm'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { LazyImage } from '../LazyImage'

interface MediaCardProps {
  /** 媒体数据 */
  media: MediaItem
  /** 点击回调 */
  onClick: (media: MediaItem) => void
  /** 删除回调 */
  onDelete?: (media: MediaItem) => void
  /** 批量模式 */
  batchMode?: boolean
  /** 是否选中 */
  selected?: boolean
  /** 切换选中 */
  onToggleSelect?: () => void
}

/**
 * 格式化视频时长
 */
function formatDuration(seconds?: number): string {
  if (!seconds)
    return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const MediaCard = memo(({ media, onClick, onDelete, batchMode, selected, onToggleSelect }: MediaCardProps) => {
  const isVideo = media.type === 'video'
  const thumbUrl = media.thumbUrl ? getOssUrl(media.thumbUrl) : media.url ? getOssUrl(media.url) : '/images/placeholder.png'
  const duration = (media.metadata as any)?.duration

  const handleClick = useCallback(() => {
    if (batchMode && onToggleSelect) {
      onToggleSelect()
    }
    else {
      onClick(media)
    }
  }, [media, onClick, batchMode, onToggleSelect])

  const handleDeleteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    confirm({
      title: '确定要删除此媒体资源吗？',
      content: '删除后将无法恢复。',
      okType: 'destructive',
      onOk: async () => {
        try {
          const res = await deleteMedia(media._id)
          if (res) {
            toast.success('删除成功')
            onDelete?.(media)
          } else {
            toast.error('删除失败')
          }
        } catch (error) {
          console.error('Failed to delete media:', error)
          toast.error('删除失败')
        }
      }
    })
  }, [media, onDelete])

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
          data-testid="media-batch-checkbox"
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
          src={thumbUrl}
          alt={media.title || media.desc || '媒体'}
          width={400}
          height={300}
          className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          skeletonClassName="rounded-xl"
          placeholderHeight={150}
          style={{ aspectRatio: 'auto' }}
          unoptimized
        />

        {/* 视频播放图标 */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* 视频时长标签 */}
        {isVideo && duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
            {formatDuration(duration)}
          </div>
        )}

        {/* 悬浮遮罩 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />

        {/* 选中遮罩 */}
        {batchMode && selected && (
          <div className="absolute inset-0 bg-primary/15 pointer-events-none rounded-xl" />
        )}

        {/* 删除按钮 - 仅非批量模式下显示 */}
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

      {/* 标题 */}
      {media.title && (
        <div className="pt-2 px-1">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {media.title}
          </p>
        </div>
      )}
    </div>
  )
})

MediaCard.displayName = 'MediaCard'
