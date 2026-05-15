/**
 * 草稿箱核心组件
 * 通过 PlanTabBar 管理多推广计划切换，展示内容管理模块
 */

'use client'

import { Loader2, Plus, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useBrandPromotionStore } from '@/app/[lng]/brand-promotion/brandPromotionStore'
import CreatePlanModal from '@/app/[lng]/brand-promotion/components/CreatePlanModal'
import PlanTabBar from '@/app/[lng]/brand-promotion/components/PlanTabBar'
import { usePlanDetailStore } from '@/app/[lng]/brand-promotion/planDetailStore'
import { usePlanTabStore } from '@/app/[lng]/brand-promotion/planTabStore'
import { useMissionStore } from '@/app/[lng]/mission-square/missionStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Info } from 'lucide-react'
import DraftContentModule from './components/DraftContentModule'

export default function DraftBoxCore() {
  const { t } = useTransClient('brandPromotion')
  const searchParams = useSearchParams()
  const urlPlanId = searchParams.get('planId')
  const missionId = searchParams.get('missionId')

  const { getMissionById } = useMissionStore()
  const currentMission = missionId ? getMissionById(missionId) : null

  const {
    tabPlans,
    tabPlansLoading,
    selectedPlanId,
    initialized,
  } = usePlanTabStore(
    useShallow(state => ({
      tabPlans: state.tabPlans,
      tabPlansLoading: state.tabPlansLoading,
      selectedPlanId: state.selectedPlanId,
      initialized: state.initialized,
    })),
  )

  const initTabs = usePlanTabStore(state => state.initTabs)

  const openCreatePlanModal = useBrandPromotionStore(
    state => state.openCreatePlanModal,
  )

  const initContentData = usePlanDetailStore(state => state.initContentData)

  // 初始化 Tab 列表
  useEffect(() => {
    initTabs()
  }, [initTabs])

  // URL 参数激活对应 Tab
  useEffect(() => {
    if (initialized && urlPlanId) {
      usePlanTabStore.getState().selectPlan(urlPlanId)
    }
  }, [initialized, urlPlanId])

  // 初始化数据
  useEffect(() => {
    if (selectedPlanId) {
      initContentData(selectedPlanId)
    }
  }, [selectedPlanId, initContentData])

  // 处理 Mission 自动创建/关联
  const createPlan = useBrandPromotionStore(state => state.createPlan)
  const isCreatingRef = useRef(false)

  useEffect(() => {
    if (initialized && missionId && currentMission && !isCreatingRef.current) {
      // 检查是否已有同名或关联 Plan
      const existingPlan = tabPlans.find(p => 
        p.name.includes(currentMission.brand) || 
        p.name.includes(currentMission.title)
      )
      
      if (existingPlan) {
        usePlanTabStore.getState().selectPlan(existingPlan.id)
      } else {
        // 自动创建任务专属 Plan
        isCreatingRef.current = true
        createPlan({ name: `Mission: ${currentMission.brand} - ${currentMission.title.slice(0, 10)}` })
          .finally(() => {
            isCreatingRef.current = false
          })
      }
    }
  }, [initialized, missionId, currentMission, tabPlans, createPlan])

  // Tab 切换回调
  const handlePlanChange = useCallback((planId: string) => {
    initContentData(planId, true)
  }, [initContentData])

  const loading = !initialized
  const showEmpty = initialized && tabPlans.length === 0

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <div className="flex flex-col h-full bg-background">
            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showEmpty) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <div className="flex flex-col h-full bg-background">
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#c565ef]/10 to-[#55D9ED]/10 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-foreground/60" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t('empty.title')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('empty.description')}
                </p>
                <Button
                  size="lg"
                  className="cursor-pointer gap-2"
                  onClick={openCreatePlanModal}
                >
                  <Plus className="h-5 w-5" />
                  {t('empty.createButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CreatePlanModal />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mission Banner */}
      {currentMission && (
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-orange-200">
              <CheckCircle2 size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                You are creating content for: <span className="text-orange-600">{currentMission.title}</span>
              </p>
              <p className="text-[10px] text-gray-400">NVIDIA AI will prioritize brand requirements for {currentMission.brand}.</p>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-600 border-none px-3">Mission Active</Badge>
        </div>
      )}

      {/* Tab 栏 */}
      <div data-testid="draftbox-plan-tabs">
        <PlanTabBar onPlanChange={handlePlanChange} syncUrlQuery />
      </div>
      <div className="flex-1 min-h-0">
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 overflow-auto">
            <DraftContentModule />
          </div>
        </div>
      </div>

      {/* 创建/编辑推广计划弹窗 */}
      <CreatePlanModal />
    </div>
  )
}
