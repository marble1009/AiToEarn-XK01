import { Injectable, Logger } from '@nestjs/common'
import { PublishStatus } from '@yikart/aitoearn-server-client'
import { PublishRecord } from '@yikart/mongodb'
import { PublishingTaskResult, VerifyPublishResult } from '../publishing.interface'
import { PublishService } from './base.service'
import { XiaohongshuService } from '../../platforms/xiaohongshu/xiaohongshu.service'

@Injectable()
export class XhsPubService extends PublishService {
  private readonly logger = new Logger(XhsPubService.name)

  constructor(
    private readonly xhsService: XiaohongshuService,
  ) {
    super()
  }

  async immediatePublish(publishTask: PublishRecord): Promise<PublishingTaskResult> {
    const { accountId, videoUrl, title, desc, topics } = publishTask
    this.logger.log(`[XHS] Starting automated publish for task: ${publishTask.id}`)

    if (!accountId) throw new Error('Account ID is required')
    if (!videoUrl) throw new Error('Video URL is required')

    // 调用底层的自动化发布引擎
    try {
      const result = await this.xhsService.automatedPublish({
        accountId,
        videoUrl,
        title: title || 'AiToEarn Video',
        desc: desc || '',
        topics: topics || []
      })

      return {
        postId: result.postId,
        permalink: result.permalink,
        status: PublishStatus.PUBLISHED,
      }
    } catch (error) {
      this.logger.error(`[XHS] Automated publish failed: ${(error as Error).message}`)
      throw error
    }
  }

  async verifyAndCompletePublish(publishRecord: PublishRecord): Promise<VerifyPublishResult> {
    if (publishRecord.dataId) {
      return {
        success: true,
        workLink: `https://www.xiaohongshu.com/explore/${publishRecord.dataId}`,
      }
    }
    return {
      success: false,
      errorMsg: 'Missing post ID',
    }
  }
}
