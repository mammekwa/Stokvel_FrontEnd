import { useState } from 'react'
import { getNotifications, markAsRead } from '../api/notifications'
import { Button, Card, EmptyState, ErrorBanner, LinkButton, LoadingState, PageHeader, StatusBadge } from '../components/ui'
import { useGroup } from '../context/GroupContext'
import { useAsync } from '../hooks/useAsync'
import { formatDateTime } from '../utils/format'

const TYPE_LABELS = {
  LOAN_DECLINED_BY_MODEL: { label: 'Flagged by credit model', status: 'DECLINE' },
  LOAN_APPROVED: { label: 'Loan approved', status: 'APPROVED' },
  LOAN_REJECTED: { label: 'Loan declined', status: 'REJECTED' },
}

export default function NotificationsPage() {
  const { isAdmin } = useGroup()
  const notifications = useAsync(getNotifications, [], { initialData: [] })
  const [error, setError] = useState(null)

  const items = [...(notifications.data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const unread = items.filter((n) => !n.read)

  const markOne = async (id) => {
    setError(null)
    try {
      const updated = await markAsRead(id)
      notifications.setData((prev) => prev.map((n) => (n.notificationId === id ? { ...n, ...updated, read: true } : n)))
    } catch (err) {
      setError(err)
    }
  }

  const markAll = async () => {
    setError(null)
    try {
      await Promise.all(unread.map((n) => markAsRead(n.notificationId)))
      notifications.setData((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        actions={
          <Button disabled={!unread.length} onClick={markAll} variant="secondary">
            Mark all as read
          </Button>
        }
        description={unread.length ? `${unread.length} unread` : 'You are all caught up.'}
        title="Notifications"
      />

      <Card>
        <ErrorBanner className="mb-3" error={error || notifications.error} />
        {notifications.loading && !items.length ? (
          <LoadingState />
        ) : items.length ? (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const meta = TYPE_LABELS[n.type] || { label: n.type, status: 'PENDING' }
              return (
                <li className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between ${n.read ? 'opacity-70' : ''}`} key={n.notificationId}>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read ? <span className="h-2 w-2 rounded-full bg-brand-gold" /> : null}
                      <p className="font-semibold text-brand-navy">{n.title}</p>
                      <StatusBadge label={meta.label} status={meta.status} />
                    </div>
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {isAdmin && n.type === 'LOAN_DECLINED_BY_MODEL' ? (
                      <LinkButton to="/admin/loans" variant="secondary">
                        Review
                      </LinkButton>
                    ) : null}
                    {!n.read ? (
                      <Button onClick={() => markOne(n.notificationId)} variant="ghost">
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState title="No notifications">Loan decisions and credit-model alerts will appear here.</EmptyState>
        )}
      </Card>
    </div>
  )
}
