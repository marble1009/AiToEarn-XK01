import { Injectable, NotFoundException } from '@nestjs/common'
import { MissionSubmissionRepository, SubmissionStatus, Transactional } from '@yikart/mongodb'
import { CreditsService } from '../credits/credits.service'
import { CreditsType } from '@yikart/common'

@Injectable()
export class MissionService {
  constructor(
    private readonly submissionRepository: MissionSubmissionRepository,
    private readonly creditsService: CreditsService,
  ) {}

  async submitWork(userId: string, data: {
    missionId: string,
    missionTitle: string,
    brand: string,
    workUrl: string,
    rewardValue: number
  }) {
    return this.submissionRepository.create({
      userId,
      ...data,
      status: SubmissionStatus.PENDING,
    })
  }

  async getPendingSubmissions() {
    return this.submissionRepository.find({ status: SubmissionStatus.PENDING })
  }

  async getUserSubmissions(userId: string) {
    return this.submissionRepository.find({ userId })
  }

  @Transactional()
  async auditSubmission(submissionId: string, status: SubmissionStatus, auditorId: string, note?: string) {
    const submission = await this.submissionRepository.getById(submissionId)
    if (!submission) {
      throw new NotFoundException('Submission not found')
    }

    if (submission.status !== SubmissionStatus.PENDING) {
      throw new Error('Submission already audited')
    }

    submission.status = status
    submission.auditedBy = auditorId
    submission.auditedAt = new Date()
    submission.auditNote = note

    await this.submissionRepository.updateById(submissionId, submission)

    if (status === SubmissionStatus.APPROVED) {
      // Award rewards
      await this.creditsService.addCredits({
        userId: submission.userId,
        amount: submission.rewardValue,
        type: CreditsType.MissionReward,
        description: `Reward for mission: ${submission.missionTitle}`,
        metadata: {
          submissionId,
          missionId: submission.missionId,
        },
      })
    }

    return submission
  }
}
