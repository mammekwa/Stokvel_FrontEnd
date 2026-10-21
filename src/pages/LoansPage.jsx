import { useState } from 'react'
import { applyForLoan, getLoanRepayments, getMyLoans, repayLoan } from '../api/loans'
import RepaymentProgress, { formatRate } from '../components/RepaymentProgress'
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

// FR-05: repay a disbursed loan; each repayment is recorded on-chain (LOAN_REPAYMENT)
function RepayModal({ groupId, loan, onClose, onRepaid }) {
    const outstanding = Number(loan.outstanding ?? 0)
    const instalment = Math.min(Number(loan.instalmentAmount ?? outstanding), outstanding)
    const [amount, setAmount] = useState(instalment > 0 ? instalment.toFixed(2) : '')
    const [reference, setReference] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const history = useAsync(() => getLoanRepayments(groupId, loan.loanId), [groupId, loan.loanId], { initialData: [] })

    const value = Number(amount)
    const amountError =
        amount === '' ? '' : !(value >= 0.01) ? 'Amount must be at least R0.01.' : value > outstanding ? `You only owe ${formatCurrency(outstanding)}.` : ''

    const submit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await repayLoan(groupId, loan.loanId, { amount: value, paymentReference: reference.trim() || undefined })
            onRepaid()
            onClose()
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    const payments = history.data || []

    return (
        <Modal onClose={onClose} open title={`Repay loan of ${formatCurrency(loan.amount)}`}>
            <form className="space-y-4" onSubmit={submit}>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">Total to repay</p>
                        <p className="font-semibold text-brand-navy">{formatCurrency(loan.totalRepayable ?? loan.amount)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">Outstanding</p>
                        <p className="font-semibold text-brand-navy">{formatCurrency(outstanding)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">Monthly</p>
                        <p className="font-semibold text-brand-navy">{formatCurrency(loan.instalmentAmount)}</p>
                    </div>
                </div>
                {loan.interestRate != null ? (
                    <p className="text-xs text-slate-500">Includes {formatRate(loan.interestRate)} interest, set from your credit score when the loan was approved.</p>
                ) : null}

                <ErrorBanner error={error} />
                <Input
                    error={amountError}
                    hint="Pre-filled with your next instalment."
                    label="Repayment amount (R)"
                    max={outstanding}
                    min="0.01"
                    onChange={(event) => setAmount(event.target.value)}
                    required
                    step="0.01"
                    type="number"
                    value={amount}
                />
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setAmount(instalment.toFixed(2))} variant="ghost">
                        Next instalment
                    </Button>
                    <Button onClick={() => setAmount(outstanding.toFixed(2))} variant="ghost">
                        Pay full balance
                    </Button>
                </div>
                <Input label="Payment reference (optional)" maxLength={100} onChange={(event) => setReference(event.target.value)} value={reference} />
                <Button block disabled={loading || amount === '' || Boolean(amountError)} type="submit">
                    {loading ? (
                        <>
                            <Spinner /> Recording on the blockchain…
                        </>
                    ) : (
                        'Record repayment'
                    )}
                </Button>
            </form>

            <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="mb-2 text-sm font-semibold text-brand-navy">Previous repayments</p>
                <ErrorBanner error={history.error} />
                {history.loading && !payments.length ? (
                    <LoadingState />
                ) : payments.length ? (
                    <ul className="space-y-2">
                        {payments.map((payment) => (
                            <li className="flex flex-wrap items-center justify-between gap-2 text-sm" key={payment.repaymentId}>
                                <span>
                                    <strong className="text-brand-navy">{formatCurrency(payment.amount)}</strong>{' '}
                                    <span className="text-slate-500">· {formatDate(payment.paymentDate)}</span>
                                </span>
                                {payment.txHash ? <TxHashLink hash={payment.txHash} /> : <StatusBadge status="UNCONFIRMED" />}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">No repayments yet.</p>
                )}
            </div>
        </Modal>
    )
}

export default function LoansPage() {
    const { groupId, memberId } = useGroup()
    const standing = useMemberStanding(groupId, memberId)
    const loans = useAsync(() => getMyLoans(groupId), [groupId], { enabled: Boolean(groupId), initialData: [] })
    const [repaying, setRepaying] = useState(null)

    const items = loans.data || []
    const hasOpenLoan = items.some((loan) => ['PENDING', 'APPROVED_PENDING_DISBURSEMENT', 'APPROVED'].includes(loan.status))

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
                        <Notice tone="info">You already have a loan in progress. You can apply again once it has been declined or fully repaid.</Notice>
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
                                    {['APPROVED', 'REPAID'].includes(loan.status) ? <RepaymentProgress loan={loan} /> : null}
                                    {loan.status === 'APPROVED' ? (
                                        <div className="mt-3">
                                            <Button disabled={!FEATURES.repayments} onClick={() => setRepaying(loan)} variant="secondary">
                                                Repay {formatCurrency(Math.min(Number(loan.instalmentAmount ?? 0), Number(loan.outstanding ?? 0)))}
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
