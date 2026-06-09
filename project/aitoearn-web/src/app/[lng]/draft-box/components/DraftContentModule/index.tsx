/**
 * DraftContentModule - 内容管理核心模块
 * 可复用的草稿管理区域，包含 AI生成栏、草稿列表、相关弹框
 * 在 brand-promotion 页面和独立 draft-box 页面中复用
 */

'use client'

import type { IPubParams } from '@/components/PublishDialog/publishDialog.type'
import { useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useShallow } from 'zustand/react/shallow'
import { Sparkles } from 'lucide-react'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'
import { AccountPlatInfoMap, isPlatformAvailable } from '@/app/config/platConfig'
import { PubType } from '@/app/config/publishConfig'
import { VideoGrabFrame } from '@/components/PublishDialog/PublishDialog.util'
import { usePublishDialog } from '@/components/PublishDialog/usePublishDialog'
import { useAccountStore } from '@/store/account'
import { useUserStore } from '@/store/user'
import { generateUUID } from '@/utils'
import { useGenerationPolling } from '../../hooks/useGenerationPolling'
import AiBatchGenerateBar from '../AiBatchGenerateBar'
import { useMediaTabStore } from '../ContentTabs/mediaTabStore'
import { DraftListSection } from '../DraftListSection'

// Dynamically import heavy interactive modals to optimize first-load JS size
const PublishDialog = dynamic(() => import('@/components/PublishDialog'), {
  ssr: false,
})
const CreateMaterialModal = dynamic(() => import('../CreateMaterialModal').then(mod => mod.CreateMaterialModal), {
  ssr: false,
})
const DraftDetailDialog = dynamic(() => import('../DraftDetailDialog').then(mod => mod.DraftDetailDialog), {
  ssr: false,
})
const GenerationDetailDialog = dynamic(() => import('../GenerationDetailDialog').then(mod => mod.GenerationDetailDialog), {
  ssr: false,
})

