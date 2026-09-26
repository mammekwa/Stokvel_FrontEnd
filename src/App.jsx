import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell'
import { useAuth } from './context/AuthContext'
import GroupPage from './pages/GroupPage'
import HomePage from './pages/HomePage'
import LoansPage from './pages/LoansPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { role } = useAuth()
  return role === 'administrator' ? children : <Navigate to="/" replace />
}

export default function App() {
  const { user, role } = useAuth()
  const memberId = user?.id || 'member-1'

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage memberId={memberId} />} />
        <Route
          path="loans"
          element={
            <LoansPage memberId={memberId} role={role} />
          }
        />
        <Route
          path="group"
          element={
            <AdminRoute>
              <GroupPage />
            </AdminRoute>
          }
        />
        <Route path="profile" element={<ProfilePage user={user} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
