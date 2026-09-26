import { useState } from 'react'
import { createLoanRequest } from '../api/loans'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorBanner from '../components/ErrorBanner'
import Input from '../components/Input'

export default function RequestLoanPage({ restricted, restrictionReason }) {
  const [amount, setAmount] = useState('')
  const [repaymentMonths, setRepaymentMonths] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (restricted) {
      setError({ message: restrictionReason || 'You cannot request a loan right now.' })
      return
    }

    setLoading(true)
    setError(null)
    setSuccess('')
    try {
      await createLoanRequest({ amount: Number(amount), repaymentMonths: Number(repaymentMonths) })
      setSuccess('Loan request submitted. We will notify you once reviewed.')
      setAmount('')
      setRepaymentMonths('')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const repaymentError = repaymentMonths && (Number(repaymentMonths) < 1 || Number(repaymentMonths) > 12)
  const amountError = amount && Number(amount) < 0.01

  return (
    <Card title="Request a loan">
      {success ? <div className="mb-3 rounded-lg bg-status-confirmed/10 p-3 text-sm text-status-confirmed">{success}</div> : null}
      <ErrorBanner error={error} />
      <form onSubmit={submit}>
        <Input label="Loan amount (R)" min="0.01" onChange={(event) => setAmount(event.target.value)} step="0.01" type="number" value={amount} error={amountError ? 'Amount must be at least R0.01.' : ''} />
        <Input label="Repayment period (months)" min="1" max="12" onChange={(event) => setRepaymentMonths(event.target.value)} type="number" value={repaymentMonths} error={repaymentError ? 'Choose a value between 1 and 12 months.' : ''} />
        <Button disabled={loading || amountError || repaymentError} type="submit">{loading ? 'Submitting request...' : 'Submit loan request'}</Button>
      </form>
    </Card>
  )
}
