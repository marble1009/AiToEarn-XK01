import { AIMessageChunk, BaseMessage } from '@langchain/core/messages'
import { ChatOpenAI, OpenAIChatInput } from '@langchain/openai'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '../../../../config'
import OpenAI from 'openai'
import { OpenaiConfig } from './openai.config'
import { SoraCharacterResponse, SoraCreateCharacterRequest } from './openai.interface'

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name)
  private readonly openAI: OpenAI
  private readonly chatOpenAI: ChatOpenAI

  constructor(
    public readonly config: OpenaiConfig,
  ) {
    this.openAI = this._createOpenAIClient()
    this.chatOpenAI = this._createChatModel({})
  }

  private _createOpenAIClient(): OpenAI {
    return new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    })
  }

  /**
   * 文本 ChatOpenAI 客户端
   *
   * 重要：模型名由调用方（chat.service / proxyChatStream）显式传入，本方法**不再做**
   * 任何 baseUrl 推断或模型重写。原本会把 baseUrl 含 dashscope 的 GPT/MiniMax 系列
   * 改写为 qwen-plus 的逻辑已删除 —— 因为按 aiautoedit 当前架构，文本通道应
   * 单独指向 minimax（通过 OPENAI_BASE_URL 或 MINIMAX_BASE_URL），不应再走阿里百炼。
   */
  private _createChatModel(options: Partial<OpenAIChatInput>): ChatOpenAI {
    const modelName = options.model || 'MiniMax/MiniMax-M3'
    return new ChatOpenAI({
      ...options,
      model: modelName,
      maxRetries: 1,
      timeout: options.timeout ?? this.config.timeout,
      apiKey: options.apiKey ?? this.config.apiKey,
      configuration: {
        baseURL: this.config.baseUrl,
      },
      streaming: true,
    })
  }

  async createChatCompletionStream(options: Partial<OpenAIChatInput> & {
    model: string
    messages: BaseMessage[]
  }) {
    const {
      messages,
    } = options

    let modelName = options.model || 'MiniMax/MiniMax-M3'
    if (modelName === 'gpt-5.1-all' || modelName === 'gpt-5' || modelName.includes('gpt-') || modelName === 'abab6.5g-chat') {
      modelName = 'MiniMax/MiniMax-M3'
    }

    const finalOptions = {
      ...options,
      model: modelName,
    }

    const chatModel = this._createChatModel(finalOptions)
    return await chatModel.stream(messages, finalOptions)
  }

  async createRawStream(options: OpenAI.Chat.ChatCompletionCreateParamsStreaming) {
    // 注意：原本的 dashscope → qwen-plus 重写已移除。
    // 文本通道应在配置层就指向 minimax-M3 网关（OPENAI_BASE_URL / MINIMAX_BASE_URL），
    // 模型名按调用方传入原样使用。
    const modelName = options.model || 'MiniMax/MiniMax-M3'
    return this.openAI.chat.completions.create({
      ...options,
      model: modelName,
    })
  }

  /**
   * 文本生成（chat completion）
   *
   * 行为变化（2026-06-07 路由修复）：
   * 1) 删除基于 baseUrl 字符串匹配的模型重写（dashscope → qwen-plus 强制重写）
   * 2) 删除硬编码的 deepseek 兜底（曾含生产密钥 `sk-0158c32f62b7489c9c6550695c159b3f`）
   * 3) 新的兜底策略：仅在配置了 DEEPSEEK_API_KEY 时启用，且只在主通道失败时切换
   * 4) 主通道与兜底通道都用 config.ai.deepseek.* 配置，**禁止硬编码**
   */
  async createChatCompletion(options: Partial<OpenAIChatInput> & {
    model: string
    messages: BaseMessage[]
  }): Promise<AIMessageChunk> {
    try {
      const stream = await this.createChatCompletionStream(options)
      let result: AIMessageChunk | undefined
      for await (const chunk of stream) {
        if (result) {
          result = result.concat(chunk)
        }
        else {
          result = chunk
        }
      }
      return result!
    }
    catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error)
      this.logger.warn(`createChatCompletion failed: ${errMessage}`)

      // 兜底：仅在显式配置了 DEEPSEEK_API_KEY 时启动
      const deepseekApiKey = config.ai.deepseek?.apiKey
      const deepseekBaseUrl = config.ai.deepseek?.baseUrl || 'https://api.deepseek.com/v1'
      if (!deepseekApiKey) {
        throw error
      }

      const currentModel = options.model || 'MiniMax/MiniMax-M3'
      // 主通道已失败 → 切到 DeepSeek 兜底模型
      this.logger.log(`${currentModel} 失败，切到 DeepSeek 兜底 (${deepseekBaseUrl})...`)
      try {
        const fallbackModel = new ChatOpenAI({
          model: 'deepseek-chat',
          apiKey: deepseekApiKey,
          configuration: { baseURL: deepseekBaseUrl },
          maxRetries: 1,
          timeout: options.timeout ?? this.config.timeout,
          streaming: true,
        })
        const stream = await fallbackModel.stream(options.messages, options)
        let result: AIMessageChunk | undefined
        for await (const chunk of stream) {
          if (result) {
            result = result.concat(chunk)
          }
          else {
            result = chunk
          }
        }
        this.logger.log('DeepSeek 兜底成功')
        return result!
      }
      catch (dsError) {
        const dsErrMessage = dsError instanceof Error ? dsError.message : String(dsError)
        this.logger.error(`DeepSeek 兜底失败: ${dsErrMessage}`)
        throw dsError
      }
    }
  }

  /**
   * 图像生成
   *
   * 行为变化（2026-06-07 路由修复）：
   * 1) 删除基于 baseUrl 字符串匹配的 dashscope 图像分支
   * 2) 删除 minimax 图像分支（图像通道应统一走 WanxiangService / openai.images）
   * 3) 仅保留对 OpenAI 原生 gpt-image-1 / dall-e-* 的调用
   * 4) wan2.7-image* / wanx-* / virtualmodel 等阿里模型应在调用方
   *    （image.service.ts）显式路由到 WanxiangService
   */
  async createImageGeneration(options: Omit<OpenAI.Images.ImageGenerateParams, 'user' | 'stream'> & { imageUrls?: string[] }): Promise<OpenAI.Images.ImagesResponse> {
    return this.openAI.images.generate(options)
  }

  async createImageEdit(options: Omit<OpenAI.Images.ImageEditParams, 'user' | 'stream'>): Promise<OpenAI.Images.ImagesResponse> {
    return this.openAI.images.edit(options)
  }

  async createImageVariation(options: Omit<OpenAI.Images.ImageCreateVariationParams, 'user'>): Promise<OpenAI.Images.ImagesResponse> {
    return this.openAI.images.createVariation(options)
  }

  private normalizeVideoTimestamp(video: OpenAI.Videos.Video): OpenAI.Videos.Video {
    if (video.created_at > 10000000000) {
      return {
        ...video,
        created_at: Math.floor(video.created_at / 1000),
      }
    }
    return video
  }

  /**
   * 视频生成
   *
   * 行为变化（2026-06-07 路由修复）：
   * 1) 删除基于 baseUrl 字符串匹配的 dashscope 视频分支
   * 2) 删除 minimax 视频分支
   * 3) 仅保留对 OpenAI 原生 sora-* 视频模型的调用
   * 4) wan2.7-* / wanx2.1-* 等阿里模型应在调用方
   *    （video.service.ts）显式路由到 WanxiangService
   */
  async createVideo(params: OpenAI.VideoCreateParams & { imageUrls?: string[], videoUrls?: string[] }): Promise<OpenAI.Videos.Video> {
    const video = await this.openAI.videos.create(params)
    return this.normalizeVideoTimestamp(video)
  }

  /**
   * 视频任务状态查询
   *
   * 行为变化（2026-06-07 路由修复）：删除 dashscope/minimax 分支
   */
  async retrieveVideo(videoId: string): Promise<OpenAI.Videos.Video> {
    const video = await this.openAI.videos.retrieve(videoId)
    return this.normalizeVideoTimestamp(video)
  }

  async listVideos(params?: OpenAI.VideoListParams): Promise<OpenAI.Videos.VideosPage> {
    const result = await this.openAI.videos.list(params)
    result.data = result.data.map(video => this.normalizeVideoTimestamp(video))
    return result
  }

  async deleteVideo(videoId: string): Promise<OpenAI.Videos.VideoDeleteResponse> {
    return this.openAI.videos.delete(videoId)
  }

  async downloadVideoContent(videoId: string, variant?: 'video' | 'thumbnail' | 'spritesheet'): Promise<Response> {
    return this.openAI.videos.downloadContent(videoId, { variant })
  }

  async remixVideo(videoId: string, prompt: string): Promise<OpenAI.Videos.Video> {
    const video = await this.openAI.videos.remix(videoId, { prompt })
    return this.normalizeVideoTimestamp(video)
  }

  async createCharacter(params: SoraCreateCharacterRequest): Promise<SoraCharacterResponse> {
    const response = await this.openAI.videos.create(params as unknown as OpenAI.VideoCreateParams)
    return response as unknown as SoraCharacterResponse
  }

  async getCharacter(characterId: string): Promise<SoraCharacterResponse> {
    const response = await this.openAI.videos.retrieve(characterId)
    return response as unknown as SoraCharacterResponse
  }
}
