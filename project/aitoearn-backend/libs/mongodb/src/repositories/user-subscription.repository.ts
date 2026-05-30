import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserSubscription } from '../schemas'
import { BaseRepository } from './base.repository'

@Injectable()
export class UserSubscriptionRepository extends BaseRepository<UserSubscription> {
  constructor(
    @InjectModel(UserSubscription.name)
    model: Model<UserSubscription>,
  ) {
    super(model)
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    const now = new Date()
    return this.model.findOne({
      userId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean({ virtuals: true }).exec() as any
  }
}
