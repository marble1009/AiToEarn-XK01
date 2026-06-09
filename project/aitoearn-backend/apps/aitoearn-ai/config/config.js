const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
} = process.env

const {
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_URI, // 新增
} = process.env

const {
  JWT_SECRET,
  INTERNAL_TOKEN,
} = process.env

const {
  VOLCENGINE_API_KEY,
  VOLCENGINE_ACCESS_KEY_ID,
  VOLCENGINE_SECRET_ACCESS_KEY,
  VOLCENGINE_VOD_SPACE_NAME,
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  ANTHROPIC_BASE_URL,
  ANTHROPIC_API_KEY,
  GROK_API_KEY,
  GEMINI_API_KEY,
  GEMINI_BASE_URL,
  AI_NVIDIA_API_KEY,
  // 文本生成（minimax-M3）专用配置 —— 与阿里百炼 Key 严格隔离
  MINIMAX_API_KEY,
  MINIMAX_BASE_URL,
  // 阿里百炼 Wanxiang 专用配置 —— 用于图片 / 视频生成
  DASHSCOPE_API_KEY,
  DASHSCOPE_BASE_URL,
  // 兜底：DeepSeek 文本兜底（可选，建议在主服务不可用时启用）
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
} = process.env

const {
  ASSETS_CONFIG,
} = process.env

const {
  GEMINI_KEY_PAIRS,
  GEMINI_LOCATION,
} = process.env

const {
  SERVER_URL,
} = process.env

function parseGeminiKeyPairs() {
  if (!GEMINI_KEY_PAIRS) {
    throw new Error('GEMINI_KEY_PAIRS 环境变量必须配置')
  }

  try {
    return JSON.parse(GEMINI_KEY_PAIRS)
  }
  catch (e) {
    console.error('解析 GEMINI_KEY_PAIRS 失败:', e)
    throw new Error('GEMINI_KEY_PAIRS 格式错误')
  }
}

