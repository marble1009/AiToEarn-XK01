import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Mission, MOCK_MISSIONS } from './mission.type'

interface MissionState {
  missions: Mission[]
  joinedMissionIds: string[]
  getMissionById: (id: string) => Mission | undefined
  joinMission: (id: string) => void
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: MOCK_MISSIONS,
      joinedMissionIds: [],
      getMissionById: (id: string) => {
        return get().missions.find(m => m.id === id)
      },
      joinMission: (id: string) => {
        set((state) => ({
          joinedMissionIds: state.joinedMissionIds.includes(id) 
            ? state.joinedMissionIds 
            : [...state.joinedMissionIds, id]
        }))
      },
    }),
    {
      name: 'mission-storage',
    }
  )
)
