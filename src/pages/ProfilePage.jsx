import { useEffect, useState } from 'react'
import { getMemberProfile } from '../api/members'
import Card from '../components/Card'
import RestrictionStatusPage from './RestrictionStatusPage'

export default function ProfilePage({ user }) {
  const [memberProfile, setMemberProfile] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    getMemberProfile(user.id).then(setMemberProfile)
  }, [user?.id])

  return (
    <div className="space-y-4">
      <Card title="My profile">
        <p className="text-sm"><span className="font-semibold">Name:</span> {user?.fullName || 'Member'}</p>
        <p className="text-sm"><span className="font-semibold">Email:</span> {user?.email || '-'}</p>
        <p className="text-sm"><span className="font-semibold">Role:</span> {user?.role || 'member'}</p>
      </Card>
      <RestrictionStatusPage memberProfile={memberProfile} />
    </div>
  )
}
