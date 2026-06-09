import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AppException, ResponseCode } from '@yikart/common'
import { SubscriptionPlanRepository, UserSubscriptionRepository } from '@yikart/mongodb'
import { RedisService } from '@yikart/redis'

@Injectable()
export class AiQuotaGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly userSubscriptionRepository: UserSubscriptionRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user // TokenInfo from @yikart/aitoearn-auth
    if (!user) {
      return true
    }

    const path = request.path
    let actionType: 'chat' | 'generate' = 'generate'
    if (path.includes('/chat')) {
      actionType = 'chat'
    }

    // 1. 获取用户有效订阅
    const activeSub = await this.userSubscriptionRepository.getActiveSubscription(user.id)
    
    // 2. 确定额度限制（默认免费版额度已被调大以支持开发测试）
    let limit = actionType === 'chat' ? 10000 : 5000 // 每日默认：10000次对话，5000次视频/图片生成
    let planName = '开发测试体验版'

    if (activeSub) {
      const plan = await this.subscriptionPlanRepository.getById(activeSub.planId)
      if (plan) {
        limit = actionType === 'chat' 
          ? Math.max(plan.chatLimitPerDay, 10000) 
          : Math.max(plan.genLimitPerDay, 5000)
        planName = plan.name
      }
    }

    // 3. Redis 计数拦截
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const key = `user:quota:${user.id}:${actionType}:${dateStr}`

    // 增加计数并获取当前值
    const current = await this.redisService.incr(key)
    if (current === 1) {
      await this.redisService.expire(key, 86400) // 24小时过期
    }

    if (current > limit) {
      throw new AppException(
        ResponseCode.TooManyRequests,
        `您当前的 [${planName}] 每日AI${actionType === 'chat' ? '对话' : '生成'}额度（${limit}次）已用尽，请明日再试或升级会员等级。`,
      )
    }

    return true
  }
}
