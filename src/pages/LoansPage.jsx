import { useState } from 'react'
import { applyForLoan, getMyLoans } from '../api/loans'
import { repayLoan } from '../api/payouts'
import RestrictionNotice from '../components/RestrictionNotice'
import TxHashLink from '../components/TxHashLink'
import { Button, Card, EmptyState, ErrorBanner, Input, LoadingState, Modal, Notice, PageHeader, Select, Spinner, StatusBadge } from '../components/ui'
import { FEATURES, RULES } from '../config/features'
import { useGroup } from '../context/GroupContext'
import { useAsync } from '../hooks/useAsync'
import { useMemberStanding } from '../hooks/useMemberStanding'
import { formatCurrency, formatDate } from '../utils/format'

const monthOptions = Array.from({ length: RULES.maxRepaymentMonths - RULES.minRepaymentMonths + 1 }, (_, i) => {
  const months = RULES.minRepaymentMonths + i
  return { value: String(months), label: `${months} month${months === 1 ? '' : 's'}` }
})

const STATUS_HELP = {
  PENDING: 'Scored by the credit model and waiting for the group admin to decide.',
  APPROVED_PENDING_DISBURSEMENT: 'Approved — the disbursement is waiting to be recorded on the blockchain.',
  APPROVED: 'Approved and disbursed.',
  REJECTED: 'Declined by the group admin.',
  REPAID: 'Fully repaid.',
  DEFAULTED: 'Repayments were missed.',
}

// FR-03: apply (scored immediately by the AI model, FR-04)
function ApplyForm({ groupId, onApplied }) {
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState('3')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(null)

  const amountError = amount !== '' && !(Number(amount) >= 0.01) ? 'Amount must be at least R0.01.' : ''

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const loan = await applyForLoan(groupId, { amount: Number(amount), repaymentMonths: Number(months) })
      setSubmitted(loan)
      setAmount('')
      onApplied?.()
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
        <Input error={amountError} label="Amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} required step="0.01" type="number" value={amount} />
        <Select label="Repayment period" onChange={(event) => setMonths(event.target.value)} options={monthOptions} value={months} />
      </div>
      <Button block disabled={loading || amount === '' || Boolean(amountError)} type="submit">
        {loading ? (
          <>
            <Spinner /> Scoring your application…
          </>
        ) : (
          'Submit application'
        )}
      </Button>
      {submitted ? (
        <Notice title={`Application for ${formatCurrency(submitted.amount)} submitted`} tone="success">
          Your group admin will review it together with your contribution history.
        </Notice>
      ) : null}
    </form>
  )
}

// FR-05 (enabled once the backend endpoint exists)
function RepayModal({ groupId, loan, onClose, onRepaid }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await repayLoan(groupId, loan.loanId, { amount: Number(amount) })
      onRepaid()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} open title={`Repay loan of ${formatCurrency(loan.amount)}`}>
      <form className="space-y-4" onSubmit={submit}>
        <ErrorBanner error={error} />
        <Input label="Repayment amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} required step="0.01" type="number" value={amount} />
        <Button block disabled={loading || !(Number(amount) >= 0.01)} type="submit">
          {loading ? <Spinner /> : null} Record repayment
        </Button>
      </form>
    </Modal>
  )
}

export default function LoansPage() {
  const { groupId, memberId } = useGroup()
  const standing = useMemberStanding(groupId, memberId)
  const loans = useAsync(() => getMyLoans(groupId), [groupId], { enabled: Boolean(groupId), initialData: [] })
  const [repaying, setRepaying] = useState(null)

  const items = loans.data || []
  const hasOpenLoan = items.some((loan) => ['PENDING', 'APPROVED_PENDING_DISBURSEMENT'].includes(loan.status))

  return (
    <div className="space-y-5">
      <PageHeader
        description="Your contribution and repayment history is used instead of a formal credit record."
        title="Loans"
      />

      <RestrictionNotice standing={standing} />

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2" subtitle={`Repay over ${RULES.minRepaymentMonths}–${RULES.maxRepaymentMonths} months.`} title="Apply for a loan">
          {standing.contributions.loading || standing.member.loading ? (
            <LoadingState label="Checking your eligibility…" />
          ) : hasOpenLoan ? (
            <Notice tone="info">You already have a loan application in progress. You can apply again once it has been decided.</Notice>
          ) : standing.eligibleToApply ? (
            <ApplyForm groupId={groupId} onApplied={loans.reload} />
          ) : (
            <p className="text-sm text-slate-600">The application form opens as soon as you are eligible.</p>
          )}
        </Card>

        <Card className="lg:col-span-3" title="My loans">
          <ErrorBanner error={loans.error} />
          {loans.loading && !items.length ? (
            <LoadingState />
          ) : items.length ? (
            <ul className="space-y-3">
              {items.map((loan) => (
                <li className="rounded-lg border border-slate-200 p-4" key={loan.loanId}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-brand-navy">{formatCurrency(loan.amount)}</p>
                      <p className="text-xs text-slate-500">
                        {loan.repaymentMonths} months · requested {formatDate(loan.requestedAt)}
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{STATUS_HELP[loan.status]}</p>
                  {loan.txHash ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Disbursement: <TxHashLink hash={loan.txHash} />
                    </p>
                  ) : null}
                  {loan.status === 'APPROVED' ? (
                    <div className="mt-3">
                      <Button disabled={!FEATURES.repayments} onClick={() => setRepaying(loan)} variant="secondary">
                        Repay loan
                      </Button>
                      {!FEATURES.repayments ? <p className="mt-1 text-xs text-slate-500">Online repayments are coming soon.</p> : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No loans yet">Loans you apply for will appear here with their status.</EmptyState>
          )}
        </Card>
      </div>

      {repaying ? <RepayModal groupId={groupId} loan={repaying} onClose={() => setRepaying(null)} onRepaid={loans.reload} /> : null}
    </div>
  )
}
