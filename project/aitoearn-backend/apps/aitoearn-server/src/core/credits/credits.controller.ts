import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetToken, TokenInfo } from '@yikart/aitoearn-auth'
import { ApiDoc } from '@yikart/common'
import { SubscriptionPlanRepository, UserSubscriptionRepository } from '@yikart/mongodb'
import { RedisService } from '@yikart/redis'
import { CreditsRecordsDto } from './credits.dto'
import { CreditsService } from './credits.service'
import { CreditsBalanceVo, CreditsRecordsVo } from './credits.vo'

@ApiTags('Me/Credits')
@Controller('user/credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly redisService: RedisService,
    private readonly userSubscriptionRepository: UserSubscriptionRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  @ApiDoc({
    summary: 'Get My Credits Balance',
    response: CreditsBalanceVo,
  })
  @Get()
  async getMyCreditsBalance(@GetToken() token: TokenInfo) {
    const balance = await this.creditsService.getBalance(token.id)
    return CreditsBalanceVo.create({ balance })
  }

  @ApiDoc({
    summary: 'Get My Credits Records',
    query: CreditsRecordsDto.schema,
    response: CreditsRecordsVo,
  })
  @Get('records')
  async getMyCreditsRecords(
    @GetToken() token: TokenInfo,
    @Query() query: CreditsRecordsDto,
  ) {
    const [list, total] = await this.creditsService.getRecords(token.id, query)
    return new CreditsRecordsVo(list, total, query)
  }

  @ApiDoc({
    summary: '获取我的订阅与AI额度状态',
  })
  @Get('subscription')
  async getMySubscriptionStatus(@GetToken() token: TokenInfo) {
    const activeSub = await this.userSubscriptionRepository.getActiveSubscription(token.id)
    
    let limitChat = 9999
    let limitGen = 999
    let planName = '免费体验版'
    let endDate = null

    if (activeSub) {
      const plan = await this.subscriptionPlanRepository.getById(activeSub.planId)
      if (plan) {
        limitChat = plan.chatLimitPerDay
        limitGen = plan.genLimitPerDay
        planName = plan.name
      }
      endDate = activeSub.endDate
    }

    // 查询 Redis 获取今日用量
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const chatKey = `user:quota:${token.id}:chat:${dateStr}`
    const genKey = `user:quota:${token.id}:generate:${dateStr}`

    const chatUsedStr = await this.redisService.get(chatKey)
    const genUsedStr = await this.redisService.get(genKey)

    const chatUsed = chatUsedStr ? parseInt(chatUsedStr, 10) : 0
    const genUsed = genUsedStr ? parseInt(genUsedStr, 10) : 0

    return {
      planName,
      endDate,
      chatLimit: limitChat,
      chatUsed,
      genLimit: limitGen,
      genUsed,
      chatRemaining: Math.max(0, limitChat - chatUsed),
      genRemaining: Math.max(0, limitGen - genUsed),
    }
  }
}
