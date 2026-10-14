import { apiClient, unwrap } from './client'

// CreateGroupRequest: { groupName, payoutCycle, contributionAmount, contributionFrequency }
export const createGroup = (payload) => unwrap(apiClient.post('/groups', payload))

// Active groups only, each with isAdmin for the current user.
export const getMyGroups = () => unwrap(apiClient.get('/groups/mine'))

export const getGroup = (groupId) => unwrap(apiClient.get(`/groups/${groupId}`))

export const getActiveMembers = (groupId) => unwrap(apiClient.get(`/groups/${groupId}/members`))

export const getInviteLink = (groupId) => unwrap(apiClient.get(`/groups/${groupId}/invite-link`))

export const regenerateInviteCode = (groupId) =>
  unwrap(apiClient.post(`/groups/${groupId}/invite-code/regenerate`))

// Public — works without logging in.
export const previewInvite = (inviteCode) => unwrap(apiClient.get(`/groups/join/${encodeURIComponent(inviteCode)}`))

export const joinByInviteCode = (inviteCode) =>
  unwrap(apiClient.post(`/groups/join/${encodeURIComponent(inviteCode)}`))

export const sendEmailInvitation = (groupId, email) =>
  unwrap(apiClient.post(`/groups/${groupId}/invitations`, { email }))

export const acceptInvitation = (token) => unwrap(apiClient.post(`/invitations/${encodeURIComponent(token)}/accept`))

// Admin
export const getPendingMembers = (groupId) => unwrap(apiClient.get(`/groups/${groupId}/members/pending`))

export const approveMember = (groupId, memberId) =>
  unwrap(apiClient.post(`/groups/${groupId}/members/${memberId}/approve`))

export const rejectMember = (groupId, memberId) =>
  unwrap(apiClient.post(`/groups/${groupId}/members/${memberId}/reject`))
