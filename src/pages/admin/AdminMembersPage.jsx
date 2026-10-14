import { useState } from 'react'
import {
  approveMember,
  getActiveMembers,
  getInviteLink,
  getPendingMembers,
  regenerateInviteCode,
  rejectMember,
  sendEmailInvitation,
} from '../../api/groups'
import { Button, Card, EmptyState, ErrorBanner, Input, LoadingState, Notice, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { useGroup } from '../../context/GroupContext'
import { useAsync } from '../../hooks/useAsync'
import { formatDate } from '../../utils/format'

// Build the link from this app's own address so it works on any host,
// whatever app.frontend-url is set to on the backend.
const joinUrl = (inviteCode) => `${window.location.origin}/join/${encodeURIComponent(inviteCode)}`

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this:', text)
    }
  }
  return (
    <Button onClick={copy} variant="secondary">
      {copied ? 'Copied!' : label}
    </Button>
  )
}

function InviteCard({ groupId }) {
  const invite = useAsync(() => getInviteLink(groupId), [groupId])
  const [regenerating, setRegenerating] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const [error, setError] = useState(null)

  const regenerate = async () => {
    if (!window.confirm('Create a new invite code? The current link will stop working immediately.')) return
    setRegenerating(true)
    setError(null)
    try {
      invite.setData(await regenerateInviteCode(groupId))
    } catch (err) {
      setError(err)
    } finally {
      setRegenerating(false)
    }
  }

  const sendInvite = async (event) => {
    event.preventDefault()
    setSending(true)
    setError(null)
    setSent(null)
    try {
      const response = await sendEmailInvitation(groupId, email.trim())
      setSent(response)
      setEmail('')
    } catch (err) {
      setError(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card subtitle="Share the link, or invite someone by email. Email invites from you are approved automatically." title="Invite members">
      <div className="space-y-4">
        <ErrorBanner error={error || invite.error} />
        {invite.loading ? (
          <LoadingState />
        ) : invite.data ? (
          <div className="rounded-lg bg-brand-bg p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Invite code</p>
            <p className="font-mono text-2xl font-bold tracking-widest text-brand-navy">{invite.data.inviteCode}</p>
            <p className="mt-1 break-all text-xs text-slate-500">{joinUrl(invite.data.inviteCode)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton label="Copy link" text={joinUrl(invite.data.inviteCode)} />
              <CopyButton label="Copy code" text={invite.data.inviteCode} />
              <Button disabled={regenerating} onClick={regenerate} variant="ghost">
                {regenerating ? <Spinner /> : null} New code
              </Button>
            </div>
          </div>
        ) : null}

        <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={sendInvite}>
          <div className="flex-1">
            <Input label="Invite by email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />
          </div>
          <Button disabled={sending} type="submit">
            {sending ? <Spinner /> : null} Send invite
          </Button>
        </form>
        {sent ? (
          <Notice tone="success">
            Invitation sent to {sent.email}. It expires on {formatDate(sent.expiresAt)}.
          </Notice>
        ) : null}
      </div>
    </Card>
  )
}

export default function AdminMembersPage() {
  const { groupId, activeGroup, refresh } = useGroup()
  const pending = useAsync(() => getPendingMembers(groupId), [groupId], { initialData: [] })
  const active = useAsync(() => getActiveMembers(groupId), [groupId], { initialData: [] })
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  const decide = async (member, approve) => {
    if (!approve && !window.confirm(`Decline ${member.fullName}'s request to join?`)) return
    setBusyId(member.memberId)
    setError(null)
    try {
      await (approve ? approveMember(groupId, member.memberId) : rejectMember(groupId, member.memberId))
      await Promise.all([pending.reload(), active.reload()])
      if (approve) refresh()
    } catch (err) {
      setError(err)
    } finally {
      setBusyId(null)
    }
  }

  const pendingItems = pending.data || []
  const activeItems = active.data || []

  return (
    <div className="space-y-5">
      <PageHeader description={`Manage who belongs to ${activeGroup.groupName}.`} title="Members" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card subtitle="Approving a member activates them, creates their wallet and adds them to the payout rotation." title={`Join requests (${pendingItems.length})`}>
          <ErrorBanner className="mb-3" error={error || pending.error} />
          {pending.loading && !pendingItems.length ? (
            <LoadingState />
          ) : pendingItems.length ? (
            <ul className="divide-y divide-slate-100">
              {pendingItems.map((member) => (
                <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={member.memberId}>
                  <div>
                    <p className="font-semibold text-brand-navy">{member.fullName}</p>
                    <p className="text-xs text-slate-500">Requested {formatDate(member.joinedAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button disabled={busyId === member.memberId} onClick={() => decide(member, true)}>
                      {busyId === member.memberId ? <Spinner /> : null} Approve
                    </Button>
                    <Button disabled={busyId === member.memberId} onClick={() => decide(member, false)} variant="secondary">
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No pending requests">New join requests will appear here.</EmptyState>
          )}
        </Card>

        <InviteCard groupId={groupId} />
      </div>

      <Card subtitle="Ordered by payout position." title={`Active members (${activeItems.length})`}>
        <ErrorBanner error={active.error} />
        {active.loading && !activeItems.length ? (
          <LoadingState />
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 sm:px-2">Payout #</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Joined</th>
                  <th className="px-2 py-2">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeItems.map((member) => (
                  <tr key={member.memberId}>
                    <td className="px-4 py-3 font-semibold text-brand-navy sm:px-2">{member.payoutPosition ?? '—'}</td>
                    <td className="px-2 py-3">{member.fullName}</td>
                    <td className="px-2 py-3 text-slate-600">{formatDate(member.joinedAt)}</td>
                    <td className="px-2 py-3">{member.isAdmin ? <StatusBadge label="Admin" status="ADMIN" /> : <StatusBadge status="ACTIVE" label="Member" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
