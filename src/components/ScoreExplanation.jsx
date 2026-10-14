import { featureLabel, formatPercent } from '../utils/format'
import { StatusBadge } from './ui'

// FR-04 / FR-10: eligibility score plus the ranked factors behind it.
export function ScoreMeter({ score, threshold }) {
  const value = Number(score)
  const cut = Number(threshold)
  if (!Number.isFinite(value)) {
    return <p className="text-sm text-slate-500">No credit score available.</p>
  }
  const passes = Number.isFinite(cut) ? value >= cut : null

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-3xl font-bold text-brand-navy">{value.toFixed(2)}</p>
        {Number.isFinite(cut) ? <p className="text-xs text-slate-500">Approval threshold {cut.toFixed(2)}</p> : null}
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${passes === false ? 'bg-status-rejected' : 'bg-status-confirmed'}`}
          style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }}
        />
        {Number.isFinite(cut) ? (
          <div className="absolute -top-1 w-0.5 bg-brand-navy" style={{ left: `${Math.min(Math.max(cut, 0), 1) * 100}%`, height: '18px' }} title="Threshold" />
        ) : null}
      </div>
      <p className="mt-1 text-xs text-slate-500">Estimated repayment likelihood: {formatPercent(value)}</p>
    </div>
  )
}

export default function ScoreExplanation({ reasons = [], limit = 5 }) {
  const ranked = [...reasons]
    .sort((a, b) => Math.abs(Number(b.impact) || 0) - Math.abs(Number(a.impact) || 0))
    .slice(0, limit)

  if (!ranked.length) {
    return <p className="text-sm text-slate-500">The model did not return any contributing factors.</p>
  }

  return (
    <ol className="space-y-2">
      {ranked.map((reason, index) => {
        const positive = String(reason.direction || '').toLowerCase().startsWith('pos') || Number(reason.impact) > 0
        return (
          <li className="rounded-lg border border-slate-200 p-3" key={`${reason.feature}-${index}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-brand-text">
                {index + 1}. {featureLabel(reason.feature)}
              </p>
              <StatusBadge label={positive ? 'Helps' : 'Hurts'} status={positive ? 'POSITIVE' : 'NEGATIVE'} />
            </div>
            {reason.message ? <p className="mt-1 text-sm text-slate-600">{reason.message}</p> : null}
          </li>
        )
      })}
    </ol>
  )
}
