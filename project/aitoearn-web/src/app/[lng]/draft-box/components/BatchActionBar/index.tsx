/**
 * BatchActionBar - 批量模式底部固定操作栏
 * 显示已选数量、取消按钮、删除按钮
 */

'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'
import { useTransClient } from '@/app/i18n/client'
import { Button } from '@/components/ui/button'
import { confirm } from '@/lib/confirm'
import { toast } from '@/lib/toast'

import { useMediaTabStore } from '../ContentTabs/mediaTabStore'

interface BatchActionBarProps {
  activeTab: 'all' | 'drafts' | 'video' | 'img'
}

const BatchActionBar = memo(({ activeTab }: BatchActionBarProps) => {
  const { t } = useTransClient('brandPromotion')
  const isDrafts = activeTab === 'drafts'

  const { selectedMaterialIds, batchDeleting } = usePlanDetailStore(
    useShallow(state => ({
      selectedMaterialIds: state.selectedMaterialIds,
      batchDeleting: state.batchDeleting,
    })),
  )

  const { selectedIds, mediaBatchDeleting } = useMediaTabStore(
    useShallow(state => ({
      selectedIds: state.selectedIds,
      mediaBatchDeleting: state.batchDeleting,
    })),
  )

  const selectedCount = isDrafts ? selectedMaterialIds.length : selectedIds.length
  const deleting = isDrafts ? batchDeleting : mediaBatchDeleting

  const exitBatchMode = useCallback(() => {
    if (isDrafts) {
      usePlanDetailStore.getState().exitBatchMode()
    }
    else {
      useMediaTabStore.getState().exitBatchMode()
    }
  }, [isDrafts])

  const batchDelete = useCallback(async () => {
    if (isDrafts) {
      return await usePlanDetailStore.getState().batchDeleteMaterials()
    }
    else {
      const materialGroupId = usePlanDetailStore.getState().currentPlan?.id
      if (!materialGroupId)
        return false
      return await useMediaTabStore.getState().batchDeleteMedia(activeTab, materialGroupId)
    }
  }, [isDrafts, activeTab])

  const handleDelete = useCallback(() => {
    if (selectedCount === 0)
      return

    confirm({
      title: t('draftManage.batchDeleteConfirmTitle'),
      content: t('draftManage.batchDeleteConfirmDesc', { count: selectedCount }),
      okType: 'destructive',
      onOk: async () => {
        const success = await batchDelete()
        if (success) {
          toast.success(t('draftManage.batchDeleteSuccess'))
        }
        else {
          toast.error(t('draftManage.batchDeleteFailed'))
        }
      },
    })
  }, [selectedCount, batchDelete, t])

  return (
    <div data-testid="draftbox-batch-bar" className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <span data-testid="draftbox-batch-selected-count" className="text-sm text-muted-foreground">
          {t('draftManage.selectedCount', { count: selectedCount })}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exitBatchMode} className="cursor-pointer">
            {t('draftManage.cancel')}
          </Button>
          <Button
            data-testid="draftbox-batch-delete-btn"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={selectedCount === 0 || deleting}
            className="cursor-pointer gap-1.5"
          >
            {deleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  )
})

BatchActionBar.displayName = 'BatchActionBar'

export { BatchActionBar }
