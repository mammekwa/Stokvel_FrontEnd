import { useMemo, useState } from 'react'
import { ContributionStatus, LogContributionForm } from '../components/contributions'
import TxHashLink from '../components/TxHashLink'
import { Button, Card, EmptyState, ErrorBanner, LoadingState, Modal, PageHeader, Select, Stat } from '../components/ui'
import { useGroup } from '../context/GroupContext'
import { useMemberStanding } from '../hooks/useMemberStanding'
import { downloadFile, slugify, toCsv } from '../utils/csv'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format'

const filterOptions = [
  { value: 'all', label: 'All contributions' },
  { value: 'confirmed', label: 'Confirmed on-chain' },
  { value: 'unconfirmed', label: 'Awaiting confirmation' },
]

export default function ContributionsPage() {
  const { activeGroup, groupId, memberId } = useGroup()
  const standing = useMemberStanding(groupId, memberId)
  const { contributions, items } = standing
  const [filter, setFilter] = useState('all')
  const [logOpen, setLogOpen] = useState(false)

  const visible = useMemo(
    () =>
      items.filter((c) => (filter === 'all' ? true : filter === 'confirmed' ? c.blockchainConfirmed : !c.blockchainConfirmed)),
    [items, filter],
  )

  const exportStatement = () => {
    const csv = toCsv(items, [
      { header: 'Date', value: (c) => c.contributionDate },
      { header: 'Recorded at', value: (c) => c.createdAt },
      { header: 'Amount (ZAR)', value: (c) => c.amount },
      { header: 'Blockchain status', value: (c) => (c.blockchainConfirmed ? 'Confirmed' : 'Unconfirmed') },
      { header: 'Transaction hash', value: (c) => c.txHash || '' },
    ])
    downloadFile(`${slugify(activeGroup.groupName)}-my-contributions.csv`, csv)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        actions={
          <>
            <Button disabled={!items.length} onClick={exportStatement} variant="secondary">
              Download statement (CSV)
            </Button>
            <Button onClick={() => setLogOpen(true)}>Log contribution</Button>
          </>
        }
        description="Every contribution is saved first and then written to the Sepolia blockchain."
        title="My contributions"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Total contributed" value={formatCurrency(standing.totalContributed)} />
        <Stat label="Confirmed on-chain" value={standing.confirmedCount} />
        <Stat label="Awaiting confirmation" value={items.length - standing.confirmedCount} />
      </div>

      <Card actions={<div className="w-56"><Select aria-label="Filter" onChange={(event) => setFilter(event.target.value)} options={filterOptions} value={filter} /></div>} title="History">
        <ErrorBanner error={contributions.error} />
        {contributions.loading && !items.length ? (
          <LoadingState />
        ) : visible.length ? (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 sm:px-2">Date</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((c) => (
                  <tr key={c.contributionId}>
                    <td className="px-4 py-3 sm:px-2" title={formatDateTime(c.createdAt)}>
                      {formatDate(c.createdAt || c.contributionDate)}
                    </td>
                    <td className="px-2 py-3 font-semibold text-brand-navy">{formatCurrency(c.amount)}</td>
                    <td className="px-2 py-3">
                      <ContributionStatus contribution={c} />
                    </td>
                    <td className="px-2 py-3">
                      <TxHashLink hash={c.txHash} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={items.length ? 'Nothing matches this filter' : 'No contributions yet'} />
        )}
      </Card>

      <Modal onClose={() => setLogOpen(false)} open={logOpen} title="Log a contribution">
        <LogContributionForm defaultAmount={activeGroup.contributionAmount} groupId={groupId} onLogged={contributions.reload} />
      </Modal>
    </div>
  )
}
