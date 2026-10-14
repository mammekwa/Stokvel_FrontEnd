import { getActiveMembers } from '../api/groups'
import { getGroupLoans } from '../api/loans'
import { FEATURES } from '../config/features'
import { getGroupPayouts } from '../api/payouts'
import { featureLabel } from '../utils/format'

/**
 * Admin report registry.
 *
 * To add a report, append an entry:
 *   id, title, description  – shown on the Reports page
 *   available               – false shows it as "coming soon" (with `requires`)
 *   load({ groupId })       – fetches the rows
 *   columns                 – [{ header, value: (row) => any }] used for CSV export
 *
 * Export formats live in ReportsPage (CSV today; add PDF/XLSX there once and every
 * report gets it).
 */
export const REPORTS = [
  {
    id: 'members',
    title: 'Member register',
    description: 'All active members with their payout position and join date.',
    available: true,
    load: ({ groupId }) => getActiveMembers(groupId),
    columns: [
      { header: 'Payout position', value: (m) => m.payoutPosition },
      { header: 'Full name', value: (m) => m.fullName },
      { header: 'Role', value: (m) => (m.isAdmin ? 'Group admin' : 'Member') },
      { header: 'Status', value: (m) => m.status },
      { header: 'Joined', value: (m) => m.joinedAt },
    ],
  },
  {
    id: 'loans',
    title: 'Loan register',
    description: 'Every loan application with the AI score, model recommendation, admin decision and override reasons.',
    available: true,
    load: ({ groupId }) => getGroupLoans(groupId),
    columns: [
      { header: 'Loan ID', value: (l) => l.loanId },
      { header: 'Member', value: (l) => l.memberName },
      { header: 'Amount (ZAR)', value: (l) => l.amount },
      { header: 'Repayment months', value: (l) => l.repaymentMonths },
      { header: 'Status', value: (l) => l.status },
      { header: 'AI score', value: (l) => l.aiScore },
      { header: 'Threshold', value: (l) => l.threshold },
      { header: 'Model recommendation', value: (l) => l.recommendation },
      { header: 'Top factors', value: (l) => (l.reasons || []).slice(0, 3).map((r) => featureLabel(r.feature)).join('; ') },
      { header: 'Overridden', value: (l) => (l.overridden ? 'Yes' : 'No') },
      { header: 'Override category', value: (l) => l.overrideCategory || '' },
      { header: 'Override reason', value: (l) => l.overrideReason || '' },
      { header: 'Requested', value: (l) => l.requestedAt },
      { header: 'Resolved', value: (l) => l.resolvedAt || '' },
      { header: 'Disbursement tx hash', value: (l) => l.txHash || '' },
    ],
  },
  {
    id: 'payouts',
    title: 'Payout register',
    description: 'Every payout with recipient, amount and blockchain transaction.',
    available: FEATURES.payouts,
    requires: 'GET /groups/{groupId}/payouts',
    load: ({ groupId }) => getGroupPayouts(groupId),
    columns: [
      { header: 'Member', value: (p) => p.memberName },
      { header: 'Amount (ZAR)', value: (p) => p.amount },
      { header: 'Date', value: (p) => p.createdAt },
      { header: 'Tx hash', value: (p) => p.txHash || '' },
    ],
  },
  {
    id: 'contributions',
    title: 'Group contribution ledger',
    description: "All members' contributions and arrears for a period.",
    available: false,
    requires: 'GET /groups/{groupId}/contributions (admin)',
  },
]
