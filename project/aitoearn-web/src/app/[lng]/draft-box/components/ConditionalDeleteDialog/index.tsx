/**
 * ConditionalDeleteDialog - 按条件删除弹窗
 * 支持草稿箱、全部、视频、图片多 Tab
 * 外层控制渲染，内层使用 hooks（避免 useTransClient 动态加载闪烁）
 */

'use client'

import type { MaterialListFilters } from '@/api/material'
import lodash from 'lodash'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { apiGetMaterialList } from '@/api/material'
import { getMediaList } from '@/api/media'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'
import { useTransClient } from '@/app/i18n/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { toast } from '@/lib/toast'
import { useMediaTabStore } from '../ContentTabs/mediaTabStore'

interface ConditionalDeleteDialogProps {
  activeTab: 'all' | 'drafts' | 'video' | 'img'
}

// 外层：控制渲染时机
const ConditionalDeleteDialog = memo(({ activeTab }: ConditionalDeleteDialogProps) => {
  const isDrafts = activeTab === 'drafts'

  const draftOpen = usePlanDetailStore(state => state.conditionalDeleteDialogOpen)
  const mediaOpen = useMediaTabStore(state => state.conditionalDeleteDialogOpen)

  const open = isDrafts ? draftOpen : mediaOpen

  const closeDialog = useCallback(() => {
    if (isDrafts) {
      usePlanDetailStore.getState().closeConditionalDeleteDialog()
    }
    else {
      useMediaTabStore.getState().closeConditionalDeleteDialog()
    }
  }, [isDrafts])

  if (!open)
    return null

  return (
    <ConditionalDeleteDialogContent
      activeTab={activeTab}
      onOpenChange={(v) => {
        if (!v)
          closeDialog()
      }}
    />
  )
})

ConditionalDeleteDialog.displayName = 'ConditionalDeleteDialog'

// 内层：使用 hooks
const ConditionalDeleteDialogContent = memo(({ activeTab, onOpenChange }: { activeTab: string, onOpenChange: (open: boolean) => void }) => {
  const { t } = useTransClient('brandPromotion')
  const isDrafts = activeTab === 'drafts'
  const showTitleFilter = isDrafts || activeTab === 'all'

  const currentPlan = usePlanDetailStore(state => state.currentPlan)

  const [title, setTitle] = useState('')
  const [useCount, setUseCount] = useState<number | undefined>()
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [querying, setQuerying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const hasCondition = (showTitleFilter && title.trim() !== '') || useCount !== undefined

  // 构建筛选条件
  const buildFilters = useCallback((): MaterialListFilters => {
    const filters: MaterialListFilters = {}
    if (showTitleFilter && title.trim())
      filters.title = title.trim()
    if (useCount !== undefined)
      filters.useCount = useCount
    return filters
  }, [title, useCount, showTitleFilter])

  // debounce 查询匹配数量
  const queryMatchCount = useMemo(
    () => lodash.debounce(async () => {
      if (!currentPlan)
        return
      const filters = buildFilters()
      if (!filters.title && filters.useCount === undefined) {
        setMatchCount(null)
        setQuerying(false)
        return
      }
      setQuerying(true)
      try {
        let total = 0

        if (isDrafts) {
          // 仅查草稿
          const res = await apiGetMaterialList(currentPlan.id, 1, 0, filters)
          total = res?.data?.total ?? 0
        }
        else if (activeTab === 'all') {
          // 查草稿 + 媒体
          const [draftRes, mediaRes] = await Promise.all([
            apiGetMaterialList(currentPlan.id, 1, 0, filters),
            getMediaList({ materialGroupId: currentPlan.id, useCount: filters.useCount }, 1, 0),
          ])
          total = (draftRes?.data?.total ?? 0) + (mediaRes?.data?.total ?? 0)
        }
        else {
          // 视频或图片
          const res = await getMediaList(
            { materialGroupId: currentPlan.id, useCount: filters.useCount },
            1,
            0,
            activeTab as 'video' | 'img',
          )
          total = res?.data?.total ?? 0
        }

        setMatchCount(total)
      }
      catch {
        setMatchCount(null)
      }
      finally {
        setQuerying(false)
      }
    }, 500),
    [currentPlan, buildFilters, isDrafts, activeTab],
  )

  useEffect(() => {
    if (!currentPlan)
      return
    const filters = buildFilters()
    if (!filters.title && filters.useCount === undefined) {
      setMatchCount(null)
      return
    }
    setQuerying(true)
    queryMatchCount()
  }, [title, useCount, currentPlan, buildFilters, queryMatchCount])

  // 清理 debounce
  useEffect(() => {
    return () => {
      queryMatchCount.cancel()
    }
  }, [queryMatchCount])

  const handleDelete = useCallback(async () => {
    if (!hasCondition || matchCount === 0)
      return
    setDeleting(true)
    try {
      const conditions = buildFilters()
      let success = false

      if (isDrafts) {
        success = await usePlanDetailStore.getState().filterDeleteMaterials(conditions)
      }
      else {
        const materialGroupId = currentPlan?.id
        if (materialGroupId) {
          success = await useMediaTabStore.getState().filterDeleteMedia(
            activeTab as 'all' | 'video' | 'img',
            materialGroupId,
            conditions,
          )
        }
      }

      if (success) {
        toast.success(t('draftManage.conditionalDeleteSuccess'))
      }
      else {
        toast.error(t('draftManage.conditionalDeleteFailed'))
      }
    }
    finally {
      setDeleting(false)
    }
  }, [hasCondition, matchCount, buildFilters, isDrafts, activeTab, currentPlan, t])

  const deleteDisabled = !hasCondition || matchCount === 0 || matchCount === null || deleting

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent data-testid="draftbox-cond-delete-dialog" className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t('draftManage.conditionalDeleteTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {showTitleFilter && (
            <div className="space-y-2">
              <Label>{t('draftManage.conditionTitle')}</Label>
              <Input
                data-testid="draftbox-cond-title-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('draftManage.conditionTitlePlaceholder')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('draftManage.conditionUseCount')}</Label>
            <NumberInput
              data-testid="draftbox-cond-usecount-input"
              value={useCount}
              onValueChange={v => setUseCount(v)}
              decimalScale={0}
              allowNegative={false}
              placeholder={t('draftManage.conditionUseCountPlaceholder')}
            />
          </div>

          <div data-testid="draftbox-cond-match-count" className="rounded-md bg-muted p-3 text-sm">
            {!hasCondition && (
              <span className="text-muted-foreground">{t('draftManage.setConditionHint')}</span>
            )}
            {hasCondition && querying && (
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('draftManage.matchCountLoading')}
              </span>
            )}
            {hasCondition && !querying && matchCount !== null && (
              <span className={matchCount > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {t('draftManage.matchCount', { count: matchCount })}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="cursor-pointer">
            {t('draftManage.cancel')}
          </Button>
          <Button
            data-testid="draftbox-cond-delete-confirm-btn"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDisabled}
            className="cursor-pointer gap-1.5"
          >
            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('common.delete')}
            {matchCount !== null && matchCount > 0 && ` (${matchCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

ConditionalDeleteDialogContent.displayName = 'ConditionalDeleteDialogContent'

export { ConditionalDeleteDialog }
