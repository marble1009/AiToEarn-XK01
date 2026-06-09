import { Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { GrokConfig } from './grok.config'
import {
  GrokCreateVideoRequest,
  GrokCreateVideoResponse,
  GrokEditVideoRequest,
  GrokGetVideoStatusResponse,
  GrokVideoTaskStatus,
} from './grok.interface'

@Injectable()
export class GrokLibService {
  private readonly logger = new Logger(GrokLibService.name)
  private readonly httpClient: AxiosInstance

  constructor(
    private readonly config: GrokConfig,
  ) {
    this.httpClient = this._createHttpClient()
  }

  private _createHttpClient(): AxiosInstance {
    // 使用 process.env.OPENAI_API_KEY (MiniMax 密钥) 作为 API Key
    const apiKey = process.env['OPENAI_API_KEY'] || this.config.apiKey
    return axios.create({
      baseURL: 'https://api.minimaxi.com',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    })
  }

  async createVideo(request: GrokCreateVideoRequest): Promise<GrokCreateVideoResponse> {
    this.logger.log({ path: '--------MiniMax Video Generation Request----------', request })
    const payload = {
      model: 'MiniMax-Hailuo-2.3',
      prompt: request.prompt,
      ...(request.image?.url ? { first_frame_image: request.image.url } : {}),
    }

    const response: AxiosResponse<{ task_id: string }> = await this.httpClient.post(
      '/v1/video_generation',
      payload,
    )

    this.logger.log({ path: '--------MiniMax Video Generation Success----------', data: response.data })
    return {
      request_id: response.data.task_id,
    }
  }

  async editVideo(request: GrokEditVideoRequest): Promise<GrokCreateVideoResponse> {
    this.logger.log({ path: '--------MiniMax Video Edit Request----------', request })
    // MiniMax uses first_frame_image as reference for video generation as edit fallback
    const payload = {
      model: 'MiniMax-Hailuo-2.3',
      prompt: request.prompt,
      first_frame_image: request.video.url, // Using first frame image as fallback edit
    }

    const response: AxiosResponse<{ task_id: string }> = await this.httpClient.post(
      '/v1/video_generation',
      payload,
    )
    return {
      request_id: response.data.task_id,
    }
  }

  async getVideoStatus(requestId: string): Promise<GrokGetVideoStatusResponse> {
    this.logger.log({ path: '--------MiniMax Video Status Query----------', requestId })
    
    // 1. 查询任务状态
    const statusResponse: AxiosResponse<{ status: string; file_id?: string }> = await this.httpClient.get(
      `/v1/query/video_generation?task_id=${requestId}`,
    )

    const statusData = statusResponse.data
    this.logger.log({ path: '--------MiniMax Video Status Response----------', data: statusData })

    if (statusData.status === 'Success') {
      if (!statusData.file_id) {
        return {
          request_id: requestId,
          status: GrokVideoTaskStatus.Failed,
          error: {
            code: 'MISSING_FILE_ID',
            message: 'Video generation succeeded but file_id is missing',
          },
        }
      }

      // 2. 通过 file_id 获取真实下载链接
      const retrieveResponse: AxiosResponse<{ file?: { download_url: string } }> = await this.httpClient.get(
        `/v1/files/retrieve?file_id=${statusData.file_id}`,
      )

      const retrieveData = retrieveResponse.data
      this.logger.log({ path: '--------MiniMax Video Retrieve Response----------', data: retrieveData })

      if (retrieveData.file?.download_url) {
        return {
          request_id: requestId,
          status: GrokVideoTaskStatus.Done,
          video: {
            url: retrieveData.file.download_url,
            duration: 8,
            respect_moderation: true,
          },
        }
      }

      return {
        request_id: requestId,
        status: GrokVideoTaskStatus.Failed,
        error: {
          code: 'MISSING_DOWNLOAD_URL',
          message: 'Failed to retrieve video download URL',
        },
      }
    }

    if (statusData.status === 'Fail') {
      const statusMsg = (statusData as any).base_resp?.status_msg || ''
      const isSensitive = statusMsg.includes('sensitive')
      const message = isSensitive
        ? '提示词或参考图片包含敏感/违规内容，已触发 MiniMax 内容安全拦截'
        : (statusMsg || 'MiniMax rendering failed')

      return {
        request_id: requestId,
        status: GrokVideoTaskStatus.Failed,
        error: {
          code: 'GENERATION_FAILED',
          message,
        },
      }
    }

    // Pending / Queueing / Processing
    return {
      request_id: requestId,
      status: GrokVideoTaskStatus.Pending,
    }
  }
}
