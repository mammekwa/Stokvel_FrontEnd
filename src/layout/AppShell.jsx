import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/loans', label: 'Loans' },
  { to: '/group', label: 'Group', adminOnly: true },
  { to: '/profile', label: 'Profile' },
]

export default function AppShell() {
  const { role, logout } = useAuth()

  const navItems = links.filter((item) => !item.adminOnly || role === 'administrator')

  return (
    <div className="md:flex md:min-h-screen">
      <aside className="hidden w-64 bg-brand-navy p-4 text-white md:block">
        <h1 className="mb-4 text-xl font-bold">StokvelChain</h1>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink className={({ isActive }) => `block rounded-lg px-3 py-3 ${isActive ? 'bg-brand-gold text-brand-navy' : 'text-white'}`} key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="mt-6 min-h-11 rounded-lg border border-white px-4 py-2" onClick={logout} type="button">
          Logout
        </button>
      </aside>

      <main className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-24 md:pb-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex bg-brand-navy p-2 md:hidden">
        {navItems.map((item) => (
          <NavLink className={({ isActive }) => `min-h-11 flex-1 rounded-lg px-2 py-3 text-center text-sm ${isActive ? 'bg-brand-gold text-brand-navy' : 'text-white'}`} key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
