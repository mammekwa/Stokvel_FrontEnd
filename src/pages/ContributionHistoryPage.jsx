import { useEffect, useState } from 'react'
import { getMemberContributions } from '../api/contributions'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../utils/format'

export default function ContributionHistoryPage({ memberId, onVerify }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getMemberContributions(memberId)
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [memberId])

  return (
    <Card title="Contribution history">
      <ErrorBanner error={error} />
      {loading ? <p className="text-sm text-slate-600">Loading contributions...</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <div className="rounded-lg border border-slate-200 p-3" key={item.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold text-brand-navy">{formatCurrency(item.amount)}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-sm text-slate-600">Date: {formatDate(item.date)}</p>
            {item.status === 'confirmed' ? (
              <button className="mt-2 min-h-11 text-sm font-semibold text-brand-navy underline" onClick={() => onVerify(item.txHash)} type="button">
                Verify transaction
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  )
}
