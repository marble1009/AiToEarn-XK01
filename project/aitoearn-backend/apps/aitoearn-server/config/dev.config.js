/**
 * aitoearn-server 远程开发/预发环境配置
 *
 * 用法：pnpm nx serve aitoearn-server:dev
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
