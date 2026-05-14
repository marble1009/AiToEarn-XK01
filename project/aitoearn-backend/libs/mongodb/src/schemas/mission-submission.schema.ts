import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

export type MissionSubmissionDocument = MissionSubmission & Document

export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'missionSubmission' })
export class MissionSubmission extends WithTimestampSchema {
  id: string

  @Prop({
    required: true,
    index: true,
  })
  userId: string

  @Prop({
    required: true,
    index: true,
  })
  missionId: string

  @Prop({
    required: true,
  })
  missionTitle: string

  @Prop({
    required: true,
  })
  brand: string

  @Prop({
    required: true,
  })
  workUrl: string

  @Prop({
    required: true,
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
    index: true,
  })
  status: SubmissionStatus

  @Prop({
    required: true,
    default: 0,
  })
  rewardValue: number // Value in cents or tokens

  @Prop({
    required: false,
  })
  auditNote?: string

  @Prop({
    required: false,
  })
  auditedAt?: Date

  @Prop({
    required: false,
  })
  auditedBy?: string
}

export const MissionSubmissionSchema = SchemaFactory.createForClass(MissionSubmission)
