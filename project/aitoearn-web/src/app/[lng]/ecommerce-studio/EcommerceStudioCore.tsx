'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Loader2,
  Trash2,
  Download,
  Share2,
  Plus,
  Info,
  Maximize2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransClient } from '@/app/i18n/client'
import { useUserStore } from '@/store/user'
import { uploadToOss } from '@/api/oss'
import { editImage, generateVideo, getVideoTaskStatus } from '@/api/ai'
import { apiGetMaterialGroupList, apiCreateMaterialGroup, apiCreateMaterial } from '@/api/material'
import { useGetClientLng } from '@/hooks/useSystem'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getOssUrl } from '@/utils/oss'
import { PubType } from '@/app/config/publishConfig'

interface TaskRecord {
  id: string
  type: 'background' | 'model' | 'video'
  status: 'generating' | 'success' | 'failed'
  prompt: string
  resultUrl?: string
  errorMessage?: string
  createdAt: number
}

export default function EcommerceStudioCore() {
  const lng = useGetClientLng()
  const { t } = useTransClient('ecommerceStudio')
  const router = useRouter()
  const token = useUserStore(state => state.token)

  // Sub-tabs: 'background' | 'model' | 'video'
  const [activeTab, setActiveTab] = useState<'background' | 'model' | 'video'>('background')

  // Left panel form inputs
  const [subjectImage, setSubjectImage] = useState<string>('')
  const [maskImage, setMaskImage] = useState<string>('')
  const [refVideo, setRefVideo] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [facePrompt, setFacePrompt] = useState<string>('')
  
  // Style presets helper
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  // Settings
  const [aspectRatio, setAspectRatio] = useState<string>('9:16')
  const [resolution, setResolution] = useState<string>('720p')
  const [duration, setDuration] = useState<number>(5)

  // Upload progress indicators
  const [subjectUploading, setSubjectUploading] = useState<boolean>(false)
  const [maskUploading, setMaskUploading] = useState<boolean>(false)
  const [videoUploading, setVideoUploading] = useState<boolean>(false)

  // Task generation loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  // History list
  const [historyList, setHistoryList] = useState<TaskRecord[]>([])
  
  // Active polling tasks map (taskId -> Interval/Timeout)
  const pollingRefs = useRef<Record<string, NodeJS.Timeout>>({})

  // Send to Draft Box Modal
  const [pushDialogOpen, setPushDialogOpen] = useState<boolean>(false)
  const [pushedUrl, setPushedUrl] = useState<string>('')
  const [pushedType, setPushedType] = useState<'img' | 'video'>('img')
  const [planList, setPlanList] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [newPlanName, setNewPlanName] = useState<string>('')
  const [draftTitle, setDraftTitle] = useState<string>('')
  const [draftDesc, setDraftDesc] = useState<string>('')
  const [isPushing, setIsPushing] = useState<boolean>(false)

  // Preset styles definitions
  const presets = [
    { key: 'studio', prompt: 'clean studio light, professional soft commercial product photography' },
    { key: 'marble', prompt: 'placed on luxury white marble table, elegant soft gold sunbeams, cosmetics aesthetic background' },
    { key: 'wood', prompt: 'minimalist warm wooden desk background, cozy sunlight, plants outline, organic lifestyle setting' },
    { key: 'outdoor', prompt: 'outdoor bright morning sunlight, lush green garden background, soft bokeh' },
    { key: 'neon', prompt: 'cyberpunk neon lit streets background, commercial product display showcase, reflections, dark night' },
    { key: 'silk', prompt: 'resting on soft flowing beige silk cloth ripples, warm gentle light, elegant premium look' }
  ]

  // Polling logic cleanup
  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(clearTimeout)
    }
  }, [])

  // Auto handle preset select
  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey)
    const preset = presets.find(p => p.key === presetKey)
    if (preset) {
      setPrompt(preset.prompt)
    }
  }

  // File Upload Handlers
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'subject' | 'mask' | 'video'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'subject') setSubjectUploading(true)
    if (type === 'mask') setMaskUploading(true)
    if (type === 'video') setVideoUploading(true)

    try {
      const url = await uploadToOss(file)
      if (type === 'subject') setSubjectImage(url)
      if (type === 'mask') setMaskImage(url)
      if (type === 'video') setRefVideo(url)
      toast.success(lng === 'zh-CN' ? '上传文件成功！' : 'Upload successful!')
    } catch (err) {
      console.error(err)
      toast.error(lng === 'zh-CN' ? '文件上传失败！' : 'Upload failed!')
    } finally {
      if (type === 'subject') setSubjectUploading(false)
      if (type === 'mask') setMaskUploading(false)
      if (type === 'video') setVideoUploading(false)
    }
  }

  // Form Submit Handler
  const handleStartGeneration = async () => {
    if (!subjectImage) {
      toast.warning(t('messages.imageRequired'))
      return
    }
    if (activeTab === 'model' && !maskImage) {
      toast.warning(t('messages.maskRequired'))
      return
    }
    if (activeTab === 'video' && !refVideo) {
      toast.warning(t('messages.videoRequired'))
      return
    }
    if (!prompt.trim()) {
      toast.warning(t('messages.promptRequired'))
      return
    }

    setIsGenerating(true)
    toast.info(t('messages.generatingTask'))

    try {
      if (activeTab === 'background' || activeTab === 'model') {
        // Prepare image edit payload
        const payload = {
          model: activeTab === 'background' ? 'wanx-background-generation-v2' : 'virtualmodel-v2',
          image: [subjectImage],
          prompt,
          ...(activeTab === 'model' ? { mask: maskImage, face_prompt: facePrompt || undefined } : {}),
          size: 'auto'
        }

        const res = await editImage(payload) as any
        
        // Response contains list which holds final generated URLs because the server handles DashScope polling inside edit()
        const imageResultUrl = res?.data?.list?.[0]?.url || res?.list?.[0]?.url
        if (!imageResultUrl) {
          throw new Error('No image URL returned from edit endpoint')
        }

        const newRecord: TaskRecord = {
          id: `task-${Date.now()}`,
          type: activeTab,
          status: 'success',
          prompt,
          resultUrl: imageResultUrl,
          createdAt: Date.now()
        }

        setHistoryList(prev => [newRecord, ...prev])
        toast.success(lng === 'zh-CN' ? '图片生成成功！' : 'Image generation succeeded!')
      } else {
        // Video generation task (wan2.7-r2v is async in low-level, but here we query task status)
        const payload = {
          model: 'wan2.7-r2v',
          prompt,
          image: [subjectImage], // First frame target
          video_url: refVideo, // Reference video
          size: aspectRatio === '16:9' ? '1280x720' : '720x1280',
          duration
        }

        const res = await generateVideo(payload)
        const taskId = res?.data?.id
        if (!taskId) {
          throw new Error('Video generation failed to return task ID')
        }

        const newRecord: TaskRecord = {
          id: taskId,
          type: 'video',
          status: 'generating',
          prompt,
          createdAt: Date.now()
        }

        setHistoryList(prev => [newRecord, ...prev])
        startPollingVideoTask(taskId)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(lng === 'zh-CN' ? `云端渲染错误: ${err.message}` : `Cloud render error: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Poll video task status
  const startPollingVideoTask = (taskId: string) => {
    const poll = async () => {
      try {
        const res = await getVideoTaskStatus(taskId)
        const status = res?.data?.status
        const videoUrl = res?.data?.content?.video_url

        if (status === 'success' && videoUrl) {
          setHistoryList(prev =>
            prev.map(item =>
              item.id === taskId
                ? { ...item, status: 'success', resultUrl: videoUrl }
                : item
            )
          )
          toast.success(lng === 'zh-CN' ? '视频生成成功！' : 'Video generation succeeded!')
          delete pollingRefs.current[taskId]
        } else if (status === 'failed') {
          setHistoryList(prev =>
            prev.map(item =>
              item.id === taskId
                ? { ...item, status: 'failed', errorMessage: 'Cloud rendering failed' }
                : item
            )
          )
          toast.error(lng === 'zh-CN' ? '视频渲染失败！' : 'Video rendering failed!')
          delete pollingRefs.current[taskId]
        } else {
          // Continue polling
          pollingRefs.current[taskId] = setTimeout(poll, 4000)
        }
      } catch (err) {
        console.error('Video task polling failed', err)
        pollingRefs.current[taskId] = setTimeout(poll, 6000)
      }
    }
    
    // Start initial delay
    pollingRefs.current[taskId] = setTimeout(poll, 4000)
  }

  // Load plans for pushing draft
  const openPushDialog = async (url: string, type: 'img' | 'video') => {
    setPushedUrl(url)
    setPushedType(type)
    setDraftTitle(lng === 'zh-CN' ? '智能工坊视觉素材' : 'Studio Visual Asset')
    setDraftDesc(prompt)
    setPushDialogOpen(true)

    try {
      const res = await apiGetMaterialGroupList(1, 100)
      const list = res?.data?.list || []
      setPlanList(list)
      if (list.length > 0) {
        setSelectedPlanId(list[0].id)
      }
    } catch (err) {
      console.error(err)
      toast.error(t('messages.loadFailed'))
    }
  }

  // Save/Push generated URL back to aiautoedit publishing Draft Box
  const handlePushToDraft = async () => {
    let targetGroupId = selectedPlanId

    setIsPushing(true)
    try {
      // Create new plan if input is provided
      if (newPlanName.trim()) {
        const newGroup = await apiCreateMaterialGroup({ name: newPlanName.trim() })
        targetGroupId = newGroup?.data?.id || ''
      }

      if (!targetGroupId) {
        toast.warning(lng === 'zh-CN' ? '请选择或创建一个推广计划！' : 'Please select or create a plan!')
        setIsPushing(false)
        return
      }

      await apiCreateMaterial({
        groupId: targetGroupId,
        coverUrl: pushedType === 'img' ? pushedUrl : undefined,
        mediaList: [
          {
            url: pushedUrl,
            type: pushedType,
            content: draftDesc
          }
        ],
        title: draftTitle,
        desc: draftDesc,
        type: pushedType === 'video' ? PubType.VIDEO : PubType.ImageText
      })

      toast.success(t('messages.pushSuccess') + (newPlanName || planList.find(p => p.id === targetGroupId)?.name))
      setPushDialogOpen(false)
      setNewPlanName('')
      
      // Prompt user to redirect to draft box
      toast(lng === 'zh-CN' ? '已保存！是否前往草稿箱查看？' : 'Saved! View in Draft Box?', {
        action: {
          label: t('actions.viewDraft'),
          onClick: () => router.push(`/${lng}/draft-box?planId=${targetGroupId}`)
        }
      })
    } catch (err) {
      console.error(err)
      toast.error(t('actions.pushFailed'))
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] dark:bg-[#18221B] font-sans selection:bg-[#5F7A61]/20">
      
      {/* Background spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#E5B25D_0%,transparent_70%)] opacity-[0.03] dark:opacity-[0.06] blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#5F7A61_0%,transparent_70%)] opacity-[0.03] dark:opacity-[0.06] blur-3xl" />
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-8">
        
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#5F7A61]/15 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-3xl font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] tracking-tight">{t('title')}</h1>
              <Badge className="bg-[#E5B25D]/10 text-[#E5B25D] hover:bg-[#E5B25D]/15 border border-[#E5B25D]/30 font-bold ml-2">Wan 2.7 Pro</Badge>
            </div>
            <p className="text-sm text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F7A61] dark:text-[#7FA382] bg-white/70 dark:bg-[#202C24]/60 backdrop-blur-md border border-[#5F7A61]/15 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#5F7A61] dark:bg-[#7FA382] animate-ping" />
            DashScope Beijing Endpoint (北京节点已在线)
          </div>
        </div>

        {/* Workspace Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Controls (7 cols) */}
          <div className="lg:col-span-7 bg-white/70 dark:bg-[#202C24]/60 backdrop-blur-xl border border-[#5F7A61]/15 rounded-3xl p-6 shadow-xl flex flex-col gap-6 animate-cyber-fade-in">
            
            {/* Functional Sub-tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] dark:bg-[#18221B] p-1 rounded-2xl border border-[#5F7A61]/10">
              <button
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'background'
                    ? 'bg-[#5F7A61] text-[#FAF7F2] shadow-sm'
                    : 'text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 hover:text-[#5F7A61]'
                }`}
                onClick={() => setActiveTab('background')}
              >
                {t('tabs.background')}
              </button>
              <button
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'model'
                    ? 'bg-[#5F7A61] text-[#FAF7F2] shadow-sm'
                    : 'text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 hover:text-[#5F7A61]'
                }`}
                onClick={() => setActiveTab('model')}
              >
                {t('tabs.model')}
              </button>
              <button
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#5F7A61] text-[#FAF7F2] shadow-sm'
                    : 'text-[#2A2A2A]/60 dark:text-[#FDFBF7]/60 hover:text-[#5F7A61]'
                }`}
                onClick={() => setActiveTab('video')}
              >
                {t('tabs.video')}
              </button>
            </div>

            {/* Asset Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product/Subject File Uploader */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.subjectImage')}</label>
                <div className="relative border-2 border-dashed border-[#5F7A61]/20 hover:border-[#5F7A61]/40 rounded-2xl h-44 flex flex-col justify-center items-center bg-[#FAF7F2]/40 dark:bg-[#18221B]/40 transition-colors group overflow-hidden">
                  {subjectImage ? (
                    <>
                      <img src={getOssUrl(subjectImage)} alt="subject" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSubjectImage('')
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      {subjectUploading ? (
                        <Loader2 className="w-8 h-8 text-[#5F7A61] animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-[#5F7A61] mb-2 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold">{t('fields.subjectImagePlaceholder')}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'subject')}
                    disabled={subjectUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Conditional Uploader depending on Tab */}
              {activeTab === 'model' && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.maskImage')}</label>
                  <div className="relative border-2 border-dashed border-[#5F7A61]/20 hover:border-[#5F7A61]/40 rounded-2xl h-44 flex flex-col justify-center items-center bg-[#FAF7F2]/40 dark:bg-[#18221B]/40 transition-colors group overflow-hidden">
                    {maskImage ? (
                      <>
                        <img src={getOssUrl(maskImage)} alt="mask" className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMaskImage('')
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        {maskUploading ? (
                          <Loader2 className="w-8 h-8 text-[#5F7A61] animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-[#5F7A61] mb-2 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold">{t('fields.maskImagePlaceholder')}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'mask')}
                      disabled={maskUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.refVideo')}</label>
                  <div className="relative border-2 border-dashed border-[#5F7A61]/20 hover:border-[#5F7A61]/40 rounded-2xl h-44 flex flex-col justify-center items-center bg-[#FAF7F2]/40 dark:bg-[#18221B]/40 transition-colors group overflow-hidden">
                    {refVideo ? (
                      <>
                        <video src={getOssUrl(refVideo)} className="w-full h-full object-cover" controls />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setRefVideo('')
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md z-20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        {videoUploading ? (
                          <Loader2 className="w-8 h-8 text-[#5F7A61] animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-[#5F7A61] mb-2 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold">{t('fields.refVideoPlaceholder')}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      disabled={videoUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Face prompt input for virtual models */}
            {activeTab === 'model' && (
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.facePrompt')}</label>
                <Input
                  value={facePrompt}
                  onChange={(e) => setFacePrompt(e.target.value)}
                  placeholder={t('fields.facePromptPlaceholder')}
                  className="rounded-xl border-[#5F7A61]/15"
                />
              </div>
            )}

            {/* Preset Styles Tag Container */}
            {activeTab === 'background' && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.presets')}</label>
                <div className="flex flex-wrap gap-2">
                  {presets.map(item => (
                    <button
                      key={item.key}
                      onClick={() => handlePresetSelect(item.key)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selectedPreset === item.key
                          ? 'bg-[#E5B25D]/10 border-[#E5B25D] text-[#E5B25D]'
                          : 'border-[#5F7A61]/15 text-[#2A2A2A]/70 hover:border-[#5F7A61]/35'
                      }`}
                    >
                      {t(`presetsList.${item.key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Text Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.prompt')}</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('fields.promptPlaceholder')}
                rows={3}
                className="rounded-2xl border-[#5F7A61]/15 resize-none"
              />
            </div>

            {/* Parameter Settings Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#5F7A61]/10">
              
              {activeTab === 'video' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.duration')}</label>
                      <span className="text-xs font-bold text-[#5F7A61]">{duration}s</span>
                    </div>
                    <Slider
                      value={[duration]}
                      onValueChange={(val) => setDuration(val[0] || 5)}
                      min={2}
                      max={15}
                      step={1}
                      className="py-1 cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.aspectRatio')}</label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="rounded-xl border-[#5F7A61]/15">
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">9:16 (vertical screen)</SelectItem>
                        <SelectItem value="16:9">16:9 (horizontal screen)</SelectItem>
                        <SelectItem value="1:1">1:1 (square post)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#2A2A2A] dark:text-[#FDFBF7] uppercase tracking-wider">{t('fields.resolution')}</label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="rounded-xl border-[#5F7A61]/15">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">Standard Edition (Wan2.7 Standard)</SelectItem>
                        <SelectItem value="1080p">High Definition Professional (Wan2.7 Pro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

            </div>

            {/* Action submit button */}
            <Button
              onClick={handleStartGeneration}
              disabled={isGenerating || subjectUploading || maskUploading || videoUploading}
              size="lg"
              className="w-full h-12 bg-[#5F7A61] hover:bg-[#5F7A61]/90 rounded-full font-bold shadow-lg shadow-teal-700/20 text-[#FAF7F2] gap-2 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('actions.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t('actions.generate')}
                </>
              )}
            </Button>

          </div>

          {/* RIGHT: Visual History Gallery (5 cols) */}
          <div className="lg:col-span-5 bg-white/70 dark:bg-[#202C24]/60 backdrop-blur-xl border border-[#5F7A61]/15 rounded-3xl p-6 shadow-xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-bold text-[#2A2A2A] dark:text-[#FDFBF7] pb-3 border-b border-[#5F7A61]/10">{t('history.title')}</h2>
            
            {historyList.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-center text-muted-foreground p-6">
                <ImageIcon className="w-12 h-12 text-[#5F7A61]/25 mb-4" />
                <p className="text-xs leading-relaxed max-w-[240px] font-bold text-[#2A2A2A]/45 dark:text-[#FDFBF7]/40">{t('history.empty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyList.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#FAF7F2]/50 dark:bg-[#1C261F]/40 border border-[#5F7A61]/15 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge className={`text-[10px] font-bold border ${
                          item.type === 'video' 
                            ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                            : 'bg-teal-500/10 text-teal-500 border-teal-500/30'
                        }`}>
                          {item.type === 'video' ? 'Role Video (R2V)' : 'AI Product Image'}
                        </Badge>
                      </div>
                      <Badge className={`text-[10px] font-bold border ${
                        item.status === 'success'
                          ? 'bg-[#5F7A61]/10 text-[#5F7A61] border-[#5F7A61]/30'
                          : item.status === 'failed'
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse'
                      }`}>
                        {t(`history.statusMap.${item.status}`)}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 line-clamp-2 mb-3 italic">{item.prompt}</p>

                    {item.status === 'success' && item.resultUrl && (
                      <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[#5F7A61]/10">
                        {item.type === 'video' ? (
                          <video src={getOssUrl(item.resultUrl)} className="w-full aspect-[9/16] object-cover" controls />
                        ) : (
                          <div className="relative group">
                            <img src={getOssUrl(item.resultUrl)} alt="result" className="w-full aspect-square object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <a
                                href={getOssUrl(item.resultUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 shadow-md"
                              >
                                <Maximize2 size={16} />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {item.status === 'generating' && (
                      <div className="h-32 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-[#5F7A61]/20">
                        <Loader2 className="w-6 h-6 animate-spin text-[#5F7A61] mb-2" />
                        <span className="text-[10px] text-[#2A2A2A]/50 dark:text-[#FDFBF7]/50 font-bold">{t('actions.generating')}</span>
                      </div>
                    )}

                    {item.status === 'failed' && (
                      <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-red-500">
                        {item.errorMessage || 'Unknown cloud rendering issue'}
                      </div>
                    )}

                    {item.status === 'success' && item.resultUrl && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#5F7A61]/10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getOssUrl(item.resultUrl!))}
                          className="flex-1 text-xs border-[#5F7A61]/15 hover:bg-[#5F7A61]/5 rounded-xl cursor-pointer"
                        >
                          <Download size={12} className="mr-1" />
                          {t('actions.download')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openPushDialog(item.resultUrl!, item.type === 'video' ? 'video' : 'img')}
                          className="flex-1 text-xs bg-[#5F7A61] hover:bg-[#5F7A61]/90 text-white rounded-xl shadow-sm cursor-pointer"
                        >
                          <Share2 size={12} className="mr-1" />
                          {t('actions.push')}
                        </Button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* DIALOG: Push to Draft Box */}
      <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#202C24] border border-[#5F7A61]/25 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2A2A2A] dark:text-[#FDFBF7]">{t('actions.selectPlan')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            
            {/* Choose existing Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 uppercase tracking-wide">{t('actions.selectPlan')}</label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="rounded-xl border-[#5F7A61]/15">
                  <SelectValue placeholder={t('actions.planSelectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {planList.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Create new Plan optionally */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 uppercase tracking-wide">{t('actions.createNewPlan')}</label>
              <Input
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder={t('actions.newPlanNamePlaceholder')}
                className="rounded-xl border-[#5F7A61]/15"
              />
            </div>

            {/* Draft metadata */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 uppercase tracking-wide">{t('actions.draftTitle')}</label>
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder={t('actions.draftTitlePlaceholder')}
                className="rounded-xl border-[#5F7A61]/15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A2A]/70 dark:text-[#FDFBF7]/70 uppercase tracking-wide">{t('actions.draftDesc')}</label>
              <Textarea
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                placeholder={t('actions.draftDescPlaceholder')}
                rows={2}
                className="rounded-xl border-[#5F7A61]/15 resize-none"
              />
            </div>

          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPushDialogOpen(false)}
              className="rounded-xl border-[#5F7A61]/15 cursor-pointer"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handlePushToDraft}
              disabled={isPushing}
              className="bg-[#5F7A61] hover:bg-[#5F7A61]/90 text-white rounded-xl shadow-sm cursor-pointer"
            >
              {isPushing && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {t('actions.confirmPush')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
