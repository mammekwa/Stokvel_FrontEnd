import { useState } from 'react'
import GroupOverviewPage from './GroupOverviewPage'
import ProcessPayoutPage from './ProcessPayoutPage'
import TransactionVerificationPage from './TransactionVerificationPage'

export default function GroupPage() {
  const [txHash, setTxHash] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <GroupOverviewPage />
      <ProcessPayoutPage onVerify={(hash) => { setTxHash(hash); setOpen(true) }} />
      <TransactionVerificationPage onClose={() => setOpen(false)} open={open} txHash={txHash} />
    </div>
  )
}
