import { useState } from 'react'
import { EXPLORER_TX_URL } from '../config/features'
import { shortHash } from '../utils/format'

// FR-08: every recorded transaction links to its Sepolia record.
export default function TxHashLink({ hash, full = false }) {
  const [copied, setCopied] = useState(false)

  if (!hash) {
    return <span className="text-xs text-slate-500">Not yet on-chain</span>
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked — the full hash is still in the link title.
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs">
      <a
        className="break-all font-mono font-medium text-brand-navy underline decoration-brand-gold decoration-2 underline-offset-2 hover:text-brand-gold"
        href={`${EXPLORER_TX_URL}${hash}`}
        rel="noreferrer"
        target="_blank"
        title={hash}
      >
        {full ? hash : shortHash(hash)} ↗
      </a>
      <button className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100" onClick={copy} type="button">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}
