import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubscriptionPlan } from '../schemas'
import { BaseRepository } from './base.repository'

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    model: Model<SubscriptionPlan>,
  ) {
    super(model)
  }

  async listAllPlans(): Promise<SubscriptionPlan[]> {
    return this.model.find().lean({ virtuals: true }).exec() as any
  }
}
