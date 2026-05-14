import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, QueryOptions } from 'mongoose'
import { MissionSubmission } from '../schemas'
import { BaseRepository, LeanDoc } from './base.repository'

@Injectable()
export class MissionSubmissionRepository extends BaseRepository<MissionSubmission> {
  constructor(
    @InjectModel(MissionSubmission.name)
    missionSubmissionModel: Model<MissionSubmission>,
  ) {
    super(missionSubmissionModel)
  }

  override async find(filter: FilterQuery<MissionSubmission> = {}, options?: QueryOptions<MissionSubmission>): Promise<LeanDoc<MissionSubmission>[]> {
    return super.find(filter, options)
  }
}
