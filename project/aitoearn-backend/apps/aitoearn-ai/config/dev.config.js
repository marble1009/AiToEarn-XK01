/**
 * aitoearn-ai 远程开发/预发环境配置
 *
 * 用法：pnpm nx serve aitoearn-ai:dev
 * 行为：与 local 相同，区别在于 CORS 与回调域名
 */
const baseConfig = require('./config.js')

module.exports = {
  ...baseConfig,
  port: 3010,
  environment: 'development',
  logger: {
    console: {
      enable: true,
      level: 'debug',
      pretty: true,
    },
  },
}
