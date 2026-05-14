import http from '@/utils/request'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface WorkSubmission {
  id: string
  missionId: string
  missionTitle: string
  brand: string
  workUrl: string
  status: SubmissionStatus
  rewardValue: number
  submittedAt: string
}

export interface SubmitWorkDto {
  missionId: string
  missionTitle: string
  brand: string
  workUrl: string
  rewardValue: number
}

export interface AuditSubmissionDto {
  submissionId: string
  status: SubmissionStatus
  note?: string
}

/**
 * 提交任务作品
 */
export function submitWorkApi(data: SubmitWorkDto) {
  return http.post<WorkSubmission>('missions/submit', data)
}

/**
 * 获取待审核作品列表 (Admin)
 */
export function getPendingSubmissionsApi() {
  return http.get<WorkSubmission[]>('missions/submissions/pending')
}

/**
 * 获取我的提交记录
 */
export function getMySubmissionsApi() {
  return http.get<WorkSubmission[]>('missions/submissions/me')
}

/**
 * 审核作品 (Admin)
 */
export function auditSubmissionApi(data: AuditSubmissionDto) {
  return http.post<WorkSubmission>('missions/audit', data)
}