module.exports = {
  port: 3010,
  logger: {
    console: {
      enable: true,
      level: 'debug',
      pretty: true,
    },
  },
  redis: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    username: 'default',
    password: REDIS_PASSWORD,
  },
  redlock: {
    redis: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
      username: 'default',
      password: REDIS_PASSWORD,
    },
  },
  mongodb: {
    uri: MONGODB_URI || `mongodb://${MONGODB_USERNAME}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_HOST}:${MONGODB_PORT}/?authSource=admin&directConnection=true`,
    dbName: 'aitoearn',
  },
  auth: {
    secret: JWT_SECRET,
    expiresIn: 7 * 24 * 60 * 60,
    internalToken: INTERNAL_TOKEN,
  },
  serverClient: {
    baseUrl: SERVER_URL,
    token: INTERNAL_TOKEN,
  },
  assets: JSON.parse(ASSETS_CONFIG),
  ai: {
    volcengine: {
      baseUrl: 'https://ark.cn-beijing.volces.com/',
      apiKey: VOLCENGINE_API_KEY,
      accessKeyId: VOLCENGINE_ACCESS_KEY_ID,
      secretAccessKey: VOLCENGINE_SECRET_ACCESS_KEY,
      spaceName: VOLCENGINE_VOD_SPACE_NAME,
      playbackBaseUrl: process.env.VOLCENGINE_PLAYBACK_BASE_URL || 'http://vod.assets.aitoearn.ai',
      urlAuthPrimaryKey: 'd8eea018341d4e9687ead69bea628271',
    },
    /**
     * 文本 / 关键词 / 文案 / 推理的默认通道：minimax-M3
     * 通过 OpenAI 兼容协议调用 minimax 网关，baseUrl 形如 https://api.minimaxi.com/v1
     * 历史包袱：旧版本曾用 OPENAI_API_KEY + dashscope baseUrl 同时跑文本和图像，
     *          导致文本被改写到 qwen-plus。新版本要求 OPENAI_* 与 MINIMAX_* 严格隔离。
     */
    openai: {
      baseUrl: OPENAI_BASE_URL || MINIMAX_BASE_URL || 'https://api.openai.com/v1',
      apiKey: OPENAI_API_KEY || MINIMAX_API_KEY,
    },
    /**
     * 阿里百炼 Wanxiang 通道：图片（wanx / virtualmodel）+ 视频（wan2.7 / wanx2.1）
     * 与 openai.* 严格分离，auth 走 DASHSCOPE_API_KEY。
     */
    dashscope: {
      baseUrl: DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
      apiKey: DASHSCOPE_API_KEY,
    },
    /**
     * minimax 单独配置（用于明确指定文本通道）。
     * 若同时设置 OPENAI_API_KEY 与 MINIMAX_API_KEY，以 MINIMAX_* 为准。
     */
    minimax: {
      baseUrl: MINIMAX_BASE_URL || 'https://api.minimaxi.com/v1',
      apiKey: MINIMAX_API_KEY,
    },
    /**
     * DeepSeek 兜底通道（可选）。
     * 主通道（minimax-M3）连续失败 N 次后启用，避免全部流量被熔断。
     */
    deepseek: {
      baseUrl: DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      apiKey: DEEPSEEK_API_KEY,
    },
    grok: {
      baseUrl: 'https://api.x.ai',
      apiKey: GROK_API_KEY,
    },
    anthropic: {
      baseUrl: ANTHROPIC_BASE_URL,
      apiKey: ANTHROPIC_API_KEY,
    },
    gemini: {
      keyPairs: parseGeminiKeyPairs(),
      location: GEMINI_LOCATION || 'us-central1',
      apiKey: GEMINI_API_KEY,
      baseUrl: GEMINI_BASE_URL,
    },
    nvidia: {
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: AI_NVIDIA_API_KEY || 'placeholder-key-for-nvidia',
    },
    aideo: {
      vCreative: {
        basePrice: 0,
      },
      vision: {
        basePrice: 0,
      },
      highlight: {
        basePrice: 0,
      },
      aiTranslation: {
        facialTranslation: 0,
      },
      erase: {
        basePrice: 0,
      },
      videoEdit: {
        basePrice: 0,
      },
      dramaRecap: {
        basePrice: 0,
      },
      styleTransfer: {
        basePrice: 0,
      },
    },
    models: {
      chat: [
        {
          name: 'MiniMax-M2.7',
          description: 'MiniMax M2.7',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'MiniMax-M2.5',
          description: 'MiniMax M2.5',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'gemini-3.1-pro-preview',
          description: 'Gemini 3.1 Pro Preview',
          inputModalities: ['text', 'image', 'audio', 'video'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                maxInputTokens: 200000,
                input: { text: '0', image: '0', video: '0', audio: '0' },
                output: { text: '0' },
              },
              {
                input: { text: '0', image: '0', video: '0', audio: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'gemini-3-flash-preview',
          description: 'Gemini 3 Flash Preview',
          inputModalities: ['text', 'image', 'audio', 'video'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0', video: '0', audio: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'gpt-5',
          description: 'GPT 5',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'gpt-5.1-all',
          description: 'GPT 5.1 All',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'gemini-3.1-flash-image-preview',
          description: 'Nano Banana 2',
          inputModalities: ['text', 'image'],
          outputModalities: ['image'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0', image: '0' },
              },
            ],
          },
        },
        {
          name: 'gemini-3-pro-image-preview',
          description: 'Nano Banana Pro',
          inputModalities: ['text', 'image'],
          outputModalities: ['image'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0', image: '0' },
              },
            ],
          },
        },
        {
          name: 'claude-opus-4-5-20251101',
          description: 'Claude Opus 4.5',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'claude-opus-4-6',
          description: 'Claude Opus 4.6',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'claude-sonnet-4-5-20250929',
          description: 'Claude Sonnet 4.5',
          inputModalities: ['text', 'image'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0', image: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
        {
          name: 'meta/llama-3.1-405b-instruct',
          description: 'Llama 3.1 405B (NVIDIA)',
          inputModalities: ['text'],
          outputModalities: ['text'],
          pricing: {
            tiers: [
              {
                input: { text: '0' },
                output: { text: '0' },
              },
            ],
          },
        },
      ],
      image: {
        generation: [
          {
            name: 'wan2.7-image',
            description: '阿里万相 2.7 标准版',
            sizes: ['1024x1024', '1536x1024', '1024x1536', 'auto'],
            qualities: ['high', 'medium', 'low'],
            styles: [],
            pricing: '0',
          },
          {
            name: 'wan2.7-image-pro',
            description: '阿里万相 2.7 专业版 (4K)',
            sizes: ['1024x1024', '1536x1024', '1024x1536', 'auto'],
            qualities: ['high', 'medium', 'low'],
            styles: [],
            pricing: '0',
          },
        ],
        edit: [
          {
            name: 'wan2.7-image',
            description: '阿里万相 2.7 图像编辑',
            sizes: ['1024x1024', '1536x1024', '1024x1536', 'auto'],
            qualities: ['high', 'medium', 'low'],
            styles: [],
            pricing: '0',
            maxInputImages: 16,
          },
          {
            name: 'wanx-background-generation-v2',
            description: '阿里万相 智能背景生成',
            sizes: ['auto'],
            qualities: ['high', 'medium', 'low'],
            styles: [],
            pricing: '0',
            maxInputImages: 2,
          },
          {
            name: 'virtualmodel-v2',
            description: '阿里万相 虚拟模特持物/试衣',
            sizes: ['auto'],
            qualities: ['high', 'medium', 'low'],
            styles: [],
            pricing: '0',
            maxInputImages: 2,
          },
        ],
      },
      video: {
        generation: [
          {
            name: 'wan2.7-t2v-2026-04-25',
            description: '阿里万相 2.7 文生视频-标准版',
            channel: 'openai',
            modes: ['text2video'],
            resolutions: ['720p', '1080p'],
            durations: [5, 10, 15],
            maxInputImages: 0,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 },
              { duration: 10, price: 0 },
              { duration: 15, price: 0 }
            ],
          },
          {
            name: 'wan2.7-i2v-2026-04-25',
            description: '阿里万相 2.7 图生视频-标准版',
            channel: 'openai',
            modes: ['image2video'],
            resolutions: ['720p', '1080p'],
            durations: [5, 10, 15],
            maxInputImages: 1,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 },
              { duration: 10, price: 0 },
              { duration: 15, price: 0 }
            ],
          },
          {
            name: 'wan2.7-r2v',
            description: '阿里万相 2.7 参考视频-角色音色一致',
            channel: 'dashscope',
            modes: ['reference2video'],
            resolutions: ['720p', '1080p'],
            durations: [5, 10, 15],
            maxInputImages: 5,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 },
              { duration: 10, price: 0 },
              { duration: 15, price: 0 }
            ],
          },
          {
            name: 'wanx2.1-t2v-plus',
            description: '阿里万相 2.1 文生视频-专业版',
            channel: 'dashscope',
            modes: ['text2video'],
            resolutions: ['720p'],
            durations: [5],
            maxInputImages: 0,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 }
            ],
          },
          {
            name: 'wanx2.1-t2v-turbo',
            description: '阿里万相 2.1 文生视频-极速版',
            channel: 'openai',
            modes: ['text2video'],
            resolutions: ['720p'],
            durations: [5],
            maxInputImages: 0,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 }
            ],
          },
          {
            name: 'wanx2.1-i2v-plus',
            description: '阿里万相 2.1 图生视频-专业版',
            channel: 'openai',
            modes: ['image2video'],
            resolutions: ['720p'],
            durations: [5],
            maxInputImages: 1,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 }
            ],
          },
          {
            name: 'wanx2.1-i2v-turbo',
            description: '阿里万相 2.1 图生视频-极速版',
            channel: 'dashscope',
            modes: ['image2video'],
            resolutions: ['720p'],
            durations: [5],
            maxInputImages: 1,
            aspectRatios: ['16:9', '9:16', '1:1'],
            defaults: {
              resolution: '720p',
              aspectRatio: '9:16',
              duration: 5,
            },
            pricing: [
              { duration: 5, price: 0 }
            ],
          },
        ],
      },
    },
    draftGeneration: {
      imageModels: [
        {
          model: 'wan2.7-image',
          displayName: '万相 2.7 标准版',
          supportedAspectRatios: ['1:1', '9:16', '16:9'],
          maxInputImages: 16,
          pricing: [
            { resolution: '1K', pricePerImage: 0 },
          ],
        },
        {
          model: 'wan2.7-image-pro',
          displayName: '万相 2.7 专业版 (4K)',
          supportedAspectRatios: ['1:1', '9:16', '16:9'],
          maxInputImages: 16,
          pricing: [
            { resolution: '1K', pricePerImage: 0 },
            { resolution: '2K', pricePerImage: 0 },
            { resolution: '4K', pricePerImage: 0 },
          ],
        },
      ],
    },
  },
  agent: {
    baseUrl: ANTHROPIC_BASE_URL || `${OPENAI_BASE_URL}/messages`,
    apiKey: ANTHROPIC_API_KEY || OPENAI_API_KEY,
  },
}
