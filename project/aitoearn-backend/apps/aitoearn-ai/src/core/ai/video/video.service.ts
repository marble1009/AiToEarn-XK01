import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { StorageProvider } from '@yikart/assets'
import { AppException, ResponseCode, UserType } from '@yikart/common'
import { AiLog, AiLogChannel, AiLogRepository, AiLogStatus, AiLogType, UserRepository, SubscriptionPlanRepository, UserSubscriptionRepository } from '@yikart/mongodb'
import { TaskStatus } from '../../../common'
import { WanxiangService } from '../libs/wanxiang'
import {
  Content,
  ContentType,
  GetVideoGenerationTaskResponse,
  ImageRole,
  parseModelTextCommand,
  serializeModelTextCommand,
} from '../libs/volcengine'
import { ModelsConfigService } from '../models-config'
import { GeminiVeoVideoCallbackDto, GeminiVideoService } from './gemini'
import { GrokVideoCallbackDto, GrokVideoService } from './grok'
import { OpenAIVideoCallbackDto, OpenAIVideoService } from './openai'
import {
  UserListVideoTasksQueryDto,
  UserVideoGenerationRequestDto,
  UserVideoTaskQueryDto,
  VideoGenerationModelsQueryDto,
} from './video.dto'
import { VideoTaskInput } from './video.vo'
import { VolcengineVideoService } from './volcengine'

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name)

  constructor(
    private readonly userRepo: UserRepository,
    private readonly aiLogRepo: AiLogRepository,
    private readonly modelsConfigService: ModelsConfigService,
    private readonly storageProvider: StorageProvider,
    private readonly volcengineVideoService: VolcengineVideoService,
    private readonly openaiVideoService: OpenAIVideoService,
    private readonly grokVideoService: GrokVideoService,
    private readonly geminiVideoService: GeminiVideoService,
    private readonly wanxiangService: WanxiangService,
    private readonly userSubscriptionRepo: UserSubscriptionRepository,
    private readonly subscriptionPlanRepo: SubscriptionPlanRepository,
  ) {}

  /**
   * 将图片 URL 转为 R2 预签名 URL，绕过 CDN robots.txt 限制
   */
  private async toPresignedUrl(url: string | undefined): Promise<string | undefined> {
    if (!url) {
      return undefined
    }
    return this.storageProvider.toPresignedUrl(url)
  }

  private async toPresignedUrls(urls: string[]): Promise<string[]> {
    return Promise.all(urls.map(url => this.storageProvider.toPresignedUrl(url)))
  }

  async calculateVideoGenerationPrice(params: {
    model: string
    userId?: string
    userType?: UserType
    resolution?: string
    aspectRatio?: string
    mode?: string
    duration?: number
  }): Promise<number> {
    const { model, userId, userType } = params

    const modelConfig = (await this.getVideoGenerationModelParams({ userId, userType })).find(m => m.name === model)
    if (!modelConfig) {
      throw new AppException(ResponseCode.InvalidModel)
    }

    const { resolution, aspectRatio, mode, duration } = {
      ...modelConfig.defaults,
      ...params,
    }

    let pricingConfig = modelConfig.pricing.find((pricing) => {
      const resolutionMatch = !pricing.resolution || !resolution || pricing.resolution === resolution
      const aspectRatioMatch = !pricing.aspectRatio || !aspectRatio || pricing.aspectRatio === aspectRatio
      const modeMatch = !pricing.mode || !mode || pricing.mode === mode
      const durationMatch = !pricing.duration || !duration || pricing.duration === duration

      return resolutionMatch && aspectRatioMatch && modeMatch && durationMatch
    })

    if (!pricingConfig && duration) {
      const matchingCriteriaConfigs = modelConfig.pricing.filter((pricing) => {
        const resolutionMatch = !pricing.resolution || !resolution || pricing.resolution === resolution
        const aspectRatioMatch = !pricing.aspectRatio || !aspectRatio || pricing.aspectRatio === aspectRatio
        const modeMatch = !pricing.mode || !mode || pricing.mode === mode
        return resolutionMatch && aspectRatioMatch && modeMatch
      })
      if (matchingCriteriaConfigs.length > 0) {
        matchingCriteriaConfigs.sort((a, b) => {
          const aDiff = a.duration ? Math.abs(a.duration - duration) : Infinity
          const bDiff = b.duration ? Math.abs(b.duration - duration) : Infinity
          return aDiff - bDiff
        })
        pricingConfig = matchingCriteriaConfigs[0]
      }
    }

    if (!pricingConfig) {
      throw new AppException(ResponseCode.InvalidModel)
    }

    this.logger.debug({
      params,
      modelConfig,
      pricingConfig,
    }, '模型价格计算')

    return pricingConfig.price
  }

  /**
   * 用户视频生成（通用接口）
   */
  async userVideoGeneration(request: UserVideoGenerationRequestDto) {
    const { userId, userType, model, duration } = request

    const modelConfig = this.modelsConfigService.config.video.generation.find(m => m.name === model)
    if (!modelConfig) {
      throw new AppException(ResponseCode.InvalidModel)
    }

    // 普通会员每日 30 秒限额拦截校验
    if (userType === UserType.User) {
      const activeSub = await this.userSubscriptionRepo.getActiveSubscription(userId)
      let isVip = false
      if (activeSub) {
        const plan = await this.subscriptionPlanRepo.getById(activeSub.planId)
        if (plan && (plan.name.includes('VIP') || plan.name.includes('高级'))) {
          isVip = true
        }
      }

      if (!isVip) {
        const requestedDuration = duration || modelConfig.defaults?.duration || 5
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        
        // 查询该用户今日已成功和生成中的视频生成日志
        const logs = await this.aiLogRepo.list({
          userId,
          userType,
          type: AiLogType.Video,
        })
        
        // 过滤 Generating 或 Success，且是今天创建的
        const todayLogs = logs.filter(log => {
          const logDate = log.createdAt || log.startedAt
          return logDate >= startOfDay && 
            (log.status === AiLogStatus.Generating || log.status === AiLogStatus.Success)
        })

        let todaySeconds = 0
        for (const log of todayLogs) {
          const req = log.request || {}
          const sec = req['seconds'] ? Number(req['seconds']) : (req['duration'] ? Number(req['duration']) : 5)
          todaySeconds += sec
        }

        if (todaySeconds + requestedDuration > 30) {
          throw new BadRequestException(`普通会员每日视频生成时长限制为30秒。今日已使用 ${todaySeconds} 秒，本次请求 ${requestedDuration} 秒，已超出限额。`)
        }
      }
    }

    const channel = modelConfig.channel

    const createTaskResponse = (taskId: string, points: number) => ({
      id: taskId,
      status: TaskStatus.Submitted,
      points,
    })

    switch (channel) {
      case AiLogChannel.Volcengine:
        return this.handleVolcengineGeneration(request, createTaskResponse)
      case AiLogChannel.Dashscope:
        return this.handleWanxiangGeneration(request, createTaskResponse)
      case AiLogChannel.OpenAI:
        return this.handleOpenAIGeneration(request, createTaskResponse)
      case AiLogChannel.Grok:
        return this.handleGrokGeneration(request, createTaskResponse)
      case AiLogChannel.Gemini:
        return this.handleGeminiGeneration(request, createTaskResponse)
      default:
        throw new AppException(ResponseCode.InvalidModel)
    }
  }

  /**
   * 处理阿里百炼 Wanxiang 渠道的视频生成（wan2.7-* / wanx2.1-*）
   * 替代了之前在 openai.service.ts 中基于 baseUrl 字符串匹配的 dashscope 分支
   */
  private async handleWanxiangGeneration<T>(
    request: UserVideoGenerationRequestDto,
    createTaskResponse: (taskId: string, points: number) => T,
  ) {
    const { model, prompt, image, video_url, duration, size } = request

    let firstFrameImageUrl: string | undefined
    if (typeof image === 'string') {
      firstFrameImageUrl = await this.toPresignedUrl(image) || image
    }
    let imageUrls: string[] | undefined
    if (Array.isArray(image)) {
      imageUrls = await this.toPresignedUrls(image)
    }
    let videoUrls: string[] | undefined
    if (video_url) {
      const parsed = await this.toPresignedUrl(video_url)
      videoUrls = parsed ? [parsed] : [video_url]
    }

    const result = await this.wanxiangService.generateVideo({
      model,
      prompt,
      firstFrameImageUrl,
      imageUrls,
      videoUrls,
      size: size as string | undefined,
      seconds: duration,
      async: true,
    })

    return createTaskResponse(result.id, 0)
  }

  /**
   * 处理Volcengine渠道的视频生成
   */
  private async handleVolcengineGeneration<T>(
    request: UserVideoGenerationRequestDto,
    createTaskResponse: (taskId: string, points: number) => T,
  ) {
    const { userId, userType, model, prompt, duration, size, image, image_tail } = request

    if (Array.isArray(image)) {
      throw new BadRequestException()
    }

    const textCommand = parseModelTextCommand(prompt)
    const content: Content[] = []

    if (image) {
      content.push({
        type: ContentType.ImageUrl,
        image_url: { url: await this.toPresignedUrl(image) || image },
        role: ImageRole.FirstFrame,
      })
    }

    if (image_tail) {
      content.push({
        type: ContentType.ImageUrl,
        image_url: { url: await this.toPresignedUrl(image_tail) || image_tail },
        role: ImageRole.LastFrame,
      })
    }

    content.push({
      type: ContentType.Text,
      text: `${textCommand.prompt} ${serializeModelTextCommand({
        ...textCommand.params,
        duration,
        resolution: size,
      })}`,
    })

    const result = await this.volcengineVideoService.create({
      userId,
      userType,
      model,
      content,
    })
    return createTaskResponse(result.id, result.points)
  }

  /**
   * 处理OpenAI渠道的视频生成
   */
  private async handleOpenAIGeneration<T>(
    request: UserVideoGenerationRequestDto,
    createTaskResponse: (taskId: string, points: number) => T,
  ) {
    const { userId, userType, model, prompt, image, video_url } = request

    let inputReference: string | string[] | undefined = undefined
    if (Array.isArray(image)) {
      if (model !== 'wan2.7-r2v') {
        if (image.length > 1) {
          throw new BadRequestException('OpenAI does not support multiple images')
        }
        inputReference = await this.toPresignedUrl(image[0])
      } else {
        inputReference = await this.toPresignedUrls(image)
      }
    } else {
      inputReference = await this.toPresignedUrl(image)
    }

    const presignedVideoUrl = video_url ? await this.toPresignedUrl(video_url) : undefined

    const result = await this.openaiVideoService.createVideo({
      userId,
      userType,
      prompt,
      input_reference: inputReference,
      video_url: presignedVideoUrl,
      model,
      seconds: request.duration ? request.duration.toString() : undefined,
      size: request.size as any,
    })
    return createTaskResponse(result.id, result.points)
  }

  /**
   * 处理Grok渠道的视频生成
   */
  private async handleGrokGeneration<T>(
    request: UserVideoGenerationRequestDto,
    createTaskResponse: (taskId: string, points: number) => T,
  ) {
    const { userId, userType, model, prompt, video_url } = request

    if (video_url) {
      const parsed = this.storageProvider.parsePathFromUrl(video_url)
      const videoUrl = parsed.startsWith('http') ? video_url : await this.storageProvider.toPresignedUrl(video_url)
      const result = await this.grokVideoService.createVideo({
        userId,
        userType,
        model,
        prompt,
        videoUrl,
      })
      return createTaskResponse(result.id, result.points)
    }

    const imageUrl = Array.isArray(request.image) ? request.image[0] : request.image
    const result = await this.grokVideoService.createVideo({
      userId,
      userType,
      model,
      prompt,
      duration: request.duration,
      aspectRatio: request.metadata?.['aspectRatio'] as string,
      resolution: request.metadata?.['resolution'] as string,
      imageUrl: imageUrl ? await this.toPresignedUrl(imageUrl) : undefined,
    })
    return createTaskResponse(result.id, result.points)
  }

  /**
   * 处理Gemini渠道的视频生成 (Veo 3.1)
   */
  private async handleGeminiGeneration<T>(
    request: UserVideoGenerationRequestDto,
    createTaskResponse: (taskId: string, points: number) => T,
  ) {
    const { userId, userType, model, prompt, duration } = request

    // 计算价格
    const points = await this.calculateVideoGenerationPrice({
      model,
      userId,
      userType,
      duration,
    })

    // 匹配 referenceImages, video, image 等 Veo3.1 特有入参
    const imageUrl = Array.isArray(request.image) ? request.image[0] : request.image
    const referenceImages = Array.isArray(request.image) ? request.image : (request.image ? [request.image] : undefined)

    const result = await this.geminiVideoService.createVideo({
      userId,
      userType,
      model: model as any,
      prompt,
      duration: duration || 8,
      aspectRatio: request.metadata?.['aspectRatio'] as '16:9' | '9:16' || '9:16',
      resolution: request.size as '720p' | '1080p' || '720p',
      image: imageUrl ? await this.toPresignedUrl(imageUrl) : undefined,
      video: request.video_url ? await this.toPresignedUrl(request.video_url) : undefined,
      referenceImages: referenceImages ? await this.toPresignedUrls(referenceImages) : undefined,
    } as any)
    return createTaskResponse(result.id, points)
  }

  private extractInput(aiLog: AiLog): VideoTaskInput {
    const request = (aiLog.request || {}) as Record<string, unknown>

    switch (aiLog.channel) {
      case AiLogChannel.Volcengine:
        return this.volcengineVideoService.extractInput(request)
      case AiLogChannel.OpenAI:
        return this.openaiVideoService.extractInput(request)
      case AiLogChannel.Grok:
        return this.grokVideoService.extractInput(request)
      case AiLogChannel.Gemini:
        return this.geminiVideoService.extractInput(request)
      default:
        return { prompt: '' }
    }
  }

  async transformToCommonResponse(aiLog: AiLog) {
    const input = this.extractInput(aiLog)

    const base = {
      id: aiLog.id,
      model: aiLog.model,
      input,
      submittedAt: aiLog.startedAt,
      startedAt: aiLog.startedAt,
    }

    if (aiLog.taskId && aiLog.taskId.startsWith('mock-veo-task-')) {
      const elapsed = Date.now() - aiLog.startedAt.getTime()
      if (elapsed > 4000) {
        const promptStr = String(input?.prompt || '').toLowerCase()
        const isChinese = promptStr.includes('chinese') || promptStr.includes('china') || promptStr.includes('中国') || promptStr.includes('汉服') || promptStr.includes('华人')
        return {
          ...base,
          status: TaskStatus.Success,
          videoUrl: isChinese
            ? 'https://aurastring.cloud/assets/promptGallery/video_chinese.mp4'
            : 'https://assets.aitoearn.ai/68b55fb321b15a40e511dfcf/ai/video/veo-3.1-fast-generate-preview/202602/wdscHrBmR8VPVpQgVhkbN.mp4',
          error: undefined as { message: string } | undefined,
          finishedAt: new Date(aiLog.startedAt.getTime() + elapsed),
        }
      }
      return {
        ...base,
        status: TaskStatus.InProgress,
        videoUrl: undefined as string | undefined,
        error: undefined as { message: string } | undefined,
        finishedAt: undefined as Date | undefined,
      }
    }

    if (aiLog.status === AiLogStatus.Generating) {
      return {
        ...base,
        status: TaskStatus.InProgress,
        videoUrl: undefined as string | undefined,
        error: undefined as { message: string } | undefined,
        finishedAt: undefined as Date | undefined,
      }
    }

    if (!aiLog.response) {
      throw new AppException(ResponseCode.InvalidAiTaskId)
    }

    const finishedAt = aiLog.duration
      ? new Date(aiLog.startedAt.getTime() + aiLog.duration)
      : undefined

    const channelResult = this.getChannelTaskResult(aiLog)

    return {
      ...base,
      ...channelResult,
      finishedAt,
    }
  }

  private getChannelTaskResult(aiLog: AiLog) {
    switch (aiLog.channel) {
      case AiLogChannel.Volcengine:
        return this.volcengineVideoService.getTaskResult(aiLog.response as unknown as GetVideoGenerationTaskResponse)
      case AiLogChannel.OpenAI:
        return this.openaiVideoService.getTaskResult(aiLog.response as unknown as OpenAIVideoCallbackDto)
      case AiLogChannel.Grok:
        return this.grokVideoService.getTaskResult(aiLog.response as unknown as GrokVideoCallbackDto)
      case AiLogChannel.Gemini:
        return this.geminiVideoService.getTaskResult(aiLog.response as unknown as GeminiVeoVideoCallbackDto)
      default:
        throw new AppException(ResponseCode.InvalidAiTaskId)
    }
  }

  /**
   * 查询视频任务状态
   */
  async getVideoTaskStatus(request: UserVideoTaskQueryDto) {
    const { taskId } = request

    const aiLog = await this.aiLogRepo.getById(taskId)

    if (aiLog == null || aiLog.type !== AiLogType.Video) {
      throw new AppException(ResponseCode.InvalidAiTaskId)
    }
    return this.transformToCommonResponse(aiLog)
  }

  async listVideoTasks(request: UserListVideoTasksQueryDto) {
    const [aiLogs, count] = await this.aiLogRepo.listWithPagination({
      ...request,
      type: AiLogType.Video,
    })

    return [await Promise.all(aiLogs.map(log => this.transformToCommonResponse(log))), count] as const
  }

  /**
   * 获取视频生成模型参数
   */
  async getVideoGenerationModelParams(_data: VideoGenerationModelsQueryDto) {
    return this.modelsConfigService.config.video.generation
  }
}
