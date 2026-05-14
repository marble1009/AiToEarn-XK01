import { Module } from '@nestjs/common'
import { MissionService } from './mission.service'
import { MissionController } from './mission.controller'
import { CreditsModule } from '../credits/credits.module'

@Module({
  imports: [
    CreditsModule,
  ],
  providers: [MissionService],
  controllers: [MissionController],
  exports: [MissionService],
})
export class MissionModule {}
