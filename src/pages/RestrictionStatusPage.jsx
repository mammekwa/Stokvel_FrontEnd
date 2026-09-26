import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'

export default function RestrictionStatusPage({ memberProfile }) {
  if (!memberProfile?.loanRestricted) {
    return null
  }

  return (
    <Card title="My restriction status">
      <div className="mb-3">
        <StatusBadge status="rejected" />
      </div>
      <p className="text-sm text-slate-700">{memberProfile.restrictionReason || 'Loan requests are temporarily blocked for your profile.'}</p>
    </Card>
  )
}
