import { useEffect, useState } from 'react'
import { getGroupMembers } from '../api/groups'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import StatusBadge from '../components/StatusBadge'

export default function GroupOverviewPage() {
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getGroupMembers('group-1')
      .then(setMembers)
      .catch(setError)
  }, [])

  return (
    <Card title="Group overview">
      <ErrorBanner error={error} />
      <div className="space-y-3">
        {members.map((member) => (
          <div className="rounded-lg border border-slate-200 p-3" key={member.memberId}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold text-brand-navy">{member.name}</p>
              <StatusBadge status={member.arrearsStatus} />
            </div>
            <p className="text-sm text-slate-600">Last contribution: {member.lastContributionDate || 'No contribution yet'}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
