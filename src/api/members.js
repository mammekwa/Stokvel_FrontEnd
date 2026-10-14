import { apiClient, unwrap } from './client'

// All of the current user's memberships, any status: [{ memberId, groupId, groupName, status }]
export const getMyMemberships = () => unwrap(apiClient.get('/members/me'))

// MemberResponse, including loanRestricted (FR-07)
export const getMember = (memberId) => unwrap(apiClient.get(`/members/${memberId}`))
