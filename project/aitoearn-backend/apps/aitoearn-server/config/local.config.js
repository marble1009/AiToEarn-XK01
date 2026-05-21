/**
 * Local Development Configuration
 *
 * 说明：本文件供本地开发使用 (pnpm nx serve aitoearn-server)
 * 从环境变量读取敏感信息，请配合项目根目录的 .env.local 使用
 *
 * 启动前请确保：
 *   1. MongoDB 和 Redis 已运行（可通过 docker-compose up mongodb redis 启动）
 *   2. .env.local 中已填写必要的密钥
 */

const {
  REDIS_HOST = 'localhost',
  REDIS_PORT = '6380',
  REDIS_PASSWORD = 'password',
} = process.env

const {
  MONGODB_HOST = 'localhost',
  MONGODB_PORT = '27018',
  MONGODB_USERNAME = 'admin',
  MONGODB_PASSWORD = 'password',
  MONGODB_URI,
} = process.env

const {
  ASSETS_CONFIG,
} = process.env

const {
  AI_URL = 'http://localhost:3010',
} = process.env

const {
  JWT_SECRET = 'change-this-jwt-secret',
  INTERNAL_TOKEN = 'change-this-secret-token',
} = process.env

const {
  NODE_ENV = 'development',
  APP_DOMAIN = 'localhost',
} = process.env

const {
  MAIL_USER = '',
  MAIL_PASS = '',
  MAIL_HOST = 'email-smtp.ap-southeast-1.amazonaws.com',
  MAIL_PORT = '587',
} = process.env

const {
  BILIBILI_CLIENT_ID = '',
  BILIBILI_CLIENT_SECRET = '',
  GOOGLE_CLIENT_ID = '',
  GOOGLE_CLIENT_SECRET = '',
  KWAI_CLIENT_ID = '',
  KWAI_CLIENT_SECRET = '',
  PINTEREST_CLIENT_ID = '',
  PINTEREST_CLIENT_SECRET = '',
  PINTEREST_TEST_AUTHORIZATION = '',
  TIKTOK_CLIENT_ID = '',
  TIKTOK_CLIENT_SECRET = '',
  TWITTER_CLIENT_ID = '',
  TWITTER_CLIENT_SECRET = '',
  FACEBOOK_CLIENT_ID = '',
  FACEBOOK_CLIENT_SECRET = '',
  FACEBOOK_CONFIG_ID = '',
  THREADS_CLIENT_ID = '',
  THREADS_CLIENT_SECRET = '',
  INSTAGRAM_CLIENT_ID = '',
  INSTAGRAM_CLIENT_SECRET = '',
  LINKEDIN_CLIENT_ID = '',
  LINKEDIN_CLIENT_SECRET = '',
  YOUTUBE_CLIENT_ID = '',
  YOUTUBE_CLIENT_SECRET = '',
  WXPLAT_APP_ID = '',
  WXPLAT_APP_SECRET = '',
  WXPLAT_ENCODING_AES_KEY = '',
  DOYIN_CLIENT_ID = '',
  DOYIN_CLIENT_SECRET = '',
} = process.env

const {
  ALI_SMS_ACCESS_KEY_ID = '',
  ALI_SMS_ACCESS_KEY_SECRET = '',
  ALI_SMS_SIGN_NAME = '',
  ALI_SMS_TEMPLATE_CODE = '',
} = process.env

const {
  RELAY_SERVER_URL = '',
  RELAY_API_KEY = '',
  RELAY_CALLBACK_URL = '',
} = process.env

