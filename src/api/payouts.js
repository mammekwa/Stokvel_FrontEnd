import { apiClient, unwrap } from './client'

// NOT YET AVAILABLE ON THE BACKEND.
// These follow the existing URL conventions so the screens work as soon as the
// endpoints exist. Turn them on with FEATURES.payouts / FEATURES.repayments.

// FR-09: { memberId, amount }
export const processPayout = (groupId, payload) => unwrap(apiClient.post(`/groups/${groupId}/payouts`, payload))

export const getGroupPayouts = (groupId) => unwrap(apiClient.get(`/groups/${groupId}/payouts`))

// FR-05: { amount }
export const repayLoan = (groupId, loanId, payload) =>
  unwrap(apiClient.post(`/groups/${groupId}/loans/${loanId}/repayments`, payload))
