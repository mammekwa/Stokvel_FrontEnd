import { formatCurrency } from '../utils/format'

// 0.1 -> "10%", 0.125 -> "12.5%"
export const formatRate = (rate) => `${Math.round(Number(rate) * 1000) / 10}%`

// Repaid vs total (principal + score-based interest) for a disbursed loan.
export default function RepaymentProgress({ loan }) {
    const total = Number(loan.totalRepayable ?? loan.amount ?? 0)
    const paid = Number(loan.totalRepaid ?? 0)
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0

    return (
        <div className="mt-3 space-y-1.5">
            <div className="flex justify-between gap-2 text-xs text-slate-600">
                <span>
                    Repaid {formatCurrency(paid)} of {formatCurrency(total)}
                </span>
                <span>{Math.round(pct)}%</span>
            </div>
            <div
                aria-label="Repayment progress"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(pct)}
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
            >
                <div className="h-full rounded-full bg-status-confirmed transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500">
                {loan.interestRate != null ? `Interest ${formatRate(loan.interestRate)} (set from the credit score)` : 'No interest'}
                {loan.status === 'APPROVED' && loan.outstanding != null ? ` · ${formatCurrency(loan.outstanding)} outstanding` : ''}
            </p>
        </div>
    )
}
