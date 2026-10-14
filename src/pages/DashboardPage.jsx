import { ContributionList, LogContributionForm } from '../components/contributions'
import RestrictionNotice from '../components/RestrictionNotice'
import { Card, ErrorBanner, LinkButton, LoadingState, PageHeader, Stat, StatusBadge } from '../components/ui'
import { RULES } from '../config/features'
import { useGroup } from '../context/GroupContext'
import { useMemberStanding } from '../hooks/useMemberStanding'
import { formatCurrency, humanize } from '../utils/format'

export default function DashboardPage() {
  const { activeGroup, groupId, memberId, isAdmin } = useGroup()
  const standing = useMemberStanding(groupId, memberId)
  const { contributions } = standing

  return (
    <div className="space-y-5">
      <PageHeader
        actions={isAdmin ? <StatusBadge label="You are the group admin" status="ADMIN" /> : null}
        description={`${formatCurrency(activeGroup.contributionAmount)} ${humanize(activeGroup.contributionFrequency).toLowerCase()} · ${humanize(activeGroup.payoutCycle).toLowerCase()} payouts · ${activeGroup.activeMemberCount} active member${activeGroup.activeMemberCount === 1 ? '' : 's'}`}
        title={activeGroup.groupName}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total contributed" value={formatCurrency(standing.totalContributed)} />
        <Stat label="Contributions" value={standing.items.length} hint={`${standing.confirmedCount} confirmed on-chain`} />
        <Stat
          hint={standing.loanRestricted ? 'Restricted' : standing.eligibleToApply ? 'You can apply' : `Need ${RULES.minConfirmedContributionsForLoan} confirmed`}
          label="Loan eligibility"
          value={standing.eligibleToApply ? 'Eligible' : 'Not yet'}
        />
        <Stat label="Group contribution" value={formatCurrency(activeGroup.contributionAmount)} hint={humanize(activeGroup.contributionFrequency)} />
      </div>

      <RestrictionNotice standing={standing} />

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" subtitle="Saved immediately and recorded on the Sepolia blockchain." title="Log a contribution">
          <LogContributionForm defaultAmount={activeGroup.contributionAmount} groupId={groupId} onLogged={contributions.reload} />
        </Card>

        <Card
          actions={<LinkButton to="/contributions" variant="ghost">View all</LinkButton>}
          className="lg:col-span-2"
          title="Recent contributions"
        >
          <ErrorBanner error={contributions.error} />
          {contributions.loading && !standing.items.length ? <LoadingState /> : <ContributionList items={standing.items.slice(0, 5)} />}
        </Card>
      </div>
    </div>
  )
}
