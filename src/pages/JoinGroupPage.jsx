import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { joinByInviteCode, previewInvite } from '../api/groups'
import { Button, ErrorBanner, LinkButton, LoadingState, Notice, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { useAsync } from '../hooks/useAsync'
import AuthLayout from '../layout/AuthLayout'
import { formatCurrency, humanize } from '../utils/format'

// Public page behind invite links: /join/:inviteCode
export default function JoinGroupPage() {
  const { inviteCode } = useParams()
  const { isAuthenticated } = useAuth()
  const { refresh } = useGroup()
  const navigate = useNavigate()

  const preview = useAsync(() => previewInvite(inviteCode), [inviteCode])
  const [joining, setJoining] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const join = async () => {
    setJoining(true)
    setError(null)
    try {
      const response = await joinByInviteCode(inviteCode)
      setResult(response)
      await refresh()
    } catch (err) {
      setError(err)
    } finally {
      setJoining(false)
    }
  }

  const group = preview.data
  const returnState = { from: `/join/${inviteCode}` }

  return (
    <AuthLayout subtitle="You've been invited to join a stokvel." title={group ? group.groupName : 'Join a stokvel'}>
      {preview.loading ? <LoadingState label="Looking up this invite…" /> : null}
      <ErrorBanner error={preview.error} />

      {group ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-brand-bg p-4 text-sm">
            <div>
              <dt className="text-slate-500">Contribution</dt>
              <dd className="font-semibold text-brand-navy">
                {formatCurrency(group.contributionAmount)} {humanize(group.contributionFrequency).toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Payout cycle</dt>
              <dd className="font-semibold text-brand-navy">{humanize(group.payoutCycle)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Active members</dt>
              <dd className="font-semibold text-brand-navy">{group.activeMemberCount}</dd>
            </div>
          </dl>

          <ErrorBanner error={error} />

          {result ? (
            <>
              <Notice title={result.status === 'ACTIVE' ? 'You have joined!' : 'Request sent'} tone="success">
                {result.message}
              </Notice>
              <Button block onClick={() => navigate('/')}>
                Go to dashboard
              </Button>
            </>
          ) : isAuthenticated ? (
            <Button block disabled={joining} onClick={join}>
              {joining ? (
                <>
                  <Spinner /> Sending request…
                </>
              ) : (
                'Request to join'
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Log in or create an account to request to join.</p>
              <LinkButton block state={returnState} to="/login">
                Log in
              </LinkButton>
              <LinkButton block state={returnState} to="/register" variant="secondary">
                Create an account
              </LinkButton>
            </div>
          )}
        </div>
      ) : null}
    </AuthLayout>
  )
}
