import { useState } from 'react'
import { logContribution } from '../api/contributions'
import { formatCurrency, formatDate } from '../utils/format'
import TxHashLink from './TxHashLink'
import { Button, EmptyState, ErrorBanner, Input, Notice, Spinner, StatusBadge } from './ui'

// FR-01: log a contribution; it is saved first, then written to the blockchain.
export function LogContributionForm({ groupId, defaultAmount, onLogged }) {
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '')
  const [paymentReference, setPaymentReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  const amountError = amount !== '' && !(Number(amount) >= 0.01) ? 'Amount must be at least R0.01.' : ''

  const submit = async (event) => {
    event.preventDefault()
    if (amountError || amount === '') return
    setLoading(true)
    setError(null)
    setCreated(null)
    try {
      const response = await logContribution(groupId, {
        amount: Number(amount),
        paymentReference: paymentReference.trim() || undefined,
      })
      setCreated(response)
      setPaymentReference('')
      onLogged?.(response)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <ErrorBanner error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          error={amountError}
          hint={defaultAmount ? `Your group's agreed amount is ${formatCurrency(defaultAmount)}.` : undefined}
          label="Amount (R)"
          min="0.01"
          onChange={(event) => setAmount(event.target.value)}
          required
          step="0.01"
          type="number"
          value={amount}
        />
        <Input
          hint="Optional — e.g. your bank or EFT reference."
          label="Payment reference"
          maxLength={100}
          onChange={(event) => setPaymentReference(event.target.value)}
          value={paymentReference}
        />
      </div>
      <Button block disabled={loading || Boolean(amountError) || amount === ''} type="submit">
        {loading ? (
          <>
            <Spinner /> Recording on the blockchain…
          </>
        ) : (
          'Log contribution'
        )}
      </Button>

      {created ? (
        created.blockchainConfirmed ? (
          <Notice title={`${formatCurrency(created.amount)} recorded and confirmed on-chain`} tone="success">
            <TxHashLink hash={created.txHash} />
          </Notice>
        ) : (
          <Notice title={`${formatCurrency(created.amount)} saved — blockchain confirmation pending`} tone="warning">
            Your contribution is safely recorded. The blockchain write didn't complete yet; it can be retried without losing the record.
          </Notice>
        )
      ) : null}
    </form>
  )
}

export function ContributionStatus({ contribution }) {
  return contribution.blockchainConfirmed ? <StatusBadge status="CONFIRMED" /> : <StatusBadge status="UNCONFIRMED" />
}

// FR-02: newest first, with amount, date and confirmation status.
export function ContributionList({ items, emptyAction }) {
  if (!items.length) {
    return (
      <EmptyState action={emptyAction} title="No contributions yet">
        Contributions you log will appear here with their blockchain confirmation.
      </EmptyState>
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3" key={item.contributionId}>
          <div>
            <p className="font-semibold text-brand-navy">{formatCurrency(item.amount)}</p>
            <p className="text-xs text-slate-500">{formatDate(item.createdAt || item.contributionDate)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ContributionStatus contribution={item} />
            {item.blockchainConfirmed ? <TxHashLink hash={item.txHash} /> : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
