import { useState } from 'react'
import { decideLoan, getGroupLoans, retryDisbursement } from '../../api/loans'
import RepaymentProgress, { formatRate } from '../../components/RepaymentProgress'
import ScoreExplanation, { ScoreMeter } from '../../components/ScoreExplanation'
import TxHashLink from '../../components/TxHashLink'
import { Button, Card, EmptyState, ErrorBanner, LoadingState, Modal, Notice, PageHeader, Select, Spinner, StatusBadge, Textarea } from '../../components/ui'
import { RULES } from '../../config/features'
import { useGroup } from '../../context/GroupContext'
import { useAsync } from '../../hooks/useAsync'
import { formatCurrency, formatDate, formatDateTime, humanize } from '../../utils/format'

const FILTERS = [
    { value: 'PENDING', label: 'Awaiting decision' },
    { value: 'APPROVED_PENDING_DISBURSEMENT', label: 'Awaiting disbursement' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Declined' },
    { value: 'REPAID', label: 'Repaid' },
    { value: '', label: 'All' },
]

const OVERRIDE_CATEGORIES = [
    { value: '', label: 'Choose a category…' },
    { value: 'ONE_OFF_HARDSHIP', label: 'One-off hardship (temporary event)' },
    { value: 'KNOWN_TO_GROUP', label: 'Known to the group — reliable' },
    { value: 'GUARANTOR_PROVIDED', label: 'Guarantor provided' },
    { value: 'DATA_ERROR', label: "Member's record is wrong" },
    { value: 'OTHER', label: 'Other' },
]

// FR-04, FR-10 + override with documented reason (kept for model retraining).
function ReviewModal({ groupId, loan, onClose, onChanged }) {
    const [decision, setDecision] = useState(null) // true approve / false reject
    const [category, setCategory] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const modelApproves = loan.recommendation === 'APPROVE'
    const isPending = loan.status === 'PENDING'
    const overriding = decision !== null && decision !== modelApproves
    const reasonTooShort = reason.trim().length < RULES.minOverrideReasonLength
    const canSubmit = decision !== null && (!overriding || (category && !reasonTooShort))

    const submit = async () => {
        setLoading(true)
        setError(null)
        try {
            await decideLoan(groupId, loan.loanId, {
                approve: decision,
                overrideCategory: overriding ? category : null,
                overrideReason: overriding ? reason.trim() : null,
            })
            onChanged()
            onClose()
        } catch (err) {
            // An approval can be saved even if the on-chain disbursement fails —
            // reload so the loan shows as "Awaiting disbursement" with a retry button.
            setError(
                decision
                    ? { ...err, message: `${err.message} If the approval was saved, the loan will show as "Awaiting disbursement" and can be retried.` }
                    : err,
            )
            onChanged()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal onClose={onClose} open title={`${loan.memberName} · ${formatCurrency(loan.amount)}`} wide>
            <div className="space-y-5">
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <span>{loan.repaymentMonths} months</span>·<span>Requested {formatDateTime(loan.requestedAt)}</span>
                    <StatusBadge status={loan.status} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-brand-navy">AI eligibility score</p>
                        <ScoreMeter score={loan.aiScore} threshold={loan.threshold} />
                        {loan.recommendation ? (
                            <p className="mt-3 text-sm">
                                Model recommendation: <StatusBadge status={loan.recommendation} />
                            </p>
                        ) : null}
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-semibold text-brand-navy">Why this score</p>
                        <ScoreExplanation reasons={loan.reasons} />
                    </div>
                </div>

                {loan.interestRate != null ? (
                    <p className="text-sm text-slate-600">
                        Terms: {formatRate(loan.interestRate)} interest (from the score) · {formatCurrency(loan.totalRepayable)} total ·{' '}
                        {formatCurrency(loan.instalmentAmount)}/month
                    </p>
                ) : null}

                {loan.overridden ? (
                    <Notice title={`Decision overrode the model · ${humanize(loan.overrideCategory)}`} tone="info">
                        {loan.overrideReason}
                    </Notice>
                ) : null}

                {isPending ? (
                    <div className="space-y-4 border-t border-slate-200 pt-4">
                        <p className="text-sm font-semibold text-brand-navy">Your decision</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setDecision(true)} variant={decision === true ? 'primary' : 'secondary'}>
                                Approve
                            </Button>
                            <Button onClick={() => setDecision(false)} variant={decision === false ? 'danger' : 'secondary'}>
                                Decline
                            </Button>
                        </div>

                        {overriding ? (
                            <div className="space-y-3 rounded-lg border border-status-pending/40 bg-status-pending/5 p-4">
                                <p className="text-sm text-[#7a5a17]">
                                    You're going against the model's recommendation. Give a category and a written reason — it's kept on record and used to improve future models.
                                </p>
                                <Select label="Override category" onChange={(event) => setCategory(event.target.value)} options={OVERRIDE_CATEGORIES} value={category} />
                                <Textarea
                                    error={reason && reasonTooShort ? `At least ${RULES.minOverrideReasonLength} characters (${reason.trim().length} so far).` : ''}
                                    label="Reason"
                                    maxLength={1000}
                                    onChange={(event) => setReason(event.target.value)}
                                    placeholder="e.g. Missed two payments during a hospital stay in March; has paid on time since."
                                    value={reason}
                                />
                            </div>
                        ) : null}

                        <ErrorBanner error={error} />
                        <Button block disabled={!canSubmit || loading} onClick={submit} variant={decision === false ? 'danger' : 'primary'}>
                            {loading ? <Spinner /> : null}
                            {decision === null ? 'Choose approve or decline' : decision ? 'Confirm approval & disburse' : 'Confirm decline'}
                        </Button>
                    </div>
                ) : null}

                {loan.txHash ? (
                    <p className="text-sm text-slate-600">
                        Disbursement transaction: <TxHashLink hash={loan.txHash} />
                    </p>
                ) : null}
            </div>
        </Modal>
    )
}

export default function AdminLoansPage() {
    const { groupId } = useGroup()
    const [status, setStatus] = useState('PENDING')
    const loans = useAsync(() => getGroupLoans(groupId, status || undefined), [groupId, status], { initialData: [] })
    const [reviewing, setReviewing] = useState(null)
    const [retryingId, setRetryingId] = useState(null)
    const [error, setError] = useState(null)

    const retry = async (loan) => {
        setRetryingId(loan.loanId)
        setError(null)
        try {
            await retryDisbursement(groupId, loan.loanId)
            loans.reload()
        } catch (err) {
            setError(err)
        } finally {
            setRetryingId(null)
        }
    }

    const items = loans.data || []

    return (
        <div className="space-y-5">
            <PageHeader description="Every application is scored by the credit model. You make the final decision." title="Loan reviews" />

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                    <button
                        className={`min-h-10 rounded-full px-4 text-sm font-medium transition ${status === filter.value ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                        key={filter.value || 'all'}
                        onClick={() => setStatus(filter.value)}
                        type="button"
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <ErrorBanner error={error || loans.error} />

            {loans.loading && !items.length ? (
                <LoadingState />
            ) : items.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((loan) => (
                        <Card key={loan.loanId}>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-brand-navy">{loan.memberName}</p>
                                    <p className="text-2xl font-bold text-brand-navy">{formatCurrency(loan.amount)}</p>
                                    <p className="text-xs text-slate-500">
                                        {loan.repaymentMonths} months · {formatDate(loan.requestedAt)}
                                    </p>
                                </div>
                                <StatusBadge status={loan.status} />
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-slate-600">
                                    Score <strong className="text-brand-navy">{loan.aiScore != null ? Number(loan.aiScore).toFixed(2) : '—'}</strong>
                                </span>
                                {loan.recommendation ? <StatusBadge status={loan.recommendation} /> : null}
                                {loan.overridden ? <StatusBadge label="Overridden" status="PENDING" /> : null}
                            </div>
                            {['APPROVED', 'REPAID'].includes(loan.status) ? <RepaymentProgress loan={loan} /> : null}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button onClick={() => setReviewing(loan)} variant={loan.status === 'PENDING' ? 'primary' : 'secondary'}>
                                    {loan.status === 'PENDING' ? 'Review & decide' : 'View details'}
                                </Button>
                                {loan.status === 'APPROVED_PENDING_DISBURSEMENT' ? (
                                    <Button disabled={retryingId === loan.loanId} onClick={() => retry(loan)} variant="accent">
                                        {retryingId === loan.loanId ? <Spinner /> : null} Retry disbursement
                                    </Button>
                                ) : null}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="No loans here">{status === 'PENDING' ? 'No applications are waiting for a decision.' : 'Nothing matches this filter.'}</EmptyState>
            )}

            {reviewing ? <ReviewModal groupId={groupId} loan={reviewing} onChanged={loans.reload} onClose={() => setReviewing(null)} /> : null}
        </div>
    )
}
