import { apiClient, delay, withMockFallback } from './client'
import { mockStore } from './mockData'

export const createContribution = async (payload) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.post('/contributions', payload)
      return data
    },
    async () => {
      await delay()
      const item = {
        id: `c-${Date.now()}`,
        amount: Number(payload.amount),
        date: new Date().toISOString(),
        status: 'pending',
        txHash: null,
      }
      mockStore.contributions.unshift(item)
      setTimeout(() => {
        item.status = 'confirmed'
        item.txHash = `0x${Math.random().toString(16).slice(2, 14)}`
      }, 2000)
      return item
    },
  )

export const getMemberContributions = async (memberId) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.get(`/members/${memberId}/contributions`)
      return data
    },
    async () => {
      await delay()
      return [...mockStore.contributions].sort((a, b) => new Date(b.date) - new Date(a.date))
    },
  )
