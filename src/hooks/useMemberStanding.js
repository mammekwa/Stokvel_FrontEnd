import { getMyContributions } from '../api/contributions'
import { getMember } from '../api/members'
import { RULES } from '../config/features'
import { useAsync } from './useAsync'

// Contributions + restriction flag for the current member, and the loan-eligibility
// checks the backend applies, so the UI can explain them before the member applies.
export function useMemberStanding(groupId, memberId) {
  const contributions = useAsync(() => getMyContributions(groupId), [groupId], {
    enabled: Boolean(groupId),
    initialData: [],
  })
  const member = useAsync(() => getMember(memberId), [memberId], { enabled: Boolean(memberId) })

  const items = contributions.data || []
  const confirmedCount = items.filter((c) => c.blockchainConfirmed).length
  const totalContributed = items.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const loanRestricted = Boolean(member.data?.loanRestricted)
  const needed = Math.max(RULES.minConfirmedContributionsForLoan - confirmedCount, 0)

  return {
    contributions,
    member,
    items,
    confirmedCount,
    totalContributed,
    loanRestricted,
    contributionsNeeded: needed,
    eligibleToApply: !loanRestricted && needed === 0,
  }
}
