import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../api/groups'
import { Button, Card, ErrorBanner, Input, Notice, PageHeader, Select, Spinner, StatusBadge } from '../components/ui'
import { useGroup } from '../context/GroupContext'

const payoutCycleOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'BIANNUALLY', label: 'Twice a year' },
  { value: 'ANNUALLY', label: 'Once a year' },
]

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'WEEKLY', label: 'Weekly' },
]

// Accepts a bare code ("ABCD-1234") or a full link ("https://…/join/ABCD1234").
const extractInviteCode = (text) => {
  const trimmed = text.trim()
  const match = trimmed.match(/\/join\/([^/?#]+)/)
  return match ? match[1] : trimmed
}

function CreateGroupForm() {
  const { refresh, selectGroup } = useGroup()
  const navigate = useNavigate()
  const [form, setForm] = useState({ groupName: '', contributionAmount: '', contributionFrequency: 'MONTHLY', payoutCycle: 'MONTHLY' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  const nameError = form.groupName && form.groupName.trim().length < 3 ? 'Use at least 3 characters.' : ''
  const amountError = form.contributionAmount && Number(form.contributionAmount) < 0.01 ? 'Must be at least R0.01.' : ''

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const group = await createGroup({
        groupName: form.groupName.trim(),
        contributionAmount: Number(form.contributionAmount),
        contributionFrequency: form.contributionFrequency,
        payoutCycle: form.payoutCycle,
      })
      await refresh()
      selectGroup(group.groupId)
      navigate('/admin/members', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card subtitle="You'll be the group admin and first in the payout rotation." title="Start a new stokvel">
      <form className="space-y-4" onSubmit={submit}>
        <ErrorBanner error={error} />
        <Input error={nameError} label="Group name" maxLength={100} onChange={update('groupName')} placeholder="e.g. Mamelodi Savings Circle" required value={form.groupName} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input error={amountError} label="Contribution amount (R)" min="0.01" onChange={update('contributionAmount')} required step="0.01" type="number" value={form.contributionAmount} />
          <Select label="Contribution frequency" onChange={update('contributionFrequency')} options={frequencyOptions} value={form.contributionFrequency} />
        </div>
        <Select label="Payout cycle" onChange={update('payoutCycle')} options={payoutCycleOptions} value={form.payoutCycle} />
        <Button block disabled={loading || Boolean(nameError || amountError)} type="submit">
          {loading ? (
            <>
              <Spinner /> Creating group…
            </>
          ) : (
            'Create group'
          )}
        </Button>
      </form>
    </Card>
  )
}

function JoinWithCodeForm() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const inviteCode = extractInviteCode(code)
    if (inviteCode) navigate(`/join/${encodeURIComponent(inviteCode)}`)
  }

  return (
    <Card subtitle="Paste the invite code or link your group admin shared with you." title="Join an existing stokvel">
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Invite code or link" onChange={(event) => setCode(event.target.value)} placeholder="e.g. ABCD-1234" required value={code} />
        <Button block type="submit" variant="secondary">
          Find group
        </Button>
      </form>
    </Card>
  )
}

export default function GroupSetupPage() {
  const { groups, pendingMemberships } = useGroup()

  return (
    <div className="space-y-5">
      <PageHeader
        description={groups.length ? 'You can belong to several stokvels — one membership per group.' : 'To get started, create a stokvel or join one with an invite.'}
        title={groups.length ? 'Create or join a group' : 'Welcome to StokvelChain'}
      />

      {pendingMemberships.length ? (
        <Notice title="Waiting for approval" tone="warning">
          <ul className="mt-1 space-y-1">
            {pendingMemberships.map((membership) => (
              <li className="flex items-center gap-2" key={membership.memberId}>
                {membership.groupName} <StatusBadge status="PENDING" />
              </li>
            ))}
          </ul>
          <p className="mt-1">The group admin needs to approve your request before you can contribute.</p>
        </Notice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <JoinWithCodeForm />
        <CreateGroupForm />
      </div>
    </div>
  )
}
