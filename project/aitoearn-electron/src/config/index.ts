/**
 * aiautoedit 桌面端配置
 *
 * 启动时通过 Vite 环境变量注入，便于不同打包渠道切换：
 *   VITE_API_BASE_URL  - 后端 API 根地址
 *   VITE_IMAGE_CDN     - 图片 CDN 根地址
 *   VITE_APP_NAME      - 应用名（用于显示与上报）
 *
 * 缺省时按主域 aiautoedit.art 走，需要使用国内/国际兼容域或
 * 自托管时通过构建参数覆盖：
 *   pnpm build -- --mode production
 *   VITE_API_BASE_URL=https://api.aiautoedit.art pnpm build
 */
const env = import.meta.env

function envOrDefault(key: string, fallback: string): string {
  const value = env[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export const config = {
  appName: envOrDefault('VITE_APP_NAME', 'aiautoedit'),
  apiBaseURL: envOrDefault('VITE_API_BASE_URL', 'https://aiautoedit.art/api'),
  imageCDN: envOrDefault('VITE_IMAGE_CDN', 'https://aiautoedit.art/oss'),
}

// 处理图片地址
export const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${config.imageCDN}/${path}`
}
