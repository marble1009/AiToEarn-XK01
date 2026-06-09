/**
 * aitoearn-ai 生产环境配置
 *
 * 用法：pnpm nx serve aitoearn-ai:prod
 * 行为：关闭 pretty 日志、降低日志级别
 */
const baseConfig = require('./config.js')

module.exports = {
  ...baseConfig,
  port: 3010,
  environment: 'production',
  logger: {
    console: {
      enable: true,
      level: 'info',
      pretty: false,
    },
  },
}
