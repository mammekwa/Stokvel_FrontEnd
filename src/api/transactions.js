import { apiClient, delay, withMockFallback } from './client'

export const getTransactionById = async (id) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.get(`/transactions/${id}`)
      return data
    },
    async () => {
      await delay(500)
      return {
        txHash: id,
        explorerUrl: `https://sepolia.etherscan.io/tx/${id}`,
      }
    },
  )
