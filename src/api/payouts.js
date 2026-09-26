import { apiClient, delay, withMockFallback } from './client'
import { mockStore } from './mockData'

export const createPayout = async (payload) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.post('/payouts', payload)
      return data
    },
    async () => {
      await delay()
      const payout = {
        id: `p-${Date.now()}`,
        memberId: payload.memberId,
        amount: Number(payload.amount),
        status: 'pending',
        txHash: null,
      }
      mockStore.payouts.unshift(payout)
      setTimeout(() => {
        payout.status = 'confirmed'
        payout.txHash = `0x${Math.random().toString(16).slice(2, 14)}`
      }, 2000)
      return payout
    },
  )
