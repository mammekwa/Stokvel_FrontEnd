import RestrictionNotice from '../components/RestrictionNotice'
import { Card, ErrorBanner, LinkButton, LoadingState, PageHeader, StatusBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { useMemberStanding } from '../hooks/useMemberStanding'
import { formatDate } from '../utils/format'

const maskId = (id) => (id && id.length > 4 ? `${'•'.repeat(id.length - 4)}${id.slice(-4)}` : id || '—')

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-brand-text">{children}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { activeGroup, groupId, memberId, memberships, isAdmin } = useGroup()
  const standing = useMemberStanding(groupId, memberId)
  const member = standing.member.data

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Account">
          <dl>
            <Row label="Name">{member?.fullName || user?.fullName || '—'}</Row>
            <Row label="Email">{user?.email}</Row>
            <Row label="SA ID">{maskId(member?.nationalId)}</Row>
          </dl>
        </Card>

        <Card title={`Membership · ${activeGroup.groupName}`}>
          <ErrorBanner error={standing.member.error} />
          {standing.member.loading ? (
            <LoadingState />
          ) : (
            <dl>
              <Row label="Role">{isAdmin ? <StatusBadge label="Group admin" status="ADMIN" /> : 'Member'}</Row>
              <Row label="Status">{member ? <StatusBadge status={member.status} /> : '—'}</Row>
              <Row label="Payout position">{member?.payoutPosition ?? '—'}</Row>
              <Row label="Joined">{formatDate(member?.joinedAt)}</Row>
              <Row label="Loan status">
                {standing.loanRestricted ? <StatusBadge label="Restricted" status="RESTRICTED" /> : <StatusBadge label="Not restricted" status="ACTIVE" />}
              </Row>
            </dl>
          )}
        </Card>
      </div>

      <RestrictionNotice standing={standing} />

      <Card actions={<LinkButton to="/groups/new" variant="secondary">Create or join a group</LinkButton>} title="All my groups">
        <ul className="divide-y divide-slate-100">
          {memberships.map((m) => (
            <li className="flex items-center justify-between py-2.5 text-sm" key={m.memberId}>
              <span className="font-medium text-brand-navy">{m.groupName}</span>
              <StatusBadge status={m.status} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
