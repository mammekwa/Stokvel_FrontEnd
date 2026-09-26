import { useEffect, useState } from 'react'
import { getLoanById, updateLoanStatus } from '../api/loans'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import ScoreExplanation from '../components/ScoreExplanation'

export default function LoanReviewPage({ loanId = 'l-200' }) {
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getLoanById(loanId)
        setLoan(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [loanId])

  const review = async (status) => {
    setActionLoading(true)
    setMessage('')
    setError(null)
    try {
      await updateLoanStatus(loan.id, status)
      setLoan((prev) => ({ ...prev, status }))
      setMessage(`Loan ${status}.`)
    } catch (err) {
      setError(err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Card title="Loan review">
      <ErrorBanner error={error} />
      {loading ? <p className="text-sm text-slate-600">Loading loan details...</p> : null}
      {loan ? (
        <>
          <div className="mb-3 rounded-lg bg-brand-navy p-4 text-white">
            <p className="text-sm">Eligibility score</p>
            <p className="text-3xl font-bold">{loan.eligibilityScore?.toFixed(2)}</p>
          </div>
          <ScoreExplanation factors={loan.factors} />
          {message ? <p className="mt-3 text-sm text-status-confirmed">{message}</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button disabled={actionLoading} onClick={() => review('approved')} type="button" variant="accent">
              {actionLoading ? 'Working...' : 'Approve'}
            </Button>
            <Button disabled={actionLoading} onClick={() => review('rejected')} type="button" variant="danger">
              {actionLoading ? 'Working...' : 'Reject'}
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  )
}
