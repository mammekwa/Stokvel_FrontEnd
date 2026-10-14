import { useState } from 'react'
import { getActiveMembers } from '../../api/groups'
import { getGroupLoans } from '../../api/loans'
import { Button, Card, ErrorBanner, LoadingState, PageHeader, Spinner, Stat, StatusBadge } from '../../components/ui'
import { useGroup } from '../../context/GroupContext'
import { useAsync } from '../../hooks/useAsync'
import { REPORTS } from '../../reports/registry'
import { downloadFile, slugify, toCsv } from '../../utils/csv'
import { formatCurrency, formatDateTime, formatPercent, humanize } from '../../utils/format'

const today = () => new Date().toISOString().slice(0, 10)

function ReportCard({ report, groupId, groupName }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastCount, setLastCount] = useState(null)

  const exportCsv = async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await report.load({ groupId })
      downloadFile(`${slugify(groupName)}-${report.id}-${today()}.csv`, toCsv(rows, report.columns))
      setLastCount(rows.length)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      actions={report.available ? null : <StatusBadge label="Coming soon" status="LEFT" />}
      subtitle={report.description}
      title={report.title}
    >
      <ErrorBanner className="mb-3" error={error} />
      {report.available ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={loading} onClick={exportCsv} variant="secondary">
            {loading ? <Spinner /> : null} Export CSV
          </Button>
          {lastCount !== null ? <span className="text-xs text-slate-500">{lastCount} rows exported</span> : null}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Needs backend endpoint: {report.requires}</p>
      )}
    </Card>
  )
}

// Printable one-page summary (browser "Save as PDF").
function GroupSummary({ group, groupId }) {
  const data = useAsync(
    async () => {
      const [members, loans] = await Promise.all([getActiveMembers(groupId), getGroupLoans(groupId)])
      return { members, loans }
    },
    [groupId],
  )

  if (data.loading) return <LoadingState label="Building summary…" />
  if (data.error) return <ErrorBanner error={data.error} />

  const { members, loans } = data.data
  const decided = loans.filter((l) => ['APPROVED', 'APPROVED_PENDING_DISBURSEMENT', 'REJECTED', 'REPAID', 'DEFAULTED'].includes(l.status))
  const approved = loans.filter((l) => ['APPROVED', 'APPROVED_PENDING_DISBURSEMENT', 'REPAID'].includes(l.status))
  const overridden = loans.filter((l) => l.overridden)
  const scored = loans.filter((l) => l.aiScore != null)
  const avgScore = scored.length ? scored.reduce((s, l) => s + Number(l.aiScore), 0) / scored.length : null
  const byStatus = loans.reduce((acc, l) => ({ ...acc, [l.status]: (acc[l.status] || 0) + 1 }), {})

  return (
    <div className="space-y-4" id="group-summary">
      <div>
        <h2 className="text-xl font-bold text-brand-navy">{group.groupName} — group summary</h2>
        <p className="text-sm text-slate-500">Generated {formatDateTime(new Date())}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Active members" value={members.length} />
        <Stat hint={humanize(group.contributionFrequency)} label="Contribution" value={formatCurrency(group.contributionAmount)} />
        <Stat label="Loans approved" value={formatCurrency(approved.reduce((s, l) => s + Number(l.amount), 0))} hint={`${approved.length} loan${approved.length === 1 ? "" : "s"}`} />
        <Stat label="Approval rate" value={decided.length ? formatPercent(approved.length / decided.length) : '—'} hint={`${decided.length} decided`} />
        <Stat label="Average AI score" value={avgScore != null ? avgScore.toFixed(2) : '—'} />
        <Stat label="Model overrides" value={overridden.length} hint={decided.length ? `${formatPercent(overridden.length / decided.length)} of decisions` : undefined} />
        <Stat label="Pending applications" value={byStatus.PENDING || 0} />
        <Stat label="Awaiting disbursement" value={byStatus.APPROVED_PENDING_DISBURSEMENT || 0} />
      </div>
      {overridden.length ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-brand-navy">Overrides of the credit model</h3>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-1.5">Member</th>
                <th className="py-1.5">Amount</th>
                <th className="py-1.5">Model</th>
                <th className="py-1.5">Category</th>
                <th className="py-1.5">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overridden.map((l) => (
                <tr key={l.loanId}>
                  <td className="py-2">{l.memberName}</td>
                  <td className="py-2">{formatCurrency(l.amount)}</td>
                  <td className="py-2">{humanize(l.recommendation)}</td>
                  <td className="py-2">{humanize(l.overrideCategory)}</td>
                  <td className="py-2">{l.overrideReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

export default function AdminReportsPage() {
  const { activeGroup, groupId } = useGroup()
  const [showSummary, setShowSummary] = useState(false)

  return (
    <div className="space-y-5">
      <PageHeader
        actions={
          <>
            <Button onClick={() => setShowSummary((v) => !v)} variant="secondary">
              {showSummary ? 'Hide summary' : 'Group summary'}
            </Button>
            {showSummary ? <Button onClick={() => window.print()}>Print / save as PDF</Button> : null}
          </>
        }
        description="Export your group's records for meetings, audits or your own spreadsheets."
        title="Reports"
      />

      {showSummary ? (
        <Card className="print-area">
          <GroupSummary group={activeGroup} groupId={groupId} />
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 print:hidden">
        {REPORTS.map((report) => (
          <ReportCard groupId={groupId} groupName={activeGroup.groupName} key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}
