import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Button, ErrorBanner, LoadingState } from './components/ui'
import { useAuth } from './context/AuthContext'
import { useGroup } from './context/GroupContext'
import AppShell from './layout/AppShell'
import AcceptInvitePage from './pages/AcceptInvitePage'
import AdminLoansPage from './pages/admin/AdminLoansPage'
import AdminMembersPage from './pages/admin/AdminMembersPage'
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import ContributionsPage from './pages/ContributionsPage'
import DashboardPage from './pages/DashboardPage'
import GroupSetupPage from './pages/GroupSetupPage'
import JoinGroupPage from './pages/JoinGroupPage'
import LoansPage from './pages/LoansPage'
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

// Logged-out users go to /login and come back here afterwards.
function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate replace state={{ from: location.pathname }} to="/login" />
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Navigate replace to={location.state?.from || '/'} /> : children
}

// Pages that act on a group need an ACTIVE membership; otherwise show setup.
function RequireGroup() {
  const { loading, error, activeGroup, refresh } = useGroup()

  if (loading && !activeGroup) return <LoadingState label="Loading your stokvel…" />
  if (error && !activeGroup) {
    return (
      <div className="space-y-3">
        <ErrorBanner error={error} />
        <Button onClick={refresh} variant="secondary">
          Try again
        </Button>
      </div>
    )
  }
  if (!activeGroup) return <GroupSetupPage />
  return <Outlet />
}

// Admin rights are per group: CreateGroupResponse.isAdmin.
function RequireAdmin() {
  const { isAdmin } = useGroup()
  return isAdmin ? <Outlet /> : <Navigate replace to="/" />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly><LoginPage /></PublicOnly>} path="/login" />
      <Route element={<PublicOnly><RegisterPage /></PublicOnly>} path="/register" />
      <Route element={<JoinGroupPage />} path="/join/:inviteCode" />

      <Route element={<RequireAuth />}>
        <Route element={<AcceptInvitePage />} path="/invite/:token" />

        <Route element={<AppShell />}>
          <Route element={<GroupSetupPage />} path="/groups/new" />
          <Route element={<NotificationsPage />} path="/notifications" />

          <Route element={<RequireGroup />}>
            <Route element={<DashboardPage />} index />
            <Route element={<ContributionsPage />} path="/contributions" />
            <Route element={<LoansPage />} path="/loans" />
            <Route element={<ProfilePage />} path="/profile" />

            <Route element={<RequireAdmin />} path="/admin">
              <Route element={<Navigate replace to="/admin/members" />} index />
              <Route element={<AdminMembersPage />} path="members" />
              <Route element={<AdminLoansPage />} path="loans" />
              <Route element={<AdminPayoutsPage />} path="payouts" />
              <Route element={<AdminReportsPage />} path="reports" />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
