/**
 * aitoearn-server 生产环境配置
 *
 * 用法：pnpm nx serve aitoearn-server:prod
 */
const baseConfig = require('./config.js')

module.exports = {
  ...baseConfig,
  port: 3002,
  environment: 'production',
  enableBadRequestDetails: false,
  logger: {
    console: {
      enable: true,
      level: 'info',
      pretty: false,
    },
  },
}
