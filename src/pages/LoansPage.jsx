import { useEffect, useState } from 'react'
import { getMemberProfile } from '../api/members'
import LoanReviewPage from './LoanReviewPage'
import RepayLoanPage from './RepayLoanPage'
import RequestLoanPage from './RequestLoanPage'
import TransactionVerificationPage from './TransactionVerificationPage'

export default function LoansPage({ memberId, role }) {
  const [txHash, setTxHash] = useState('')
  const [open, setOpen] = useState(false)
  const [memberProfile, setMemberProfile] = useState(null)

  useEffect(() => {
    getMemberProfile(memberId).then(setMemberProfile)
  }, [memberId])

  return (
    <div className="space-y-4">
      <RequestLoanPage
        restricted={Boolean(memberProfile?.loanRestricted)}
        restrictionReason={memberProfile?.restrictionReason}
      />
      <RepayLoanPage memberId={memberId} onVerify={(hash) => { setTxHash(hash); setOpen(true) }} />
      {role === 'administrator' ? <LoanReviewPage /> : null}
      <TransactionVerificationPage onClose={() => setOpen(false)} open={open} txHash={txHash} />
    </div>
  )
}
