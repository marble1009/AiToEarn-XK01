/**
 * aitoearn-server 本地开发配置
 *
 * 用法：pnpm nx serve aitoearn-server:local
 */
const baseConfig = require('./config.js')

module.exports = {
  ...baseConfig,
  port: 3002,
  environment: 'development',
  enableBadRequestDetails: true,
  logger: {
    console: {
      enable: true,
      level: 'debug',
      pretty: true,
    },
  },
}
