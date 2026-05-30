import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'user_subscription' })
export class UserSubscription extends WithTimestampSchema {
  id: string

  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  planId: string

  @Prop({ required: true, enum: ['active', 'expired', 'canceled'], default: 'active' })
  status: string

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ required: true, default: false })
  autoRenew: boolean
}

export const UserSubscriptionSchema = SchemaFactory.createForClass(UserSubscription)
