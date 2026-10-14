import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { getUnreadCount } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'

const memberLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/contributions', label: 'Contributions' },
  { to: '/loans', label: 'Loans' },
  { to: '/notifications', label: 'Notifications', badge: 'unread' },
  { to: '/profile', label: 'Profile' },
]

const adminLinks = [
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/loans', label: 'Loan reviews' },
  { to: '/admin/payouts', label: 'Payouts' },
  { to: '/admin/reports', label: 'Reports' },
]

function NavItem({ item, unread, onNavigate }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium transition ${
          isActive ? 'bg-brand-gold text-brand-navy' : 'text-white/85 hover:bg-white/10 hover:text-white'
        }`
      }
      end={item.end}
      onClick={onNavigate}
      to={item.to}
    >
      {item.label}
      {item.badge === 'unread' && unread > 0 ? (
        <span className="rounded-full bg-status-rejected px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
      ) : null}
    </NavLink>
  )
}

function GroupSwitcher() {
  const { groups, activeGroup, selectGroup } = useGroup()
  if (!activeGroup) return null

  if (groups.length === 1) {
    return (
      <div className="rounded-lg bg-white/10 px-3 py-2">
        <p className="text-xs uppercase tracking-wide text-white/60">Group</p>
        <p className="truncate text-sm font-semibold text-white">{activeGroup.groupName}</p>
      </div>
    )
  }

  return (
    <label className="block rounded-lg bg-white/10 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-white/60">Group</span>
      <select
        className="mt-1 w-full rounded bg-brand-navy px-1 py-1 text-sm font-semibold text-white outline-none ring-brand-gold focus:ring-2"
        onChange={(event) => selectGroup(event.target.value)}
        value={activeGroup.groupId}
      >
        {groups.map((group) => (
          <option key={group.groupId} value={group.groupId}>
            {group.groupName}
          </option>
        ))}
      </select>
    </label>
  )
}

function Sidebar({ unread, onNavigate }) {
  const { user, logout } = useAuth()
  const { activeGroup, isAdmin } = useGroup()

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <Link className="flex items-center gap-2 px-1" onClick={onNavigate} to="/">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gold text-sm font-black text-brand-navy">S</span>
        <span className="text-lg font-bold text-white">StokvelChain</span>
      </Link>

      <GroupSwitcher />

      <nav className="space-y-1">
        {memberLinks.map((item) => (
          <NavItem item={item} key={item.to} onNavigate={onNavigate} unread={unread} />
        ))}
      </nav>

      {isAdmin ? (
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/50">Group admin</p>
          {adminLinks.map((item) => (
            <NavItem item={item} key={item.to} onNavigate={onNavigate} unread={unread} />
          ))}
        </nav>
      ) : null}

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Link className="block rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10" onClick={onNavigate} to="/groups/new">
          + Create or join a group
        </Link>
        <p className="truncate px-3 text-xs text-white/60" title={user?.email}>
          {user?.email}
          {activeGroup && isAdmin ? ' · admin' : ''}
        </p>
        <button className="min-h-11 w-full rounded-lg border border-white/30 px-3 text-sm font-medium text-white hover:bg-white/10" onClick={logout} type="button">
          Log out
        </button>
      </div>
    </div>
  )
}

export default function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const userId = user?.userId

  // Refresh the unread badge on navigation and every minute.
  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    const refresh = () =>
      getUnreadCount()
        .then((count) => !cancelled && setUnread(count))
        .catch(() => {})
    refresh()
    const timer = setInterval(refresh, 60000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [userId, location.pathname])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-brand-navy md:block print:hidden">
        <Sidebar unread={unread} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-navy px-4 py-3 md:hidden print:hidden">
        <Link className="flex items-center gap-2" to="/">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-gold text-xs font-black text-brand-navy">S</span>
          <span className="font-bold text-white">StokvelChain</span>
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label="Open menu"
          className="relative min-h-11 min-w-11 rounded-lg text-white hover:bg-white/10"
          onClick={() => setMenuOpen(true)}
          type="button"
        >
          ☰
          {unread > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-status-rejected" /> : null}
        </button>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMenu} role="presentation">
          <div className="h-full w-72 max-w-[85vw] overflow-y-auto bg-brand-navy" onClick={(event) => event.stopPropagation()}>
            <Sidebar onNavigate={closeMenu} unread={unread} />
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
