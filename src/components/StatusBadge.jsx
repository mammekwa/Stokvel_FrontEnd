const badgeStyles = {
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  approved: 'bg-status-confirmed/15 text-status-confirmed',
  pending: 'bg-status-pending/15 text-status-pending',
  rejected: 'bg-status-rejected/15 text-status-rejected',
  arrears: 'bg-status-rejected/15 text-status-rejected',
  clear: 'bg-status-confirmed/15 text-status-confirmed',
  positive: 'bg-status-confirmed/15 text-status-confirmed',
  negative: 'bg-status-rejected/15 text-status-rejected',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyles[status] || badgeStyles.pending}`}>
      {status}
    </span>
  )
}
