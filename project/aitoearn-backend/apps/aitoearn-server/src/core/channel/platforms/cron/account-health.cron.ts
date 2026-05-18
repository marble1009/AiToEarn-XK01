import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AccountStatus } from '@yikart/mongodb'
import { AccountType, WithLoggerContext } from '@yikart/common'
import { AccountRepository } from '@yikart/mongodb'
import { PlatformBaseService } from '../base.service'

@Injectable()
export class AccountHealthCron {
  private readonly logger = new Logger(AccountHealthCron.name)

  constructor(
    private readonly accountRepository: AccountRepository,
    @Inject('CHANNEL_PROVIDERS')
    private readonly platformServices: Record<AccountType, PlatformBaseService>,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  @WithLoggerContext()
  async checkAllSweepAccountsHealth() {
    this.logger.log('🚀 Starting scheduled sweep accounts health check...')

    try {
      // 获取所有账号中状态为 NORMAL 的抖音和小红书扫码账号 (无中转代理且存在 Cookie)
      const accounts = await this.accountRepository.getAccountsByTypes([
        AccountType.Douyin,
        AccountType.Xhs,
      ])

      const sweepAccounts = accounts.filter(acc => !acc.relayAccountRef && acc.loginCookie)

      if (sweepAccounts.length === 0) {
        this.logger.log('No active sweep accounts (Douyin / Xiaohongshu) found to check.')
        return
      }

      this.logger.log(`Found ${sweepAccounts.length} sweep accounts to check. Checking cookie validities...`)

      for (const account of sweepAccounts) {
        const platformType = account.type as AccountType
        const svc = this.platformServices[platformType]
        if (!svc) {
          continue
        }

        const accountId = account._id.toString()
        const isHealthy = await svc.checkCookieHealth(accountId)

        const oldStatus = account.status
        const newStatus = isHealthy ? AccountStatus.NORMAL : AccountStatus.ABNORMAL

        if (oldStatus !== newStatus) {
          this.logger.warn(
            `[Health Cron] Account ${account.nickname} (${account.type}) health status changed: ${oldStatus} -> ${newStatus}`,
          )
          await this.accountRepository.updateAccountStatus(accountId, newStatus)
        }
      }

      this.logger.log('✅ Scheduled sweep accounts health check completed successfully.')
    } catch (error) {
      this.logger.error(`[Health Cron] Error checking sweep accounts health: ${(error as Error).message}`)
    }
  }
}