module.exports = {
  // 应用基础
  appDomain: APP_DOMAIN,
  port: 3002,
  environment: NODE_ENV,
  enableBadRequestDetails: true,

  // 认证
  auth: {
    secret: JWT_SECRET,
    internalToken: INTERNAL_TOKEN,
  },

  // 日志
  logger: {
    console: {
      enable: true,
      level: 'debug',
      pretty: true,
    },
  },

  // 数据库 - 默认连接 docker-compose 中的 MongoDB（映射到 27018）
  mongodb: {
    uri: MONGODB_URI || `mongodb://${MONGODB_USERNAME}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_HOST}:${MONGODB_PORT}/?authSource=admin&directConnection=true`,
    dbName: 'aitoearn',
  },

  // 缓存/队列 - 默认连接 docker-compose 中的 Redis（映射到 6380）
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

  // Channel 配置
  channel: {
    channelDb: {
      uri: MONGODB_URI || `mongodb://${MONGODB_USERNAME}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_HOST}:${MONGODB_PORT}/?authSource=admin&directConnection=true`,
      dbName: 'aitoearn_channel',
    },
    moreApi: {
      platApiUri: 'https://platapi.yikart.cn',
      xhsCreatorUri: 'http://39.106.41.190:7008',
    },
    shortLink: {
      baseUrl: `https://${APP_DOMAIN}/api/shortLink/`,
    },
    bilibili: {
      id: BILIBILI_CLIENT_ID,
      secret: BILIBILI_CLIENT_SECRET,
      authBackHost: `https://${APP_DOMAIN}/api/plat/bilibili/auth/back`,
    },
    google: {
      id: GOOGLE_CLIENT_ID,
      secret: GOOGLE_CLIENT_SECRET,
      authBackHost: '',
    },
    googleBusiness: {
      clientId: '',
      clientSecret: '',
      redirectUri: `https://${APP_DOMAIN}/api/plat/google-business/auth/callback`,
    },
    kwai: {
      id: KWAI_CLIENT_ID,
      secret: KWAI_CLIENT_SECRET,
      authBackHost: `https://${APP_DOMAIN}/api/plat/kwai/auth/back`,
    },
    pinterest: {
      id: PINTEREST_CLIENT_ID,
      secret: PINTEREST_CLIENT_SECRET,
      authBackHost: `https://${APP_DOMAIN}/api/plat/pinterest/authWebhook`,
      baseUrl: 'https://api.pinterest.com',
      test_authorization: PINTEREST_TEST_AUTHORIZATION,
    },
    tiktok: {
      clientId: TIKTOK_CLIENT_ID,
      clientSecret: TIKTOK_CLIENT_SECRET,
      redirectUri: `https://${APP_DOMAIN}/api/plat/tiktok/auth/back`,
      promotionRedirectUri: `https://${APP_DOMAIN}/api/plat/tiktok/auth/redirect`,
      scopes: [
        'user.info.basic',
        'user.info.profile',
        'video.upload',
        'video.publish',
      ],
      promotionBaseUrl: `https://${APP_DOMAIN}/promo`,
    },
    twitter: {
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
      redirectUri: `https://${APP_DOMAIN}/api/plat/twitter/auth/back`,
    },
    oauth: {
      facebook: {
        clientId: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        configId: FACEBOOK_CONFIG_ID,
        redirectUri: `https://${APP_DOMAIN}/api/plat/meta/auth/back`,
        scopes: [
          'public_profile',
          'pages_show_list',
          'pages_manage_posts',
          'pages_read_engagement',
          'pages_read_user_content',
          'pages_manage_engagement',
          'read_insights',
        ],
      },
      threads: {
        clientId: THREADS_CLIENT_ID,
        clientSecret: THREADS_CLIENT_SECRET,
        redirectUri: `https://${APP_DOMAIN}/api/plat/meta/auth/back`,
        scopes: [
          'threads_basic',
          'threads_content_publish',
          'threads_read_replies',
          'threads_manage_replies',
          'threads_manage_insights',
          'threads_location_tagging',
        ],
      },
      instagram: {
        clientId: INSTAGRAM_CLIENT_ID,
        clientSecret: INSTAGRAM_CLIENT_SECRET,
        redirectUri: `https://${APP_DOMAIN}/api/plat/meta/auth/back`,
        promotionRedirectUri: `https://${APP_DOMAIN}/api/plat/meta/auth/redirect`,
        promotionBaseUrl: `https://${APP_DOMAIN}/promo`,
        scopes: [
          'instagram_business_basic',
          'instagram_business_manage_comments',
          'instagram_business_content_publish',
        ],
      },
      linkedin: {
        clientId: LINKEDIN_CLIENT_ID,
        clientSecret: LINKEDIN_CLIENT_SECRET,
        redirectUri: `https://${APP_DOMAIN}/api/plat/meta/auth/back`,
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
      },
    },
    wxPlat: {
      id: WXPLAT_APP_ID,
      secret: WXPLAT_APP_SECRET,
      token: 'aitoearn',
      encodingAESKey: WXPLAT_ENCODING_AES_KEY,
      authBackHost: `https://${APP_DOMAIN}/platcallback`,
    },
    myWxPlat: {
      id: 'dev',
      secret: 'f1a36f23d027c969d6c6969423d72eda',
      hostUrl: `https://wxplat.${APP_DOMAIN}`,
    },
    youtube: {
      id: YOUTUBE_CLIENT_ID,
      secret: YOUTUBE_CLIENT_SECRET,
      authBackHost: `https://${APP_DOMAIN}/api/plat/youtube/auth/callback`,
    },
    douyin: {
      id: DOYIN_CLIENT_ID,
      secret: DOYIN_CLIENT_SECRET,
      authBackHost: `https://${APP_DOMAIN}/api/plat/douyin/auth/back`,
    },
  },

  // 邮件服务
  mail: {
    transport: {
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    },
    defaults: {
      from: MAIL_USER || 'noreply@tx.aitoearn.ai',
    },
  },

  // 阿里云短信
  aliSms: {
    accessKeyId: ALI_SMS_ACCESS_KEY_ID,
    accessKeySecret: ALI_SMS_ACCESS_KEY_SECRET,
    signName: ALI_SMS_SIGN_NAME,
    templateCode: ALI_SMS_TEMPLATE_CODE,
  },

  // 文件存储
  assets: ASSETS_CONFIG ? JSON.parse(ASSETS_CONFIG) : {
    provider: 's3',
    region: 'us-east-1',
    bucketName: 'aitoearn',
    endpoint: 'http://localhost:9001',
    publicEndpoint: 'http://localhost:9001',
    cdnEndpoint: 'http://localhost:8080/oss',
    accessKeyId: 'rustfsadmin',
    secretAccessKey: 'rustfsadmin',
    forcePathStyle: true,
  },

  // AI 服务
  aiClient: {
    baseUrl: AI_URL,
    token: INTERNAL_TOKEN,
  },

  // 队列并发
  queueConcurrency: {
    publish: Number(process.env.QUEUE_CONCURRENCY_PUBLISH) || 3,
  },

  // 积分
  credits: {
    registerBonus: 50,
  },

  // 中转服务（可选）
  ...(RELAY_SERVER_URL && RELAY_API_KEY
    ? {
        relay: {
          serverUrl: RELAY_SERVER_URL,
          apiKey: RELAY_API_KEY,
          callbackUrl: RELAY_CALLBACK_URL,
        },
      }
    : {}),
}
