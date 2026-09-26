import { useState } from 'react'
import ContributionHistoryPage from './ContributionHistoryPage'
import LogContributionPage from './LogContributionPage'
import TransactionVerificationPage from './TransactionVerificationPage'

export default function HomePage({ memberId }) {
  const [refreshToken, setRefreshToken] = useState(0)
  const [txHash, setTxHash] = useState('')
  const [open, setOpen] = useState(false)

  const verify = (hash) => {
    setTxHash(hash)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <LogContributionPage onCreated={() => setRefreshToken((prev) => prev + 1)} />
      <ContributionHistoryPage key={refreshToken} memberId={memberId} onVerify={verify} />
      <TransactionVerificationPage onClose={() => setOpen(false)} open={open} txHash={txHash} />
    </div>
  )
}
