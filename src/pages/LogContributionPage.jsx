import { useState } from 'react'
import { createContribution } from '../api/contributions'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency } from '../utils/format'

export default function LogContributionPage({ onCreated }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  const amountError = amount && Number(amount) < 0.01 ? 'Amount must be at least R0.01.' : ''

  const submit = async (event) => {
    event.preventDefault()
    if (Number(amount) < 0.01) {
      setError({ message: 'Please enter an amount from R0.01 or more.' })
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await createContribution({ amount: Number(amount) })
      setCreated(response)
      setAmount('')
      onCreated?.()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Log contribution">
      <ErrorBanner error={error} />
      <form onSubmit={submit}>
        <Input
          error={amountError}
          label="Amount (R)"
          min="0.01"
          onChange={(event) => setAmount(event.target.value)}
          step="0.01"
          type="number"
          value={amount}
        />
        <Button disabled={loading || Boolean(amountError)} type="submit">
          {loading ? 'Saving contribution...' : 'Submit contribution'}
        </Button>
      </form>

      {created ? (
        <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
          <p className="mb-2 text-brand-navy">Contribution saved: {formatCurrency(created.amount)}</p>
          <div className="mb-2">
            <StatusBadge status={created.status} />
          </div>
          <p className="text-slate-600">
            {created.status === 'pending'
              ? 'Your contribution is pending blockchain confirmation.'
              : 'Contribution confirmed on blockchain.'}
          </p>
        </div>
      ) : null}
    </Card>
  )
}
