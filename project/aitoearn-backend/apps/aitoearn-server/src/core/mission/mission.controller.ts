import { Body, Controller, Get, Post } from '@nestjs/common'
import { MissionService } from './mission.service'
import { SubmissionStatus } from '@yikart/mongodb'
import { GetToken, TokenInfo } from '@yikart/aitoearn-auth'

@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post('submit')
  async submitWork(
    @GetToken() token: TokenInfo,
    @Body() data: {
      missionId: string,
      missionTitle: string,
      brand: string,
      workUrl: string,
      rewardValue: number
    }
  ) {
    return this.missionService.submitWork(token.id, data)
  }

  @Get('submissions/pending')
  async getPendingSubmissions() {
    // In production, add admin check here
    return this.missionService.getPendingSubmissions()
  }

  @Get('submissions/me')
  async getMySubmissions(@GetToken() token: TokenInfo) {
    return this.missionService.getUserSubmissions(token.id)
  }

  @Post('audit')
  async auditSubmission(
    @GetToken() token: TokenInfo,
    @Body() data: {
      submissionId: string,
      status: SubmissionStatus,
      note?: string
    }
  ) {
    return this.missionService.auditSubmission(data.submissionId, data.status, token.id, data.note)
  }
}
