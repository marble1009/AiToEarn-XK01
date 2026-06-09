import { join } from 'node:path'
import { startApplication } from '@yikart/common'
import { AppModule } from './app.module'
import { config } from './config'

/**
 * CORS 白名单：
 * 1. APP_DOMAIN（如 aiautoedit.art）：正式主域
 * 2. aitoearn.cn / aitoearn.ai：保留兼容的国内外区域域名
 * 3. localhost / 127.0.0.1：本地开发
 * 4. CORS_EXTRA_ORIGINS：环境变量，逗号分隔，用于临时放行内网/预览环境
 */
const defaultOrigins = [
  'https://aiautoedit.art',
  'https://www.aiautoedit.art',
  'https://aitoearn.cn',
  'https://aitoearn.ai',
  'http://localhost:3000',
  'http://localhost:6060',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:6060',
]

if (config.appDomain) {
  defaultOrigins.push(`https://${config.appDomain}`)
  defaultOrigins.push(`https://www.${config.appDomain}`)
}

const extraOrigins = (process.env.CORS_EXTRA_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...extraOrigins]))

startApplication(AppModule, config, {
  setupApp: (app) => {
    app.enableCors({
      origin: (origin, callback) => {
        // 同源请求（curl/服务间调用）不携带 Origin，直接放行
        if (!origin) {
          return callback(null, true)
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(new Error(`CORS blocked: ${origin}`), false)
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization, x-request-id',
    })

    app.setViewEngine('ejs')
    app.setBaseViewsDir(join(__dirname, 'views'))
    app.useStaticAssets(join(__dirname, 'public'))
  },
})
