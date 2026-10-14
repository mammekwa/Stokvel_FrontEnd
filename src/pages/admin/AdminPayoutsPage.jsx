import { useState } from 'react'
import { getActiveMembers } from '../../api/groups'
import { getGroupPayouts, processPayout } from '../../api/payouts'
import TxHashLink from '../../components/TxHashLink'
import { Button, Card, EmptyState, ErrorBanner, Input, LoadingState, Notice, PageHeader, Select, Spinner } from '../../components/ui'
import { FEATURES } from '../../config/features'
import { useGroup } from '../../context/GroupContext'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, humanize } from '../../utils/format'

// FR-09. The form is switched on with VITE_FEATURE_PAYOUTS=true once
// POST /groups/{groupId}/payouts exists on the backend.
function PayoutForm({ groupId, members, onDone }) {
  const [memberId, setMemberId] = useState(members[0]?.memberId || '')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      setResult(await processPayout(groupId, { memberId, amount: Number(amount) }))
      setAmount('')
      onDone()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <ErrorBanner error={error} />
      <Select
        label="Recipient"
        onChange={(event) => setMemberId(event.target.value)}
        options={members.map((m) => ({ value: m.memberId, label: `#${m.payoutPosition ?? '—'} · ${m.fullName}` }))}
        value={memberId}
      />
      <Input label="Amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} required step="0.01" type="number" value={amount} />
      <Button block disabled={loading || !memberId || !(Number(amount) >= 0.01)} type="submit">
        {loading ? <Spinner /> : null} Process payout
      </Button>
      {result ? (
        <Notice tone="success" title="Payout recorded">
          <TxHashLink hash={result.txHash} />
        </Notice>
      ) : null}
    </form>
  )
}

export default function AdminPayoutsPage() {
  const { groupId, activeGroup } = useGroup()
  const members = useAsync(() => getActiveMembers(groupId), [groupId], { initialData: [] })
  const payouts = useAsync(() => getGroupPayouts(groupId), [groupId], { enabled: FEATURES.payouts, initialData: [] })
  const rotation = members.data || []

  return (
    <div className="space-y-5">
      <PageHeader description={`${humanize(activeGroup.payoutCycle)} payouts, paid in rotation order.`} title="Payouts" />

      {!FEATURES.payouts ? (
        <Notice title="Payout processing is coming soon" tone="info">
          The payout rotation below is live. Recording payouts on the blockchain will switch on here as soon as the backend payout endpoint is available.
        </Notice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Payout rotation">
          <ErrorBanner error={members.error} />
          {members.loading && !rotation.length ? (
            <LoadingState />
          ) : rotation.length ? (
            <ol className="divide-y divide-slate-100">
              {rotation.map((member) => (
                <li className="flex items-center gap-3 py-3" key={member.memberId}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-navy text-sm font-bold text-white">
                    {member.payoutPosition ?? '—'}
                  </span>
                  <span className="font-medium text-brand-text">{member.fullName}</span>
                  <span className="ml-auto text-xs text-slate-500">since {formatDate(member.joinedAt)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No active members yet" />
          )}
        </Card>

        <Card className="lg:col-span-2" title="Process a payout">
          {FEATURES.payouts ? (
            rotation.length ? (
              <PayoutForm groupId={groupId} members={rotation} onDone={payouts.reload} />
            ) : (
              <LoadingState />
            )
          ) : (
            <p className="text-sm text-slate-600">Not available yet.</p>
          )}
        </Card>
      </div>

      {FEATURES.payouts ? (
        <Card title="Payout history">
          <ErrorBanner error={payouts.error} />
          {(payouts.data || []).length ? (
            <ul className="divide-y divide-slate-100">
              {payouts.data.map((p) => (
                <li className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm" key={p.payoutId}>
                  <span className="font-medium">{p.memberName}</span>
                  <span className="font-semibold text-brand-navy">{formatCurrency(p.amount)}</span>
                  <TxHashLink hash={p.txHash} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No payouts yet" />
          )}
        </Card>
      ) : null}
    </div>
  )
}
