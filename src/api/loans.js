import { apiClient, delay, withMockFallback } from './client'
import { mockStore } from './mockData'

export const createLoanRequest = async (payload) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.post('/loans', payload)
      return data
    },
    async () => {
      await delay()
      const item = {
        id: `l-${Date.now()}`,
        memberId: 'member-1',
        amount: Number(payload.amount),
        repaymentMonths: Number(payload.repaymentMonths),
        status: 'pending',
        eligibilityScore: 0.68,
        factors: [
          { factor: 'Consistent savings contributions', direction: 'positive' },
          { factor: 'Existing commitments are high', direction: 'negative' },
          { factor: 'Good repayment record in previous cycle', direction: 'positive' },
        ],
      }
      mockStore.loans.unshift(item)
      return item
    },
  )

export const getLoanById = async (loanId) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.get(`/loans/${loanId}`)
      return data
    },
    async () => {
      await delay()
      return mockStore.loans.find((loan) => loan.id === loanId) ?? mockStore.loans[0]
    },
  )

export const updateLoanStatus = async (loanId, status) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.patch(`/loans/${loanId}`, { status })
      return data
    },
    async () => {
      await delay()
      const loan = mockStore.loans.find((item) => item.id === loanId)
      if (loan) {
        loan.status = status
      }
      return loan
    },
  )

export const createLoanRepayment = async (loanId, payload, userId) =>
  withMockFallback(
    async () => {
      const { data } = await apiClient.post(`/loans/${loanId}/repayments`, payload)
      return data
    },
    async () => {
      await delay()
      const loan = mockStore.loans.find((item) => item.id === loanId)
      if (!loan || loan.memberId !== userId) {
        throw { field: null, message: 'You can only repay your own active loans.' }
      }
      return {
        id: `r-${Date.now()}`,
        loanId,
        amount: Number(payload.amount),
        status: 'confirmed',
        txHash: `0x${Math.random().toString(16).slice(2, 14)}`,
      }
    },
  )

export const getMemberActiveLoans = async (memberId) => {
  await delay(300)
  return mockStore.loans.filter((loan) => loan.memberId === memberId && loan.status !== 'rejected')
}
