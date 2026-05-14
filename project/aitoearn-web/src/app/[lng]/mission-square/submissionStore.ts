import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface WorkSubmission {
  id: string
  missionId: string
  missionTitle: string
  brand: string
  url: string
  status: SubmissionStatus
  submittedAt: string
  rewardValue: string
}

interface SubmissionState {
  submissions: WorkSubmission[]
  addSubmission: (submission: Omit<WorkSubmission, 'id' | 'status' | 'submittedAt'>) => void
  updateStatus: (id: string, status: SubmissionStatus) => void
}

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set) => ({
      submissions: [],
      addSubmission: (sub) => {
        const newSubmission: WorkSubmission = {
          ...sub,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          submittedAt: new Date().toISOString(),
        }
        set((state) => ({
          submissions: [newSubmission, ...state.submissions]
        }))
      },
      updateStatus: (id, status) => {
        set((state) => ({
          submissions: state.submissions.map(s => 
            s.id === id ? { ...s, status } : s
          )
        }))
      }
    }),
    {
      name: 'submission-storage',
    }
  )
)
