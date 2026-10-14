import { apiClient, unwrap } from './client'

// ContributionRequest: { amount, paymentReference? }
// ContributionResponse: { contributionId, memberId, amount, contributionDate, txHash, blockchainConfirmed, createdAt }
export const logContribution = (groupId, payload) =>
  unwrap(apiClient.post(`/groups/${groupId}/contributions`, payload))

// Newest first (FR-02) — sorted here because the backend does not guarantee order.
export const getMyContributions = async (groupId) => {
  const items = await unwrap(apiClient.get(`/groups/${groupId}/contributions/me`))
  return [...items].sort((a, b) => new Date(b.createdAt || b.contributionDate) - new Date(a.createdAt || a.contributionDate))
}
