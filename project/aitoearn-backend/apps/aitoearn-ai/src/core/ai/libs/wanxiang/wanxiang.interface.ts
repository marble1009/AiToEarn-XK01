/**
 * 阿里百炼 Wanxiang 通道的请求/响应类型
 */

export interface WanxiangImageGenerationRequest {
  /** 模型名，如 wan2.7-image / wan2.7-image-pro */
  model: string
  prompt: string
  /** 文生图：可选尺寸 '1024x1024' | '1536x1024' | '1024x1536' | 'auto' */
  size?: string
  /** OpenAI 兼容输出格式 */
  responseFormat?: 'url' | 'b64_json'
  /** 参考图（图生图、编辑） */
  imageUrls?: string[]
  /** n 张数 */
  n?: number
  /** 负向提示词 */
  negativePrompt?: string
  /** 种子 */
  seed?: number
}

export interface WanxiangImageGenerationResponse {
  created: number
  data: { url?: string, b64_json?: string }[]
  usage?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }
}

export interface WanxiangAsyncImageTaskRequest {
  model: 'wanx-background-generation-v2' | 'virtualmodel-v2'
  /** 输入图 URL */
  baseImageUrl: string
  /** 蒙版图 URL（仅 virtualmodel） */
  maskImageUrl?: string
  /** 提示词 */
  prompt: string
  /** 面部提示词（仅 virtualmodel） */
  facePrompt?: string
  /** 输出张数 */
  n?: number
}

export interface WanxiangAsyncTaskResponse {
  taskId: string
  status: 'pending' | 'running' | 'succeeded' | 'failed'
  imageUrls?: string[]
  error?: string
}

export interface WanxiangVideoGenerationRequest {
  model: string
  prompt: string
  /** 图生视频时的首帧图 URL */
  firstFrameImageUrl?: string
  /** 参考视频（仅 wan2.7-r2v） */
  videoUrls?: string[]
  /** 参考图（仅 wan2.7-r2v） */
  imageUrls?: string[]
  /** 尺寸，如 '1280x720' / '720x1280' / '1920x1080' */
  size?: string
  /** 时长（秒）：2~15 */
  seconds?: number
  /** 是否走异步 */
  async?: boolean
}

export interface WanxiangVideoTaskResponse {
  id: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  url?: string
  video_url?: string
  created_at: number
  completed_at?: number
  error?: { code: number, message: string }
}
