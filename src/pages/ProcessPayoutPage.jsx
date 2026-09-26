import { useEffect, useState } from 'react'
import { getGroupMembers } from '../api/groups'
import { createPayout } from '../api/payouts'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'

export default function ProcessPayoutPage({ onVerify }) {
  const [members, setMembers] = useState([])
  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [payout, setPayout] = useState(null)

  useEffect(() => {
    getGroupMembers('group-1').then((data) => {
      setMembers(data)
      if (data[0]) {
        setMemberId(data[0].memberId)
      }
    })
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await createPayout({ memberId, amount: Number(amount) })
      setPayout(data)
      setAmount('')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Process payout">
      <ErrorBanner error={error} />
      <form onSubmit={submit}>
        <label className="mb-4 block text-sm font-medium text-brand-navy">
          Select member
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base" onChange={(event) => setMemberId(event.target.value)} value={memberId}>
            {members.map((member) => (
              <option key={member.memberId} value={member.memberId}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <Input label="Payout amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} step="0.01" type="number" value={amount} />
        <Button disabled={loading} type="submit">
          {loading ? 'Submitting payout...' : 'Submit payout'}
        </Button>
      </form>
      {payout ? (
        <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
          <div className="mb-2">
            <StatusBadge status={payout.status} />
          </div>
          <p className="text-slate-700">{payout.status === 'pending' ? 'Payout pending confirmation.' : 'Payout confirmed.'}</p>
          {payout.status === 'confirmed' && payout.txHash ? (
            <button className="mt-2 min-h-11 font-semibold text-brand-navy underline" onClick={() => onVerify(payout.txHash)} type="button">
              Verify transaction
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
