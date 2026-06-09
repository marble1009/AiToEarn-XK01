import { Injectable, Logger } from '@nestjs/common'
import { FileUtil } from '@yikart/common'
import { config } from '../../../../config'
import {
  WanxiangAsyncImageTaskRequest,
  WanxiangAsyncTaskResponse,
  WanxiangImageGenerationRequest,
  WanxiangImageGenerationResponse,
  WanxiangVideoGenerationRequest,
  WanxiangVideoTaskResponse,
} from './wanxiang.interface'

/**
 * 阿里百炼 Wanxiang 通道服务
 *
 * 路由：
 *  - 文本生成：走 openaiService（默认 baseUrl = minimax-M3 网关）
 *  - 图像生成 / 视频生成 / 异步图像任务：走 WanxiangService（本类）
 *  - 视频编辑 / 短剧解说：走 VolcengineService
 *
 * 鉴权：所有请求使用 config.ai.dashscope.apiKey，
 *       不复用 openai.apiKey，避免单 Key 多用导致限流或泄漏。
 */
@Injectable()
export class WanxiangService {
  private readonly logger = new Logger(WanxiangService.name)
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = config.ai.dashscope.baseUrl.replace(/\/+$/, '')
    this.apiKey = config.ai.dashscope.apiKey
  }

  private get authHeader(): string {
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY 未配置，无法调用阿里百炼 Wanxiang 通道')
    }
    return `Bearer ${this.apiKey}`
  }

  /**
   * 万相 2.7 文生图 / 图生图（同步）
   * POST {baseUrl}/services/aigc/multimodal-generation/generation
   */
  async generateImage(req: WanxiangImageGenerationRequest): Promise<WanxiangImageGenerationResponse> {
    const contentList: any[] = [{ text: req.prompt }]
    if (req.imageUrls?.length) {
      for (const url of req.imageUrls) {
        contentList.push({ image: FileUtil.buildUrl(url) })
      }
    }
    const body = {
      model: req.model,
      input: { messages: [{ role: 'user', content: contentList }] },
      parameters: {
        ...(req.size ? { size: req.size.replace('x', '*') } : {}),
        ...(req.negativePrompt ? { negative_prompt: req.negativePrompt } : {}),
        ...(req.seed ? { seed: req.seed } : {}),
        n: req.n ?? 1,
      },
    }

    const url = `${this.baseUrl}/services/aigc/multimodal-generation/generation`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Wanxiang image generation failed: ${res.status} ${text}`)
    }
    const json = await res.json() as any
    if (json?.code && json.code !== 'OK') {
      throw new Error(`Wanxiang API error: ${json.message || 'unknown'}`)
    }

    const data: { url?: string, b64_json?: string }[] = []
    const choices = json?.output?.choices || []
    for (const choice of choices) {
      for (const item of choice.message?.content || []) {
        if (item.type === 'image' && item.image) {
          if (req.responseFormat === 'b64_json') {
            // 阿里返回的是 URL，要 b64_json 时由调用方自己下载转换
            data.push({ url: item.image })
          }
          else {
            data.push({ url: item.image })
          }
        }
      }
    }

    return {
      created: Math.floor(Date.now() / 1000),
      data,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    }
  }

  /**
   * 异步图像任务：背景生成 / 虚拟模特
   * POST {baseUrl}/services/aigc/background-generation/generation/
   * POST {baseUrl}/services/aigc/virtualmodel/generation
   */
  async submitAsyncImageTask(req: WanxiangAsyncImageTaskRequest): Promise<WanxiangAsyncTaskResponse> {
    let url = ''
    const input: any = { base_image_url: req.baseImageUrl }
    const parameters: any = { n: req.n ?? 1 }

    if (req.model === 'wanx-background-generation-v2') {
      url = `${this.baseUrl}/services/aigc/background-generation/generation/`
      input.ref_prompt = req.prompt
      parameters.model_version = 'v2'
    }
    else if (req.model === 'virtualmodel-v2') {
      url = `${this.baseUrl}/services/aigc/virtualmodel/generation`
      input.mask_image_url = req.maskImageUrl
      input.prompt = req.prompt
      input.face_prompt = req.facePrompt || 'highly detailed, professional fashion model face'
    }
    else {
      throw new Error(`Unsupported async image model: ${req.model}`)
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({ model: req.model, input, parameters }),
    })

    if (!res.ok) {
      throw new Error(`Wanxiang async image submit failed: ${res.status} ${await res.text()}`)
    }
    const json = await res.json() as any
    if (json?.code && json.code !== 'OK') {
      throw new Error(`Wanxiang API error: ${json.message}`)
    }
    const taskId = json?.output?.task_id || json?.request_id
    if (!taskId) throw new Error('Wanxiang did not return task_id')

    return { taskId, status: 'pending' }
  }

  /**
   * 轮询异步任务（图像/视频共用）
   * GET {baseUrl}/tasks/{task_id}
   */
  async pollTask(taskId: string): Promise<WanxiangAsyncTaskResponse> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: this.authHeader },
    })
    if (!res.ok) {
      throw new Error(`Wanxiang pollTask failed: ${res.status}`)
    }
    const json = await res.json() as any
    const status = json?.output?.task_status as string | undefined

    if (status === 'SUCCEEDED') {
      const urls: string[] = []
      const out = json.output || {}
      if (Array.isArray(out.results)) {
        for (const r of out.results) if (r.url) urls.push(r.url)
      }
      if (out.video_url) urls.push(out.video_url)
      return { taskId, status: 'succeeded', imageUrls: urls }
    }
    if (status === 'FAILED') {
      return {
        taskId,
        status: 'failed',
        error: json.output?.message || json.message || 'unknown error',
      }
    }
    return { taskId, status: 'running' }
  }

  /**
   * 万相视频生成（异步）
   * POST {baseUrl}/services/aigc/video-generation/video-synthesis
   */
  async generateVideo(req: WanxiangVideoGenerationRequest): Promise<WanxiangVideoTaskResponse> {
    const isWan27 = req.model?.startsWith('wan2.7')
    const isR2V = req.model === 'wan2.7-r2v'

    const input: any = { prompt: req.prompt }
    if (isR2V) {
      const media: any[] = []
      for (const url of req.imageUrls || []) media.push({ type: 'reference_image', url })
      for (const url of req.videoUrls || []) media.push({ type: 'reference_video', url })
      if (media.length) input.media = media
    }
    else if (req.firstFrameImageUrl) {
      if (isWan27) {
        input.media = [{ type: 'first_frame', url: req.firstFrameImageUrl }]
      }
      else {
        input.image_url = req.firstFrameImageUrl
      }
    }

    const parameters: any = {}
    if (isWan27) {
      let resolution = '720P'
      if (req.size?.toLowerCase().includes('1080')) resolution = '1080P'
      parameters.resolution = resolution

      let ratio = '9:16'
      if (req.size) {
        if (req.size.includes('16:9') || req.size.includes('1280x720') || req.size.includes('1920x1080')) ratio = '16:9'
        else if (req.size.includes('9:16') || req.size.includes('720x1280') || req.size.includes('1080x1920')) ratio = '9:16'
        else if (req.size.includes('1:1') || req.size.includes('1024x1024')) ratio = '1:1'
      }
      parameters.ratio = ratio

      const d = req.seconds ?? 5
      parameters.duration = d >= 2 && d <= 15 ? d : 5
    }
    else {
      // wanx2.1 等老模型
      let sizeStr = '1280*720'
      if (req.size) {
        if (req.size.startsWith('720') || req.size.startsWith('1080')) sizeStr = req.size.replace('x', '*')
        else if (req.size.startsWith('1792') || req.size.startsWith('1280x720')) sizeStr = '1280*720'
        else sizeStr = req.size.replace('x', '*')
      }
      parameters.size = sizeStr
    }

    const url = `${this.baseUrl}/services/aigc/video-generation/video-synthesis`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({ model: req.model, input, parameters }),
    })

    if (!res.ok) {
      throw new Error(`Wanxiang video submit failed: ${res.status} ${await res.text()}`)
    }
    const json = await res.json() as any
    if (json?.code && json.code !== 'OK') {
      throw new Error(`Wanxiang API error: ${json.message}`)
    }
    const taskId = json?.output?.task_id || json?.request_id
    if (!taskId) throw new Error('Wanxiang did not return task_id')

    return {
      id: taskId,
      status: 'in_progress',
      created_at: Math.floor(Date.now() / 1000),
    }
  }

  /**
   * 视频任务状态查询
   */
  async retrieveVideo(taskId: string): Promise<WanxiangVideoTaskResponse> {
    const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: this.authHeader },
    })
    if (!res.ok) {
      throw new Error(`Wanxiang video retrieve failed: ${res.status}`)
    }
    const json = await res.json() as any
    const status = json?.output?.task_status as string | undefined
    if (status === 'SUCCEEDED') {
      const url = json.output?.video_url || ''
      return {
        id: taskId,
        status: 'completed',
        url,
        video_url: url,
        created_at: Math.floor(Date.now() / 1000),
        completed_at: Math.floor(Date.now() / 1000),
      }
    }
    if (status === 'FAILED') {
      return {
        id: taskId,
        status: 'failed',
        error: { code: -1, message: json.output?.message || json.message || 'unknown' },
      }
    }
    return { id: taskId, status: 'in_progress', created_at: Math.floor(Date.now() / 1000) }
  }
}
