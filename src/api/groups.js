import { apiClient, delay, withMockFallback } from './client'
import { mockStore } from './mockData'

export const getGroupMembers = async (groupId) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.get(`/groups/${groupId}/members`)
      return data
    },
    async () => {
      await delay()
      return [...mockStore.members].sort((a, b) => {
        const aScore = a.arrearsStatus === 'arrears' ? 0 : 1
        const bScore = b.arrearsStatus === 'arrears' ? 0 : 1
        return aScore - bScore
      })
    },
  )
