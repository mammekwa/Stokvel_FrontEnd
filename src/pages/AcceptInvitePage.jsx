import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptInvitation } from '../api/groups'
import { Button, ErrorBanner, Notice, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import AuthLayout from '../layout/AuthLayout'

// Email invitation link: /invite/:token (requires login with the invited email)
export default function AcceptInvitePage() {
  const { token } = useParams()
  const { user } = useAuth()
  const { refresh, selectGroup } = useGroup()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const accept = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await acceptInvitation(token)
      setResult(response)
      await refresh()
      if (response.status === 'ACTIVE') selectGroup(response.groupId)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={`Signed in as ${user?.email}. The invitation must have been sent to this email.`} title="Accept invitation">
      <div className="space-y-4">
        <ErrorBanner error={error} />
        {result ? (
          <>
            <Notice title={result.groupName} tone="success">
              {result.message}
            </Notice>
            <Button block onClick={() => navigate('/')}>
              Go to dashboard
            </Button>
          </>
        ) : (
          <Button block disabled={loading} onClick={accept}>
            {loading ? (
              <>
                <Spinner /> Accepting…
              </>
            ) : (
              'Accept invitation'
            )}
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
