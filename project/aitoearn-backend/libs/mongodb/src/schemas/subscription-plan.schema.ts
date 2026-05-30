import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'subscription_plan' })
export class SubscriptionPlan extends WithTimestampSchema {
  id: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  price: number // in cents

  @Prop({ required: true })
  durationDays: number // e.g. 30, 365

  @Prop({ required: true, default: 0 })
  chatLimitPerDay: number // daily conversation rounds

  @Prop({ required: true, default: 0 })
  genLimitPerDay: number // daily content creation limits (e.g. video/article generation)

  @Prop({ type: [String], default: [] })
  features: string[]
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan)
