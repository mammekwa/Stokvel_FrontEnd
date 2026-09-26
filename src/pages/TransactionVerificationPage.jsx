import { useEffect, useState } from 'react'
import { getTransactionById } from '../api/transactions'
import Modal from '../components/Modal'

export default function TransactionVerificationPage({ txHash, open, onClose }) {
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    if (!txHash || !open) return
    getTransactionById(txHash).then(setTransaction)
  }, [txHash, open])

  return (
    <Modal onClose={onClose} open={open} title="Transaction verification">
      {transaction ? (
        <div className="space-y-2 text-sm">
          <p className="break-all text-brand-text">Tx Hash: {transaction.txHash}</p>
          <a className="font-semibold text-brand-navy underline" href={transaction.explorerUrl} rel="noreferrer" target="_blank">
            View on Sepolia explorer
          </a>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Loading transaction details...</p>
      )}
    </Modal>
  )
}
