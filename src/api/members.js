import { apiClient, delay, withMockFallback } from './client'

export const getMemberProfile = async (id) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.get(`/members/${id}`)
      return data
    },
    async () => {
      await delay()
      return {
        id,
        loanRestricted: false,
        restrictionReason: '',
      }
    },
  )
