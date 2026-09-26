import StatusBadge from './StatusBadge'

export default function ScoreExplanation({ factors = [] }) {
  const ranked = [...factors].slice(0, 3)

  return (
    <div className="space-y-2">
      {ranked.map((factor, index) => (
        <div className="rounded-lg border border-slate-200 p-3" key={`${factor.factor}-${index}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-brand-text">{index + 1}. {factor.factor}</p>
            <StatusBadge status={factor.direction} />
          </div>
        </div>
      ))}
    </div>
  )
}
