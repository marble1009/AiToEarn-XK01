import { createZodDto } from '@yikart/common'
import { z } from 'zod'

/**
 * 阿里百炼 Wanxiang 通道配置
 * 用途：图片（wanx / virtualmodel / 背景生成）+ 视频（wan2.7-* / wanx2.1-*）
 * 与 openai.* 通道严格分离，禁止用 OPENAI_API_KEY 鉴权
 */
export const wanxiangConfigSchema = z.object({
  baseUrl: z.string().default('https://dashscope.aliyuncs.com/api/v1'),
  apiKey: z.string().describe('阿里百炼 DashScope API Key'),
  timeout: z.number().default(300 * 1000),
})

export class WanxiangConfig extends createZodDto(wanxiangConfigSchema) {}
