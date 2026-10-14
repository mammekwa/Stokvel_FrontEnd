import { apiClient, unwrap } from './client'

// LoanApplicationRequest: { amount, repaymentMonths }
export const applyForLoan = (groupId, payload) => unwrap(apiClient.post(`/groups/${groupId}/loans`, payload))

export const getMyLoans = (groupId) => unwrap(apiClient.get(`/groups/${groupId}/loans/me`))

// Admin. status: PENDING | APPROVED | APPROVED_PENDING_DISBURSEMENT | REJECTED | REPAID | DEFAULTED
export const getGroupLoans = (groupId, status) =>
  unwrap(apiClient.get(`/groups/${groupId}/loans`, { params: status ? { status } : {} }))

// LoanDecisionRequest: { approve, overrideCategory?, overrideReason? }
export const decideLoan = (groupId, loanId, payload) =>
  unwrap(apiClient.post(`/groups/${groupId}/loans/${loanId}/decision`, payload))

export const retryDisbursement = (groupId, loanId) =>
  unwrap(apiClient.post(`/groups/${groupId}/loans/${loanId}/disbursement/retry`))
