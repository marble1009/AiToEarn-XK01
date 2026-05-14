import { createZodDto } from '@yikart/common'
import { z } from 'zod'

export const nvidiaConfigSchema = z.object({
  apiKey: z.string().describe('NVIDIA API Key'),
  baseUrl: z.string().default('https://integrate.api.nvidia.com/v1').describe('NVIDIA Base URL'),
  timeout: z.number().default(300 * 1000),
})

export class NvidiaConfig extends createZodDto(nvidiaConfigSchema) {}
