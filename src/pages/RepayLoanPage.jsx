import { useEffect, useState } from 'react'
import { createLoanRepayment, getMemberActiveLoans } from '../api/loans'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'

export default function RepayLoanPage({ memberId, onVerify }) {
  const [loans, setLoans] = useState([])
  const [loanId, setLoanId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getMemberActiveLoans(memberId).then((items) => {
      setLoans(items)
      if (items[0]) {
        setLoanId(items[0].id)
      }
    })
  }, [memberId])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage('')
    try {
      const data = await createLoanRepayment(loanId, { amount: Number(amount) }, memberId)
      setMessage('Repayment successful.')
      setAmount('')
      if (data.txHash) onVerify(data.txHash)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Repay a loan">
      <ErrorBanner error={error} />
      {message ? <div className="mb-3 rounded-lg bg-status-confirmed/10 p-3 text-sm text-status-confirmed">{message}</div> : null}
      <form onSubmit={submit}>
        <label className="mb-4 block text-sm font-medium text-brand-navy">
          Select active loan
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base" onChange={(event) => setLoanId(event.target.value)} value={loanId}>
            {loans.map((loan) => (
              <option key={loan.id} value={loan.id}>
                {loan.id} - R{loan.amount}
              </option>
            ))}
          </select>
        </label>
        <Input label="Repayment amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} step="0.01" type="number" value={amount} />
        <Button disabled={loading || !loanId} type="submit">
          {loading ? 'Submitting repayment...' : 'Submit repayment'}
        </Button>
      </form>
    </Card>
  )
}
