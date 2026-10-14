import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMyGroups } from '../api/groups'
import { getMyMemberships } from '../api/members'
import { useAuth } from './AuthContext'

const GroupContext = createContext(null)
const ACTIVE_GROUP_KEY = 'stokvelchain_active_group'

const readActiveGroupId = () => {
  try {
    return localStorage.getItem(ACTIVE_GROUP_KEY)
  } catch {
    return null
  }
}

const writeActiveGroupId = (groupId) => {
  try {
    if (groupId) localStorage.setItem(ACTIVE_GROUP_KEY, groupId)
    else localStorage.removeItem(ACTIVE_GROUP_KEY)
  } catch {
    // ignore
  }
}

/**
 * Works out which stokvel group the logged-in user is acting in.
 * - /groups/mine   -> ACTIVE groups, with isAdmin for this user
 * - /members/me    -> every membership (incl. PENDING), with memberId
 * Admin rights are per group (isAdmin), not a user-level role.
 */
export function GroupProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.userId ?? null

  const [groups, setGroups] = useState([])
  const [memberships, setMemberships] = useState([])
  const [activeGroupId, setActiveGroupId] = useState(readActiveGroupId)
  const [fetching, setFetching] = useState(false)
  const [loadedFor, setLoadedFor] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) {
      setGroups([])
      setMemberships([])
      setLoadedFor(null)
      return
    }
    setFetching(true)
    setError(null)
    try {
      const [groupList, membershipList] = await Promise.all([getMyGroups(), getMyMemberships()])
      setGroups(groupList)
      setMemberships(membershipList)
    } catch (err) {
      setError(err)
    } finally {
      setLoadedFor(userId)
      setFetching(false)
    }
  }, [userId])

  // Also "loading" in the render straight after login, before the effect has fired,
  // so the app never flashes the "create a group" screen.
  const loading = fetching || (Boolean(userId) && loadedFor !== userId)

  // Runs once per login (userId is a plain string, so this cannot loop).
  useEffect(() => {
    load()
  }, [load])

  const activeGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        memberId: memberships.find((m) => m.groupId === group.groupId)?.memberId ?? null,
      })),
    [groups, memberships],
  )

  const activeGroup = useMemo(
    () => activeGroups.find((g) => g.groupId === activeGroupId) || activeGroups[0] || null,
    [activeGroups, activeGroupId],
  )

  const pendingMemberships = useMemo(() => memberships.filter((m) => m.status === 'PENDING'), [memberships])

  const selectGroup = useCallback((groupId) => {
    setActiveGroupId(groupId)
    writeActiveGroupId(groupId)
  }, [])

  const value = useMemo(
    () => ({
      loading,
      error,
      groups: activeGroups,
      memberships,
      pendingMemberships,
      activeGroup,
      groupId: activeGroup?.groupId ?? null,
      memberId: activeGroup?.memberId ?? null,
      isAdmin: Boolean(activeGroup?.isAdmin),
      selectGroup,
      refresh: load,
    }),
    [loading, error, activeGroups, memberships, pendingMemberships, activeGroup, selectGroup, load],
  )

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

export const useGroup = () => {
  const context = useContext(GroupContext)
  if (!context) throw new Error('useGroup must be used within GroupProvider')
  return context
}