function DraftContentModule() {
  const {
    currentPlan,
    createMaterialModalOpen,
    editingMaterial,
    generatingCount,
    publishDialogOpen,
    publishingDraft,
  } = usePlanDetailStore(
    useShallow(state => ({
      currentPlan: state.currentPlan,
      createMaterialModalOpen: state.createMaterialModalOpen,
      editingMaterial: state.editingMaterial,
      generatingCount: state.generatingCount,
      publishDialogOpen: state.publishDialogOpen,
      publishingDraft: state.publishingDraft,
    })),
  )

  const selectedPlanId = currentPlan?.id || null
  const closeMaterialModal = usePlanDetailStore(state => state.closeMaterialModal)
  const fetchMaterials = usePlanDetailStore(state => state.fetchMaterials)
  const closePublishDialog = usePlanDetailStore(state => state.closePublishDialog)
  const silentRefreshMaterials = usePlanDetailStore(state => state.silentRefreshMaterials)
  const updateGeneratingCount = usePlanDetailStore(state => state.updateGeneratingCount)

  const accountList = useAccountStore(state => state.accountList)

  // Plan 切换时重置媒体 Tab 数据
  useEffect(() => {
    useMediaTabStore.getState().reset()
  }, [selectedPlanId])

  // AI 批量生成轮询
  useGenerationPolling({
    enabled: generatingCount > 0,
    interval: 5000,
    onTaskCompleted: () => {
      if (selectedPlanId) {
        silentRefreshMaterials(selectedPlanId)
        useMediaTabStore.getState().silentRefresh(selectedPlanId)
        useMediaTabStore.getState().silentRefreshAll(selectedPlanId, selectedPlanId)

        // 1.5 秒后进行二次刷新，防止由于数据库索引或写入延迟导致的首次查询为空
        setTimeout(() => {
          silentRefreshMaterials(selectedPlanId)
          useMediaTabStore.getState().silentRefresh(selectedPlanId)
          useMediaTabStore.getState().silentRefreshAll(selectedPlanId, selectedPlanId)
        }, 1500)
      }
      useUserStore.getState().fetchCreditsBalance()
    },
    onCountUpdate: updateGeneratingCount,
  })

  // 根据草稿类型计算默认选中的账户
  const defaultAccountIds = useMemo(() => {
    if (!publishingDraft)
      return undefined
    const isVideo = publishingDraft.mediaList?.some(m => m.type === 'video')
    const targetPubType = isVideo ? PubType.VIDEO : PubType.ImageText

    return accountList
      .filter((acc) => {
        const platConfig = AccountPlatInfoMap.get(acc.type)
        return platConfig?.pubTypes.has(targetPubType) && acc.status !== 0 && isPlatformAvailable(acc.type)
      })
      .map(acc => acc.id)
  }, [publishingDraft, accountList])

  // 发布弹框打开后预填草稿数据
  useEffect(() => {
    if (!publishDialogOpen || !publishingDraft)
      return

    const timer = setTimeout(async () => {
      const store = usePublishDialog.getState()
      if (!store.pubListChoosed?.length)
        return

      store.setPrefillLoading(true)

      const params: Partial<IPubParams> = {
        des: publishingDraft.desc || '',
        title: publishingDraft.title || '',
        topics: publishingDraft.topics,
      }

      // 将话题拼接到描述末尾，以便 Lexical 编辑器渲染为 mention 节点
      if (publishingDraft.topics?.length) {
        const topicStr = publishingDraft.topics.map(t => `#${t}`).join(' ')
        params.des = `${params.des || ''}\n${topicStr}`.trim()
      }

      const videoMedia = publishingDraft.mediaList?.find(m => m.type === 'video')
      if (videoMedia) {
        try {
          const videoInfo = await VideoGrabFrame(videoMedia.url, 0)
          const cover = publishingDraft.coverUrl
            ? {
                id: generateUUID(),
                size: 0,
                file: new File([], ''),
                imgUrl: publishingDraft.coverUrl,
                ossUrl: publishingDraft.coverUrl,
                filename: '',
                imgPath: '',
                width: videoInfo.width,
                height: videoInfo.height,
              }
            : videoInfo.cover
          params.video = {
            size: 0,
            file: new Blob(),
            videoUrl: videoMedia.url,
            ossUrl: videoMedia.url,
            filename: '',
            width: videoInfo.width,
            height: videoInfo.height,
            duration: videoInfo.duration,
            cover,
          }
        }
        catch {
          params.video = {
            size: 0,
            file: new Blob(),
            videoUrl: videoMedia.url,
            ossUrl: videoMedia.url,
            filename: '',
            width: 0,
            height: 0,
            duration: 0,
            cover: {
              id: generateUUID(),
              size: 0,
              file: new File([], ''),
              imgUrl: publishingDraft.coverUrl || '',
              ossUrl: publishingDraft.coverUrl,
              filename: '',
              imgPath: '',
              width: 0,
              height: 0,
            },
          }
        }
        params.images = []
      }
      else {
        params.images = publishingDraft.mediaList
          ?.filter(m => m.type === 'img')
          .map((m, i) => ({
            id: `draft-img-${i}`,
            size: 0,
            file: new File([], ''),
            imgUrl: m.url,
            filename: '',
            imgPath: '',
            width: 0,
            height: 0,
            ossUrl: m.url,
          })) || []
      }

      store.setAccountAllParams(params)
      store.setPrefillLoading(false)
    }, 500)

    return () => {
      clearTimeout(timer)
      usePublishDialog.getState().setPrefillLoading(false)
    }
  }, [publishDialogOpen, publishingDraft])

  // 创建草稿成功回调
  const handleMaterialSuccess = useCallback(() => {
    if (currentPlan) {
      fetchMaterials(currentPlan.id, 1)
    }
    useUserStore.getState().fetchCreditsBalance()
  }, [currentPlan, fetchMaterials])

  return (
    <>
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col xl:flex-row gap-6 items-start">
        {/* Left Control Column: AI Content Generator Panel */}
        <div className="w-full xl:w-[480px] xl:sticky xl:top-6 flex-shrink-0 bg-white dark:bg-[#202C24] rounded-[2rem] border border-[#5F7A61]/15 p-6 shadow-[0_8px_30px_rgba(95,122,97,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 pointer-events-none opacity-20">
            <div className="w-32 h-32 rounded-full bg-[radial-gradient(circle,#F3A390_0%,transparent_70%)] blur-2xl" />
          </div>
          
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5F7A61]/10 text-[#5F7A61] dark:text-[#7FA382] font-semibold text-xs border border-[#5F7A61]/15 mb-3 shadow-[0_2px_8px_rgba(95,122,97,0.05)]">
              <Sparkles size={12} className="text-[#F3A390] animate-pulse" />
              <span>AI 自动引流助手</span>
            </div>
            <h2 className="text-xl font-bold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight">AI 自动获客创作室</h2>
            <p className="text-xs text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 mt-1.5 leading-relaxed">
              只需一步：在此输入您的招牌特色、新品或促销活动，AI 即刻一键批量做出精美的短视频/图文海报草稿。配合获客二维码，到店顾客扫码一键即可帮您代发至抖音或小红书，源源不断吸引同城食客进店消费！
            </p>
          </div>
          <AiBatchGenerateBar groupId={selectedPlanId || undefined} />
        </div>

        {/* Right Gallery Column: Drafts & Publishing Workstation */}
        <div className="flex-1 w-full min-w-0 bg-white/60 dark:bg-[#1C261F]/60 backdrop-blur-xl rounded-[2rem] border border-[#5F7A61]/12 p-6 shadow-[0_8px_30px_rgba(95,122,97,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <div className="mb-4 border-b border-[#5F7A61]/10 pb-4">
            <h3 className="text-lg font-bold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight">内容工作台</h3>
            <p className="text-xs text-muted-foreground mt-1">管理并一键安全分发至多平台草稿箱</p>
          </div>
          <DraftListSection materialGroupId={selectedPlanId || undefined} />
        </div>
      </div>

      {/* 创建草稿弹窗 */}
      <CreateMaterialModal
        open={createMaterialModalOpen}
        groupId={currentPlan?.id || null}
        editingMaterial={editingMaterial}
        onClose={closeMaterialModal}
        onSuccess={handleMaterialSuccess}
      />

      {/* 草稿详情弹窗 */}
      <DraftDetailDialog />

      {/* 生成任务详情弹框 */}
      <GenerationDetailDialog />

      {/* 发布弹框 */}
      <PublishDialog
        open={publishDialogOpen}
        onClose={closePublishDialog}
        accounts={accountList}
        defaultAccountIds={defaultAccountIds}
        onPubSuccess={closePublishDialog}
      />

    </>
  )
}

export default DraftContentModule
